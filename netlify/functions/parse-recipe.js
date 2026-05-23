// Parses a recipe from a text description, a photo, or both.
// Input:  { text?: string, image?: { mediaType: string, data: string } }
// Output: structured recipe JSON matching the RecipeFormPage schema

const VALID_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'side', 'other']
const VALID_AUDIENCES  = ['everyone', 'adults', 'kids']

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let text, image
  try {
    ;({ text, image } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!text?.trim() && !image?.data) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Provide text or an image' }) }
  }

  const apiKey = process.env.ANTHROPIC_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing ANTHROPIC_KEY' }) }
  }

  const systemPrompt = `You are a recipe parser for a meal planning app. Given a recipe (as text, a photo, or both), extract and structure the full recipe.

Return ONLY valid JSON with this exact shape — no markdown, no code fences:
{
  "name": "Recipe name",
  "category": "dinner",
  "audience": "everyone",
  "servings": 4,
  "prep_time": 15,
  "cook_time": 30,
  "notes": "Optional tips or storage notes",
  "ingredients": [
    { "quantity": "2", "unit": "cups", "name": "all-purpose flour" }
  ],
  "instructions": [
    "Preheat oven to 375°F.",
    "Mix dry ingredients in a large bowl."
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
- category must be one of: breakfast, lunch, dinner, snack, dessert, side, other
- audience must be one of: everyone, adults, kids — default to "everyone"
- Always split ingredients into quantity / unit / name. Use empty string "" for quantity or unit if not applicable
- Instructions must be individual steps as separate strings
- prep_time and cook_time are integers in minutes; use 0 if unknown
- nutrition values are numbers or null if not provided
- notes is a plain string (tips, variations, storage); empty string if none
- If reading from a photo, decode any abbreviated or handwritten text carefully`

  // Build message content — support text + image or either alone
  const content = []
  if (image?.data && image?.mediaType) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: image.mediaType, data: image.data },
    })
  }
  content.push({
    type: 'text',
    text: text?.trim()
      ? `Parse this recipe:\n\n${text.trim()}`
      : 'Parse the recipe shown in this image.',
  })

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
      messages: [{ role: 'user', content }],
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    return { statusCode: resp.status, body: JSON.stringify({ error: `API error: ${err}` }) }
  }

  const data = await resp.json()
  const raw  = data.content?.[0]?.text?.trim() || '{}'

  try {
    const recipe = JSON.parse(raw)

    // Sanitize / coerce values
    if (!VALID_CATEGORIES.includes(recipe.category)) recipe.category = 'dinner'
    if (!VALID_AUDIENCES.includes(recipe.audience))   recipe.audience = 'everyone'
    recipe.servings   = Math.max(1, parseInt(recipe.servings)   || 2)
    recipe.prep_time  = Math.max(0, parseInt(recipe.prep_time)  || 0)
    recipe.cook_time  = Math.max(0, parseInt(recipe.cook_time)  || 0)
    recipe.notes      = recipe.notes || ''
    recipe.ingredients  = Array.isArray(recipe.ingredients)  ? recipe.ingredients  : []
    recipe.instructions = Array.isArray(recipe.instructions) ? recipe.instructions : []
    recipe.nutrition    = {
      calories: recipe.nutrition?.calories ?? null,
      protein:  recipe.nutrition?.protein  ?? null,
      carbs:    recipe.nutrition?.carbs    ?? null,
      fat:      recipe.nutrition?.fat      ?? null,
      fiber:    recipe.nutrition?.fiber    ?? null,
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
