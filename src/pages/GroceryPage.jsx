import { useState, useEffect, useMemo, useRef } from 'react'
import { useUser } from '../hooks/useAuth.jsx'
import { getMealPlan, saveMealPlan, getRecipes, getStaples, addStaple, deleteStaple, getStores } from '../lib/supabase'
import { getWeekKey, shiftWeek, formatWeekRange } from '../lib/weeks'
import { IconChevronL, IconChevronR, IconChevronD, IconPlus, IconClose, IconCheck } from '../components/icons'
import { EmptyGrocery } from '../components/EmptyStates'
import { getStorePalette } from '../lib/storePalettes'
import { loadCategories, assignGroup as assignGroupLib, CATEGORIES_KEY } from '../lib/groceryCategories'
import './Grocery.css'

export { getStorePalette }

// ─── Utility ─────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9) }

const FRACTIONS = {
  0.25: '¼', 0.33: '⅓', 0.5: '½', 0.67: '⅔', 0.75: '¾',
  1.25: '1¼', 1.33: '1⅓', 1.5: '1½', 1.67: '1⅔', 1.75: '1¾',
  2.5: '2½', 3.5: '3½', 0.125: '⅛',
}

function formatItemLabel({ quantity, unit, name }) {
  const unitStr = (unit || '').toLowerCase().trim().replace(/,\s*$/, '')
  const showUnit = unitStr && unitStr !== 'unit' && unitStr !== 'units'
  let qty = (quantity || '').toString().trim()
  const num = parseFloat(qty)
  if (!isNaN(num)) {
    const key = Math.round(num * 100) / 100
    qty = FRACTIONS[key] != null ? FRACTIONS[key] : (num % 1 === 0 ? String(num) : qty)
  }
  return [qty, showUnit ? unitStr : '', name].filter(Boolean).join(' ')
}

// ─── Meal type metadata ───────────────────────────────────────────────────────
const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner',
  side: 'Side', snack: 'Snack', beverage: 'Beverage',
}
const MEAL_TYPE_COLORS = {
  breakfast: '#F59E0B', lunch: '#10B981', dinner: '#6366F1',
  side: '#8B5CF6',     snack: '#EC4899', beverage: '#0EA5E9',
}

// ─── Per-recipe ingredient groups for step 1 ──────────────────────────────────
function makeReviewKey(groupKey, ing) {
  return `${groupKey}__${(ing.name || '').toLowerCase().trim()}__${(ing.unit || '').toLowerCase().trim()}`
}

function getRecipeGroups(plan, recipeMap) {
  if (!plan || !recipeMap) return []
  const groups = []

  // Breakfasts
  plan.breakfasts?.forEach(item => {
    if (item.isPantry || item.isDiningOut || !item.recipeId) return
    const recipe = recipeMap[item.recipeId]
    if (!recipe) return
    groups.push({
      key: `breakfast-${item.id}`, recipeId: item.recipeId,
      recipeName: recipe.name, mealType: 'breakfast',
      ingredients: (recipe.ingredients || []).filter(i => i.name?.trim()),
    })
  })

  // Lunches
  plan.lunches?.forEach(item => {
    if (item.isPantry || item.isDiningOut) return
    if (item.recipeId) {
      const recipe = recipeMap[item.recipeId]
      if (recipe) groups.push({
        key: `lunch-${item.id}`, recipeId: item.recipeId,
        recipeName: recipe.name, mealType: 'lunch',
        ingredients: (recipe.ingredients || []).filter(i => i.name?.trim()),
      })
    }
    if (item.kidsRecipeId && item.kidsRecipeId !== item.recipeId) {
      const recipe = recipeMap[item.kidsRecipeId]
      if (recipe) groups.push({
        key: `lunch-kids-${item.id}`, recipeId: item.kidsRecipeId,
        recipeName: `${recipe.name} (kids)`, mealType: 'lunch',
        ingredients: (recipe.ingredients || []).filter(i => i.name?.trim()),
      })
    }
  })

  // Dinners
  plan.dinners?.forEach(item => {
    if (item.isDiningOut) return
    if (item.adultRecipeId) {
      const recipe = recipeMap[item.adultRecipeId]
      if (recipe) groups.push({
        key: `dinner-${item.id}`, recipeId: item.adultRecipeId,
        recipeName: recipe.name, mealType: 'dinner',
        ingredients: (recipe.ingredients || []).filter(i => i.name?.trim()),
      })
    }
    if (item.kidsRecipeId && item.kidsRecipeId !== item.adultRecipeId) {
      const recipe = recipeMap[item.kidsRecipeId]
      if (recipe) groups.push({
        key: `dinner-kids-${item.id}`, recipeId: item.kidsRecipeId,
        recipeName: `${recipe.name} (kids)`, mealType: 'dinner',
        ingredients: (recipe.ingredients || []).filter(i => i.name?.trim()),
      })
    }
    item.sides?.forEach(side => {
      if (!side.recipeId || side.isPantry) return
      const recipe = recipeMap[side.recipeId]
      if (recipe) groups.push({
        key: `dinner-side-${item.id}-${side.id || uid()}`, recipeId: side.recipeId,
        recipeName: recipe.name, mealType: 'side',
        ingredients: (recipe.ingredients || []).filter(i => i.name?.trim()),
      })
    })
  })

  // Snacks
  plan.snacks?.forEach(item => {
    if (item.isPantry || item.isDiningOut || !item.recipeId) return
    const recipe = recipeMap[item.recipeId]
    if (!recipe) return
    groups.push({
      key: `snack-${item.id}`, recipeId: item.recipeId,
      recipeName: recipe.name, mealType: 'snack',
      ingredients: (recipe.ingredients || []).filter(i => i.name?.trim()),
    })
  })

  // Beverages
  plan.beverages?.forEach(item => {
    if (item.isPantry || item.isDiningOut || !item.recipeId) return
    const recipe = recipeMap[item.recipeId]
    if (!recipe) return
    groups.push({
      key: `beverage-${item.id}`, recipeId: item.recipeId,
      recipeName: recipe.name, mealType: 'beverage',
      ingredients: (recipe.ingredients || []).filter(i => i.name?.trim()),
    })
  })

  return groups
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GroceryPage() {
  const user = useUser()
  const [weekKey, setWeekKey]   = useState(() => getWeekKey())
  const [plan, setPlan]         = useState(null)
  const [recipes, setRecipes]   = useState([])
  const [staples, setStaples]   = useState([])
  const [stores, setStores]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [groceryGroups, setGroceryGroups] = useState(() => loadCategories())
  const [newStaple, setNewStaple] = useState('')
  const [newExtra, setNewExtra]   = useState('')

  // Compilation transient state (not persisted — restarts on reload)
  const [compiling, setCompiling]             = useState(false)
  const [compilationError, setCompilationError] = useState(null)
  const [pendingQuestions, setPendingQuestions] = useState([])
  const [currentQIdx, setCurrentQIdx]         = useState(0)
  const [prelimItems, setPrelimItems]         = useState([])
  const [answeredItems, setAnsweredItems]     = useState([])

  // Sync grocery groups when Settings changes them
  useEffect(() => {
    function sync() { setGroceryGroups(loadCategories()) }
    const storageHandler = e => { if (e.key === CATEGORIES_KEY) sync() }
    window.addEventListener('storage', storageHandler)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('storage', storageHandler)
      window.removeEventListener('focus', sync)
    }
  }, [])

  // Load recipes, staples, stores
  useEffect(() => {
    if (!user) return
    Promise.all([getRecipes(user.id), getStaples(user.id), getStores(user.id)])
      .then(([{ data: r }, { data: s }, { data: st }]) => {
        setRecipes(r || [])
        setStaples(s || [])
        setStores(st || [])
      })
  }, [user])

  // Load meal plan
  useEffect(() => {
    if (!user) return
    setLoading(true)
    getMealPlan(user.id, weekKey).then(({ data }) => {
      setPlan(data || {})
      setLoading(false)
    })
  }, [user, weekKey])

  // Reset transient compile state when week changes
  useEffect(() => {
    setCompiling(false)
    setCompilationError(null)
    setPendingQuestions([])
    setCurrentQIdx(0)
    setPrelimItems([])
    setAnsweredItems([])
  }, [weekKey])

  const recipeMap = useMemo(
    () => Object.fromEntries(recipes.map(r => [r.id, r])),
    [recipes]
  )

  // ── Derived plan state ───────────────────────────────────────────────
  const groceryStep      = plan?.groceryStep || 'review'
  const reviewCheckedSet = useMemo(() => new Set(plan?.groceryReviewChecked ?? []), [plan])
  const manualPre        = plan?.groceryManualPre ?? []
  const finalItems       = plan?.groceryFinalItems ?? []
  const extras           = plan?.groceryExtras ?? []
  const checkedStapleIds = useMemo(() => new Set(plan?.groceryStaplesChecked ?? []), [plan])

  const recipeGroups = useMemo(
    () => getRecipeGroups(plan, recipeMap),
    [plan, recipeMap]
  )

  async function updatePlan(changes) {
    const updated = { ...plan, ...changes }
    setPlan(updated)
    await saveMealPlan(user.id, weekKey, updated)
  }

  // ── Week nav (shared across all steps) ──────────────────────────────
  const weekNav = (
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
  )

  // ── Step 1: Review actions ───────────────────────────────────────────
  function toggleReviewChecked(key) {
    const next = new Set(reviewCheckedSet)
    next.has(key) ? next.delete(key) : next.add(key)
    updatePlan({ groceryReviewChecked: [...next] })
  }

  function addManualPre(name) {
    updatePlan({ groceryManualPre: [...manualPre, { id: uid(), name }] })
  }

  function removeManualPre(id) {
    updatePlan({ groceryManualPre: manualPre.filter(i => i.id !== id) })
  }

  // ── Generate final list ──────────────────────────────────────────────
  async function handleGenerateList() {
    setCompiling(true)
    setCompilationError(null)

    // Collect all unchecked ingredients
    const ingredients = []
    recipeGroups.forEach(group => {
      group.ingredients.forEach(ing => {
        const key = makeReviewKey(group.key, ing)
        if (!reviewCheckedSet.has(key)) {
          ingredients.push({
            recipeName: group.recipeName,
            name: ing.name,
            quantity: ing.quantity || '',
            unit: ing.unit || '',
          })
        }
      })
    })
    manualPre.forEach(item => {
      ingredients.push({ recipeName: 'Added manually', name: item.name, quantity: '', unit: '' })
    })

    try {
      const res = await fetch('/.netlify/functions/compile-grocery-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { finalItems: compiled, questions } = await res.json()

      if (!questions || questions.length === 0) {
        await finalizePlan(compiled, [])
      } else {
        setPrelimItems(compiled || [])
        setPendingQuestions(questions)
        setCurrentQIdx(0)
        setAnsweredItems([])
        setCompiling(false)
      }
    } catch (err) {
      console.error('Compilation error:', err)
      setCompilationError('Something went wrong compiling your list. Please try again.')
      setCompiling(false)
    }
  }

  // ── Step 3: Handle question answers ─────────────────────────────────
  function handleAnswer(question, option) {
    // null option = "decide for me" → use autoResolve
    const resolved = option?.resolvedItems ?? question.autoResolve?.resolvedItems ?? []
    const newAnswered = [...answeredItems, ...resolved]

    if (currentQIdx < pendingQuestions.length - 1) {
      setCurrentQIdx(i => i + 1)
      setAnsweredItems(newAnswered)
    } else {
      finalizePlan(prelimItems, newAnswered)
    }
  }

  async function finalizePlan(compiled, resolved) {
    const all = [...compiled, ...resolved].map(item => ({
      id: uid(),
      name: item.name || '',
      quantity: item.quantity || '',
      unit: item.unit || '',
      sources: item.note ? [item.note] : [],
      group: assignGroupLib(item.name || '', {}, groceryGroups),
      checked: false,
      storeId: null,
    }))

    await updatePlan({
      groceryStep: 'final',
      groceryFinalItems: all,
      groceryExtras: [],
    })

    setCompiling(false)
    setPendingQuestions([])
    setAnsweredItems([])
    setPrelimItems([])
  }

  // ── Step 4: Final list actions ───────────────────────────────────────
  function toggleFinalItem(id) {
    updatePlan({ groceryFinalItems: finalItems.map(i => i.id === id ? { ...i, checked: !i.checked } : i) })
  }
  function setFinalItemStore(id, storeId) {
    updatePlan({ groceryFinalItems: finalItems.map(i => i.id === id ? { ...i, storeId: storeId || null } : i) })
  }
  function setFinalItemGroup(id, groupKey) {
    updatePlan({ groceryFinalItems: finalItems.map(i => i.id === id ? { ...i, group: groupKey } : i) })
  }
  function removeFinalItem(id) {
    updatePlan({ groceryFinalItems: finalItems.filter(i => i.id !== id) })
  }

  function toggleExtra(id) {
    updatePlan({ groceryExtras: extras.map(m => m.id === id ? { ...m, checked: !m.checked } : m) })
  }
  function addExtra(name) {
    updatePlan({ groceryExtras: [...extras, { id: uid(), name, checked: false }] })
  }
  function removeExtra(id) {
    updatePlan({ groceryExtras: extras.filter(m => m.id !== id) })
  }
  function setExtraStore(id, storeId) {
    updatePlan({ groceryExtras: extras.map(m => m.id === id ? { ...m, storeId: storeId || null } : m) })
  }

  function toggleStaple(id) {
    const next = new Set(checkedStapleIds)
    next.has(id) ? next.delete(id) : next.add(id)
    updatePlan({ groceryStaplesChecked: [...next] })
  }
  async function handleAddStaple() {
    const name = newStaple.trim(); if (!name) return
    const { data } = await addStaple(user.id, name)
    if (data) setStaples(s => [...s, data])
    setNewStaple('')
  }
  async function handleDeleteStaple(id) {
    await deleteStaple(id)
    setStaples(s => s.filter(x => x.id !== id))
    const next = new Set(checkedStapleIds); next.delete(id)
    updatePlan({ groceryStaplesChecked: [...next] })
  }

  function handleStartOver() {
    updatePlan({
      groceryStep: 'review',
      groceryFinalItems: [],
      groceryExtras: [],
    })
  }

  // ── Render ───────────────────────────────────────────────────────────

  if (loading) return (
    <div className="page grocery-page">
      <div className="page-hero">
        <div className="page-hero-top">
          <span className="t-eyebrow" style={{ color: 'var(--ink-400)' }}>Grocery</span>
          {weekNav}
        </div>
        <h1 className="page-hero-title">The list.</h1>
      </div>
      <div className="page-placeholder"><p>Loading…</p></div>
    </div>
  )

  if (compiling) return <CompilationStep />

  if (pendingQuestions.length > 0) return (
    <QuestionStep
      question={pendingQuestions[currentQIdx]}
      onAnswer={handleAnswer}
      total={pendingQuestions.length}
      current={currentQIdx}
    />
  )

  if (groceryStep === 'final') return (
    <FinalStep
      finalItems={finalItems}
      extras={extras}
      staples={staples}
      stores={stores}
      groceryGroups={groceryGroups}
      checkedStapleIds={checkedStapleIds}
      newStaple={newStaple}
      setNewStaple={setNewStaple}
      newExtra={newExtra}
      setNewExtra={setNewExtra}
      weekNav={weekNav}
      onToggleFinalItem={toggleFinalItem}
      onSetFinalItemStore={setFinalItemStore}
      onSetFinalItemGroup={setFinalItemGroup}
      onRemoveFinalItem={removeFinalItem}
      onToggleExtra={toggleExtra}
      onAddExtra={addExtra}
      onRemoveExtra={removeExtra}
      onSetExtraStore={setExtraStore}
      onToggleStaple={toggleStaple}
      onAddStaple={handleAddStaple}
      onDeleteStaple={handleDeleteStaple}
      onStartOver={handleStartOver}
    />
  )

  // Default: step 1 — review by recipe
  return (
    <ReviewStep
      recipeGroups={recipeGroups}
      reviewCheckedSet={reviewCheckedSet}
      manualPre={manualPre}
      weekNav={weekNav}
      compilationError={compilationError}
      onToggleReviewChecked={toggleReviewChecked}
      onAddManualPre={addManualPre}
      onRemoveManualPre={removeManualPre}
      onGenerate={handleGenerateList}
    />
  )
}

// ─── Step 1: Review by recipe ──────────────────────────────────────────────────
function ReviewStep({ recipeGroups, reviewCheckedSet, manualPre, weekNav, compilationError, onToggleReviewChecked, onAddManualPre, onRemoveManualPre, onGenerate }) {
  const [newItem, setNewItem] = useState('')

  const totalIngredients = recipeGroups.reduce((sum, g) => sum + g.ingredients.length, 0)
  const alreadyHaveCount = recipeGroups.reduce((sum, g) => {
    return sum + g.ingredients.filter(ing => reviewCheckedSet.has(makeReviewKey(g.key, ing))).length
  }, 0)
  const toShopCount = (totalIngredients - alreadyHaveCount) + manualPre.length

  function handleAdd() {
    const name = newItem.trim()
    if (!name) return
    onAddManualPre(name)
    setNewItem('')
  }

  const isEmpty = recipeGroups.length === 0 && manualPre.length === 0

  return (
    <div className="page grocery-page">
      <div className="page-hero">
        <div className="page-hero-top">
          <span className="t-eyebrow" style={{ color: 'var(--ink-400)' }}>Grocery</span>
          {weekNav}
        </div>
        <h1 className="page-hero-title">What do you need?</h1>
        <p className="grocery-review-subtitle">
          Check off ingredients you already have at home, then generate your final list.
        </p>
      </div>

      {isEmpty ? (
        <div className="grocery-card">
          <div className="grocery-empty-state" style={{ padding: '32px 20px 28px' }}>
            <EmptyGrocery />
            <div className="grocery-empty-copy">
              <div className="t-h3">No meals planned yet.</div>
              <p className="t-body-sm" style={{ color: 'var(--hp-ink-500)', marginTop: 8 }}>
                Add meals in the Planner first, then come back here to build your grocery list.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grocery-review-layout">
          {/* Recipe ingredient cards */}
          {recipeGroups.map(group => (
            <RecipeIngredientCard
              key={group.key}
              group={group}
              reviewCheckedSet={reviewCheckedSet}
              onToggle={onToggleReviewChecked}
            />
          ))}

          {/* Extra items (manual pre-generation adds) */}
          <div className="grocery-review-extras">
            <div className="grocery-review-extras-header">
              <span className="grocery-review-extras-title">Extra items</span>
              {manualPre.length > 0 && <span className="grocery-review-extras-count">{manualPre.length}</span>}
            </div>
            <div className="grocery-review-extras-body">
              {manualPre.length === 0 && (
                <p className="grocery-review-extras-empty">
                  Anything else you need this week? Add it here before generating.
                </p>
              )}
              {manualPre.map(item => (
                <div key={item.id} className="grocery-review-extras-row">
                  <span className="grocery-review-extras-name">{item.name}</span>
                  <button className="grocery-remove" style={{ opacity: 1 }} onClick={() => onRemoveManualPre(item.id)}>
                    <IconClose size={13} />
                  </button>
                </div>
              ))}
              <div className="grocery-add-row" style={{ padding: '6px 0 0' }}>
                <input
                  className="input input-sm grocery-add-input"
                  placeholder="e.g. Paper towels, sparkling water…"
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
                />
                <button className="btn btn-sm grocery-add-btn" onClick={handleAdd} disabled={!newItem.trim()}>
                  <IconPlus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Generate CTA */}
          <div className="grocery-review-footer">
            {compilationError && (
              <p className="grocery-review-error">{compilationError}</p>
            )}
            <div className="grocery-review-footer-meta">
              {alreadyHaveCount > 0 && (
                <span className="grocery-review-footer-have">{alreadyHaveCount} already at home</span>
              )}
              <span className="grocery-review-footer-shop">{toShopCount} item{toShopCount !== 1 ? 's' : ''} to shop for</span>
            </div>
            <button
              className="btn btn-primary grocery-generate-btn"
              onClick={onGenerate}
              disabled={toShopCount === 0}
            >
              Generate Final Grocery List
              {toShopCount > 0 && <span className="grocery-generate-badge">{toShopCount}</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Recipe ingredient accordion card ────────────────────────────────────────
function RecipeIngredientCard({ group, reviewCheckedSet, onToggle }) {
  const [open, setOpen] = useState(true)
  const ingCount = group.ingredients.length
  const checkedCount = group.ingredients.filter(ing =>
    reviewCheckedSet.has(makeReviewKey(group.key, ing))
  ).length
  const allChecked = ingCount > 0 && checkedCount === ingCount
  const color = MEAL_TYPE_COLORS[group.mealType] || '#8C9189'

  return (
    <div className={`grocery-recipe-card ${allChecked ? 'grocery-recipe-card--done' : ''}`}>
      <button className="grocery-recipe-card-header" onClick={() => setOpen(o => !o)}>
        <span className="grocery-recipe-card-badge" style={{ background: color + '22', color }}>
          {MEAL_TYPE_LABELS[group.mealType] || group.mealType}
        </span>
        <span className="grocery-recipe-card-name">{group.recipeName}</span>
        <span className="grocery-recipe-card-count">{checkedCount}/{ingCount}</span>
        <span className={`grocery-recipe-card-chevron ${open ? 'grocery-recipe-card-chevron--open' : ''}`}>
          <IconChevronD size={14} />
        </span>
      </button>

      {open && (
        <div className="grocery-recipe-card-body">
          {group.ingredients.map((ing, idx) => {
            const key = makeReviewKey(group.key, ing)
            const checked = reviewCheckedSet.has(key)
            const label = formatItemLabel({ quantity: ing.quantity, unit: ing.unit, name: ing.name })
            return (
              <div key={idx} className={`grocery-review-row ${checked ? 'grocery-review-row--checked' : ''}`}>
                <button
                  className={`grocery-check ${checked ? 'grocery-check--done' : ''}`}
                  onClick={() => onToggle(key)}
                >
                  {checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                </button>
                <span className="grocery-review-ing-label">{label}</span>
                {checked && <span className="grocery-review-ing-have">have it</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Step 2: Compilation loading ──────────────────────────────────────────────
function CompilationStep() {
  return (
    <div className="page grocery-page grocery-compile-page">
      <div className="grocery-compile-inner">
        <div className="grocery-compile-spinner" />
        <div className="grocery-compile-title">Building your list…</div>
        <p className="grocery-compile-sub">
          Combining ingredients across recipes, converting measurements to real shopping units, and checking for conflicts.
        </p>
      </div>
    </div>
  )
}

// ─── Step 3: One question at a time ──────────────────────────────────────────
function QuestionStep({ question, onAnswer, total, current }) {
  return (
    <div className="page grocery-page grocery-question-page">
      <div className="grocery-question-wrap">
        <div className="grocery-question-track">
          <div className="grocery-question-track-fill" style={{ width: `${(current / total) * 100}%` }} />
        </div>
        <p className="grocery-question-step-label">Question {current + 1} of {total}</p>

        <div className="grocery-question-card">
          <p className="grocery-question-prompt">{question.prompt}</p>

          <div className="grocery-question-options">
            {question.options?.map((opt, i) => (
              <button
                key={i}
                className="grocery-question-option"
                onClick={() => onAnswer(question, opt)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            className="grocery-question-skip"
            onClick={() => onAnswer(question, null)}
          >
            Decide for me
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Step 4: Final categorized list ──────────────────────────────────────────
function FinalStep({
  finalItems, extras, staples, stores, groceryGroups, checkedStapleIds,
  newStaple, setNewStaple, newExtra, setNewExtra, weekNav,
  onToggleFinalItem, onSetFinalItemStore, onSetFinalItemGroup, onRemoveFinalItem,
  onToggleExtra, onAddExtra, onRemoveExtra, onSetExtraStore,
  onToggleStaple, onAddStaple, onDeleteStaple, onStartOver,
}) {
  const [activeStoreFilter, setActiveStoreFilter] = useState(null)

  const activeGroups = groceryGroups.filter(g => !g.hidden)

  const groupedFinal = useMemo(() => {
    const byKey = {}
    finalItems.forEach(item => {
      const g = item.group || 'other'
      if (!byKey[g]) byKey[g] = []
      byKey[g].push(item)
    })
    const ordered = []
    const seen = new Set()
    for (const group of activeGroups) {
      if (byKey[group.key]?.length) {
        ordered.push({ ...group, items: byKey[group.key] })
        seen.add(group.key)
      }
    }
    if (byKey.other?.length && !seen.has('other')) {
      const otherGroup = groceryGroups.find(g => g.key === 'other') || { key: 'other', label: 'Other', emoji: '🛒' }
      ordered.push({ ...otherGroup, items: byKey.other })
    }
    return ordered
  }, [finalItems, activeGroups, groceryGroups])

  const storeFilterCounts = useMemo(() => {
    const counts = {}
    finalItems.forEach(item => {
      if (item.storeId) counts[item.storeId] = (counts[item.storeId] || 0) + 1
    })
    return counts
  }, [finalItems])

  const untaggedCount = useMemo(
    () => stores.length ? finalItems.filter(i => !i.storeId).length : 0,
    [finalItems, stores]
  )

  const filteredGrouped = useMemo(() => {
    if (!activeStoreFilter) return groupedFinal
    return groupedFinal
      .map(g => ({
        ...g,
        items: g.items.filter(item =>
          activeStoreFilter === 'untagged' ? !item.storeId : item.storeId === activeStoreFilter
        ),
      }))
      .filter(g => g.items.length > 0)
  }, [groupedFinal, activeStoreFilter])

  const checkedFinalCount  = finalItems.filter(i => i.checked).length
  const checkedExtrasCount = extras.filter(e => e.checked).length
  const checkedStapleCount = staples.filter(s => checkedStapleIds.has(s.id)).length
  const totalItems  = finalItems.length + extras.length + staples.length
  const totalDone   = checkedFinalCount + checkedExtrasCount + checkedStapleCount
  const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

  function GroupLabel({ group }) {
    return (
      <div className="grocery-group-label" style={{ background: 'var(--hp-green-50)' }}>
        <span className="grocery-group-dot" style={{ background: group.color || '#8C9189' }} />
        <span className="grocery-group-name">{group.label.toUpperCase()}</span>
        {group.aisle_label && <span className="grocery-group-aisle">{group.aisle_label}</span>}
        <span className="grocery-group-count">{group.items.length}</span>
      </div>
    )
  }

  return (
    <div className="page grocery-page">
      <div className="page-hero">
        <div className="page-hero-top">
          <span className="t-eyebrow" style={{ color: 'var(--ink-400)' }}>Grocery</span>
          {weekNav}
        </div>
        <div className="grocery-final-hero-row">
          <h1 className="page-hero-title" style={{ margin: 0 }}>The list.</h1>
          <button className="grocery-start-over-btn" onClick={onStartOver}>
            ← Start over
          </button>
        </div>
      </div>

      <div className="grocery-body">
        {/* Main column: compiled items */}
        <div className="grocery-main">
          {finalItems.length === 0 ? (
            <div className="grocery-card">
              <div className="grocery-empty-state" style={{ padding: '24px 20px' }}>
                <p style={{ color: 'var(--hp-ink-400)', fontSize: 14 }}>
                  Your compiled list is empty. <button className="btn btn-ghost btn-sm" onClick={onStartOver}>Start over</button>
                </p>
              </div>
            </div>
          ) : (
            <div className="grocery-card">
              <div className="grocery-card-controls">
                <div className="grocery-controls-header">
                  <span className="grocery-controls-from-label">Shopping list</span>
                  <div className="grocery-controls-progress">
                    <div className="grocery-progress-bar" style={{ '--pct': `${pct}%` }} />
                  </div>
                  <span className="grocery-controls-count">{checkedFinalCount}/{finalItems.length}</span>
                  <div className="grocery-filter-chips">
                    <button
                      className={`grocery-filter-chip${!activeStoreFilter ? ' grocery-filter-chip--on' : ''}`}
                      onClick={() => setActiveStoreFilter(null)}
                    >
                      All <span className="grocery-filter-count">{finalItems.length}</span>
                    </button>
                    {stores.map(store => {
                      const cnt = storeFilterCounts[store.id] || 0
                      if (!cnt) return null
                      return (
                        <button key={store.id}
                          className={`grocery-filter-chip${activeStoreFilter === store.id ? ' grocery-filter-chip--on' : ''}`}
                          onClick={() => setActiveStoreFilter(store.id)}
                        >
                          {store.name} <span className="grocery-filter-count">{cnt}</span>
                        </button>
                      )
                    })}
                    {untaggedCount > 0 && (
                      <button
                        className={`grocery-filter-chip${activeStoreFilter === 'untagged' ? ' grocery-filter-chip--on' : ''}`}
                        onClick={() => setActiveStoreFilter('untagged')}
                      >
                        Untagged <span className="grocery-filter-count">{untaggedCount}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="grocery-card-body">
                {filteredGrouped.map(group => (
                  <div key={group.key} className="grocery-group">
                    <GroupLabel group={group} />
                    {group.items.map(item => (
                      <GroceryRow
                        key={item.id}
                        item={item}
                        checked={item.checked}
                        label={formatItemLabel(item)}
                        onToggle={() => onToggleFinalItem(item.id)}
                        onRemove={() => onRemoveFinalItem(item.id)}
                        storeId={item.storeId}
                        stores={stores}
                        onStoreChange={sid => onSetFinalItemStore(item.id, sid)}
                        onCategoryChange={gk => onSetFinalItemGroup(item.id, gk)}
                        groceryGroups={groceryGroups}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side column */}
        <div className="grocery-side">
          {/* Extra items (added after generation) */}
          <div className="grocery-side-panel">
            <div className="grocery-side-panel-header">
              <span className="grocery-side-panel-title">Added items</span>
              {extras.length > 0 && <span className="grocery-side-panel-count">{extras.length}</span>}
            </div>
            <div className="grocery-side-panel-body">
              {extras.length === 0 && (
                <p className="grocery-side-panel-empty">Anything you forgot? Add it here.</p>
              )}
              {extras.map(item => (
                <GroceryRow
                  key={item.id}
                  checked={item.checked}
                  label={item.name}
                  onToggle={() => onToggleExtra(item.id)}
                  onRemove={() => onRemoveExtra(item.id)}
                  storeId={item.storeId}
                  stores={stores}
                  onStoreChange={sid => onSetExtraStore(item.id, sid)}
                />
              ))}
              <AddItemRow
                value={newExtra}
                onChange={setNewExtra}
                onAdd={() => {
                  if (newExtra.trim()) { onAddExtra(newExtra.trim()); setNewExtra('') }
                }}
                placeholder="e.g. Paper towels…"
              />
            </div>
          </div>

          {/* Always on my list */}
          <div className="grocery-side-panel">
            <div className="grocery-side-panel-header">
              <span className="grocery-side-panel-title">Always on my list</span>
              {staples.length > 0 && <span className="grocery-side-panel-count">{staples.length}</span>}
            </div>
            <div className="grocery-side-panel-body">
              {staples.length === 0 && (
                <p className="grocery-side-panel-empty">Staples you buy every week.</p>
              )}
              <div className="grocery-staples-list">
                {staples.map(s => (
                  <div key={s.id} className={`grocery-staple-row ${checkedStapleIds.has(s.id) ? 'grocery-staple-row--checked' : ''}`}>
                    <button
                      className={`grocery-check grocery-staple-check ${checkedStapleIds.has(s.id) ? 'grocery-check--done' : ''}`}
                      onClick={() => onToggleStaple(s.id)}
                    >
                      {checkedStapleIds.has(s.id) && <IconCheck size={12} />}
                    </button>
                    <span className="grocery-staple-label">{s.name}</span>
                    <button className="grocery-staple-remove" onClick={() => onDeleteStaple(s.id)}>
                      <IconClose size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="grocery-add-row grocery-staples-add">
                <input
                  className="input input-sm grocery-add-input"
                  placeholder="e.g. Eggs, milk, bread…"
                  value={newStaple}
                  onChange={e => setNewStaple(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onAddStaple()}
                />
                <button className="btn btn-sm grocery-add-btn" onClick={onAddStaple}>
                  <IconPlus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── GroceryRow ───────────────────────────────────────────────────────────────
function GroceryRow({ item, checked, label, onToggle, onRemove, isStaple, storeId, stores, onStoreChange, onCategoryChange, groceryGroups: rowGroups }) {
  const [pickerOpen, setPickerOpen]       = useState(false)
  const [catPickerOpen, setCatPickerOpen] = useState(false)
  const catPickerRef = useRef(null)
  const showStores = stores?.length > 0 && onStoreChange
  const assignedStore = stores?.find(s => s.id === storeId)

  const allGroups = rowGroups || []
  const activeGroups = allGroups.filter(g => !g.hidden)
  const currentGroup = item
    ? (activeGroups.find(g => g.key === item.group) ?? activeGroups.find(g => g.key === 'other') ?? activeGroups[activeGroups.length - 1])
    : null

  useEffect(() => {
    if (!catPickerOpen) return
    function handler(e) {
      if (catPickerRef.current && !catPickerRef.current.contains(e.target)) setCatPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [catPickerOpen])

  const hasSplit = item && (item.quantity || item.unit)
  const FRACS = {
    0.25: '¼', 0.33: '⅓', 0.5: '½', 0.67: '⅔', 0.75: '¾',
    1.25: '1¼', 1.33: '1⅓', 1.5: '1½', 1.67: '1⅔', 1.75: '1¾',
    2.5: '2½', 3.5: '3½', 0.125: '⅛',
  }
  let qtyDisplay = ''
  if (hasSplit) {
    const qty = (item.quantity || '').toString().trim()
    const unit = (item.unit || '').toLowerCase().trim().replace(/,\s*$/, '')
    const showUnit = unit && unit !== 'unit' && unit !== 'units'
    let qtyStr = qty
    const num = parseFloat(qty)
    if (!isNaN(num)) {
      const k = Math.round(num * 100) / 100
      qtyStr = FRACS[k] != null ? FRACS[k] : (num % 1 === 0 ? String(num) : qty)
    }
    qtyDisplay = [qtyStr, showUnit ? unit : ''].filter(Boolean).join(' ')
  }

  const sources = item?.sources || []
  const sourceText = sources.join(', ')

  function handleStoreSelect(e, id) {
    e.stopPropagation()
    onStoreChange?.(id)
    setPickerOpen(false)
  }

  return (
    <div className={`grocery-row-wrap ${checked ? 'grocery-row-wrap--checked' : ''}`}>
      <div className="grocery-row">
        <button className={`grocery-check ${checked ? 'grocery-check--done' : ''}`} onClick={onToggle}>
          {checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
        </button>

        <div className="grocery-item-content">
          <span className="grocery-item-label">
            {hasSplit && qtyDisplay ? (
              <>
                <span className="grocery-item-qty">{qtyDisplay}</span>
                {' '}
                <span className="grocery-item-name">{item.name}</span>
              </>
            ) : (
              label
            )}
          </span>
          {sourceText && <span className="grocery-item-source">{sourceText}</span>}
        </div>

        {onCategoryChange && currentGroup && (
          <div ref={catPickerRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              title={`Category: ${currentGroup.label} — click to change`}
              onClick={e => { e.stopPropagation(); setCatPickerOpen(o => !o) }}
              style={{
                width: 22, height: 22, borderRadius: '50%',
                background: currentGroup.color + '22', border: `1.5px solid ${currentGroup.color}55`,
                display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: currentGroup.color, display: 'block' }} />
            </button>
            {catPickerOpen && (
              <div style={{
                position: 'absolute', right: 0, bottom: 'calc(100% + 6px)',
                background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-100)',
                borderRadius: 'var(--r-md)', boxShadow: '0 8px 24px rgba(14,18,18,0.12)',
                zIndex: 300, minWidth: 180, padding: '4px 0', overflow: 'hidden',
              }}>
                <div style={{ padding: '7px 12px 5px', fontFamily: 'var(--hp-font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--hp-ink-400)' }}>
                  Move to category
                </div>
                {activeGroups.map(g => (
                  <button key={g.key}
                    onClick={e => { e.stopPropagation(); onCategoryChange(g.key); setCatPickerOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 12px',
                      background: g.key === item?.group ? 'var(--hp-ink-50)' : 'none',
                      border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--hp-font-body)', fontSize: 13,
                      fontWeight: g.key === item?.group ? 600 : 400,
                      color: g.key === item?.group ? 'var(--hp-ink-900)' : 'var(--hp-ink-700)',
                      textAlign: 'left', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (g.key !== item?.group) e.currentTarget.style.background = 'var(--hp-ink-50)' }}
                    onMouseLeave={e => { if (g.key !== item?.group) e.currentTarget.style.background = 'none' }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: g.color, flexShrink: 0, display: 'block' }} />
                    {g.emoji} {g.label}
                    {g.key === item?.group && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--hp-ink-400)' }}>current</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {showStores && (
          <button
            className={`grocery-store-badge ${assignedStore ? 'grocery-store-badge--set' : 'grocery-store-badge--unset'} ${pickerOpen ? 'grocery-store-badge--open' : ''}`}
            style={assignedStore ? (() => { const p = getStorePalette(assignedStore); return { background: p.bg, color: p.color, borderColor: p.border } })() : undefined}
            onClick={e => { e.stopPropagation(); setPickerOpen(p => !p) }}
            title={pickerOpen ? 'Close' : assignedStore ? `${assignedStore.name} — tap to change` : 'Assign to a store'}
          >
            {assignedStore ? assignedStore.name : '+ store'}
          </button>
        )}

        {onRemove && (
          <button className="grocery-remove" onClick={onRemove} title={isStaple ? 'Remove from always list' : 'Remove'}>
            <IconClose size={13} />
          </button>
        )}
      </div>

      {pickerOpen && showStores && (
        <div className="grocery-store-picker">
          {stores.map(store => (
            <button
              key={store.id}
              className={`grocery-store-picker-pill ${storeId === store.id ? 'grocery-store-picker-pill--active' : ''}`}
              onClick={e => handleStoreSelect(e, store.id)}
            >
              {storeId === store.id && <span className="grocery-picker-dot" />}
              {store.name}
            </button>
          ))}
          {storeId && (
            <button className="grocery-store-picker-pill grocery-store-picker-pill--clear" onClick={e => handleStoreSelect(e, null)}>
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── AddItemRow ───────────────────────────────────────────────────────────────
function AddItemRow({ value, onChange, onAdd, placeholder }) {
  return (
    <div className="grocery-add-row">
      <input
        className="input input-sm grocery-add-input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onAdd() }}
      />
      <button className="btn btn-sm grocery-add-btn" onClick={onAdd} disabled={!value.trim()}>
        <IconPlus size={14} />
      </button>
    </div>
  )
}
