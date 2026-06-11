import { useState, useEffect, useCallback } from 'react'
import { useUser } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import { getMealPlan, saveMealPlan, getRecipes, getHouseholdMembers } from '../lib/supabase'
import { RecipeSlideOver } from '../components/RecipePanel'
import { getCategoryMeta } from '../lib/categories'
import { getWeekKey, shiftWeek, formatWeekRange, getWeekDates, DAY_LABELS } from '../lib/weeks'
import {
  IconChevronL, IconChevronR, IconChevronD, IconPlus, IconClose, IconCheck, IconSearch, IconShare,
} from '../components/icons'
import './Planner.css'

const EMPTY_PLAN = { notes: [], breakfasts: [], lunches: [], dinners: [], snacks: [], beverages: [] }

function uid() { return Math.random().toString(36).slice(2, 9) }

// ─── Drag-to-reorder hook ─────────────────────────────────────────────────────
function useDragOrder(items, sectionKey, plan, updatePlan) {
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)

  function getDragProps(i) {
    return {
      draggable: true,
      className: [
        'plan-drag-row',
        dragIdx === i               ? 'plan-drag-row--dragging' : '',
        overIdx === i && dragIdx !== i ? 'plan-drag-row--over'    : '',
      ].filter(Boolean).join(' '),
      onDragStart: e => { e.dataTransfer.effectAllowed = 'move'; setDragIdx(i) },
      onDragOver:  e => { e.preventDefault(); if (i !== overIdx) setOverIdx(i) },
      onDragEnd:   ()  => { setDragIdx(null); setOverIdx(null) },
      onDrop:      e  => {
        e.preventDefault()
        if (dragIdx !== null && dragIdx !== i) {
          const next = [...items]
          const [moved] = next.splice(dragIdx, 1)
          next.splice(i, 0, moved)
          updatePlan({ ...plan, [sectionKey]: next })
        }
        setDragIdx(null); setOverIdx(null)
      },
    }
  }

  return { getDragProps }
}

// ─── Share helper ─────────────────────────────────────────────────────────────
function generateShareText(plan, recipeMap, weekKey) {
  const lines = [`HomePlate · ${formatWeekOf(weekKey)}`, '']
  const sections = [
    { key: 'dinners',    emoji: '🍽', label: 'Dinners' },
    { key: 'lunches',    emoji: '🥗', label: 'Lunches' },
    { key: 'breakfasts', emoji: '🍳', label: 'Breakfasts' },
    { key: 'snacks',     emoji: '🍪', label: 'Snacks & Bakes' },
    { key: 'beverages',  emoji: '🥤', label: 'Beverages' },
  ]
  sections.forEach(({ key, emoji, label }) => {
    const items = plan[key] ?? []
    if (!items.length) return
    lines.push(`${emoji} ${label}`)
    items.forEach(item => {
      if (item.isDiningOut) {
        lines.push(`- 🍴 Dining out${item.restaurant ? ` — ${item.restaurant}` : ''}`)
      } else if (item.isPantry) {
        lines.push(`- Pantry${item.name ? ` — ${item.name}` : ''}`)
      } else {
        const name = key === 'dinners'
          ? recipeMap[item.adultRecipeId]?.name ?? '(recipe)'
          : recipeMap[item.recipeId]?.name ?? '(recipe)'
        const sides = (item.sides ?? []).map(s => recipeMap[s.recipeId]?.name).filter(Boolean)
        lines.push(`- ${name}${sides.length ? ` + ${sides.join(', ')}` : ''}`)
      }
    })
    lines.push('')
  })
  return lines.join('\n').trim()
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PlannerPage() {
  const user     = useUser()
  const navigate = useNavigate()
  const [weekKey, setWeekKey] = useState(() => getWeekKey())
  const [plan, setPlan]       = useState(EMPTY_PLAN)
  const [recipes,         setRecipes]         = useState([])
  const [approvalMembers, setApprovalMembers] = useState([])
  const [loading,         setLoading]         = useState(true)
  const [viewRecipe,      setViewRecipe]       = useState(null)
  const [viewPanelOpen,   setViewPanelOpen]    = useState(false)
  const [collapsed, setCollapsed] = useState({})
  const [picker, setPicker]   = useState(null)
  const [shared, setShared]   = useState(false)

  useEffect(() => {
    if (!user) return
    getRecipes(user.id).then(({ data: r }) => setRecipes(r || []))
    getHouseholdMembers(user.id).then(({ data }) =>
      setApprovalMembers((data ?? []).filter(m => m.meal_approval))
    )
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
  function toggleCollapsed(key) { setCollapsed(c => ({ ...c, [key]: !c[key] })) }

  async function handleShare() {
    const text = generateShareText(plan, recipeMap, weekKey)
    try {
      if (navigator.share) { await navigator.share({ text }) }
      else { await navigator.clipboard.writeText(text) }
    } catch { await navigator.clipboard.writeText(text).catch(() => {}) }
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  function handlePick(recipeId) {
    const { section, itemId, field } = picker
    if (itemId && field === 'sideRecipeId') {
      const dinner  = plan.dinners.find(i => i.id === itemId)
      const newSide = { id: uid(), recipeId, made: false }
      updateItem('dinners', itemId, { sides: [...(dinner?.sides ?? []), newSide] })
    } else if (itemId) {
      updateItem(section, itemId, { [field]: recipeId })
    } else {
      if (section === 'breakfasts') {
        addItem('breakfasts', { id: uid(), recipeId, isPantry: false, made: false, multiplier: 1, kidsRecipeId: null, kidsMade: false, memberIds: [], note: '' })
      } else if (section === 'lunches') {
        addItem('lunches', { id: uid(), recipeId, isPantry: false, made: false, multiplier: 1, kidsRecipeId: null, memberIds: [], note: '' })
      } else if (section === 'dinners' && field === 'adultRecipeId') {
        addItem('dinners', { id: uid(), adultRecipeId: recipeId, multiplier: 1, madeCount: 0, kidsRecipeId: null, kidsMade: false, sides: [], memberIds: [], note: '' })
      } else if (section === 'snacks') {
        addItem('snacks', { id: uid(), recipeId, made: false, multiplier: 1, memberIds: [], note: '' })
      } else if (section === 'beverages') {
        addItem('beverages', { id: uid(), recipeId, made: false, multiplier: 1, memberIds: [], note: '' })
      }
    }
    setPicker(null)
  }

  function openRecipeView(recipe) {
    setViewRecipe(recipe)
    requestAnimationFrame(() => setViewPanelOpen(true))
  }
  function closeRecipeView() {
    setViewPanelOpen(false)
    setTimeout(() => setViewRecipe(null), 300)
  }

  const sharedProps = { plan, recipeMap, recipes, collapsed, toggleCollapsed, addItem, removeItem, updateItem, setPicker, updatePlan, approvalMembers, openRecipeView, weekKey }

  return (
    <div className="page planner-page">

      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="page-hero-top">
          <span className="t-eyebrow" style={{ color: 'var(--ink-400)' }}>Planner</span>
          <div className="week-nav">
            <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setWeekKey(k => shiftWeek(k, -1))}>
              <IconChevronL size={16} />
            </button>
            <span className="week-nav-label">{formatWeekRange(weekKey)}</span>
            <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setWeekKey(k => shiftWeek(k, 1))}>
              <IconChevronR size={16} />
            </button>
            {weekKey !== getWeekKey() && (
              <button className="btn btn-ghost btn-sm week-nav-today" onClick={() => setWeekKey(getWeekKey())}>
                This week
              </button>
            )}
          </div>
        </div>
        <h1 className="page-hero-title">This week.</h1>
      </div>

      {loading ? (
        <div className="page-placeholder"><p>Loading…</p></div>
      ) : (
        <div className="planner-sections">
          <NotableThisWeekSection plan={plan} updatePlan={updatePlan} />
          <DinnersSection    {...sharedProps} />
          <div className="planner-sections-grid">
            <LunchesSection    {...sharedProps} />
            <BreakfastsSection {...sharedProps} />
          </div>
          <div className="planner-sections-grid">
            <SnacksSection     {...sharedProps} />
            <BeveragesSection  {...sharedProps} />
          </div>
        </div>
      )}

      {picker && (
        <RecipePicker
          recipes={recipes}
          approvalMembers={approvalMembers}
          category={picker.category}
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

      {/* Recipe slide-over panel */}
      <RecipeSlideOver
        recipe={viewRecipe}
        approvalMembers={approvalMembers}
        onClose={closeRecipeView}
        onEdit={viewRecipe ? () => { closeRecipeView(); navigate(`/recipes/${viewRecipe.id}/edit`) } : undefined}
        onOpenFull={viewRecipe ? () => { closeRecipeView(); navigate(`/recipes/${viewRecipe.id}`) } : undefined}
      />
    </div>
  )
}

// ─── Notable This Week ────────────────────────────────────────────────────────
function NotableThisWeekSection({ plan, updatePlan }) {
  const notes  = plan.notes ?? []
  const [adding, setAdding] = useState(false)
  const [draft, setDraft]   = useState('')

  function commitAdd() {
    if (draft.trim()) {
      updatePlan({ ...plan, notes: [...notes, { id: uid(), text: draft.trim() }] })
    }
    setDraft('')
    setAdding(false)
  }

  function editNote(id, text) {
    if (!text.trim()) {
      updatePlan({ ...plan, notes: notes.filter(n => n.id !== id) })
    } else {
      updatePlan({ ...plan, notes: notes.map(n => n.id === id ? { ...n, text } : n) })
    }
  }

  function deleteNote(id) {
    updatePlan({ ...plan, notes: notes.filter(n => n.id !== id) })
  }

  return (
    <div className="planner-section">
      <div className="planner-section-header planner-section-header--flat">
        <span className="planner-section-title">Notable This Week</span>
        <button type="button" className="planner-notable-add-btn"
          onClick={() => setAdding(true)}>
          + Add note
        </button>
      </div>
      <div className="planner-notable-body">
        {notes.map(note => (
          <NotableNoteItem key={note.id} note={note}
            onEdit={text => editNote(note.id, text)}
            onDelete={() => deleteNote(note.id)} />
        ))}
        {adding && (
          <div className="planner-notable-row">
            <span className="planner-notable-bullet">◦</span>
            <input className="planner-notable-input" autoFocus
              value={draft} onChange={e => setDraft(e.target.value)}
              placeholder="Add a note for this week…"
              onKeyDown={e => {
                if (e.key === 'Enter') commitAdd()
                if (e.key === 'Escape') { setAdding(false); setDraft('') }
              }}
              onBlur={commitAdd} />
          </div>
        )}
        {notes.length === 0 && !adding && (
          <p className="planner-notable-empty">Nothing noted — add context for the week here.</p>
        )}
      </div>
    </div>
  )
}

function NotableNoteItem({ note, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(note.text)

  if (editing) {
    return (
      <div className="planner-notable-row">
        <span className="planner-notable-bullet">◦</span>
        <input className="planner-notable-input" autoFocus
          value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter')     { onEdit(draft); setEditing(false) }
            if (e.key === 'Escape')    { setDraft(note.text); setEditing(false) }
            if (e.key === 'Backspace' && draft === '') { onDelete(); setEditing(false) }
          }}
          onBlur={() => { onEdit(draft); setEditing(false) }} />
        <button className="planner-notable-delete" onClick={onDelete}>
          <IconClose size={12} />
        </button>
      </div>
    )
  }

  return (
    <div className="planner-notable-row" onClick={() => { setDraft(note.text); setEditing(true) }}>
      <span className="planner-notable-bullet">◦</span>
      <span className="planner-notable-text">{note.text}</span>
    </div>
  )
}

// ─── Section shell ────────────────────────────────────────────────────────────
function SectionShell({ label, totalCount, madeCount, diningOutCount, collapsed, onToggle, children, addActions, headerActions }) {
  const madeLabel = madeCount > 0 ? `${madeCount}/${totalCount} made` : totalCount > 0 ? `${totalCount} planned` : null
  return (
    <div className="planner-section">
      <div className="planner-section-header-wrap">
        <button className="planner-section-header" onClick={onToggle}>
          <span className="planner-section-title">{label}</span>
          <div className="planner-section-badges">
            {diningOutCount > 0 && (
              <span className="planner-section-badge planner-section-badge--out">{diningOutCount}× out</span>
            )}
            {madeLabel && (
              <span className="planner-section-badge planner-section-badge--made">{madeLabel}</span>
            )}
          </div>
          <IconChevronD size={14}
            className={`planner-section-chevron${collapsed ? '' : ' planner-section-chevron--open'}`} />
        </button>
        {headerActions && (
          <div className="planner-section-header-actions" onClick={e => e.stopPropagation()}>
            {headerActions}
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="planner-section-body">
          {children}
          {addActions && <div className="planner-add-row">{addActions}</div>}
        </div>
      )}
    </div>
  )
}

// ─── Shared add-row actions ───────────────────────────────────────────────────
function AddActions({ onRecipe, onPantry, onDiningOut }) {
  return (
    <>
      <button className="btn btn-ghost btn-sm planner-add-btn" onClick={onRecipe}>
        <IconPlus size={13} /> Recipe
      </button>
      <button className="btn btn-ghost btn-sm planner-add-btn" onClick={onPantry}>
        <IconPlus size={13} /> Pantry Item
      </button>
      <button className="btn btn-ghost btn-sm planner-add-btn planner-add-btn--diningout" onClick={onDiningOut}>
        <IconPlus size={13} /> Dining out
      </button>
    </>
  )
}

// ─── Dinners ──────────────────────────────────────────────────────────────────
function DinnersSection({ plan, recipeMap, collapsed, toggleCollapsed, addItem, removeItem, updateItem, setPicker, updatePlan, approvalMembers = [], openRecipeView, weekKey }) {
  const items        = plan.dinners ?? []
  const totalNights  = items.reduce((s, i) => s + (i.multiplier ?? 1), 0)
  const doneNights   = items.reduce((s, i) => s + (i.isDiningOut ? (i.made ? (i.multiplier ?? 1) : 0) : (i.madeCount ?? 0)), 0)
  const diningOutCnt = items.filter(i => i.isDiningOut).length
  const [sortByDay, setSortByDay] = useState(false)
  const { getDragProps } = useDragOrder(items, 'dinners', plan, updatePlan)

  const displayItems = sortByDay
    ? [...items].sort((a, b) => {
        const da = a.day ?? 99; const db = b.day ?? 99
        return da - db
      })
    : items

  return (
    <SectionShell label="Dinners"
      totalCount={totalNights} madeCount={doneNights} diningOutCount={diningOutCnt}
      collapsed={collapsed.dinners} onToggle={() => toggleCollapsed('dinners')}
      headerActions={
        items.some(i => i.day != null) || sortByDay ? (
          <button
            className={`planner-sort-day-btn${sortByDay ? ' planner-sort-day-btn--on' : ''}`}
            onClick={() => setSortByDay(v => !v)}
            title={sortByDay ? 'Stop sorting by day' : 'Sort by scheduled day'}
          >
            {sortByDay ? '↕ By day' : '↕ By day'}
          </button>
        ) : null
      }
      addActions={
        <AddActions
          onRecipe={() => setPicker({ section: 'dinners', field: 'adultRecipeId', category: 'dinner' })}
          onPantry={() => addItem('dinners', { id: uid(), isPantry: true, name: '', multiplier: 1, madeCount: 0, sides: [], note: '' })}
          onDiningOut={() => addItem('dinners', { id: uid(), isDiningOut: true, restaurant: '', made: false, multiplier: 1, note: '' })}
        />
      }>
      {displayItems.map((item, i) => (
        <div key={item.id} {...(!sortByDay ? getDragProps(i) : { className: 'plan-drag-row' })}>
          {item.isDiningOut
            ? <DiningOutCard item={item} section="dinners" removeItem={removeItem} updateItem={updateItem} weekKey={weekKey} />
            : item.isPantry
              ? <GenericMealItem item={item} section="dinners" category="dinner" recipeMap={recipeMap} removeItem={removeItem} updateItem={updateItem} setPicker={setPicker} approvalMembers={approvalMembers} openRecipeView={openRecipeView} weekKey={weekKey} />
              : <DinnerCard item={item} recipeMap={recipeMap} removeItem={removeItem} updateItem={updateItem} setPicker={setPicker} approvalMembers={approvalMembers} openRecipeView={openRecipeView} weekKey={weekKey} />}
        </div>
      ))}
    </SectionShell>
  )
}

// ─── Breakfasts ───────────────────────────────────────────────────────────────
function BreakfastsSection({ plan, recipeMap, collapsed, toggleCollapsed, addItem, removeItem, updateItem, setPicker, updatePlan, approvalMembers = [], openRecipeView, weekKey }) {
  const items        = plan.breakfasts ?? []
  const diningOutCnt = items.filter(i => i.isDiningOut).length
  const [sortByDay, setSortByDay] = useState(false)
  const { getDragProps } = useDragOrder(items, 'breakfasts', plan, updatePlan)

  const displayItems = sortByDay
    ? [...items].sort((a, b) => (a.day ?? 99) - (b.day ?? 99))
    : items

  return (
    <SectionShell label="Breakfasts"
      totalCount={items.length} madeCount={items.filter(i => i.made).length} diningOutCount={diningOutCnt}
      collapsed={collapsed.breakfasts} onToggle={() => toggleCollapsed('breakfasts')}
      headerActions={
        items.some(i => i.day != null) || sortByDay ? (
          <button className={`planner-sort-day-btn${sortByDay ? ' planner-sort-day-btn--on' : ''}`}
            onClick={() => setSortByDay(v => !v)}>↕ By day</button>
        ) : null
      }
      addActions={
        <AddActions
          onRecipe={() => setPicker({ section: 'breakfasts', field: 'recipeId', category: 'breakfast' })}
          onPantry={() => addItem('breakfasts', { id: uid(), isPantry: true, name: '', made: false, multiplier: 1, note: '' })}
          onDiningOut={() => addItem('breakfasts', { id: uid(), isDiningOut: true, restaurant: '', made: false, multiplier: 1, note: '' })}
        />
      }>
      {displayItems.map((item, i) => (
        <div key={item.id} {...(!sortByDay ? getDragProps(i) : { className: 'plan-drag-row' })}>
          {item.isDiningOut
            ? <DiningOutCard item={item} section="breakfasts" removeItem={removeItem} updateItem={updateItem} weekKey={weekKey} />
            : <GenericMealItem item={item} section="breakfasts" category="breakfast" recipeMap={recipeMap} removeItem={removeItem} updateItem={updateItem} setPicker={setPicker} approvalMembers={approvalMembers} openRecipeView={openRecipeView} weekKey={weekKey} />}
        </div>
      ))}
    </SectionShell>
  )
}

// ─── Lunches ──────────────────────────────────────────────────────────────────
function LunchesSection({ plan, recipeMap, collapsed, toggleCollapsed, addItem, removeItem, updateItem, setPicker, updatePlan, approvalMembers = [], openRecipeView, weekKey }) {
  const items        = plan.lunches ?? []
  const diningOutCnt = items.filter(i => i.isDiningOut).length
  const [sortByDay, setSortByDay] = useState(false)
  const { getDragProps } = useDragOrder(items, 'lunches', plan, updatePlan)

  const displayItems = sortByDay
    ? [...items].sort((a, b) => (a.day ?? 99) - (b.day ?? 99))
    : items

  return (
    <SectionShell label="Lunches"
      totalCount={items.length} madeCount={items.filter(i => i.made).length} diningOutCount={diningOutCnt}
      collapsed={collapsed.lunches} onToggle={() => toggleCollapsed('lunches')}
      headerActions={
        items.some(i => i.day != null) || sortByDay ? (
          <button className={`planner-sort-day-btn${sortByDay ? ' planner-sort-day-btn--on' : ''}`}
            onClick={() => setSortByDay(v => !v)}>↕ By day</button>
        ) : null
      }
      addActions={
        <AddActions
          onRecipe={() => setPicker({ section: 'lunches', field: 'recipeId', category: 'lunch' })}
          onPantry={() => addItem('lunches', { id: uid(), isPantry: true, name: '', made: false, multiplier: 1, note: '' })}
          onDiningOut={() => addItem('lunches', { id: uid(), isDiningOut: true, restaurant: '', made: false, multiplier: 1, note: '' })}
        />
      }>
      {displayItems.map((item, i) => (
        <div key={item.id} {...(!sortByDay ? getDragProps(i) : { className: 'plan-drag-row' })}>
          {item.isDiningOut
            ? <DiningOutCard item={item} section="lunches" removeItem={removeItem} updateItem={updateItem} weekKey={weekKey} />
            : <GenericMealItem item={item} section="lunches" category="lunch" recipeMap={recipeMap} removeItem={removeItem} updateItem={updateItem} setPicker={setPicker} approvalMembers={approvalMembers} openRecipeView={openRecipeView} weekKey={weekKey} />}
        </div>
      ))}
    </SectionShell>
  )
}

// ─── Snacks & Bakes ───────────────────────────────────────────────────────────
function SnacksSection({ plan, recipeMap, collapsed, toggleCollapsed, addItem, removeItem, updateItem, setPicker, updatePlan, approvalMembers = [], openRecipeView }) {
  const items        = plan.snacks ?? []
  const { getDragProps } = useDragOrder(items, 'snacks', plan, updatePlan)

  return (
    <SectionShell label="Snacks & Bakes"
      totalCount={items.length} madeCount={items.filter(i => i.made).length} diningOutCount={0}
      collapsed={collapsed.snacks} onToggle={() => toggleCollapsed('snacks')}
      addActions={
        <button className="btn btn-ghost btn-sm planner-add-btn"
          onClick={() => setPicker({ section: 'snacks', field: 'recipeId', category: 'snack' })}>
          <IconPlus size={13} /> Recipe
        </button>
      }>
      {items.map((item, i) => (
        <div key={item.id} {...getDragProps(i)}>
          <GenericMealItem item={item} section="snacks" category="snack" recipeMap={recipeMap} removeItem={removeItem} updateItem={updateItem} setPicker={setPicker} approvalMembers={approvalMembers} openRecipeView={openRecipeView} />
        </div>
      ))}
    </SectionShell>
  )
}

// ─── Beverages ────────────────────────────────────────────────────────────────
function BeveragesSection({ plan, recipeMap, collapsed, toggleCollapsed, addItem, removeItem, updateItem, setPicker, updatePlan, approvalMembers = [], openRecipeView }) {
  const items        = plan.beverages ?? []
  const { getDragProps } = useDragOrder(items, 'beverages', plan, updatePlan)

  return (
    <SectionShell label="Beverages"
      totalCount={items.length} madeCount={items.filter(i => i.made).length} diningOutCount={0}
      collapsed={collapsed.beverages} onToggle={() => toggleCollapsed('beverages')}
      addActions={
        <button className="btn btn-ghost btn-sm planner-add-btn"
          onClick={() => setPicker({ section: 'beverages', field: 'recipeId', category: 'beverage' })}>
          <IconPlus size={13} /> Recipe
        </button>
      }>
      {items.map((item, i) => (
        <div key={item.id} {...getDragProps(i)}>
          <GenericMealItem item={item} section="beverages" category="beverage" recipeMap={recipeMap} removeItem={removeItem} updateItem={updateItem} setPicker={setPicker} approvalMembers={approvalMembers} openRecipeView={openRecipeView} />
        </div>
      ))}
    </SectionShell>
  )
}

// ─── Dinner card ──────────────────────────────────────────────────────────────
function DinnerCard({ item, recipeMap, removeItem, updateItem, setPicker, approvalMembers = [], openRecipeView, weekKey }) {
  const [expanded, setExpanded] = useState(false)

  const recipe   = recipeMap[item.adultRecipeId]
  const multi    = item.multiplier ?? 1
  const made     = item.madeCount ?? 0
  const fullDone = made >= multi
  const sides    = item.sides ?? []
  const approvedBy = approvalMembers.filter(m => (recipe?.approved_by ?? []).includes(m.id))

  return (
    <div className={`plan-card plan-card--column${fullDone ? ' plan-card--made' : ''}`}>

      {/* Main row — click anywhere to expand/collapse */}
      <div className="plan-card-row" onClick={() => setExpanded(v => !v)} style={{ cursor: 'pointer' }}>
        <span className="plan-card-drag" aria-hidden="true">⠿</span>
        <span onClick={e => e.stopPropagation()}>
          <DinnerMadeToggle made={made} total={multi}
            onToggle={() => updateItem('dinners', item.id, { madeCount: made >= multi ? 0 : made + 1 })} />
        </span>

        <div className="plan-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="plan-card-name"
              onClick={e => { e.stopPropagation(); recipe
                ? openRecipeView(recipe)
                : setPicker({ section: 'dinners', itemId: item.id, field: 'adultRecipeId', category: 'dinner' })
              }}>
              {recipe?.name ?? <em className="plan-card-unset">Pick a recipe…</em>}
            </span>
            {recipe && (
              <button className="plan-card-remove plan-card-remove--sm"
                title="Change recipe"
                onClick={e => { e.stopPropagation(); setPicker({ section: 'dinners', itemId: item.id, field: 'adultRecipeId', category: 'dinner' }) }}
                style={{ opacity: 0.45, fontSize: 13, flexShrink: 0 }}>
                ↺
              </button>
            )}
          </div>
          {/* Collapsed inline side list */}
          {!expanded && sides.length > 0 && (
            <span className="plan-card-sides-inline-label">
              {sides.map(s => s.isPantry ? (s.name || 'Pantry item') : recipeMap[s.recipeId]?.name).filter(Boolean).map((n, i) => (
                <span key={i}>· {n} </span>
              ))}
            </span>
          )}
        </div>

        {approvedBy.map(m => (
          <span key={m.id} className="plan-card-approval" style={{ background: m.color + '22', color: m.color }}>{m.name} ✓</span>
        ))}

        <span onClick={e => e.stopPropagation()}>
          <DayPickerPill day={item.day ?? null} weekKey={weekKey}
            onChange={day => updateItem('dinners', item.id, { day })} />
        </span>

        <button className={`plan-card-expand${expanded ? ' plan-card-expand--open' : ''}`}
          onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}>
          <IconChevronD size={14} />
        </button>
        <button className="plan-card-remove" onClick={e => { e.stopPropagation(); removeItem('dinners', item.id) }}>
          <IconClose size={13} />
        </button>
      </div>

      {/* Expanded: individual side rows + add buttons */}
      {expanded && (
        <>
          {sides.map(side => {
            const sideRecipe = !side.isPantry ? recipeMap[side.recipeId] : null
            return (
              <div key={side.id} className="plan-card-row plan-card-side-row">
                <span className="plan-card-side-indent" />
                <MadeToggle made={side.made ?? false}
                  onToggle={() => updateItem('dinners', item.id, {
                    sides: sides.map(s => s.id === side.id ? { ...s, made: !s.made } : s)
                  })} />
                {side.isPantry && <span className="plan-card-type plan-card-type--pantry">Pantry</span>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
                  {side.isPantry ? (
                    <input
                      className="plan-card-pantry-input"
                      value={side.name || ''}
                      placeholder="What pantry item?"
                      onChange={e => updateItem('dinners', item.id, {
                        sides: sides.map(s => s.id === side.id ? { ...s, name: e.target.value } : s)
                      })}
                    />
                  ) : (
                    <>
                      <span className="plan-card-side-name"
                        onClick={() => sideRecipe
                          ? openRecipeView(sideRecipe)
                          : setPicker({ section: 'dinners', itemId: item.id, field: 'sideRecipeId', category: 'side' })
                        }>
                        {sideRecipe?.name ?? <em className="plan-card-unset">Pick a side…</em>}
                      </span>
                      {sideRecipe && (
                        <button className="plan-card-remove plan-card-remove--sm"
                          title="Change side"
                          onClick={() => setPicker({ section: 'dinners', itemId: item.id, field: 'sideRecipeId', category: 'side' })}
                          style={{ opacity: 0.45, fontSize: 13, flexShrink: 0 }}>
                          ↺
                        </button>
                      )}
                    </>
                  )}
                </div>
                {sideRecipe && approvalMembers.filter(m => (sideRecipe.approved_by ?? []).includes(m.id)).map(m => (
                  <span key={m.id} className="plan-card-approval" style={{ background: m.color + '22', color: m.color }}>{m.name} ✓</span>
                ))}
                <button className="plan-card-remove plan-card-remove--sm"
                  onClick={() => updateItem('dinners', item.id, { sides: sides.filter(s => s.id !== side.id) })}>
                  <IconClose size={11} />
                </button>
              </div>
            )
          })}
          <div className="plan-card-add-side-row">
            <button type="button" className="btn btn-ghost btn-sm planner-add-btn planner-add-btn--sm"
              onClick={() => setPicker({ section: 'dinners', itemId: item.id, field: 'sideRecipeId', category: 'side' })}>
              <IconPlus size={12} /> Add side
            </button>
            <button type="button" className="btn btn-ghost btn-sm planner-add-btn planner-add-btn--sm planner-add-btn--muted"
              onClick={() => updateItem('dinners', item.id, { sides: [...sides, { id: uid(), isPantry: true, name: '', made: false }] })}>
              <IconPlus size={12} /> Pantry
            </button>
          </div>
        </>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="plan-card-details">
          {multi > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Nights</span>
              <MultiplierBtns value={multi} onChange={v => updateItem('dinners', item.id, { multiplier: v })} />
            </div>
          )}

          <NoteField note={item.note || ''} onChange={v => updateItem('dinners', item.id, { note: v })} />
        </div>
      )}
    </div>
  )
}

// ─── Generic meal item (Breakfasts / Lunches / Snacks / Beverages) ────────────
function GenericMealItem({ item, section, category, recipeMap, removeItem, updateItem, setPicker, approvalMembers = [], openRecipeView, weekKey }) {
  const [expanded, setExpanded] = useState(false)
  const [hov, setHov] = useState(false)

  const isPantry   = !!item.isPantry
  const recipe     = !isPantry ? recipeMap[item.recipeId] : null
  const approvedBy = approvalMembers.filter(m => (recipe?.approved_by ?? []).includes(m.id))

  return (
    <div className={`plan-card${item.made ? ' plan-card--made' : ''}`}>
      <div className="plan-card-row"
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>

        <span className="plan-card-drag" aria-hidden="true">⠿</span>
        <MadeToggle made={item.made} onToggle={() => updateItem(section, item.id, { made: !item.made })} />

        {isPantry && <span className="plan-card-type plan-card-type--pantry">Pantry</span>}

        <div style={{ flex: 1, minWidth: 0 }}>
          {isPantry ? (
            <input
              className="plan-card-pantry-input plan-card-pantry-input--main"
              value={item.name || ''}
              placeholder="What pantry item?"
              onChange={e => updateItem(section, item.id, { name: e.target.value })}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="plan-card-name"
                onClick={() => recipe
                  ? openRecipeView(recipe)
                  : setPicker({ section, itemId: item.id, field: 'recipeId', category })
                }>
                {recipe?.name ?? <em className="plan-card-unset">Pick a recipe…</em>}
              </span>
              {recipe && (
                <button className="plan-card-remove plan-card-remove--sm"
                  title="Change recipe"
                  onClick={() => setPicker({ section, itemId: item.id, field: 'recipeId', category })}
                  style={{ opacity: 0.45, fontSize: 13, flexShrink: 0 }}>
                  ↺
                </button>
              )}
            </div>
          )}
        </div>

        {approvedBy.map(m => (
          <span key={m.id} className="plan-card-approval" style={{ background: m.color + '22', color: m.color }}>{m.name} ✓</span>
        ))}

        <DayPickerPill day={item.day ?? null} weekKey={weekKey}
          onChange={day => updateItem(section, item.id, { day })} />

        <button className={`plan-card-expand${expanded ? ' plan-card-expand--open' : ''}`}
          onClick={() => setExpanded(e => !e)}
          style={{ opacity: hov || expanded || item.kidsRecipeId ? 1 : 0, transition: 'opacity 0.15s' }}>
          <IconChevronD size={13} />
        </button>

        <button className="plan-card-remove"
          style={{ opacity: hov ? 1 : 0, transition: 'opacity 0.15s' }}
          onClick={() => removeItem(section, item.id)}>
          <IconClose size={13} />
        </button>
      </div>

      {expanded && (
        <div className="plan-card-details">
          <NoteField note={item.note || ''} onChange={v => updateItem(section, item.id, { note: v })} />
        </div>
      )}
    </div>
  )
}

// ─── Dining-out card ──────────────────────────────────────────────────────────
function DiningOutCard({ item, section, removeItem, updateItem, weekKey }) {
  return (
    <div className={`plan-card${item.made ? ' plan-card--made' : ''}`}>
      <div className="plan-card-row">
        <span className="plan-card-drag" aria-hidden="true">⠿</span>
        <MadeToggle made={item.made} onToggle={() => updateItem(section, item.id, { made: !item.made })} />
        <span className="plan-card-type plan-card-type--out">Out</span>
        <input
          className="plan-card-diningout-input"
          value={item.restaurant || ''}
          onChange={e => updateItem(section, item.id, { restaurant: e.target.value })}
          placeholder="Restaurant name…"
        />
        <DayPickerPill day={item.day ?? null} weekKey={weekKey}
          onChange={day => updateItem(section, item.id, { day })} />
        <button className="plan-card-remove" onClick={() => removeItem(section, item.id)}>
          <IconClose size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Day picker pill ──────────────────────────────────────────────────────────
function DayPickerPill({ day, weekKey, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const dates = weekKey ? getWeekDates(weekKey) : []

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const hasDay = day != null
  const label  = hasDay ? DAY_LABELS[day] : '—'

  return (
    <div ref={ref} className="plan-day-picker">
      <button
        className={`plan-day-pill${hasDay ? ' plan-day-pill--set' : ''}`}
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        title={hasDay ? `Scheduled: ${DAY_LABELS[day]}` : 'Assign a day'}
      >
        {label}
      </button>

      {open && (
        <div className="plan-day-dropdown">
          <div className="plan-day-dropdown-label">Schedule for</div>
          {dates.map((date, i) => {
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            const active  = day === i
            return (
              <button
                key={i}
                className={`plan-day-option${active ? ' plan-day-option--active' : ''}`}
                onClick={e => { e.stopPropagation(); onChange(active ? null : i); setOpen(false) }}
              >
                <span className="plan-day-option-name">{DAY_LABELS[i]}</span>
                <span className="plan-day-option-date">{dateStr}</span>
                {active && <span className="plan-day-option-check">✓</span>}
              </button>
            )
          })}
          {hasDay && (
            <button
              className="plan-day-option plan-day-option--clear"
              onClick={e => { e.stopPropagation(); onChange(null); setOpen(false) }}
            >
              Clear day
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Micro-components ─────────────────────────────────────────────────────────
function MadeToggle({ made, onToggle }) {
  return (
    <button className={`made-toggle${made ? ' made-toggle--done' : ''}`} onClick={onToggle}
      title={made ? 'Mark as not made' : 'Mark as made'}>
      {made && <IconCheck size={10} />}
    </button>
  )
}

function DinnerMadeToggle({ made, total, onToggle }) {
  const partial = made > 0 && made < total
  const done    = made >= total
  return (
    <button className={`made-toggle${done ? ' made-toggle--done' : partial ? ' made-toggle--partial' : ''}`}
      onClick={onToggle} title={`${made} of ${total} nights done`}>
      {done    ? <IconCheck size={10} /> : null}
      {partial ? <span className="made-toggle-frac">{made}/{total}</span> : null}
    </button>
  )
}

function MultiplierBtns({ value, onChange }) {
  return (
    <div className="multiplier-btns">
      {[1, 2, 3].map(n => (
        <button key={n} className={`multiplier-btn${value === n ? ' multiplier-btn--on' : ''}`}
          onClick={() => onChange(n)}>{n}×</button>
      ))}
    </div>
  )
}

function NoteField({ note, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(note || '')

  function handleBlur() {
    setEditing(false)
    if (draft.trim() !== (note || '').trim()) onChange(draft.trim())
  }

  if (editing) {
    return (
      <textarea className="plan-card-note-input" value={draft}
        onChange={e => setDraft(e.target.value)} onBlur={handleBlur}
        onKeyDown={e => { if (e.key === 'Escape') { setDraft(note || ''); setEditing(false) } }}
        autoFocus rows={2} placeholder="Add a note…" />
    )
  }
  if (note) {
    return <p className="plan-card-note" onClick={() => { setDraft(note); setEditing(true) }}>{note}</p>
  }
  return (
    <button className="plan-card-note-add" onClick={() => { setDraft(''); setEditing(true) }}>
      + note
    </button>
  )
}

// ─── Recipe Picker ────────────────────────────────────────────────────────────
function RecipePicker({ recipes, category, currentId, onSelect, onClose, approvalMembers = [] }) {
  const [search, setSearch] = useState('')

  const sorted = [...recipes].sort((a, b) => a.name.localeCompare(b.name))

  const filtered = sorted.filter(r =>
    r.category === category &&
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <span className="picker-title">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} recipes` : 'Choose a recipe'}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0 8px' }}>
            <IconClose size={16} />
          </button>
        </div>
        <div className="picker-search-wrap">
          <input className="input picker-search" placeholder="Search recipes…" value={search}
            onChange={e => setSearch(e.target.value)} autoFocus />
        </div>
        <div className="picker-list">
          {filtered.length === 0 ? (
            <p className="picker-empty">No recipes found.</p>
          ) : (
            filtered.map(recipe => {
              const meta = getCategoryMeta(recipe.category)
              return (
                <button key={recipe.id}
                  className={`picker-item${recipe.id === currentId ? ' picker-item--active' : ''}`}
                  onClick={() => onSelect(recipe.id)}>
                  <span className="picker-item-dot" style={{ background: meta.color }} />
                  <span className="picker-item-name">{recipe.name}</span>
                  {approvalMembers.filter(m => (recipe.approved_by ?? []).includes(m.id)).map(m => (
                    <span key={m.id} className="picker-item-approval" style={{ color: m.color }}>{m.name} ✓</span>
                  ))}
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
