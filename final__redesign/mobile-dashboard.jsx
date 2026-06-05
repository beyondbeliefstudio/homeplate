// HomePlate — Mobile Dashboard Screen (v5, full-featured)
// Deps (loaded before): icons.jsx, ds-foodicons.jsx, ds-logo.jsx, mobile.jsx

const DASH_WEEK = [
  { day: 'Sun', date: '3',  label: 'Tonight',    name: 'Grilled Pork Spare Ribs',      sides: 'Sweet Corn · Butter Lettuce', color: 'var(--orange)',    kind: 'tonight' },
  { day: 'Mon', date: '4',  label: 'Dinner',      name: 'Grilled Skirt Steak',           sides: 'Butter Lettuce Salad',         color: 'var(--ink-900)',   kind: 'planned' },
  { day: 'Tue', date: '5',  label: 'Pantry Raid', name: 'wide open',                     sides: '',                             color: 'var(--yellow-600)', kind: 'raid'    },
  { day: 'Wed', date: '6',  label: 'Dinner',      name: 'Cheesy Baked Tortellini',       sides: '',                             color: 'var(--green)',     kind: 'planned' },
  { day: 'Thu', date: '7',  label: 'Dinner',      name: 'Sheet Pan Mini Meatloaf',       sides: "L'oven Garlic Knots",          color: 'var(--orange-600)', kind: 'planned' },
  { day: 'Fri', date: '8',  label: 'Dining out',  name: "Culver's",                      sides: '',                             color: null,               kind: 'out'     },
  { day: 'Sat', date: '9',  label: 'Open',        name: 'no plan yet',                   sides: '',                             color: null,               kind: 'empty'   },
];

const DASH_COOKING = [
  { day: 'Sun', name: 'Grilled Pork Spare Ribs',    sides: 'Sweet Corn · Butter Lettuce', audience: 'everyone', color: 'var(--orange)',    tonight: true,  checked: false },
  { day: 'Mon', name: 'Grilled Skirt Steak',         sides: 'Butter Lettuce Salad',        audience: 'adults',   color: 'var(--ink-900)',   tonight: false, checked: false },
  { day: 'Wed', name: 'Cheesy Baked Tortellini',     sides: '',                            audience: 'everyone', color: 'var(--green)',     tonight: false, checked: true  },
  { day: 'Thu', name: 'Sheet Pan Mini Meatloaf',     sides: "L'oven Garlic Knots",         audience: 'kids',     color: 'var(--orange-600)', tonight: false, checked: false },
];

const DASH_PANTRY = [
  { name: 'Olive oil',       note: 'bottle nearly empty', low: true  },
  { name: 'Salt',            note: 'last refill 3 wks ago', low: true  },
  { name: 'Garlic',          note: '1 head left',         low: true  },
  { name: 'Parmesan',        note: 'plenty',              low: false },
  { name: 'Dijon mustard',   note: 'plenty',              low: false },
];

const DASH_ACTIVITY = [
  { initials: 'C', color: 'var(--orange)',    who: 'You',  what: 'planned Pork Spare Ribs for Sunday',    when: '2h ago'    },
  { initials: 'R', color: 'var(--green)',     who: 'Ryan', what: 'checked off 4 items from grocery',      when: '5h ago'    },
  { initials: 'C', color: 'var(--yellow-600)', who: 'You',  what: 'added Pantry Raid for Tuesday',         when: 'yesterday' },
  { initials: 'C', color: 'var(--ink-900)',   who: 'You',  what: 'shared week with Ryan + the kids',      when: '2 days ago'},
];

const COOK_BARS = [40, 25, 0, 35, 45, 0, 0];
const COOK_DAYS = ['S','M','T','W','T','F','S'];

const MOST_COOKED = [
  { name: 'Sheet Pan Meatloaf',    count: 4, color: 'var(--orange-600)' },
  { name: 'Grilled Skirt Steak',   count: 3, color: 'var(--ink-900)'   },
  { name: 'Chicken Alfredo',       count: 3, color: 'var(--green)'     },
  { name: 'Pork Spare Ribs',       count: 2, color: 'var(--orange)'    },
];

// ── Section header ─────────────────────────────────────────────────────────────
const DashSectionHead = ({ label, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>{label}</span>
    {action && <button style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--green-700)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{action}</button>}
  </div>
);

// ── Stat tile ──────────────────────────────────────────────────────────────────
const StatTileMob = ({ label, value, sub, bg, color }) => (
  <div style={{ background: bg, borderRadius: 12, padding: '16px', flex: 1 }}>
    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: color, opacity: 0.8, marginBottom: 4 }}>{label}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.04em', lineHeight: 1, color: color }}>{value}</div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: color, opacity: 0.7, marginTop: 2 }}>{sub}</div>
  </div>
);

// ── Main screen ────────────────────────────────────────────────────────────────
const MobileDashboardScreen = () => {
  const [cookingChecked, setCookingChecked] = React.useState(new Set(['Wed']));

  const toggleCooking = (day) => setCookingChecked(prev => {
    const n = new Set(prev); n.has(day) ? n.delete(day) : n.add(day); return n;
  });

  const madeCount = cookingChecked.size;

  return (
    <div style={{ height: '100%', position: 'relative', background: 'var(--bg-app)', overflow: 'hidden' }}>

      {/* Sticky header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: 62, paddingBottom: 10, paddingLeft: 14, paddingRight: 14, background: 'var(--bg-app)', borderBottom: '1px solid var(--ink-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Wordmark height={18} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)' }}>Thu, Jun 4</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ height: '100%', overflowY: 'auto', paddingTop: 108, boxSizing: 'border-box' }}>
        <div style={{ padding: '14px 16px 120px' }}>

          {/* Greeting */}
          <div style={{ marginBottom: 14 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 34, lineHeight: 0.95, letterSpacing: '-0.04em', color: 'var(--ink-900)', margin: 0 }}>Hey Claire.</h1>
          </div>

          {/* Tonight hero */}
          <div style={{ background: 'var(--green-700)', borderRadius: 14, padding: '14px 16px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>Tonight · {DASH_WEEK[0].day}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#fff', marginBottom: 14 }}>{DASH_WEEK[0].name}.</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>{DASH_WEEK[0].sides}</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.14)', padding: '3px 9px', borderRadius: 'var(--r-pill)' }}>Everyone</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.14)', padding: '3px 9px', borderRadius: 'var(--r-pill)' }}>105 min</span>
              <button style={{ height: 26, padding: '0 10px', background: '#fff', color: 'var(--green-700)', border: 'none', borderRadius: 'var(--r-pill)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginLeft: 'auto' }}>Open recipe →</button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <StatTileMob label="Dinners" value={`${madeCount}/4`} sub="nights cooked" bg="var(--ink-900)" color="#fff" />
            <StatTileMob label="Grocery" value="17" sub="items to grab" bg="var(--green)" color="#fff" />
            <StatTileMob label="Streak" value="12" sub="weeks cooking" bg="var(--yellow-50)" color="var(--yellow-600)" />
          </div>

          {/* Week at a glance */}
          <div style={{ marginBottom: 14 }}>
            <DashSectionHead label="Week at a glance" action="Open planner →" />
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2, scrollSnapType: 'x mandatory' }}>
              {DASH_WEEK.map(({ day, date, name, sides, color, kind }) => (
                <div key={day} style={{
                  flexShrink: 0,
                  width: 'calc((100% - 16px) / 3)',
                  minWidth: 100,
                  borderRadius: 12,
                  border: kind === 'empty' ? '1px dashed var(--ink-200)' : '1px solid var(--ink-100)',
                  background: kind === 'tonight' ? 'var(--green-50)' : kind === 'out' ? 'var(--paper-off)' : 'var(--paper)',
                  padding: '12px 10px 12px',
                  scrollSnapAlign: 'start',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: kind === 'tonight' ? 'var(--green-700)' : 'var(--ink-400)' }}>{day}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>{date}</span>
                  </div>
                  {color && <div style={{ width: '100%', height: 3, borderRadius: 2, background: color, marginBottom: 7 }} />}
                  {!color && <div style={{ height: 10 }} />}
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: kind === 'empty' ? 'var(--ink-300)' : 'var(--ink-900)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{name}</div>
                  {sides && <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--ink-400)', marginTop: 4, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sides}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Cooking this week */}
          <div style={{ marginBottom: 14 }}>
            <DashSectionHead label="Cooking this week" />
            <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--ink-100)', overflow: 'hidden' }}>
              {DASH_COOKING.map(({ day, name, sides, audience, color, tonight }, i) => {
                const made = cookingChecked.has(day);
                return (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: i > 0 ? '1px solid var(--ink-100)' : 'none' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: color, display: 'grid', placeItems: 'center', flexShrink: 0, color: color === 'var(--yellow-600)' ? 'var(--ink-900)' : '#fff' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{day}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: made ? 'var(--ink-300)' : 'var(--ink-900)', textDecoration: made ? 'line-through' : 'none', lineHeight: 1.2 }}>{name}</div>
                      {sides && <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--ink-400)', marginTop: 1 }}>{sides}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {tonight && !made && <span style={{ fontSize: 9, fontWeight: 700, background: 'var(--ink-900)', color: '#fff', padding: '2px 6px', borderRadius: 'var(--r-pill)' }}>Tonight</span>}
                      {audience === 'kids' && !made && <span style={{ fontSize: 9, fontWeight: 600, background: 'var(--yellow-50)', color: 'var(--yellow-600)', padding: '2px 6px', borderRadius: 'var(--r-pill)', border: '1px solid var(--yellow-100)' }}>Kids</span>}
                      {audience === 'adults' && !made && <span style={{ fontSize: 9, fontWeight: 600, background: 'var(--ink-50)', color: 'var(--ink-500)', padding: '2px 6px', borderRadius: 'var(--r-pill)', border: '1px solid var(--ink-100)' }}>Adults</span>}
                      <button onClick={() => toggleCooking(day)} style={{
                        width: 20, height: 20, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
                        border: made ? 'none' : '1.5px solid var(--ink-300)',
                        background: made ? 'var(--green)' : 'transparent',
                        display: 'grid', placeItems: 'center', transition: 'all 0.12s',
                      }}>
                        {made && <span style={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>✓</span>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pantry watch */}
          <div style={{ marginBottom: 14 }}>
            <DashSectionHead label="Pantry watch" />
            <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--ink-100)', overflow: 'hidden' }}>
              {DASH_PANTRY.filter(p => p.low).map((item, i) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderTop: i > 0 ? '1px solid var(--ink-100)' : 'none' }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--yellow-600)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{item.name}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--ink-400)' }}>{item.note}</div>
                  </div>
                  <button style={{ height: 24, padding: '0 9px', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--ink-600)', cursor: 'pointer', flexShrink: 0 }}>+ Add</button>
                </div>
              ))}
              <div style={{ padding: '9px 12px', borderTop: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--ink-200)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-400)', fontStyle: 'italic' }}>Parmesan, Dijon mustard — well stocked</span>
              </div>
            </div>
          </div>

          {/* Stats: Cook time + Audience mix + Most cooked */}
          <div style={{ marginBottom: 14 }}>
            <DashSectionHead label="Cook time · this week" />
            <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--ink-100)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.04em', color: 'var(--ink-900)' }}>3h 35m</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)' }}>across 4 nights · avg 54 min</span>
              </div>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 44, marginTop: 10 }}>
                {COOK_BARS.map((h, i) => (
                  <div key={i} style={{ flex: 1, height: h ? `${(h/45)*100}%` : 6, background: h ? 'var(--green)' : 'var(--ink-100)', borderRadius: 3, minHeight: 4 }} />
                ))}
              </div>
              <div style={{ display: 'flex', marginTop: 4 }}>
                {COOK_DAYS.map((d, i) => <span key={i} style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--ink-400)' }}>{d}</span>)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {/* Audience mix */}
            <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--ink-100)', padding: '16px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: 10 }}>Audience mix</div>
              <div style={{ display: 'flex', gap: 2, height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ flex: 2, background: 'var(--green)' }} />
                <div style={{ flex: 1, background: 'var(--ink-900)' }} />
                <div style={{ flex: 1, background: 'var(--yellow-600)' }} />
              </div>
              {[['var(--green)', 'Everyone', '2'], ['var(--ink-900)', 'Adults', '1'], ['var(--yellow-600)', 'Kids', '1']].map(([c, l, v]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: c, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-600)' }}>{l}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--ink-900)' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Most cooked */}
            <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--ink-100)', padding: '16px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: 10 }}>Most cooked · 30d</div>
              {MOST_COOKED.map(({ name, count, color }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                  <div style={{ width: 4, height: 22, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-800)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--ink-900)', flexShrink: 0 }}>{count}×</span>
                </div>
              ))}
            </div>
          </div>

          {/* Try this week */}
          <div style={{ background: 'var(--ink-900)', borderRadius: 14, padding: '16px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--yellow-600)', marginBottom: 6 }}>Try this week</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#fff', marginBottom: 14 }}>Cheesy Baked Tortellini Casserole.</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, margin: '0 0 12px' }}>From your cookbook, never used. Serves 8 — great for a double batch with lunch leftovers.</p>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', padding: '3px 9px', borderRadius: 'var(--r-pill)' }}>45 min</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', padding: '3px 9px', borderRadius: 'var(--r-pill)' }}>Serves 8</span>
              <button style={{ height: 26, padding: '0 10px', background: '#fff', color: 'var(--ink-900)', border: 'none', borderRadius: 'var(--r-pill)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginLeft: 'auto' }}>View →</button>
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ marginBottom: 14 }}>
            <DashSectionHead label="Recent activity" action="View all" />
            <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--ink-100)', overflow: 'hidden' }}>
              {DASH_ACTIVITY.map(({ initials, color, who, what, when }, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 14px', borderTop: i > 0 ? '1px solid var(--ink-100)' : 'none' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: color, display: 'grid', placeItems: 'center', flexShrink: 0, color: color === 'var(--yellow-600)' ? 'var(--ink-900)' : '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11 }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-900)', lineHeight: 1.4 }}><span style={{ fontWeight: 600 }}>{who}</span> {what}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--ink-400)', marginTop: 1 }}>{when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <MobileTabBar active="dashboard" />
    </div>
  );
};

Object.assign(window, { MobileDashboardScreen });
