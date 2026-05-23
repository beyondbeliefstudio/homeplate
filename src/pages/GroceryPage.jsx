import { useState, useEffect, useMemo } from 'react'
import { useUser } from '../hooks/useAuth.jsx'
import { getMealPlan, saveMealPlan, getRecipes } from '../lib/supabase'
import { getWeekKey, shiftWeek, formatWeekOf } from '../lib/weeks'
import { ChevronLeft, ChevronRight, Plus, X, Check } from 'lucide-react'

// ─── Ingredient consolidation ────────────────────────────────────────
function consolidate(raw) {
  // raw: [{ name, quantity, unit }]
  const map = new Map()

  raw.forEach(({ name, quantity, unit }) => {
    const normName = name.toLowerCase().trim()
    const normUnit = (unit || '').toLowerCase().trim()
    const key      = `${normName}::${normUnit}`
    const numQty   = parseFloat(quantity)

    if (map.has(key)) {
      const entry = map.get(key)
      if (!isNaN(numQty) && entry.numQty !== null) entry.numQty += numQty
      else entry.numQty = null // can't add non-numeric — mark as raw
    } else {
      map.set(key, { name: name.trim(), unit: normUnit, numQty: isNaN(numQty) ? null : numQty, rawQty: quantity })
    }
  })

  return Array.from(map.values()).map(({ name, unit, numQty, rawQty }, i) => {
    const qty = numQty !== null
      ? (numQty % 1 === 0 ? `${numQty}` : numQty.toFixed(1))
      : (rawQty || '')
    return { id: `g-${i}`, name, quantity: qty, unit, checked: false }
  })
}

function computeIngredients(plan, recipeMap) {
  const raw = []

  function addRecipe(recipeId, multiplier = 1) {
    const recipe = recipeMap[recipeId]
    if (!recipe) return
    recipe.ingredients?.forEach(ing => {
      if (!ing.name?.trim()) return
      const qty = parseFloat(ing.quantity)
      const scaledQty = !isNaN(qty) ? String(qty * multiplier) : (ing.quantity || '')
      raw.push({ name: ing.name, quantity: scaledQty, unit: ing.unit || '' })
    })
  }

  // Breakfasts (1× each, pantry contributes nothing)
  plan.breakfasts?.forEach(item => {
    if (!item.isPantry && item.recipeId) addRecipe(item.recipeId, 1)
  })

  // Lunches (1× each; kids override 1×; no double-counting same recipe)
  const seenLunch = new Set()
  plan.lunches?.forEach(item => {
    if (item.isPantry) return
    if (item.recipeId && !seenLunch.has(item.recipeId)) {
      seenLunch.add(item.recipeId)
      addRecipe(item.recipeId, 1)
    }
    if (item.kidsRecipeId && !seenLunch.has(item.kidsRecipeId)) {
      seenLunch.add(item.kidsRecipeId)
      addRecipe(item.kidsRecipeId, 1)
    }
  })

  // Dinners — adult × multiplier; kids 1× only if separate recipe
  plan.dinners?.forEach(item => {
    const multi = item.multiplier ?? 1
    if (item.adultRecipeId) addRecipe(item.adultRecipeId, multi)
    if (item.kidsRecipeId && item.kidsRecipeId !== item.adultRecipeId) {
      addRecipe(item.kidsRecipeId, 1)
    }
  })

  // Snacks × multiplier
  plan.snacks?.forEach(item => {
    if (item.recipeId) addRecipe(item.recipeId, item.multiplier ?? 1)
  })

  return consolidate(raw)
}

// ─── Component ───────────────────────────────────────────────────────
export default function GroceryPage() {
  const user = useUser()
  const [weekKey, setWeekKey] = useState(() => getWeekKey())
  const [plan, setPlan]       = useState(null)
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')

  // planData.groceryChecked: Set<string> of ingredient keys that are checked
  // planData.groceryManual:  [{ id, name, checked }]

  useEffect(() => {
    if (!user) return
    getRecipes(user.id).then(({ data }) => setRecipes(data || []))
  }, [user])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getMealPlan(user.id, weekKey).then(({ data }) => {
      setPlan(data || {})
      setLoading(false)
    })
  }, [user, weekKey])

  const recipeMap = useMemo(
    () => Object.fromEntries(recipes.map(r => [r.id, r])),
    [recipes]
  )

  // Computed ingredient list from plan
  const generated = useMemo(() => {
    if (!plan) return []
    return computeIngredients(plan, recipeMap)
  }, [plan, recipeMap])

  const checkedKeys = useMemo(() => new Set(plan?.groceryChecked ?? []), [plan])
  const manual      = plan?.groceryManual ?? []

  async function updatePlan(changes) {
    const updated = { ...plan, ...changes }
    setPlan(updated)
    await saveMealPlan(user.id, weekKey, updated)
  }

  function toggleGenerated(item) {
    const key  = `${item.name.toLowerCase().trim()}::${item.unit.toLowerCase().trim()}`
    const next = new Set(checkedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    updatePlan({ groceryChecked: [...next] })
  }

  function toggleManual(id) {
    updatePlan({
      groceryManual: manual.map(m => m.id === id ? { ...m, checked: !m.checked } : m),
    })
  }

  function addManual() {
    const name = newItem.trim()
    if (!name) return
    updatePlan({
      groceryManual: [...manual, { id: Math.random().toString(36).slice(2, 9), name, checked: false }],
    })
    setNewItem('')
  }

  function removeManual(id) {
    updatePlan({ groceryManual: manual.filter(m => m.id !== id) })
  }

  function clearChecked() {
    updatePlan({ groceryChecked: [], groceryManual: manual.filter(m => !m.checked) })
  }

  const checkedCount = generated.filter(i => {
    const key = `${i.name.toLowerCase().trim()}::${i.unit.toLowerCase().trim()}`
    return checkedKeys.has(key)
  }).length + manual.filter(m => m.checked).length

  const totalCount = generated.length + manual.length

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Grocery</h1>
        {checkedCount > 0 && (
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-3)' }} onClick={clearChecked}>
            Clear {checkedCount} checked
          </button>
        )}
      </div>

      {/* Week nav */}
      <div className="planner-week-nav" style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm planner-nav-btn" onClick={() => setWeekKey(k => shiftWeek(k, -1))}>
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="planner-week-label">{formatWeekOf(weekKey)}</span>
        <button className="btn btn-ghost btn-sm planner-nav-btn" onClick={() => setWeekKey(k => shiftWeek(k, 1))}>
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        {weekKey !== getWeekKey() && (
          <button className="btn btn-ghost btn-sm planner-today-btn" onClick={() => setWeekKey(getWeekKey())}>
            This week
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-placeholder"><p>Loading…</p></div>
      ) : (
        <div className="grocery-list">

          {/* Generated from plan */}
          {generated.length > 0 ? (
            <div className="grocery-section">
              <p className="grocery-section-label">From this week's plan</p>
              {generated.map(item => {
                const key     = `${item.name.toLowerCase().trim()}::${item.unit.toLowerCase().trim()}`
                const checked = checkedKeys.has(key)
                return (
                  <GroceryItem key={item.id} checked={checked}
                    label={[item.quantity, item.unit, item.name].filter(Boolean).join(' ')}
                    onToggle={() => toggleGenerated(item)} />
                )
              })}
            </div>
          ) : (
            <div className="grocery-empty-plan">
              <p>No recipes planned for {formatWeekOf(weekKey)} yet.</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
                Add recipes in the Planner and they'll show up here.
              </p>
            </div>
          )}

          {/* Manual items */}
          <div className="grocery-section">
            <p className="grocery-section-label">Extra items</p>
            {manual.map(item => (
              <div key={item.id} className="grocery-item">
                <button className={`grocery-check ${item.checked ? 'grocery-check--done' : ''}`}
                  onClick={() => toggleManual(item.id)}>
                  {item.checked && <Check size={12} strokeWidth={3} />}
                </button>
                <span className={`grocery-label ${item.checked ? 'grocery-label--done' : ''}`}>{item.name}</span>
                <button className="grocery-remove" onClick={() => removeManual(item.id)}>
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>
            ))}

            {/* Add manual item */}
            <div className="grocery-add-row">
              <input className="input input-sm grocery-add-input" placeholder="Add an item…"
                value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addManual() }} />
              <button className="btn btn-secondary btn-sm" onClick={addManual} disabled={!newItem.trim()}>
                <Plus size={14} strokeWidth={2} />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

function GroceryItem({ checked, label, onToggle }) {
  return (
    <div className="grocery-item">
      <button className={`grocery-check ${checked ? 'grocery-check--done' : ''}`} onClick={onToggle}>
        {checked && <Check size={12} strokeWidth={3} />}
      </button>
      <span className={`grocery-label ${checked ? 'grocery-label--done' : ''}`}>{label}</span>
    </div>
  )
}
