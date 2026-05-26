/**
 * HomePlate empty-state illustrations
 * Flat, four-color, chunky shapes — same visual language as the Mark.
 * Used only for empty cookbook and empty grocery list.
 */

/**
 * EmptyRecipes — a stack of recipe books fanned out
 * Used when the user has no recipes yet.
 */
export function EmptyRecipes() {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ maxWidth: 360 }} aria-hidden="true">
      <rect x="20" y="180" width="280" height="6" rx="3" fill="#14140F"/>
      <rect x="60"  y="100" width="34" height="80" rx="6" fill="#E5256D"/>
      <rect x="66"  y="110" width="22" height="3" rx="1.5" fill="#FCEEF3"/>
      <rect x="66"  y="118" width="14" height="3" rx="1.5" fill="#FCEEF3"/>
      <g transform="rotate(-6 110 140)">
        <rect x="98"  y="98" width="34" height="82" rx="6" fill="#7CB518"/>
        <rect x="104" y="108" width="22" height="3" rx="1.5" fill="#ECF5D2"/>
      </g>
      <rect x="138" y="92" width="34" height="88" rx="6" fill="#FFFFFF" stroke="#14140F" strokeWidth="1.5"/>
      <rect x="144" y="104" width="22" height="3" rx="1.5" fill="#14140F"/>
      <rect x="144" y="112" width="14" height="3" rx="1.5" fill="#14140F"/>
      <g transform="rotate(7 200 140)">
        <rect x="180" y="100" width="34" height="80" rx="6" fill="#F2B705"/>
        <rect x="186" y="110" width="22" height="3" rx="1.5" fill="#14140F"/>
      </g>
      <rect x="220" y="108" width="34" height="72" rx="6" fill="#14140F"/>
      <rect x="226" y="118" width="22" height="3" rx="1.5" fill="#F2B705"/>
      <circle cx="160" cy="60" r="6" fill="#E5256D"/>
      <circle cx="180" cy="48" r="4" fill="#F2B705"/>
      <circle cx="200" cy="58" r="3" fill="#7CB518"/>
    </svg>
  )
}

/**
 * EmptyGrocery — a completed checklist with a cherry badge
 * Used when all grocery items are checked / list is empty.
 */
export function EmptyGrocery() {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ maxWidth: 360 }} aria-hidden="true">
      <path
        d="M70 30 L250 30 L250 195 L235 188 L220 195 L205 188 L190 195 L175 188 L160 195 L145 188 L130 195 L115 188 L100 195 L85 188 L70 195 Z"
        fill="#FFFFFF" stroke="#14140F" strokeWidth="1.5"
      />
      {[55, 75, 95, 115, 135, 155].map((y, i) => (
        <g key={i}>
          <rect x="86" y={y - 3} width="16" height="16" rx="4" fill="#7CB518"/>
          <path
            d={`M91 ${y + 5} l3 3 l6 -6`}
            stroke="#FFFFFF" strokeWidth="2" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
          />
          <rect x="110" y={y}     width={[90, 120, 80, 100, 110, 70][i]} height="3"   rx="1.5" fill="#14140F"/>
          <rect x="110" y={y + 1} width={[80, 110, 72,  95, 100, 60][i]} height="1.5"           fill="#E5256D"/>
        </g>
      ))}
      <circle cx="240" cy="55" r="22" fill="#E5256D"/>
      <path d="M236 35 q4 -4 8 0" stroke="#7CB518" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="55"  cy="180" r="5" fill="#F2B705"/>
      <circle cx="40"  cy="160" r="3" fill="#7CB518"/>
      <circle cx="265" cy="170" r="4" fill="#E5256D"/>
    </svg>
  )
}
