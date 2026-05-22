import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ─── Recipes ─────────────────────────────────────────────────────────────────

export async function getRecipes(userId) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function getRecipeById(id) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function saveRecipe(userId, recipe) {
  const payload = {
    user_id:      userId,
    name:         recipe.name,
    category:     recipe.category || 'other',
    servings:     recipe.servings || 2,
    prep_time:    recipe.prepTime ?? recipe.prep_time ?? 0,
    cook_time:    recipe.cookTime ?? recipe.cook_time ?? 0,
    notes:        recipe.notes || null,
    image_url:    recipe.imageUrl ?? recipe.image_url ?? null,
    ingredients:  recipe.ingredients || [],
    instructions: recipe.instructions || [],
    nutrition:    recipe.nutrition || {},
  }

  if (recipe.id) {
    const { data, error } = await supabase
      .from('recipes')
      .update(payload)
      .eq('id', recipe.id)
      .select()
      .single()
    return { data, error }
  } else {
    const { data, error } = await supabase
      .from('recipes')
      .insert(payload)
      .select()
      .single()
    return { data, error }
  }
}

export async function deleteRecipe(id) {
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  return { error }
}

// ─── Meal Plans ───────────────────────────────────────────────────────────────

export async function getMealPlan(userId, weekKey) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('plan')
    .eq('user_id', userId)
    .eq('week_key', weekKey)
    .maybeSingle()
  return { data: data?.plan || {}, error }
}

export async function saveMealPlan(userId, weekKey, plan) {
  const { error } = await supabase
    .from('meal_plans')
    .upsert(
      { user_id: userId, week_key: weekKey, plan, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,week_key' }
    )
  return { error }
}

export async function getMealPlanWeeks(userId) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('week_key, updated_at')
    .eq('user_id', userId)
    .order('week_key', { ascending: false })
  return { data: data || [], error }
}

// ─── Grocery List ─────────────────────────────────────────────────────────────

export async function getGroceryList(userId) {
  const { data, error } = await supabase
    .from('grocery_list')
    .select('items')
    .eq('user_id', userId)
    .maybeSingle()
  return { data: data?.items || [], error }
}

export async function saveGroceryList(userId, items) {
  const { error } = await supabase
    .from('grocery_list')
    .upsert(
      { user_id: userId, items, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  return { error }
}

// ─── Stores ───────────────────────────────────────────────────────────────────

export async function getStores(userId) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  return { data: data || [], error }
}

export async function saveStore(userId, store) {
  const payload = {
    user_id: userId,
    name:    store.name,
    aisles:  store.aisles || [],
  }
  if (store.id) {
    const { data, error } = await supabase
      .from('stores').update(payload).eq('id', store.id).select().single()
    return { data, error }
  } else {
    const { data, error } = await supabase
      .from('stores').insert(payload).select().single()
    return { data, error }
  }
}

export async function deleteStore(id) {
  const { error } = await supabase.from('stores').delete().eq('id', id)
  return { error }
}

// ─── Household Members ────────────────────────────────────────────────────────

export async function getHouseholdMembers(userId) {
  const { data, error } = await supabase
    .from('household_members')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
  return { data: data || [], error }
}

export async function saveHouseholdMember(userId, member) {
  const payload = { user_id: userId, name: member.name, color: member.color, sort_order: member.sort_order ?? 0 }
  if (member.id) {
    const { data, error } = await supabase.from('household_members').update(payload).eq('id', member.id).select().single()
    return { data, error }
  } else {
    const { data, error } = await supabase.from('household_members').insert(payload).select().single()
    return { data, error }
  }
}

export async function deleteHouseholdMember(id) {
  const { error } = await supabase.from('household_members').delete().eq('id', id)
  return { error }
}

// ─── Pantry Staples ───────────────────────────────────────────────────────────

export async function getStaples(userId) {
  const { data, error } = await supabase
    .from('staples')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  return { data: data || [], error }
}

export async function addStaple(userId, name) {
  const { data, error } = await supabase
    .from('staples')
    .insert({ user_id: userId, name: name.trim().toLowerCase() })
    .select()
    .single()
  return { data, error }
}

export async function deleteStaple(id) {
  const { error } = await supabase.from('staples').delete().eq('id', id)
  return { error }
}
