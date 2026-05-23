import { useState, useEffect, useMemo, useRef } from 'react'
import { useUser } from '../hooks/useAuth.jsx'
import { getMealPlan, saveMealPlan, getRecipes, getStaples, addStaple, deleteStaple } from '../lib/supabase'
import { getWeekKey, shiftWeek, formatWeekOf } from '../lib/weeks'
import { ChevronLeft, ChevronRight, Plus, X, Check, RotateCcw } from 'lucide-react'
import './Grocery.css'

// ─── Pantry check ingredients ─────────────────────────────────────────────────
// These are cooking fundamentals most kitchens have on hand.
// Instead of suppressing them, we surface them in a "Check your pantry" card
// so the user can verify they're stocked before shopping.
const PANTRY_CHECK_INGREDIENTS = new Set([
  'salt', 'sea salt', 'kosher salt', 'table salt',
  'pepper', 'black pepper', 'white pepper', 'ground pepper', 'freshly ground pepper',
  'salt and pepper',
  'olive oil', 'oil', 'vegetable oil', 'canola oil', 'cooking oil', 'coconut oil',
  'sesame oil',
  'butter', 'unsalted butter', 'salted butter',
  'water',
  'garlic', 'garlic clove', 'garlic cloves', 'minced garlic',
  'flour', 'all purpose flour', 'all-purpose flour', 'whole wheat flour',
  'sugar', 'white sugar', 'granulated sugar', 'brown sugar', 'powdered sugar',
  'baking soda', 'baking powder',
  'vanilla', 'vanilla extract',
  'vinegar', 'apple cider vinegar', 'white vinegar', 'red wine vinegar', 'balsamic vinegar',
  'soy sauce', 'tamari',
  'hot sauce',
  'worcestershire sauce',
  'fish sauce',
  'paprika', 'smoked paprika',
  'cumin', 'oregano', 'basil', 'thyme', 'rosemary', 'bay leaf', 'bay leaves',
  'chili powder', 'cayenne', 'cayenne pepper', 'red pepper flakes', 'crushed red pepper',
  'cinnamon', 'nutmeg', 'turmeric', 'ginger powder', 'garlic powder', 'onion powder',
  'italian seasoning', 'mixed herbs', 'dried herbs',
  'cornstarch', 'corn starch',
  'nonstick spray', 'cooking spray',
  'lemon juice', 'lime juice',
  'dijon mustard', 'mustard',
  'honey', 'maple syrup',
  'ketchup', 'mayonnaise', 'mayo',
  'chicken broth', 'beef broth', 'vegetable broth', 'broth', 'stock',
  'peanut butter',
  'olive', 'capers',
])

// Vague/non-actionable quantity signals — if a quantity contains only these, suppress
const VAGUE_QTY_PATTERNS = [
  /^(a\s+)?(pinch|dash|splash|drizzle|touch|sprinkle|squeeze|handful|few|little|bit|taste|needed|desired|preferred|optional|garnish|to\s+taste|as\s+needed|as\s+desired|to\s+season)s?$/i,
  /^to\s+taste$/i,
  /^as\s+needed$/i,
]

function isVagueQty(qty) {
  if (!qty) return false
  const q = qty.toString().trim()
  return VAGUE_QTY_PATTERNS.some(p => p.test(q))
}

// ─── Normalize an ingredient name for deduplication ──────────────────────────
function normalizeName(name) {
  return name
    .toLowerCase()
    .trim()
    // strip leading articles
    .replace(/^(a|an|the)\s+/i, '')
    // collapse whitespace
    .replace(/\s+/g, ' ')
    // naive pluralization: trailing 's' — helps match "egg" and "eggs"
    .replace(/s$/, '')
}

// ─── Grocery category grouping ───────────────────────────────────────────────
const GROCERY_GROUPS = [
  {
    key: 'produce',
    label: 'Produce',
    emoji: '🥦',
    keywords: [
      'apple', 'banana', 'berry', 'berries', 'blueberr', 'strawberr', 'raspberr', 'grape',
      'orange', 'lemon', 'lime', 'mango', 'peach', 'plum', 'pear', 'pineapple', 'melon',
      'watermelon', 'cantaloupe', 'kiwi', 'avocado', 'tomato', 'cherry',
      'lettuce', 'spinach', 'kale', 'arugula', 'cabbage', 'chard', 'collard',
      'broccoli', 'cauliflower', 'zucchini', 'squash', 'cucumber', 'celery',
      'carrot', 'beet', 'radish', 'turnip', 'parsnip',
      'onion', 'shallot', 'leek', 'scallion', 'green onion',
      'pepper', 'bell pepper', 'jalapeño', 'jalapeno',
      'mushroom', 'asparagus', 'artichoke', 'eggplant', 'corn', 'pea',
      'green bean', 'snap pea', 'edamame', 'sprout',
      'potato', 'sweet potato', 'yam',
      'herb', 'cilantro', 'parsley', 'dill', 'mint', 'basil', 'chive',
      'ginger', 'jalapeño', 'garlic', 'shallot',
      'fruit', 'vegetable', 'veggie', 'produce',
    ],
  },
  {
    key: 'meat',
    label: 'Meat & Seafood',
    emoji: '🥩',
    keywords: [
      'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'veal', 'bison',
      'steak', 'ground beef', 'ground turkey', 'ground chicken', 'ground pork',
      'breast', 'thigh', 'drumstick', 'wing', 'tenderloin', 'loin', 'rib', 'chop',
      'sausage', 'bacon', 'ham', 'prosciutto', 'salami', 'pepperoni', 'chorizo',
      'hot dog', 'bratwurst',
      'salmon', 'tuna', 'shrimp', 'cod', 'tilapia', 'halibut', 'trout',
      'crab', 'lobster', 'clam', 'oyster', 'mussel', 'scallop', 'squid',
      'fish', 'seafood', 'meat',
    ],
  },
  {
    key: 'dairy',
    label: 'Dairy & Eggs',
    emoji: '🥛',
    keywords: [
      'milk', 'whole milk', 'skim milk', 'almond milk', 'oat milk', 'soy milk',
      'cream', 'heavy cream', 'sour cream', 'whipped cream', 'half and half', 'half & half',
      'butter',
      'cheese', 'cheddar', 'mozzarella', 'parmesan', 'parmigiano', 'feta', 'brie',
      'gouda', 'gruyere', 'ricotta', 'cottage cheese', 'cream cheese', 'goat cheese',
      'yogurt', 'greek yogurt',
      'egg', 'eggs',
      'dairy',
    ],
  },
  {
    key: 'bakery',
    label: 'Bread & Bakery',
    emoji: '🍞',
    keywords: [
      'bread', 'loaf', 'baguette', 'roll', 'bun', 'bagel', 'english muffin',
      'tortilla', 'wrap', 'pita', 'naan', 'flatbread', 'sourdough', 'rye bread',
      'croissant', 'muffin', 'donut', 'danish',
      'breadcrumb', 'crouton',
    ],
  },
  {
    key: 'frozen',
    label: 'Frozen',
    emoji: '🧊',
    keywords: [
      'frozen', 'ice cream', 'gelato', 'sorbet', 'popsicle',
      'frozen pea', 'frozen corn', 'frozen vegetable', 'frozen fruit',
      'frozen pizza', 'frozen meal', 'frozen waffle',
    ],
  },
  {
    key: 'canned',
    label: 'Canned & Jarred',
    emoji: '🥫',
    keywords: [
      'canned', 'can of', 'jar of',
      'tomato sauce', 'tomato paste', 'diced tomato', 'crushed tomato', 'tomato puree',
      'coconut milk', 'coconut cream',
      'bean', 'lentil', 'chickpea', 'garbanzo', 'black bean', 'kidney bean',
      'white bean', 'cannellini', 'pinto bean',
      'broth', 'stock', 'chicken broth', 'beef broth', 'vegetable broth',
      'soup', 'chili',
      'tuna', 'sardine', 'anchovy',
      'olive', 'pickle', 'capers', 'artichoke heart',
      'peanut butter', 'almond butter', 'tahini', 'jam', 'jelly', 'honey', 'maple syrup',
      'salsa', 'hot sauce',
    ],
  },
  {
    key: 'pantry',
    label: 'Pantry & Dry Goods',
    emoji: '🌾',
    keywords: [
      'pasta', 'spaghetti', 'penne', 'linguine', 'fettuccine', 'rigatoni', 'orzo',
      'rice', 'brown rice', 'white rice', 'quinoa', 'couscous', 'farro', 'barley',
      'oat', 'oatmeal', 'granola', 'cereal',
      'noodle', 'ramen', 'udon', 'soba',
      'flour', 'sugar', 'powdered sugar', 'brown sugar',
      'baking soda', 'baking powder', 'yeast',
      'cocoa', 'chocolate', 'chip', 'nuts', 'almond', 'walnut', 'pecan', 'cashew',
      'dried fruit', 'raisin', 'cranberry', 'apricot',
      'oil', 'vinegar',
      'sauce', 'dressing', 'condiment', 'ketchup', 'mustard', 'mayo', 'mayonnaise',
      'spice', 'seasoning', 'herb',
      'cracker', 'chip', 'pretzel', 'popcorn',
      'protein powder', 'supplement',
      'coffee', 'tea', 'coffee bean', 'ground coffee',
    ],
  },
  {
    key: 'beverages',
    label: 'Beverages',
    emoji: '🥤',
    keywords: [
      'juice', 'orange juice', 'apple juice', 'lemonade',
      'soda', 'sparkling water', 'water', 'sports drink', 'energy drink',
      'beer', 'wine', 'spirits', 'alcohol',
    ],
  },
]

function assignGroup(name) {
  const lower = name.toLowerCase()
  for (const group of GROCERY_GROUPS) {
    if (group.keywords.some(kw => lower.includes(kw))) return group.key
  }
  return 'other'
}

// ─── Consolidation ────────────────────────────────────────────────────────────
// Returns { shopItems, pantryItems } — both consolidated, pantry separated out
function consolidate(raw) {
  // Deduplicate by normalized name, collecting quantity info
  const map = new Map()

  raw.forEach(({ name, quantity, unit }) => {
    // Drop items with only vague quantities and no unit
    if (isVagueQty(quantity) && !unit?.trim()) return

    const key = normalizeName(name)
    const numQty = parseFloat(quantity)
    const normUnit = (unit || '').toLowerCase().trim()

    if (map.has(key)) {
      const entry = map.get(key)
      const sameUnit = entry.unit === normUnit || (!entry.unit && !normUnit)
      if (!isNaN(numQty) && entry.numQty !== null && sameUnit) {
        entry.numQty += numQty
      } else {
        entry.numQty = null // mixed units or non-numeric — can't sum
      }
      if (!entry.unit && normUnit) entry.unit = normUnit
    } else {
      map.set(key, {
        name: name.trim(),
        unit: normUnit,
        numQty: isNaN(numQty) ? null : numQty,
        rawQty: quantity,
      })
    }
  })

  const shopItems = []
  const pantryItems = []

  Array.from(map.values()).forEach(({ name, unit, numQty, rawQty }, i) => {
    const qty = numQty !== null
      ? (numQty % 1 === 0 ? `${numQty}` : numQty.toFixed(2).replace(/\.?0+$/, ''))
      : (isVagueQty(rawQty) ? '' : (rawQty || ''))

    const item = { id: `g-${i}`, name, quantity: qty, unit, group: assignGroup(name) }
    const norm = normalizeName(name)
    const isPantry = PANTRY_CHECK_INGREDIENTS.has(norm) || PANTRY_CHECK_INGREDIENTS.has(name.toLowerCase().trim())

    if (isPantry) pantryItems.push(item)
    else shopItems.push(item)
  })

  const byName = (a, b) => a.name.localeCompare(b.name)
  return {
    shopItems: shopItems.sort(byName),
    pantryItems: pantryItems.sort(byName),
  }
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

  plan.breakfasts?.forEach(item => {
    if (!item.isPantry && item.recipeId) addRecipe(item.recipeId)
  })

  const seenLunch = new Set()
  plan.lunches?.forEach(item => {
    if (item.isPantry) return
    if (item.recipeId && !seenLunch.has(item.recipeId)) {
      seenLunch.add(item.recipeId); addRecipe(item.recipeId)
    }
    if (item.kidsRecipeId && !seenLunch.has(item.kidsRecipeId)) {
      seenLunch.add(item.kidsRecipeId); addRecipe(item.kidsRecipeId)
    }
  })

  plan.dinners?.forEach(item => {
    if (item.adultRecipeId) addRecipe(item.adultRecipeId, item.multiplier ?? 1)
    if (item.kidsRecipeId && item.kidsRecipeId !== item.adultRecipeId) addRecipe(item.kidsRecipeId)
  })

  plan.snacks?.forEach(item => {
    if (item.recipeId) addRecipe(item.recipeId, item.multiplier ?? 1)
  })

  const { shopItems, pantryItems } = consolidate(raw)
  return { shopItems, pantryItems }
}

function uid() { return Math.random().toString(36).slice(2, 9) }

// ─── Component ────────────────────────────────────────────────────────────────
export default function GroceryPage() {
  const user = useUser()
  const [weekKey, setWeekKey]   = useState(() => getWeekKey())
  const [plan, setPlan]         = useState(null)
  const [recipes, setRecipes]   = useState([])
  const [staples, setStaples]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [newExtra, setNewExtra] = useState('')
  const [newStaple, setNewStaple] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([
      getRecipes(user.id),
      getStaples(user.id),
    ]).then(([{ data: r }, { data: s }]) => {
      setRecipes(r || [])
      setStaples(s || [])
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

  const recipeMap = useMemo(
    () => Object.fromEntries(recipes.map(r => [r.id, r])),
    [recipes]
  )

  const { generated, pantryCheck } = useMemo(() => {
    if (!plan) return { generated: [], pantryCheck: [] }
    const { shopItems, pantryItems } = computeIngredients(plan, recipeMap)
    return { generated: shopItems, pantryCheck: pantryItems }
  }, [plan, recipeMap])

  // Group generated items by grocery aisle category
  const groupedGenerated = useMemo(() => {
    const groups = {}
    generated.forEach(item => {
      const g = item.group || 'other'
      if (!groups[g]) groups[g] = []
      groups[g].push(item)
    })
    const ordered = []
    for (const group of GROCERY_GROUPS) {
      if (groups[group.key]?.length) {
        ordered.push({ ...group, items: groups[group.key] })
      }
    }
    if (groups.other?.length) {
      ordered.push({ key: 'other', label: 'Other', emoji: '🛒', items: groups.other })
    }
    return ordered
  }, [generated])

  // ── AI-refined pantry list ────────────────────────────────────────────────
  // Fingerprint = sorted unique recipe IDs in this week's plan
  const planFingerprint = useMemo(() => {
    if (!plan) return ''
    const ids = new Set()
    plan.breakfasts?.forEach(i => i.recipeId && ids.add(i.recipeId))
    plan.lunches?.forEach(i => {
      i.recipeId && ids.add(i.recipeId)
      i.kidsRecipeId && ids.add(i.kidsRecipeId)
    })
    plan.dinners?.forEach(i => {
      i.adultRecipeId && ids.add(i.adultRecipeId)
      i.kidsRecipeId && ids.add(i.kidsRecipeId)
    })
    plan.snacks?.forEach(i => i.recipeId && ids.add(i.recipeId))
    return [...ids].sort().join(',')
  }, [plan])

  const [refinedPantry, setRefinedPantry]     = useState(null)  // null = not yet resolved
  const [pantryRefining, setPantryRefining]   = useState(false)
  const lastFingerprintRef = useRef(null)

  useEffect(() => {
    if (!plan) return
    if (!pantryCheck.length) { setRefinedPantry([]); return }

    // Use cached result if the plan recipes haven't changed
    const cached = plan.groceryPantryAI
    if (cached?.fingerprint === planFingerprint && Array.isArray(cached.names) && cached.names.length) {
      setRefinedPantry(cached.names.map((name, i) => ({ id: `p-${i}`, name, quantity: '', unit: '' })))
      return
    }

    // Avoid duplicate calls if fingerprint already in-flight
    if (lastFingerprintRef.current === planFingerprint) return
    lastFingerprintRef.current = planFingerprint

    // Show rule-based list immediately while AI refines
    setRefinedPantry(pantryCheck)
    setPantryRefining(true)

    const rawNames = pantryCheck
      .map(i => [i.quantity, i.unit, i.name].filter(Boolean).join(' ').trim())
      .filter(Boolean)

    const fp = planFingerprint

    fetch('/.netlify/functions/consolidate-pantry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: rawNames }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(names => {
        if (!Array.isArray(names) || !names.length) return
        setRefinedPantry(names.map((name, i) => ({ id: `p-${i}`, name, quantity: '', unit: '' })))
        // Cache so next page load skips the API call
        saveMealPlan(user.id, weekKey, { ...plan, groceryPantryAI: { fingerprint: fp, names } })
          .then(() => setPlan(p => ({ ...p, groceryPantryAI: { fingerprint: fp, names } })))
      })
      .catch(() => {
        // Leave the rule-based list showing — it's better than nothing
      })
      .finally(() => setPantryRefining(false))
  }, [planFingerprint]) // eslint-disable-line react-hooks/exhaustive-deps

  // The pantry list we actually display
  const displayPantry = refinedPantry ?? pantryCheck

  const checkedGenerated      = useMemo(() => new Set(plan?.groceryChecked ?? []),         [plan])
  const checkedPantry         = useMemo(() => new Set(plan?.groceryPantryChecked ?? []),  [plan])
  const extras                = plan?.groceryExtras ?? []
  const checkedStapleIds      = useMemo(() => new Set(plan?.groceryStaplesChecked ?? []),  [plan])

  async function updatePlan(changes) {
    const updated = { ...plan, ...changes }
    setPlan(updated)
    await saveMealPlan(user.id, weekKey, updated)
  }

  function genKey(item) { return `${item.name.toLowerCase().trim()}::${item.unit.toLowerCase().trim()}` }
  function toggleGenerated(item) {
    const next = new Set(checkedGenerated)
    next.has(genKey(item)) ? next.delete(genKey(item)) : next.add(genKey(item))
    updatePlan({ groceryChecked: [...next] })
  }
  function togglePantry(item) {
    const next = new Set(checkedPantry)
    next.has(genKey(item)) ? next.delete(genKey(item)) : next.add(genKey(item))
    updatePlan({ groceryPantryChecked: [...next] })
  }

  function toggleExtra(id) {
    updatePlan({ groceryExtras: extras.map(m => m.id === id ? { ...m, checked: !m.checked } : m) })
  }
  function addExtra() {
    const name = newExtra.trim(); if (!name) return
    updatePlan({ groceryExtras: [...extras, { id: uid(), name, checked: false }] })
    setNewExtra('')
  }
  function removeExtra(id) {
    updatePlan({ groceryExtras: extras.filter(m => m.id !== id) })
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

  const genChecked     = generated.filter(i => checkedGenerated.has(genKey(i))).length
  const pantryChecked  = displayPantry.filter(i => checkedPantry.has(genKey(i))).length
  const extrasChecked  = extras.filter(m => m.checked).length
  const staplesChecked = staples.filter(s => checkedStapleIds.has(s.id)).length
  const totalChecked   = genChecked + pantryChecked + extrasChecked + staplesChecked
  const totalItems     = generated.length + displayPantry.length + extras.length + staples.length

  function uncheckAll() {
    updatePlan({
      groceryChecked:        [],
      groceryPantryChecked:  [],
      groceryExtras:         extras.map(m => ({ ...m, checked: false })),
      groceryStaplesChecked: [],
    })
  }

  return (
    <div className="page grocery-page">
      <div className="page-header">
        <h1 className="page-title">Grocery</h1>
        {totalChecked > 0 && (
          <button className="btn btn-ghost btn-sm grocery-uncheck-btn" onClick={uncheckAll}>
            <RotateCcw size={13} strokeWidth={2} /> Uncheck all
          </button>
        )}
      </div>

      {/* Week nav */}
      <div className="grocery-week-nav">
        <button className="btn btn-ghost btn-sm" onClick={() => setWeekKey(k => shiftWeek(k, -1))}>
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="planner-week-label">{formatWeekOf(weekKey)}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setWeekKey(k => shiftWeek(k, 1))}>
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        {weekKey !== getWeekKey() && (
          <button className="btn btn-ghost btn-sm planner-today-btn" onClick={() => setWeekKey(getWeekKey())}>
            This week
          </button>
        )}
      </div>

      {/* Progress */}
      {!loading && totalItems > 0 && (
        <div className="grocery-progress">
          <div className="grocery-progress-bar"
            style={{ '--pct': `${Math.round((totalChecked / totalItems) * 100)}%` }} />
          <span className="grocery-progress-label">
            {totalChecked} of {totalItems} items
          </span>
        </div>
      )}

      {loading ? (
        <div className="page-placeholder"><p>Loading…</p></div>
      ) : (
        <div className="grocery-sections">

          {/* ── From your plan ── */}
          <GroceryCard
            title="From your plan"
            count={generated.length}
            hint={generated.length === 0
              ? `No recipes planned for ${formatWeekOf(weekKey)} yet — add meals in the Planner first.`
              : null}
          >
            {groupedGenerated.length > 0 ? (
              groupedGenerated.map(group => (
                <div key={group.key} className="grocery-group">
                  <div className="grocery-group-label">
                    <span className="grocery-group-emoji">{group.emoji}</span>
                    {group.label}
                  </div>
                  {group.items.map(item => {
                    const checked = checkedGenerated.has(genKey(item))
                    const label   = [item.quantity, item.unit, item.name].filter(Boolean).join(' ')
                    return (
                      <GroceryRow key={item.id} checked={checked} label={label}
                        onToggle={() => toggleGenerated(item)} />
                    )
                  })}
                </div>
              ))
            ) : null}
          </GroceryCard>

          {/* ── Pantry check ── */}
          {(displayPantry.length > 0 || pantryRefining) && (
            <GroceryCard
              title="Check your pantry"
              count={displayPantry.length}
              hint={pantryRefining
                ? 'Consolidating…'
                : "Your recipes call for these — make sure you're stocked up."}
              hintRefining={pantryRefining}
              pantry
            >
              {displayPantry.map(item => {
                const checked = checkedPantry.has(genKey(item))
                const label   = [item.quantity, item.unit, item.name].filter(Boolean).join(' ')
                return (
                  <GroceryRow key={item.id} checked={checked} label={label}
                    onToggle={() => togglePantry(item)} />
                )
              })}
            </GroceryCard>
          )}

          {/* ── Added for this week ── */}
          <GroceryCard title="Added for this week" count={extras.length}>
            {extras.map(item => (
              <GroceryRow key={item.id} checked={item.checked} label={item.name}
                onToggle={() => toggleExtra(item.id)}
                onRemove={() => removeExtra(item.id)} />
            ))}
            <AddItemRow
              value={newExtra}
              onChange={setNewExtra}
              onAdd={addExtra}
              placeholder="e.g. Paper towels, sparkling water…"
            />
          </GroceryCard>

          {/* ── Always on my list (staples) ── */}
          <GroceryCard
            title="Always on my list"
            count={staples.length}
            hint="Items saved here appear every week."
          >
            {staples.map(s => (
              <GroceryRow key={s.id} checked={checkedStapleIds.has(s.id)} label={s.name}
                onToggle={() => toggleStaple(s.id)}
                onRemove={() => handleDeleteStaple(s.id)}
                isStaple />
            ))}
            <AddItemRow
              value={newStaple}
              onChange={setNewStaple}
              onAdd={handleAddStaple}
              placeholder="e.g. Eggs, milk, bread…"
            />
          </GroceryCard>

        </div>
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function GroceryCard({ title, count, hint, pantry, hintRefining, children }) {
  return (
    <div className={`grocery-card ${pantry ? 'grocery-card--pantry' : ''}`}>
      <div className="grocery-card-header">
        <span className="grocery-card-title">{title}</span>
        {count > 0 && <span className="grocery-card-count">{count}</span>}
      </div>
      {hint && (
        <p className={`grocery-card-hint ${hintRefining ? 'grocery-card-hint--refining' : ''}`}>
          {hint}
        </p>
      )}
      <div className="grocery-card-body">{children}</div>
    </div>
  )
}

function GroceryRow({ checked, label, onToggle, onRemove, isStaple }) {
  return (
    <div className={`grocery-row ${checked ? 'grocery-row--checked' : ''}`}>
      <button className={`grocery-check ${checked ? 'grocery-check--done' : ''}`} onClick={onToggle}>
        {checked && <Check size={12} strokeWidth={3} />}
      </button>
      <span className="grocery-label">{label}</span>
      {onRemove && (
        <button className="grocery-remove" onClick={onRemove} title={isStaple ? 'Remove from always list' : 'Remove'}>
          <X size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

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
      <button className="btn btn-secondary btn-sm" onClick={onAdd} disabled={!value.trim()}>
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  )
}
