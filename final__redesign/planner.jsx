// HomePlate — Planner page
// Deps (loaded before): icons.jsx, ds-foodicons.jsx, ds-logo.jsx

const GRAD = 'linear-gradient(90deg, var(--orange), var(--yellow), var(--lime), var(--green))';

const PLANNER_RECIPES = [
  { id: 1,  name: 'Chicken Crust Caesar Salad Pizza',     cat: 'Lunch'     },
  { id: 2,  name: 'Sheet Pan Mini Meatloaf & Potatoes',   cat: 'Dinner'    },
  { id: 3,  name: "L'oven Fresh Garlic Knots",            cat: 'Side'      },
  { id: 4,  name: 'Ground Chicken Alfredo Pasta',         cat: 'Dinner'    },
  { id: 5,  name: 'Butter Lettuce Salad',                 cat: 'Side'      },
  { id: 6,  name: 'Pancakes the Kids Actually Eat',       cat: 'Breakfast' },
  { id: 7,  name: 'Grilled Skirt Steak',                  cat: 'Dinner'    },
  { id: 8,  name: 'Brown Butter Choc Chip Cookies',       cat: 'Dessert'   },
  { id: 9,  name: 'Grilled Pork Spare Ribs',              cat: 'Dinner'    },
  { id: 10, name: 'Healthier One Pot Hamburger Helper',   cat: 'Dinner'    },
  { id: 11, name: 'Maple Trail Mix with Toasted Pecans',  cat: 'Snack'     },
  { id: 12, name: 'Cheesy Baked Tortellini Casserole',    cat: 'Dinner'    },
];
const RORY_MAP = { 1:false, 2:true, 3:true, 4:true, 5:false, 6:true, 7:false, 8:true, 9:false, 10:true, 11:true, 12:true };

const INITIAL_PLAN = {
  Dinner: [
    { id: 'd1', type: 'recipe',    recipeId: 12, made: false, rory: true,  sides: [] },
    { id: 'd2', type: 'recipe',    recipeId: 7,  made: false, rory: false, sides: [
      { id: 'd2s1', type: 'recipe', recipeId: 5,  made: false, rory: false },
      { id: 'd2s2', type: 'pantry', note: 'Corn on the cob', made: false, rory: true },
    ]},
    { id: 'd3', type: 'diningout', note: "Culver's", made: false, rory: true, sides: [] },
    { id: 'd4', type: 'recipe',    recipeId: 2,  made: true,  rory: true,  sides: [
      { id: 'd4s1', type: 'recipe', recipeId: 3, made: true, rory: true },
    ]},
  ],
  Lunch: [
    { id: 'l1', type: 'recipe',    recipeId: 1,  made: false, rory: false, sides: [] },
    { id: 'l2', type: 'diningout', note: 'Chipotle', made: false, rory: false, sides: [] },
  ],
  Breakfast: [
    { id: 'b1', type: 'recipe', recipeId: 6, made: true,  rory: true, sides: [] },
    { id: 'b2', type: 'pantry', note: 'Frozen waffles',        made: false, rory: true, sides: [] },
    { id: 'b3', type: 'pantry', note: 'Leftover oatmeal pack', made: false, rory: true, sides: [] },
  ],
  Snack:    [
    { id: 's1', type: 'recipe', recipeId: 11, made: false, rory: true, sides: [] },
    { id: 's2', type: 'recipe', recipeId: 8,  made: false, rory: true, sides: [] },
  ],
  Beverage: [],
};

const INITIAL_NOTES = [
  { id: 'wn1', text: "Parents coming over Tuesday — make something crowd-pleasing" },
  { id: 'wn2', text: "Jake has soccer Thursday, dinner needs to be quick" },
];

const getWeekLabel = (offset) => {
  const base = new Date(2026, 5, 3);
  const day = base.getDay();
  const mon = new Date(base);
  mon.setDate(base.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const f = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${f(mon)} – ${f(sun)}`;
};
let pid = 200;

// ── Sidebar ───────────────────────────────────────────────────────────────────
const PlannerSidebar = () => (
  <aside style={{ width: 220, flexShrink: 0, background: 'var(--sidebar)', borderRight: 'none', display: 'flex', flexDirection: 'column', padding: '24px 16px', height: '100vh', position: 'sticky', top: 0 }}>
    <SidebarLogo />
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[
        { label: 'Dashboard', Icon: IconHome,     href: 'Dashboard.html' },
        { label: 'Recipes',   Icon: IconRecipes,  href: 'Recipes.html'   },
        { label: 'Planner',   Icon: IconPlanner,  href: 'Planner.html',  active: true },
        { label: 'Grocery',   Icon: IconGrocery,  href: 'Grocery.html'   },
        { label: 'Settings',  Icon: IconSettings, href: 'Settings.html' },
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

// ── Recipe picker ─────────────────────────────────────────────────────────────
const RecipePicker = ({ cats, onSelect, onClose }) => {
  const [q, setQ] = React.useState('');
  const list = PLANNER_RECIPES.filter(r =>
    (cats.length === 0 || cats.includes(r.cat)) &&
    r.name.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', overflow: 'hidden', marginTop: 6 }}>
      <input autoFocus value={q} onChange={e => setQ(e.target.value)}
        placeholder="Search recipes…"
        style={{ width: '100%', padding: '10px 14px', border: 'none', borderBottom: '1px solid var(--ink-100)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'var(--paper-off)' }} />
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {list.length === 0
          ? <div style={{ padding: '12px 14px', color: 'var(--ink-400)', fontSize: 13, fontFamily: 'var(--font-body)' }}>No recipes match</div>
          : list.map(r => (
            <button key={r.id} onClick={() => onSelect(r)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--ink-50)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-400)', width: 72, flexShrink: 0 }}>{r.cat}</span>
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-900)' }}>{r.name}</span>
              {RORY_MAP[r.id] && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green-600)', flexShrink: 0 }}>Rory ✓</span>}
            </button>
          ))
        }
      </div>
      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--ink-100)' }}>
        <button onClick={onClose} style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-400)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
};

// ── Free-text input ───────────────────────────────────────────────────────────
const FreeAddInput = ({ placeholder, onAdd, onClose }) => {
  const [text, setText] = React.useState('');
  const [rory, setRory] = React.useState(false);
  const submit = () => { if (text.trim()) onAdd(text.trim(), rory); };
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      <input autoFocus value={text} onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }}
        placeholder={placeholder}
        style={{ flex: 1, minWidth: 140, height: 34, padding: '0 12px', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', background: 'var(--paper)', boxSizing: 'border-box' }} />
      <button onClick={() => setRory(v => !v)}
        style={{ height: 34, padding: '0 10px', border: `1px solid ${rory ? 'var(--green-200)' : 'var(--ink-200)'}`, borderRadius: 'var(--r-md)', background: rory ? 'var(--green-50)' : 'var(--paper)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: rory ? 'var(--green-700)' : 'var(--ink-500)', cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap' }}>
        Rory ✓
      </button>
      <button onClick={submit} style={{ height: 34, padding: '0 12px', background: 'var(--ink-900)', color: 'var(--bg-app)', border: 'none', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Add</button>
      <button onClick={onClose} style={{ height: 34, padding: '0 10px', background: 'none', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-500)', cursor: 'pointer' }}>✕</button>
    </div>
  );
};

// ── Side item (inside expanded sides panel) ───────────────────────────────────
const SideItem = ({ side, onToggle, onDelete }) => {
  const [hov, setHov] = React.useState(false);
  const [delHov, setDelHov] = React.useState(false);
  const recipe = side.type === 'recipe' ? PLANNER_RECIPES.find(r => r.id === side.recipeId) : null;
  const name = recipe ? recipe.name : side.note;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: hov ? 'var(--paper-off)' : 'transparent', transition: 'background 0.1s' }}>
      <button onClick={() => onToggle(side.id)}
        style={{ width: 15, height: 15, borderRadius: 'var(--r-xs)', border: side.made ? 'none' : '1.5px solid var(--ink-200)', background: side.made ? 'var(--green)' : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.12s' }}>
        {side.made && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
      </button>
      {side.type === 'pantry' && (
        <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-400)', background: 'var(--ink-100)', padding: '1px 5px', borderRadius: 'var(--r-xs)' }}>Pantry</span>
      )}
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, color: side.made ? 'var(--ink-300)' : 'var(--ink-700)', textDecoration: side.made ? 'line-through' : 'none', fontStyle: side.type === 'pantry' ? 'italic' : 'normal' }}>{name}</span>
      {side.rory && !side.made && (
        <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 600, color: 'var(--green-700)', background: 'var(--green-50)', padding: '1px 5px', borderRadius: 'var(--r-pill)', border: '1px solid var(--green-100)' }}>Rory ✓</span>
      )}
      <button onClick={() => onDelete(side.id)}
        onMouseEnter={() => setDelHov(true)} onMouseLeave={() => setDelHov(false)}
        style={{ width: 22, height: 22, display: 'grid', placeItems: 'center', border: 'none', background: delHov ? 'var(--danger)' : 'none', cursor: 'pointer', color: delHov ? '#fff' : 'var(--ink-300)', flexShrink: 0, opacity: hov ? 1 : 0, transition: 'opacity 0.1s, background 0.12s, color 0.12s', borderRadius: 'var(--r-sm)' }}>
        <IconClose size={10} />
      </button>
    </div>
  );
};

// ── Meal item ─────────────────────────────────────────────────────────────────
const MealItem = ({ item, onToggle, onDelete, onAddSide, onToggleSide, onDeleteSide, showSides, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd, index }) => {
  const [hov, setHov] = React.useState(false);
  const [delHov, setDelHov] = React.useState(false);
  const [sidesExpanded, setSidesExpanded] = React.useState(false);
  const [addingSide, setAddingSide] = React.useState(null);
  const [showSideMenu, setShowSideMenu] = React.useState(false);

  const recipe = item.type === 'recipe' ? PLANNER_RECIPES.find(r => r.id === item.recipeId) : null;
  const name = recipe ? recipe.name : item.note;
  const isOut = item.type === 'diningout';
  const isPantry = item.type === 'pantry';
  const sides = item.sides || [];
  const canHaveSides = showSides && !isOut;

  const sidesSummary = sides.map(s => {
    const r = s.type === 'recipe' ? PLANNER_RECIPES.find(x => x.id === s.recipeId) : null;
    return r ? r.name : s.note;
  }).join(' · ');

  const handleAddSideRecipe = (r) => {
    onAddSide({ id: `sp${pid++}`, type: 'recipe', recipeId: r.id, made: false, rory: RORY_MAP[r.id] || false });
    setAddingSide(null);
  };
  const handleAddSideFree = (text, rory) => {
    onAddSide({ id: `sp${pid++}`, type: 'pantry', note: text, made: false, rory });
    setAddingSide(null);
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(index); }}
      onDrop={() => onDrop(index)}
      onDragEnd={onDragEnd}
      style={{ borderBottom: '1px solid var(--ink-100)', background: isDragOver ? 'var(--green-50)' : 'transparent', transition: 'background 0.1s' }}
    >
      {/* Main row */}
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: hov ? 'var(--paper-off)' : 'transparent', transition: 'background 0.1s' }}>

        {/* Drag grip */}
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0, cursor: 'grab', opacity: hov ? 1 : 0, transition: 'opacity 0.1s', padding: '2px 0' }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ display: 'flex', gap: 3 }}>
              {[0,1].map(j => <span key={j} style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-300)', display: 'block' }} />)}
            </span>
          ))}
        </span>

        {/* Checkbox */}
        <button onClick={() => onToggle(item.id)}
          style={{ width: 17, height: 17, borderRadius: 'var(--r-xs)', border: item.made ? 'none' : '1.5px solid var(--ink-300)', background: item.made ? 'var(--green)' : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.12s' }}>
          {item.made && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1, fontWeight: 700 }}>✓</span>}
        </button>

        {/* Type badges */}
        {isOut && <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--orange-600)', background: 'var(--orange-100)', padding: '2px 6px', borderRadius: 'var(--r-xs)' }}>Out</span>}
        {isPantry && <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-400)', background: 'var(--ink-100)', padding: '2px 6px', borderRadius: 'var(--r-xs)' }}>Pantry</span>}

        {/* Name + collapsed sides summary */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: item.made ? 'var(--ink-300)' : isPantry ? 'var(--ink-600)' : 'var(--ink-900)', textDecoration: item.made ? 'line-through' : 'none', fontStyle: isPantry ? 'italic' : 'normal' }}>{name}</span>
          {canHaveSides && !sidesExpanded && sidesSummary && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)', marginLeft: 8 }}>· {sidesSummary}</span>
          )}
        </div>

        {/* Rory tag */}
        {item.rory && !item.made && (
          <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 600, color: 'var(--green-700)', background: 'var(--green-50)', padding: '2px 6px', borderRadius: 'var(--r-pill)', border: '1px solid var(--green-100)' }}>Rory ✓</span>
        )}

        {/* Sides expand toggle */}
        {canHaveSides && (
          <button onClick={() => { setSidesExpanded(v => !v); if (sidesExpanded) { setAddingSide(null); setShowSideMenu(false); } }}
            style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', background: sidesExpanded ? 'var(--ink-900)' : 'var(--paper)', cursor: 'pointer', color: sidesExpanded ? 'var(--bg-app)' : 'var(--ink-500)', flexShrink: 0, opacity: hov || sides.length > 0 ? 1 : 0, transition: 'all 0.12s' }}>
            <span style={{ display: 'grid', placeItems: 'center', transform: sidesExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
              <IconChevronR size={12} />
            </span>
          </button>
        )}

        {/* Delete */}
        <button onClick={() => onDelete(item.id)}
          onMouseEnter={() => setDelHov(true)} onMouseLeave={() => setDelHov(false)}
          style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', border: '1px solid transparent', background: delHov ? 'var(--danger)' : 'none', cursor: 'pointer', color: delHov ? '#fff' : 'var(--ink-300)', flexShrink: 0, opacity: hov ? 1 : 0, transition: 'opacity 0.1s, background 0.12s, color 0.12s', borderRadius: 'var(--r-sm)' }}>
          <IconClose size={11} />
        </button>
      </div>

      {/* Expanded sides panel */}
      {canHaveSides && sidesExpanded && (
        <div style={{ background: 'var(--paper-off)', borderTop: '1px solid var(--ink-100)', paddingBottom: 8 }}>
          {sides.length === 0 && addingSide === null && (
            <div style={{ padding: '10px 14px 2px', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-400)', fontStyle: 'italic' }}>No sides added yet</div>
          )}
          {sides.map(side => (
            <SideItem key={side.id} side={side} onToggle={onToggleSide} onDelete={onDeleteSide} />
          ))}

          {addingSide === 'recipe' && (
            <div style={{ padding: '6px 14px' }}>
              <RecipePicker cats={['Side']} onSelect={handleAddSideRecipe} onClose={() => setAddingSide(null)} />
            </div>
          )}
          {addingSide === 'pantry' && (
            <div style={{ padding: '6px 14px' }}>
              <FreeAddInput placeholder="e.g. Corn on the cob, roasted potatoes…" onAdd={handleAddSideFree} onClose={() => setAddingSide(null)} />
            </div>
          )}

          {addingSide === null && (
            <div style={{ position: 'relative', padding: '4px 14px 2px' }}>
              <button onClick={() => setShowSideMenu(v => !v)}
                style={{ height: 26, padding: '0 10px', border: '1px dashed var(--ink-200)', borderRadius: 'var(--r-sm)', background: showSideMenu ? 'var(--paper)' : 'transparent', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, color: 'var(--ink-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'background 0.1s' }}>
                <IconPlus size={9} /> Add side
              </button>
              {showSideMenu && (
                <div style={{ position: 'absolute', top: 'calc(100% + 2px)', left: 14, zIndex: 20, background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', overflow: 'hidden', minWidth: 148, boxShadow: 'var(--shadow-2)' }}>
                  {[['recipe', 'From cookbook'], ['pantry', 'Pantry item']].map(([type, label]) => (
                    <button key={type} onClick={() => { setAddingSide(type); setShowSideMenu(false); }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      style={{ display: 'block', width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-800)', borderBottom: type === 'recipe' ? '1px solid var(--ink-100)' : 'none' }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Week notes ────────────────────────────────────────────────────────────────
const NoteRow = ({ note, onDelete, last }) => {
  const [hov, setHov] = React.useState(false);
  const [delHov, setDelHov] = React.useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: hov ? 'var(--paper-off)' : 'transparent', borderBottom: last ? 'none' : '1px solid var(--ink-50)', transition: 'background 0.1s' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink-300)', flexShrink: 0 }} />
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.4 }}>{note.text}</span>
      <button onClick={() => onDelete(note.id)}
        onMouseEnter={() => setDelHov(true)} onMouseLeave={() => setDelHov(false)}
        style={{ width: 22, height: 22, display: 'grid', placeItems: 'center', border: 'none', background: delHov ? 'var(--danger)' : 'none', cursor: 'pointer', color: delHov ? '#fff' : 'var(--ink-300)', flexShrink: 0, opacity: hov ? 1 : 0, transition: 'opacity 0.1s, background 0.12s', borderRadius: 'var(--r-sm)' }}>
        <IconClose size={10} />
      </button>
    </div>
  );
};

const WeekNotes = ({ notes, onAdd, onDelete }) => {
  const [adding, setAdding] = React.useState(false);
  const [text, setText] = React.useState('');
  const submit = () => { if (text.trim()) { onAdd(text.trim()); setText(''); setAdding(false); } };
  return (
    <div style={{ background: 'var(--paper)', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px 12px', background: 'var(--green-700)', borderRadius: 'var(--r-lg) var(--r-lg) 0 0', display: 'flex', alignItems: 'center', gap: 10, borderBottom: notes.length > 0 || adding ? '1px solid var(--green-600)' : 'none' }}>
        <span className="t-eyebrow" style={{ flex: 1, color: 'rgba(255,255,255,0.8)' }}>Notable this week</span>
        {!adding && (
          <button onClick={() => setAdding(true)}
            style={{ height: 26, padding: '0 10px', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.12)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconPlus size={10} /> Add note
          </button>
        )}
      </div>
      {notes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {notes.map((note, i) => <NoteRow key={note.id} note={note} onDelete={onDelete} last={i === notes.length - 1 && !adding} />)}
        </div>
      )}
      {adding && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '10px 18px' }}>
          <input autoFocus value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setAdding(false); setText(''); } }}
            placeholder="e.g. Parents over Tuesday, quick dinner Thursday…"
            style={{ flex: 1, height: 34, padding: '0 12px', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', background: 'var(--paper)', boxSizing: 'border-box' }} />
          <button onClick={submit} style={{ height: 34, padding: '0 12px', background: 'var(--ink-900)', color: 'var(--bg-app)', border: 'none', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Add</button>
          <button onClick={() => { setAdding(false); setText(''); }} style={{ height: 34, padding: '0 10px', background: 'none', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-500)', cursor: 'pointer' }}>✕</button>
        </div>
      )}
    </div>
  );
};

// ── Meal section ──────────────────────────────────────────────────────────────
const MealSection = ({ sectionKey, label, items, recipeCats, showDiningOut, showSides, onAdd, onToggle, onDelete, onAddSide, onToggleSide, onDeleteSide, onReorder }) => {
  const [adding, setAdding] = React.useState(null);
  const [dragFrom, setDragFrom] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);

  const madeCount = items.filter(i => i.made).length;
  const outCount  = items.filter(i => i.type === 'diningout').length;

  const handleDragStart = (i) => setDragFrom(i);
  const handleDragOver  = (i) => setDragOver(i);
  const handleDrop      = (i) => {
    if (dragFrom !== null && dragFrom !== i) onReorder(sectionKey, dragFrom, i);
    setDragFrom(null); setDragOver(null);
  };
  const handleDragEnd   = () => { setDragFrom(null); setDragOver(null); };

  const handleAddRecipe = (r) => {
    onAdd(sectionKey, { id: `${sectionKey[0]}${pid++}`, type: 'recipe', recipeId: r.id, made: false, rory: RORY_MAP[r.id] || false, sides: [] });
    setAdding(null);
  };
  const handleAddFree = (type, text, rory) => {
    onAdd(sectionKey, { id: `${sectionKey[0]}${pid++}`, type, note: text, made: false, rory, sides: [] });
    setAdding(null);
  };

  return (
    <div style={{ background: 'var(--paper)', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)', overflow: 'visible', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 12px', background: 'var(--green-700)', borderRadius: 'var(--r-lg) var(--r-lg) 0 0', display: 'flex', alignItems: 'center', gap: 8, borderBottom: items.length > 0 || adding ? '1px solid var(--green-600)' : 'none' }}>
        <span className="t-eyebrow" style={{ flex: 1, color: 'rgba(255,255,255,0.8)' }}>{label}</span>
        {outCount > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 'var(--r-pill)', border: '1px solid rgba(255,255,255,0.2)' }}>{outCount}× out</span>}
        {items.length > 0 && <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>{madeCount > 0 ? `${madeCount}/${items.length} made` : `${items.length} planned`}</span>}
      </div>

      {/* Items */}
      {items.map((item, i) => (
        <MealItem key={item.id} item={item} index={i}
          showSides={showSides}
          onToggle={onToggle} onDelete={onDelete}
          onAddSide={(side) => onAddSide(sectionKey, item.id, side)}
          onToggleSide={(sideId) => onToggleSide(sectionKey, item.id, sideId)}
          onDeleteSide={(sideId) => onDeleteSide(sectionKey, item.id, sideId)}
          isDragOver={dragOver === i}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
      ))}

      {/* Inline add UI */}
      {adding !== null && (
        <div style={{ padding: '10px 14px', borderTop: items.length > 0 ? '1px solid var(--ink-100)' : 'none', borderBottom: '1px solid var(--ink-100)' }}>
          {adding === 'recipe'
            ? <RecipePicker cats={recipeCats} onSelect={handleAddRecipe} onClose={() => setAdding(null)} />
            : <FreeAddInput
                placeholder={adding === 'diningout' ? "e.g. Culver's, Chipotle…" : 'e.g. Frozen waffles, leftover soup…'}
                onAdd={(text, rory) => handleAddFree(adding, text, rory)}
                onClose={() => setAdding(null)} />
          }
        </div>
      )}

      {/* Add buttons */}
      <div style={{ padding: '10px 14px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: items.length > 0 ? '1px solid var(--ink-100)' : 'none' }}>
        {[
          { key: 'recipe',    label: 'Recipe' },
          { key: 'pantry',    label: 'Pantry item' },
          ...(showDiningOut ? [{ key: 'diningout', label: 'Dining out' }] : []),
        ].map(({ key, label: btnLabel }) => (
          <button key={key} onClick={() => setAdding(adding === key ? null : key)}
            style={{ height: 28, padding: '0 11px', border: '1px dashed var(--ink-200)', borderRadius: 'var(--r-sm)', background: adding === key ? 'var(--ink-50)' : 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, color: 'var(--ink-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'background 0.1s' }}>
            <IconPlus size={10} /> {btnLabel}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Main app ──────────────────────────────────────────────────────────────────
const PlannerApp = () => {
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [plan, setPlan] = React.useState(INITIAL_PLAN);
  const [weekNotes, setWeekNotes] = React.useState(INITIAL_NOTES);

  const addNote    = (text) => setWeekNotes(prev => [...prev, { id: `wn${pid++}`, text }]);
  const deleteNote = (id)   => setWeekNotes(prev => prev.filter(n => n.id !== id));

  const addItem    = (section, item) => setPlan(prev => ({ ...prev, [section]: [...prev[section], item] }));
  const toggleItem = (id) => setPlan(prev => {
    const next = {};
    for (const [k, v] of Object.entries(prev)) next[k] = v.map(i => i.id === id ? { ...i, made: !i.made } : i);
    return next;
  });
  const deleteItem = (id) => setPlan(prev => {
    const next = {};
    for (const [k, v] of Object.entries(prev)) next[k] = v.filter(i => i.id !== id);
    return next;
  });
  const reorderItems = (section, from, to) => setPlan(prev => {
    const items = [...prev[section]];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    return { ...prev, [section]: items };
  });
  const addSide    = (section, parentId, side) => setPlan(prev => ({ ...prev, [section]: prev[section].map(i => i.id === parentId ? { ...i, sides: [...(i.sides||[]), side] } : i) }));
  const toggleSide = (section, parentId, sideId) => setPlan(prev => ({ ...prev, [section]: prev[section].map(i => i.id === parentId ? { ...i, sides: (i.sides||[]).map(s => s.id === sideId ? { ...s, made: !s.made } : s) } : i) }));
  const deleteSide = (section, parentId, sideId) => setPlan(prev => ({ ...prev, [section]: prev[section].map(i => i.id === parentId ? { ...i, sides: (i.sides||[]).filter(s => s.id !== sideId) } : i) }));

  const sectionProps = { onAdd: addItem, onToggle: toggleItem, onDelete: deleteItem, onAddSide: addSide, onToggleSide: toggleSide, onDeleteSide: deleteSide, onReorder: reorderItems };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      <PlannerSidebar />
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px 40px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 6 }}>Planner</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.03em', color: 'var(--ink-900)', margin: 0 }}>This week.</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10 }}>
            <button onClick={() => setWeekOffset(o => o - 1)} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', background: 'var(--paper)', cursor: 'pointer', color: 'var(--ink-600)' }}><IconChevronL size={14} /></button>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', minWidth: 158, textAlign: 'center' }}>{getWeekLabel(weekOffset)}</span>
            <button onClick={() => setWeekOffset(o => o + 1)} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', background: 'var(--paper)', cursor: 'pointer', color: 'var(--ink-600)' }}><IconChevronR size={14} /></button>
            {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} style={{ height: 32, padding: '0 12px', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', background: 'var(--paper)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--ink-500)' }}>Today</button>}
          </div>
        </div>

        <div style={{ padding: '24px 40px 60px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <WeekNotes notes={weekNotes} onAdd={addNote} onDelete={deleteNote} />
          <MealSection sectionKey="Dinner" label="Dinners" items={plan.Dinner} recipeCats={['Dinner', 'Side']} showDiningOut showSides {...sectionProps} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <MealSection sectionKey="Lunch" label="Lunches" items={plan.Lunch} recipeCats={['Lunch', 'Side']} showDiningOut showSides {...sectionProps} />
            <MealSection sectionKey="Breakfast" label="Breakfasts" items={plan.Breakfast} recipeCats={['Breakfast']} {...sectionProps} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <MealSection sectionKey="Snack" label="Snacks & Bakes" items={plan.Snack} recipeCats={['Snack', 'Dessert']} {...sectionProps} />
            <MealSection sectionKey="Beverage" label="Beverages" items={plan.Beverage} recipeCats={['Beverage']} {...sectionProps} />
          </div>
        </div>
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<PlannerApp />);
