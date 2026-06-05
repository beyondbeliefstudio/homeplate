// HomePlate — Dashboard widget components
// Assumes ds.css, icons.jsx, ds-foodicons.jsx, ds-logo.jsx already loaded.

// ── Shared primitives ────────────────────────────────────────────────────────
const dashCard = (extra = {}) => ({
  background: 'var(--paper)', border: '1px solid var(--ink-100)',
  borderRadius: 'var(--r-lg)', ...extra,
});
const Card = ({ children, style, pad = 20 }) => (
  <div style={{ ...dashCard(), padding: pad, ...style }}>{children}</div>
);
const SHead = ({ label, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <span className="t-eyebrow">{label}</span>
    {action && <button style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{action}</button>}
  </div>
);
const GRAD = 'linear-gradient(90deg, var(--orange), var(--yellow), var(--lime), var(--green))';

// ── Mock data ─────────────────────────────────────────────────────────────────
const WEEK_DATA = [
  { day: 'Mon', date: 2, slots: { b: { name: 'Pancakes', Food: null }, l: null, d: { name: 'Sheet-pan chicken', Food: null } } },
  { day: 'Tue', date: 3, slots: { b: null, l: { name: 'Caesar salad pizza', Food: null }, d: { name: 'Pasta alfredo', Food: null } } },
  { day: 'Wed', date: 4, today: true, slots: { b: { name: 'Scrambled eggs', Food: null }, l: { name: 'Leftovers', Food: null }, d: { name: 'Pork spare ribs', Food: null } } },
  { day: 'Thu', date: 5, slots: { b: null, l: { name: 'Butter lettuce salad', Food: null }, d: { name: 'Hamburger helper', Food: null } } },
  { day: 'Fri', date: 6, slots: { b: { name: 'Pancakes', Food: null }, l: null, d: { name: 'Grilled skirt steak', Food: null } } },
  { day: 'Sat', date: 7, slots: { b: { name: 'French toast', Food: null }, l: null, d: null } },
  { day: 'Sun', date: 8, slots: { b: null, l: null, d: { name: 'Chicken Alfredo', Food: null } } },
];

const MEAL_ICON_MAP = {
  b: FoodBreakfast, l: FoodLunch, d: FoodDinner,
};

const MOST_COOKED = [
  { name: 'Sheet-pan chicken & potatoes', count: 24, Food: FoodDinner },
  { name: 'Pancakes', count: 18, Food: FoodBreakfast },
  { name: 'Pasta alfredo', count: 15, Food: FoodDinner },
  { name: 'Grilled skirt steak', count: 12, Food: FoodDinner },
  { name: 'Hamburger helper', count: 9, Food: FoodDinner },
];

const PANTRY = [
  { name: 'Olive oil', status: 'low', color: '#F4C233' },
  { name: 'Parmesan', status: 'out', color: '#DA4A36' },
  { name: 'Heavy cream', status: 'low', color: '#F4C233' },
  { name: 'Chicken stock', status: 'low', color: '#F4C233' },
  { name: 'Dried pasta', status: 'ok', color: '#A6C948' },
];

const TODAY_MEALS = [
  { type: 'Breakfast', name: 'Scrambled eggs & toast', time: 10, Food: FoodBreakfast },
  { type: 'Lunch', name: 'Leftovers', time: 5, Food: FoodLunch },
  { type: 'Dinner', name: 'Pork spare ribs', time: 115, Food: FoodDinner },
];

const WEEK_RECIPES = [
  { name: 'Pancakes', cat: 'Breakfast', time: 20, Food: FoodBreakfast, day: 'Mon' },
  { name: 'Sheet-pan chicken', cat: 'Dinner', time: 45, Food: FoodDinner, day: 'Mon' },
  { name: 'Caesar salad pizza', cat: 'Lunch', time: 38, Food: FoodLunch, day: 'Tue' },
  { name: 'Pasta alfredo', cat: 'Dinner', time: 35, Food: FoodDinner, day: 'Tue' },
  { name: 'Pork spare ribs', cat: 'Dinner', time: 115, Food: FoodDinner, day: 'Wed' },
  { name: 'Butter lettuce salad', cat: 'Side', time: 10, Food: FoodSide, day: 'Thu' },
  { name: 'Hamburger helper', cat: 'Dinner', time: 30, Food: FoodDinner, day: 'Thu' },
  { name: 'Grilled skirt steak', cat: 'Dinner', time: 25, Food: FoodDinner, day: 'Fri' },
  { name: 'Chicken Alfredo', cat: 'Dinner', time: 35, Food: FoodDinner, day: 'Sun' },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { label: 'Dashboard', Icon: IconHome, active: true },
  { label: 'Planner', Icon: IconPlanner },
  { label: 'Recipes', Icon: IconRecipes },
  { label: 'Grocery', Icon: IconGrocery },
  { label: 'Settings', Icon: IconSettings },
];
const Sidebar = () => (
  <aside style={{ width: 220, flexShrink: 0, background: 'var(--paper)', borderRight: '1px solid var(--ink-100)', display: 'flex', flexDirection: 'column', padding: '24px 16px', height: '100vh', position: 'sticky', top: 0 }}>
    <div style={{ padding: '4px 8px 28px' }}>
      <Lockup variant="plate" markSize={34} size={20} />
    </div>
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {NAV.map(({ label, Icon, active }) => (
        <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 42, padding: '0 12px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: active ? 600 : 400, fontSize: 14, background: active ? 'var(--green-50)' : 'transparent', color: active ? 'var(--green-600)' : 'var(--ink-600)', textAlign: 'left' }}>
          <Icon size={18} stroke={active ? 2 : 1.75} />
          {label}
        </button>
      ))}
    </nav>
    <div style={{ marginTop: 'auto', padding: '0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px', borderTop: '1px solid var(--ink-100)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: GRAD, display: 'grid', placeItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>A</span>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--ink-900)' }}>Alex</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)' }}>Family plan</div>
        </div>
      </div>
    </div>
  </aside>
);

// ── Top bar ───────────────────────────────────────────────────────────────────
const TopBar = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 32px 0', marginBottom: 24 }}>
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', color: 'var(--ink-900)', margin: 0 }}>Good morning, Alex</h1>
      <div className="t-caption" style={{ marginTop: 4 }}>Wednesday, June 4 · Week 23 of 2025</div>
    </div>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <button className="btn btn-md btn-ghost"><IconPlus size={16} /> Add meal</button>
      <button className="btn btn-md" style={{ background: GRAD, color: 'var(--ink-900)', border: 'none', fontWeight: 700 }}>
        <IconGrocery size={16} /> Generate grocery list
      </button>
    </div>
  </div>
);

// ── AI summary ────────────────────────────────────────────────────────────────
const AISummary = () => (
  <div style={{ borderRadius: 'var(--r-lg)', background: 'var(--paper)', backgroundImage: `linear-gradient(var(--paper), var(--paper)), ${GRAD}`, backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', border: '2px solid transparent', padding: '22px 28px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'start' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 100 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 72, lineHeight: 1, letterSpacing: '-0.04em', background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>7.8</div>
      <div className="t-caption" style={{ fontWeight: 600 }}>/ 10 this week</div>
    </div>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>✦</span>
        <span className="t-eyebrow">AI Weekly Summary</span>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--ink-700)', margin: '0 0 14px' }}>
        Solid week with good variety — chicken appears across 3 dinners, so consider swapping Thursday's Hamburger Helper for a fish or veggie option next week. Two meals are under 30 minutes which keeps weeknights easy. Your grocery list is lean at an estimated 23 items; most pantry staples are already stocked. Sunday's Chicken Alfredo is a nice wind-down meal to end the week.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['Protein-forward', '3 kid-friendly meals', 'Avg 32 min prep', 'Light on greens this week'].map(t => (
          <span key={t} className="chip" style={{ background: 'var(--ink-50)', fontSize: 11, height: 26 }}>{t}</span>
        ))}
      </div>
    </div>
  </div>
);

// ── Week at a glance ──────────────────────────────────────────────────────────
const WeekAtAGlance = () => {
  const ROWS = [
    { key: 'b', label: 'B', Food: FoodBreakfast },
    { key: 'l', label: 'L', Food: FoodLunch },
    { key: 'd', label: 'D', Food: FoodDinner },
  ];
  return (
    <Card style={{ overflow: 'hidden' }} pad={0}>
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="t-eyebrow">Week at a glance — June 2–8</span>
        <button style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Open planner →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {WEEK_DATA.map(({ day, date, today }) => (
          <div key={day} style={{ padding: '10px 8px 6px', textAlign: 'center', borderBottom: '1px solid var(--ink-100)', background: today ? 'var(--green-50)' : 'transparent', borderRight: '1px solid var(--ink-100)' }}>
            <div className="t-caption" style={{ fontWeight: 600, color: today ? 'var(--green-600)' : 'var(--ink-500)' }}>{day}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: today ? 'var(--green-600)' : 'var(--ink-900)', lineHeight: 1.1 }}>{date}</div>
            {today && <div style={{ height: 3, width: 24, margin: '4px auto 0', borderRadius: 2, background: GRAD }} />}
          </div>
        ))}
        {ROWS.map(({ key, label, Food }) =>
          WEEK_DATA.map(({ day, today, slots }) => {
            const meal = slots[key];
            return (
              <div key={`${day}-${key}`} style={{ padding: '8px 8px', minHeight: 58, borderBottom: key !== 'd' ? '1px solid var(--ink-100)' : 'none', borderRight: '1px solid var(--ink-100)', background: today ? 'var(--green-50)' : 'transparent', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {meal ? (
                  <>
                    <Food size={18} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, lineHeight: 1.3, color: 'var(--ink-700)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{meal.name}</span>
                  </>
                ) : (
                  <span className="t-caption" style={{ color: 'var(--ink-300)', fontSize: 11 }}>—</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

// ── Today's meals ─────────────────────────────────────────────────────────────
const TodaysMeals = () => (
  <Card pad={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--ink-100)' }}>
      <span className="t-eyebrow">Today</span>
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {TODAY_MEALS.map(({ type, name, time, Food }, i) => (
        <div key={type} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < 2 ? '1px solid var(--ink-100)' : 'none' }}>
          <Food size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-caption" style={{ fontWeight: 600, marginBottom: 2 }}>{type}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
          </div>
          <span className="t-caption tabular" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}><IconClock size={12} />{time}m</span>
        </div>
      ))}
    </div>
  </Card>
);

// ── This week's recipes ───────────────────────────────────────────────────────
const ThisWeekRecipes = () => (
  <div style={{ marginTop: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span className="t-eyebrow">This week's recipes</span>
      <span className="t-caption">{WEEK_RECIPES.length} meals planned</span>
    </div>
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
      {WEEK_RECIPES.map(({ name, cat, time, Food, day }) => (
        <div key={name + day} style={{ ...dashCard(), padding: '14px 16px', minWidth: 176, maxWidth: 176, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Food size={32} />
            <span className="chip" style={{ height: 22, padding: '0 8px', fontSize: 10, background: 'var(--ink-50)' }}>{day}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--ink-900)', lineHeight: 1.3 }}>{name}</div>
          <div className="t-caption tabular" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconClock size={11} />{time}m · {cat}</div>
        </div>
      ))}
    </div>
  </div>
);

// ── Most cooked ───────────────────────────────────────────────────────────────
const MostCooked = () => {
  const max = MOST_COOKED[0].count;
  return (
    <Card>
      <SHead label="Most cooked meals" action="All recipes →" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {MOST_COOKED.map(({ name, count, Food }) => (
          <div key={name}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Food size={22} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', flex: 1 }}>{name}</span>
              <span className="t-caption tabular" style={{ fontWeight: 600, color: 'var(--ink-700)' }}>{count}×</span>
            </div>
            <div style={{ height: 7, background: 'var(--ink-100)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: GRAD, borderRadius: 'var(--r-pill)' }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ── Pantry stash ──────────────────────────────────────────────────────────────
const PantryStash = () => (
  <Card style={{ display: 'flex', flexDirection: 'column' }}>
    <SHead label="Pantry stash" action="Manage →" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      {PANTRY.map(({ name, status, color }) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-800)', fontWeight: 500 }}>{name}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span className="t-caption" style={{ fontWeight: 600, color }}>{status === 'out' ? 'Out' : status === 'low' ? 'Low' : 'OK'}</span>
          </span>
        </div>
      ))}
    </div>
    <button className="btn btn-sm btn-ghost" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
      Add low items to grocery list
    </button>
  </Card>
);

// ── Stats ─────────────────────────────────────────────────────────────────────
const StatsPanel = () => {
  const planned = WEEK_DATA.filter(d => Object.values(d.slots).some(Boolean)).length;
  return (
    <Card>
      <SHead label="Week stats" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { value: `${planned}/7`, sub: 'Days planned', grad: true },
          { value: '28', sub: 'Servings this week' },
          { value: '32m', sub: 'Avg prep time' },
          { value: '23', sub: 'Grocery items' },
        ].map(({ value, sub, grad }) => (
          <div key={sub} style={{ background: 'var(--bg-app)', borderRadius: 'var(--r-md)', padding: '14px 14px 12px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, lineHeight: 1, letterSpacing: '-0.025em', ...(grad ? { background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : { color: 'var(--ink-900)' }) }}>{value}</div>
            <div className="t-caption" style={{ marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="t-caption">Weekly planning</span>
          <span className="t-caption tabular" style={{ fontWeight: 600, color: 'var(--green-600)' }}>{planned}/7 days</span>
        </div>
        <div style={{ height: 8, background: 'var(--ink-100)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(planned / 7) * 100}%`, background: GRAD }} />
        </div>
      </div>
    </Card>
  );
};

// ── Recommended recipe ────────────────────────────────────────────────────────
const Recommended = () => (
  <Card style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
    <div style={{ background: 'var(--green-50)', borderRadius: 'var(--r-md)', padding: 16, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
      <FoodLunch size={56} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span className="t-eyebrow">Recommended</span>
        <span className="chip" style={{ height: 22, fontSize: 11, padding: '0 8px', background: 'var(--orange-50)', color: 'var(--orange-600)' }}>Not made in 5 weeks</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.015em', color: 'var(--ink-900)', marginBottom: 6 }}>Chicken Crust Caesar Salad Pizza</div>
      <div className="t-caption" style={{ marginBottom: 14, display: 'flex', gap: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconClock size={12} /> 38 min</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconServes size={12} /> Serves 4</span>
        <span>Kid-friendly</span>
      </div>
      <button className="btn btn-sm btn-primary">Add to this week</button>
    </div>
  </Card>
);

// ── Planning streak ───────────────────────────────────────────────────────────
const StreakCard = () => {
  const weeks = [0.4, 0.6, 0.7, 0.85, 0.6, 0.9, 0.75, planned => (5/7)];
  const data = [0.4, 0.6, 0.7, 0.85, 0.6, 0.9, 0.75, 5/7];
  const labels = ['Wk 16','Wk 17','Wk 18','Wk 19','Wk 20','Wk 21','Wk 22','This week'];
  return (
    <Card>
      <SHead label="Planning streak" />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 42, letterSpacing: '-0.03em', color: 'var(--ink-900)' }}>4</span>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: 'var(--ink-600)' }}>weeks in a row ✦</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', height: Math.round(v * 52), borderRadius: 4, background: i === 7 ? GRAD : 'var(--ink-100)', opacity: i < 7 ? 0.7 + i * 0.04 : 1 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 9.5, color: i === 7 ? 'var(--green-600)' : 'var(--ink-300)', fontWeight: i === 7 ? 700 : 400 }}>{l}</div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: 'flex', gap: 16 }}>
        <div>
          <div className="t-caption" style={{ marginBottom: 2 }}>Best streak</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink-900)' }}>6 weeks</div>
        </div>
        <div>
          <div className="t-caption" style={{ marginBottom: 2 }}>All-time meals planned</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink-900)' }}>247</div>
        </div>
      </div>
    </Card>
  );
};

Object.assign(window, {
  Sidebar, TopBar, AISummary, WeekAtAGlance, TodaysMeals, ThisWeekRecipes,
  MostCooked, PantryStash, StatsPanel, Recommended, StreakCard,
});
