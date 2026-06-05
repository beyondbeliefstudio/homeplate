// Generates the AI weekly summary text and insight tags for the dashboard.
//
// Input:  { weekMeals: [{name, category, prepTime, cookTime}] }
// Output: { summaryText: string, tags: [{text, style}] }

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let weekMeals = []
  try {
    ;({ weekMeals = [] } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!weekMeals.length) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summaryText: 'No meals planned yet this week. Head to the planner to start building your week — even a few dinners makes grocery shopping much easier.',
        tags: [],
      }),
    }
  }

  const apiKey = process.env.ANTHROPIC_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing ANTHROPIC_KEY' }) }
  }

  const dinners = weekMeals.filter(m => m.category === 'dinner' || m.category === 'main')
  const avgCookTime = weekMeals.length
    ? Math.round(weekMeals.reduce((s, m) => s + (m.prepTime || 0) + (m.cookTime || 0), 0) / weekMeals.length)
    : 0

  const mealList = weekMeals.map(m =>
    `- ${m.name} (${m.category || 'meal'}${m.prepTime || m.cookTime ? `, ${(m.prepTime||0)+(m.cookTime||0)} min` : ''})`
  ).join('\n')

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `You are a friendly meal planning assistant writing a brief weekly summary for a family's dashboard.

This week's planned meals:
${mealList}

Write a 1-2 sentence summary of the week's meals — note variety, any patterns (lots of one protein, quick meals, etc.), and give a gentle suggestion if relevant. Be direct and specific, not generic.

Then generate 3-4 short insight tags (2-5 words each) about this week. Tags should be factual observations or light flags.
Examples: "Protein-forward", "Avg 25 min prep", "Light on vegetables", "Good variety", "Heavy on chicken", "Quick weeknights"

Return ONLY this JSON (no markdown):
{
  "summaryText": "...",
  "tags": [
    {"text": "...", "style": "gray"},
    {"text": "...", "style": "gray"}
  ]
}

Tag styles: "gray" for neutral facts, "orange" for light flags/warnings, "green" for positive highlights.
${avgCookTime > 0 ? `Note: average cook time this week is ${avgCookTime} minutes.` : ''}`,
      }],
    }),
  })

  if (!resp.ok) {
    return { statusCode: resp.status, body: JSON.stringify({ error: 'Anthropic API error' }) }
  }

  const data = await resp.json()
  const text = data.content?.[0]?.text?.trim() || '{}'

  try {
    const result = JSON.parse(text)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summaryText: result.summaryText || '',
        tags: Array.isArray(result.tags) ? result.tags : [],
      }),
    }
  } catch {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summaryText: '', tags: [] }),
    }
  }
}
