// Generates a realistic aisle layout for a named grocery store.
// Input:  { storeName: string }
// Output: { aisles: [{ group_key, aisle_label, order }] }

const GROCERY_GROUPS = [
  { key: 'produce',   label: 'Produce' },
  { key: 'meat',      label: 'Meat & Seafood' },
  { key: 'dairy',     label: 'Dairy & Eggs' },
  { key: 'bakery',    label: 'Bread & Bakery' },
  { key: 'frozen',    label: 'Frozen Foods' },
  { key: 'canned',    label: 'Canned & Jarred' },
  { key: 'pantry',    label: 'Pantry & Dry Goods' },
  { key: 'beverages', label: 'Beverages' },
  { key: 'other',     label: 'General' },
]

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let storeName
  try {
    ;({ storeName } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!storeName?.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'storeName is required' }) }
  }

  const apiKey = process.env.ANTHROPIC_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing ANTHROPIC_KEY' }) }
  }

  const groupsText = GROCERY_GROUPS.map(g => `- ${g.key}: ${g.label}`).join('\n')

  const prompt = `Generate a realistic grocery store aisle layout for "${storeName.trim()}".

Map each grocery category to the aisle number or location label as it actually appears in that store. Use short, store-accurate labels (e.g. "Aisle 1", "Section A", "Dairy Corner", "Center Store"). Arrange them in logical shopping-route order (produce first, frozen last is typical).

Return ONLY valid JSON array — no markdown, no code fences:
[
  { "group_key": "produce", "aisle_label": "Aisle 1", "order": 0 },
  ...
]

Categories to map (use exact group_key values):
${groupsText}

Rules:
- Every group_key must appear exactly once
- aisle_label must be under 20 characters
- order is 0-based integer; arrange in realistic shopping route order
- Match the specific store's style: Aldi uses sections, Target uses Aisle numbers, Publix uses numbered aisles`

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
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    return { statusCode: resp.status, body: JSON.stringify({ error: `API error: ${err}` }) }
  }

  const data = await resp.json()
  const raw  = data.content?.[0]?.text?.trim() || '[]'

  try {
    let aisles = JSON.parse(raw)
    if (!Array.isArray(aisles)) throw new Error('Expected array')

    const validKeys = new Set(GROCERY_GROUPS.map(g => g.key))

    // Filter to valid keys only
    aisles = aisles.filter(a => a.group_key && validKeys.has(a.group_key) && a.aisle_label)

    // Fill in any missing groups
    const present = new Set(aisles.map(a => a.group_key))
    GROCERY_GROUPS.forEach((g, i) => {
      if (!present.has(g.key)) {
        aisles.push({ group_key: g.key, aisle_label: g.label, order: 1000 + i })
      }
    })

    // Sort by order and re-index to consecutive 0-based integers
    aisles.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    aisles = aisles.map((a, i) => ({ group_key: a.group_key, aisle_label: a.aisle_label, order: i }))

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aisles }),
    }
  } catch {
    // Fallback: sensible default layout
    const aisles = GROCERY_GROUPS.map((g, i) => ({ group_key: g.key, aisle_label: g.label, order: i }))
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aisles }),
    }
  }
}
