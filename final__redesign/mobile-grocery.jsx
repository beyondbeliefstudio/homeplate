// HomePlate — Mobile Grocery Screen (v5, full-featured)
// Deps (loaded before): icons.jsx, ds-foodicons.jsx, ds-logo.jsx, mobile.jsx

// ── Data ──────────────────────────────────────────────────────────────────────
const MOB_GROCERY_CATS = [
  { key: 'produce', label: 'Produce', dot: 'var(--green-700)', items: [
    { id: 'g01', qty: '1 head',   name: 'butter lettuce',               src: 'Butter Lettuce Salad',              store: 'aldi'   },
    { id: 'g02', qty: '1½ cups',  name: 'prepared Caesar salad mix',    src: 'Caesar Salad Pizza',                store: null     },
    { id: 'g03', qty: '1 lb',     name: 'baby potatoes, halved',        src: 'Sheet Pan Meatloaf',                store: 'aldi'   },
    { id: 'g04', qty: '4 ears',   name: 'fresh corn on the cob',        src: 'Side',                              store: 'aldi'   },
    { id: 'g05', qty: '3 cloves', name: 'garlic',                       src: 'Garlic Knots',                      store: 'aldi'   },
    { id: 'g06', qty: '½ cup',    name: 'onion, finely chopped',        src: 'Sheet Pan Meatloaf',                store: 'aldi'   },
  ]},
  { key: 'meat', label: 'Meat & Seafood', dot: 'var(--orange-600)', items: [
    { id: 'g11', qty: '2 lb',   name: 'grass-fed skirt steak',          src: 'Grilled Skirt Steak',               store: 'publix' },
    { id: 'g12', qty: '2 lb',   name: 'lean ground beef',               src: 'Tortellini + Meatloaf',             store: 'aldi', bundled: true },
    { id: 'g13', qty: '1 can',  name: 'canned chicken',                 src: 'Caesar Salad Pizza',                store: 'aldi'   },
  ]},
  { key: 'dairy', label: 'Dairy & Eggs', dot: 'var(--yellow-600)', items: [
    { id: 'g21', qty: '3',        name: 'eggs',                         src: 'Meatloaf + Caesar + Pancakes',      store: 'aldi', bundled: true },
    { id: 'g22', qty: '2 cups',   name: 'shredded mozzarella',          src: 'Tortellini Casserole',              store: 'aldi'   },
    { id: 'g23', qty: '1¼ cups',  name: 'grated Parmesan',              src: 'Caesar Pizza + Alfredo',            store: 'publix', bundled: true },
    { id: 'g24', qty: '1¼ cups',  name: 'whole milk',                   src: 'Pancakes',                          store: 'aldi'   },
  ]},
  { key: 'bakery', label: 'Bread & Bakery', dot: 'var(--ink-400)', items: [
    { id: 'g31', qty: '1 pkg',   name: 'refrigerated pizza dough',      src: 'Garlic Knots',                      store: null     },
    { id: 'g32', qty: '¼ cup',   name: 'fine bread crumbs',             src: 'Sheet Pan Meatloaf',                store: 'aldi'   },
    { id: 'g33', qty: '1½ cups', name: 'all-purpose flour',             src: 'Pancakes',                          store: 'aldi'   },
  ]},
  { key: 'canned', label: 'Canned & Jarred', dot: 'var(--ink-400)', items: [
    { id: 'g41', qty: '1 jar', name: 'marinara sauce',                  src: 'Tortellini Casserole',              store: 'aldi'   },
    { id: 'g42', qty: '¼ cup', name: 'ketchup or barbecue sauce',       src: 'Sheet Pan Meatloaf',                store: 'aldi'   },
  ]},
  { key: 'refrigerated', label: 'Refrigerated', dot: 'var(--ink-400)', items: [
    { id: 'g51', qty: '2 pkg', name: 'refrigerated cheese tortellini',  src: 'Tortellini Casserole',              store: 'publix' },
  ]},
];

const MOB_PANTRY = [
  { id: 'pa1', name: 'Olive oil' },      { id: 'pa2', name: 'Unsalted butter' },
  { id: 'pa3', name: 'Salt & pepper' },  { id: 'pa4', name: 'Garlic powder' },
  { id: 'pa5', name: 'Dijon mustard' },  { id: 'pa6', name: 'Apple cider vinegar' },
  { id: 'pa7', name: 'Meatchurch Blanco seasoning' },
  { id: 'pa8', name: 'Baking powder' },
];

const MOB_ALWAYS_INIT = [
  { id: 'al1', name: 'English muffins' },
  { id: 'al2', name: 'Whole milk' },
  { id: 'al3', name: 'Orange juice' },
  { id: 'al4', name: 'Goldfish crackers' },
];

const MOB_STORE_CFG = {
  aldi:   { label: 'Aldi',   bg: 'var(--green-50)',  color: 'var(--green-700)',  border: 'var(--green-200)'  },
  publix: { label: 'Publix', bg: 'var(--orange-50)', color: 'var(--orange-600)', border: 'var(--orange-100)' },
};

// Initialize store map from defaults
const initStoreMap = () => {
  const m = {};
  MOB_GROCERY_CATS.forEach(c => c.items.forEach(i => { m[i.id] = i.store ?? null; }));
  return m;
};

const ALL_PLAN_IDS = MOB_GROCERY_CATS.flatMap(c => c.items.map(i => i.id));

let mob_gid = 400;

const getWeekLabelGrocery = (offset) => {
  const base = new Date(2026, 5, 3);
  const day = base.getDay();
  const mon = new Date(base);
  mon.setDate(base.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(mon)} – ${fmt(sun)}`;
};

// ── Store picker sheet ─────────────────────────────────────────────────────────
const StorePickerSheet = ({ itemId, current, onSet, onClose }) => {
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => { const id = requestAnimationFrame(() => setVis(true)); return () => cancelAnimationFrame(id); }, []);
  const close = () => { setVis(false); setTimeout(onClose, 280); };
  const pick = (val) => { onSet(itemId, val); close(); };
  return (
    <>
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,18,0.4)', zIndex: 40, opacity: vis ? 1 : 0, transition: 'opacity 0.22s' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--paper)', borderRadius: '14px 14px 0 0', zIndex: 41, transform: vis ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}><div style={{ width: 36, height: 3, borderRadius: 2, background: 'var(--ink-200)' }} /></div>
        <div style={{ padding: '4px 0 24px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-400)', padding: '6px 16px 10px' }}>Assign to store</div>
          {Object.entries(MOB_STORE_CFG).map(([key, cfg]) => (
            <button key={key} onClick={() => pick(key)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px', background: current === key ? 'var(--ink-50)' : 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--ink-100)', textAlign: 'left' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-900)' }}>{cfg.label}</span>
              {current === key && <span style={{ color: 'var(--green)', fontSize: 16 }}>✓</span>}
            </button>
          ))}
          {current && (
            <button onClick={() => pick(null)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--ink-200)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-500)' }}>Remove store</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// ── Collapsible secondary section ─────────────────────────────────────────────
const CollapsibleSection = ({ label, count, defaultOpen = false, children, footer }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--ink-100)', overflow: 'hidden', marginBottom: 14 }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'var(--green-50)', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-700)', flex: 1, textAlign: 'left' }}>{label}</span>
        {count != null && <span style={{ fontSize: 11, color: 'var(--ink-400)' }}>{count}</span>}
        <span style={{ color: 'var(--ink-400)', display: 'grid', placeItems: 'center', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.16s' }}><IconChevronR size={11} /></span>
      </button>
      {open && (
        <>
          {children}
          {footer}
        </>
      )}
    </div>
  );
};

// ── Grocery item row ───────────────────────────────────────────────────────────
const GroceryItemRow = ({ item, checked, store, onToggle, onStorePick }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 12px', borderTop: '1px solid var(--ink-100)' }}>
    <button onClick={() => onToggle(item.id)} style={{
      width: 18, height: 18, borderRadius: 3, flexShrink: 0, cursor: 'pointer',
      border: checked ? 'none' : '1.5px solid var(--ink-300)',
      background: checked ? 'var(--green)' : 'transparent',
      display: 'grid', placeItems: 'center', transition: 'all 0.12s',
    }}>
      {checked && <span style={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>✓</span>}
    </button>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: checked ? 'var(--ink-300)' : 'var(--ink-900)', textDecoration: checked ? 'line-through' : 'none', lineHeight: 1.2 }}>
        <span style={{ fontWeight: 600, color: checked ? 'var(--ink-300)' : 'var(--ink-600)', marginRight: 4 }}>{item.qty}</span>{item.name}
        {item.bundled && <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-400)', marginLeft: 5, background: 'var(--ink-50)', padding: '1px 4px', borderRadius: 2 }}>Combined</span>}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--ink-400)', marginTop: 1 }}>{item.src}</div>
    </div>
    <button onClick={() => onStorePick(item.id, store)} style={{
      height: 22, padding: store ? '0 7px' : '0 6px',
      border: store ? `1px solid ${MOB_STORE_CFG[store]?.border}` : '1px dashed var(--ink-200)',
      borderRadius: 'var(--r-pill)', background: store ? MOB_STORE_CFG[store]?.bg : 'transparent',
      fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
      color: store ? MOB_STORE_CFG[store]?.color : 'var(--ink-400)',
    }}>
      {store ? MOB_STORE_CFG[store]?.label : '+ store'}
    </button>
  </div>
);

// ── Simple checklist row ───────────────────────────────────────────────────────
const SimpleRow = ({ item, checked, onToggle, onRemove }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 12px', borderTop: '1px solid var(--ink-100)' }}>
    <button onClick={() => onToggle(item.id)} style={{
      width: 16, height: 16, borderRadius: 3, flexShrink: 0, cursor: 'pointer',
      border: checked ? 'none' : '1.5px solid var(--ink-300)',
      background: checked ? 'var(--green)' : 'transparent',
      display: 'grid', placeItems: 'center', transition: 'all 0.12s',
    }}>
      {checked && <span style={{ color: '#fff', fontSize: 8, fontWeight: 800 }}>✓</span>}
    </button>
    <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, color: checked ? 'var(--ink-300)' : 'var(--ink-800)', textDecoration: checked ? 'line-through' : 'none' }}>{item.name}</span>
    {onRemove && (
      <button onClick={() => onRemove(item.id)} style={{ width: 20, height: 20, display: 'grid', placeItems: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-300)', flexShrink: 0 }}>
        <IconClose size={9} />
      </button>
    )}
  </div>
);

// ── Quick-add input ────────────────────────────────────────────────────────────
const QuickAdd = ({ placeholder, onAdd }) => {
  const [text, setText] = React.useState('');
  const submit = () => { if (text.trim()) { onAdd(text.trim()); setText(''); } };
  return (
    <div style={{ display: 'flex', gap: 7, padding: '10px 12px 12px', borderTop: '1px solid var(--ink-100)' }}>
      <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder={placeholder}
        style={{ flex: 1, height: 36, padding: '0 10px', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', background: 'var(--paper)', color: 'var(--ink-900)', boxSizing: 'border-box' }} />
      <button onClick={submit} style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: text.trim() ? 'var(--ink-900)' : 'var(--ink-200)', border: 'none', display: 'grid', placeItems: 'center', cursor: text.trim() ? 'pointer' : 'default', color: '#fff', transition: 'background 0.12s', flexShrink: 0 }}>
        <IconPlus size={15} />
      </button>
    </div>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────────
const MobileGroceryScreen = () => {
  const [checkedIds,    setCheckedIds]    = React.useState(new Set(['g01', 'g11']));
  const [pantryChecked, setPantryChecked] = React.useState(new Set());
  const [alwaysChecked, setAlwaysChecked] = React.useState(new Set());
  const [storeMap,      setStoreMap]      = React.useState(initStoreMap);
  const [storeFilter,   setStoreFilter]   = React.useState('all');
  const [expandedCats,  setExpandedCats]  = React.useState(() => Object.fromEntries(MOB_GROCERY_CATS.map(c => [c.key, true])));
  const [weekOffset,    setWeekOffset]    = React.useState(0);
  const [addedItems,    setAddedItems]    = React.useState([]);
  const [addedChecked,  setAddedChecked]  = React.useState(new Set());
  const [alwaysItems,   setAlwaysItems]   = React.useState(MOB_ALWAYS_INIT);
  const [storePicker,   setStorePicker]   = React.useState(null); // { itemId, current }

  const toggle = (setFn, id) => setFn(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const setStore = (id, val) => setStoreMap(prev => ({ ...prev, [id]: val }));

  const planItems = MOB_GROCERY_CATS.flatMap(c => c.items);
  const planGot   = planItems.filter(i => checkedIds.has(i.id)).length;
  const planTotal = planItems.length;
  const addedGot  = addedItems.filter(i => addedChecked.has(i.id)).length;
  const totalGot  = planGot + addedGot;
  const total     = planTotal + addedItems.length;
  const toGrab    = total - totalGot;
  const pct       = total > 0 ? Math.round(totalGot / total * 100) : 0;

  const aldiCount   = planItems.filter(i => (storeMap[i.id] ?? null) === 'aldi').length;
  const publixCount = planItems.filter(i => (storeMap[i.id] ?? null) === 'publix').length;

  const filterItems = (items) => {
    if (storeFilter === 'all') return items;
    if (storeFilter === 'untagged') return items.filter(i => !storeMap[i.id]);
    return items.filter(i => storeMap[i.id] === storeFilter);
  };

  return (
    <div style={{ height: '100%', position: 'relative', background: 'var(--bg-app)', overflow: 'hidden' }}>

      {/* Sticky header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: 62, paddingBottom: 10, paddingLeft: 14, paddingRight: 14, background: 'var(--bg-app)', borderBottom: '1px solid var(--ink-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Wordmark height={18} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 8, padding: '0 2px', height: 28 }}>
            <button onClick={() => setWeekOffset(o => o - 1)} style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer', color: 'var(--ink-500)' }}><IconChevronL size={11} /></button>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--ink-700)', padding: '0 4px', whiteSpace: 'nowrap' }}>{getWeekLabelGrocery(weekOffset)}</span>
            <button onClick={() => setWeekOffset(o => o + 1)} style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer', color: 'var(--ink-500)' }}><IconChevronR size={11} /></button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ height: '100%', overflowY: 'auto', paddingTop: 108, boxSizing: 'border-box' }}>
        <div style={{ padding: '14px 16px 120px' }}>

          {/* Headline + progress */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: 4 }}>Grocery</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 34, lineHeight: 0.95, letterSpacing: '-0.04em', color: 'var(--ink-900)', margin: '0 0 14px' }}>The list.</h1>
            {/* Progress bar */}
            <div style={{ background: 'var(--paper)', borderRadius: 8, padding: '8px 10px', border: '1px solid var(--ink-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--ink-700)' }}>{totalGot} of {total} got</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: '-0.02em' }}>{pct}%</span>
              </div>
              <div style={{ height: 5, background: 'var(--ink-100)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
            </div>
          </div>

          {/* Store filter chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 16 }}>
            {[
              { key: 'all',      label: 'All',      count: planTotal   },
              { key: 'aldi',     label: 'Aldi',     count: aldiCount   },
              { key: 'publix',   label: 'Publix',   count: publixCount },
              { key: 'untagged', label: 'Untagged', count: planTotal - aldiCount - publixCount },
            ].map(({ key, label, count }) => (
              <button key={key} onClick={() => setStoreFilter(key)} style={{
                height: 27, padding: '0 10px', borderRadius: 'var(--r-sm)', border: 'none',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                background: storeFilter === key ? 'var(--ink-900)' : 'var(--paper)',
                color: storeFilter === key ? '#fff' : 'var(--ink-700)',
                outline: storeFilter !== key ? '1px solid var(--ink-200)' : 'none',
                transition: 'background 0.1s',
              }}>{label} <span style={{ opacity: 0.55, fontWeight: 400 }}>{count}</span></button>
            ))}
          </div>

          {/* From your plan — aisle groups */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: 12 }}>From your plan</div>
            {MOB_GROCERY_CATS.map(cat => {
              const visible = filterItems(cat.items);
              if (visible.length === 0) return null;
              const got     = visible.filter(i => checkedIds.has(i.id)).length;
              const open    = expandedCats[cat.key] !== false;
              const toggle_ = () => setExpandedCats(prev => ({ ...prev, [cat.key]: !open }));
              return (
                <div key={cat.key} style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--ink-100)', overflow: 'hidden', marginBottom: 14 }}>
                  <button onClick={toggle_} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: cat.dot, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: cat.dot, flex: 1 }}>{cat.label}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)', marginRight: 4 }}>{got > 0 ? `${got}/${visible.length}` : visible.length}</span>
                    <span style={{ color: 'var(--ink-300)', display: 'grid', placeItems: 'center', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.16s' }}><IconChevronR size={11} /></span>
                  </button>
                  {open && visible.map(item => (
                    <GroceryItemRow
                      key={item.id} item={item}
                      checked={checkedIds.has(item.id)}
                      store={storeMap[item.id] ?? null}
                      onToggle={(id) => toggle(setCheckedIds, id)}
                      onStorePick={(id, curr) => setStorePicker({ itemId: id, current: curr })}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Added for this week */}
          <CollapsibleSection label="Added for this week" count={addedItems.length || null} defaultOpen={true}
            footer={<QuickAdd placeholder="e.g. paper towels, sparkling water…" onAdd={name => setAddedItems(prev => [...prev, { id: `ad${mob_gid++}`, name }])} />}>
            {addedItems.length === 0
              ? <div style={{ padding: '10px 12px 4px', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-400)', fontStyle: 'italic' }}>Nothing added yet</div>
              : addedItems.map(item => (
                <SimpleRow key={item.id} item={item} checked={addedChecked.has(item.id)}
                  onToggle={(id) => toggle(setAddedChecked, id)}
                  onRemove={(id) => setAddedItems(prev => prev.filter(x => x.id !== id))} />
              ))
            }
          </CollapsibleSection>

          {/* Check your pantry */}
          <CollapsibleSection label="Check your pantry" count={MOB_PANTRY.length}>
            <div style={{ padding: '8px 12px 4px', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)' }}>Your recipes call for these — confirm you're stocked.</div>
            {MOB_PANTRY.map(item => (
              <SimpleRow key={item.id} item={item} checked={pantryChecked.has(item.id)}
                onToggle={(id) => toggle(setPantryChecked, id)} />
            ))}
          </CollapsibleSection>

          {/* Always on my list */}
          <CollapsibleSection label="Always on my list" count={alwaysItems.length}
            footer={<QuickAdd placeholder="e.g. eggs, bread, milk…" onAdd={name => setAlwaysItems(prev => [...prev, { id: `al${mob_gid++}`, name }])} />}>
            {alwaysItems.map(item => (
              <SimpleRow key={item.id} item={item} checked={alwaysChecked.has(item.id)}
                onToggle={(id) => toggle(setAlwaysChecked, id)}
                onRemove={(id) => setAlwaysItems(prev => prev.filter(x => x.id !== id))} />
            ))}
          </CollapsibleSection>

        </div>
      </div>

      {/* Store picker sheet */}
      {storePicker && (
        <StorePickerSheet
          itemId={storePicker.itemId}
          current={storePicker.current}
          onSet={setStore}
          onClose={() => setStorePicker(null)}
        />
      )}

      <MobileTabBar active="grocery" />
    </div>
  );
};

Object.assign(window, { MobileGroceryScreen });
