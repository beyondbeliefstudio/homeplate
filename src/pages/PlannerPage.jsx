import { useState, useEffect, useCallback } from 'react'
import { useUser } from '../hooks/useAuth.jsx'
import { getMealPlan, saveMealPlan, getRecipes } from '../lib/supabase'
import { getCategoryMeta } from '../lib/categories'
import {
  getWeekKey, getWeekDates, shiftWeek, formatWeekRange,
  MEAL_TYPES, MEAL_LABELS, DAY_LABELS,
} from '../lib/weeks'
import { ChevronLeft, ChevronRight, Plus, X, Search } from 'lucide-react'
import './Planner.css'

export default function PlannerPage() {
  const user = useUser()
  const [weekKey, setWeekKey]     = useState(() => getWeekKey())
  const [plan, setPlan]           = useState({})
  const [recipes, setRecipes]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [picker, setPicker]       = useState(null) // { dayIndex, meal }

  // Load recipes once
  useEffect(() => {
    if (!user) return
    getRecipes(user.id).then(({ data }) => setRecipes(data || []))
  }, [user])

  // Load plan when week changes
  useEffect(() => {
    if (!user) return
    setLoading(true)
    getMealPlan(user.id, weekKey).then(({ data }) => {
      setPlan(data || {})
      setLoading(false)
    })
  }, [user, weekKey])

  const recipeMap = Object.fromEntries(recipes.map(r => [r.id, r]))

  async function assign(dayIndex, meal, recipeId) {
    const updated = {
      ...plan,
      [dayIndex]: { ...(plan[dayIndex] || {}), [meal]: recipeId },
    }
    setPlan(updated)
    setPicker(null)
    await saveMealPlan(user.id, weekKey, updated)
  }

  async function clear(dayIndex, meal) {
    const updated = {
      ...plan,
      [dayIndex]: { ...(plan[dayIndex] || {}), [meal]: null },
    }
    setPlan(updated)
    await saveMealPlan(user.id, weekKey, updated)
  }

  const weekDates = getWeekDates(weekKey)
  const todayStr  = new Date().toDateString()

  return (
    <div className="page planner-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Planner</h1>
      </div>

      {/* Week nav */}
      <div className="planner-week-nav">
        <button className="btn btn-ghost btn-sm planner-nav-btn"
          onClick={() => setWeekKey(k => shiftWeek(k, -1))}>
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="planner-week-label">{formatWeekRange(weekKey)}</span>
        <button className="btn btn-ghost btn-sm planner-nav-btn"
          onClick={() => setWeekKey(k => shiftWeek(k, 1))}>
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        {weekKey !== getWeekKey() && (
          <button className="btn btn-ghost btn-sm planner-today-btn"
            onClick={() => setWeekKey(getWeekKey())}>
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
                  const recipeId = dayPlan[meal]
                  const recipe   = recipeId ? recipeMap[recipeId] : null

                  return (
                    <div key={meal} className={`planner-slot ${recipe ? 'planner-slot--filled' : ''}`}>
                      <span className="planner-slot-label">{MEAL_LABELS[meal]}</span>

                      {recipe ? (
                        <div className="planner-slot-recipe">
                          <span
                            className="planner-slot-name"
                            onClick={() => setPicker({ dayIndex, meal })}
                            title={recipe.name}
                          >
                            {recipe.name}
                          </span>
                          <button
                            className="planner-slot-clear"
                            onClick={() => clear(dayIndex, meal)}
                            title="Remove"
                          >
                            <X size={11} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="planner-slot-add"
                          onClick={() => setPicker({ dayIndex, meal })}
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
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
          currentId={plan[picker.dayIndex]?.[picker.meal]}
          meal={MEAL_LABELS[picker.meal]}
          onSelect={id => assign(picker.dayIndex, picker.meal, id)}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}

function RecipePicker({ recipes, currentId, meal, onSelect, onClose }) {
  const [search, setSearch] = useState('')

  const filtered = recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <span className="picker-title">Pick a recipe <span className="picker-meal">· {meal}</span></span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0 8px' }}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="picker-search-wrap">
          <Search size={14} className="picker-search-icon" />
          <input
            className="input picker-search"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="picker-list">
          {filtered.length === 0 ? (
            <p className="picker-empty">No recipes found.</p>
          ) : (
            filtered.map(recipe => {
              const meta    = getCategoryMeta(recipe.category)
              const isActive = recipe.id === currentId
              return (
                <button
                  key={recipe.id}
                  className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                  onClick={() => onSelect(recipe.id)}
                >
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
