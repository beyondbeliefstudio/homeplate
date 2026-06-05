// HomePlate brand assets — V5

// Mark: place-setting SVG (plate + fork + knife)
// tile=true → filled green badge (app icon); tile=false → line mark in currentColor
export function Mark({ size = 56, tile = true, tileColor = 'var(--hp-green)', color = 'currentColor' }) {
  const strokeColor = tile ? 'var(--hp-bg-app)' : color
  const sw = tile ? 2.8 : 2.6
  const r = Math.round(size * 0.26)
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-label="HomePlate" aria-hidden="true">
      {tile && <rect x="0" y="0" width="56" height="56" rx={r} fill={tileColor} />}
      <g fill="none" stroke={strokeColor} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {/* plate */}
        <circle cx="28" cy="28" r="9.2" />
        <circle cx="28" cy="28" r="4.6" />
        {/* fork */}
        <path d="M10.5 13.5v5.2M12.4 13.5v5.2M14.3 13.5v5.2" />
        <path d="M10.5 18.7h3.8" />
        <path d="M12.4 18.7v23.8" />
        {/* knife */}
        <path d="M44 13.5q3.4 7 0 14" />
        <path d="M44 13.5v29" />
      </g>
    </svg>
  )
}

// Wordmark: "HomePlate" — mono=false: "Home" in ink-900, "Plate" in green
//                        mono=true:  both in currentColor (for colored backgrounds)
export function Wordmark({ size = 20, mono = false }) {
  return (
    <span
      style={{
        fontFamily: 'var(--hp-font-display)',
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'baseline',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        color: mono ? 'currentColor' : 'var(--hp-ink-900)',
      }}
    >
      <span>Home</span>
      <span style={{ color: mono ? 'currentColor' : 'var(--hp-green)' }}>Plate</span>
    </span>
  )
}

// Lockup: mark + wordmark side by side
export function Lockup({ markSize = 34, size = 20, gap = 10, tile = true, mono = false }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <Mark size={markSize} tile={tile} color={mono ? 'currentColor' : 'currentColor'} />
      <Wordmark size={size} mono={mono} />
    </span>
  )
}
