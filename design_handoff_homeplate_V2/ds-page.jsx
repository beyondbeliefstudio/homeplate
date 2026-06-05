// HomePlate — Design System review page (v5). Warm, bright, olive-led.
// Each block is labelled so it can be reviewed/approved individually.

// ===== Layout primitives =====
const Section = ({ n, title, note, children, label }) => (
  <section data-screen-label={label || title} style={{ marginBottom: 60, scrollMarginTop: 24 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid var(--ink-200)' }}>
      <span className="t-mono" style={{ color: 'var(--green)', fontWeight: 500 }}>{n}</span>
      <h2 className="t-h3" style={{ flex: '0 0 auto' }}>{title}</h2>
      {note && <p className="t-body-sm" style={{ color: 'var(--ink-500)', marginLeft: 'auto', maxWidth: 380, textAlign: 'right' }}>{note}</p>}
    </div>
    {children}
  </section>
);

const Card = ({ children, pad = 24, style }) => (
  <div className="card-out" style={{ padding: pad, ...style }}>{children}</div>
);

const Caption = ({ children, style }) => (
  <div className="t-caption" style={{ marginTop: 10, ...style }}>{children}</div>
);

// ===== 01 · Logo =====
const LogoSection = () => {
  const concepts = [
    { v: 'plate', name: 'Place setting', desc: 'Plate, fork & knife — unmistakably “a meal”.', sel: true },
    { v: 'roof',  name: 'Home plate',    desc: 'A roof over a plate — literally HomePlate.' },
    { v: 'bowl',  name: 'Saucepan',     desc: 'A pan on the stove. Cooking, hands-on, homemade.' },
  ];
  return (
    <Section n="01" title="Logo & wordmark" label="Logo" note="Place setting is your pick — shown selected. Others kept for reference.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {concepts.map((c) => (
          <Card key={c.v} pad={0} style={{ overflow: 'hidden', position: 'relative', border: c.sel ? '1.5px solid var(--green)' : '1px solid var(--ink-100)', boxShadow: c.sel ? 'var(--shadow-2)' : 'none' }}>
            {c.sel && <span className="t-caption" style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, background: 'var(--green)', color: '#fff', fontWeight: 700, padding: '3px 9px', borderRadius: 'var(--r-pill)', letterSpacing: '0.04em' }}>SELECTED</span>}
            <div style={{ background: 'var(--bg-app)', padding: '34px 0', display: 'flex', justifyContent: 'center', gap: 26, alignItems: 'center', borderBottom: '1px solid var(--ink-100)' }}>
              <Mark variant={c.v} size={68} tile={true} />
              <Mark variant={c.v} size={60} tile={false} />
            </div>
            {/* on dark */}
            <div style={{ background: 'var(--green)', padding: '20px 0', display: 'flex', justifyContent: 'center', gap: 22, alignItems: 'center' }}>
              <Mark variant={c.v} size={40} tile={false} color="var(--bg-app)" />
              <span style={{ color: 'var(--bg-app)' }}><Wordmark size={24} mono={true} /></span>
            </div>
            <div style={{ padding: '16px 18px 18px' }}>
              <div className="t-label">{c.name}</div>
              <Caption>{c.desc}</Caption>
            </div>
          </Card>
        ))}
      </div>

      {/* Wordmark + lockup */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18 }}>
        <Card>
          <div className="t-eyebrow" style={{ marginBottom: 18 }}>Wordmark</div>
          <Wordmark size={46} />
          <Caption style={{ marginTop: 16 }}>Display face, –3% tracking. “Plate” carries the olive.</Caption>
        </Card>
        <Card>
          <div className="t-eyebrow" style={{ marginBottom: 18 }}>Primary lockup</div>
          <Lockup variant="plate" markSize={48} size={30} />
          <Caption style={{ marginTop: 16 }}>Shown with the place-setting mark — swaps to whichever you choose.</Caption>
        </Card>
      </div>
    </Section>
  );
};

// ===== 02 · Color =====
const Swatch = ({ name, varName, hex }) => (
  <div>
    <div className="swatch-ring" style={{ height: 64, borderRadius: 'var(--r-md)', background: `var(${varName})` }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
      <span className="t-label">{name}</span>
      <span className="t-mono" style={{ color: 'var(--ink-400)' }}>{hex}</span>
    </div>
  </div>
);

const Ramp = ({ title, items }) => (
  <div>
    <div className="t-eyebrow" style={{ marginBottom: 12 }}>{title}</div>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 12 }}>
      {items.map((it) => <Swatch key={it.varName} {...it} />)}
    </div>
  </div>
);

const ColorSection = () => (
  <Section n="02" title="Color" label="Color" note="Bright white, green lead. Orange → yellow → lime → green spectrum. Food icons carry the colour.">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Ramp title="Primary — Green" items={[
        { name: 'Green', varName: '--green', hex: '#5BA63C' },
        { name: 'Green 600', varName: '--green-600', hex: '#4A8B30' },
        { name: 'Green 100', varName: '--green-100', hex: '#DCF0C5' },
        { name: 'Green 50', varName: '--green-50', hex: '#EEF7E1' },
      ]} />
      <Ramp title="Spectrum — Orange → Yellow → Lime → Green" items={[
        { name: 'Orange', varName: '--orange', hex: '#F0913C' },
        { name: 'Yellow', varName: '--yellow', hex: '#F4C233' },
        { name: 'Lime', varName: '--lime', hex: '#A6C948' },
        { name: 'Green', varName: '--green', hex: '#5BA63C' },
      ]} />
      <Ramp title="Canvas & neutrals" items={[
        { name: 'Canvas', varName: '--bg-app', hex: '#F7F8F5' },
        { name: 'Paper', varName: '--paper', hex: '#FFFFFF' },
        { name: 'Ink 100', varName: '--ink-100', hex: '#ECEDE2' },
        { name: 'Ink 300', varName: '--ink-300', hex: '#BCC0B2' },
        { name: 'Ink 500', varName: '--ink-500', hex: '#6E7466' },
        { name: 'Ink 900', varName: '--ink-900', hex: '#20241C' },
      ]} />
      <div>
        <div className="t-eyebrow" style={{ marginBottom: 12 }}>Spectrum in context — use this gradient liberally in the mockup</div>
        {/* Full gradient bar */}
        <div style={{ height: 56, borderRadius: 'var(--r-lg)', background: 'linear-gradient(90deg, var(--orange) 0%, var(--yellow) 38%, var(--lime) 68%, var(--green) 100%)' }} />
        <div className="t-caption" style={{ marginTop: 8, marginBottom: 20 }}>Progress bars, chart fills, accent backgrounds.</div>
        {/* Usage examples */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {/* Gradient border card */}
          <div style={{ padding: '18px 16px', borderRadius: 'var(--r-lg)', background: 'var(--paper)', border: '2px solid transparent', backgroundImage: 'linear-gradient(white,white), linear-gradient(135deg, var(--orange), var(--green))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}>
            <div className="t-label">Gradient border</div>
            <div className="t-caption" style={{ marginTop: 4 }}>Cards, selected states, callouts</div>
          </div>
          {/* Gradient button */}
          <button className="btn btn-md" style={{ background: 'linear-gradient(90deg, var(--orange), var(--green))', color: '#fff', border: 'none', width: '100%', justifyContent: 'center' }}>Add to this week</button>
          {/* Progress bar */}
          <div style={{ padding: '18px 16px', borderRadius: 'var(--r-lg)', background: 'var(--paper)', border: '1px solid var(--ink-100)' }}>
            <div className="t-caption" style={{ marginBottom: 10 }}>Weekly plan progress</div>
            <div style={{ height: 10, borderRadius: 'var(--r-pill)', background: 'var(--ink-100)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '72%', background: 'linear-gradient(90deg, var(--orange), var(--yellow), var(--lime), var(--green))', borderRadius: 'var(--r-pill)' }} />
            </div>
            <div className="t-caption" style={{ marginTop: 6 }}>5 / 7 dinners planned</div>
          </div>
        </div>
      </div>
    </div>
  </Section>
);
// ===== 03 · Type (with live switcher) =====
const DISPLAY_FONTS = [
  ['Zodiak', "'Zodiak', Georgia, serif", 'Editorial serif · warm, not overdone'],
  ['Quilon', "'Quilon', sans-serif", 'Your upload'],
  ['Tanker', "'Tanker', sans-serif", 'Your upload · very bold'],
  ['Clash Grotesk', "'Clash Grotesk', sans-serif", 'Clean modern grotesk'],
  ['General Sans', "'General Sans', sans-serif", 'Neutral, friendly'],
];
const BODY_FONTS = [
  ['Hanken Grotesk', "'Hanken Grotesk', sans-serif", 'Clean humanist sans'],
  ['General Sans', "'General Sans', sans-serif", 'Neutral sans'],
  ['Quilon', "'Quilon', sans-serif", 'Your upload'],
  ['Geist Mono', "'Geist Mono', monospace", 'Monospace option'],
];

const FontPicker = ({ label, fonts, active, onPick }) => (
  <div>
    <div className="t-eyebrow" style={{ marginBottom: 10 }}>{label}</div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {fonts.map(([name, stack, note]) => {
        const on = active === stack;
        return (
          <button key={name} onClick={() => onPick(stack)} title={note}
            className="chip chip-pill" style={{
              cursor: 'pointer', height: 36, padding: '0 16px',
              background: on ? 'var(--green)' : 'var(--paper)',
              color: on ? '#fff' : 'var(--ink-700)',
              border: `1px solid ${on ? 'var(--green)' : 'var(--ink-200)'}`,
              fontFamily: stack, fontSize: 14,
            }}>{name}</button>
        );
      })}
    </div>
  </div>
);

const TypeSection = () => {
  const [disp, setDisp] = React.useState("'Clash Grotesk', sans-serif");
  const [body, setBody] = React.useState("'General Sans', sans-serif");
  const pickDisp = (s) => { setDisp(s); document.documentElement.style.setProperty('--font-display', s); };
  const pickBody = (s) => { setBody(s); document.documentElement.style.setProperty('--font-body', s); };
  return (
    <Section n="03" title="Typography" label="Type" note="Tap a font to apply it across the whole page. Mix and match display + body.">
      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FontPicker label="Display / headline font" fonts={DISPLAY_FONTS} active={disp} onPick={pickDisp} />
          <FontPicker label="Body / UI font" fonts={BODY_FONTS} active={body} onPick={pickBody} />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 22 }}>
        <Card>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Display in use</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 54, lineHeight: 1, letterSpacing: '-0.02em' }}>Dinner, sorted</div>
          <Caption style={{ marginTop: 14 }}>Headlines, the wordmark, big numbers.</Caption>
        </Card>
        <Card>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Body in use</div>
          <p className="t-body" style={{ color: 'var(--ink-700)' }}>Plan the week, build the list, and let HomePlate learn what your family actually eats. Quiet, legible, easy on the eyes at small sizes.</p>
          <Caption style={{ marginTop: 14 }}>UI, paragraphs, labels, captions.</Caption>
        </Card>
      </div>

      <Card>
        <div className="t-eyebrow" style={{ marginBottom: 18 }}>Scale</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['H1 / 52', 't-h1', 'This week’s plan'],
            ['H2 / 36', 't-h2', 'Sheet-pan chicken & potatoes'],
            ['H3 / 24', 't-h3', 'From your cookbook'],
            ['Body LG / 17', 't-body-lg', 'A meal-planning app for families.'],
            ['Body / 15', 't-body', 'Generates your grocery list automatically.'],
            ['Caption / 11', 't-caption', 'PREP 20 MIN · SERVES 4'],
          ].map(([label, cls, text]) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20, alignItems: 'baseline', borderTop: '1px solid var(--ink-100)', paddingTop: 14 }}>
              <span className="t-mono" style={{ color: 'var(--ink-400)' }}>{label}</span>
              <span className={cls}>{text}</span>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
};

// ===== 04 · Shape =====
const ShapeSection = () => (
  <Section n="04" title="Shape & radius" label="Shape" note="Softened, not pill-round. Cards sit at 12px.">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
      {[['xs','5px'],['sm','7px'],['md','9px'],['lg','12px'],['xl','14px'],['2xl','18px']].map(([k, v]) => (
        <div key={k}>
          <div style={{ height: 84, background: 'var(--green-100)', border: '1.5px solid var(--green-200)', borderRadius: `var(--r-${k})` }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span className="t-label">{k}</span>
            <span className="t-mono" style={{ color: 'var(--ink-400)' }}>{v}</span>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

// ===== 05 · Elevation =====
const ElevationSection = () => (
  <Section n="05" title="Elevation" label="Elevation" note="Soft, warm-tinted shadows. Used lightly.">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
      {[1,2,3,4].map((n) => (
        <div key={n} style={{ background: 'var(--paper)', height: 110, borderRadius: 'var(--r-lg)', boxShadow: `var(--shadow-${n})`, display: 'flex', alignItems: 'flex-end', padding: 14 }}>
          <span className="t-mono" style={{ color: 'var(--ink-400)' }}>shadow-{n}</span>
        </div>
      ))}
    </div>
  </Section>
);

// ===== 06 · Buttons =====
const ButtonSection = () => (
  <Section n="06" title="Buttons" label="Buttons" note="Olive leads. Terracotta for warm emphasis; black for neutral weight.">
    <Card>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-md btn-primary">Add to plan</button>
        <button className="btn btn-md btn-accent">Start cooking</button>
        <button className="btn btn-md btn-secondary">Generate list</button>
        <button className="btn btn-md btn-ghost">Edit</button>
        <button className="btn btn-md btn-quiet">Save</button>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 16 }}>
        <button className="btn btn-lg btn-primary">Large</button>
        <button className="btn btn-md btn-primary">Medium</button>
        <button className="btn btn-sm btn-primary">Small</button>
        <button className="btn btn-icon btn-ghost" aria-label="add"><IconPlus size={18} /></button>
        <button className="btn btn-icon btn-sm btn-ghost" aria-label="search"><IconSearch size={16} /></button>
      </div>
    </Card>
  </Section>
);

// ===== 07 · Controls =====
const ControlsSection = () => (
  <Section n="07" title="Chips & form controls" label="Controls" note="Quiet defaults, olive on selection.">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <Card>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>Chips & filters</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="chip chip-on">All</span>
          <span className="chip">Quick</span>
          <span className="chip">Family favourite</span>
          <span className="chip chip-out">Vegetarian</span>
        </div>
        <div className="t-eyebrow" style={{ margin: '22px 0 12px' }}>Toggle & segmented</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ width: 46, height: 26, borderRadius: 'var(--r-pill)', background: 'var(--green)', position: 'relative', display: 'inline-block' }}>
            <span style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff' }} />
          </span>
          <span style={{ display: 'inline-flex', background: 'var(--ink-50)', borderRadius: 'var(--r-md)', padding: 3 }}>
            <span className="t-label" style={{ padding: '7px 14px', borderRadius: 'var(--r-sm)', background: 'var(--paper)', boxShadow: 'var(--shadow-1)' }}>Week</span>
            <span className="t-label" style={{ padding: '7px 14px', color: 'var(--ink-500)' }}>Day</span>
          </span>
        </div>
      </Card>
      <Card>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>Inputs</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 46, padding: '0 14px', background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)' }}>
            <IconSearch size={18} stroke={1.75} />
            <span className="t-body" style={{ color: 'var(--ink-400)' }}>Search recipes…</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 46, padding: '0 14px', background: 'var(--paper)', border: '1.5px solid var(--green)', borderRadius: 'var(--r-md)', boxShadow: '0 0 0 3px var(--green-50)' }}>
            <span className="t-body" style={{ color: 'var(--ink-900)' }}>Grandma’s lasagne</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 46, padding: '0 14px', background: 'var(--ink-50)', borderRadius: 'var(--r-md)' }}>
            <span className="t-body" style={{ color: 'var(--ink-400)' }}>Disabled</span>
          </div>
        </div>
      </Card>
    </div>
  </Section>
);

// ===== 08 · Meal-type icons (flat geometric food illustrations) =====
const MEAL_ICONS = [
  { cat: 'Breakfast', Food: FoodBreakfast, label: 'Morning meals' },
  { cat: 'Lunch',     Food: FoodLunch,     label: 'Midday' },
  { cat: 'Dinner',    Food: FoodDinner,    label: 'Main evening meal' },
  { cat: 'Side',      Food: FoodSide,      label: 'Sides & salads' },
  { cat: 'Snack',     Food: FoodSnack,     label: 'Between meals' },
  { cat: 'Dessert',   Food: FoodDessert,   label: 'Sweet finish' },
  { cat: 'Beverage',  Food: FoodBeverage,  label: 'Drinks' },
];

const MealSection = () => (
  <Section n="08" title="Meal-type icons" label="Meal types" note="Flat geometric food illustrations — colour lives in the icons, UI stays neutral.">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 14 }}>
      {MEAL_ICONS.map((m) => (
        <div key={m.cat} style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-lg)', padding: '22px 14px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <m.Food size={52} />
          <div style={{ textAlign: 'center' }}>
            <div className="t-label" style={{ color: 'var(--ink-900)' }}>{m.cat}</div>
            <div className="t-caption" style={{ marginTop: 3 }}>{m.label}</div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

// ===== 09 · Recipe card (photo-led, food-icon fallback) =====
const MEAL_MAP = {
  Breakfast: FoodBreakfast, Lunch: FoodLunch, Dinner: FoodDinner,
  Side: FoodSide, Snack: FoodSnack, Dessert: FoodDessert, Beverage: FoodBeverage,
};

const RecipeCard = ({ name, cat, time, serves, audience, slotId, noPhoto }) => {
  const Food = MEAL_MAP[cat] || FoodDinner;
  const aud = audience === 'kids' ? 'Kids' : audience === 'adults' ? 'Adults' : 'Everyone';
  return (
    <div style={{ background: 'var(--paper)', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: 142 }}>
        {noPhoto ? (
          <div style={{ height: '100%', background: 'var(--ink-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Food size={52} />
            <span className="t-caption" style={{ fontWeight: 600, color: 'var(--ink-500)' }}>Generating photo…</span>
          </div>
        ) : (
          <image-slot id={slotId} shape="rect" placeholder="Drop a recipe photo" style={{ display: 'block', width: '100%', height: '100%', background: 'var(--ink-50)' }}></image-slot>
        )}
        <span style={{ position: 'absolute', top: 10, left: 10, pointerEvents: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,.93)', boxShadow: 'var(--shadow-1)' }}>
          <span className="t-caption" style={{ fontWeight: 700, color: 'var(--ink-800)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{cat}</span>
        </span>
      </div>
      <div style={{ padding: '13px 14px 11px', flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'var(--ink-900)', textWrap: 'balance' }}>{name}</div>
      </div>
      <div style={{ borderTop: '1px solid var(--ink-100)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--ink-500)' }}>
        <div style={{ display: 'flex', gap: 13 }}>
          <span className="t-caption tabular" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><IconClock size={13} /> {time}m</span>
          <span className="t-caption tabular" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><IconServes size={13} /> {serves}</span>
        </div>
        <span className="t-caption" style={{ fontWeight: 600, color: 'var(--ink-700)' }}>{aud}</span>
      </div>
    </div>
  );
};

const RecipeSection = () => (
  <Section n="09" title="Recipe card" label="Recipe card" note="Photo-led. Drop an image into any slot to test the look. Last card shows the no-photo fallback.">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      <RecipeCard slotId="rc-dinner" name="Sheet-pan chicken & potatoes" cat="Dinner" time="45" serves="4" audience="everyone" />
      <RecipeCard slotId="rc-breakfast" name="Pancakes the kids actually eat" cat="Breakfast" time="20" serves="4" audience="kids" />
      <RecipeCard slotId="rc-dessert" name="Brown butter chocolate chip cookies" cat="Dessert" time="30" serves="12" audience="everyone" />
      <RecipeCard name="Chicken Caesar salad pizza" cat="Lunch" time="38" serves="2" audience="adults" noPhoto={true} />
    </div>
    <div style={{ marginTop: 16, background: 'var(--green-50)', border: '1px solid var(--green-100)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
      <div className="t-label" style={{ color: 'var(--green)', marginBottom: 6 }}>How the photos work</div>
      <p className="t-body-sm" style={{ color: 'var(--ink-700)', maxWidth: 760 }}>
        When you create a recipe, the app generates a photo for it once and saves the image to that recipe. Cards then show the saved photo. While it’s generating — or if generation is off — the card falls back to the meal-type tint with its icon (last card). No fake colour blocks; the icon only appears when there’s genuinely no image.
      </p>
    </div>
  </Section>
);

// ===== Page =====
const DSPage = () => (
  <div style={{ minHeight: '100%', background: 'var(--bg-app)', padding: '0 0 100px' }}>
    {/* Header */}
    <header style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Lockup variant="plate" markSize={42} size={26} />
        <span className="t-mono" style={{ color: 'var(--ink-400)' }}>Design system · v5 · draft</span>
      </div>
      <h1 className="t-display" style={{ marginTop: 30, maxWidth: 760 }}>Brighter, bolder, food-first.</h1>
      <p className="t-body-lg" style={{ marginTop: 16, maxWidth: 560, color: 'var(--ink-600)' }}>
        A bright, clean foundation for HomePlate — white surfaces, a green lead, and an orange→yellow→green spectrum. Review each block below.
      </p>
    </header>

    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 32px 0' }}>
      <LogoSection />
      <ColorSection />
      <TypeSection />
      <ShapeSection />
      <ElevationSection />
      <ButtonSection />
      <ControlsSection />
      <MealSection />
      <RecipeSection />
    </main>
  </div>
);

Object.assign(window, { DSPage });
