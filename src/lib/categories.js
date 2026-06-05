// Category colour values match the HomePlate brand token system.
// Hex literals are used so they work in both CSS color-mix() and as
// direct SVG/background values without requiring CSS custom-property resolution.

export const CATEGORIES = {
  breakfast: { label: 'Breakfast', color: '#FFC228' },  // --hp-marigold
  lunch:     { label: 'Lunch',     color: '#58CC02' },  // --hp-spring
  dinner:    { label: 'Dinner',    color: '#E63957' },  // --hp-cherry
  dessert:   { label: 'Dessert',   color: '#E63957' },  // --hp-cherry
  snack:     { label: 'Snack',     color: '#FF7733' },  // --hp-tangerine
  side:      { label: 'Side',      color: '#3DA002' },  // --hp-spring-700
  beverage:  { label: 'Beverage',  color: '#2E7AFF' },  // blue
  other:     { label: 'Other',     color: '#5C625E' },  // --hp-ink-500
}

export const CATEGORY_LIST = Object.entries(CATEGORIES).map(([value, meta]) => ({
  value,
  ...meta,
}))

export function getCategoryMeta(value) {
  return CATEGORIES[value] ?? CATEGORIES.other
}
