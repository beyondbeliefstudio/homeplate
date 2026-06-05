export const STORE_PALETTES = [
  { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' },  // 0 Green
  { bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA' },  // 1 Red
  { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' },  // 2 Blue
  { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },  // 3 Amber
  { bg: '#EDE9FE', color: '#6D28D9', border: '#DDD6FE' },  // 4 Purple
  { bg: '#FFE4E6', color: '#BE123C', border: '#FECDD3' },  // 5 Rose
  { bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA' },  // 6 Orange
  { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },  // 7 Sky
]

export function getStorePalette(store) {
  return STORE_PALETTES[(store?.palette ?? 0) % STORE_PALETTES.length]
}
