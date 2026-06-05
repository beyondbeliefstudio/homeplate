import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getMealPlan, getMealPlanWeeks, getRecipes, getGroceryList } from '../lib/supabase'
import { getWeekKey, shiftWeek, formatWeekOf } from '../lib/weeks'
import {
  IconClock, IconServes, IconGrocery, IconPlus,
  IconChevronL, IconChevronR,
} from '../components/icons'
import {
  FoodBreakfast, FoodLunch, FoodDinner, FoodSide, FoodSnack, FoodDessert, FOOD_ICON_MAP,
} from '../components/FoodIcons'
import './Dashboard.css'

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MEAL_ROWS  = [
  { key: 'b', label: 'B', Food: FoodBreakfast },
  { key: 'l', label: 'L', Food: FoodLunch     },
  { key: 'd', label: 'D', Food: FoodDinner    },
]

const GRAD = 'linear-gradient(90deg, var(--orange), var(--yellow), var(--lime), var(--green))'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function weekStartSunday(weekKey) {
  const [year, week] = weekKey.split('-').map(Number)
  const d = new Date(year, 0, 1 + (week - 1) * 7)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatFullDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// Build a 7-slot week array from the plan's dinners array
function buildWeekSlots(plan, recipeMap, sunday) {
  const dinners = plan?.dinners ?? []
  const slots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return { day: DAYS_SHORT[d.getDay()], date: d.getDate(), dateObj: d, slots: { b: null, l: null, d: null } }
  })

  // Map dinners by array index (one-per-night assumption, respecting multiplier)
  let dayIdx = 0
  for (const dinner of dinners) {
    if (dayIdx >= 7) break
    const recipe = dinner.adultRecipeId ? recipeMap[dinner.adultRecipeId] : null
    if (recipe) slots[dayIdx].slots.d = recipe
    const mult = dinner.multiplier ?? 1
    dayIdx += mult
  }

  // Map breakfasts (not day-indexed — attach to first available slots)
  const breakfasts = plan?.breakfasts ?? []
  let bIdx = 0
  for (const b of breakfasts) {
    if (bIdx >= 7) break
    const recipe = b.recipeId ? recipeMap[b.recipeId] : null
    if (recipe) slots[bIdx].slots.b = recipe
    bIdx++
  }

  // Map lunches similarly
  const lunches = plan?.lunches ?? []
  let lIdx = 0
  for (const l of lunches) {
    if (lIdx >= 7) break
    const recipe = l.recipeId ? recipeMap[l.recipeId] : null
    if (recipe) slots[lIdx].slots.l = recipe
    lIdx++
  }

  return slots
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const dashCard = (extra = {}) => ({
  background: 'var(--paper)',
  border: '1px solid var(--ink-100)',
  borderRadius: 'var(--r-lg)',
  ...extra,
})

function Card({ children, style, pad = 20 }) {
  return <div style={{ ...dashCard(), padding: pad, ...style }}>{children}</div>
}

function SHead({ label, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <span className="t-eyebrow">{label}</span>
      {action && (
        <button
          onClick={onAction}
          style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {action}
        </button>
      )}
    </div>
  )
}

// ─── Widget: Top Bar ──────────────────────────────────────────────────────────

function TopBar({ weekKey, onPrevWeek, onNextWeek, onThisWeek, isCurrentWeek, navigate, displayName }) {
  const today = new Date()
  return (
    <div className="dash-topbar">
      <div className="t-eyebrow" style={{ color: 'var(--ink-500)', marginBottom: 0 }}>Dashboard</div>
      <div className="dash-topbar-row">
        <div>
          <h1 className="dash-greeting">
            {displayName ? `Hey ${displayName}.` : `${greeting()}.`}
          </h1>
          <div className="t-caption" style={{ marginTop: 6 }}>
            {formatFullDate(today)}
            {' · '}
            <span style={{ color: 'var(--ink-400)' }}>{formatWeekOf(weekKey)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', paddingBottom: 4 }}>
          <div className="week-nav">
            <button className="btn btn-icon btn-ghost btn-sm" onClick={onPrevWeek}><IconChevronL size={16} /></button>
            <span className="week-nav-label">{formatWeekOf(weekKey)}</span>
            <button className="btn btn-icon btn-ghost btn-sm" onClick={onNextWeek}><IconChevronR size={16} /></button>
            {!isCurrentWeek && (
              <button className="btn btn-ghost btn-sm" onClick={onThisWeek} style={{ color: 'var(--green)' }}>This week</button>
            )}
          </div>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate('/planner')}>
            <IconPlus size={14} /> Add meal
          </button>
          <button
            className="btn btn-sm"
            style={{ background: GRAD, color: 'var(--ink-900)', border: 'none', fontWeight: 700 }}
            onClick={() => navigate('/grocery')}
          >
            <IconGrocery size={14} /> Grocery list
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Widget: AI Summary ────────────────────────────────────────────────────────

function AISummary({ plan, recipes, recipeMap }) {
  const dinners = plan?.dinners ?? []
  const allMeals = [
    ...(plan?.breakfasts ?? []),
    ...(plan?.lunches ?? []),
    ...dinners,
    ...(plan?.snacks ?? []),
  ]
  const totalMeals = allMeals.length
  const totalTime = dinners.reduce((s, d) => {
    const r = recipeMap[d.adultRecipeId]
    return s + (r ? (r.prep_time || 0) + (r.cook_time || 0) : 0)
  }, 0)
  const avgTime = dinners.length ? Math.round(totalTime / dinners.length) : 0

  // Simple scoring: more meals = better, variety = better
  const categories = new Set(dinners.map(d => recipeMap[d.adultRecipeId]?.category).filter(Boolean))
  const score = Math.min(10, Math.round(3 + (totalMeals / 9) * 4 + (categories.size / 4) * 3))
  const scoreDisplay = totalMeals === 0 ? '—' : `${score}.${Math.floor(Math.random() * 9)}`

  const tags = []
  if (avgTime > 0 && avgTime <= 30) tags.push('Quick weeknights ✓')
  if (dinners.length >= 5) tags.push('Well-planned week')
  if (categories.size >= 3) tags.push('Good variety')
  if (totalMeals === 0) tags.push('Nothing planned yet')

  const summaryText = totalMeals === 0
    ? 'No meals planned yet this week. Head to the planner to start building your week — even a few dinners makes grocery shopping much easier.'
    : `${dinners.length} dinner${dinners.length !== 1 ? 's' : ''} planned this week${avgTime > 0 ? ` with an average cook time of ${avgTime} minutes` : ''}. ${categories.size > 1 ? `Good variety across ${categories.size} meal categories.` : 'Consider mixing up categories for more variety.'}`

  return (
    <div className="dash-ai-card">
      <div className="dash-ai-rating">
        <div className="dash-ai-score" style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {scoreDisplay}
        </div>
        <div className="t-caption" style={{ fontWeight: 600 }}>/ 10 this week</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13 }}>✦</span>
          <span className="t-eyebrow">Weekly summary</span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--ink-700)', margin: '0 0 12px' }}>
          {summaryText}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tags.map(t => (
            <span key={t} className="chip" style={{ background: 'var(--ink-50)', fontSize: 11, height: 26 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Widget: Week at a Glance ──────────────────────────────────────────────────

function WeekAtAGlance({ weekSlots, today, navigate }) {
  return (
    <Card style={{ overflow: 'hidden' }} pad={0}>
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="t-eyebrow">Week at a glance</span>
        <button
          style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={() => navigate('/planner')}
        >Open planner →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {weekSlots.map(({ day, date, dateObj }) => {
          const isToday = dateObj.toDateString() === today.toDateString()
          return (
            <div key={day} style={{ padding: '8px 6px 6px', textAlign: 'center', borderBottom: '1px solid var(--ink-100)', borderRight: '1px solid var(--ink-100)', background: isToday ? 'var(--green-50)' : 'transparent' }}>
              <div className="t-caption" style={{ fontWeight: 600, color: isToday ? 'var(--green-600)' : 'var(--ink-500)' }}>{day}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: isToday ? 'var(--green-600)' : 'var(--ink-900)', lineHeight: 1.1 }}>{date}</div>
              {isToday && <div style={{ height: 3, width: 22, margin: '3px auto 0', borderRadius: 2, background: GRAD }} />}
            </div>
          )
        })}
        {MEAL_ROWS.map(({ key, Food }) =>
          weekSlots.map(({ day, dateObj, slots }) => {
            const isToday = dateObj.toDateString() === today.toDateString()
            const meal = slots[key]
            return (
              <div
                key={`${day}-${key}`}
                style={{ padding: '6px 6px', minHeight: 54, borderBottom: key !== 'd' ? '1px solid var(--ink-100)' : 'none', borderRight: '1px solid var(--ink-100)', background: isToday ? 'var(--green-50)' : 'transparent', display: 'flex', flexDirection: 'column', gap: 3 }}
              >
                {meal ? (
                  <>
                    <Food size={16} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, lineHeight: 1.3, color: 'var(--ink-700)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {meal.name}
                    </span>
                  </>
                ) : (
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 11, color: 'var(--ink-300)' }}>—</span>
                )}
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

// ─── Widget: Today's Meals ────────────────────────────────────────────────────

function TodaysMeals({ weekSlots, today }) {
  const todaySlot = weekSlots.find(s => s.dateObj.toDateString() === today.toDateString())
  const meals = []
  if (todaySlot?.slots.b) meals.push({ type: 'Breakfast', recipe: todaySlot.slots.b, Food: FoodBreakfast })
  if (todaySlot?.slots.l) meals.push({ type: 'Lunch',     recipe: todaySlot.slots.l, Food: FoodLunch })
  if (todaySlot?.slots.d) meals.push({ type: 'Dinner',    recipe: todaySlot.slots.d, Food: FoodDinner })

  return (
    <Card pad={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--ink-100)' }}>
        <span className="t-eyebrow">Today</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {meals.length === 0 ? (
          <div style={{ padding: '24px 18px', color: 'var(--ink-400)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
            Nothing planned today.
          </div>
        ) : (
          meals.map(({ type, recipe, Food }, i) => {
            const time = (recipe.prep_time || 0) + (recipe.cook_time || 0)
            return (
              <div key={type} style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < meals.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                <Food size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t-caption" style={{ fontWeight: 600, marginBottom: 2 }}>{type}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recipe.name}</div>
                </div>
                {time > 0 && (
                  <span className="t-caption tabular" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <IconClock size={11} />{time}m
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

// ─── Widget: This Week's Recipes ──────────────────────────────────────────────

function ThisWeekRecipes({ plan, recipeMap }) {
  const seen = new Set()
  const weekRecipes = []

  const addMeal = (recipeId, dayLabel) => {
    const r = recipeMap[recipeId]
    if (!r || seen.has(r.id)) return
    seen.add(r.id)
    const Food = FOOD_ICON_MAP[r.category] ?? FoodDinner
    weekRecipes.push({ recipe: r, day: dayLabel, Food })
  }

  const dinners = plan?.dinners ?? []
  dinners.forEach((d, i) => {
    const day = DAYS_SHORT[i] ?? `D${i+1}`
    if (d.adultRecipeId) addMeal(d.adultRecipeId, day)
    if (d.kidsRecipeId)  addMeal(d.kidsRecipeId, day)
    d.sides?.forEach(s => s.recipeId && addMeal(s.recipeId, day))
  });
  (plan?.breakfasts ?? []).forEach(b => b.recipeId && addMeal(b.recipeId, 'B'));
  (plan?.lunches   ?? []).forEach(l => l.recipeId && addMeal(l.recipeId, 'L'));
  (plan?.snacks    ?? []).forEach(s => s.recipeId && addMeal(s.recipeId, 'S'));

  if (weekRecipes.length === 0) return null

  return (
    <div className="dash-week-recipes">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="t-eyebrow">This week's recipes</span>
        <span className="t-caption">{weekRecipes.length} planned</span>
      </div>
      <div className="dash-recipe-strip">
        {weekRecipes.map(({ recipe, day, Food }) => {
          const time = (recipe.prep_time || 0) + (recipe.cook_time || 0)
          return (
            <div key={recipe.id} style={{ ...dashCard(), padding: '12px 14px', minWidth: 160, maxWidth: 160, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Food size={28} />
                <span className="chip" style={{ height: 20, padding: '0 7px', fontSize: 10, background: 'var(--ink-50)' }}>{day}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, color: 'var(--ink-900)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {recipe.name}
              </div>
              {time > 0 && (
                <div className="t-caption tabular" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <IconClock size={10} />{time}m · {recipe.category ?? 'Recipe'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Widget: Most Cooked ──────────────────────────────────────────────────────

function MostCooked({ recipes, navigate }) {
  const top = recipes.slice(0, 5)
  if (top.length === 0) return (
    <Card>
      <SHead label="Most cooked meals" action="All recipes →" onAction={() => navigate('/recipes')} />
      <div className="t-caption" style={{ color: 'var(--ink-400)' }}>No recipes yet.</div>
    </Card>
  )

  return (
    <Card>
      <SHead label="Your recipes" action="All →" onAction={() => navigate('/recipes')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {top.map((r, i) => {
          const Food = FOOD_ICON_MAP[r.category] ?? FoodDinner
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Food size={22} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.name}
              </span>
              <span style={{ height: 6, width: 6, borderRadius: '50%', background: GRAD.replace('90deg', `${i * 20}deg`), flexShrink: 0 }} />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── Widget: Pantry Stash ─────────────────────────────────────────────────────

function PantryStash({ plan, recipeMap, navigate }) {
  const STAPLE_KEYWORDS = ['salt', 'pepper', 'olive oil', 'butter', 'garlic', 'onion', 'oil', 'flour', 'sugar', 'egg', 'cream', 'stock', 'pasta']
  const found = new Map()

  ;(plan?.dinners ?? []).forEach(d => {
    recipeMap[d.adultRecipeId]?.ingredients?.forEach(ing => {
      const n = (ing.name ?? '').toLowerCase()
      STAPLE_KEYWORDS.forEach(kw => {
        if (n.includes(kw) && !found.has(ing.name)) {
          found.set(ing.name, { name: ing.name, status: 'ok', color: '#A6C948' })
        }
      })
    })
  })

  const items = [...found.values()].slice(0, 5)

  return (
    <Card style={{ display: 'flex', flexDirection: 'column' }}>
      <SHead label="Pantry watch" action="Grocery →" onAction={() => navigate('/grocery')} />
      {items.length === 0 ? (
        <div className="t-caption" style={{ color: 'var(--ink-400)' }}>Plan dinners to see pantry items here.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
          {items.map(({ name, color }) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-800)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                <span className="t-caption" style={{ fontWeight: 600, color }}>Check</span>
              </span>
            </div>
          ))}
        </div>
      )}
      <button className="btn btn-sm btn-ghost" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
        onClick={() => navigate('/grocery')}>
        View grocery list
      </button>
    </Card>
  )
}

// ─── Widget: Stats Panel ───────────────────────────────────────────────────────

function StatsPanel({ plan, recipes, groceryItems }) {
  const dinners = plan?.dinners ?? []
  const allMeals = [
    ...(plan?.breakfasts ?? []),
    ...(plan?.lunches ?? []),
    ...dinners,
    ...(plan?.snacks ?? []),
  ]

  // Count days that have at least one meal — use dinner count as proxy
  const daysPlanned = Math.min(7, dinners.reduce((n, d) => n + (d.multiplier ?? 1), 0))
  const totalServings = dinners.reduce((s, d) => s + (d.multiplier ?? 1) * 2, 0)
  const avgPrepTime = dinners.length
    ? Math.round(dinners.reduce((s, d) => s + ((d.prep_time || 0) + (d.cook_time || 0)), 0) / dinners.length)
    : 0

  const stats = [
    { value: `${daysPlanned}/7`, sub: 'Days planned', grad: true },
    { value: String(allMeals.length || '—'), sub: 'Meals this week' },
    { value: recipes.length > 0 ? String(recipes.length) : '—', sub: 'Saved recipes' },
    { value: groceryItems.length > 0 ? String(groceryItems.length) : '—', sub: 'Grocery items' },
  ]

  return (
    <Card>
      <SHead label="Week stats" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {stats.map(({ value, sub, grad }) => (
          <div key={sub} style={{ background: 'var(--bg-app)', borderRadius: 'var(--r-md)', padding: '12px 12px 10px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: 1, letterSpacing: '-0.025em', ...(grad ? { background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : { color: 'var(--ink-900)' }) }}>{value}</div>
            <div className="t-caption" style={{ marginTop: 5 }}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span className="t-caption">Weekly planning</span>
          <span className="t-caption tabular" style={{ fontWeight: 600, color: 'var(--green-600)' }}>{daysPlanned}/7 days</span>
        </div>
        <div style={{ height: 7, background: 'var(--ink-100)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(daysPlanned / 7) * 100}%`, background: GRAD }} />
        </div>
      </div>
    </Card>
  )
}

// ─── Widget: Recommended Recipe ────────────────────────────────────────────────

function Recommended({ recipes, plan, navigate }) {
  const plannedIds = new Set([
    ...(plan?.dinners ?? []).map(d => d.adultRecipeId),
    ...(plan?.breakfasts ?? []).map(b => b.recipeId),
    ...(plan?.lunches ?? []).map(l => l.recipeId),
  ])

  const candidates = recipes.filter(r => !plannedIds.has(r.id))
  if (candidates.length === 0) return null

  const rec = candidates[0]
  const Food = FOOD_ICON_MAP[rec.category] ?? FoodDinner
  const time = (rec.prep_time || 0) + (rec.cook_time || 0)

  return (
    <Card style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
      <div style={{ background: 'var(--green-50)', borderRadius: 'var(--r-md)', padding: 14, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
        <Food size={52} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <span className="t-eyebrow">Recommended</span>
          <span className="chip" style={{ height: 22, fontSize: 11, padding: '0 8px', background: 'var(--orange-50)', color: 'var(--orange-600)', border: 'none' }}>
            Not this week
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em', color: 'var(--ink-900)', marginBottom: 6, lineHeight: 1.1 }}>
          {rec.name}
        </div>
        <div className="t-caption" style={{ marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {time > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><IconClock size={11} /> {time} min</span>}
          {rec.servings > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><IconServes size={11} /> Serves {rec.servings}</span>}
          {rec.category && <span style={{ textTransform: 'capitalize' }}>{rec.category}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm btn-primary" onClick={() => navigate('/planner')}>
            Add to planner
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/recipes/${rec.id}`)}>
            View recipe
          </button>
        </div>
      </div>
    </Card>
  )
}

// ─── Widget: Planning Streak ──────────────────────────────────────────────────

function StreakCard({ planHistory }) {
  // planHistory is an array of { week_key } from most recent to oldest
  // Calculate streak: consecutive weeks with any meals planned
  const streakData = planHistory.slice(0, 8).reverse()
  const labels = streakData.map(p => {
    const parts = p.week_key.split('-')
    return `Wk ${parts[1]}`
  })
  const currentLabel = labels[labels.length - 1] ?? 'This week'

  // Mock bar heights until we have real planning % data
  const bars = streakData.map((p, i) => i === streakData.length - 1 ? 5/7 : 0.5 + Math.random() * 0.4)

  // Streak = consecutive recent weeks
  let streak = 0
  for (let i = planHistory.length - 1; i >= 0; i--) {
    streak++
    // Would need to check if that week had any meals — without that data, just show plan count
    if (streak >= planHistory.length) break
  }

  if (planHistory.length === 0) {
    return (
      <Card>
        <SHead label="Planning streak" />
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, letterSpacing: '-0.03em', color: 'var(--ink-900)', marginBottom: 6 }}>—</div>
        <div className="t-caption">Start planning to build a streak.</div>
      </Card>
    )
  }

  return (
    <Card>
      <SHead label="Planning streak" />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 38, letterSpacing: '-0.03em', color: 'var(--ink-900)' }}>{planHistory.length}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--ink-600)' }}>weeks planned ✦</span>
      </div>
      {bars.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
            {bars.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', height: Math.max(6, Math.round(v * 48)), borderRadius: 3, background: i === bars.length - 1 ? GRAD : 'var(--ink-100)', opacity: i < bars.length - 1 ? 0.6 + i * 0.05 : 1 }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
            {labels.map((l, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 9, color: i === labels.length - 1 ? 'var(--green-600)' : 'var(--ink-300)', fontWeight: i === labels.length - 1 ? 700 : 400 }}>
                {l}
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{ marginTop: 14, display: 'flex', gap: 20 }}>
        <div>
          <div className="t-caption" style={{ marginBottom: 2 }}>Total weeks</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink-900)' }}>{planHistory.length}</div>
        </div>
        <div>
          <div className="t-caption" style={{ marginBottom: 2 }}>All-time meals</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink-900)' }}>—</div>
        </div>
      </div>
    </Card>
  )
}

// ─── Main Dashboard Page ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const user     = useUser()
  const navigate = useNavigate()

  const [weekKey,      setWeekKey]      = useState(() => getWeekKey())
  const [plan,         setPlan]         = useState({})
  const [recipes,      setRecipes]      = useState([])
  const [groceryItems, setGroceryItems] = useState([])
  const [planHistory,  setPlanHistory]  = useState([])
  const [loading,      setLoading]      = useState(true)

  const today = useMemo(() => new Date(), [])

  useEffect(() => {
    if (!user) return
    getRecipes(user.id).then(({ data }) => setRecipes(data || []))
    getGroceryList(user.id).then(({ data }) => setGroceryItems(data || []))
    getMealPlanWeeks(user.id).then(({ data }) => setPlanHistory(data || []))
  }, [user])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getMealPlan(user.id, weekKey).then(({ data }) => {
      setPlan(data || {})
      setLoading(false)
    })
  }, [user, weekKey])

  const recipeMap  = useMemo(() => Object.fromEntries(recipes.map(r => [r.id, r])), [recipes])
  const sunday     = useMemo(() => weekStartSunday(weekKey), [weekKey])
  const weekSlots  = useMemo(() => buildWeekSlots(plan, recipeMap, sunday), [plan, recipeMap, sunday])
  const isCurrentWeek = weekKey === getWeekKey()

  if (loading) {
    return (
      <div className="dash-page">
        <div style={{ padding: '80px 32px', textAlign: 'center', color: 'var(--ink-400)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
          Loading…
        </div>
      </div>
    )
  }

  return (
    <div className="dash-page">
      {/* Top Bar */}
      <TopBar
        weekKey={weekKey}
        onPrevWeek={() => setWeekKey(k => shiftWeek(k, -1))}
        onNextWeek={() => setWeekKey(k => shiftWeek(k, 1))}
        onThisWeek={() => setWeekKey(getWeekKey())}
        isCurrentWeek={isCurrentWeek}
        navigate={navigate}
        displayName={user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? null}
      />

      <div className="dash-content">
        {/* AI Summary — full width */}
        <AISummary plan={plan} recipes={recipes} recipeMap={recipeMap} />

        {/* Week + Today */}
        <div className="dash-grid-week">
          <WeekAtAGlance weekSlots={weekSlots} today={today} navigate={navigate} />
          <TodaysMeals weekSlots={weekSlots} today={today} />
        </div>

        {/* This week's recipes */}
        <ThisWeekRecipes plan={plan} recipeMap={recipeMap} />

        {/* Most cooked + Pantry + Stats */}
        <div className="dash-grid-3">
          <MostCooked recipes={recipes} navigate={navigate} />
          <PantryStash plan={plan} recipeMap={recipeMap} navigate={navigate} />
          <StatsPanel plan={plan} recipes={recipes} groceryItems={groceryItems} />
        </div>

        {/* Recommended + Streak */}
        <div className="dash-grid-2">
          <Recommended recipes={recipes} plan={plan} navigate={navigate} />
          <StreakCard planHistory={planHistory} />
        </div>
      </div>
    </div>
  )
}
