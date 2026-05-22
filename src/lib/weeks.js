export function getWeekStart(date = new Date()) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay()) // back to Sunday
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekKey(date = new Date()) {
  return getWeekStart(date).toISOString().slice(0, 10) // "2026-05-18"
}

export function getWeekDates(weekKey) {
  const start = new Date(weekKey + 'T12:00:00') // noon avoids DST edge cases
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export function shiftWeek(weekKey, delta) {
  const d = new Date(weekKey + 'T12:00:00')
  d.setDate(d.getDate() + delta * 7)
  return getWeekKey(d)
}

export function formatWeekRange(weekKey) {
  const [start, end] = [getWeekDates(weekKey)[0], getWeekDates(weekKey)[6]]
  const s = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const e = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${s} – ${e}`
}

export const MEAL_TYPES  = ['breakfast', 'lunch', 'dinner', 'snack']
export const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }
export const DAY_LABELS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
