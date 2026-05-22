export const CATEGORIES = {
  breakfast: { label: 'Breakfast', color: '#F5A84A' },
  lunch:     { label: 'Lunch',     color: '#4CAF7D' },
  dinner:    { label: 'Dinner',    color: '#6B8FF5' },
  dessert:   { label: 'Dessert',   color: '#D47AA0' },
  snack:     { label: 'Snack',     color: '#C97B4B' },
  side:      { label: 'Side',      color: '#4BBFC4' },
  other:     { label: 'Other',     color: '#7A7A7A' },
}

export const CATEGORY_LIST = Object.entries(CATEGORIES).map(([value, meta]) => ({
  value,
  ...meta,
}))

export function getCategoryMeta(value) {
  return CATEGORIES[value] ?? CATEGORIES.other
}
