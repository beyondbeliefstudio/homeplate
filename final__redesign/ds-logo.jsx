// HomePlate — logo marks. Three food-related concepts; each works as a filled
// "app icon" badge or a line mark. Pick one (or mix) during review.

// ---- Concept 1: Place setting (plate + fork + knife) ----
const markPlate = (stroke, sw = 2.6) => (
  <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
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
);

// ---- Concept 2: Roof + plate (home over a plate) ----
const markRoof = (stroke, sw = 2.6) => (
  <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 25.5 28 12l16 13.5" />
    <circle cx="28" cy="33.5" r="8.6" />
    <circle cx="28" cy="33.5" r="4.2" />
  </g>
);

// ---- Concept 3: Saucepan + steam (cooking / homemade) ----
const markBowl = (stroke, sw = 2.6) => (
  <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {/* steam */}
    <path d="M22 10c1.7 1.4 1.7 2.8 0 4.2" />
    <path d="M29 9c1.7 1.4 1.7 2.8 0 4.2" />
    {/* lid rim — slightly wider than body */}
    <path d="M13.5 19.5h21" />
    {/* pan body */}
    <path d="M15.5 19.5v6.5a4 4 0 0 0 4 4h9a4 4 0 0 0 4-4v-6.5" />
    {/* handle */}
    <path d="M34.5 22.5h8" />
  </g>
);

const MARKS = { plate: markPlate, roof: markRoof, bowl: markBowl };

// Unified Mark. tile=true → filled olive app-icon; tile=false → line mark in `color`.
const Mark = ({ variant = 'plate', size = 56, tile = true, color = 'var(--green)', tileColor = 'var(--green)' }) => {
  const draw = MARKS[variant] || markPlate;
  const r = Math.round(size * 0.26);
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-label={`HomePlate mark — ${variant}`}>
      {tile && <rect x="0" y="0" width="56" height="56" rx={56 * 0.27} fill={tileColor} />}
      {draw(tile ? 'var(--bg-app)' : color, tile ? 2.8 : 2.6)}
    </svg>
  );
};

// Wordmark — "HomePlate" with Plate emphasized in olive.
const Wordmark = ({ size = 34, mono = false }) => (
  <span style={{
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size,
    letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap',
    color: mono ? 'currentColor' : 'var(--ink-900)',
  }}>
    Home<span style={{ color: mono ? 'currentColor' : 'var(--green)' }}>Plate</span>
  </span>
);

// Full lockup: mark + wordmark
const Lockup = ({ variant = 'plate', markSize = 44, size = 30, gap = 14, tile = true }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
    <Mark variant={variant} size={markSize} tile={tile} />
    <Wordmark size={size} />
  </span>
);

Object.assign(window, { Mark, Wordmark, Lockup, MARKS });
