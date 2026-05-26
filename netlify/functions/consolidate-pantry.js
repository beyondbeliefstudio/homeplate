// Cleans up the grocery list in one API call:
//   pantryItems → consolidated, deduplicated ingredient names
//   shopItems   → natural-language labels ("0.5 unit Lemon" → "½ lemon")
//
// Input:  { pantryItems: string[], shopItems: string[] }
// Output: { pantryNames: string[], shopLabels: string[] }

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let pantryItems = [], shopItems = []
  try {
    ;({ pantryItems = [], shopItems = [] } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!pantryItems.length && !shopItems.length) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pantryNames: [], shopLabels: [] }),
    }
  }

  const apiKey = process.env.ANTHROPIC_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing ANTHROPIC_KEY' }) }
  }

  const pantrySection = pantryItems.length ? `
TASK 1 — PANTRY CHECK LIST
Consolidate these ingredient mentions into a clean, minimal list.
Rules:
- Merge near-duplicates aggressively ("pinch of salt", "salt and pepper", "kosher salt" → "salt")
- Strip all quantities and prep notes — keep only the ingredient name
- List each item once, sorted alphabetically
- Return a JSON array of strings

Items:
${pantryItems.join('\n')}` : ''

  const shopSection = shopItems.length ? `
TASK 2 — SHOPPING LIST LABELS
Rewrite each label so it sounds like a real person wrote it — not a database export.
Rules:
- Convert decimals to vulgar fractions: 0.5 → ½, 0.25 → ¼, 0.75 → ¾, 1.5 → 1½
- Drop "unit" or "units" as a measurement ("0.5 unit lemon" → "½ lemon")
- Remove stray commas between quantity/unit and name ("½ cup, shaved Parmesan" → "½ cup shaved Parmesan")
- Lowercase ingredient names unless they're proper nouns
- Keep it concise and natural
- Return a JSON array of EXACTLY ${shopItems.length} strings in the SAME ORDER as input

Items:
${shopItems.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : ''

  const responseFormat = `
Return ONLY this JSON object (no markdown, no explanation):
{
  "pantryNames": ${pantryItems.length ? '[...array from Task 1...]' : '[]'},
  "shopLabels": ${shopItems.length ? `[...array of exactly ${shopItems.length} strings from Task 2...]` : '[]'}
}`

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a grocery list assistant.${pantrySection}${shopSection}${responseFormat}`,
        },
      ],
    }),
  })

  if (!resp.ok) {
    return { statusCode: resp.status, body: JSON.stringify({ error: 'Anthropic API error' }) }
  }

  const data = await resp.json()
  const text = data.content?.[0]?.text?.trim() || '{}'

  try {
    const result = JSON.parse(text)
    if (typeof result !== 'object' || Array.isArray(result)) throw new Error('bad shape')

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pantryNames: Array.isArray(result.pantryNames) ? result.pantryNames : pantryItems,
        shopLabels:  Array.isArray(result.shopLabels)  ? result.shopLabels  : shopItems,
      }),
    }
  } catch {
    // Fallback: return originals unchanged
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pantryNames: pantryItems, shopLabels: shopItems }),
    }
  }
}
