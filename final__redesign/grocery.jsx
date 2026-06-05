// HomePlate — Grocery page
// Deps (loaded before): icons.jsx, ds-foodicons.jsx, ds-logo.jsx

const GRAD = 'linear-gradient(90deg, var(--orange), var(--yellow), var(--lime), var(--green))';

// ── Data ──────────────────────────────────────────────────────────────────────

const GROCERY_CATS = [
  { key: 'produce', label: 'Produce', dot: '#5BA63C',
    items: [
      { id: 'g01', qty: '1 head',   name: 'butter lettuce',                src: 'Butter Lettuce Salad',            store: 'aldi'   },
      { id: 'g02', qty: '1½ cups',  name: 'prepared Caesar salad mix',     src: 'Caesar Salad Pizza',              store: null     },
      { id: 'g03', qty: '1 lb',     name: 'baby potatoes, halved',         src: 'Sheet Pan Meatloaf',              store: 'aldi'   },
      { id: 'g04', qty: '4 ears',   name: 'fresh corn on the cob',         src: 'Side',                            store: 'aldi'   },
      { id: 'g05', qty: '3 cloves', name: 'garlic',                        src: 'Garlic Knots',                    store: 'aldi'   },
      { id: 'g06', qty: '2 tbsp',   name: 'fresh parsley, chopped',        src: 'Garlic Knots',                    store: 'aldi'   },
      { id: 'g07', qty: '½ cup',    name: 'onion, finely chopped',         src: 'Sheet Pan Meatloaf',              store: 'aldi'   },
    ],
  },
  { key: 'meat', label: 'Meat & Seafood', dot: '#F0913C',
    items: [
      { id: 'g11', qty: '2 lb',     name: 'grass-fed skirt steak',         src: 'Grilled Skirt Steak',             store: 'publix' },
      { id: 'g12', qty: '2 lb',     name: 'lean ground beef',              src: 'Tortellini Casserole + Meatloaf', store: 'aldi',   bundled: true },
      { id: 'g13', qty: '1 can',    name: 'canned chicken',                src: 'Caesar Salad Pizza',              store: 'aldi'   },
    ],
  },
  { key: 'dairy', label: 'Dairy & Eggs', dot: '#CE9C12',
    items: [
      { id: 'g21', qty: '3',        name: 'eggs',                          src: 'Meatloaf + Caesar Pizza + Pancakes', store: 'aldi', bundled: true },
      { id: 'g22', qty: '2 cups',   name: 'shredded mozzarella',           src: 'Tortellini Casserole',            store: 'aldi'   },
      { id: 'g23', qty: '1¼ cups',  name: 'grated Parmesan',               src: 'Caesar Pizza + Alfredo',          store: 'publix', bundled: true },
      { id: 'g24', qty: '1¼ cups',  name: 'whole milk',                    src: 'Pancakes',                        store: 'aldi'   },
    ],
  },
  { key: 'bakery', label: 'Bread & Bakery', dot: '#BCC0B2',
    items: [
      { id: 'g31', qty: '1 pkg',    name: 'refrigerated pizza dough',      src: 'Garlic Knots',                    store: null     },
      { id: 'g32', qty: '¼ cup',    name: 'fine bread crumbs',             src: 'Sheet Pan Meatloaf',              store: 'aldi'   },
      { id: 'g33', qty: '1½ cups',  name: 'all-purpose flour',             src: 'Pancakes',                        store: 'aldi'   },
    ],
  },
  { key: 'canned', label: 'Canned & Jarred', dot: '#BCC0B2',
    items: [
      { id: 'g41', qty: '1 jar',    name: 'marinara sauce',                src: 'Tortellini Casserole',            store: 'aldi'   },
      { id: 'g42', qty: '¼ cup',    name: 'ketchup or barbecue sauce',     src: 'Sheet Pan Meatloaf',              store: 'aldi'   },
    ],
  },
  { key: 'refrigerated', label: 'Refrigerated', dot: '#BCC0B2',
    items: [
      { id: 'g51', qty: '2 pkg',    name: 'refrigerated cheese tortellini',src: 'Tortellini Casserole',            store: 'publix' },
    ],
  },
];

const PANTRY_ITEMS = [
  { id: 'p1', name: 'Olive oil' },     { id: 'p2', name: 'Unsalted butter' },
  { id: 'p3', name: 'Salt & pepper' }, { id: 'p4', name: 'Garlic powder' },
  { id: 'p5', name: 'Red chili flakes' }, { id: 'p6', name: 'Dijon mustard' },
  { id: 'p7', name: 'Apple cider vinegar' }, { id: 'p8', name: 'Meatchurch Blanco seasoning' },
  { id: 'p9', name: 'Baking powder' },
];

const INITIAL_ALWAYS = [
  { id: 'aol1', name: 'English muffins' },
  { id: 'aol2', name: 'Whole milk' },
  { id: 'aol3', name: 'Orange juice' },
  { id: 'aol4', name: 'Frozen waffles' },
  { id: 'aol5', name: 'Goldfish crackers' },
];

let gid = 300;
const ALL_IDS = GROCERY_CATS.flatMap(c => c.items.map(i => i.id));
const TOTAL = ALL_IDS.length;

const getWeekLabel = (offset) => {
  const base = new Date(2026, 5, 3);
  const day = base.getDay();
  const mon = new Date(base);
  mon.setDate(base.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const f = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${f(mon)} – ${f(sun)}`;
};

const STORE_CFG = {
  aldi:   { label: 'Aldi',   bg: 'var(--green-100)',  color: 'var(--green-700)',  border: 'var(--green-200)'  },
  publix: { label: 'Publix', bg: 'var(--orange-100)', color: 'var(--orange-600)', border: 'var(--orange-100)' },
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const GrocerySidebar = () => (
  <aside style={{ width: 220, flexShrink: 0, background: 'var(--sidebar)', borderRight: 'none', display: 'flex', flexDirection: 'column', padding: '24px 16px', height: '100vh', position: 'sticky', top: 0 }}>
    <SidebarLogo />
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[
        { label: 'Dashboard', Icon: IconHome,     href: 'Dashboard.html' },
        { label: 'Recipes',   Icon: IconRecipes,  href: 'Recipes.html'   },
        { label: 'Planner',   Icon: IconPlanner,  href: 'Planner.html'   },
        { label: 'Grocery',   Icon: IconGrocery,  href: 'Grocery.html',  active: true },
        { label: 'Settings',  Icon: IconSettings, href: 'Settings.html'   },
      ].map(({ label, Icon, active, href }) => (
        href
          ? <a key={label} href={href} style={{ textDecoration: 'none' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 12, height: 42, width: '100%', padding: '0 12px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: active ? 600 : 400, fontSize: 14, background: active ? 'rgba(255,255,255,0.18)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.55)', textAlign: 'left' }}>
                <Icon size={18} stroke={active ? 2 : 1.75} />{label}
              </button>
            </a>
          : <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 42, padding: '0 12px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 14, background: 'transparent', color: 'var(--ink-600)', textAlign: 'left', opacity: 0.4 }}>
              <Icon size={18} stroke={1.75} />{label}
            </button>
      ))}
    </nav>
    <div style={{ marginTop: 'auto', padding: '0 4px' }}>
      <ThemeToggle />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: GRAD, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>C</span>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: '#fff' }}>Claire</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>HomePlate</div>
        </div>
      </div>
    </div>
  </aside>
);

// ── Store tag component ───────────────────────────────────────────────────────
const StoreTag = ({ store, itemId, onSetStore, hov }) => {
  const [open, setOpen] = React.useState(false);
  if (store) {
    const cfg = STORE_CFG[store];
    return (
      <span onClick={e => { e.stopPropagation(); onSetStore(itemId, null); }}
        style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: cfg.color, background: cfg.bg, padding: '2px 7px', borderRadius: 'var(--r-pill)', border: `1px solid ${cfg.border}`, cursor: 'pointer', userSelect: 'none' }}>
        {cfg.label}
      </span>
    );
  }
  if (!hov) return null;
  return (
    <div style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(v => !v)}
        style={{ height: 20, padding: '0 8px', border: '1px dashed var(--ink-200)', borderRadius: 'var(--r-pill)', background: 'none', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, color: 'var(--ink-400)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
        + store
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 30, background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: 'var(--shadow-2)', minWidth: 100 }}>
          {Object.entries(STORE_CFG).map(([key, cfg]) => (
            <button key={key} onClick={() => { onSetStore(itemId, key); setOpen(false); }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-800)', borderBottom: key === 'aldi' ? '1px solid var(--ink-50)' : 'none' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
              {cfg.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Grocery item row ──────────────────────────────────────────────────────────
const GroceryItem = ({ item, checked, store, onToggle, onSetStore }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', background: hov && !checked ? 'var(--paper-off)' : 'transparent', transition: 'background 0.1s', borderBottom: '1px solid var(--ink-50)' }}>
      <button onClick={() => onToggle(item.id)}
        style={{ width: 20, height: 20, borderRadius: 'var(--r-xs)', border: checked ? 'none' : '1.5px solid var(--ink-300)', background: checked ? 'var(--green)' : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.12s' }}>
        {checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: checked ? 'var(--ink-300)' : 'var(--ink-900)', textDecoration: checked ? 'line-through' : 'none', transition: 'color 0.12s' }}>
          <span style={{ fontWeight: 600, color: checked ? 'var(--ink-300)' : 'var(--ink-600)', marginRight: 5 }}>{item.qty}</span>{item.name}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)', marginTop: 1 }}>
          {item.bundled ? `Combined · ${item.src}` : item.src}
        </div>
      </div>
      <StoreTag store={store} itemId={item.id} onSetStore={onSetStore} hov={hov} />
    </div>
  );
};

// ── Category section ──────────────────────────────────────────────────────────
const CategorySection = ({ cat, checked, stores, storeFilter, onToggle, onSetStore }) => {
  const visibleItems = cat.items.filter(item => {
    if (storeFilter === 'all') return true;
    const s = stores[item.id] ?? item.store;
    if (storeFilter === 'untagged') return !s;
    return s === storeFilter;
  });
  if (visibleItems.length === 0) return null;
  const got = visibleItems.filter(i => checked.has(i.id)).length;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px 8px', background: 'var(--paper)', borderBottom: '1px solid var(--ink-100)' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: cat.dot, flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-600)', flex: 1 }}>{cat.label}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)' }}>
          {got > 0 ? `${got}/${visibleItems.length}` : visibleItems.length}
        </span>
      </div>
      {visibleItems.map(item => (
        <GroceryItem key={item.id} item={item} checked={checked.has(item.id)}
          store={stores[item.id] !== undefined ? stores[item.id] : item.store}
          onToggle={onToggle} onSetStore={onSetStore} />
      ))}
    </div>
  );
};

// ── Right panel shared row ────────────────────────────────────────────────────
const RightItem = ({ item, checked, onToggle, onRemove, noRemove }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: hov ? 'var(--paper-off)' : 'transparent', borderBottom: '1px solid var(--ink-50)', transition: 'background 0.1s' }}>
      <button onClick={() => onToggle(item.id)}
        style={{ width: 17, height: 17, borderRadius: 'var(--r-xs)', border: checked ? 'none' : '1.5px solid var(--ink-200)', background: checked ? 'var(--green)' : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.12s' }}>
        {checked && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
      </button>
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, color: checked ? 'var(--ink-300)' : 'var(--ink-800)', textDecoration: checked ? 'line-through' : 'none' }}>{item.name}</span>
      {!noRemove && hov && (
        <button onClick={() => onRemove(item.id)}
          style={{ width: 20, height: 20, display: 'grid', placeItems: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-300)', borderRadius: 'var(--r-sm)' }}>
          <IconClose size={10} />
        </button>
      )}
    </div>
  );
};

// ── Panel shell ───────────────────────────────────────────────────────────────
const Panel = ({ label, count, children, footer }) => (
  <div style={{ background: 'var(--paper)', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)', overflow: 'hidden' }}>
    <div style={{ padding: '13px 16px 11px', background: 'var(--green-50)', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="t-eyebrow" style={{ flex: 1, color: 'var(--ink-700)' }}>{label}</span>
      {count != null && <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-400)' }}>{count}</span>}
    </div>
    {children}
    {footer}
  </div>
);

const AddInput = ({ placeholder, onAdd, dark }) => {
  const [text, setText] = React.useState('');
  const submit = () => { if (text.trim()) { onAdd(text.trim()); setText(''); } };
  const base = dark ? { border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff' } : { border: '1px solid var(--ink-200)', background: 'var(--paper)', color: 'var(--ink-900)' };
  return (
    <div style={{ padding: '10px 14px 12px', display: 'flex', gap: 8 }}>
      <input value={text} onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        placeholder={placeholder}
        style={{ flex: 1, height: 34, padding: '0 12px', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', boxSizing: 'border-box', ...base }} />
      <button onClick={submit}
        style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: text.trim() ? 'var(--ink-900)' : 'var(--ink-100)', border: 'none', borderRadius: 'var(--r-md)', cursor: text.trim() ? 'pointer' : 'default', color: text.trim() ? 'var(--bg-app)' : 'var(--ink-400)', transition: 'background 0.12s' }}>
        <IconPlus size={15} />
      </button>
    </div>
  );
};

// ── Main app ──────────────────────────────────────────────────────────────────
const GroceryApp = () => {
  const [checked,       setChecked]       = React.useState(new Set());
  const [pantryChecked, setPantryChecked] = React.useState(new Set());
  const [alwaysChecked, setAlwaysChecked] = React.useState(new Set());
  const [addedItems,    setAddedItems]    = React.useState([]);
  const [addedChecked,  setAddedChecked]  = React.useState(new Set());
  const [always,        setAlways]        = React.useState(INITIAL_ALWAYS);
  const [storeFilter,   setStoreFilter]   = React.useState('all');
  const [weekOffset,    setWeekOffset]    = React.useState(0);

  // Store overrides — starts from item defaults, user can change
  const initStores = () => {
    const m = {};
    GROCERY_CATS.forEach(c => c.items.forEach(i => { m[i.id] = i.store ?? null; }));
    return m;
  };
  const [stores, setStores] = React.useState(initStores);

  const toggle  = (set, setFn, id) => setFn(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const setStore = (id, val) => setStores(prev => ({ ...prev, [id]: val }));

  const got = checked.size;
  const pct = TOTAL > 0 ? Math.round((got / TOTAL) * 100) : 0;

  const aldiCount   = Object.values(stores).filter(v => v === 'aldi').length;
  const publixCount = Object.values(stores).filter(v => v === 'publix').length;
  const untaggedCount = Object.values(stores).filter(v => !v).length;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      <GrocerySidebar />

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Page header — matches Planner/Recipes pattern */}
        <div style={{ padding: '32px 40px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 6 }}>Grocery</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.03em', color: 'var(--ink-900)', margin: 0 }}>The list.</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10 }}>
            <button onClick={() => setWeekOffset(o => o - 1)} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', background: 'var(--paper)', cursor: 'pointer', color: 'var(--ink-600)' }}><IconChevronL size={14} /></button>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', minWidth: 158, textAlign: 'center' }}>{getWeekLabel(weekOffset)}</span>
            <button onClick={() => setWeekOffset(o => o + 1)} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', background: 'var(--paper)', cursor: 'pointer', color: 'var(--ink-600)' }}><IconChevronR size={14} /></button>
            {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} style={{ height: 32, padding: '0 12px', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', background: 'var(--paper)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--ink-500)' }}>Today</button>}
          </div>
        </div>



        {/* Content */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, padding: '20px 40px 40px', background: 'var(--bg-app)', minHeight: 0, overflowY: 'auto' }}>

          {/* Left: grocery list — card container */}
          <div style={{ background: 'var(--paper)', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)', overflow: 'hidden', alignSelf: 'start' }}>
            {/* Store filter */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span className="t-eyebrow" style={{ color: 'var(--ink-500)', marginRight: 4 }}>From your plan</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <div style={{ width: 80, height: 3, borderRadius: 'var(--r-pill)', background: 'var(--ink-100)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 'var(--r-pill)', transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: pct > 0 ? 'var(--green-600)' : 'var(--ink-400)', fontWeight: 600 }}>{got}/{TOTAL + addedItems.length}</span>
              </div>
              {[
                { key: 'all',      label: 'All',      count: TOTAL          },
                { key: 'aldi',     label: 'Aldi',     count: aldiCount      },
                { key: 'publix',   label: 'Publix',   count: publixCount    },
                { key: 'untagged', label: 'Untagged', count: untaggedCount  },
              ].map(({ key, label, count }) => (
                <button key={key} onClick={() => setStoreFilter(key)}
                  style={{ height: 28, padding: '0 11px', borderRadius: 'var(--r-sm)', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, cursor: 'pointer', background: storeFilter === key ? 'var(--ink-900)' : 'var(--paper)', color: storeFilter === key ? 'var(--bg-app)' : 'var(--ink-600)', outline: storeFilter !== key ? '1px solid var(--ink-200)' : 'none', transition: 'all 0.12s' }}>
                  {label} <span style={{ fontWeight: 400, opacity: 0.6 }}>{count}</span>
                </button>
              ))}
            </div>
            {GROCERY_CATS.map(cat => (
              <CategorySection key={cat.key} cat={cat} checked={checked} stores={stores}
                storeFilter={storeFilter} onToggle={(id) => toggle(checked, setChecked, id)} onSetStore={setStore} />
            ))}
            <div style={{ height: 40 }} />
          </div>

          {/* Right: panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignSelf: 'start' }}>

            <Panel label="Added for this week" count={addedItems.length || null}
              footer={<AddInput placeholder="e.g. Goldfish, paper towels…" onAdd={name => setAddedItems(prev => [...prev, { id: `ad${gid++}`, name }])} />}>
              {addedItems.map((item, i) => (
                <RightItem key={item.id} item={item} checked={addedChecked.has(item.id)}
                  onToggle={(id) => toggle(addedChecked, setAddedChecked, id)}
                  onRemove={(id) => setAddedItems(prev => prev.filter(x => x.id !== id))} />
              ))}
              {addedItems.length === 0 && (
                <div style={{ padding: '10px 16px 4px', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-400)', fontStyle: 'italic' }}>Nothing added yet this week</div>
              )}
            </Panel>

            <Panel label="Check your pantry" count={PANTRY_ITEMS.length}>
              <div style={{ padding: '6px 16px 4px', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)' }}>
                Your recipes call for these — confirm you're stocked.
              </div>
              {PANTRY_ITEMS.map((item, i) => (
                <RightItem key={item.id} item={item} checked={pantryChecked.has(item.id)}
                  onToggle={(id) => toggle(pantryChecked, setPantryChecked, id)} noRemove />
              ))}
            </Panel>

            <Panel label="Always on my list" count={always.length}
              footer={<AddInput placeholder="e.g. Eggs, bread, milk…" onAdd={name => setAlways(prev => [...prev, { id: `aol${gid++}`, name }])} />}>
              {always.map((item, i) => (
                <RightItem key={item.id} item={item} checked={alwaysChecked.has(item.id)}
                  onToggle={(id) => toggle(alwaysChecked, setAlwaysChecked, id)}
                  onRemove={(id) => setAlways(prev => prev.filter(x => x.id !== id))} />
              ))}
            </Panel>

            <div style={{ height: 20 }} />
          </div>
        </div>
      </main>

      <style>{`input::placeholder { color: var(--ink-400); }`}</style>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<GroceryApp />);
