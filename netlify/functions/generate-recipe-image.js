// Generates a recipe illustration image using DALL-E 3.
// Input:  { name, category, ingredients, instructions }
// Output: { url } — a temporary DALL-E image URL (valid ~1 hour)

const DISH_TYPE = {
  dinner:    'on a wide white ceramic dinner plate',
  lunch:     'in a bowl or on a plate',
  breakfast: 'on a ceramic plate or in a bowl',
  snack:     'on a small plate or wooden board',
  side:      'in a serving bowl or on a plate',
  dessert:   'on a white dessert plate or in a small bowl',
  beverage:  'in a glass or ceramic mug',
  other:     'on a plate or in a bowl',
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing OPENAI_API_KEY' }) }
  }

  let name, category, ingredients, instructions, extraContext
  try {
    ;({ name, category, ingredients, instructions, extraContext } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!name?.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Recipe name is required' }) }
  }

  const dishType    = DISH_TYPE[category] || DISH_TYPE.other
  const keyIngreds  = (ingredients || [])
    .slice(0, 6)
    .map(i => i.name)
    .filter(Boolean)
    .join(', ')

  const ingredientLine = keyIngreds
    ? `The only visible food ingredients in the image must be: ${keyIngreds}. Do not add any other food items, garnishes, or ingredients that are not in this list.`
    : 'Show only the finished dish — do not add any extra food items or garnishes not described above.'

  const prompt = `Create a warm, simplified editorial recipe illustration of ${name}.

The image should show ${name} served ${dishType}, with the main food as the clear focal point.
${extraContext ? `\nSPECIFIC VISUAL DETAILS — follow these exactly: ${extraContext}\n` : ''}
IMPORTANT — Ingredients restriction: ${ingredientLine}

Style direction:
Use a cozy, modern recipe illustration style with flat graphic shapes, soft painterly shading, warm natural light, subtle grain, and a slight paper texture. The artwork should feel hand-illustrated, charming, warm, and appetizing, but not photorealistic. Avoid excessive detail, tiny texture, harsh realism, or glossy photography effects.

Composition:
Use a slightly elevated 3/4 overhead angle, close-cropped like a recipe blog hero image. The food should fill most of the frame, around 70 to 80 percent of the image. Keep the composition clean, balanced, and focused on the dish.

Color palette:
Use warm, muted, cozy colors: creamy whites, golden yellows, warm browns, soft oranges, deep greens, and gentle shadow tones. Keep the palette limited and consistent. Only use colors that are appropriate for the actual ingredients listed above.

Lighting:
Use warm directional light from the upper left, with broad simple shadows. Highlights should be soft and graphic, not realistic or overly shiny.

Background and props:
Place the dish on a warm wooden tabletop with simplified wood grain. Add only a few simple non-food props such as a folded cream towel with navy stripes, a spoon, or a small empty bowl. Do not add any food items as props that are not listed in the ingredients above.

Rendering rules:
Simplify all food shapes. Use rounded forms, broad shadow blocks, minimal highlights, and gentle texture. Do not make the food look like a real photograph. Do not include people, hands, text, labels, logos, typography, watermarks, or recipe card elements.

The final image should look like a polished, consistent food blog illustration from the same visual series.

Negative prompt: Avoid photorealism, hyperreal detail, harsh shadows, glossy food photography, excessive texture, messy props, cluttered backgrounds, realistic steam, hands, people, text, labels, logos, watermarks, recipe cards, utensils blocking the food, extreme close-ups, dramatic restaurant lighting, overly complex rendering, or any food ingredients not explicitly listed above.`

  const resp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1-mini',
      prompt,
      n: 1,
      size: '1536x1024',
      quality: 'medium',
    }),
  })

  const data = await resp.json()

  if (!resp.ok) {
    const msg = data.error?.message || `OpenAI error ${resp.status}`
    return { statusCode: resp.status, body: JSON.stringify({ error: msg }) }
  }

  // gpt-image-1 returns base64 by default
  const b64 = data.data[0].b64_json
  const url = data.data[0].url

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ b64: b64 || null, url: url || null }),
  }
}
