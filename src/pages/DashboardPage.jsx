import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getMealPlan, getMealPlanWeeks, getRecipes, saveMealPlan } from '../lib/supabase'
import { getWeekKey } from '../lib/weeks'
import { IconClock, IconPlus } from '../components/icons'
import { FOOD_ICON_MAP, FoodDinner } from '../components/FoodIcons'
import './Dashboard.css'

const GRAD = 'linear-gradient(90deg, #E8732A, #FFC228, #A6C948, #58CC02)'

// ─── Protein keyword map — most-specific entries first ───────────────────────
const PROTEIN_MAP = [
  { name: 'Chicken thighs',  test: n => /chicken\s+thigh/i.test(n) },
  { name: 'Ground beef',     test: n => /ground\s+beef/i.test(n) },
  { name: 'Ground chicken',  test: n => /ground\s+chicken/i.test(n) },
  { name: 'Ground turkey',   test: n => /ground\s+turkey/i.test(n) },
  { name: 'Chicken breast',  test: n => /chicken\s+breast/i.test(n) },
  { name: 'Skirt steak',     test: n => /skirt\s+steak/i.test(n) },
  { name: 'Spare ribs',      test: n => /spare\s+rib|pork.*rib/i.test(n) },
  { name: 'Pork shoulder',   test: n => /pork\s+shoulder/i.test(n) },
  { name: 'Salmon',          test: n => /\bsalmon\b/i.test(n) },
  { name: 'Shrimp',          test: n => /\bshrimp\b/i.test(n) },
  { name: 'Tuna',            test: n => /\btuna\b/i.test(n) },
  { name: 'Sausage',         test: n => /\bsausage\b/i.test(n) },
  { name: 'Bacon',           test: n => /\bbacon\b/i.test(n) },
  { name: 'Chicken',         test: n => /\bchicken\b/i.test(n) },
  { name: 'Beef',            test: n => /\bbeef\b|\bsteak\b/i.test(n) },
  { name: 'Pork',            test: n => /\bpork\b|\bham\b/i.test(n) },
  { name: 'Turkey',          test: n => /\bturkey\b/i.test(n) },
  { name: 'Lamb',            test: n => /\blamb\b/i.test(n) },
]

const TIME_FILTERS = [
  { label: 'Last month', weeks: 4  },
  { label: '3 months',   weeks: 13 },
  { label: '6 months',   weeks: 26 },
  { label: 'All time',   weeks: null },
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatHeaderDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toUpperCase()
}

function planRecipeIds(plan) {
  if (!plan) return []
  const ids = []
  plan.dinners?.forEach(d => {
    if (d.adultRecipeId) ids.push(d.adultRecipeId)
    if (d.kidsRecipeId)  ids.push(d.kidsRecipeId)
  })
  plan.breakfasts?.forEach(b => { if (b.recipeId) ids.push(b.recipeId) })
  plan.lunches?.forEach(l => {
    if (l.recipeId)     ids.push(l.recipeId)
    if (l.kidsRecipeId) ids.push(l.kidsRecipeId)
  })
  plan.snacks?.forEach(s => { if (s.recipeId) ids.push(s.recipeId) })
  return ids
}

function daysWithMeals(plan) {
  if (!plan) return 0
  const days = new Set()
  let dayIdx = 0
  plan.dinners?.forEach(d => {
    const mult = d.multiplier ?? 1
    if (d.adultRecipeId) for (let i = 0; i < mult; i++) days.add(dayIdx + i)
    dayIdx += mult
  })
  plan.breakfasts?.forEach((b, i) => { if (b.recipeId) days.add(i) })
  plan.lunches?.forEach((l, i) => { if (l.recipeId || l.kidsRecipeId) days.add(i) })
  return days.size
}

function computeMostCooked(planHistory, recipeMap, filterWeeks) {
  const weeks = filterWeeks ? planHistory.slice(0, filterWeeks) : planHistory
  const counts = {}
  weeks.forEach(({ plan }) => {
    planRecipeIds(plan).forEach(id => {
      if (recipeMap[id]) counts[id] = (counts[id] || 0) + 1
    })
  })
  return Object.entries(counts)
    .map(([id, count]) => ({ recipe: recipeMap[id], count }))
    .filter(x => x.recipe)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

function computeTopProteins(planHistory, recipeMap, filterWeeks) {
  const weeks = filterWeeks ? planHistory.slice(0, filterWeeks) : planHistory
  const counts = {}
  weeks.forEach(({ plan }) => {
    const ids = new Set(planRecipeIds(plan))
    ids.forEach(id => {
      const recipe = recipeMap[id]
      if (!recipe?.ingredients) return
      const found = new Set()
      recipe.ingredients.forEach(ing => {
        const name = (ing.name || '').toLowerCase()
        for (const p of PROTEIN_MAP) {
          if (!found.has(p.name) && p.test(name)) {
            found.add(p.name)
            break
          }
        }
      })
      found.forEach(p => { counts[p] = (counts[p] || 0) + 1 })
    })
  })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7)
}

function computeStreak(planHistory) {
  const annotated = planHistory.map(w => ({
    ...w,
    days: daysWithMeals(w.plan),
    qualifies: daysWithMeals(w.plan) >= 3,
  }))

  let streak = 0
  for (const w of annotated) {
    if (!w.qualifies) break
    streak++
  }

  let best = 0, curr = 0
  for (const w of [...annotated].reverse()) {
    curr = w.qualifies ? curr + 1 : 0
    best = Math.max(best, curr)
  }

  const allTimeMeals = planHistory.reduce((total, { plan }) => {
    if (!plan) return total
    return total +
      (plan.dinners?.length   || 0) +
      (plan.breakfasts?.length || 0) +
      (plan.lunches?.length   || 0) +
      (plan.snacks?.length    || 0)
  }, 0)

  return {
    streak,
    best: Math.max(best, streak),
    allTimeMeals,
    history: annotated.slice(0, 8).reverse(),
  }
}

function computeWeeklyScore(plan, recipeMap) {
  const dinners  = plan?.dinners ?? []
  const allMeals = [
    ...(plan?.breakfasts ?? []),
    ...(plan?.lunches    ?? []),
    ...dinners,
    ...(plan?.snacks     ?? []),
  ]
  if (!allMeals.length) return null
  const categories = new Set(
    dinners.map(d => recipeMap[d.adultRecipeId]?.category).filter(Boolean)
  )
  const base    = Math.min(9, Math.max(5, Math.round(3 + (allMeals.length / 10) * 4 + (categories.size / 4) * 3)))
  const decimal = (allMeals.length + categories.size * 3) % 10
  return `${base}.${decimal}`
}

function getRecommendationTag(recipe, planHistory, currentWeekKey, mostCooked) {
  const cookTime   = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  const isFavourite = mostCooked.slice(0, 3).some(m => m.recipe.id === recipe.id)
  if (isFavourite) return { tag: 'Fan favourite', style: 'green' }

  const historical = planHistory.filter(w => w.week_key !== currentWeekKey)
  for (let i = 0; i < historical.length; i++) {
    if (planRecipeIds(historical[i].plan).includes(recipe.id)) {
      const weeks = i + 1
      return { tag: `Not made in ${weeks} week${weeks !== 1 ? 's' : ''}`, style: 'orange' }
    }
  }

  if (cookTime > 0 && cookTime <= 25) return { tag: 'Quick & easy', style: 'green' }
  if (cookTime > 0 && cookTime <= 40) return { tag: 'Under 40 min', style: 'blue' }
  return { tag: null, style: null }
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function TagChip({ tag, style }) {
  const styles = {
    orange: { background: '#FFF3EE', color: '#C05418', borderColor: '#FFD5C2' },
    green:  { background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' },
    blue:   { background: '#EEF2FF', color: '#3B4FBE', borderColor: '#C7D2FE' },
    gray:   { background: 'var(--hp-ink-50)', color: 'var(--hp-ink-600)', borderColor: 'var(--hp-ink-200)' },
  }
  return (
    <span className="dash-tag" style={styles[style] || styles.gray}>{tag}</span>
  )
}

function DashCard({ children }) {
  return <div className="dash-card">{children}</div>
}

function CardHead({ label, action, onAction, slot }) {
  return (
    <div className="dash-card-head">
      <span className="t-eyebrow" style={{ color: 'var(--hp-ink-500)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {slot}
        {action && (
          <button className="dash-card-action" onClick={onAction}>{action}</button>
        )}
      </div>
    </div>
  )
}

function BarRow({ name, count, maxCount, rank }) {
  const pct = maxCount > 0 ? Math.max(3, (count / maxCount) * 100) : 0
  return (
    <div>
      <div className="dash-bar-meta">
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {rank !== undefined && <span className="dash-bar-rank">#{rank}</span>}
          <span className="dash-bar-name">{name}</span>
        </span>
        <span className="dash-bar-count">{count}×</span>
      </div>
      <div className="dash-bar-track">
        <div className="dash-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function FilterChips({ filterIdx, setFilterIdx }) {
  return (
    <div className="dash-filter-row">
      {TIME_FILTERS.map((f, i) => (
        <button key={f.label}
          className={`dash-time-chip${filterIdx === i ? ' dash-time-chip--on' : ''}`}
          onClick={() => setFilterIdx(i)}>
          {f.label}
        </button>
      ))}
    </div>
  )
}

// ─── AISummary ────────────────────────────────────────────────────────────────

function AISummary({ plan, recipeMap, aiData }) {
  const score = computeWeeklyScore(plan, recipeMap)
  const dinners = plan?.dinners ?? []
  const allMeals = [
    ...(plan?.breakfasts ?? []),
    ...(plan?.lunches    ?? []),
    ...dinners,
    ...(plan?.snacks     ?? []),
  ]

  const summaryText = aiData?.summaryText || (
    allMeals.length === 0
      ? 'No meals planned yet this week. Head to the planner to start building your week — even a few dinners makes grocery shopping much easier.'
      : `${dinners.length} dinner${dinners.length !== 1 ? 's' : ''} planned this week. Add more meals for a fuller picture.`
  )
  const tags = aiData?.tags || []

  return (
    <div className="dash-ai-card">
      <div className="dash-ai-rating">
        <div className="dash-ai-score">{score ?? '—'}</div>
        <div className="dash-ai-score-sub">/ 10 this week</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <span style={{ fontSize: 13 }}>✦</span>
          <span className="t-eyebrow" style={{ color: 'var(--hp-ink-500)' }}>AI Weekly Summary</span>
        </div>
        <p style={{
          fontFamily: 'var(--hp-font-body)', fontSize: 14, lineHeight: 1.65,
          color: 'var(--hp-ink-700)', margin: '0 0 12px',
        }}>{summaryText}</p>
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.map((t, i) => (
              <TagChip key={i} tag={t.text} style={t.style || 'gray'} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MostCooked ───────────────────────────────────────────────────────────────

function MostCooked({ planHistory, recipeMap, navigate }) {
  const [filterIdx, setFilterIdx] = useState(3)

  const items = useMemo(() => {
    const f = TIME_FILTERS[filterIdx]
    return computeMostCooked(planHistory, recipeMap, f.weeks)
  }, [planHistory, recipeMap, filterIdx])

  const maxCount = items[0]?.count || 1

  return (
    <DashCard>
      <CardHead
        label="Most cooked meals"
        action="All recipes →"
        onAction={() => navigate('/recipes')}
      />
      <FilterChips filterIdx={filterIdx} setFilterIdx={setFilterIdx} />
      {items.length === 0 ? (
        <p className="dash-empty">No meal history yet for this period. Plan meals and they'll appear here.</p>
      ) : (
        <div className="dash-bar-list">
          {items.map(({ recipe, count }) => (
            <BarRow key={recipe.id} name={recipe.name} count={count} maxCount={maxCount} />
          ))}
        </div>
      )}
    </DashCard>
  )
}

// ─── RecommendedForYou ────────────────────────────────────────────────────────

function RecommendedForYou({ recipes, plan, planHistory, currentWeekKey, mostCooked, onAdd, addedIds }) {
  const plannedIds = useMemo(() => new Set(planRecipeIds(plan)), [plan])

  const candidates = useMemo(() => {
    return recipes
      .filter(r => !plannedIds.has(r.id))
      .slice(0, 4)
      .map(r => ({ recipe: r, ...getRecommendationTag(r, planHistory, currentWeekKey, mostCooked) }))
  }, [recipes, plannedIds, planHistory, currentWeekKey, mostCooked])

  if (candidates.length === 0) return null

  return (
    <DashCard>
      <CardHead label="Recommended for you" />
      <div>
        {candidates.map(({ recipe, tag, style }) => {
          const Food     = FOOD_ICON_MAP[recipe.category] ?? FoodDinner
          const cookTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
          const isAdded  = addedIds.has(recipe.id)
          return (
            <div key={recipe.id} className="dash-rec-row">
              <div className="dash-rec-icon"><Food size={28} /></div>
              <div className="dash-rec-info">
                <div className="dash-rec-name">{recipe.name}</div>
                <div className="dash-rec-meta">
                  {tag && <TagChip tag={tag} style={style} />}
                  {cookTime > 0 && (
                    <span className="dash-rec-time">
                      <IconClock size={11} /> {cookTime} min
                    </span>
                  )}
                </div>
              </div>
              <button
                className={`dash-rec-add${isAdded ? ' dash-rec-add--added' : ''}`}
                onClick={() => !isAdded && onAdd(recipe.id)}
                disabled={isAdded}
              >
                {isAdded ? '✓ Added' : <><IconPlus size={12} /> Add</>}
              </button>
            </div>
          )
        })}
      </div>
    </DashCard>
  )
}

// ─── TopProteins ──────────────────────────────────────────────────────────────

function TopProteins({ planHistory, recipeMap }) {
  const [filterIdx, setFilterIdx] = useState(3)

  const items = useMemo(() => {
    const f = TIME_FILTERS[filterIdx]
    return computeTopProteins(planHistory, recipeMap, f.weeks)
  }, [planHistory, recipeMap, filterIdx])

  const maxCount = items[0]?.count || 1

  return (
    <DashCard>
      <CardHead label="Top proteins" />
      <FilterChips filterIdx={filterIdx} setFilterIdx={setFilterIdx} />
      {items.length === 0 ? (
        <p className="dash-empty">Plan meals with proteins to see your top picks here.</p>
      ) : (
        <div className="dash-bar-list">
          {items.map(({ name, count }, i) => (
            <BarRow key={name} name={name} count={count} maxCount={maxCount} rank={i + 1} />
          ))}
        </div>
      )}
    </DashCard>
  )
}

// ─── PlanningStreak ───────────────────────────────────────────────────────────

function PlanningStreak({ planHistory }) {
  const { streak, best, allTimeMeals, history } = useMemo(
    () => computeStreak(planHistory),
    [planHistory]
  )

  const maxDays = history.length ? Math.max(...history.map(w => w.days), 1) : 1

  return (
    <DashCard>
      <CardHead label="Planning streak" />
      <div className="dash-streak-body">
        <div>
          <span className="dash-streak-num">{streak || 0}</span>
          <span className="dash-streak-label">weeks in a row ✦</span>
        </div>

        {history.length > 0 && (
          <>
            <div className="dash-streak-bars">
              {history.map((w, i) => {
                const isLatest = i === history.length - 1
                const height   = Math.max(6, Math.round((w.days / maxDays) * 52))
                return (
                  <div key={w.week_key} className="dash-streak-bar-col" style={{ alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <div className="dash-streak-bar" style={{
                      height,
                      background: isLatest ? GRAD : (w.qualifies ? 'var(--hp-ink-200)' : 'var(--hp-ink-100)'),
                    }} />
                  </div>
                )
              })}
            </div>
            <div className="dash-streak-week-labels">
              {history.map((w, i) => {
                const isLatest = i === history.length - 1
                const parts    = w.week_key.split('-')
                return (
                  <div key={w.week_key} className="dash-streak-week-label" style={{
                    color:      isLatest ? 'var(--hp-green-600)' : 'var(--hp-ink-300)',
                    fontWeight: isLatest ? 700 : 400,
                  }}>
                    {isLatest ? 'Now' : `Wk ${parts[1]}`}
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div className="dash-streak-stats">
          <div>
            <div className="dash-streak-stat-label">Best streak</div>
            <div className="dash-streak-stat-val">
              {best || '—'}
              {best > 0 && <span className="dash-streak-stat-unit">weeks</span>}
            </div>
          </div>
          <div>
            <div className="dash-streak-stat-label">All-time meals planned</div>
            <div className="dash-streak-stat-val">{allTimeMeals || '—'}</div>
          </div>
        </div>
      </div>
    </DashCard>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user           = useUser()
  const navigate       = useNavigate()
  const currentWeekKey = getWeekKey()

  const [plan,        setPlan]        = useState({})
  const [recipes,     setRecipes]     = useState([])
  const [planHistory, setPlanHistory] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [addedIds,    setAddedIds]    = useState(new Set())
  const [aiData,      setAiData]      = useState(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getRecipes(user.id),
      getMealPlanWeeks(user.id),
      getMealPlan(user.id, currentWeekKey),
    ]).then(([{ data: r }, { data: h }, { data: p }]) => {
      setRecipes(r || [])
      setPlanHistory(h || [])
      setPlan(p || {})
      setLoading(false)
    })
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const recipeMap = useMemo(
    () => Object.fromEntries(recipes.map(r => [r.id, r])),
    [recipes]
  )

  const allTimeMostCooked = useMemo(
    () => computeMostCooked(planHistory, recipeMap, null),
    [planHistory, recipeMap]
  )

  // AI summary — cached in plan.dashboardAI keyed by week recipe fingerprint
  const planFingerprint = useMemo(
    () => [...new Set(planRecipeIds(plan))].sort().join(','),
    [plan]
  )

  useEffect(() => {
    if (!plan || !recipes.length) return
    const cached = plan.dashboardAI
    if (cached?.fingerprint === planFingerprint) {
      setAiData(cached)
      return
    }
    const weekMeals = [...new Set(planRecipeIds(plan))].map(id => {
      const r = recipeMap[id]
      return r ? { name: r.name, category: r.category, prepTime: r.prep_time || 0, cookTime: r.cook_time || 0 } : null
    }).filter(Boolean)

    const fp = planFingerprint
    fetch('/.netlify/functions/dashboard-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekMeals }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const payload = { ...data, fingerprint: fp }
        setAiData(payload)
        saveMealPlan(user.id, currentWeekKey, { ...plan, dashboardAI: payload })
          .then(() => setPlan(p => ({ ...p, dashboardAI: payload })))
      })
      .catch(() => {})
  }, [planFingerprint, recipes.length]) // eslint-disable-line react-hooks/exhaustive-deps

  async function addToPlan(recipeId) {
    setAddedIds(s => new Set([...s, recipeId]))
    const updated = {
      ...plan,
      dinners: [...(plan.dinners || []), { adultRecipeId: recipeId, multiplier: 1 }],
    }
    setPlan(updated)
    await saveMealPlan(user.id, currentWeekKey, updated)
  }

  const displayName = user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? null

  if (loading) {
    return (
      <div className="page">
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--hp-ink-400)', fontFamily: 'var(--hp-font-body)', fontSize: 14 }}>
          Loading…
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="page-hero">
        <div className="page-hero-top">
          <span className="t-eyebrow" style={{ color: 'var(--ink-400)' }}>{formatHeaderDate()}</span>
        </div>
        <h1 className="page-hero-title">
          {displayName ? `${greeting()}, ${displayName}.` : `${greeting()}.`}
        </h1>
      </div>

      <div className="dash-content">
        {/* AI Summary — full width */}
        <AISummary plan={plan} recipeMap={recipeMap} aiData={aiData} />

        {/* Body — 2 columns */}
        <div className="dash-body">
          {/* Left: Most Cooked + Recommended */}
          <div className="dash-col">
            <MostCooked planHistory={planHistory} recipeMap={recipeMap} navigate={navigate} />
            <RecommendedForYou
              recipes={recipes}
              plan={plan}
              planHistory={planHistory}
              currentWeekKey={currentWeekKey}
              mostCooked={allTimeMostCooked}
              onAdd={addToPlan}
              addedIds={addedIds}
            />
          </div>

          {/* Right: Top Proteins + Streak */}
          <div className="dash-col">
            <TopProteins planHistory={planHistory} recipeMap={recipeMap} />
            <PlanningStreak planHistory={planHistory} />
          </div>
        </div>
      </div>
    </div>
  )
}
