// Consolidates a list of raw pantry ingredient mentions into a clean,
// deduplicated list using Claude. Called by GroceryPage when building
// the "Check your pantry" section.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let items
  try {
    ;({ items } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([]),
    }
  }

  const apiKey = process.env.ANTHROPIC_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing ANTHROPIC_KEY' }) }
  }

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a grocery list assistant. Given this list of pantry ingredient mentions pulled from recipes, return a clean, consolidated list of pantry items to check before shopping.

Rules:
- Merge duplicates and near-duplicates aggressively. Examples:
  "pinch of salt", "salt and pepper", "kosher salt", "sea salt" → "salt"
  "freshly ground black pepper", "pepper to taste", "black pepper" → "black pepper"
  "extra-virgin olive oil", "1 tbsp olive oil" → "olive oil"
  "garlic cloves", "minced garlic", "2 cloves garlic" → "garlic"
- Strip all quantities, measurements, and preparation notes — keep only the ingredient name
- Use the simplest, most common name for each item
- List each unique pantry item exactly once
- Return ONLY a valid JSON array of clean ingredient name strings, sorted alphabetically
- No markdown, no code fences, no explanation — raw JSON array only

Ingredient list:
${items.join('\n')}`,
        },
      ],
    }),
  })

  if (!resp.ok) {
    return {
      statusCode: resp.status,
      body: JSON.stringify({ error: 'Anthropic API error' }),
    }
  }

  const data = await resp.json()
  const text = data.content?.[0]?.text?.trim() || '[]'

  try {
    const consolidated = JSON.parse(text)
    if (!Array.isArray(consolidated)) throw new Error('not an array')
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consolidated),
    }
  } catch {
    // Fallback: return the original items unchanged
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }
  }
}
