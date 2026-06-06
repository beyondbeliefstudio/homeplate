// ─── Grocery category definitions ────────────────────────────────────────────
// This is the single source of truth for categories.
// GroceryPage and SettingsPage both import from here.
//
// Storage format (localStorage key: hp-grocery-categories):
// Array of { key, label, emoji, color, builtIn, hidden }
// Built-in entries keep their keywords for assignGroup matching.
// Custom entries have no keywords — items are assigned to them manually.

export const CATEGORIES_KEY = 'hp-grocery-categories'

// Preset colors for new custom categories
export const CATEGORY_COLORS = [
  '#58CC02', '#E63957', '#FFC228', '#FF7733', '#3DA002',
  '#C99100', '#8C9189', '#5C625E', '#E8732A', '#2563EB',
  '#7C3AED', '#0891B2',
]

export const DEFAULT_GROCERY_GROUPS = [
  {
    key: 'produce',
    label: 'Produce',
    emoji: '🥦',
    color: '#58CC02',
    builtIn: true,
    hidden: false,
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
      'ginger', 'garlic', 'shallot',
      'fruit', 'vegetable', 'veggie', 'produce',
    ],
  },
  {
    key: 'meat',
    label: 'Meat & Seafood',
    emoji: '🥩',
    color: '#E63957',
    builtIn: true,
    hidden: false,
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
    color: '#FFC228',
    builtIn: true,
    hidden: false,
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
    color: '#FF7733',
    builtIn: true,
    hidden: false,
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
    color: '#3DA002',
    builtIn: true,
    hidden: false,
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
    color: '#C99100',
    builtIn: true,
    hidden: false,
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
    color: '#8C9189',
    builtIn: true,
    hidden: false,
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
      'cracker', 'pretzel', 'popcorn',
      'protein powder', 'supplement',
      'coffee', 'tea', 'coffee bean', 'ground coffee',
    ],
  },
  {
    key: 'beverages',
    label: 'Beverages',
    emoji: '🥤',
    color: '#5C625E',
    builtIn: true,
    hidden: false,
    keywords: [
      'juice', 'orange juice', 'apple juice', 'lemonade',
      'soda', 'sparkling water', 'water', 'sports drink', 'energy drink',
      'beer', 'wine', 'spirits', 'alcohol',
    ],
  },
  {
    key: 'other',
    label: 'Other',
    emoji: '🛒',
    color: '#9CA3AF',
    builtIn: true,
    hidden: false,
    keywords: [],
  },
]

// Build a keyword lookup map from built-in defaults (keyed by group key)
const DEFAULT_KEYWORDS = Object.fromEntries(
  DEFAULT_GROCERY_GROUPS.map(g => [g.key, g.keywords || []])
)

// ─── Load / save ─────────────────────────────────────────────────────────────

export function loadCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY)
    if (!raw) return DEFAULT_GROCERY_GROUPS
    const stored = JSON.parse(raw)
    if (!Array.isArray(stored) || !stored.length) return DEFAULT_GROCERY_GROUPS
    // Merge stored display properties with built-in keywords
    return stored.map(cat => ({
      ...cat,
      keywords: DEFAULT_KEYWORDS[cat.key] || [],
    }))
  } catch {
    return DEFAULT_GROCERY_GROUPS
  }
}

export function saveCategories(cats) {
  // Strip keywords before saving — they come from defaults at runtime
  const toStore = cats.map(({ keywords: _kw, ...rest }) => rest) // eslint-disable-line no-unused-vars
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(toStore))
}

// ─── assignGroup ─────────────────────────────────────────────────────────────
// Checks category overrides first, then keyword matching against active categories.

export function assignGroup(name, overrides = {}, categories = DEFAULT_GROCERY_GROUPS) {
  const key = name.toLowerCase().trim()
  if (overrides[key]) return overrides[key]
  const lower = key
  const active = categories.filter(g => !g.hidden)
  for (const group of active) {
    if (group.key === 'other') continue // never keyword-match to "other"
    if ((group.keywords || []).some(kw => lower.includes(kw))) return group.key
  }
  return 'other'
}
