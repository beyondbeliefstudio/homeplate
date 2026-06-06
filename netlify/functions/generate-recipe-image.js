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

// Props vary by category so every image feels distinct and contextually appropriate
const PROPS_BY_CATEGORY = {
  dinner: [
    'a linen napkin folded beside the plate, a fork and steak knife resting alongside',
    'a small ramekin of sauce, a sprig of fresh herbs, and a linen napkin in the corner',
    'a simple candle in a short holder, a folded cloth napkin, and a wine glass slightly out of focus',
    'a rustic ceramic side dish, a wooden serving spoon, and scattered fresh herbs on the table',
    'a small olive oil cruet, a pinch bowl of flaky salt, and a folded dark linen napkin',
  ],
  breakfast: [
    'a small pitcher of maple syrup, a pat of butter on a tiny dish, and a folded gingham napkin',
    'a cup of coffee or orange juice slightly out of frame, and a small jar of jam beside the plate',
    'a ceramic coffee mug with steam, a small pot of honey, and a simple linen napkin',
    'a glass of orange juice, a small pot of butter, and a folded white napkin with a spoon',
    'a tiny crock of jam, a glass of milk, and scattered crumbs suggesting a casual morning table',
  ],
  lunch: [
    'a small glass of sparkling water with lemon, and a folded paper napkin beside the bowl',
    'a ceramic crock of soup alongside, a crusty bread roll on the side, and a simple spoon',
    'a small side salad in a bowl, a glass of iced water, and a folded cotton napkin',
    'a simple fork resting on a cloth napkin, and a small dish of olive oil for dipping nearby',
    'a pickle jar, a small bowl of chips, and a casual paper napkin tucked beside the plate',
  ],
  snack: [
    'a small bowl of dipping sauce, a casual stack of napkins, and a wooden serving board',
    'a little jar of honey for drizzling, and a few crackers scattered on a slate board',
    'a glass of iced tea, a small dish of nuts, and a relaxed cloth napkin underneath',
    'a wooden skewer resting beside, parchment paper underneath, and a dipping cup of ranch',
    'a small wire basket lined with parchment, a tiny ramekin of sauce, and a bottle of hot sauce',
  ],
  side: [
    'a wooden serving spoon resting in the bowl, a folded linen towel, and scattered herbs on the table',
    'a small ramekin of butter, fresh herb sprigs beside the bowl, and a simple cloth napkin',
    'a ceramic gravy boat slightly out of focus, and a simple serving fork resting on a linen cloth',
    'a sprinkle of toasted seeds on the table, a simple dish towel, and a small ladle nearby',
    'a carving fork resting alongside, scattered peppercorns, and a white ceramic dish with a rim',
  ],
  dessert: [
    'a small scoop of vanilla ice cream in a white ramekin beside the plate, and a dessert spoon',
    'a dusting of powdered sugar on the table, a mint sprig, and a small pitcher of cream',
    'a little jar of caramel or chocolate sauce, a dessert fork, and a folded white cloth napkin',
    'a candle stub in a short holder, scattered berries on the table, and a small fork',
    'a cup of espresso slightly out of focus, and a tiny sifter with powdered sugar beside the plate',
  ],
  beverage: [
    'a few ice cubes on the table, a folded bar cloth, and a small bowl of citrus slices',
    'a cocktail stirrer resting on the rim, a small bowl of garnishes, and a linen coaster underneath',
    'a vintage bottle slightly blurred in the background, and a small snack dish on the side',
    'scattered coffee beans on the surface, a small spoon, and a folded café napkin',
    'a simple glass straw, a wedge of citrus on the rim, and a casual linen napkin',
  ],
  other: [
    'a simple linen napkin, a classic fork and spoon resting alongside, and warm soft shadows',
    'a small ceramic dish on the side, a folded cloth, and a light scatter of fresh herbs',
    'a rustic wooden board underneath, a small ramekin, and a pinch bowl of seasoning',
    'a simple white side dish, a cloth napkin loosely folded, and a soft natural background',
    'a small olive oil bottle, scattered spice on the table, and a simple ceramic serving spoon',
  ],
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

  // Pick props deterministically based on recipe name so the same recipe always
  // gets the same setting, but different recipes feel visually distinct
  const propOptions = PROPS_BY_CATEGORY[category] || PROPS_BY_CATEGORY.other
  const propIndex   = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % propOptions.length
  const props       = propOptions[propIndex]

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
Place the dish on a warm wooden tabletop with simplified wood grain. Add only these specific props: ${props}. Do not add any other props or food items not listed in the ingredients above.

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
