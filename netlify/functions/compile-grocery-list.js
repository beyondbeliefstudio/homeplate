exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.ANTHROPIC_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_KEY not configured' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { ingredients = [], recipeNames = [], alreadyAccountedFor = [] } = body
  if (!ingredients.length) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finalItems: [], questions: [], suggestions: [] }),
    }
  }

  // Group ingredients by recipe for the prompt
  const grouped = {}
  ingredients.forEach(i => {
    const key = i.recipeName || 'Other'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push([i.quantity, i.unit, i.name].filter(Boolean).join(' '))
  })

  const ingredientLines = Object.entries(grouped)
    .map(([recipe, items]) => `${recipe}:\n${items.map(i => `  • ${i}`).join('\n')}`)
    .join('\n\n')

  const recipeListStr = recipeNames.length ? recipeNames.join(', ') : 'various recipes'

  const prompt = `You are a thoughtful grocery list compiler for a home cook. Compile the following raw ingredients from a week of meals into a clean, ready-to-shop list.

This week's recipes: ${recipeListStr}

RAW INGREDIENTS BY RECIPE:
${ingredientLines}

YOUR RULES:
1. Combine identical or very similar ingredients across recipes — sum quantities when units match. Track which recipe(s) each item came from.
2. Convert cooking measurements to real-world purchase units:
   - "3 cups milk" → "1 quart milk" (sources: all recipes that used it)
   - "2 cups flour" → "1 lb flour"
   - "half cup olive oil" → "1 small bottle olive oil"
   - "3 tablespoons butter" → "1 stick butter"
   - "2 large eggs + 1 egg" → "1 dozen eggs"
   - "3 cloves garlic" → "1 head garlic"
   - Canned goods: use number of cans, not cup measurements
3. Only create a question when ingredients GENUINELY CONFLICT in TYPE (e.g., whole milk vs oat milk, salted vs unsalted butter). Do NOT ask about quantity differences of the same item — just combine them. Keep questions to only the most meaningful conflicts (max 3).
4. For type conflicts, write the question as a natural decision — explain briefly WHY the conflict exists and what each choice means for the cook.
5. Generate 3–5 helpful suggestions for items likely needed but NOT already on the list. Think: specific ingredients the recipe assumes but didn't list, condiments for serving, or commonly forgotten items you'd buy at the store. Be specific to this week's recipes (e.g. burger buns for a burger recipe, taco shells for tacos, specific sauces).
   DO NOT suggest: salt, pepper, butter, cooking oils, flour, sugar, baking ingredients, basic spices (cumin, paprika, etc.), mustard, ketchup, mayo, soy sauce, or any other dry pantry/condiment staples.
   ALSO DO NOT suggest anything already accounted for — the user already has or is already buying these items: ${alreadyAccountedFor.length ? alreadyAccountedFor.join(', ') : 'none listed'}. Do not suggest any of these or close variations of them.

Return ONLY valid JSON with no markdown formatting:
{
  "finalItems": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "string",
      "sources": ["Recipe A", "Recipe B"]
    }
  ],
  "questions": [
    {
      "id": "string",
      "prompt": "string — conversational, explains the conflict and why it matters",
      "options": [
        {
          "label": "string — clear action label",
          "resolvedItems": [{ "name": "string", "quantity": "string", "unit": "string", "sources": ["string"] }]
        }
      ],
      "autoResolve": {
        "resolvedItems": [{ "name": "string", "quantity": "string", "unit": "string", "sources": ["string"] }]
      }
    }
  ],
  "suggestions": [
    { "name": "string", "reason": "string — one brief sentence on why you might need this" }
  ]
}`

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify({ error: 'Anthropic API error' }) }
    }

    const data = await resp.json()
    const text = (data.content?.[0]?.text || '').trim()

    // Extract JSON — handle both raw JSON and markdown code blocks
    let jsonStr = text
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1]
    } else {
      const objMatch = text.match(/\{[\s\S]*\}/)
      if (objMatch) jsonStr = objMatch[0]
    }

    const result = JSON.parse(jsonStr)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        finalItems: Array.isArray(result.finalItems) ? result.finalItems : [],
        questions: Array.isArray(result.questions) ? result.questions : [],
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      }),
    }
  } catch (err) {
    console.error('compile-grocery-list error:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Compilation failed', details: err.message }),
    }
  }
}
