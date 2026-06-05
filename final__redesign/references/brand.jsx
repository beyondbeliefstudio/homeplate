// HomePlate v2 brand foundations — pale sage, bold sans, no serif

// ===== Wordmark =====
// "HomePlate." — heavy Bricolage Grotesque, color-split, dark + magenta. No italic.
const Wordmark = ({ height = 64, dark = 'var(--ink-900)', accent = 'var(--hot)' }) => (
  <div style={{
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: height,
    lineHeight: 1,
    letterSpacing: '-0.045em',
    display: 'inline-flex',
    alignItems: 'baseline',
    whiteSpace: 'nowrap',
  }}>
    <span style={{ color: dark }}>Home</span>
    <span style={{ color: accent }}>Plate</span>
    <span style={{ color: accent, marginLeft: '-0.02em' }}>.</span>
  </div>
);

// ===== Mark =====
// Bold filled "plate" silhouette — a chunky rounded shape with a magenta meatball.
// Reads as: plate, H, set table.
const Mark = ({ size = 96, bg = 'var(--ink-900)', fg = '#FFFFFF', accent = 'var(--hot)' }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
    {/* outer rounded square — the placemat */}
    <rect x="4" y="4" width="88" height="88" rx="22" fill={bg}/>
    {/* H carved in negative space — three rounded bars */}
    <rect x="22" y="26" width="14" height="44" rx="7" fill={fg}/>
    <rect x="60" y="26" width="14" height="44" rx="7" fill={fg}/>
    <rect x="22" y="41" width="52" height="14" rx="7" fill={fg}/>
    {/* meatball — accent dot top right */}
    <circle cx="74" cy="22" r="9" fill={accent} stroke={bg} strokeWidth="4"/>
  </svg>
);

// Logo artboard — cleaner, more focused than before
const LogoArtboard = () => (
  <div className="hp" style={{ padding: 56, background: 'var(--bg-app)' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36, height: '100%' }}>
      <div className="t-eyebrow">01 — Logo &amp; wordmark</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <Mark size={160} />
        <Wordmark height={160} />
      </div>

      <hr className="divider" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        <LogoTile bg="var(--paper)" label="Default" inkLabel="var(--ink-500)">
          <Wordmark height={42} />
        </LogoTile>
        <LogoTile bg="var(--ink-900)" label="Reversed" inkLabel="var(--ink-200)">
          <Wordmark height={42} dark="var(--paper)" accent="var(--sun)" />
        </LogoTile>
        <LogoTile bg="var(--hot)" label="On cherry" inkLabel="var(--hot-100)">
          <Wordmark height={42} dark="var(--paper)" accent="var(--ink-900)" />
        </LogoTile>
        <LogoTile bg="var(--leaf)" label="On leaf" inkLabel="var(--leaf-50)">
          <Wordmark height={42} dark="var(--paper)" accent="var(--ink-900)" />
        </LogoTile>
      </div>

      <div>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>App icon · the mark, four ways</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          <div style={{ aspectRatio: '1', borderRadius: 22, display: 'grid', placeItems: 'center', background: 'var(--ink-900)' }}>
            <Mark size={120} />
          </div>
          <div style={{ aspectRatio: '1', borderRadius: 22, display: 'grid', placeItems: 'center', background: 'var(--hot)' }}>
            <Mark size={120} bg="var(--paper)" fg="var(--hot)" accent="var(--ink-900)" />
          </div>
          <div style={{ aspectRatio: '1', borderRadius: 22, display: 'grid', placeItems: 'center', background: 'var(--leaf)' }}>
            <Mark size={120} bg="var(--ink-900)" fg="var(--leaf)" accent="var(--sun)" />
          </div>
          <div style={{ aspectRatio: '1', borderRadius: 22, display: 'grid', placeItems: 'center', background: 'var(--sun)' }}>
            <Mark size={120} bg="var(--ink-900)" fg="var(--sun)" accent="var(--hot)" />
          </div>
          <div style={{ aspectRatio: '1', borderRadius: 22, display: 'grid', placeItems: 'center', background: 'var(--paper)', border: '1px solid var(--ink-200)' }}>
            <Mark size={120} />
          </div>
        </div>
      </div>

      <p className="t-body-sm" style={{ color: 'var(--text-soft)', maxWidth: 760 }}>
        Heavy Funnel Display. "Home" in ink, "Plate" in cherry with a cherry full stop. The mark is a chunky placemat with a recessed H — the cherry meatball sits where the dot of an i would. Never substitute the period for something else; it's load-bearing.
      </p>
    </div>
  </div>
);

const LogoTile = ({ bg, label, inkLabel, children }) => (
  <div style={{
    background: bg, borderRadius: 22, padding: 22,
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    minHeight: 130, border: bg === 'var(--paper)' ? '1px solid var(--ink-200)' : 'none',
  }}>
    <span className="t-eyebrow" style={{ color: inkLabel }}>{label}</span>
    {children}
  </div>
);

// ===== Color =====
const Swatch = ({ name, hex, role, on, big }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{
      background: hex, color: on || '#fff',
      borderRadius: 22, padding: big ? '22px 22px' : '18px 18px',
      height: big ? 200 : 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.03)',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: big ? 30 : 20, letterSpacing: '-0.02em',
      }}>{name}</div>
      <div className="t-mono">{hex}</div>
    </div>
    <div className="t-caption" style={{ color: 'var(--ink-700)' }}>{role}</div>
  </div>
);

const ColorArtboard = () => (
  <div className="hp" style={{ padding: 56, background: 'var(--bg-app)', overflow: 'auto' }}>
    <div className="t-eyebrow" style={{ marginBottom: 12 }}>02 — Color</div>
    <h2 className="t-h2" style={{ marginBottom: 8 }}>Cool mist canvas. A bright trio on top.</h2>
    <p className="t-body" style={{ color: 'var(--text-soft)', marginBottom: 28, maxWidth: 720 }}>
      The page rests on a cool mist off-white. White cards float on top with no chrome. Three vivid, decisive accents do the work — cherry, spring, marigold. Bold without being neon, fresh without being clinical.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
      <Swatch name="Cherry" hex="#E63957" role="Primary · CTAs, brand moments, active states" big />
      <Swatch name="Spring" hex="#58CC02" role="Secondary · success, made, audience" big />
      <Swatch name="Marigold" hex="#FFC228" role="Accent · highlights, raids, kids" big />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
      <Swatch name="Mist" hex="#F4F6EE" role="App background" on="#0E1212" />
      <Swatch name="Paper" hex="#FFFFFF" role="Cards / surface" on="#0E1212" />
      <Swatch name="Ink 900" hex="#0E1212" role="Body text" />
      <Swatch name="Ink 500" hex="#5C625E" role="Secondary text" />
      <Swatch name="Ink 200" hex="#D4D7CC" role="Borders" on="#0E1212" />
      <Swatch name="Ink 50"  hex="#EEF1E5" role="Tints, fills" on="#0E1212" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 }}>
      <Scale label="Cherry scale"   stops={['#FEE9ED','#FCD9DF','#F8A2B3','#EF6580','#E63957','#C42445','#8A1430']}/>
      <Scale label="Spring scale"   stops={['#ECF9D8','#DBF4B8','#B7E97A','#86DD3A','#58CC02','#3DA002','#23660A']}/>
      <Scale label="Marigold scale" stops={['#FFF4C9','#FFE89E','#FFD562','#FFC228','#E5A500','#B07F00','#704F00']}/>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
      <div className="card-out" style={{ padding: 22 }}>
        <div className="t-eyebrow" style={{ color: 'var(--leaf-700)', marginBottom: 10 }}>Do</div>
        <ul className="t-body-sm" style={{ paddingLeft: 18, margin: 0, color: 'var(--ink-700)' }}>
          <li>Mist is the page. White is the card. Don't put white-on-white.</li>
          <li>One vivid color leads per screen. The other two support.</li>
          <li>Use full-saturation fills — colors stay flat, never gradients.</li>
        </ul>
      </div>
      <div className="card-out" style={{ padding: 22 }}>
        <div className="t-eyebrow" style={{ color: 'var(--hot)', marginBottom: 10 }}>Don't</div>
        <ul className="t-body-sm" style={{ paddingLeft: 18, margin: 0, color: 'var(--ink-700)' }}>
          <li>No cherry-to-marigold gradients. Ever.</li>
          <li>Don't put spring type on mist — contrast is too thin.</li>
          <li>Marigold is for accents and fills, never body text or long runs.</li>
        </ul>
      </div>
    </div>

    <div style={{ marginTop: 28 }}>
      <div className="t-eyebrow" style={{ marginBottom: 10 }}>Dark adaptation (tokens — light is the product)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {[
          ['#0F1414','bg'],['#1A1F1D','surface'],['#252B28','elev'],['#F4F6EE','text'],
          ['#FF5575','cherry'],['#7AE020','spring'],
        ].map(([c, n]) => (
          <div key={n} style={{ background: c, borderRadius: 14, padding: '14px 16px', color: c === '#F4F6EE' ? '#0E1212' : '#F4F6EE', display: 'flex', justifyContent: 'space-between' }}>
            <span className="t-caption" style={{ color: 'inherit' }}>{n}</span>
            <span className="t-mono">{c}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Scale = ({ label, stops }) => (
  <div>
    <div className="t-eyebrow" style={{ marginBottom: 10 }}>{label}</div>
    <div style={{ display: 'flex', borderRadius: 14, overflow: 'hidden', height: 56 }}>
      {stops.map(c => <div key={c} style={{ flex: 1, background: c }} />)}
    </div>
  </div>
);

// ===== Type =====
const TypeArtboard = () => (
  <div className="hp" style={{ padding: 56, background: 'var(--bg-app)', overflow: 'auto' }}>
    <div className="t-eyebrow" style={{ marginBottom: 12 }}>03 — Typography</div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
      <div>
        <div className="t-eyebrow" style={{ color: 'var(--hot)', marginBottom: 8 }}>Display</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 76, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em' }}>
          Funnel<br/>Display.
        </div>
        <div className="t-body-sm" style={{ color: 'var(--text-soft)', marginTop: 12, maxWidth: 420 }}>
          Chunky modern sans with rounded soft corners. Used at heavy weight (700) for display, wired straight to the brand voice. Distinct character without becoming a circus.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          {[['Light', 300], ['Medium', 500], ['Bold', 700]].map(([l, w]) => (
            <div key={l} className="card-out" style={{ padding: '10px 16px' }}>
              <div className="t-caption" style={{ color: 'var(--ink-500)' }}>{l} · {w}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: w, lineHeight: 1, letterSpacing: '-0.025em' }}>HomePlate</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="t-eyebrow" style={{ color: 'var(--leaf-700)', marginBottom: 8 }}>Body</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 76, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1 }}>Geist.</div>
        <div className="t-body-sm" style={{ color: 'var(--text-soft)', marginTop: 12, maxWidth: 420 }}>
          Clean grotesk for body, labels, captions. Weight 400 for paragraph; 600 for labels; 700 for emphasis. Tabular figures for everything quantity-shaped.
        </div>
        <div style={{ display: 'flex', gap: 22, marginTop: 14, alignItems: 'baseline' }}>
          {[400, 500, 600, 700, 800].map(w => (
            <div key={w} style={{ fontFamily: 'var(--font-body)', fontWeight: w, fontSize: 28, letterSpacing: '-0.01em' }}>Aa</div>
          ))}
        </div>
      </div>
    </div>

    <hr className="divider" style={{ marginBottom: 28 }} />
    <div className="t-eyebrow" style={{ marginBottom: 18 }}>Scale, in HomePlate copy</div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SpecRow label="Display / 96" meta="-3.5% tr · 700">
        <div className="t-display">Sheet pan Tuesday.</div>
      </SpecRow>
      <SpecRow label="Number / 96" meta="tabular · 700">
        <div className="t-num-xl">0/4</div>
      </SpecRow>
      <SpecRow label="H1 / 60" meta="-3% tr · 700">
        <div className="t-h1">Week of May 24</div>
      </SpecRow>
      <SpecRow label="H2 / 44" meta="">
        <div className="t-h2">Dinners — four nights, none made</div>
      </SpecRow>
      <SpecRow label="H3 / 28" meta="">
        <div className="t-h3">Grilled Pork Spare Ribs</div>
      </SpecRow>
      <SpecRow label="H4 / 18 · body" meta="">
        <div className="t-h4">Produce</div>
      </SpecRow>
      <SpecRow label="Body Lg / 17" meta="1.5 lh">
        <div className="t-body-lg">Grilled sweet corn on the cob with herb butter and a squeeze of lime.</div>
      </SpecRow>
      <SpecRow label="Body / 15" meta="">
        <div className="t-body">Drain canned chicken very well and pat dry. In a large bowl, combine chicken, egg, Parmesan, garlic powder, and seasonings.</div>
      </SpecRow>
      <SpecRow label="Label / 13 · 600" meta="">
        <div className="t-label">Add to grocery list</div>
      </SpecRow>
      <SpecRow label="Eyebrow / 11 · 600" meta="10% tr · caps">
        <div className="t-eyebrow">Meat &amp; seafood</div>
      </SpecRow>
      <SpecRow label="Mono / 12" meta="quantities">
        <div className="t-mono">1 1/2 cups · 38 min · 522 kcal</div>
      </SpecRow>
    </div>
  </div>
);

const SpecRow = ({ label, meta, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, alignItems: 'baseline' }}>
    <div>
      <div className="t-label">{label}</div>
      <div className="t-caption">{meta}</div>
    </div>
    <div>{children}</div>
  </div>
);

// ===== Shape =====
const ShapeArtboard = () => (
  <div className="hp" style={{ padding: 56, background: 'var(--bg-app)' }}>
    <div className="t-eyebrow" style={{ marginBottom: 12 }}>04 — Shape &amp; radius</div>
    <h2 className="t-h2" style={{ marginBottom: 28, maxWidth: 700 }}>Rounded rectangles. Not pills.</h2>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, marginBottom: 36 }}>
      {[
        ['xs', 8, 'chips, micro inputs'],
        ['sm', 12, 'small buttons, tags'],
        ['md', 16, 'inputs, nested cards'],
        ['lg', 22, 'main cards, modals'],
        ['xl', 28, 'feature cards, hero blocks'],
        ['2xl', 36, 'big surfaces, devices'],
      ].map(([name, r, use]) => (
        <div key={name}>
          <div style={{ background: 'var(--ink-900)', borderRadius: r, aspectRatio: '1', display: 'grid', placeItems: 'center', color: '#fff' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>{r}</div>
              <div className="t-mono" style={{ color: 'var(--ink-200)', marginTop: 4 }}>--r-{name}</div>
            </div>
          </div>
          <div className="t-caption" style={{ marginTop: 8 }}>{use}</div>
        </div>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
      <div className="card-out" style={{ padding: 24, borderRadius: 28 }}>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>Chips — soft rect, never pill by default</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="chip chip-hot">Cherry</span>
          <span className="chip chip-on">Active</span>
          <span className="chip">Inactive</span>
          <span className="chip chip-leaf">Made</span>
          <span className="chip chip-sun">Dining out</span>
          <span className="chip chip-orange">Kids fav</span>
        </div>
      </div>
      <div className="card-out" style={{ padding: 24, borderRadius: 28 }}>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>Hierarchy via nested radius</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--ink-50)', borderRadius: 12, padding: '14px 18px' }} className="t-label">Input</div>
          <div style={{ background: 'var(--ink-50)', borderRadius: 16, padding: '18px 22px' }} className="t-label">Nested</div>
          <div style={{ background: 'var(--ink-50)', borderRadius: 22, padding: '22px 26px' }} className="t-label">Card</div>
          <div style={{ background: 'var(--ink-50)', borderRadius: 28, padding: '26px 30px' }} className="t-label">Section</div>
        </div>
      </div>
    </div>
  </div>
);

// ===== Shadow =====
const ShadowArtboard = () => (
  <div className="hp" style={{ padding: 56, background: 'var(--bg-app)' }}>
    <div className="t-eyebrow" style={{ marginBottom: 12 }}>05 — Elevation</div>
    <h2 className="t-h2" style={{ marginBottom: 12, maxWidth: 700 }}>Restrained. Most cards just sit there.</h2>
    <p className="t-body-sm" style={{ color: 'var(--text-soft)', marginBottom: 32, maxWidth: 640 }}>
      Mist background means white cards already pop without help. Shadows are only deployed when something needs to leave the plane — dropdowns, modals, drag preview.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
      {[
        ['Flat', 'none', 'list rows, embedded'],
        ['Set / 1', 'var(--shadow-1)', 'cards, recipe tiles'],
        ['Lift / 2', 'var(--shadow-2)', 'hover, dropdowns'],
        ['Modal / 4', 'var(--shadow-4)', 'sheets, popovers'],
      ].map(([name, sh, use]) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: '100%', height: 140, background: 'var(--paper)', borderRadius: 22, boxShadow: sh === 'none' ? undefined : sh, border: sh === 'none' ? '1px solid var(--ink-100)' : undefined, display: 'grid', placeItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>{name}</span>
          </div>
          <div className="t-caption" style={{ textAlign: 'center' }}>{use}</div>
        </div>
      ))}
    </div>
  </div>
);

// ===== Icons =====
const IconCell = ({ Comp, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '18px 8px',
    background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--ink-100)' }}>
    <Comp size={26} />
    <div className="t-caption">{label}</div>
  </div>
);
const IconsArtboard = () => (
  <div className="hp" style={{ padding: 56, background: 'var(--bg-app)' }}>
    <div className="t-eyebrow" style={{ marginBottom: 12 }}>06 — Iconography</div>
    <h2 className="t-h2" style={{ marginBottom: 12, maxWidth: 700 }}>Hand-tuned, 1.75px stroke, soft round caps.</h2>
    <p className="t-body-sm" style={{ color: 'var(--text-soft)', marginBottom: 28, maxWidth: 640 }}>
      Custom set. Slightly chunky, slightly imperfect. Outlines only — fills are reserved for filled badges and the dot.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12, marginBottom: 26 }}>
      <IconCell Comp={IconRecipes} label="recipes" />
      <IconCell Comp={IconPlanner} label="planner" />
      <IconCell Comp={IconGrocery} label="grocery" />
      <IconCell Comp={IconSettings} label="settings" />
      <IconCell Comp={IconAdd} label="add" />
      <IconCell Comp={IconSearch} label="search" />
      <IconCell Comp={IconMade} label="made" />
      <IconCell Comp={IconShare} label="share" />
      <IconCell Comp={IconBreakfast} label="breakfast" />
      <IconCell Comp={IconLunch} label="lunch" />
      <IconCell Comp={IconDinner} label="dinner" />
      <IconCell Comp={IconSnack} label="snack" />
      <IconCell Comp={IconAdults} label="adults" />
      <IconCell Comp={IconKids} label="kids" />
      <IconCell Comp={IconEveryone} label="everyone" />
      <IconCell Comp={IconPantryRaid} label="pantry raid" />
      <IconCell Comp={IconMultiplier} label="multiplier" />
      <IconCell Comp={IconClock} label="time" />
      <IconCell Comp={IconServes} label="serves" />
      <IconCell Comp={IconStore} label="store" />
      <IconCell Comp={IconCamera} label="photo" />
      <IconCell Comp={IconEdit} label="edit" />
      <IconCell Comp={IconTrash} label="delete" />
      <IconCell Comp={IconCheck} label="check" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
      <div className="card-out" style={{ padding: 22 }}>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>20 · 24 · 32 · 48</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <IconDinner size={20} />
          <IconDinner size={24} />
          <IconDinner size={32} />
          <IconDinner size={48} />
        </div>
      </div>
      <div className="card-out" style={{ padding: 22 }}>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>On colored circles</div>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--hot)', color: '#fff', display: 'grid', placeItems: 'center' }}><IconAdd size={22} /></div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--leaf)', color: '#fff', display: 'grid', placeItems: 'center' }}><IconCheck size={22} /></div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--sun)', color: 'var(--ink-900)', display: 'grid', placeItems: 'center' }}><IconPantryRaid size={22} /></div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--ink-900)', color: 'var(--paper)', display: 'grid', placeItems: 'center' }}><IconSearch size={22} /></div>
        </div>
      </div>
    </div>
  </div>
);

// ===== Illustrations — flat, four colors =====
const EmptyRecipes = () => (
  <svg viewBox="0 0 320 220" width="100%" style={{ maxWidth: 360 }}>
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
);
const EmptyGrocery = () => (
  <svg viewBox="0 0 320 220" width="100%" style={{ maxWidth: 360 }}>
    <path d="M70 30 L250 30 L250 195 L235 188 L220 195 L205 188 L190 195 L175 188 L160 195 L145 188 L130 195 L115 188 L100 195 L85 188 L70 195 Z" fill="#FFFFFF" stroke="#14140F" strokeWidth="1.5"/>
    {[55, 75, 95, 115, 135, 155].map((y, i) => (
      <g key={i}>
        <rect x="86" y={y-3} width="16" height="16" rx="4" fill="#7CB518"/>
        <path d={`M91 ${y+5} l3 3 l6 -6`} stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="110" y={y} width={[90,120,80,100,110,70][i]} height="3" rx="1.5" fill="#14140F"/>
        <rect x="110" y={y+1} width={[80,110,72,95,100,60][i]} height="1.5" fill="#E5256D"/>
      </g>
    ))}
    <circle cx="240" cy="55" r="22" fill="#E5256D"/>
    <path d="M236 35 q4 -4 8 0" stroke="#7CB518" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="55" cy="180" r="5" fill="#F2B705"/>
    <circle cx="40" cy="160" r="3" fill="#7CB518"/>
    <circle cx="265" cy="170" r="4" fill="#E5256D"/>
  </svg>
);

const IllustrationsArtboard = () => (
  <div className="hp" style={{ padding: 56, background: 'var(--bg-app)' }}>
    <div className="t-eyebrow" style={{ marginBottom: 12 }}>07 — Illustration</div>
    <h2 className="t-h2" style={{ marginBottom: 12, maxWidth: 700 }}>Flat. Four colors. Used sparingly.</h2>
    <p className="t-body-sm" style={{ color: 'var(--text-soft)', marginBottom: 32, maxWidth: 640 }}>
      Empty states and onboarding only. Built from the same chunky shapes as the mark. No gradients. No isometric. No AI sheen.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
      <div className="card-out" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <EmptyRecipes />
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div className="t-h3">Your cookbook is empty.</div>
          <div className="t-body-sm" style={{ color: 'var(--text-soft)', marginTop: 8 }}>Add your first recipe — it lives here forever, even when the internet doesn't.</div>
          <button className="btn btn-primary btn-md" style={{ marginTop: 18 }}>
            <IconPlus size={16} /> Add recipe
          </button>
        </div>
      </div>
      <div className="card-out" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <EmptyGrocery />
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div className="t-h3">List crushed.</div>
          <div className="t-body-sm" style={{ color: 'var(--text-soft)', marginTop: 8 }}>You got every aisle. Go home and start cooking.</div>
          <button className="btn btn-ghost btn-md" style={{ marginTop: 18 }}>Back to planner</button>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, {
  Wordmark, Mark,
  LogoArtboard, ColorArtboard, TypeArtboard, ShapeArtboard, ShadowArtboard, IconsArtboard, IllustrationsArtboard,
  EmptyRecipes, EmptyGrocery,
});
