import { useState, useEffect, useMemo, useRef } from 'react'
import { useUser } from '../hooks/useAuth.jsx'
import { getMealPlan, saveMealPlan, getRecipes, getStaples, addStaple, deleteStaple, getStores } from '../lib/supabase'
import { getWeekKey, shiftWeek, formatWeekOf } from '../lib/weeks'
import { IconChevronL, IconChevronR, IconPlus, IconClose, IconCheck, IconRefresh } from '../components/icons'
import { EmptyGrocery } from '../components/EmptyStates'
import './Grocery.css'

// ─── Pantry check ingredients ─────────────────────────────────────────────────
// These are cooking fundamentals most kitchens have on hand.
// Instead of suppressing them, we surface them in a "Check your pantry" card
// so the user can verify they're stocked before shopping.
const PANTRY_CHECK_INGREDIENTS = new Set([
  'salt', 'sea salt', 'kosher salt', 'table salt', 'coarse salt', 'garlic salt', 'seasoned salt',
  'pepper', 'black pepper', 'white pepper', 'ground pepper', 'freshly ground pepper',
  'ground black pepper', 'freshly ground black pepper',
  'salt and pepper',
  'olive oil', 'extra virgin olive oil', 'extra-virgin olive oil',
  'oil', 'vegetable oil', 'canola oil', 'cooking oil', 'coconut oil', 'sesame oil',
  'butter', 'unsalted butter', 'salted butter',
  'water', 'pasta water', 'reserved pasta water',
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
  'paprika', 'smoked paprika', 'ground paprika',
  'cumin', 'ground cumin',
  'oregano', 'dried oregano',
  'basil', 'dried basil',
  'thyme', 'dried thyme',
  'rosemary', 'dried rosemary',
  'parsley', 'dried parsley',
  'bay leaf', 'bay leaves',
  'chili powder', 'cayenne', 'cayenne pepper', 'red pepper flakes', 'crushed red pepper',
  'cinnamon', 'ground cinnamon',
  'nutmeg', 'ground nutmeg',
  'turmeric', 'ground turmeric',
  'ginger powder', 'ground ginger',
  'garlic powder', 'onion powder',
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

// ─── Strip qualifiers to get the core ingredient name ────────────────────────
// Handles names like "salt for pasta water", "olive oil (for broccoli)",
// "1¼ tablespoons olive oil (for broccoli)", "pepper to taste",
// "chili powder or other seasonings (optional)", "garlic, minced".
function coreIngredient(name) {
  if (!name?.trim()) return ''
  let s = name.toLowerCase().trim()
  // Strip leading measurements: "1¼ tablespoons", "2 large", "a pinch of"
  s = s.replace(
    /^[\d¼½¾⅓⅔⅛⅜⅝⅞.,\/ ]+\s*(tablespoons?|tbsps?|teaspoons?|tsps?|cups?|ounces?|oz|pounds?|lbs?|grams?|g\b|ml|liters?|l\b|fl\s*oz|packages?|pkgs?|cans?|jars?|bunches?|heads?|cloves?|slices?|pieces?|strips?|dashes?|pinches?|sprigs?|stalks?|large|medium|small)(\s+of)?\s*/i,
    ''
  )
  s = s.replace(/^(a\s+)?(pinch|dash)(\s+of)?\s+/i, '')
  // Strip parenthetical notes: "(for broccoli)", "(optional)", "(to taste)"
  s = s.replace(/\s*\([^)]*\)\s*/g, ' ')
  // Strip comma-prep descriptors: ", minced", ", chopped", etc.
  s = s.replace(/,\s*.+$/, '')
  // Strip trailing "for X" phrases: "salt for pasta water"
  s = s.replace(/\s+for\s+(the\s+)?\w+(\s+\w+){0,3}$/i, '')
  // Strip trailing qualifiers
  s = s.replace(/,?\s*(to\s+taste|as\s+needed|if\s+desired|optional|to\s+season|as\s+desired)\s*$/i, '')
  // Strip trailing "or other X": "chili powder or other seasonings"
  s = s.replace(/\s+or\s+other\s+\w+(\s+\w+){0,2}$/i, '')
  return s.replace(/\s+/g, ' ').trim()
}

// ─── Check if an ingredient name resolves to a pantry staple ─────────────────
// Tries the raw name, normalized, core ingredient, and normalized core —
// so qualifiers like "(for broccoli)" or "to taste" don't cause misses.
function checkIsPantry(name) {
  const lower = name.toLowerCase().trim()
  if (PANTRY_CHECK_INGREDIENTS.has(lower)) return true
  const norm = normalizeName(name)
  if (PANTRY_CHECK_INGREDIENTS.has(norm)) return true
  const core = coreIngredient(name)
  if (core && PANTRY_CHECK_INGREDIENTS.has(core)) return true
  const coreNorm = normalizeName(core)
  if (coreNorm && PANTRY_CHECK_INGREDIENTS.has(coreNorm)) return true
  return false
}

// ─── Grocery category grouping ───────────────────────────────────────────────
const GROCERY_GROUPS = [
  {
    key: 'produce',
    label: 'Produce',
    color: '#58CC02',  /* spring */
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
    color: '#E63957',  /* cherry */
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
    color: '#FFC228',  /* marigold */
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
    color: '#FF7733',  /* tangerine */
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
    color: '#3DA002',  /* spring-700 */
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
    color: '#C99100',  /* marigold-700 */
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
    color: '#8C9189',  /* ink-400 */
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
    color: '#5C625E',  /* ink-500 */
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
  // Deduplicate by core ingredient name so variants like "salt for pasta water"
  // and "salt (for broccoli)" collapse into a single "Salt" pantry entry.
  const map = new Map()

  raw.forEach(({ name, quantity, unit }) => {
    const isPantryItem = checkIsPantry(name)

    // Drop vague-quantity items from the shop list, but always keep pantry
    // ingredients — they just need to appear in the "check your pantry" section
    // regardless of how the recipe specified the quantity
    if (isVagueQty(quantity) && !unit?.trim() && !isPantryItem) return

    const core     = coreIngredient(name)
    const key      = core || normalizeName(name)
    const numQty   = parseFloat(quantity)
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
      // Pantry items: show the clean core name (e.g. "Salt", "Olive oil").
      // Shop items: preserve the original name for clarity.
      const displayName = isPantryItem
        ? (core ? core.charAt(0).toUpperCase() + core.slice(1) : name.trim())
        : name.trim()
      map.set(key, {
        name: displayName,
        unit: normUnit,
        numQty: isNaN(numQty) ? null : numQty,
        rawQty: quantity,
        isPantryItem,
      })
    }
  })

  const shopItems  = []
  const pantryItems = []

  Array.from(map.values()).forEach(({ name, unit, numQty, rawQty, isPantryItem }, i) => {
    const qty = numQty !== null
      ? (numQty % 1 === 0 ? `${numQty}` : numQty.toFixed(2).replace(/\.?0+$/, ''))
      : (isVagueQty(rawQty) ? '' : (rawQty || ''))

    const item = { id: `g-${i}`, name, quantity: qty, unit, group: assignGroup(name) }

    if (isPantryItem) pantryItems.push(item)
    else shopItems.push(item)
  })

  const byName = (a, b) => a.name.localeCompare(b.name)
  return {
    shopItems:  shopItems.sort(byName),
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
    item.sides?.forEach(side => {
      if (side.recipeId) addRecipe(side.recipeId, item.multiplier ?? 1)
    })
  })

  plan.snacks?.forEach(item => {
    if (item.recipeId) addRecipe(item.recipeId, item.multiplier ?? 1)
  })

  const { shopItems, pantryItems } = consolidate(raw)
  return { shopItems, pantryItems }
}

// ─── Natural-language label formatting (client-side, instant) ────────────────
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

function uid() { return Math.random().toString(36).slice(2, 9) }

// ─── Component ────────────────────────────────────────────────────────────────
export default function GroceryPage() {
  const user = useUser()
  const [weekKey, setWeekKey]     = useState(() => getWeekKey())
  const [plan, setPlan]           = useState(null)
  const [recipes, setRecipes]     = useState([])
  const [staples, setStaples]     = useState([])
  const [stores, setStores]       = useState([])
  const [activeStoreId, setActiveStoreId] = useState(() => localStorage.getItem('hp-active-store') || null)
  const [viewByStore, setViewByStore]     = useState(false)
  const [loading, setLoading]     = useState(true)
  const [newExtra, setNewExtra]   = useState('')
  const [newStaple, setNewStaple] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([
      getRecipes(user.id),
      getStaples(user.id),
      getStores(user.id),
    ]).then(([{ data: r }, { data: s }, { data: st }]) => {
      setRecipes(r || [])
      setStaples(s || [])
      setStores(st || [])
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

  const activeStore = useMemo(
    () => stores.find(s => s.id === activeStoreId) || null,
    [stores, activeStoreId]
  )

  function handleSetActiveStore(id) {
    setActiveStoreId(id)
    if (id) localStorage.setItem('hp-active-store', id)
    else localStorage.removeItem('hp-active-store')
  }

  const { generated, pantryCheck } = useMemo(() => {
    if (!plan) return { generated: [], pantryCheck: [] }
    const { shopItems, pantryItems } = computeIngredients(plan, recipeMap)
    return { generated: shopItems, pantryCheck: pantryItems }
  }, [plan, recipeMap])

  // Group generated items by grocery aisle category.
  // When a store is active, uses that store's aisle ordering and labels.
  const groupedGenerated = useMemo(() => {
    const groups = {}
    generated.forEach(item => {
      const g = item.group || 'other'
      if (!groups[g]) groups[g] = []
      groups[g].push(item)
    })

    // Build ordered display list: store layout if available, otherwise GROCERY_GROUPS default
    let displayOrder
    if (activeStore?.aisles?.length) {
      const sorted = [...activeStore.aisles].sort((a, b) => a.order - b.order)
      displayOrder = sorted.map(aisle => {
        const base = GROCERY_GROUPS.find(g => g.key === aisle.group_key)
        return base
          ? { ...base, aisle_label: aisle.aisle_label }   // keep emoji/label, add aisle_label
          : { key: aisle.group_key, label: aisle.group_key, emoji: '🛒', aisle_label: aisle.aisle_label }
      })
    } else {
      displayOrder = GROCERY_GROUPS
    }

    const ordered = []
    const seen = new Set()
    for (const group of displayOrder) {
      if (groups[group.key]?.length) {
        ordered.push({ ...group, items: groups[group.key] })
        seen.add(group.key)
      }
    }
    // Any items whose category isn't in the store layout fall through to "Other"
    if (groups.other?.length && !seen.has('other')) {
      ordered.push({ key: 'other', label: 'Other', emoji: '🛒', items: groups.other })
    }
    return ordered
  }, [generated, activeStore])

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
      i.sides?.forEach(s => s.recipeId && ids.add(s.recipeId))
    })
    plan.snacks?.forEach(i => i.recipeId && ids.add(i.recipeId))
    return [...ids].sort().join(',')
  }, [plan])

  const [refinedPantry, setRefinedPantry]       = useState(null)
  const [refinedShopLabels, setRefinedShopLabels] = useState(null) // { [item.id]: cleanedLabel }
  const [pantryRefining, setPantryRefining]       = useState(false)

  // Stable keys — change when recipe ingredients load, triggering the AI effect
  const pantryKey = useMemo(
    () => pantryCheck.map(i => i.name.toLowerCase()).sort().join('|'),
    [pantryCheck]
  )
  const shopKey = useMemo(
    () => generated.map(i => i.name.toLowerCase()).sort().join('|'),
    [generated]
  )

  useEffect(() => {
    if (!plan) return
    if (!pantryCheck.length && !generated.length) return

    // Use cached AI result if the recipe set hasn't changed
    const cached = plan.groceryAI
    if (cached?.fingerprint === planFingerprint) {
      if (Array.isArray(cached.pantryNames) && cached.pantryNames.length) {
        setRefinedPantry(cached.pantryNames.map((name, i) => ({ id: `p-${i}`, name, quantity: '', unit: '' })))
      }
      if (cached.shopLabels && typeof cached.shopLabels === 'object') {
        setRefinedShopLabels(cached.shopLabels)
      }
      return
    }

    // Show rule-based/client-formatted lists immediately while AI refines
    setRefinedPantry(pantryCheck.length ? pantryCheck : null)
    setPantryRefining(true)

    const pantryItems = pantryCheck
      .map(i => [i.quantity, i.unit, i.name].filter(Boolean).join(' ').trim())
      .filter(Boolean)

    const shopItems = generated.map(i => formatItemLabel(i))

    const fp = planFingerprint

    fetch('/.netlify/functions/consolidate-pantry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pantryItems, shopItems }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ pantryNames, shopLabels }) => {
        if (Array.isArray(pantryNames) && pantryNames.length) {
          setRefinedPantry(pantryNames.map((name, i) => ({ id: `p-${i}`, name, quantity: '', unit: '' })))
        }
        // Map cleaned labels back to item IDs by index
        const labelsMap = {}
        if (Array.isArray(shopLabels)) {
          shopLabels.forEach((label, idx) => {
            if (generated[idx]) labelsMap[generated[idx].id] = label
          })
          setRefinedShopLabels(labelsMap)
        }
        // Cache both results
        const cachePayload = { fingerprint: fp, pantryNames: pantryNames || [], shopLabels: labelsMap }
        saveMealPlan(user.id, weekKey, { ...plan, groceryAI: cachePayload })
          .then(() => setPlan(p => ({ ...p, groceryAI: cachePayload })))
      })
      .catch(() => { /* client-formatted labels stay visible */ })
      .finally(() => setPantryRefining(false))
  }, [planFingerprint, pantryKey, shopKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fall back to rule-based / client-formatted while AI hasn't resolved
  const displayPantry = refinedPantry ?? pantryCheck
  function getShopLabel(item) {
    return refinedShopLabels?.[item.id] ?? formatItemLabel(item)
  }

  const checkedGenerated  = useMemo(() => new Set(plan?.groceryChecked ?? []),        [plan])
  const checkedPantry     = useMemo(() => new Set(plan?.groceryPantryChecked ?? []), [plan])
  const extras            = plan?.groceryExtras ?? []
  const checkedStapleIds  = useMemo(() => new Set(plan?.groceryStaplesChecked ?? []), [plan])
  const groceryStoreMap   = plan?.groceryStoreMap ?? {}   // { [genKey]: storeId }

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

  // ── Per-item store assignment ─────────────────────────────────────────────
  function setItemStore(item, storeId) {
    const key    = genKey(item)
    const newMap = { ...groceryStoreMap }
    if (storeId) newMap[key] = storeId
    else delete newMap[key]
    updatePlan({ groceryStoreMap: newMap })
  }
  function setExtraStore(id, storeId) {
    updatePlan({
      groceryExtras: extras.map(m => m.id === id ? { ...m, storeId: storeId || null } : m),
    })
  }

  // ── By-store view ─────────────────────────────────────────────────────────
  // Must be after extras, groceryStoreMap, genKey, and stores are all defined.
  const byStoreView = useMemo(() => {
    if (!viewByStore) return null

    function buildAisleGroups(items, storeAisles) {
      const byGroup = {}
      items.forEach(item => {
        const g = item.group || 'other'
        if (!byGroup[g]) byGroup[g] = []
        byGroup[g].push(item)
      })
      let displayOrder
      if (storeAisles?.length) {
        const sorted = [...storeAisles].sort((a, b) => a.order - b.order)
        displayOrder = sorted.map(aisle => {
          const base = GROCERY_GROUPS.find(g => g.key === aisle.group_key)
          return base
            ? { ...base, aisle_label: aisle.aisle_label }
            : { key: aisle.group_key, label: aisle.group_key, emoji: '🛒', aisle_label: aisle.aisle_label }
        })
      } else {
        displayOrder = GROCERY_GROUPS
      }
      const groups = []
      const seen   = new Set()
      for (const group of displayOrder) {
        if (byGroup[group.key]?.length) {
          groups.push({ ...group, items: byGroup[group.key] })
          seen.add(group.key)
        }
      }
      if (byGroup.other?.length && !seen.has('other')) {
        groups.push({ key: 'other', label: 'Other', emoji: '🛒', items: byGroup.other })
      }
      return groups
    }

    const allItems = [
      ...generated.map(item => ({
        ...item, _type: 'generated', _storeId: groceryStoreMap[genKey(item)] || null,
      })),
      ...extras.map(item => ({
        id: item.id, name: item.name, unit: '', quantity: '',
        group: assignGroup(item.name), checked: item.checked,
        _type: 'extra', _storeId: item.storeId || null,
      })),
    ]

    const byStoreId  = {}
    const unassigned = []
    allItems.forEach(item => {
      if (item._storeId) {
        if (!byStoreId[item._storeId]) byStoreId[item._storeId] = []
        byStoreId[item._storeId].push(item)
      } else {
        unassigned.push(item)
      }
    })

    const sections = []
    for (const store of stores) {
      const items = byStoreId[store.id]
      if (!items?.length) continue
      sections.push({ store, aisleGroups: buildAisleGroups(items, store.aisles), count: items.length })
    }
    if (unassigned.length) {
      sections.push({ store: null, aisleGroups: buildAisleGroups(unassigned, null), count: unassigned.length })
    }
    return sections
  }, [viewByStore, generated, extras, stores, groceryStoreMap]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const stillToGrab = Math.max(0, totalItems - totalChecked)
  const pct = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0
  const stapleNames = staples.slice(0, 4).map(s => s.name).join('. ') + (staples.length > 0 ? '.' : '')

  // Helper: render a category group label (dot + name + count)
  function GroupLabel({ group }) {
    const color = group.color || '#8C9189'
    return (
      <div className="grocery-group-label">
        <span className="grocery-group-dot" style={{ background: color }} />
        <span className="grocery-group-name">{group.label.toUpperCase()}</span>
        {group.aisle_label && <span className="grocery-group-aisle">{group.aisle_label}</span>}
        <span className="grocery-group-count">{group.items.length}</span>
      </div>
    )
  }

  return (
    <div className="page grocery-page">

      {/* ── Hero header ─────────────────────────────────────────────── */}
      <div className="grocery-hero">
        <div className="grocery-hero-left">
          <div className="t-eyebrow" style={{ color: 'var(--hp-ink-500)' }}>
            Grocery · {totalItems} item{totalItems !== 1 ? 's' : ''}
          </div>
          {!loading && (
            <div className="grocery-hero-count">
              <span className="grocery-hero-num">{stillToGrab}</span>
              <span className="grocery-hero-tag">
                {stillToGrab === 0 && totalItems > 0 ? 'all grabbed.' : 'still to grab.'}
              </span>
            </div>
          )}
          {!loading && totalItems > 0 && (
            <p className="t-body-sm grocery-hero-sub">
              {totalChecked} already got · {totalItems} total
              {totalChecked > 0 && (
                <button className="grocery-uncheck-btn" onClick={uncheckAll}>
                  · <IconRefresh size={11} /> uncheck all
                </button>
              )}
            </p>
          )}
        </div>
        <div className="grocery-hero-nav">
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setWeekKey(k => shiftWeek(k, -1))}>
            <IconChevronL size={16} />
          </button>
          <span className="t-label grocery-hero-week">{formatWeekOf(weekKey)}</span>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setWeekKey(k => shiftWeek(k, 1))}>
            <IconChevronR size={16} />
          </button>
          {weekKey !== getWeekKey() && (
            <button className="btn btn-ghost btn-sm" onClick={() => setWeekKey(getWeekKey())}>This week</button>
          )}
        </div>
      </div>

      {/* ── Controls: progress + view toggle + store pills ─────────── */}
      <div className="grocery-controls">
        <div className="grocery-controls-left">
          {!loading && totalItems > 0 ? (
            <>
              <span className="grocery-controls-label">{totalChecked} of {totalItems} got</span>
              <div className="grocery-progress-bar" style={{ '--pct': `${pct}%` }} />
              <span className="grocery-progress-label">{pct}%</span>
            </>
          ) : (
            <span className="grocery-controls-label" style={{ color: 'var(--hp-ink-400)' }}>
              {loading ? 'Loading…' : 'No items yet'}
            </span>
          )}
        </div>
        <div className="grocery-controls-right">
          {stores.length > 0 && (
            <div className="grocery-view-toggle">
              <button
                className={`grocery-view-btn ${!viewByStore ? 'grocery-view-btn--active' : ''}`}
                onClick={() => setViewByStore(false)}
              >All items</button>
              <button
                className={`grocery-view-btn ${viewByStore ? 'grocery-view-btn--active' : ''}`}
                onClick={() => setViewByStore(true)}
              >By store</button>
            </div>
          )}
          {!viewByStore && stores.length > 0 && (
            <div className="grocery-store-selector">
              <button
                className={`grocery-store-pill ${!activeStoreId ? 'grocery-store-pill--active' : ''}`}
                onClick={() => handleSetActiveStore(null)}
              >Any</button>
              {stores.map(store => (
                <button
                  key={store.id}
                  className={`grocery-store-pill ${activeStoreId === store.id ? 'grocery-store-pill--active' : ''}`}
                  onClick={() => handleSetActiveStore(store.id)}
                >
                  {store.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="page-placeholder"><p>Loading…</p></div>
      ) : (
        <div className={`grocery-body ${viewByStore ? 'grocery-body--bystore' : ''}`}>

          {/* ── Main column ────────────────────────────────────────── */}
          <div className="grocery-main">
            {viewByStore ? (
              /* By-store view fills main col */
              <>
                {byStoreView?.length === 0 && (
                  <div className="grocery-card">
                    <div className="grocery-card-body">
                      <p className="grocery-card-hint">
                        No items yet — add meals in the Planner, then tap the store chip on each item to assign it.
                      </p>
                    </div>
                  </div>
                )}
                {byStoreView?.map(section => (
                  <GroceryCard
                    key={section.store?.id || 'unassigned'}
                    title={section.store ? section.store.name : 'Unassigned'}
                    count={section.count}
                    hint={!section.store ? 'Tap the store chip on any item to assign it.' : null}
                  >
                    {section.aisleGroups.map(group => (
                      <div key={group.key} className="grocery-group">
                        <GroupLabel group={group} />
                        {group.items.map(item => {
                          const isExtra = item._type === 'extra'
                          const checked = isExtra ? item.checked : checkedGenerated.has(genKey(item))
                          const label   = isExtra ? item.name : getShopLabel(item)
                          return (
                            <GroceryRow
                              key={item.id}
                              checked={checked}
                              label={label}
                              onToggle={isExtra ? () => toggleExtra(item.id) : () => toggleGenerated(item)}
                              onRemove={isExtra ? () => removeExtra(item.id) : undefined}
                              storeId={item._storeId}
                              stores={stores}
                              onStoreChange={isExtra
                                ? sid => setExtraStore(item.id, sid)
                                : sid => setItemStore(item, sid)}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </GroceryCard>
                ))}
              </>
            ) : (
              /* All-items view: "From your plan" */
              generated.length === 0 ? (
                <div className="grocery-card">
                  <div className="grocery-card-header">
                    <span className="grocery-card-title">From your plan</span>
                  </div>
                  <div className="grocery-empty-state" style={{ padding: '24px 16px 20px' }}>
                    <EmptyGrocery />
                    <div className="grocery-empty-copy">
                      <div className="t-h3">No list yet.</div>
                      <p className="t-body-sm" style={{ color: 'var(--hp-ink-500)', marginTop: 8 }}>
                        Plan some meals in the Planner and your grocery list will build itself.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <GroceryCard title="From your plan" count={generated.length}>
                  {groupedGenerated.map(group => (
                    <div key={group.key} className="grocery-group">
                      <GroupLabel group={group} />
                      {group.items.map(item => {
                        const checked = checkedGenerated.has(genKey(item))
                        return (
                          <GroceryRow
                            key={item.id}
                            checked={checked}
                            label={getShopLabel(item)}
                            onToggle={() => toggleGenerated(item)}
                            storeId={groceryStoreMap[genKey(item)]}
                            stores={stores}
                            onStoreChange={sid => setItemStore(item, sid)}
                          />
                        )
                      })}
                    </div>
                  ))}
                </GroceryCard>
              )
            )}
          </div>

          {/* ── Side column ─────────────────────────────────────────── */}
          <div className="grocery-side">

            {/* Added for this week — only in all-items view (in by-store view, extras appear mixed in) */}
            {!viewByStore && <div className="grocery-side-panel">
              <div className="t-eyebrow grocery-side-eyebrow">Added for this week</div>
              {extras.map(item => (
                <GroceryRow
                  key={item.id}
                  checked={item.checked}
                  label={item.name}
                  onToggle={() => toggleExtra(item.id)}
                  onRemove={() => removeExtra(item.id)}
                  storeId={item.storeId}
                  stores={stores}
                  onStoreChange={sid => setExtraStore(item.id, sid)}
                />
              ))}
              <AddItemRow
                value={newExtra}
                onChange={setNewExtra}
                onAdd={addExtra}
                placeholder="e.g. Paper towels, sparkling water…"
              />
            </div>}

            {/* Check your pantry */}
            {(displayPantry.length > 0 || pantryRefining) && (
              <GroceryCard
                title="Check your pantry"
                count={displayPantry.length}
                hint={pantryRefining
                  ? 'Consolidating…'
                  : "Recipes call for these — make sure you're stocked up."}
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

            {/* Always on my list — dark card */}
            <div className="grocery-staples-card">
              <div className="t-eyebrow grocery-staples-eyebrow">Always on my list</div>
              {staples.length > 0 ? (
                <div className="grocery-staples-names">{stapleNames}</div>
              ) : (
                <div className="grocery-staples-names grocery-staples-names--empty">
                  Nothing yet.
                </div>
              )}
              <p className="t-body-sm grocery-staples-sub">Saved staples auto-add each week.</p>
              <div className="grocery-staples-list">
                {staples.map(s => (
                  <div key={s.id} className={`grocery-staple-row ${checkedStapleIds.has(s.id) ? 'grocery-staple-row--checked' : ''}`}>
                    <button
                      className={`grocery-check grocery-staple-check ${checkedStapleIds.has(s.id) ? 'grocery-check--done' : ''}`}
                      onClick={() => toggleStaple(s.id)}
                      aria-label={checkedStapleIds.has(s.id) ? 'Uncheck' : 'Check'}
                    >
                      {checkedStapleIds.has(s.id) && <IconCheck size={12} />}
                    </button>
                    <span className="grocery-staple-label">{s.name}</span>
                    <button className="grocery-staple-remove" onClick={() => handleDeleteStaple(s.id)} aria-label="Remove">
                      <IconClose size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="grocery-add-row grocery-staples-add">
                <input
                  className="grocery-add-input grocery-staples-input"
                  placeholder="e.g. Eggs, milk, bread…"
                  value={newStaple}
                  onChange={e => setNewStaple(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddStaple()}
                />
                <button className="btn btn-sm grocery-add-btn" onClick={handleAddStaple}>
                  <IconPlus size={14} />
                </button>
              </div>
            </div>

          </div>
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

function GroceryRow({ checked, label, onToggle, onRemove, isStaple, storeId, stores, onStoreChange }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const showStores = stores?.length > 0 && onStoreChange
  const assignedStore = stores?.find(s => s.id === storeId)

  function handleStoreSelect(e, id) {
    e.stopPropagation()
    onStoreChange?.(id)
    setPickerOpen(false)
  }

  return (
    <div className={`grocery-row-wrap ${checked ? 'grocery-row-wrap--checked' : ''}`}>
      {/* Main row */}
      <div className="grocery-row">
        <button className={`grocery-check ${checked ? 'grocery-check--done' : ''}`} onClick={onToggle}>
          {checked && <IconCheck size={12} />}
        </button>
        <span className="grocery-label">{label}</span>

        {/* Store chip — tapping opens the inline pill picker */}
        {showStores && (
          <button
            className={`grocery-store-chip ${assignedStore ? 'grocery-store-chip--set' : ''} ${pickerOpen ? 'grocery-store-chip--open' : ''}`}
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

      {/* Inline store picker — pill radio buttons */}
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
            <button
              className="grocery-store-picker-pill grocery-store-picker-pill--clear"
              onClick={e => handleStoreSelect(e, null)}
            >
              Clear
            </button>
          )}
        </div>
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
      <button className="btn btn-sm grocery-add-btn" onClick={onAdd} disabled={!value.trim()}>
        <IconPlus size={14} />
      </button>
    </div>
  )
}
