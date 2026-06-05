// HomePlate v5 mobile screens
// Deps (loaded before): icons.jsx, ds-foodicons.jsx, ds-logo.jsx

// ── Status bar (kept for legacy screens) ─────────────────────────────────────
const StatusBar = ({ dark = false }) => (
  <div style={{
    height: 44, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    color: dark ? 'var(--paper)' : 'var(--ink-900)', fontWeight: 600, fontSize: 14,
  }}>
    <span className="tabular">9:41</span>
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ display: 'inline-block', width: 16, height: 10, background: 'currentColor', borderRadius: 1, opacity: .85 }} />
      <span style={{ display: 'inline-block', width: 14, height: 10, background: 'currentColor', borderRadius: 2, opacity: .85 }} />
      <span style={{ display: 'inline-block', width: 22, height: 10, border: '1.5px solid currentColor', borderRadius: 3, position: 'relative' }}>
        <span style={{ position: 'absolute', inset: 1.5, background: 'currentColor', borderRadius: 1, width: '70%' }} />
      </span>
    </div>
  </div>
);

// ── Shared gradient ─────────────────────────────────────────────────────────
const GRAD_MOB = 'linear-gradient(135deg, var(--orange), var(--yellow), var(--lime), var(--green))';

// ── Tab bar ─────────────────────────────────────────────────────────────────
const MobileTabBar = ({ active = 'dashboard', onSettingsPress = () => {} }) => {
  const tabs = [
    ['dashboard', IconHome,    'Home'],
    ['planner',   IconPlanner, 'Planner'],
    ['recipes',   IconRecipes, 'Recipes'],
    ['grocery',   IconGrocery, 'Grocery'],
    ['profile',   null,        'Profile'],
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 20, left: 12, right: 12,
      background: 'var(--paper)', borderRadius: 28,
      boxShadow: '0 8px 28px rgba(32,36,28,.12), 0 0 0 1px var(--ink-100)',
      display: 'flex', justifyContent: 'space-around',
      zIndex: 20, padding: '4px',
    }}>
      {tabs.map(([id, Ico, label]) => {
        const on = id === active;
        const isProfile = id === 'profile';
        return (
          <div key={id}
            onClick={() => {
              if (window.__appTabPress) { window.__appTabPress(id); return; }
              if (isProfile) onSettingsPress();
            }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '13px 6px', borderRadius: 20, flex: 1,
              cursor: 'pointer',
              background: on ? 'var(--green-700)' : 'transparent',
              color: on ? '#fff' : 'var(--ink-500)',
            }}>
            {isProfile
              ? <div style={{ width: 20, height: 20, borderRadius: '50%', background: GRAD_MOB, display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1 }}>C</span>
                </div>
              : <Ico size={20} />
            }
          </div>
        );
      })}
    </div>
  );
};

// ── Planner data ──────────────────────────────────────────────────────────────
const PLANNER_SECTIONS_DATA = {
  Dinner: [
    { id: 'd1', type: 'recipe',    name: 'Cheesy Baked Tortellini Casserole', rory: true,  sides: [] },
    { id: 'd2', type: 'recipe',    name: 'Grilled Skirt Steak',               rory: false, sides: ['Butter Lettuce Salad'] },
    { id: 'd3', type: 'diningout', name: "Culver's",                           rory: true,  sides: [] },
    { id: 'd4', type: 'recipe',    name: 'Sheet Pan Mini Meatloaf',            rory: true,  sides: ["L'oven Fresh Garlic Knots"] },
  ],
  Lunch: [
    { id: 'l1', type: 'recipe',    name: 'Chicken Crust Caesar Salad Pizza',  rory: false, sides: [] },
    { id: 'l2', type: 'diningout', name: 'Chipotle',                           rory: false, sides: [] },
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

const WEEK_NOTES = [
  "Parents coming over Tuesday — make something crowd-pleasing",
  "Jake has soccer Thursday, dinner needs to be quick",
];

// ── Week label ────────────────────────────────────────────────────────────────
const getWeekLabelMobile = (offset) => {
  const base = new Date(2026, 5, 3);
  const day = base.getDay();
  const mon = new Date(base);
  mon.setDate(base.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(mon)} – ${fmt(sun)}`;
};

// ── Meal item row ─────────────────────────────────────────────────────────────
const MealItemMobile = ({ item, checked, onCheck, isLast }) => {
  const isOut = item.type === 'diningout';
  const isPantry = item.type === 'pantry';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', minHeight: 48,
      background: 'var(--paper)', borderBottom: isLast ? 'none' : '1px solid var(--ink-100)',
    }}>
      <button
        onClick={onCheck}
        style={{
          width: 20, height: 20, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
          border: checked ? 'none' : '1.5px solid var(--ink-300)',
          background: checked ? 'var(--green)' : 'transparent',
          display: 'grid', placeItems: 'center', transition: 'all 0.12s',
        }}
      >
        {checked && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>}
      </button>

      {isOut && (
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--orange-100)', color: 'var(--orange-600)', padding: '2px 5px', borderRadius: 3, flexShrink: 0 }}>Out</span>
      )}
      {isPantry && (
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--ink-100)', color: 'var(--ink-500)', padding: '2px 5px', borderRadius: 3, flexShrink: 0 }}>Pantry</span>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, lineHeight: 1.25,
          color: checked ? 'var(--ink-300)' : 'var(--ink-900)',
          textDecoration: checked ? 'line-through' : 'none',
          fontStyle: isPantry ? 'italic' : 'normal',
        }}>{item.name}</div>
        {item.sides.length > 0 && !checked && (
          <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 1 }}>{item.sides.join(' · ')}</div>
        )}
      </div>

      {item.rory && !checked && (
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green-700)', background: 'var(--green-50)', padding: '2px 7px', borderRadius: 'var(--r-pill)', border: '1px solid var(--green-100)', flexShrink: 0, whiteSpace: 'nowrap' }}>Rory ✓</span>
      )}
    </div>
  );
};

// ── Collapsible meal section ──────────────────────────────────────────────────
const MealSectionMobile = ({ label, items, expanded, onToggle, checkedIds, onCheck }) => {
  const madeCount = items.filter(i => checkedIds.has(i.id)).length;
  return (
    <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--ink-100)' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', background: 'var(--green-700)', padding: '12px 14px', border: 'none', cursor: 'pointer', gap: 8 }}
      >
        <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', textAlign: 'left' }}>{label}</span>
        {items.length > 0 && (
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', padding: '1px 8px', borderRadius: 'var(--r-pill)', flexShrink: 0 }}>
            {madeCount > 0 ? `${madeCount}/${items.length} made` : `${items.length} planned`}
          </span>
        )}
        <span style={{ color: 'rgba(255,255,255,0.6)', display: 'grid', placeItems: 'center', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }}>
          <IconChevronR size={13} />
        </span>
      </button>
      {expanded && (
        <div>
          {items.length === 0
            ? <div style={{ padding: '14px', color: 'var(--ink-400)', fontSize: 13, fontStyle: 'italic', background: 'var(--paper)' }}>Nothing planned yet</div>
            : items.map((item, i) => (
              <MealItemMobile key={item.id} item={item} checked={checkedIds.has(item.id)} onCheck={() => onCheck(item.id)} isLast={i === items.length - 1} />
            ))
          }
        </div>
      )}
    </div>
  );
};

// ── Mobile Planner Screen ─────────────────────────────────────────────────────
const MobilePlannerScreen = () => {
  const [expanded, setExpanded] = React.useState({ Dinner: true, Lunch: false, Breakfast: false, Snack: false });
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [checkedIds, setCheckedIds] = React.useState(new Set(['d4', 'b1']));

  const toggleSection = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleCheck = (id) => setCheckedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const sections = [
    { key: 'Dinner',    label: 'Dinners' },
    { key: 'Lunch',     label: 'Lunches' },
    { key: 'Breakfast', label: 'Breakfasts' },
    { key: 'Snack',     label: 'Snacks & Bakes' },
  ];

  return (
    <div style={{ height: '100%', position: 'relative', background: 'var(--bg-app)', overflow: 'hidden' }}>
      <div style={{ height: '100%', overflowY: 'auto', paddingTop: 62, boxSizing: 'border-box' }}>
        <div style={{ padding: '10px 16px 120px' }}>

          {/* Top row: wordmark + week nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <Wordmark height={20} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <button onClick={() => setWeekOffset(o => o - 1)} style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', border: '1px solid var(--ink-200)', borderRadius: 6, background: 'var(--paper)', cursor: 'pointer', color: 'var(--ink-600)' }}><IconChevronL size={12} /></button>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', minWidth: 130, textAlign: 'center' }}>{getWeekLabelMobile(weekOffset)}</span>
              <button onClick={() => setWeekOffset(o => o + 1)} style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', border: '1px solid var(--ink-200)', borderRadius: 6, background: 'var(--paper)', cursor: 'pointer', color: 'var(--ink-600)' }}><IconChevronR size={12} /></button>
            </div>
          </div>

          {/* Display heading */}
          <div style={{ marginBottom: 18 }}>
            <div className="t-eyebrow" style={{ marginBottom: 6 }}>Planner</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 52, lineHeight: 0.93, letterSpacing: '-0.04em', color: 'var(--ink-900)', margin: 0 }}>This week.</h1>
          </div>

          {/* Week notes */}
          <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--ink-100)', marginBottom: 10 }}>
            <div style={{ background: 'var(--green-700)', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="t-eyebrow" style={{ flex: 1, color: 'rgba(255,255,255,0.75)' }}>Notable this week</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.15)', padding: '1px 7px', borderRadius: 'var(--r-pill)' }}>{WEEK_NOTES.length}</span>
            </div>
            <div style={{ background: 'var(--paper)' }}>
              {WEEK_NOTES.map((note, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '10px 14px', borderBottom: i < WEEK_NOTES.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ink-300)', flexShrink: 0, marginTop: 7 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.45 }}>{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meal sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sections.map(({ key, label }) => (
              <MealSectionMobile
                key={key} label={label}
                items={PLANNER_SECTIONS_DATA[key]}
                expanded={expanded[key]}
                onToggle={() => toggleSection(key)}
                checkedIds={checkedIds}
                onCheck={toggleCheck}
              />
            ))}
          </div>
        </div>
      </div>
      <MobileTabBar active="planner" />
    </div>
  );
};

// ── Recipes data ──────────────────────────────────────────────────────────────
const MOBILE_RECIPES_DATA = [
  { id: 1,  name: 'Chicken Crust Caesar Salad Pizza',        cat: 'Lunch',     prep: 10, cook: 28,  serves: 2,  rory: false, photo: 'uploads/pizza.png',
    ingredients: [{ qty: '1', unit: 'can', name: 'canned chicken' }, { qty: '1', unit: '', name: 'egg' }, { qty: '⅓', unit: 'cup', name: 'grated parmesan' }, { qty: '1½', unit: 'cups', name: 'prepared caesar salad' }],
    instructions: ['Preheat oven to 425°F. Line a baking sheet with parchment.', 'Drain chicken well. Mix with egg, parmesan, garlic powder, salt and pepper.', 'Press into a thin circle. Bake 28–35 min until golden and firm.', 'Top cooled crust with dressed caesar salad. Serve immediately.'],
    notes: 'Drain and pat dry the chicken well for a crispy crust.' },
  { id: 2,  name: 'Sheet Pan Mini Meatloaf & Roasted Potatoes', cat: 'Dinner', prep: 15, cook: 30, serves: 4, rory: true,
    ingredients: [{ qty: '1', unit: 'lb', name: 'lean ground beef' }, { qty: '1', unit: '', name: 'egg' }, { qty: '¼', unit: 'cup', name: 'fine bread crumbs' }, { qty: '1', unit: 'lb', name: 'baby potatoes, halved' }, { qty: '2', unit: 'tbsp', name: 'olive oil' }],
    instructions: ['Preheat oven to 425°F. Line a baking sheet with parchment.', 'Combine beef, egg, breadcrumbs, onion, and ketchup. Form into 4 small loaves.', 'Toss potatoes with oil and salt on the other side of the pan.', 'Roast 28–32 min until meatloaves are cooked through and potatoes are golden.'],
    notes: 'Worth doubling — leftovers reheat well. Kids prefer ketchup; adults like BBQ.' },
  { id: 3,  name: "L'oven Fresh Garlic Knots",               cat: 'Side',     prep: 5,  cook: 15,  serves: 4,  rory: true,
    ingredients: [{ qty: '1', unit: 'pkg', name: 'refrigerated pizza dough' }, { qty: '3', unit: 'tbsp', name: 'unsalted butter, melted' }, { qty: '3', unit: 'cloves', name: 'garlic, minced' }, { qty: '2', unit: 'tbsp', name: 'fresh parsley, chopped' }],
    instructions: ['Preheat oven to 400°F.', 'Cut dough into 8 strips. Tie each into a loose knot.', 'Brush with garlic butter. Bake 12–15 min until golden.'],
    notes: "The kids love dipping these in marinara." },
  { id: 4,  name: 'Ground Chicken Alfredo Pasta',            cat: 'Dinner',   prep: 10, cook: 25,  serves: 4,  rory: true,
    ingredients: [{ qty: '1', unit: 'lb', name: 'ground chicken' }, { qty: '1', unit: 'lb', name: 'short cut pasta' }, { qty: '1', unit: 'jar', name: 'Alfredo sauce' }, { qty: '½', unit: 'cup', name: 'grated parmesan' }],
    instructions: ['Cook pasta per package. Reserve ½ cup pasta water.', 'Brown ground chicken. Season well.', 'Add sauce and pasta water. Toss with drained pasta and parmesan.'],
    notes: 'A weekly staple. Add garlic knots on the side.' },
  { id: 5,  name: 'Butter Lettuce Salad',                    cat: 'Side',     prep: 10, cook: 0,   serves: 4,  rory: false,
    ingredients: [{ qty: '1', unit: 'head', name: 'butter lettuce' }, { qty: '⅓', unit: 'cup', name: 'olive oil' }, { qty: '½', unit: 'tbsp', name: 'apple cider vinegar' }, { qty: '½', unit: 'tbsp', name: 'Dijon mustard' }],
    instructions: ['Tear lettuce into pieces.', 'Whisk oil, vinegar, Dijon, and garlic. Season with salt.', 'Dress just before serving.'],
    notes: 'Keep dressing on the side if prepping ahead.' },
  { id: 6,  name: 'Pancakes the Kids Actually Eat',          cat: 'Breakfast', prep: 10, cook: 20, serves: 4,  rory: true,
    ingredients: [{ qty: '1½', unit: 'cups', name: 'all-purpose flour' }, { qty: '2', unit: 'tsp', name: 'baking powder' }, { qty: '1', unit: '', name: 'egg' }, { qty: '1¼', unit: 'cups', name: 'whole milk' }, { qty: '2', unit: 'tbsp', name: 'melted butter' }],
    instructions: ['Whisk dry ingredients. Separately whisk egg, milk, butter.', 'Combine wet into dry. Stir until just combined — lumps are OK.', 'Cook on greased griddle over medium heat, ~2 min per side.'],
    notes: 'Add blueberries or chocolate chips to make them extra popular.' },
  { id: 7,  name: 'Grilled Skirt Steak',                     cat: 'Dinner',   prep: 5,  cook: 20,  serves: 4,  rory: false,
    ingredients: [{ qty: '2', unit: 'lb', name: 'grass-fed skirt steak' }, { qty: '2', unit: 'tbsp', name: 'olive oil' }, { qty: '', unit: '', name: 'Meatchurch Blanco seasoning' }],
    instructions: ['Season steak generously. Rest 20 min at room temp.', 'Heat grill to high. Grill 3–4 min per side for medium-rare.', 'Rest 5 min. Slice against the grain.'],
    notes: 'Best with Butter Lettuce Salad on the side.' },
  { id: 8,  name: 'Brown Butter Choc Chip Cookies',          cat: 'Dessert',  prep: 15, cook: 12,  serves: 24, rory: true,
    ingredients: [{ qty: '1', unit: 'cup', name: 'unsalted butter' }, { qty: '1', unit: 'cup', name: 'brown sugar' }, { qty: '2', unit: '', name: 'eggs' }, { qty: '2¼', unit: 'cups', name: 'all-purpose flour' }, { qty: '2', unit: 'cups', name: 'chocolate chips' }],
    instructions: ['Brown butter until nutty and golden. Cool completely.', 'Beat butter with sugars. Add eggs one at a time.', 'Mix in flour. Fold in chocolate chips.', 'Scoop on lined sheets. Bake at 375°F for 10–12 min.'],
    notes: 'The brown butter is the secret. Do not skip it.' },
  { id: 9,  name: 'Grilled Pork Spare Ribs',                 cat: 'Dinner',   prep: 10, cook: 105, serves: 6,  rory: false,
    ingredients: [{ qty: '1', unit: 'rack', name: 'pork spare ribs (~6 lb)' }, { qty: '', unit: '', name: 'dry rub of choice' }, { qty: '¼', unit: 'cup', name: 'apple cider vinegar' }, { qty: '½', unit: 'cup', name: 'barbecue sauce' }],
    instructions: ['Remove membrane. Apply dry rub generously.', 'Grill indirect at 275°F for 2.5–3 hours, spritz with ACV every 45 min.', 'Brush with BBQ sauce. Finish over direct heat 5 min per side.'],
    notes: 'Low and slow. Done when ribs bend easily and meat pulls from the bone.' },
  { id: 10, name: 'Healthier One Pot Hamburger Helper',       cat: 'Dinner',   prep: 5,  cook: 25,  serves: 6,  rory: true,
    ingredients: [{ qty: '1', unit: 'lb', name: 'lean ground beef' }, { qty: '2', unit: 'cups', name: 'short cut pasta, uncooked' }, { qty: '2', unit: 'cups', name: 'beef broth' }, { qty: '1', unit: 'cup', name: 'shredded cheddar' }],
    instructions: ['Brown beef. Drain excess fat.', 'Add pasta and broth. Bring to boil, then simmer 12–14 min.', 'Stir in cheese until melted. Serve hot.'],
    notes: 'Sneak in some spinach — kids never notice.' },
  { id: 11, name: 'Maple Trail Mix with Toasted Pecans',      cat: 'Snack',    prep: 10, cook: 5,   serves: 6,  rory: true,
    ingredients: [{ qty: '1', unit: 'cup', name: 'pecans' }, { qty: '1', unit: 'cup', name: 'almonds' }, { qty: '½', unit: 'cup', name: 'dried cranberries' }, { qty: '2', unit: 'tbsp', name: 'maple syrup' }],
    instructions: ['Toast nuts in a dry pan 3–5 min until fragrant.', 'Drizzle with maple syrup. Toss to coat. Cool completely.', 'Mix in cranberries. Store airtight up to 2 weeks.'],
    notes: 'Great for school lunches. Make a big batch Sunday.' },
  { id: 12, name: 'Cheesy Baked Tortellini Casserole',        cat: 'Dinner',   prep: 15, cook: 30,  serves: 8,  rory: true,  photo: 'uploads/tortellini bake.png',
    ingredients: [{ qty: '2', unit: 'pkg', name: 'refrigerated cheese tortellini' }, { qty: '1', unit: 'lb', name: 'ground beef' }, { qty: '1', unit: 'jar', name: 'marinara sauce' }, { qty: '2', unit: 'cups', name: 'shredded mozzarella' }],
    instructions: ['Cook tortellini. Drain.', 'Brown beef. Add marinara and simmer 10 min.', 'Mix with tortellini in a 9×13 dish. Top with mozzarella.', 'Bake at 375°F for 20–25 min until bubbly and golden.'],
    notes: 'Great for a crowd. Make ahead — add 10 min to bake time if refrigerated.' },
];

// ── Recipe detail bottom sheet ────────────────────────────────────────────────
const RecipeDetailSheet = ({ recipe, onClose }) => {
  const [visible, setVisible] = React.useState(false);

  const CAT_BG = {
    Breakfast: 'var(--yellow-50)', Lunch: 'var(--orange-50)', Dinner: 'var(--ink-50)',
    Side: 'var(--green-50)', Snack: 'var(--lime-50)', Dessert: 'var(--yellow-50)', Beverage: 'var(--ink-50)',
  };
  const foodIconMap = () => {
    try {
      return {
        Breakfast: FoodBreakfast, Lunch: FoodLunch, Dinner: FoodDinner,
        Side: FoodSide, Snack: FoodLunch, Dessert: FoodDinner, Beverage: FoodBeverage,
      };
    } catch(e) { return {}; }
  };
  const FoodIco = (foodIconMap())[recipe.cat];

  React.useEffect(() => { const t = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(t); }, []);
  const handleClose = () => { setVisible(false); setTimeout(onClose, 290); };

  return (
    <>
      {/* Backdrop */}
      <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,18,0.45)', zIndex: 30, opacity: visible ? 1 : 0, transition: 'opacity 0.25s' }} />
      {/* Sheet */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '90%',
        background: 'var(--paper)', borderRadius: '20px 20px 0 0', zIndex: 31,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Handle bar */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: 'var(--ink-200)' }} />
        </div>
        {/* Close button */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', padding: '0 14px 6px' }}>
          <button onClick={handleClose} style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: '50%', border: '1px solid var(--ink-200)', background: 'var(--paper-off)', cursor: 'pointer', color: 'var(--ink-500)', fontSize: 12 }}>✕</button>
        </div>
        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 48px' }}>
          {/* Hero */}
          {recipe.photo ? (
            <img src={recipe.photo} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10, marginBottom: 10, display: 'block' }} />
          ) : (
            <div style={{ height: 100, background: CAT_BG[recipe.cat] || 'var(--ink-50)', borderRadius: 10, display: 'grid', placeItems: 'center', marginBottom: 10 }}>
              {FoodIco && <div style={{ opacity: 0.35 }}><FoodIco size={56} /></div>}
            </div>
          )}
          {/* Category chip */}
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', background: 'var(--ink-50)', borderRadius: 4, fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--ink-700)', border: '1px solid var(--ink-100)', marginBottom: 7 }}>{recipe.cat}</span>
          {/* Title */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--ink-900)', marginBottom: 8 }}>{recipe.name}</h2>
          {/* Rory badge */}
          {recipe.rory && <div style={{ marginBottom: 10 }}><span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green-700)', background: 'var(--green-50)', padding: '2px 7px', borderRadius: 'var(--r-pill)', border: '1px solid var(--green-100)' }}>Rory ✓</span></div>}
          {/* Meta chips */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
            {[['Prep', `${recipe.prep}m`], ['Cook', `${recipe.cook}m`], ['Total', `${recipe.prep + recipe.cook}m`], ['Serves', recipe.serves]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', gap: 3, alignItems: 'center', background: 'var(--ink-50)', borderRadius: 'var(--r-sm)', padding: '3px 7px', border: '1px solid var(--ink-100)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, color: 'var(--ink-500)' }}>{l}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'var(--ink-900)' }}>{v}</span>
              </div>
            ))}
          </div>
          {/* Ingredients */}
          <div className="t-eyebrow" style={{ marginBottom: 8 }}>Ingredients</div>
          {recipe.ingredients.map((ing, i) => (
            <div key={i} style={{ display: 'flex', padding: '9px 0', borderBottom: '1px solid var(--ink-100)' }}>
              <span style={{ width: 30, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-500)', flexShrink: 0 }}>{ing.qty}</span>
              <span style={{ width: 42, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-500)', flexShrink: 0 }}>{ing.unit}</span>
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-900)' }}>{ing.name}</span>
            </div>
          ))}
          {/* Instructions */}
          <div className="t-eyebrow" style={{ marginTop: 16, marginBottom: 10 }}>Instructions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recipe.instructions.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--ink-900)', color: 'var(--bg-app)', display: 'grid', placeItems: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11 }}>{i + 1}</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: 1.55, color: 'var(--ink-800)', margin: '1px 0 0' }}>{step}</p>
              </div>
            ))}
          </div>
          {/* Notes */}
          {recipe.notes && (
            <>
              <div className="t-eyebrow" style={{ marginTop: 16, marginBottom: 6 }}>Notes</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: 1.6, color: 'var(--ink-600)', fontStyle: 'italic', margin: 0 }}>{recipe.notes}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// ── Account & Settings sheet ──────────────────────────────────────────────────
const AccountSheet = ({ onClose }) => {
  const [vis, setVis]       = React.useState(false);
  const [section, setSection] = React.useState('profile');
  React.useEffect(() => { const id = requestAnimationFrame(() => setVis(true)); return () => cancelAnimationFrame(id); }, []);
  const close = () => { setVis(false); setTimeout(onClose, 300); };

  // ── Shared toggle ────────────────────────────────────────────────────────────
  const MobToggle = ({ on, onChange }) => (
    <div onClick={() => onChange(!on)} style={{ width: 40, height: 23, borderRadius: 12, cursor: 'pointer', flexShrink: 0, background: on ? 'var(--green)' : 'var(--ink-200)', position: 'relative', transition: 'background 0.2s' }}>
      <div style={{ position: 'absolute', top: 2.5, left: on ? 19 : 2.5, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.22)', transition: 'left 0.18s' }} />
    </div>
  );

  // ── Setting row ──────────────────────────────────────────────────────────────
  const SRow = ({ label, desc, children, last }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 0', borderBottom: last ? 'none' : '1px solid var(--ink-100)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{label}</div>
        {desc && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );

  // ── Section: Profile ─────────────────────────────────────────────────────────
  const ProfileSection = () => {
    const [theme, setTheme] = React.useState(() => localStorage.getItem('hp-theme') || 'light');
    const applyTheme = (t) => {
      setTheme(t);
      document.documentElement.setAttribute('data-theme', t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t);
      localStorage.setItem('hp-theme', t);
    };
    return (
      <div style={{ padding: '0 16px 40px' }}>
        {/* Profile card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0 20px', borderBottom: '1px solid var(--ink-100)', marginBottom: 20 }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: GRAD_MOB, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#fff' }}>C</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em', color: 'var(--ink-900)', marginBottom: 2 }}>Claire</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-500)' }}>claire@homeplate.app</div>
          </div>
          <button style={{ height: 30, padding: '0 12px', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--ink-600)', cursor: 'pointer' }}>Edit</button>
        </div>
        {/* Appearance */}
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 12 }}>Appearance</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[['light','☀︎ Light'],['dark','⏾ Dark'],['system','⊙ Auto']].map(([val, lbl]) => (
            <button key={val} onClick={() => applyTheme(val)} style={{ flex: 1, height: 36, borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, background: theme === val ? 'var(--ink-900)' : 'var(--ink-50)', color: theme === val ? '#fff' : 'var(--ink-600)', outline: theme !== val ? '1px solid var(--ink-200)' : 'none' }}>{lbl}</button>
          ))}
        </div>
        {/* About */}
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 12 }}>About</div>
        <div style={{ background: 'var(--paper)', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)', padding: '4px 14px', marginBottom: 20 }}>
          <SRow label="Version" last><span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-400)' }}>HomePlate v1.2.0</span></SRow>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--green-700)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px' }}>Help &amp; feedback</button>
        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 46, border: '1px solid var(--danger)', borderRadius: 'var(--r-md)', background: 'transparent', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--danger)', cursor: 'pointer' }}>Log out</button>
      </div>
    );
  };

  // ── Section: Household ────────────────────────────────────────────────────────
  const HouseholdSection = () => {
    const COLORS = ['#2563EB','#D97757','#16A34A','#CA8A04','#7C3AED'];
    const [members, setMembers] = React.useState([
      { id: 1, name: 'Claire',  role: 'Account holder', initials: 'C', color: COLORS[0], dietary: '', approval: false },
      { id: 2, name: 'Ryan',    role: 'Parent',          initials: 'R', color: COLORS[1], dietary: '', approval: false },
      { id: 3, name: 'Rory',    role: '4 years old',     initials: 'R', color: COLORS[2], dietary: '', approval: true  },
      { id: 4, name: 'Juniper', role: '9 months',        initials: 'J', color: COLORS[3], dietary: 'Purées only', approval: false },
    ]);
    const [nextId, setNextId] = React.useState(5);
    const update = (id, patch) => setMembers(ms => ms.map(m => m.id === id ? { ...m, ...patch } : m));
    const remove = (id) => setMembers(ms => ms.filter(m => m.id !== id));
    const addMember = () => { setMembers(ms => [...ms, { id: nextId, name: 'New member', role: '', initials: 'N', color: COLORS[nextId % COLORS.length], dietary: '', approval: false }]); setNextId(n => n + 1); };

    return (
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-400)', marginBottom: 16, lineHeight: 1.5 }}>Manage family members, dietary notes, and whose meal approvals appear on recipes.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {members.map(m => (
            <div key={m.id} style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-lg)', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{m.initials}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input value={m.name} onChange={e => update(m.id, { name: e.target.value, initials: e.target.value[0]?.toUpperCase() || m.initials })}
                    style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--ink-900)', border: 'none', outline: 'none', background: 'transparent', width: '100%', padding: 0 }} />
                  <input value={m.role} onChange={e => update(m.id, { role: e.target.value })} placeholder="Role or age"
                    style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)', border: 'none', outline: 'none', background: 'transparent', width: '100%', padding: 0, marginTop: 1 }} />
                </div>
                <button onClick={() => remove(m.id)} style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', background: 'var(--ink-50)', color: 'var(--ink-400)', cursor: 'pointer', flexShrink: 0 }}>
                  <IconClose size={10} />
                </button>
              </div>
              <div style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 10 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-400)', marginBottom: 6 }}>Dietary notes</div>
                <input value={m.dietary} onChange={e => update(m.id, { dietary: e.target.value })} placeholder="e.g. No shellfish, vegetarian…"
                  style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: 13, border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', padding: '7px 10px', outline: 'none', color: 'var(--ink-900)', background: 'var(--bg-app)', marginBottom: 10 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--ink-800)' }}>Meal approval tracking</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)' }}>Show "{m.name} ✓" on approved recipes</div>
                  </div>
                  <MobToggle on={m.approval} onChange={val => update(m.id, { approval: val })} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addMember} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', border: '1.5px dashed var(--ink-200)', borderRadius: 'var(--r-md)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-500)', cursor: 'pointer' }}>
          <IconPlus size={14} /> Add member
        </button>
      </div>
    );
  };

  // ── Section: Stores ───────────────────────────────────────────────────────────
  const StoresSection = () => {
    const PALS = [
      { bg: 'var(--green-50)',  color: 'var(--green-700)',  border: 'var(--green-200)'  },
      { bg: 'var(--orange-50)', color: 'var(--orange-600)', border: 'var(--orange-100)' },
      { bg: 'oklch(90% 0.06 260)', color: 'oklch(40% 0.12 260)', border: 'oklch(82% 0.08 260)' },
      { bg: 'oklch(92% 0.06 330)', color: 'oklch(42% 0.12 330)', border: 'oklch(84% 0.08 330)' },
    ];
    const [stores, setStores] = React.useState([{ id: 'aldi', label: 'Aldi', pal: 0 }, { id: 'publix', label: 'Publix', pal: 1 }]);
    const [newName, setNewName] = React.useState('');
    const add = () => { if (!newName.trim()) return; setStores(s => [...s, { id: Date.now().toString(), label: newName.trim(), pal: s.length % PALS.length }]); setNewName(''); };
    const remove = (id) => setStores(s => s.filter(x => x.id !== id));
    return (
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-400)', marginBottom: 16, lineHeight: 1.5 }}>Stores that appear as tags on grocery list items.</div>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-lg)', padding: '4px 14px', marginBottom: 14 }}>
          {stores.length === 0 && <div style={{ padding: '14px 0', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-300)', fontStyle: 'italic' }}>No stores yet</div>}
          {stores.map((store, i) => {
            const pal = PALS[store.pal % PALS.length];
            return (
              <div key={store.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: i < stores.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 'var(--r-pill)', background: pal.bg, color: pal.color, border: `1px solid ${pal.border}`, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{store.label}</span>
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{store.label}</span>
                <button onClick={() => remove(store.id)} style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', background: 'var(--ink-50)', color: 'var(--ink-400)', cursor: 'pointer', flexShrink: 0 }}><IconClose size={10} /></button>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="New store (e.g. Costco, Trader Joe's…)"
            style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', padding: '9px 12px', outline: 'none', color: 'var(--ink-900)', background: 'var(--paper)' }} />
          <button onClick={add} style={{ height: 40, padding: '0 14px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--ink-900)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}><IconPlus size={14} /> Add</button>
        </div>
      </div>
    );
  };

  // ── Section: Planner ──────────────────────────────────────────────────────────
  const PlannerSection = () => {
    const [weekStart, setWeekStart] = React.useState('Sunday');
    const [slots, setSlots] = React.useState({ Breakfast: true, Lunch: false, Dinner: true, Sides: true, Snacks: false });
    const [reminder, setReminder] = React.useState(true);
    return (
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-lg)', padding: '4px 14px', marginBottom: 16 }}>
          <SRow label="Week starts on" desc="First day shown in planner">
            <div style={{ display: 'flex', gap: 5 }}>
              {['Sunday','Monday'].map(d => (
                <button key={d} onClick={() => setWeekStart(d)} style={{ height: 30, padding: '0 11px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, background: weekStart === d ? 'var(--ink-900)' : 'var(--ink-50)', color: weekStart === d ? '#fff' : 'var(--ink-600)', outline: weekStart !== d ? '1px solid var(--ink-200)' : 'none' }}>{d}</button>
              ))}
            </div>
          </SRow>
          <SRow label="Planning reminder" desc="Remind you to plan every Sunday">
            <MobToggle on={reminder} onChange={setReminder} />
          </SRow>
          <SRow label="Default meal slots" desc="Which slots appear each day" last>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'flex-end', maxWidth: 180 }}>
              {Object.entries(slots).map(([slot, on]) => (
                <button key={slot} onClick={() => setSlots(s => ({ ...s, [slot]: !s[slot] }))} style={{ height: 26, padding: '0 9px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, background: on ? 'var(--green-50)' : 'var(--ink-50)', color: on ? 'var(--green-700)' : 'var(--ink-500)', outline: `1px solid ${on ? 'var(--green-200)' : 'var(--ink-200)'}` }}>{slot}</button>
              ))}
            </div>
          </SRow>
        </div>
      </div>
    );
  };

  // ── Section: Tags ─────────────────────────────────────────────────────────────
  const TagsSection = () => {
    const INIT = { Dinner: ['Chicken','Ground beef','Pork','Steak','Shrimp'], Lunch: ['Chicken','Turkey','Vegetarian'], Breakfast: ['Sweet','Savory','Quick'], Side: ['Salad','Bread','Vegetable'], Snack: ['Sweet','Savory','No-cook'], Dessert: ['Chocolate','Baked','No-bake'] };
    const [groups, setGroups] = React.useState(INIT);
    const [inputs, setInputs] = React.useState({});
    const addTag = (cat) => { const t = (inputs[cat] || '').trim(); if (t) { setGroups(g => ({ ...g, [cat]: [...(g[cat]||[]), t] })); setInputs(i => ({ ...i, [cat]: '' })); } };
    const removeTag = (cat, tag) => setGroups(g => ({ ...g, [cat]: g[cat].filter(t => t !== tag) }));
    return (
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-400)', marginBottom: 16, lineHeight: 1.5 }}>Filter chips that appear in the Cookbook when browsing by category.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(groups).map(([cat, tags]) => (
            <div key={cat} style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-lg)', padding: '12px 14px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--ink-900)', marginBottom: 8 }}>{cat}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                {tags.map(tag => (
                  <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, height: 24, padding: '0 7px 0 9px', borderRadius: 'var(--r-pill)', background: 'var(--ink-50)', border: '1px solid var(--ink-100)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--ink-700)' }}>
                    {tag}
                    <button onClick={() => removeTag(cat, tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-300)', display: 'grid', placeItems: 'center', padding: 0 }}><IconClose size={9} /></button>
                  </span>
                ))}
                {tags.length === 0 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-300)', fontStyle: 'italic' }}>No tags</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={inputs[cat] || ''} onChange={e => setInputs(i => ({ ...i, [cat]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addTag(cat)} placeholder="Add a tag…"
                  style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, border: '1px solid var(--ink-200)', borderRadius: 'var(--r-sm)', padding: '5px 9px', outline: 'none', color: 'var(--ink-900)', background: 'var(--bg-app)' }} />
                <button onClick={() => addTag(cat)} style={{ height: 28, padding: '0 10px', borderRadius: 'var(--r-sm)', border: 'none', background: 'var(--ink-900)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Section: AI ───────────────────────────────────────────────────────────────
  const AISection = () => {
    const [summary,   setSummary]   = React.useState(true);
    const [protein,   setProtein]   = React.useState(true);
    const [threshold, setThreshold] = React.useState(4);
    const [recCount,  setRecCount]  = React.useState(4);
    return (
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-lg)', padding: '4px 14px' }}>
          <SRow label="Weekly AI summary" desc="Written review of your week's meals every Monday"><MobToggle on={summary} onChange={setSummary} /></SRow>
          <SRow label="Protein diversity nudge" desc="Flag weeks where you cook the same protein 3+ times"><MobToggle on={protein} onChange={setProtein} /></SRow>
          <SRow label="Re-suggest after" desc="Recommend a recipe again after N weeks off the plan">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="range" min={1} max={12} value={threshold} onChange={e => setThreshold(+e.target.value)} style={{ width: 90, accentColor: 'var(--green)', cursor: 'pointer' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: 'var(--ink-900)', minWidth: 48 }}>{threshold}w</span>
            </div>
          </SRow>
          <SRow label="Recommendations shown" desc="How many suggestions appear on the Dashboard" last>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="range" min={2} max={8} value={recCount} onChange={e => setRecCount(+e.target.value)} style={{ width: 90, accentColor: 'var(--green)', cursor: 'pointer' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: 'var(--ink-900)', minWidth: 18 }}>{recCount}</span>
            </div>
          </SRow>
        </div>
      </div>
    );
  };

  const SECTIONS = [
    { id: 'profile',  label: 'Profile'   },
    { id: 'household',label: 'Household' },
    { id: 'stores',   label: 'Stores'    },
    { id: 'planner',  label: 'Planner'   },
    { id: 'tags',     label: 'Tags'      },
    { id: 'ai',       label: 'AI'        },
  ];

  return (
    <>
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,18,0.45)', zIndex: 50, opacity: vis ? 1 : 0, transition: 'opacity 0.25s' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '95%', background: 'var(--paper)', borderRadius: '16px 16px 0 0', zIndex: 51, transform: vis ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Handle */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '8px 0 2px' }}>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: 'var(--ink-200)' }} />
        </div>
        {/* Header */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', padding: '4px 16px 10px' }}>
          <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>Settings</span>
          <button onClick={close} style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: '50%', border: '1px solid var(--ink-200)', background: 'var(--paper-off)', cursor: 'pointer', color: 'var(--ink-500)', fontSize: 12 }}>✕</button>
        </div>
        {/* Section nav */}
        <div style={{ flexShrink: 0, display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 16px 12px', borderBottom: '1px solid var(--ink-100)' }}>
          {SECTIONS.map(({ id, label }) => (
            <button key={id} onClick={() => setSection(id)} style={{ height: 28, padding: '0 11px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0, background: section === id ? 'var(--ink-900)' : 'var(--ink-50)', color: section === id ? '#fff' : 'var(--ink-600)', outline: section !== id ? '1px solid var(--ink-200)' : 'none', transition: 'background 0.1s' }}>{label}</button>
          ))}
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {section === 'profile'   && <ProfileSection />}
          {section === 'household' && <HouseholdSection />}
          {section === 'stores'    && <StoresSection />}
          {section === 'planner'   && <PlannerSection />}
          {section === 'tags'      && <TagsSection />}
          {section === 'ai'        && <AISection />}
        </div>
      </div>
    </>
  );
};

// ── Profile avatar button ─────────────────────────────────────────────────────
const ProfileAvatarBtn = ({ onPress }) => (
  <button onClick={onPress} style={{ width: 30, height: 30, borderRadius: '50%', background: GRAD_MOB, border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#fff', lineHeight: 1 }}>C</span>
  </button>
);

// ── Mobile Recipes Screen ─────────────────────────────────────────────────────
const CATS_FILTER = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Side', 'Snack', 'Dessert'];

const MobileRecipesScreen = () => {
  const [catFilter, setCatFilter]   = React.useState('All');
  const [roryFilter, setRoryFilter]   = React.useState(false);
  const [search, setSearch]           = React.useState('');
  const [selected, setSelected]       = React.useState(null);
  const [showAccount, setShowAccount] = React.useState(false);

  const CAT_BG = {
    Breakfast: 'var(--yellow-50)', Lunch: 'var(--orange-50)', Dinner: 'var(--ink-50)',
    Side: 'var(--green-50)', Snack: 'var(--lime-50)', Dessert: 'var(--yellow-50)', Beverage: 'var(--ink-50)',
  };
  const getFoodIcon = (cat) => {
    try {
      const m = { Breakfast: FoodBreakfast, Lunch: FoodLunch, Dinner: FoodDinner, Side: FoodSide, Snack: FoodLunch, Dessert: FoodDinner, Beverage: FoodBeverage };
      return m[cat] || null;
    } catch(e) { return null; }
  };

  const filtered = MOBILE_RECIPES_DATA.filter(r => {
    if (catFilter !== 'All' && r.cat !== catFilter) return false;
    if (roryFilter && !r.rory) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ height: '100%', position: 'relative', background: 'var(--bg-app)', overflow: 'hidden' }}>

      {/* Sticky header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: 62, paddingBottom: 10, paddingLeft: 14, paddingRight: 14, background: 'var(--bg-app)', borderBottom: '1px solid var(--ink-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Wordmark height={18} />
        </div>
      </div>

      <div style={{ height: '100%', overflowY: 'auto', paddingTop: 110, boxSizing: 'border-box' }}>

        {/* Display heading */}
        <div style={{ padding: '10px 16px 0', marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: 4 }}>Cookbook · {MOBILE_RECIPES_DATA.length} recipes</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 34, lineHeight: 0.95, letterSpacing: '-0.04em', color: 'var(--ink-900)', margin: 0 }}>The cookbook.</h1>
        </div>

        {/* Search bar */}
        <div style={{ margin: '0 16px 14px', background: 'var(--paper)', borderRadius: 'var(--r-xl)', height: 38, display: 'flex', alignItems: 'center', gap: 8, padding: '0 11px', border: '1px solid var(--ink-200)' }}>
          <IconSearch size={13} style={{ color: 'var(--ink-400)', flexShrink: 0 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes…"
            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-900)', background: 'transparent' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-400)', display: 'grid', placeItems: 'center', padding: 0 }}><IconClose size={12} /></button>}
        </div>

        {/* Filter chips */}
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {CATS_FILTER.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)} style={{
              height: 27, padding: '0 10px', borderRadius: 'var(--r-sm)', border: 'none',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, cursor: 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0,
              background: catFilter === cat ? 'var(--ink-900)' : 'var(--paper)',
              color: catFilter === cat ? '#fff' : 'var(--ink-700)',
              outline: catFilter !== cat ? '1px solid var(--ink-200)' : 'none',
              transition: 'background 0.1s, color 0.1s',
            }}>{cat}</button>
          ))}
          <button onClick={() => setRoryFilter(v => !v)} style={{
            height: 27, padding: '0 10px', borderRadius: 'var(--r-sm)', border: 'none',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, cursor: 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0,
            background: roryFilter ? 'var(--green-50)' : 'var(--paper)',
            color: roryFilter ? 'var(--green-700)' : 'var(--ink-700)',
            outline: `1px solid ${roryFilter ? 'var(--green-200)' : 'var(--ink-200)'}`,
          }}>Rory ✓</button>
        </div>

        {/* Recipe list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 14px 120px' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--ink-400)', fontFamily: 'var(--font-body)', fontSize: 14, fontStyle: 'italic' }}>No recipes match</div>
          )}
          {filtered.map((recipe, i) => {
            const FoodIco = getFoodIcon(recipe.cat);
            return (
              <button key={recipe.id} onClick={() => setSelected(recipe)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                width: '100%', background: 'var(--paper)', border: '1px solid var(--ink-100)',
                borderRadius: 'var(--r-lg)', cursor: 'pointer', textAlign: 'left',
                boxSizing: 'border-box',
              }}>
                {/* Thumbnail */}
                <div style={{ width: 52, height: 52, borderRadius: 10, background: CAT_BG[recipe.cat] || 'var(--ink-50)', flexShrink: 0, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                  {recipe.photo
                    ? <img src={recipe.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : FoodIco ? <FoodIco size={30} /> : null
                  }
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-400)' }}>{recipe.cat}</span>
                    {recipe.rory && <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--green-700)', background: 'var(--green-50)', padding: '1px 4px', borderRadius: 'var(--r-pill)', border: '1px solid var(--green-100)' }}>Rory ✓</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, letterSpacing: '-0.015em', color: 'var(--ink-900)', lineHeight: 1.2, marginBottom: 5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{recipe.name}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 500, color: 'var(--ink-500)' }}><IconClock size={10} /> {recipe.prep + recipe.cook}m</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 500, color: 'var(--ink-500)' }}><IconServes size={10} /> {recipe.serves}</span>
                  </div>
                </div>
                <span style={{ color: 'var(--ink-300)', flexShrink: 0 }}><IconChevronR size={12} /></span>
              </button>
            );
          })}
        </div>
      </div>

      {selected && <RecipeDetailSheet recipe={selected} onClose={() => setSelected(null)} />}

      {/* FAB — add recipe */}
      <button style={{ position: 'absolute', bottom: 90, right: 16, zIndex: 19, width: 46, height: 46, borderRadius: '50%', background: 'var(--green)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(91,166,60,0.38)', color: '#fff' }}>
        <IconPlus size={20} />
      </button>

      {showAccount && <AccountSheet onClose={() => setShowAccount(false)} />}
      <MobileTabBar active="recipes" onSettingsPress={() => setShowAccount(true)} />
    </div>
  );
};

// ── Legacy screens (kept for backward compatibility) ──────────────────────────
const MobileDashboardScreen = () => (
  <div style={{ background: 'var(--bg-app)', position: 'relative', height: '100%' }}>
    <StatusBar />
    <div style={{ padding: '8px 20px 110px', overflow: 'auto', height: 'calc(100% - 44px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Wordmark height={22} />
        <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--ink-900)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>C</div>
      </div>
      <div className="t-eyebrow">Sunday, Jun 4</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 56, letterSpacing: '-0.045em', lineHeight: .93, marginTop: 6 }}>Hey Claire.</h1>
    </div>
    <MobileTabBar active="dashboard" />
  </div>
);

const MobileGroceryScreen = () => (
  <div style={{ background: 'var(--bg-app)', position: 'relative', height: '100%' }}>
    <StatusBar />
    <div style={{ padding: '8px 20px 110px', overflow: 'auto', height: 'calc(100% - 44px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <Wordmark height={22} />
        <button style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 8, cursor: 'pointer' }}><IconSearch size={16} /></button>
      </div>
      <div className="t-eyebrow">Grocery · 35 items</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 72, letterSpacing: '-0.05em', lineHeight: .85, marginTop: 6 }}>23</h1>
    </div>
    <MobileTabBar active="grocery" />
  </div>
);

Object.assign(window, {
  StatusBar, MobileTabBar,
  MobilePlannerScreen, MobileRecipesScreen,
  MobileDashboardScreen, MobileGroceryScreen,
  MOBILE_RECIPES_DATA,
  AccountSheet, ProfileAvatarBtn,
});
