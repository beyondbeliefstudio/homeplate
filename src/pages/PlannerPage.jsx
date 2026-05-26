import { useState, useEffect, useCallback } from 'react'
import { useUser } from '../hooks/useAuth.jsx'
import { getMealPlan, saveMealPlan, getRecipes, getHouseholdMembers } from '../lib/supabase'
import { getCategoryMeta } from '../lib/categories'
import { getWeekKey, shiftWeek, formatWeekOf } from '../lib/weeks'
import {
  IconChevronL, IconChevronR, IconChevronD, IconPlus, IconClose, IconCheck, IconSearch, IconShare,
} from '../components/icons'
import './Planner.css'

// ─── Constants ───────────────────────────────────────────────────────
const EMPTY_PLAN = { breakfasts: [], lunches: [], dinners: [], snacks: [] }

const AUDIENCE = {
  adults:   { label: 'Adults only', color: '#5C625E' },   // ink-500 neutral
  everyone: { label: 'Everyone',    color: '#E63957' },   // cherry (--hot)
  kids:     { label: 'Kids only',   color: '#C99100' },   // marigold-700 (--sun-700)
}

// ─── Helpers ─────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9) }

function generateShareText(plan, recipeMap, weekKey) {
  const lines = [`HomePlate · ${formatWeekOf(weekKey)}`, '']

  if (plan.breakfasts?.length) {
    lines.push('🍳 Breakfasts')
    plan.breakfasts.forEach(item => {
      if (item.isDiningOut) {
        lines.push(`- 🍴 Dining out${item.restaurant ? ` — ${item.restaurant}` : ''}`)
      } else {
        lines.push(item.isPantry ? '- Pantry / Whatever' : `- ${recipeMap[item.recipeId]?.name ?? '(recipe)'}`)
      }
    })
    lines.push('')
  }

  if (plan.lunches?.length) {
    lines.push('🥗 Lunches')
    plan.lunches.forEach(item => {
      if (item.isDiningOut) { lines.push(`- 🍴 Dining out${item.restaurant ? ` — ${item.restaurant}` : ''}`); return }
      if (item.isPantry) { lines.push('- Pantry Raid'); return }
      const name = recipeMap[item.recipeId]?.name ?? '(recipe)'
      const kidsName = item.kidsRecipeId ? recipeMap[item.kidsRecipeId]?.name : null
      lines.push(kidsName ? `- ${name} (Kids: ${kidsName})` : `- ${name}`)
    })
    lines.push('')
  }

  if (plan.dinners?.length) {
    lines.push('🍽 Dinners')
    plan.dinners.forEach(item => {
      if (item.isDiningOut) {
        const multi = (item.multiplier ?? 1) > 1 ? ` × ${item.multiplier} nights` : ''
        lines.push(`- 🍴 Dining out${multi}${item.restaurant ? ` — ${item.restaurant}` : ''}`)
        return
      }
      const name = recipeMap[item.adultRecipeId]?.name ?? '(recipe)'
      const multi = (item.multiplier ?? 1) > 1 ? ` × ${item.multiplier} nights` : ''
      const kidsName = item.kidsRecipeId ? recipeMap[item.kidsRecipeId]?.name : null
      const sideNames = (item.sides ?? []).map(s => recipeMap[s.recipeId]?.name).filter(Boolean)
      lines.push(`- ${name}${multi}${sideNames.length ? ` + ${sideNames.join(', ')}` : ''}${kidsName ? ` (Kids: ${kidsName})` : ''}`)
    })
    lines.push('')
  }

  if (plan.snacks?.length) {
    lines.push('🍪 Snacks')
    plan.snacks.forEach(item => {
      if (item.isDiningOut) { lines.push(`- 🍴 Dining out${item.restaurant ? ` — ${item.restaurant}` : ''}`); return }
      lines.push(`- ${recipeMap[item.recipeId]?.name ?? '(recipe)'}`)
    })
  }

  return lines.join('\n').trim()
}

// ─── Main Component ──────────────────────────────────────────────────
export default function PlannerPage() {
  const user = useUser()
  const [weekKey, setWeekKey] = useState(() => getWeekKey())
  const [plan, setPlan]       = useState(EMPTY_PLAN)
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState({})
  const [members, setMembers] = useState([])
  const [picker, setPicker]   = useState(null) // { section, itemId?, field, category, preferAudience? }
  const [shared, setShared]   = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getRecipes(user.id),
      getHouseholdMembers(user.id),
    ]).then(([{ data: r }, { data: m }]) => {
      setRecipes(r || [])
      setMembers(m || [])
    })
  }, [user])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getMealPlan(user.id, weekKey).then(({ data }) => {
      setPlan({ ...EMPTY_PLAN, ...data })
      setLoading(false)
    })
  }, [user, weekKey])

  const recipeMap = Object.fromEntries(recipes.map(r => [r.id, r]))

  const updatePlan = useCallback(async (newPlan) => {
    setPlan(newPlan)
    await saveMealPlan(user.id, weekKey, newPlan)
  }, [user, weekKey])

  function addItem(section, item) {
    updatePlan({ ...plan, [section]: [...(plan[section] ?? []), item] })
  }
  function removeItem(section, id) {
    updatePlan({ ...plan, [section]: plan[section].filter(i => i.id !== id) })
  }
  function updateItem(section, id, changes) {
    updatePlan({
      ...plan,
      [section]: plan[section].map(i => i.id === id ? { ...i, ...changes } : i),
    })
  }

  function toggleCollapsed(key) {
    setCollapsed(c => ({ ...c, [key]: !c[key] }))
  }

  async function handleShare() {
    const text = generateShareText(plan, recipeMap, weekKey)
    try {
      if (navigator.share) { await navigator.share({ text }) }
      else { await navigator.clipboard.writeText(text) }
    } catch { await navigator.clipboard.writeText(text).catch(() => {}) }
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  // Called by picker when a recipe is selected
  function handlePick(recipeId) {
    const { section, itemId, field } = picker
    if (itemId && field === 'sideRecipeId') {
      // Append to this dinner's sides array
      const dinner = plan.dinners.find(i => i.id === itemId)
      const newSide = { id: uid(), recipeId }
      updateItem('dinners', itemId, { sides: [...(dinner?.sides ?? []), newSide] })
    } else if (itemId) {
      updateItem(section, itemId, { [field]: recipeId })
    } else {
      // New item — build a skeleton based on section
      if (section === 'breakfasts') {
        addItem('breakfasts', { id: uid(), recipeId, isPantry: false, made: false, audience: 'everyone', multiplier: 1, kidsRecipeId: null, kidsMade: false, memberIds: [], note: '' })
      } else if (section === 'lunches') {
        addItem('lunches', { id: uid(), recipeId, isPantry: false, made: false, audience: 'everyone', multiplier: 1, kidsRecipeId: null, memberIds: [], note: '' })
      } else if (section === 'dinners' && field === 'adultRecipeId') {
        addItem('dinners', { id: uid(), adultRecipeId: recipeId, audience: 'everyone', multiplier: 1, madeCount: 0, kidsRecipeId: null, kidsMade: false, sides: [], memberIds: [], note: '' })
      } else if (section === 'snacks') {
        addItem('snacks', { id: uid(), recipeId, multiplier: 1, made: false, audience: 'everyone', memberIds: [], note: '' })
      }
    }
    setPicker(null)
  }

  const sharedProps = { plan, recipeMap, recipes, members, collapsed, toggleCollapsed, addItem, removeItem, updateItem, setPicker }

  return (
    <div className="page planner-page">
      <div className="page-header">
        <h1 className="page-title">Planner</h1>
        <button className="btn btn-secondary btn-sm" onClick={handleShare}>
          <IconShare size={14} />
          {shared ? 'Copied!' : 'Share week'}
        </button>
      </div>

      {/* Week navigation */}
      <div className="planner-week-nav">
        <button className="btn btn-ghost btn-sm planner-nav-btn"
          onClick={() => setWeekKey(k => shiftWeek(k, -1))}>
          <IconChevronL size={16} />
        </button>
        <span className="planner-week-label">{formatWeekOf(weekKey)}</span>
        <button className="btn btn-ghost btn-sm planner-nav-btn"
          onClick={() => setWeekKey(k => shiftWeek(k, 1))}>
          <IconChevronR size={16} />
        </button>
        {weekKey !== getWeekKey() && (
          <button className="btn btn-ghost btn-sm planner-today-btn"
            onClick={() => setWeekKey(getWeekKey())}>
            This week
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-placeholder"><p>Loading…</p></div>
      ) : (
        <div className="planner-sections">
          <BreakfastsSection {...sharedProps} />
          <LunchesSection    {...sharedProps} />
          <DinnersSection    {...sharedProps} />
          <SnacksSection     {...sharedProps} />
        </div>
      )}

      {picker && (
        <RecipePicker
          recipes={recipes}
          category={picker.category}
          preferAudience={picker.preferAudience}
          currentId={
            picker.itemId
              ? (picker.field === 'kidsRecipeId'
                  ? plan[picker.section].find(i => i.id === picker.itemId)?.kidsRecipeId
                  : picker.field === 'adultRecipeId'
                    ? plan[picker.section].find(i => i.id === picker.itemId)?.adultRecipeId
                    : plan[picker.section].find(i => i.id === picker.itemId)?.recipeId)
              : null
          }
          onSelect={handlePick}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}

// ─── Section shell ───────────────────────────────────────────────────
function SectionShell({ sectionKey, icon, label, count, collapsed, onToggle, children, addActions }) {
  return (
    <div className="planner-section">
      <button className="planner-section-header" onClick={onToggle}>
        <span className="planner-section-icon">{icon}</span>
        <span className="planner-section-title">{label}</span>
        {count > 0 && <span className="planner-section-count">{count}</span>}
        <IconChevronD size={16}
          className={`planner-section-chevron ${collapsed ? '' : 'planner-section-chevron--open'}`} />
      </button>

      {!collapsed && (
        <div className="planner-section-body">
          {children}
          <div className="planner-add-row">{addActions}</div>
        </div>
      )}
    </div>
  )
}

// ─── Breakfasts ──────────────────────────────────────────────────────
function BreakfastsSection({ plan, recipeMap, members, collapsed, toggleCollapsed, addItem, removeItem, updateItem, setPicker }) {
  const items = plan.breakfasts ?? []

  return (
    <SectionShell
      sectionKey="breakfasts" icon="🍳" label="Breakfasts"
      count={items.length}
      collapsed={collapsed.breakfasts}
      onToggle={() => toggleCollapsed('breakfasts')}
      addActions={<>
        <button className="btn btn-ghost btn-sm planner-add-btn"
          onClick={() => setPicker({ section: 'breakfasts', field: 'recipeId', category: 'breakfast' })}>
          <IconPlus size={14} /> Add recipe
        </button>
        <button className="btn btn-ghost btn-sm planner-add-btn planner-add-btn--muted"
          onClick={() => addItem('breakfasts', { id: uid(), recipeId: null, isPantry: true, made: false, audience: 'everyone', multiplier: 1, kidsRecipeId: null, kidsMade: false, memberIds: [], note: '' })}>
          + Pantry / Whatever
        </button>
        <button className="btn btn-ghost btn-sm planner-add-btn planner-add-btn--diningout"
          onClick={() => addItem('breakfasts', { id: uid(), isDiningOut: true, restaurant: '', made: false, multiplier: 1, note: '', memberIds: [] })}>
          🍴 Dining out
        </button>
      </>}
    >
      {items.map(item => {
        if (item.isDiningOut) {
          return <DiningOutCard key={item.id} item={item} section="breakfasts" members={members} removeItem={removeItem} updateItem={updateItem} />
        }
        const multi = item.multiplier ?? 1
        return (
          <div key={item.id} className={`plan-card plan-card--column ${item.made ? 'plan-card--made' : ''}`}>
            <div className="plan-card-row">
              <MadeToggle made={item.made} onToggle={() => updateItem('breakfasts', item.id, { made: !item.made })} />
              <div className="plan-card-body">
                {item.isPantry ? (
                  <span className="plan-card-pantry">Pantry / Whatever</span>
                ) : (
                  <span className="plan-card-name"
                    onClick={() => setPicker({ section: 'breakfasts', itemId: item.id, field: 'recipeId', category: 'breakfast' })}>
                    {recipeMap[item.recipeId]?.name ?? <em className="plan-card-unset">Pick a recipe…</em>}
                  </span>
                )}
                {!item.isPantry && (
                  <div className="plan-card-meta">
                    <AudienceBadge audience={item.audience ?? 'everyone'} />
                  </div>
                )}
                <NoteField note={item.note || ''} onChange={v => updateItem('breakfasts', item.id, { note: v })} />
              </div>
              {members.length > 0 && (
                <MemberTags memberIds={item.memberIds ?? []} members={members}
                  onChange={ids => updateItem('breakfasts', item.id, { memberIds: ids })} />
              )}
              <MultiplierBtn value={multi}
                onChange={v => updateItem('breakfasts', item.id, { multiplier: v })} />
              <button className="plan-card-remove" onClick={() => removeItem('breakfasts', item.id)}>
                <IconClose size={13} />
              </button>
            </div>
            {!item.isPantry && (
              <div className="plan-card-audience-row">
                {['adults', 'everyone'].map(a => (
                  <button key={a}
                    className={`audience-pill ${(item.audience ?? 'everyone') === a ? 'audience-pill--active' : ''}`}
                    onClick={() => updateItem('breakfasts', item.id, { audience: a })}>
                    {AUDIENCE[a].label}
                  </button>
                ))}
              </div>
            )}
            {!item.isPantry && (
              <div className="plan-card-kids-row">
                <AudienceBadge audience="kids" />
                {item.kidsRecipeId ? (
                  <>
                    <MadeToggle made={item.kidsMade}
                      onToggle={() => updateItem('breakfasts', item.id, { kidsMade: !item.kidsMade })} />
                    <span className="plan-card-name plan-card-name--sm"
                      onClick={() => setPicker({ section: 'breakfasts', itemId: item.id, field: 'kidsRecipeId', category: 'breakfast', preferAudience: 'kids' })}>
                      {recipeMap[item.kidsRecipeId]?.name}
                    </span>
                    <button className="plan-card-remove plan-card-remove--sm"
                      onClick={() => updateItem('breakfasts', item.id, { kidsRecipeId: null, kidsMade: false })}>
                      <IconClose size={11} />
                    </button>
                  </>
                ) : (
                  <button className="btn btn-ghost btn-sm planner-add-btn"
                    onClick={() => setPicker({ section: 'breakfasts', itemId: item.id, field: 'kidsRecipeId', category: 'breakfast', preferAudience: 'kids' })}>
                    <IconPlus size={12} /> Add kids meal
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </SectionShell>
  )
}

// ─── Lunches ─────────────────────────────────────────────────────────
function LunchesSection({ plan, recipeMap, members, collapsed, toggleCollapsed, addItem, removeItem, updateItem, setPicker }) {
  const items = plan.lunches ?? []

  return (
    <SectionShell
      sectionKey="lunches" icon="🥗" label="Lunches"
      count={items.length}
      collapsed={collapsed.lunches}
      onToggle={() => toggleCollapsed('lunches')}
      addActions={<>
        <button className="btn btn-ghost btn-sm planner-add-btn"
          onClick={() => setPicker({ section: 'lunches', field: 'recipeId', category: 'lunch' })}>
          <IconPlus size={14} /> Add recipe
        </button>
        <button className="btn btn-ghost btn-sm planner-add-btn planner-add-btn--muted"
          onClick={() => addItem('lunches', { id: uid(), recipeId: null, isPantry: true, made: false, audience: 'everyone', multiplier: 1, kidsRecipeId: null, memberIds: [], note: '' })}>
          + Pantry Raid
        </button>
        <button className="btn btn-ghost btn-sm planner-add-btn planner-add-btn--diningout"
          onClick={() => addItem('lunches', { id: uid(), isDiningOut: true, restaurant: '', made: false, multiplier: 1, note: '', memberIds: [] })}>
          🍴 Dining out
        </button>
      </>}
    >
      {items.map(item => {
        if (item.isDiningOut) {
          return <DiningOutCard key={item.id} item={item} section="lunches" members={members} removeItem={removeItem} updateItem={updateItem} />
        }
        const multi = item.multiplier ?? 1
        return (
          <div key={item.id} className={`plan-card plan-card--column ${item.made ? 'plan-card--made' : ''}`}>
            <div className="plan-card-row">
              <MadeToggle made={item.made} onToggle={() => updateItem('lunches', item.id, { made: !item.made })} />
              <div className="plan-card-body">
                {item.isPantry ? (
                  <span className="plan-card-pantry">Pantry Raid</span>
                ) : (
                  <span className="plan-card-name"
                    onClick={() => setPicker({ section: 'lunches', itemId: item.id, field: 'recipeId', category: 'lunch' })}>
                    {recipeMap[item.recipeId]?.name ?? <em className="plan-card-unset">Pick a recipe…</em>}
                  </span>
                )}
                {!item.isPantry && (
                  <div className="plan-card-meta">
                    <AudienceBadge audience={item.audience ?? 'everyone'} />
                  </div>
                )}
                <NoteField note={item.note || ''} onChange={v => updateItem('lunches', item.id, { note: v })} />
              </div>
              {members.length > 0 && (
                <MemberTags memberIds={item.memberIds ?? []} members={members}
                  onChange={ids => updateItem('lunches', item.id, { memberIds: ids })} />
              )}
              <MultiplierBtn value={multi}
                onChange={v => updateItem('lunches', item.id, { multiplier: v })} />
              <button className="plan-card-remove" onClick={() => removeItem('lunches', item.id)}>
                <IconClose size={13} />
              </button>
            </div>
            {!item.isPantry && (
              <div className="plan-card-audience-row">
                {['adults', 'everyone'].map(a => (
                  <button key={a}
                    className={`audience-pill ${(item.audience ?? 'everyone') === a ? 'audience-pill--active' : ''}`}
                    onClick={() => updateItem('lunches', item.id, { audience: a })}>
                    {AUDIENCE[a].label}
                  </button>
                ))}
              </div>
            )}
            {!item.isPantry && (
              <div className="plan-card-kids-row">
                <AudienceBadge audience="kids" />
                {item.kidsRecipeId ? (
                  <>
                    <span className="plan-card-name plan-card-name--sm"
                      onClick={() => setPicker({ section: 'lunches', itemId: item.id, field: 'kidsRecipeId', category: 'lunch', preferAudience: 'kids' })}>
                      {recipeMap[item.kidsRecipeId]?.name}
                    </span>
                    <button className="plan-card-remove plan-card-remove--sm"
                      onClick={() => updateItem('lunches', item.id, { kidsRecipeId: null })}>
                      <IconClose size={11} />
                    </button>
                  </>
                ) : (
                  <button className="btn btn-ghost btn-sm planner-add-btn"
                    onClick={() => setPicker({ section: 'lunches', itemId: item.id, field: 'kidsRecipeId', category: 'lunch', preferAudience: 'kids' })}>
                    <IconPlus size={12} /> Add kids meal
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </SectionShell>
  )
}

// ─── Dinner card (collapsible) ───────────────────────────────────────
function DinnerCard({ item, recipeMap, members, removeItem, updateItem, setPicker }) {
  const [expanded, setExpanded] = useState(false)

  const multi      = item.multiplier ?? 1
  const made       = item.madeCount ?? 0
  const fullDone   = made >= multi
  const sameRecipe = item.kidsRecipeId && item.kidsRecipeId === item.adultRecipeId
  const sides      = item.sides ?? []
  const sideNames  = sides.map(s => recipeMap[s.recipeId]?.name).filter(Boolean)

  return (
    <div className={`plan-card plan-card--column plan-card--dinner ${fullDone ? 'plan-card--made' : ''}`}>

      {/* ── Always-visible summary row ── */}
      <div className="plan-card-row">
        <DinnerMadeToggle made={made} total={multi}
          onToggle={() => updateItem('dinners', item.id, { madeCount: made >= multi ? 0 : made + 1 })} />

        <div className="plan-card-body">
          <span className="plan-card-name"
            onClick={() => setPicker({ section: 'dinners', itemId: item.id, field: 'adultRecipeId', category: 'dinner', preferAudience: 'adults' })}>
            {recipeMap[item.adultRecipeId]?.name ?? <em className="plan-card-unset">Pick a recipe…</em>}
          </span>
          {sideNames.length > 0 && (
            <span className="plan-card-sides-subtitle">{sideNames.join(' · ')}</span>
          )}
        </div>

        <button className={`plan-card-expand ${expanded ? 'plan-card-expand--open' : ''}`}
          onClick={() => setExpanded(e => !e)} title={expanded ? 'Collapse' : 'Edit details'}>
          <IconChevronD size={13} />
        </button>
        <MultiplierBtn value={multi}
          onChange={v => updateItem('dinners', item.id, { multiplier: v, madeCount: Math.min(made, v) })} />
        <button className="plan-card-remove" onClick={() => removeItem('dinners', item.id)}>
          <IconClose size={13} />
        </button>
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="plan-card-details">

          {/* Audience */}
          {!sameRecipe && (
            <div className="plan-card-audience-row">
              {['adults', 'everyone'].map(a => (
                <button key={a}
                  className={`audience-pill ${(item.audience ?? 'everyone') === a ? 'audience-pill--active' : ''}`}
                  onClick={() => updateItem('dinners', item.id, { audience: a })}>
                  {AUDIENCE[a].label}
                </button>
              ))}
            </div>
          )}

          {/* Sides management */}
          <div className="plan-card-sides-row">
            <span className="plan-card-sides-label">Sides</span>
            {sides.map(side => (
              <span key={side.id} className="plan-card-side-chip">
                <span className="plan-card-side-chip-name"
                  onClick={() => setPicker({ section: 'dinners', itemId: item.id, field: 'sideRecipeId', category: 'side' })}>
                  {recipeMap[side.recipeId]?.name ?? '…'}
                </span>
                <button className="plan-card-side-chip-remove"
                  onClick={() => updateItem('dinners', item.id, { sides: sides.filter(s => s.id !== side.id) })}>
                  <IconClose size={10} />
                </button>
              </span>
            ))}
            <button className="btn btn-ghost btn-sm planner-add-btn plan-card-sides-add"
              onClick={() => setPicker({ section: 'dinners', itemId: item.id, field: 'sideRecipeId', category: 'side' })}>
              <IconPlus size={12} /> Add side
            </button>
          </div>

          {/* Members */}
          {members.length > 0 && (
            <div className="plan-card-members-row">
              <MemberTags memberIds={item.memberIds ?? []} members={members}
                onChange={ids => updateItem('dinners', item.id, { memberIds: ids })} />
            </div>
          )}

          {/* Kids */}
          <div className="plan-card-kids-row">
            <AudienceBadge audience="kids" />
            {item.kidsRecipeId && !sameRecipe ? (
              <>
                <MadeToggle made={item.kidsMade}
                  onToggle={() => updateItem('dinners', item.id, { kidsMade: !item.kidsMade })} />
                <span className="plan-card-name plan-card-name--sm"
                  onClick={() => setPicker({ section: 'dinners', itemId: item.id, field: 'kidsRecipeId', category: 'dinner', preferAudience: 'kids' })}>
                  {recipeMap[item.kidsRecipeId]?.name}
                </span>
                <button className="plan-card-remove plan-card-remove--sm"
                  onClick={() => updateItem('dinners', item.id, { kidsRecipeId: null, kidsMade: false })}>
                  <IconClose size={11} />
                </button>
              </>
            ) : sameRecipe ? (
              <span className="plan-card-same-note">Same as adults</span>
            ) : (
              <button className="btn btn-ghost btn-sm planner-add-btn"
                onClick={() => setPicker({ section: 'dinners', itemId: item.id, field: 'kidsRecipeId', category: 'dinner', preferAudience: 'kids' })}>
                <IconPlus size={12} /> Add kids meal
              </button>
            )}
          </div>

          {/* Note */}
          <NoteField note={item.note || ''} onChange={v => updateItem('dinners', item.id, { note: v })} />
        </div>
      )}
    </div>
  )
}

// ─── Dinners ─────────────────────────────────────────────────────────
function DinnersSection({ plan, recipeMap, members, collapsed, toggleCollapsed, addItem, removeItem, updateItem, setPicker }) {
  const items = plan.dinners ?? []
  const totalNights = items.reduce((s, i) => s + (i.multiplier ?? 1), 0)
  const doneNights  = items.reduce((s, i) => s + (i.isDiningOut ? (i.made ? (i.multiplier ?? 1) : 0) : (i.madeCount ?? 0)), 0)

  return (
    <SectionShell
      sectionKey="dinners" icon="🍽" label="Dinners"
      count={items.length}
      collapsed={collapsed.dinners}
      onToggle={() => toggleCollapsed('dinners')}
      addActions={<>
        <button className="btn btn-ghost btn-sm planner-add-btn"
          onClick={() => setPicker({ section: 'dinners', field: 'adultRecipeId', category: 'dinner', preferAudience: 'adults' })}>
          <IconPlus size={14} /> Add dinner
        </button>
        <button className="btn btn-ghost btn-sm planner-add-btn planner-add-btn--diningout"
          onClick={() => addItem('dinners', { id: uid(), isDiningOut: true, restaurant: '', made: false, multiplier: 1, note: '', memberIds: [] })}>
          🍴 Dining out
        </button>
      </>}
    >
      {items.length > 0 && (
        <p className="planner-dinner-summary">
          {doneNights} of {totalNights} night{totalNights !== 1 ? 's' : ''} done this week
        </p>
      )}

      {items.map(item => {
        if (item.isDiningOut) {
          return <DiningOutCard key={item.id} item={item} section="dinners" members={members} removeItem={removeItem} updateItem={updateItem} />
        }
        return (
          <DinnerCard key={item.id} item={item} recipeMap={recipeMap} members={members}
            removeItem={removeItem} updateItem={updateItem} setPicker={setPicker} />
        )
      })}
    </SectionShell>
  )
}

// ─── Snacks ──────────────────────────────────────────────────────────
function SnacksSection({ plan, recipeMap, members, collapsed, toggleCollapsed, addItem, removeItem, updateItem, setPicker }) {
  const items = plan.snacks ?? []

  return (
    <SectionShell
      sectionKey="snacks" icon="🍪" label="Snacks & Bakes"
      count={items.length}
      collapsed={collapsed.snacks}
      onToggle={() => toggleCollapsed('snacks')}
      addActions={<>
        <button className="btn btn-ghost btn-sm planner-add-btn"
          onClick={() => setPicker({ section: 'snacks', field: 'recipeId', category: 'snack' })}>
          <IconPlus size={14} /> Add recipe
        </button>
        <button className="btn btn-ghost btn-sm planner-add-btn planner-add-btn--diningout"
          onClick={() => addItem('snacks', { id: uid(), isDiningOut: true, restaurant: '', made: false, multiplier: 1, note: '', memberIds: [] })}>
          🍴 Dining out
        </button>
      </>}
    >
      {items.map(item => {
        if (item.isDiningOut) {
          return <DiningOutCard key={item.id} item={item} section="snacks" members={members} removeItem={removeItem} updateItem={updateItem} />
        }
        const multi = item.multiplier ?? 1
        return (
          <div key={item.id} className={`plan-card plan-card--column ${item.made ? 'plan-card--made' : ''}`}>
            <div className="plan-card-row">
              <MadeToggle made={item.made} onToggle={() => updateItem('snacks', item.id, { made: !item.made })} />
              <div className="plan-card-body">
                <span className="plan-card-name"
                  onClick={() => setPicker({ section: 'snacks', itemId: item.id, field: 'recipeId', category: 'snack' })}>
                  {recipeMap[item.recipeId]?.name ?? <em className="plan-card-unset">Pick a recipe…</em>}
                </span>
                <div className="plan-card-meta">
                  <AudienceBadge audience={item.audience ?? 'everyone'} />
                </div>
                <NoteField note={item.note || ''} onChange={v => updateItem('snacks', item.id, { note: v })} />
              </div>
              {members.length > 0 && (
                <MemberTags memberIds={item.memberIds ?? []} members={members}
                  onChange={ids => updateItem('snacks', item.id, { memberIds: ids })} />
              )}
              <MultiplierBtn value={multi}
                onChange={v => updateItem('snacks', item.id, { multiplier: v })} />
              <button className="plan-card-remove" onClick={() => removeItem('snacks', item.id)}>
                <IconClose size={13} />
              </button>
            </div>
            <div className="plan-card-audience-row">
              {['adults', 'everyone'].map(a => (
                <button key={a}
                  className={`audience-pill ${(item.audience ?? 'everyone') === a ? 'audience-pill--active' : ''}`}
                  onClick={() => updateItem('snacks', item.id, { audience: a })}>
                  {AUDIENCE[a].label}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </SectionShell>
  )
}

// ─── Dining-out card ─────────────────────────────────────────────────
function DiningOutCard({ item, section, members, removeItem, updateItem }) {
  const multi = item.multiplier ?? 1
  return (
    <div className={`plan-card plan-card--column plan-card--dining-out ${item.made ? 'plan-card--made' : ''}`}>
      <div className="plan-card-row">
        <MadeToggle made={item.made} onToggle={() => updateItem(section, item.id, { made: !item.made })} />
        <div className="plan-card-body">
          <div className="plan-card-diningout-row">
            <span className="plan-card-diningout-icon">🍴</span>
            <input
              className="plan-card-diningout-input"
              value={item.restaurant || ''}
              onChange={e => updateItem(section, item.id, { restaurant: e.target.value })}
              placeholder="Restaurant name (optional)…"
            />
          </div>
          <NoteField note={item.note || ''} onChange={v => updateItem(section, item.id, { note: v })} />
        </div>
        {members.length > 0 && (
          <MemberTags memberIds={item.memberIds ?? []} members={members}
            onChange={ids => updateItem(section, item.id, { memberIds: ids })} />
        )}
        <MultiplierBtn value={multi} onChange={v => updateItem(section, item.id, { multiplier: v })} />
        <button className="plan-card-remove" onClick={() => removeItem(section, item.id)}>
          <IconClose size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Micro-components ────────────────────────────────────────────────
function MadeToggle({ made, onToggle }) {
  return (
    <button className={`made-toggle ${made ? 'made-toggle--done' : ''}`} onClick={onToggle}
      title={made ? 'Mark as not made' : 'Mark as made'}>
      {made && <IconCheck size={11} />}
    </button>
  )
}

function DinnerMadeToggle({ made, total, onToggle }) {
  const partial = made > 0 && made < total
  const done    = made >= total
  return (
    <button className={`made-toggle ${done ? 'made-toggle--done' : partial ? 'made-toggle--partial' : ''}`}
      onClick={onToggle} title={`${made} of ${total} nights done`}>
      {done ? <IconCheck size={11} /> : partial ? <span className="made-toggle-frac">{made}/{total}</span> : null}
    </button>
  )
}

function MultiplierBtn({ value, onChange }) {
  const cycle = [1, 2, 3]
  const next  = cycle[(cycle.indexOf(value) + 1) % cycle.length]
  return (
    <button className="multiplier-btn" onClick={() => onChange(next)}
      title="Tap to change nights / batch size">
      {value}×
    </button>
  )
}

function AudienceBadge({ audience }) {
  const cfg = AUDIENCE[audience] ?? AUDIENCE.everyone
  return (
    <span className="audience-badge" style={{ '--ab-color': cfg.color }}>
      {cfg.label}
    </span>
  )
}

// ─── Note field ──────────────────────────────────────────────────────
function NoteField({ note, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(note || '')

  function handleBlur() {
    setEditing(false)
    if (draft.trim() !== (note || '').trim()) onChange(draft.trim())
  }

  if (editing) {
    return (
      <textarea
        className="plan-card-note-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => { if (e.key === 'Escape') { setDraft(note || ''); setEditing(false) } }}
        autoFocus
        rows={2}
        placeholder="Add a note…"
      />
    )
  }

  if (note) {
    return (
      <p className="plan-card-note" onClick={() => { setDraft(note); setEditing(true) }}>
        {note}
      </p>
    )
  }

  return (
    <button className="plan-card-note-add" onClick={() => { setDraft(''); setEditing(true) }}>
      + note
    </button>
  )
}

// ─── Member tags ────────────────────────────────────────────────────
function MemberTags({ memberIds, members, onChange }) {
  function toggle(id) {
    onChange(memberIds.includes(id) ? memberIds.filter(x => x !== id) : [...memberIds, id])
  }
  return (
    <div className="member-tags">
      {members.map(m => (
        <button key={m.id}
          className={`member-tag ${memberIds.includes(m.id) ? 'member-tag--active' : ''}`}
          style={{ '--mc': m.color }}
          title={m.name}
          onClick={() => toggle(m.id)}>
          {m.name[0].toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// ─── Recipe Picker ───────────────────────────────────────────────────
function RecipePicker({ recipes, category, preferAudience, currentId, onSelect, onClose }) {
  const [search, setSearch] = useState('')

  // Sort: preferred category first, then preferred audience, then rest
  const sorted = [...recipes].sort((a, b) => {
    const aCat = a.category === category ? 0 : 1
    const bCat = b.category === category ? 0 : 1
    if (aCat !== bCat) return aCat - bCat
    if (preferAudience) {
      const aAud = (a.audience === preferAudience || a.audience === 'everyone') ? 0 : 1
      const bAud = (b.audience === preferAudience || b.audience === 'everyone') ? 0 : 1
      if (aAud !== bAud) return aAud - bAud
    }
    return a.name.localeCompare(b.name)
  })

  const filtered = sorted.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <span className="picker-title">Choose a recipe</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0 8px' }}>
            <IconClose size={16} />
          </button>
        </div>

        <div className="picker-search-wrap">
          <IconSearch size={14} className="picker-search-icon" />
          <input className="input picker-search" placeholder="Search…" value={search}
            onChange={e => setSearch(e.target.value)} autoFocus />
        </div>

        <div className="picker-list">
          {filtered.length === 0 ? (
            <p className="picker-empty">No recipes found.</p>
          ) : (
            filtered.map(recipe => {
              const meta     = getCategoryMeta(recipe.category)
              const isActive = recipe.id === currentId
              return (
                <button key={recipe.id}
                  className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                  onClick={() => onSelect(recipe.id)}>
                  <span className="picker-item-dot" style={{ background: meta.color }} />
                  <span className="picker-item-name">{recipe.name}</span>
                  <span className="picker-item-cat">{meta.label}</span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
