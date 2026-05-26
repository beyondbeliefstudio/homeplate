// Reads an aisle number or location label from a grocery store aisle sign photo.
// Input:  { image: { mediaType: string, data: string }, storeName?: string }
// Output: { aisle_label: string }

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let image, storeName
  try {
    ;({ image, storeName } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!image?.data || !image?.mediaType) {
    return { statusCode: 400, body: JSON.stringify({ error: 'image is required' }) }
  }

  const apiKey = process.env.ANTHROPIC_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing ANTHROPIC_KEY' }) }
  }

  const storeContext = storeName ? ` from ${storeName}` : ''

  const prompt = `This is a photo of a grocery store aisle sign${storeContext}.

Read the aisle identifier from the sign — the number, letter, or short location name that appears on it. Examples: "Aisle 3", "Section B", "Aisle 12", "Dairy Corner", "Back Wall", "Section 1".

Return ONLY valid JSON — no markdown, no code fences:
{ "aisle_label": "Aisle 3" }

Keep the aisle_label under 20 characters. If you can't read a clear label from the photo, return your best guess based on what's visible.`

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 128,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    return { statusCode: resp.status, body: JSON.stringify({ error: `API error: ${err}` }) }
  }

  const data = await resp.json()
  const raw  = data.content?.[0]?.text?.trim() || '{}'

  try {
    const result = JSON.parse(raw)
    const label = typeof result.aisle_label === 'string' && result.aisle_label.trim()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aisle_label: label || null }),
    }
  } catch {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aisle_label: null }),
    }
  }
}
