// HomePlate brand assets
// Wordmark — pure CSS text, adapts to dark mode via var(--text-1)
// Mark     — contained SVG logomark, always renders on its own dark bg

export function Wordmark({ height = 22, dark = 'var(--text-1)', accent = 'var(--hp-cherry)' }) {
  return (
    <span
      style={{
        fontFamily: 'var(--hp-font-display)',
        fontWeight: 700,
        fontSize: height,
        lineHeight: 1,
        letterSpacing: '-0.045em',
        display: 'inline-flex',
        alignItems: 'baseline',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <span style={{ color: dark }}>Home</span>
      <span style={{ color: accent }}>Plate</span>
      <span style={{ color: accent, marginLeft: '-0.02em' }}>.</span>
    </span>
  )
}

// SVG presentation attributes don't reliably accept CSS vars across all browsers,
// so hex defaults are used. The mark always sits on its own bg rect, so it reads
// well on any page background in both light and dark mode.
export function Mark({ size = 96, bg = '#0E1212', fg = '#FFFFFF', accent = '#E63957' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="88" height="88" rx="22" fill={bg} />
      <rect x="22" y="26" width="14" height="44" rx="7" fill={fg} />
      <rect x="60" y="26" width="14" height="44" rx="7" fill={fg} />
      <rect x="22" y="41" width="52" height="14" rx="7" fill={fg} />
      <circle cx="74" cy="22" r="9" fill={accent} stroke={bg} strokeWidth="4" />
    </svg>
  )
}
