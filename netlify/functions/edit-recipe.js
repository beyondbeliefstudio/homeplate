// Applies natural-language edits to an existing recipe.
// Input:  { current: RecipeObject, changes: string }
// Output: updated recipe JSON matching the RecipeFormPage schema

const VALID_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'side', 'other']
const VALID_AUDIENCES  = ['everyone', 'adults', 'kids']

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.ANTHROPIC_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing ANTHROPIC_KEY' }) }
  }

  let current, changes
  try {
    ;({ current, changes } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!changes?.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No changes described' }) }
  }

  const systemPrompt = `You are a recipe editing assistant for a meal planning app. You receive an existing recipe as JSON and a natural-language description of changes the user wants to make. Apply exactly those changes and return the complete updated recipe as JSON.

Return ONLY valid JSON with this exact shape — no markdown, no code fences, no explanation:
{
  "name": "Recipe name",
  "category": "dinner",
  "audience": "everyone",
  "servings": 4,
  "prep_time": 15,
  "cook_time": 30,
  "notes": "Optional tips",
  "ingredients": [
    { "quantity": "2", "unit": "cups", "name": "all-purpose flour" }
  ],
  "instructions": [
    "Preheat oven to 375°F.",
    "Mix dry ingredients."
  ],
  "nutrition": {
    "calories": 350,
    "protein": 12,
    "carbs": 45,
    "fat": 14,
    "fiber": 3
  }
}

Rules:
- Only change what the user explicitly requests. Leave all other fields exactly as they are.
- category must be one of: breakfast, lunch, dinner, snack, dessert, side, other
- audience must be one of: everyone, adults, kids
- Always split ingredients into quantity / unit / name. Use empty string "" for quantity or unit if not applicable.
- Instructions must be individual steps as separate strings.
- prep_time and cook_time are integers in minutes.
- nutrition values are numbers or null.
- If the user asks to add an ingredient, append it to the existing list.
- If the user asks to remove an ingredient, remove it and also remove any instruction steps that only reference that ingredient.
- If the user asks to change a step, update only that step.
- If the user's request is ambiguous, use good judgment and make the most reasonable interpretation.`

  const userMessage = `Current recipe:
${JSON.stringify(current, null, 2)}

Requested changes:
${changes.trim()}`

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    return { statusCode: resp.status, body: JSON.stringify({ error: `API error: ${err}` }) }
  }

  const data = await resp.json()
  const raw  = data.content?.[0]?.text?.trim() || '{}'

  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    const recipe  = JSON.parse(cleaned)

    if (!VALID_CATEGORIES.includes(recipe.category)) recipe.category = current.category || 'dinner'
    if (!VALID_AUDIENCES.includes(recipe.audience))   recipe.audience = current.audience || 'everyone'
    recipe.servings   = Math.max(1, parseInt(recipe.servings)   || current.servings   || 2)
    recipe.prep_time  = Math.max(0, parseInt(recipe.prep_time)  || 0)
    recipe.cook_time  = Math.max(0, parseInt(recipe.cook_time)  || 0)
    recipe.notes      = recipe.notes ?? current.notes ?? ''
    recipe.ingredients  = Array.isArray(recipe.ingredients)  ? recipe.ingredients  : current.ingredients  || []
    recipe.instructions = Array.isArray(recipe.instructions) ? recipe.instructions : current.instructions || []
    recipe.nutrition    = {
      calories: recipe.nutrition?.calories ?? current.nutrition?.calories ?? null,
      protein:  recipe.nutrition?.protein  ?? current.nutrition?.protein  ?? null,
      carbs:    recipe.nutrition?.carbs    ?? current.nutrition?.carbs    ?? null,
      fat:      recipe.nutrition?.fat      ?? current.nutrition?.fat      ?? null,
      fiber:    recipe.nutrition?.fiber    ?? current.nutrition?.fiber    ?? null,
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    }
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to parse AI response', raw }) }
  }
}
