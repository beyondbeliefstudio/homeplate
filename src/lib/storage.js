// All persisted data lives in localStorage under namespaced keys.
// Each entity type has read/write helpers that operate on the full array.

const KEY = {
  recipes: 'hp-recipes',
  mealPlans: 'hp-meal-plans',
  groceryList: 'hp-grocery-list',
  stores: 'hp-stores',
  staples: 'hp-staples',
}

function load(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function uuid() {
  return crypto.randomUUID()
}

// ─── Recipes ────────────────────────────────────────────────────────
export function getRecipes() { return load(KEY.recipes) }

export function saveRecipe(recipe) {
  const recipes = getRecipes()
  if (recipe.id) {
    const idx = recipes.findIndex(r => r.id === recipe.id)
    if (idx >= 0) recipes[idx] = recipe
    else recipes.push(recipe)
  } else {
    recipes.push({ ...recipe, id: uuid(), createdAt: new Date().toISOString() })
  }
  save(KEY.recipes, recipes)
  return recipes
}

export function deleteRecipe(id) {
  const recipes = getRecipes().filter(r => r.id !== id)
  save(KEY.recipes, recipes)
  return recipes
}

// ─── Meal Plans ──────────────────────────────────────────────────────
// Plans keyed by ISO week string: "2026-W21"
export function getMealPlan(weekKey) {
  const plans = load(KEY.mealPlans, {})
  return plans[weekKey] ?? {}
}

export function saveMealPlan(weekKey, plan) {
  const plans = load(KEY.mealPlans, {})
  plans[weekKey] = plan
  save(KEY.mealPlans, plans)
}

export function getAllMealPlanKeys() {
  return Object.keys(load(KEY.mealPlans, {}))
}

// ─── Grocery List ────────────────────────────────────────────────────
export function getGroceryList() { return load(KEY.groceryList) }

export function saveGroceryList(list) {
  save(KEY.groceryList, list)
  return list
}

export function addGroceryItem(item) {
  const list = getGroceryList()
  const newItem = { ...item, id: uuid(), checked: false, manual: true }
  list.push(newItem)
  save(KEY.groceryList, list)
  return list
}

export function toggleGroceryItem(id) {
  const list = getGroceryList().map(i =>
    i.id === id ? { ...i, checked: !i.checked } : i
  )
  save(KEY.groceryList, list)
  return list
}

export function removeGroceryItem(id) {
  const list = getGroceryList().filter(i => i.id !== id)
  save(KEY.groceryList, list)
  return list
}

// ─── Stores ──────────────────────────────────────────────────────────
export function getStores() { return load(KEY.stores) }

export function saveStore(store) {
  const stores = getStores()
  if (store.id) {
    const idx = stores.findIndex(s => s.id === store.id)
    if (idx >= 0) stores[idx] = store
    else stores.push(store)
  } else {
    stores.push({ ...store, id: uuid() })
  }
  save(KEY.stores, stores)
  return stores
}

export function deleteStore(id) {
  const stores = getStores().filter(s => s.id !== id)
  save(KEY.stores, stores)
  return stores
}

// ─── Pantry Staples ──────────────────────────────────────────────────
export function getStaples() { return load(KEY.staples) }

export function saveStaples(staples) {
  save(KEY.staples, staples)
  return staples
}

export function addStaple(name) {
  const staples = getStaples()
  const entry = { id: uuid(), name: name.trim().toLowerCase() }
  staples.push(entry)
  save(KEY.staples, staples)
  return staples
}

export function removeStaple(id) {
  const staples = getStaples().filter(s => s.id !== id)
  save(KEY.staples, staples)
  return staples
}
