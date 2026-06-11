const Anthropic = require('@anthropic-ai/sdk')

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

  const { ingredients = [] } = body
  if (!ingredients.length) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finalItems: [], questions: [] }),
    }
  }

  // Format ingredient list grouped by recipe for the prompt
  const grouped = {}
  ingredients.forEach(i => {
    const key = i.recipeName || 'Other'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push([i.quantity, i.unit, i.name].filter(Boolean).join(' '))
  })

  const ingredientLines = Object.entries(grouped)
    .map(([recipe, items]) => `${recipe}:\n${items.map(i => `  • ${i}`).join('\n')}`)
    .join('\n\n')

  const prompt = `You are a smart grocery list compiler for a home cook. Compile the following raw ingredients from a week of meals into a clean, ready-to-shop grocery list.

RAW INGREDIENTS:
${ingredientLines}

YOUR RULES:
1. Combine identical or very similar ingredients across recipes — sum quantities when units match.
2. Convert cooking measurements to real-world purchase units. Examples:
   - "3 cups milk" → "1 quart milk"
   - "2 cups flour" → "1 lb flour"
   - "½ cup olive oil" → "1 bottle olive oil" or "1 small bottle olive oil"
   - "3 tablespoons butter" → "1 stick butter"
   - "2 large eggs, 1 egg" → "1 dozen eggs"
   - Keep produce amounts natural: "3 cloves garlic" → "1 head garlic"
   - Canned goods: use number of cans, not cup measurements
3. Only create a question when ingredients GENUINELY CONFLICT in TYPE (e.g., whole milk vs oat milk, salted vs unsalted butter, fresh vs frozen spinach). Do NOT ask about quantity differences of the same item — just combine them.
4. For confidently compiled items, put them in finalItems.
5. For type conflicts only, create a question with 2–3 options plus an autoResolve.

Return ONLY valid JSON with no markdown formatting:
{
  "finalItems": [
    { "name": "string", "quantity": "string", "unit": "string", "note": "optional: brief context like 'for Pasta Bake + Lasagna'" }
  ],
  "questions": [
    {
      "id": "string",
      "prompt": "string — natural, conversational, explain the conflict briefly",
      "options": [
        { "label": "string — clear action label", "resolvedItems": [{ "name": "string", "quantity": "string", "unit": "string" }] }
      ],
      "autoResolve": { "resolvedItems": [{ "name": "string", "quantity": "string", "unit": "string" }] }
    }
  ]
}`

  try {
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].text.trim()

    // Extract JSON — handle both raw JSON and markdown code blocks
    let jsonStr = text
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
    if (codeBlockMatch) jsonStr = codeBlockMatch[1]
    else {
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
