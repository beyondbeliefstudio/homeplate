import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useAuth.jsx'
import { getMealPlan, saveMealPlan, getRecipes, getHouseholdMembers } from '../lib/supabase'
import { getCategoryMeta } from '../lib/categories'
import {
  getWeekKey, getWeekDates, shiftWeek, formatWeekRange,
  MEAL_TYPES, MEAL_LABELS, DAY_LABELS,
} from '../lib/weeks'
import { ChevronLeft, ChevronRight, Plus, X, Search, Users, User } from 'lucide-react'
import './Planner.css'

// ─── Slot data helpers ────────────────────────────────────────────────
// Slot shape: { type: 'shared'|'individual', recipe: id|null, members: { memberId: recipeId|null } }
function normalizeSlot(raw) {
  if (!raw) return { type: 'shared', recipe: null, members: {} }
  if (typeof raw === 'string') return { type: 'shared', recipe: raw, members: {} }
  return raw
}

export default function PlannerPage() {
  const user = useUser()
  const [weekKey, setWeekKey] = useState(() => getWeekKey())
  const [plan, setPlan]       = useState({})
  const [recipes, setRecipes] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [picker, setPicker]   = useState(null) // { dayIndex, meal, memberId? }

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
      setPlan(data || {})
      setLoading(false)
    })
  }, [user, weekKey])

  const recipeMap = Object.fromEntries(recipes.map(r => [r.id, r]))

  async function updatePlan(updated) {
    setPlan(updated)
    await saveMealPlan(user.id, weekKey, updated)
  }

  function setSlot(dayIndex, meal, slot) {
    updatePlan({ ...plan, [dayIndex]: { ...(plan[dayIndex] || {}), [meal]: slot } })
  }

  function toggleMode(dayIndex, meal) {
    const slot = normalizeSlot(plan[dayIndex]?.[meal])
    if (slot.type === 'shared') {
      // Switch to individual — pre-fill all members with the shared recipe
      const memberEntries = members.reduce((acc, m) => ({ ...acc, [m.id]: slot.recipe }), {})
      setSlot(dayIndex, meal, { type: 'individual', recipe: null, members: memberEntries })
    } else {
      // Switch back to shared — clear individual assignments
      setSlot(dayIndex, meal, { type: 'shared', recipe: null, members: {} })
    }
  }

  function assignShared(dayIndex, meal, recipeId) {
    setSlot(dayIndex, meal, { type: 'shared', recipe: recipeId, members: {} })
    setPicker(null)
  }

  function assignMember(dayIndex, meal, memberId, recipeId) {
    const slot = normalizeSlot(plan[dayIndex]?.[meal])
    setSlot(dayIndex, meal, {
      ...slot,
      type: 'individual',
      members: { ...slot.members, [memberId]: recipeId },
    })
    setPicker(null)
  }

  function clearShared(dayIndex, meal) {
    setSlot(dayIndex, meal, { type: 'shared', recipe: null, members: {} })
  }

  function clearMember(dayIndex, meal, memberId) {
    const slot = normalizeSlot(plan[dayIndex]?.[meal])
    setSlot(dayIndex, meal, {
      ...slot,
      members: { ...slot.members, [memberId]: null },
    })
  }

  const weekDates = getWeekDates(weekKey)
  const todayStr  = new Date().toDateString()

  return (
    <div className="page planner-page">
      <div className="page-header">
        <h1 className="page-title">Planner</h1>
      </div>

      {/* Week nav */}
      <div className="planner-week-nav">
        <button className="btn btn-ghost btn-sm planner-nav-btn" onClick={() => setWeekKey(k => shiftWeek(k, -1))}>
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="planner-week-label">{formatWeekRange(weekKey)}</span>
        <button className="btn btn-ghost btn-sm planner-nav-btn" onClick={() => setWeekKey(k => shiftWeek(k, 1))}>
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        {weekKey !== getWeekKey() && (
          <button className="btn btn-ghost btn-sm planner-today-btn" onClick={() => setWeekKey(getWeekKey())}>
            Today
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="planner-grid">
        {weekDates.map((date, dayIndex) => {
          const isToday = date.toDateString() === todayStr
          const dayPlan = plan[dayIndex] || {}

          return (
            <div key={dayIndex} className={`planner-day ${isToday ? 'planner-day--today' : ''}`}>
              <div className="planner-day-header">
                <span className="planner-day-name">{DAY_LABELS[dayIndex]}</span>
                <span className="planner-day-date">{date.getDate()}</span>
              </div>

              <div className="planner-slots">
                {MEAL_TYPES.map(meal => {
                  const slot = normalizeSlot(dayPlan[meal])
                  const isIndividual = slot.type === 'individual'

                  return (
                    <div key={meal} className={`planner-slot ${isIndividual ? 'planner-slot--individual' : ''}`}>
                      {/* Meal label + mode toggle */}
                      <div className="planner-slot-top">
                        <span className="planner-slot-label">{MEAL_LABELS[meal]}</span>
                        {members.length > 0 && (
                          <button
                            className={`planner-mode-btn ${isIndividual ? 'planner-mode-btn--active' : ''}`}
                            onClick={() => toggleMode(dayIndex, meal)}
                            title={isIndividual ? 'Switch to shared meal' : 'Switch to individual meals'}
                          >
                            {isIndividual ? <User size={10} strokeWidth={2.5} /> : <Users size={10} strokeWidth={2.5} />}
                          </button>
                        )}
                      </div>

                      {/* Shared mode */}
                      {!isIndividual && (
                        slot.recipe && recipeMap[slot.recipe] ? (
                          <div className="planner-slot-recipe">
                            <span className="planner-slot-name"
                              onClick={() => setPicker({ dayIndex, meal })}
                              title={recipeMap[slot.recipe].name}>
                              {recipeMap[slot.recipe].name}
                            </span>
                            <button className="planner-slot-clear" onClick={() => clearShared(dayIndex, meal)}>
                              <X size={11} strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <button className="planner-slot-add" onClick={() => setPicker({ dayIndex, meal })}>
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
                                  {recipe ? (
                                    <div className="planner-slot-recipe" style={{ flex: 1 }}>
                                      <span className="planner-slot-name"
                                        onClick={() => setPicker({ dayIndex, meal, memberId: member.id })}
                                        title={recipe.name}>
                                        {recipe.name}
                                      </span>
                                      <button className="planner-slot-clear" onClick={() => clearMember(dayIndex, meal, member.id)}>
                                        <X size={11} strokeWidth={2.5} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button className="planner-member-add"
                                      onClick={() => setPicker({ dayIndex, meal, memberId: member.id })}>
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
              ? normalizeSlot(plan[picker.dayIndex]?.[picker.meal]).members?.[picker.memberId]
              : normalizeSlot(plan[picker.dayIndex]?.[picker.meal]).recipe
          }
          onSelect={id =>
            picker.memberId
              ? assignMember(picker.dayIndex, picker.meal, picker.memberId, id)
              : assignShared(picker.dayIndex, picker.meal, id)
          }
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}

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
