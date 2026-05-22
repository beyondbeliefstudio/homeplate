import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useAuth.jsx'
import { getMealPlan, saveMealPlan, getRecipes, getHouseholdMembers } from '../lib/supabase'
import { getCategoryMeta } from '../lib/categories'
import { getWeekKey, MEAL_TYPES, MEAL_LABELS, DAY_LABELS } from '../lib/weeks'
import { ChevronLeft, ChevronRight, Plus, X, Search, Users, User } from 'lucide-react'
import './Planner.css'

// ─── View options ────────────────────────────────────────────────────
const VIEW_OPTIONS = [
  { value: 1, label: 'Day'  },
  { value: 3, label: '3 Day' },
  { value: 4, label: '4 Day' },
  { value: 7, label: 'Week' },
]

// ─── Slot data helpers ───────────────────────────────────────────────
function normalizeSlot(raw) {
  if (!raw) return { type: 'shared', recipe: null, members: {} }
  if (typeof raw === 'string') return { type: 'shared', recipe: raw, members: {} }
  return raw
}

// ─── Date helpers ────────────────────────────────────────────────────
function addDays(isoDate, n) {
  const d = new Date(isoDate + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function toISO(date) {
  return date.toISOString().slice(0, 10)
}

function formatViewRange(dates, viewSize) {
  if (viewSize === 1) {
    return dates[0].toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    })
  }
  const s = dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const e = dates[dates.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${s} – ${e}`
}

// ─── Component ───────────────────────────────────────────────────────
export default function PlannerPage() {
  const user     = useUser()
  const todayISO = toISO(new Date())

  const [viewSize,  setViewSize]  = useState(4)
  const [viewStart, setViewStart] = useState(todayISO)
  const [planCache, setPlanCache] = useState({}) // { weekKey: { dayIndex: { meal: slot } } }
  const [recipes,   setRecipes]   = useState([])
  const [members,   setMembers]   = useState([])
  const [picker,    setPicker]    = useState(null) // { date, meal, memberId? }

  // ── Visible dates ──────────────────────────────────────────────────
  const viewDates = Array.from({ length: viewSize }, (_, i) => {
    const d = new Date(viewStart + 'T12:00:00')
    d.setDate(d.getDate() + i)
    return d
  })

  const isViewingToday = viewDates.some(d => toISO(d) === todayISO)

  // ── Load recipes + members once ────────────────────────────────────
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

  // ── Load plan data for all visible weeks (cache-first) ─────────────
  useEffect(() => {
    if (!user) return
    const wks = [...new Set(viewDates.map(d => getWeekKey(d)))]
    const toFetch = wks.filter(wk => !(wk in planCache))
    if (!toFetch.length) return
    Promise.all(
      toFetch.map(wk => getMealPlan(user.id, wk).then(({ data }) => [wk, data || {}]))
    ).then(pairs => {
      setPlanCache(prev => {
        const next = { ...prev }
        pairs.forEach(([wk, data]) => { next[wk] = data })
        return next
      })
    })
  }, [user, viewStart, viewSize]) // eslint-disable-line react-hooks/exhaustive-deps

  const recipeMap = Object.fromEntries(recipes.map(r => [r.id, r]))

  // ── Plan read/write helpers ────────────────────────────────────────
  function getDayPlan(date) {
    const wk       = getWeekKey(date)
    const dayIndex = date.getDay()
    return (planCache[wk] || {})[dayIndex] || {}
  }

  async function setSlot(date, meal, slot) {
    const wk          = getWeekKey(date)
    const dayIndex    = date.getDay()
    const currentPlan = planCache[wk] || {}
    const updatedPlan = {
      ...currentPlan,
      [dayIndex]: { ...(currentPlan[dayIndex] || {}), [meal]: slot },
    }
    setPlanCache(prev => ({ ...prev, [wk]: updatedPlan }))
    await saveMealPlan(user.id, wk, updatedPlan)
  }

  function toggleMode(date, meal) {
    const slot = normalizeSlot(getDayPlan(date)[meal])
    if (slot.type === 'shared') {
      const memberEntries = members.reduce((acc, m) => ({ ...acc, [m.id]: slot.recipe }), {})
      setSlot(date, meal, { type: 'individual', recipe: null, members: memberEntries })
    } else {
      setSlot(date, meal, { type: 'shared', recipe: null, members: {} })
    }
  }

  function assignShared(date, meal, recipeId) {
    setSlot(date, meal, { type: 'shared', recipe: recipeId, members: {} })
    setPicker(null)
  }

  function assignMember(date, meal, memberId, recipeId) {
    const slot = normalizeSlot(getDayPlan(date)[meal])
    setSlot(date, meal, {
      ...slot,
      type: 'individual',
      members: { ...slot.members, [memberId]: recipeId },
    })
    setPicker(null)
  }

  function clearShared(date, meal) {
    setSlot(date, meal, { type: 'shared', recipe: null, members: {} })
  }

  function clearMember(date, meal, memberId) {
    const slot = normalizeSlot(getDayPlan(date)[meal])
    setSlot(date, meal, {
      ...slot,
      members: { ...slot.members, [memberId]: null },
    })
  }

  // ── Navigation ─────────────────────────────────────────────────────
  function navigate(dir) {
    setViewStart(s => addDays(s, dir * viewSize))
  }

  function goToToday() {
    setViewStart(todayISO)
  }

  function changeViewSize(newSize) {
    if (newSize === 7) {
      // Snap to Sunday when switching to week view
      setViewStart(getWeekKey(new Date(viewStart + 'T12:00:00')))
    }
    setViewSize(newSize)
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="page planner-page">
      <div className="page-header">
        <h1 className="page-title">Planner</h1>
      </div>

      {/* Controls: nav + view selector */}
      <div className="planner-controls">
        <div className="planner-week-nav">
          <button className="btn btn-ghost btn-sm planner-nav-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <span className="planner-week-label">{formatViewRange(viewDates, viewSize)}</span>
          <button className="btn btn-ghost btn-sm planner-nav-btn" onClick={() => navigate(1)}>
            <ChevronRight size={16} strokeWidth={2} />
          </button>
          {!isViewingToday && (
            <button className="btn btn-ghost btn-sm planner-today-btn" onClick={goToToday}>
              Today
            </button>
          )}
        </div>

        <div className="planner-view-selector">
          {VIEW_OPTIONS.map(v => (
            <button
              key={v.value}
              className={`planner-view-btn ${viewSize === v.value ? 'planner-view-btn--active' : ''}`}
              onClick={() => changeViewSize(v.value)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className={`planner-grid planner-grid--${viewSize}`}>
        {viewDates.map((date, i) => {
          const isToday  = toISO(date) === todayISO
          const dayIndex = date.getDay()
          const dayPlan  = getDayPlan(date)

          return (
            <div key={i} className={`planner-day ${isToday ? 'planner-day--today' : ''}`}>
              <div className="planner-day-header">
                <span className="planner-day-name">{DAY_LABELS[dayIndex]}</span>
                <span className="planner-day-date">{date.getDate()}</span>
              </div>

              <div className="planner-slots">
                {MEAL_TYPES.map(meal => {
                  const slot         = normalizeSlot(dayPlan[meal])
                  const isIndividual = slot.type === 'individual'

                  return (
                    <div key={meal} className={`planner-slot ${isIndividual ? 'planner-slot--individual' : ''}`}>
                      {/* Label + mode toggle */}
                      <div className="planner-slot-top">
                        <span className="planner-slot-label">{MEAL_LABELS[meal]}</span>
                        {members.length > 0 && (
                          <button
                            className={`planner-mode-btn ${isIndividual ? 'planner-mode-btn--active' : ''}`}
                            onClick={() => toggleMode(date, meal)}
                            title={isIndividual ? 'Switch to shared meal' : 'Switch to individual meals'}
                          >
                            {isIndividual
                              ? <User size={10} strokeWidth={2.5} />
                              : <Users size={10} strokeWidth={2.5} />}
                          </button>
                        )}
                      </div>

                      {/* Shared mode */}
                      {!isIndividual && (
                        slot.recipe && recipeMap[slot.recipe] ? (
                          <div className="planner-slot-recipe">
                            <span className="planner-slot-name"
                              onClick={() => setPicker({ date, meal })}
                              title={recipeMap[slot.recipe].name}>
                              {recipeMap[slot.recipe].name}
                            </span>
                            <button className="planner-slot-clear" onClick={() => clearShared(date, meal)}>
                              <X size={11} strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <button className="planner-slot-add" onClick={() => setPicker({ date, meal })}>
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        )
                      )}

                      {/* Individual mode */}
                      {isIndividual && (
                        <div className="planner-member-list">
                          {members.length === 0 ? (
                            <span className="planner-no-members">Add members in Settings</span>
                          ) : (
                            members.map(member => {
                              const rid    = slot.members?.[member.id]
                              const recipe = rid ? recipeMap[rid] : null
                              return (
                                <div key={member.id} className="planner-member-row">
                                  <span className="planner-member-dot" style={{ background: member.color }} />
                                  <span className="planner-member-name" style={{ color: member.color }}>
                                    {member.name.split(' ')[0]}
                                  </span>
                                  {recipe ? (
                                    <div className="planner-slot-recipe" style={{ flex: 1, minWidth: 0 }}>
                                      <span className="planner-slot-name"
                                        onClick={() => setPicker({ date, meal, memberId: member.id })}
                                        title={recipe.name}>
                                        {recipe.name}
                                      </span>
                                      <button className="planner-slot-clear"
                                        onClick={() => clearMember(date, meal, member.id)}>
                                        <X size={11} strokeWidth={2.5} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button className="planner-member-add"
                                      onClick={() => setPicker({ date, meal, memberId: member.id })}>
                                      <Plus size={11} strokeWidth={2.5} />
                                    </button>
                                  )}
                                </div>
                              )
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recipe picker */}
      {picker && (
        <RecipePicker
          recipes={recipes}
          meal={MEAL_LABELS[picker.meal]}
          memberName={picker.memberId ? members.find(m => m.id === picker.memberId)?.name : null}
          memberColor={picker.memberId ? members.find(m => m.id === picker.memberId)?.color : null}
          currentId={
            picker.memberId
              ? normalizeSlot(getDayPlan(picker.date)?.[picker.meal]).members?.[picker.memberId]
              : normalizeSlot(getDayPlan(picker.date)?.[picker.meal]).recipe
          }
          onSelect={id =>
            picker.memberId
              ? assignMember(picker.date, picker.meal, picker.memberId, id)
              : assignShared(picker.date, picker.meal, id)
          }
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}

// ─── Recipe Picker ───────────────────────────────────────────────────
function RecipePicker({ recipes, meal, memberName, memberColor, currentId, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <div className="picker-title-group">
            <span className="picker-title">{meal}</span>
            {memberName && (
              <span className="picker-member-tag" style={{ '--mc': memberColor }}>
                <span className="picker-member-dot" style={{ background: memberColor }} />
                {memberName}
              </span>
            )}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0 8px' }}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="picker-search-wrap">
          <Search size={14} className="picker-search-icon" />
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
