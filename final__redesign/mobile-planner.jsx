// HomePlate — Mobile Planner Screen (full interactive v5, compact sizing)
// Deps (loaded before): icons.jsx, ds-foodicons.jsx, ds-logo.jsx, mobile.jsx

let _mpid = 500;
const mpId = () => `mp${_mpid++}`;

const SECTION_CATS = {
  Dinner:    ['Dinner', 'Side'],
  Lunch:     ['Lunch', 'Side'],
  Breakfast: ['Breakfast'],
  Snack:     ['Snack', 'Dessert'],
};
const DINING_OUT_SECTIONS = new Set(['Dinner', 'Lunch']);
const SIDES_SECTIONS      = new Set(['Dinner']);

const MP_INITIAL_PLAN = {
  Dinner: [
    { id: 'd1', type: 'recipe',    name: 'Cheesy Baked Tortellini Casserole', rory: true,  sides: [] },
    { id: 'd2', type: 'recipe',    name: 'Grilled Skirt Steak',               rory: false, sides: [
      { id: 'd2s1', type: 'recipe', name: 'Butter Lettuce Salad', rory: false },
    ]},
    { id: 'd3', type: 'diningout', name: "Culver's",                           rory: true,  sides: [] },
    { id: 'd4', type: 'recipe',    name: 'Sheet Pan Mini Meatloaf',            rory: true,  sides: [
      { id: 'd4s1', type: 'recipe', name: "L'oven Fresh Garlic Knots", rory: true },
    ]},
  ],
  Lunch: [
    { id: 'l1', type: 'recipe',    name: 'Chicken Crust Caesar Salad Pizza', rory: false, sides: [] },
    { id: 'l2', type: 'diningout', name: 'Chipotle',                          rory: false, sides: [] },
  ],
  Breakfast: [
    { id: 'b1', type: 'recipe', name: 'Pancakes the Kids Actually Eat', rory: true,  sides: [] },
    { id: 'b2', type: 'pantry', name: 'Frozen waffles',                 rory: true,  sides: [] },
    { id: 'b3', type: 'pantry', name: 'Leftover oatmeal pack',          rory: true,  sides: [] },
  ],
  Snack: [
    { id: 's1', type: 'recipe', name: 'Maple Trail Mix with Toasted Pecans', rory: true, sides: [] },
    { id: 's2', type: 'recipe', name: 'Brown Butter Choc Chip Cookies',       rory: true, sides: [] },
  ],
};

const MP_INITIAL_NOTES = [
  "Parents coming over Tuesday — make something crowd-pleasing",
  "Jake has soccer Thursday, dinner needs to be quick",
];

const mpWeekLabel = (offset) => {
  const base = new Date(2026, 5, 3);
  const day = base.getDay();
  const mon = new Date(base);
  mon.setDate(base.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(mon)} – ${fmt(sun)}`;
};

// ── Generic animated bottom sheet ─────────────────────────────────────────────
const BottomSheet = ({ onClose, height = '72%', children }) => {
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setVis(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const close = React.useCallback(() => {
    setVis(false);
    setTimeout(onClose, 300);
  }, [onClose]);
  return (
    <>
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,18,0.45)', zIndex: 40, opacity: vis ? 1 : 0, transition: 'opacity 0.25s' }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height,
        background: 'var(--paper)', borderRadius: '16px 16px 0 0', zIndex: 41,
        transform: vis ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '8px 0 2px' }}>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: 'var(--ink-200)' }} />
        </div>
        {children(close)}
      </div>
    </>
  );
};

// ── Recipe picker sheet ────────────────────────────────────────────────────────
const MPRecipePickerSheet = ({ title, cats, onSelect, onClose }) => {
  const [q, setQ] = React.useState('');
  const allRecipes = window.MOBILE_RECIPES_DATA || [];
  const list = allRecipes.filter(r =>
    (cats.length === 0 || cats.includes(r.cat)) &&
    r.name.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <BottomSheet onClose={onClose} height="86%">
      {(close) => (
        <>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', padding: '2px 14px 8px', gap: 8 }}>
            <button onClick={close} style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--ink-500)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '4px 0' }}>
              <IconChevronL size={12} /> Back
            </button>
            <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--ink-900)' }}>{title}</span>
            <div style={{ width: 48 }} />
          </div>
          <div style={{ flexShrink: 0, margin: '0 14px 8px', background: 'var(--paper-off)', borderRadius: 'var(--r-xl)', height: 38, display: 'flex', alignItems: 'center', gap: 8, padding: '0 11px', border: '1px solid var(--ink-200)' }}>
            <IconSearch size={14} style={{ color: 'var(--ink-400)', flexShrink: 0 }} />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search recipes…"
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13, background: 'transparent', color: 'var(--ink-900)' }} />
            {q && <button onClick={() => setQ('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-400)', padding: 0 }}><IconClose size={12} /></button>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {list.length === 0 && (
              <div style={{ padding: '24px 14px', textAlign: 'center', color: 'var(--ink-400)', fontStyle: 'italic', fontSize: 13 }}>No recipes match</div>
            )}
            {list.map((recipe, i) => (
              <button key={recipe.id} onClick={() => { onSelect(recipe); close(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderBottom: i < list.length - 1 ? '1px solid var(--ink-100)' : 'none', textAlign: 'left' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 2 }}>{recipe.cat}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em', color: 'var(--ink-900)', lineHeight: 1.2 }}>{recipe.name}</div>
                </div>
                {recipe.rory && (
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--green-700)', background: 'var(--green-50)', padding: '1px 5px', borderRadius: 'var(--r-pill)', border: '1px solid var(--green-100)', flexShrink: 0 }}>Rory ✓</span>
                )}
                <span style={{ color: 'var(--ink-300)', flexShrink: 0 }}><IconChevronR size={12} /></span>
              </button>
            ))}
          </div>
        </>
      )}
    </BottomSheet>
  );
};

// ── Text input sheet ───────────────────────────────────────────────────────────
const MPTextInputSheet = ({ title, placeholder, onAdd, onClose }) => {
  const [text, setText] = React.useState('');
  const [rory, setRory] = React.useState(false);
  return (
    <BottomSheet onClose={onClose} height="48%">
      {(close) => (
        <div style={{ padding: '6px 14px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em', color: 'var(--ink-900)', padding: '2px 0' }}>{title}</div>
          <input autoFocus value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && text.trim()) { onAdd(text.trim(), rory); close(); } }}
            placeholder={placeholder}
            style={{ height: 44, padding: '0 12px', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none', background: 'var(--paper)', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setRory(v => !v)} style={{
              height: 40, padding: '0 14px', border: `1px solid ${rory ? 'var(--green-200)' : 'var(--ink-200)'}`,
              borderRadius: 'var(--r-md)', background: rory ? 'var(--green-50)' : 'var(--paper)',
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
              color: rory ? 'var(--green-700)' : 'var(--ink-500)', cursor: 'pointer', transition: 'all 0.12s', flexShrink: 0,
            }}>Rory ✓</button>
            <button onClick={() => { if (text.trim()) { onAdd(text.trim(), rory); close(); } }}
              style={{ flex: 1, height: 40, background: text.trim() ? 'var(--ink-900)' : 'var(--ink-200)', color: text.trim() ? '#fff' : 'var(--ink-400)', border: 'none', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, cursor: text.trim() ? 'pointer' : 'default', transition: 'background 0.12s' }}>
              Add
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
};

// ── Note input sheet ───────────────────────────────────────────────────────────
const MPNoteInputSheet = ({ onAdd, onClose }) => {
  const [text, setText] = React.useState('');
  return (
    <BottomSheet onClose={onClose} height="44%">
      {(close) => (
        <div style={{ padding: '6px 14px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em', color: 'var(--ink-900)', padding: '2px 0' }}>Add a note</div>
          <textarea autoFocus value={text} onChange={e => setText(e.target.value)}
            placeholder="e.g. Parents over Tuesday, quick dinner Thursday…"
            style={{ padding: '10px 12px', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5, outline: 'none', background: 'var(--paper)', resize: 'none', height: 80, boxSizing: 'border-box' }} />
          <button onClick={() => { if (text.trim()) { onAdd(text.trim()); close(); } }}
            style={{ height: 42, background: text.trim() ? 'var(--ink-900)' : 'var(--ink-200)', color: text.trim() ? '#fff' : 'var(--ink-400)', border: 'none', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, cursor: text.trim() ? 'pointer' : 'default', transition: 'background 0.12s' }}>
            Add note
          </button>
        </div>
      )}
    </BottomSheet>
  );
};

// ── Side item row ─────────────────────────────────────────────────────────────
const MPSideItem = ({ side, checked, onCheck, onDelete }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px 9px 30px', background: 'var(--paper-off)', borderBottom: '1px solid var(--ink-100)' }}>
    <button onClick={onCheck} style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0, cursor: 'pointer', border: checked ? 'none' : '1.5px solid var(--ink-300)', background: checked ? 'var(--green)' : 'transparent', display: 'grid', placeItems: 'center', transition: 'all 0.12s' }}>
      {checked && <span style={{ color: '#fff', fontSize: 8, fontWeight: 800 }}>✓</span>}
    </button>
    {side.type === 'pantry' && (
      <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--ink-100)', color: 'var(--ink-500)', padding: '1px 3px', borderRadius: 2, flexShrink: 0 }}>Pantry</span>
    )}
    <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, color: checked ? 'var(--ink-300)' : 'var(--ink-700)', textDecoration: checked ? 'line-through' : 'none', fontStyle: side.type === 'pantry' ? 'italic' : 'normal' }}>{side.name}</span>
    {side.rory && !checked && (
      <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--green-700)', background: 'var(--green-50)', padding: '1px 4px', borderRadius: 'var(--r-pill)', border: '1px solid var(--green-100)', flexShrink: 0 }}>Rory ✓</span>
    )}
    <button onClick={onDelete} style={{ width: 20, height: 20, display: 'grid', placeItems: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-300)', flexShrink: 0 }}>
      <IconClose size={9} />
    </button>
  </div>
);

// ── Meal item row ─────────────────────────────────────────────────────────────
const MPMealItem = ({ item, checked, onCheck, onDelete, checkedIds, onCheckSide, onDeleteSide, onAddSideRecipe, onAddSidePantry, showSides }) => {
  const [sidesOpen, setSidesOpen] = React.useState(item.sides.length > 0);
  const isOut    = item.type === 'diningout';
  const isPantry = item.type === 'pantry';
  const canHaveSides = showSides && !isOut;

  return (
    <div style={{ background: 'var(--paper)', borderBottom: '1px solid var(--ink-100)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 12px', minHeight: 46 }}>
        {/* Checkbox */}
        <button onClick={onCheck} style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0, cursor: 'pointer', border: checked ? 'none' : '1.5px solid var(--ink-300)', background: checked ? 'var(--green)' : 'transparent', display: 'grid', placeItems: 'center', transition: 'all 0.12s' }}>
          {checked && <span style={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>✓</span>}
        </button>

        {isOut    && <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--orange-100)', color: 'var(--orange-600)', padding: '1px 4px', borderRadius: 2, flexShrink: 0 }}>Out</span>}
        {isPantry && <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--ink-100)',    color: 'var(--ink-500)',    padding: '1px 4px', borderRadius: 2, flexShrink: 0 }}>Pantry</span>}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, lineHeight: 1.25, color: checked ? 'var(--ink-300)' : 'var(--ink-900)', textDecoration: checked ? 'line-through' : 'none', fontStyle: isPantry ? 'italic' : 'normal' }}>{item.name}</div>
          {item.sides.length > 0 && !sidesOpen && !checked && (
            <div style={{ fontSize: 10, color: 'var(--ink-400)', marginTop: 1 }}>{item.sides.map(s => s.name).join(' · ')}</div>
          )}
        </div>

        {item.rory && !checked && (
          <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--green-700)', background: 'var(--green-50)', padding: '1px 5px', borderRadius: 'var(--r-pill)', border: '1px solid var(--green-100)', flexShrink: 0, whiteSpace: 'nowrap' }}>Rory ✓</span>
        )}

        {canHaveSides && (
          <button onClick={() => setSidesOpen(v => !v)} style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', background: sidesOpen ? 'var(--ink-900)' : 'var(--paper)', color: sidesOpen ? '#fff' : 'var(--ink-500)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.12s' }}>
            <span style={{ transform: sidesOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', display: 'grid', placeItems: 'center' }}>
              <IconChevronR size={10} />
            </span>
          </button>
        )}

        <button onClick={onDelete} style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-300)', flexShrink: 0 }}>
          <IconClose size={10} />
        </button>
      </div>

      {/* Sides panel */}
      {canHaveSides && sidesOpen && (
        <div>
          {item.sides.map(side => (
            <MPSideItem key={side.id} side={side} checked={checkedIds.has(side.id)} onCheck={() => onCheckSide(side.id)} onDelete={() => onDeleteSide(side.id)} />
          ))}
          <div style={{ display: 'flex', gap: 5, padding: '6px 10px 8px 28px', background: 'var(--paper-off)', borderTop: item.sides.length > 0 ? '1px solid var(--ink-100)' : 'none' }}>
            <button onClick={onAddSideRecipe} style={{ height: 24, padding: '0 8px', border: '1px dashed var(--ink-200)', borderRadius: 'var(--r-sm)', background: 'transparent', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, color: 'var(--ink-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
              <IconPlus size={8} /> Recipe
            </button>
            <button onClick={onAddSidePantry} style={{ height: 24, padding: '0 8px', border: '1px dashed var(--ink-200)', borderRadius: 'var(--r-sm)', background: 'transparent', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, color: 'var(--ink-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
              <IconPlus size={8} /> Pantry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Meal section ──────────────────────────────────────────────────────────────
const MPMealSection = ({ sectionKey, label, items, expanded, onToggle, checkedIds, onCheck, onCheckSide, onDeleteItem, onDeleteSide, onAddRecipe, onAddPantry, onAddDiningOut, onAddSideRecipe, onAddSidePantry }) => {
  const madeCount = items.filter(i => checkedIds.has(i.id)).length;
  const showSides = SIDES_SECTIONS.has(sectionKey);

  return (
    <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--ink-100)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', background: 'var(--green-700)', padding: '11px 14px', border: 'none', cursor: 'pointer', gap: 7 }}>
        <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', textAlign: 'left' }}>{label}</span>
        {items.length > 0 && (
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', padding: '1px 7px', borderRadius: 'var(--r-pill)', flexShrink: 0 }}>
            {madeCount > 0 ? `${madeCount}/${items.length} made` : `${items.length} planned`}
          </span>
        )}
        <span style={{ color: 'rgba(255,255,255,0.6)', display: 'grid', placeItems: 'center', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }}>
          <IconChevronR size={11} />
        </span>
      </button>

      {expanded && (
        <div>
          {items.length === 0 && (
            <div style={{ padding: '10px 12px', color: 'var(--ink-400)', fontSize: 12, fontStyle: 'italic', background: 'var(--paper)' }}>Nothing planned yet</div>
          )}
          {items.map(item => (
            <MPMealItem
              key={item.id} item={item}
              checked={checkedIds.has(item.id)}
              onCheck={() => onCheck(item.id)}
              onDelete={() => onDeleteItem(item.id)}
              checkedIds={checkedIds}
              onCheckSide={onCheckSide}
              onDeleteSide={(sideId) => onDeleteSide(item.id, sideId)}
              onAddSideRecipe={() => onAddSideRecipe(item.id)}
              onAddSidePantry={() => onAddSidePantry(item.id)}
              showSides={showSides}
            />
          ))}

          {/* Inline add buttons */}
          <div style={{ display: 'flex', gap: 5, padding: '8px 10px', background: 'var(--paper)', borderTop: items.length > 0 ? '1px solid var(--ink-100)' : 'none', flexWrap: 'wrap' }}>
            {[
              { label: 'Recipe',        action: onAddRecipe },
              { label: 'Pantry',        action: onAddPantry },
              ...(DINING_OUT_SECTIONS.has(sectionKey) ? [{ label: 'Dining out', action: onAddDiningOut }] : []),
            ].map(({ label: bl, action }) => (
              <button key={bl} onClick={action} style={{ height: 26, padding: '0 9px', border: '1px dashed var(--ink-200)', borderRadius: 'var(--r-sm)', background: 'transparent', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, color: 'var(--ink-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                <IconPlus size={9} /> {bl}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Week notes card ────────────────────────────────────────────────────────────
const MPWeekNotes = ({ notes, onDelete, onAdd }) => (
  <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--ink-100)' }}>
    <div style={{ background: 'var(--green-700)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>Notable this week</span>
      <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 3, height: 22, padding: '0 8px', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.12)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, color: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}>
        <IconPlus size={8} /> Add note
      </button>
    </div>
    <div style={{ background: 'var(--paper)' }}>
      {notes.length === 0 && <div style={{ padding: '9px 12px', fontSize: 12, color: 'var(--ink-400)', fontStyle: 'italic' }}>No notes yet</div>}
      {notes.map((note, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', borderBottom: i < notes.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-300)', flexShrink: 0, marginTop: 6 }} />
          <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-700)', lineHeight: 1.45 }}>{note}</span>
          <button onClick={() => onDelete(i)} style={{ width: 18, height: 18, display: 'grid', placeItems: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-300)', flexShrink: 0 }}>
            <IconClose size={9} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// ── Mobile Planner Screen ─────────────────────────────────────────────────────
const MobilePlannerScreen = () => {
  const [plan, setPlan]             = React.useState(MP_INITIAL_PLAN);
  const [notes, setNotes]           = React.useState([...MP_INITIAL_NOTES]);
  const [expanded, setExpanded]     = React.useState({ Dinner: true, Lunch: false, Breakfast: false, Snack: false });
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [checkedIds, setCheckedIds] = React.useState(new Set(['d4', 'b1']));
  const [sheet, setSheet]           = React.useState(null);
  const [showAccount, setShowAccount] = React.useState(false);

  const addItem    = (section, item)           => setPlan(p => ({ ...p, [section]: [...p[section], item] }));
  const deleteItem = (section, id)             => setPlan(p => ({ ...p, [section]: p[section].filter(i => i.id !== id) }));
  const addSide    = (section, itemId, side)   => setPlan(p => ({ ...p, [section]: p[section].map(i => i.id === itemId ? { ...i, sides: [...i.sides, side] } : i) }));
  const deleteSide = (section, itemId, sideId) => setPlan(p => ({ ...p, [section]: p[section].map(i => i.id === itemId ? { ...i, sides: i.sides.filter(s => s.id !== sideId) } : i) }));
  const toggleCheck = (id) => setCheckedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const addNote    = (text) => setNotes(prev => [...prev, text]);
  const deleteNote = (idx)  => setNotes(prev => prev.filter((_, i) => i !== idx));

  const renderSheet = () => {
    if (!sheet) return null;
    const { kind, section, cats, type, placeholder, isSide, itemId } = sheet;
    if (kind === 'recipePicker') {
      return (
        <MPRecipePickerSheet
          title={isSide ? 'Add a side' : 'Pick a recipe'}
          cats={cats || []}
          onSelect={(recipe) => {
            const item = { id: mpId(), type: 'recipe', name: recipe.name, rory: recipe.rory };
            isSide ? addSide(section, itemId, item) : addItem(section, { ...item, sides: [] });
          }}
          onClose={() => setSheet(null)}
        />
      );
    }
    if (kind === 'textInput') {
      return (
        <MPTextInputSheet
          title={type === 'diningout' ? 'Dining out' : isSide ? 'Pantry side' : 'Pantry item'}
          placeholder={placeholder}
          onAdd={(name, rory) => {
            const item = { id: mpId(), type: isSide ? 'pantry' : type, name, rory };
            isSide ? addSide(section, itemId, item) : addItem(section, { ...item, sides: [] });
          }}
          onClose={() => setSheet(null)}
        />
      );
    }
    if (kind === 'noteInput') {
      return <MPNoteInputSheet onAdd={addNote} onClose={() => setSheet(null)} />;
    }
    return null;
  };

  const sections = [
    { key: 'Dinner',    label: 'Dinners' },
    { key: 'Lunch',     label: 'Lunches' },
    { key: 'Breakfast', label: 'Breakfasts' },
    { key: 'Snack',     label: 'Snacks & Bakes' },
  ];

  return (
    <div style={{ height: '100%', position: 'relative', background: 'var(--bg-app)', overflow: 'hidden' }}>

      {/* Sticky header — sits above the scroll area */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: 62, paddingBottom: 10, paddingLeft: 14, paddingRight: 14, background: 'var(--bg-app)', borderBottom: '1px solid var(--ink-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Wordmark height={18} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 8, padding: '0 2px', height: 28 }}>
            <button onClick={() => setWeekOffset(o => o - 1)} style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer', color: 'var(--ink-500)' }}><IconChevronL size={11} /></button>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--ink-700)', padding: '0 4px', whiteSpace: 'nowrap' }}>{mpWeekLabel(weekOffset)}</span>
            <button onClick={() => setWeekOffset(o => o + 1)} style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer', color: 'var(--ink-500)' }}><IconChevronR size={11} /></button>
          </div>
        </div>
      </div>

      <div style={{ height: '100%', overflowY: 'auto', paddingTop: 106, boxSizing: 'border-box' }}>
        <div style={{ padding: '12px 16px 120px' }}>

          {/* Heading */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: 4 }}>Planner</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 34, lineHeight: 0.95, letterSpacing: '-0.04em', color: 'var(--ink-900)', margin: 0 }}>This week.</h1>
          </div>

          {/* Week notes */}
          <div style={{ marginBottom: 14 }}>
            <MPWeekNotes notes={notes} onDelete={deleteNote} onAdd={() => setSheet({ kind: 'noteInput' })} />
          </div>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sections.map(({ key, label }) => (
              <MPMealSection
                key={key} sectionKey={key} label={label}
                items={plan[key]}
                expanded={expanded[key]}
                onToggle={() => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))}
                checkedIds={checkedIds}
                onCheck={toggleCheck}
                onCheckSide={toggleCheck}
                onDeleteItem={(id) => deleteItem(key, id)}
                onDeleteSide={(itemId, sideId) => deleteSide(key, itemId, sideId)}
                onAddRecipe={() => setSheet({ kind: 'recipePicker', section: key, cats: SECTION_CATS[key], isSide: false })}
                onAddPantry={() => setSheet({ kind: 'textInput', section: key, type: 'pantry', placeholder: 'e.g. Frozen waffles, leftover soup…', isSide: false })}
                onAddDiningOut={() => setSheet({ kind: 'textInput', section: key, type: 'diningout', placeholder: "e.g. Culver's, Chipotle…", isSide: false })}
                onAddSideRecipe={(itemId) => setSheet({ kind: 'recipePicker', section: key, cats: ['Side'], isSide: true, itemId })}
                onAddSidePantry={(itemId) => setSheet({ kind: 'textInput', section: key, type: 'pantry', placeholder: 'e.g. Corn on the cob…', isSide: true, itemId })}
              />
            ))}
          </div>
        </div>
      </div>

      {renderSheet()}
      {showAccount && <AccountSheet onClose={() => setShowAccount(false)} />}
      <MobileTabBar active="planner" onSettingsPress={() => setShowAccount(true)} />
    </div>
  );
};

Object.assign(window, { MobilePlannerScreen });
