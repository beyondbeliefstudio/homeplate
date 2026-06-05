// HomePlate — Recipes / Cookbook page
// Deps (loaded before): icons.jsx, ds-foodicons.jsx, ds-logo.jsx

const GRAD = 'linear-gradient(90deg, var(--orange), var(--yellow), var(--lime), var(--green))';

const CAT_CFG = {
  Breakfast: { bg: 'var(--ink-50)', fg: 'var(--ink-600)', border: 'var(--ink-100)', Food: FoodBreakfast },
  Lunch:     { bg: 'var(--ink-50)', fg: 'var(--ink-600)', border: 'var(--ink-100)', Food: FoodLunch    },
  Dinner:    { bg: 'var(--ink-50)', fg: 'var(--ink-600)', border: 'var(--ink-100)', Food: FoodDinner   },
  Side:      { bg: 'var(--ink-50)', fg: 'var(--ink-600)', border: 'var(--ink-100)', Food: FoodSide     },
  Snack:     { bg: 'var(--ink-50)', fg: 'var(--ink-600)', border: 'var(--ink-100)', Food: FoodLunch    },
  Dessert:   { bg: 'var(--ink-50)', fg: 'var(--ink-600)', border: 'var(--ink-100)', Food: FoodDinner   },
  Beverage:  { bg: 'var(--ink-50)', fg: 'var(--ink-600)', border: 'var(--ink-100)', Food: FoodBeverage },
};

const CATS_LIST = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Side', 'Snack', 'Dessert', 'Beverage'];
const AUD_LIST  = ['Everyone', 'Adults', 'Kids'];

// Tag categories used for sub-filtering — manageable in Settings.
const TAG_GROUPS = {
  Dinner:    { label: 'Protein', tags: ['Chicken', 'Ground beef', 'Pork', 'Steak', 'Shrimp', 'Salmon'] },
  Lunch:     { label: 'Protein', tags: ['Chicken', 'Shrimp', 'Turkey', 'Vegetarian'] },
  Breakfast: { label: 'Style',   tags: ['Sweet', 'Savory', 'Quick'] },
  Side:      { label: 'Type',    tags: ['Salad', 'Bread', 'Vegetable', 'Pasta'] },
  Snack:     { label: 'Type',    tags: ['Sweet', 'Savory', 'No-cook', 'Make-ahead'] },
  Dessert:   { label: 'Type',    tags: ['Chocolate', 'Baked', 'No-bake'] },
  Beverage:  { label: 'Spirit',  tags: ['Vodka', 'Rum', 'Gin', 'Whiskey', 'Tequila', 'Non-alcoholic'] },
};

const INITIAL_RATINGS = { 1:4.5, 2:4.0, 3:4.5, 4:3.5, 5:3.0, 6:5.0, 7:4.5, 8:5.0, 9:4.0, 10:3.5, 11:3.5, 12:4.5 };
const RORY_APPROVED   = { 1:false, 2:true, 3:true, 4:true, 5:false, 6:true, 7:false, 8:true, 9:false, 10:true, 11:true, 12:true };

// ── Star rating ──────────────────────────────────────────────────────────────
const StarRating = ({ value = 0, onChange, size = 13, readonly = false, showValue = false }) => {
  const [hoverVal, setHoverVal] = React.useState(null);
  const display = hoverVal !== null ? hoverVal : value;
  const gold = 'var(--yellow-600)';
  const grey = 'var(--ink-200)';
  const fill = (i) => display >= i ? 'full' : display >= i - 0.5 ? 'half' : 'empty';
  const getVal = (e, i) => {
    const r = e.currentTarget.getBoundingClientRect();
    return e.clientX < r.left + r.width / 2 ? i - 0.5 : i;
  };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }} onMouseLeave={() => setHoverVal(null)}>
      <div style={{ display: 'flex', gap: 1 }}>
        {[1,2,3,4,5].map(i => {
          const f = fill(i);
          return (
            <span key={i}
              onMouseMove={e => { if (!readonly) setHoverVal(getVal(e, i)); }}
              onClick={e => { if (!readonly && onChange) { const v = getVal(e, i); onChange(v === value ? 0 : v); } }}
              style={{ position: 'relative', display: 'inline-block', fontSize: size, lineHeight: 1, cursor: readonly ? 'default' : 'pointer', userSelect: 'none' }}>
              <span style={{ color: grey }}>★</span>
              {f !== 'empty' && (
                <span style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: f === 'half' ? '50%' : '100%', whiteSpace: 'nowrap', color: gold }}>★</span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && value > 0 && (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: size - 1, fontWeight: 600, color: 'var(--ink-500)', letterSpacing: '-0.01em' }}>{value.toFixed(1)}</span>
      )}
    </div>
  );
};

const RECIPES = [
  {
    id: 1, name: 'Chicken Crust Caesar Salad Pizza', cat: 'Lunch', prep: 10, cook: 28, serves: 2, audience: 'adults', tags: ['Chicken', 'High-protein', 'Low-carb'], photo: 'uploads/pizza.png',
    ingredients: [
      { qty: '1',  unit: 'can',  name: 'canned chicken' },
      { qty: '1',  unit: '',     name: 'egg' },
      { qty: '⅓',  unit: 'cup',  name: 'grated parmesan cheese' },
      { qty: '1',  unit: 'tsp',  name: 'garlic powder' },
      { qty: '1',  unit: 'tsp',  name: 'red chili flakes' },
      { qty: '',   unit: '',     name: 'salt and pepper to taste' },
      { qty: '1½', unit: 'cups', name: 'prepared caesar salad' },
    ],
    instructions: [
      'Preheat oven to 425°F (220°C). Line a baking sheet with parchment paper.',
      'Drain canned chicken very well and pat dry. In a large bowl, combine chicken, egg, Parmesan, garlic powder, salt, and pepper. Mix until fully combined.',
      'Press the mixture onto the prepared baking sheet into a thin, even circle about ¼ inch thick.',
      'Bake for 28–35 minutes until golden brown and firm to the touch. Cool for 5 minutes.',
      'While the crust bakes, toss romaine with caesar dressing and Parmesan. Refrigerate until ready to serve.',
      'Top the cooled crust with dressed salad, extra Parmesan, lemon juice, and chili flakes. Slice and serve immediately.',
    ],
    nutrition: { kcal: 522, protein: 49, carbs: 10, fat: 31, fiber: 1 },
    notes: 'High protein, low carb, gluten-free viral recipe. Make sure to drain and pat dry the canned chicken very well for a crispy crust. Serve immediately after topping with salad to maintain crust crispiness.',
  },
  {
    id: 2, name: 'Sheet Pan Mini Meatloaf and Roasted Potatoes', cat: 'Dinner', prep: 15, cook: 30, serves: 4, audience: 'everyone', tags: ['Ground beef', 'Sheet pan', 'Kid-friendly'],
    ingredients: [
      { qty: '1',  unit: 'lb',   name: 'lean ground beef' },
      { qty: '1',  unit: '',     name: 'egg' },
      { qty: '¼',  unit: 'cup',  name: 'fine bread crumbs' },
      { qty: '½',  unit: 'cup',  name: 'finely chopped onion' },
      { qty: '¼',  unit: 'cup',  name: 'ketchup or barbecue sauce' },
      { qty: '1',  unit: 'lb',   name: 'baby potatoes, halved' },
      { qty: '2',  unit: 'tbsp', name: 'olive oil' },
      { qty: '',   unit: '',     name: 'salt and pepper' },
    ],
    instructions: [
      'Preheat oven to 425°F (220°C). Line a baking sheet with parchment.',
      'In a large bowl, combine beef, egg, breadcrumbs, onion, and ketchup. Mix until just combined.',
      'Form into 4 small loaves on one side of the pan. Toss potatoes with oil and salt on the other side.',
      'Roast 28–32 minutes until meatloaves are cooked through and potatoes are golden and crisp.',
    ],
    nutrition: { kcal: 480, protein: 32, carbs: 28, fat: 22, fiber: 3 },
    notes: 'Worth doubling — leftovers reheat well in the toaster oven. The kids prefer ketchup glaze; adults like BBQ.',
  },
  {
    id: 3, name: "L'oven Fresh Garlic Knots", cat: 'Side', prep: 5, cook: 15, serves: 4, audience: 'kids', tags: ['Bread', 'Kid-friendly', 'Quick'],
    ingredients: [
      { qty: '1',  unit: 'pkg',    name: 'refrigerated pizza dough' },
      { qty: '3',  unit: 'tbsp',   name: 'unsalted butter, melted' },
      { qty: '3',  unit: 'cloves', name: 'garlic, minced' },
      { qty: '2',  unit: 'tbsp',   name: 'fresh parsley, chopped' },
    ],
    instructions: [
      'Preheat oven to 400°F. Line a baking sheet with parchment.',
      'Cut dough into 8 strips. Tie each into a loose knot and place on the sheet.',
      'Mix butter with garlic. Brush generously over each knot.',
      'Bake 12–15 min until golden. Brush with remaining garlic butter and sprinkle parsley.',
    ],
    nutrition: { kcal: 190, protein: 5, carbs: 32, fat: 5, fiber: 1 },
    notes: "Store-bought pizza dough makes these dead easy. The kids love dipping them in marinara.",
  },
  { id: 4,  name: 'Ground Chicken Alfredo Pasta',                          cat: 'Dinner',    prep: 10, cook: 25,  serves: 4,  audience: 'everyone', tags: ['Chicken', 'Pasta', 'Quick'], ingredients: [{ qty: '1', unit: 'lb',  name: 'ground chicken' }, { qty: '1', unit: 'lb', name: 'short cut pasta' }, { qty: '1', unit: 'jar', name: 'Alfredo sauce' }, { qty: '½', unit: 'cup', name: 'grated parmesan' }], instructions: ['Cook pasta per package directions. Reserve ½ cup pasta water.', 'Brown ground chicken. Season well.', 'Add sauce and pasta water. Toss with drained pasta and parmesan.'], nutrition: { kcal: 510, protein: 38, carbs: 48, fat: 18, fiber: 2 }, notes: 'A weekly staple. Add garlic knots on the side.' },
  { id: 5,  name: 'Butter Lettuce Salad with Apple Cider Vinegar Dressing', cat: 'Side',     prep: 10, cook: 0,   serves: 4,  audience: 'adults',   tags: ['Salad', 'Vegetarian', 'Quick'], ingredients: [{ qty: '1', unit: 'head', name: 'butter lettuce' }, { qty: '⅓', unit: 'cup', name: 'olive oil' }, { qty: '½', unit: 'tbsp', name: 'Dijon mustard' }, { qty: '½', unit: 'tbsp', name: 'apple cider vinegar' }], instructions: ['Tear lettuce into pieces.', 'Whisk oil, vinegar, mustard, garlic. Season with salt.', 'Dress just before serving.'], nutrition: { kcal: 95, protein: 2, carbs: 6, fat: 7, fiber: 2 }, notes: 'Keep dressing on the side if prepping ahead.' },
  { id: 6,  name: 'Pancakes the Kids Actually Eat',                         cat: 'Breakfast', prep: 10, cook: 20,  serves: 4,  audience: 'kids',     tags: ['Sweet', 'Kid-friendly', 'Quick'], ingredients: [{ qty: '1½', unit: 'cups', name: 'all-purpose flour' }, { qty: '2', unit: 'tsp', name: 'baking powder' }, { qty: '1', unit: '', name: 'egg' }, { qty: '1¼', unit: 'cups', name: 'whole milk' }, { qty: '2', unit: 'tbsp', name: 'melted butter' }], instructions: ['Whisk dry ingredients. Separately whisk egg, milk, butter.', 'Combine wet into dry. Stir until just combined — lumps OK.', 'Cook on greased griddle over medium heat, ~2 min per side.'], nutrition: { kcal: 340, protein: 8, carbs: 52, fat: 11, fiber: 2 }, notes: 'Add blueberries or chocolate chips to make them extra popular.' },
  { id: 7,  name: 'Grilled Skirt Steak',                                    cat: 'Dinner',    prep: 5,  cook: 20,  serves: 4,  audience: 'adults',   tags: ['Steak', 'Grilled', 'High-protein'], ingredients: [{ qty: '2', unit: 'lb', name: 'grass-fed skirt steak' }, { qty: '2', unit: 'tbsp', name: 'olive oil' }, { qty: '', unit: '', name: 'Meatchurch Blanco seasoning' }], instructions: ['Season steak generously. Rest 20 min at room temp.', 'Heat grill to high. Grill 3–4 min per side for medium-rare.', 'Rest 5 min. Slice against the grain.'], nutrition: { kcal: 420, protein: 48, carbs: 2, fat: 24, fiber: 0 }, notes: 'Best with Buttered Parmesan Pasta on the side.' },
  { id: 8,  name: 'Brown Butter Chocolate Chip Cookies',                    cat: 'Dessert',   prep: 15, cook: 12,  serves: 24, audience: 'everyone', tags: ['Chocolate', 'Baked', 'Kid-friendly'], ingredients: [{ qty: '1', unit: 'cup', name: 'unsalted butter' }, { qty: '1', unit: 'cup', name: 'brown sugar' }, { qty: '2', unit: '', name: 'eggs' }, { qty: '2¼', unit: 'cups', name: 'all-purpose flour' }, { qty: '2', unit: 'cups', name: 'chocolate chips' }], instructions: ['Brown butter until nutty and golden. Cool completely.', 'Beat butter with sugars. Add eggs one at a time.', 'Mix in flour. Fold in chocolate chips.', 'Scoop on lined sheets. Bake at 375°F for 10–12 min.'], nutrition: { kcal: 180, protein: 2, carbs: 24, fat: 9, fiber: 1 }, notes: 'The brown butter is the secret. Do not skip it.' },
  { id: 9,  name: 'Grilled Pork Spare Ribs',                                cat: 'Dinner',    prep: 10, cook: 105, serves: 6,  audience: 'everyone', tags: ['Pork', 'Grilled', 'Weekend'], ingredients: [{ qty: '1', unit: 'rack', name: 'pork spare ribs (~6 lb)' }, { qty: '', unit: '', name: 'dry rub of choice' }, { qty: '¼', unit: 'cup', name: 'apple cider vinegar' }, { qty: '½', unit: 'cup', name: 'barbecue sauce' }], instructions: ['Remove membrane. Apply dry rub generously.', 'Grill indirect at 275°F, bone-side down. Smoke 2.5–3 hours, spritzing with ACV every 45 min.', 'Brush with BBQ sauce. Finish over direct heat 5 min per side.'], nutrition: { kcal: 580, protein: 44, carbs: 8, fat: 42, fiber: 0 }, notes: 'Low and slow. Done when ribs bend easily and meat pulls from the bone.' },
  { id: 10, name: 'Healthier One Pot Hamburger Helper',                      cat: 'Dinner',    prep: 5,  cook: 25,  serves: 6,  audience: 'kids',     tags: ['Ground beef', 'One-pot', 'Kid-friendly'], ingredients: [{ qty: '1', unit: 'lb', name: 'lean ground beef' }, { qty: '2', unit: 'cups', name: 'short cut pasta, uncooked' }, { qty: '2', unit: 'cups', name: 'beef broth' }, { qty: '1', unit: 'cup', name: 'shredded cheddar' }], instructions: ['Brown beef. Drain excess fat.', 'Add pasta and broth. Bring to boil then simmer 12–14 min.', 'Stir in cheese until melted. Serve hot.'], nutrition: { kcal: 380, protein: 28, carbs: 38, fat: 14, fiber: 3 }, notes: 'Sneak in some spinach. Kids never notice.' },
  { id: 11, name: 'Maple Trail Mix with Toasted Pecans',                    cat: 'Snack',     prep: 10, cook: 5,   serves: 6,  audience: 'everyone', tags: ['Sweet', 'No-cook', 'Make-ahead'], ingredients: [{ qty: '1', unit: 'cup', name: 'pecans' }, { qty: '1', unit: 'cup', name: 'almonds' }, { qty: '½', unit: 'cup', name: 'dried cranberries' }, { qty: '2', unit: 'tbsp', name: 'maple syrup' }], instructions: ['Toast nuts in a dry pan 3–5 min until fragrant.', 'Drizzle with maple syrup. Toss to coat. Cool completely.', 'Mix in cranberries. Store airtight up to 2 weeks.'], nutrition: { kcal: 220, protein: 4, carbs: 18, fat: 16, fiber: 3 }, notes: 'Great for school lunches. Make a big batch Sunday.' },
  { id: 12, name: 'Cheesy Baked Tortellini Casserole with Meat Sauce',      cat: 'Dinner',    prep: 15, cook: 30,  serves: 8,  audience: 'everyone', photo: 'uploads/tortellini bake.png', tags: ['Ground beef', 'Pasta', 'Kid-friendly', 'Make-ahead'], ingredients: [{ qty: '2', unit: 'pkg', name: 'refrigerated cheese tortellini' }, { qty: '1', unit: 'lb', name: 'ground beef' }, { qty: '1', unit: 'jar', name: 'marinara sauce' }, { qty: '2', unit: 'cups', name: 'shredded mozzarella' }], instructions: ['Cook tortellini. Drain.', 'Brown beef. Add marinara and simmer 10 min.', 'Mix tortellini with meat sauce in a 9×13 dish. Top with mozzarella.', 'Bake at 375°F for 20–25 min until bubbly and golden.'], nutrition: { kcal: 510, protein: 28, carbs: 44, fat: 22, fiber: 4 }, notes: 'Great for a crowd. Make ahead and refrigerate — add 10 min to bake time.' },
];

// ── Sidebar ──────────────────────────────────────────────────────────────────
const RecipesSidebar = () => (
  <aside style={{
    width: 220, flexShrink: 0, background: 'var(--sidebar)',
    borderRight: 'none', display: 'flex',
    flexDirection: 'column', padding: '24px 16px',
    height: '100vh', position: 'sticky', top: 0,
  }}>
    <SidebarLogo />
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[
        { label: 'Dashboard', Icon: IconHome,     href: 'Dashboard.html' },
        { label: 'Recipes',   Icon: IconRecipes,  href: 'Recipes.html', active: true },
        { label: 'Planner',   Icon: IconPlanner,  href: 'Planner.html'   },
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

// ── Recipe card — grid view ──────────────────────────────────────────────────
const RecipeCard = ({ recipe, onClick, rating = 0 }) => {
  const cfg = CAT_CFG[recipe.cat] || CAT_CFG.Dinner;
  const FoodIcon = cfg.Food;
  const roryOk = RORY_APPROVED[recipe.id];
  return (
    <div
      onClick={() => onClick(recipe)}
      style={{
        background: 'var(--paper)', borderRadius: 'var(--r-xl)',
        border: '1px solid var(--ink-100)', overflow: 'hidden',
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
    >
      {/* Photo / icon fallback */}
      <div style={{ position: 'relative', height: 160, overflow: 'hidden', flexShrink: 0 }}>
        {recipe.photo ? (
          <img
            src={recipe.photo} alt={recipe.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ opacity: 0.38 }}>
              <FoodIcon size={80} />
            </div>
          </div>
        )}
        {/* Category chip — solid white overlay */}
        <span style={{
          position: 'absolute', top: 10, left: 10, pointerEvents: 'none',
          display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px',
          borderRadius: 'var(--r-sm)', background: 'var(--paper)',
          border: '1px solid var(--ink-100)', boxShadow: 'var(--shadow-1)',
        }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--ink-800)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{recipe.cat}</span>
        </span>
      </div>
      {/* Title */}
      <div style={{ padding: '14px 16px 10px', flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, lineHeight: 1.15, letterSpacing: '-0.015em', textWrap: 'balance', color: 'var(--ink-900)' }}>
          {recipe.name}
        </div>
        {rating > 0 && (
          <div style={{ marginTop: 7 }}>
            <StarRating value={rating} size={12} readonly showValue />
          </div>
        )}
      </div>
      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--ink-100)', background: 'var(--paper-off)',
        padding: '10px 16px', display: 'flex', alignItems: 'center',
        gap: 12, color: 'var(--ink-500)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500 }}>
          <IconClock size={12} /> {recipe.prep + recipe.cook}m
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500 }}>
          <IconServes size={12} /> {recipe.serves}
        </span>
        {roryOk && (
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 600,
            color: 'var(--green-700)', background: 'var(--green-50)',
            padding: '2px 8px', borderRadius: 'var(--r-pill)',
            border: '1px solid var(--green-100)',
          }}>Rory ✓</span>
        )}
      </div>
    </div>
  );
};

// ── Recipe row — list view ───────────────────────────────────────────────────
const RecipeRow = ({ recipe, onClick, rating = 0 }) => {
  const cfg = CAT_CFG[recipe.cat] || CAT_CFG.Dinner;
  const FoodIcon = cfg.Food;
  const roryOk = RORY_APPROVED[recipe.id];
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={() => onClick(recipe)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--paper-off)' : 'var(--paper)',
        borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)',
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        gap: 16, cursor: 'pointer', transition: 'background 0.12s',
      }}
    >
      <div style={{ width: 50, height: 50, borderRadius: 'var(--r-md)', background: cfg.bg, flexShrink: 0, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <FoodIcon size={34} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cfg.fg }}>{recipe.cat}</span>
          {rating > 0 && <StarRating value={rating} size={11} readonly showValue />}
          {roryOk && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: 'var(--green-700)', background: 'var(--green-50)',
              padding: '2px 8px', borderRadius: 'var(--r-pill)',
              border: '1px solid var(--green-100)',
            }}>Rory ✓</span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {recipe.name}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, color: 'var(--ink-500)', flexShrink: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}><IconClock size={13} /> {recipe.prep + recipe.cook}m</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}><IconServes size={13} /> {recipe.serves}</span>
      </div>
      <div style={{ color: 'var(--ink-300)', flexShrink: 0 }}><IconChevronR size={16} /></div>
    </div>
  );
};

// ── Recipe detail slide-over ─────────────────────────────────────────────────
const DetailPanel = ({ recipe, onClose, rating = 0, onRate }) => {
  const cfg = CAT_CFG[recipe.cat] || CAT_CFG.Dinner;
  const roryOk = RORY_APPROVED[recipe.id];
  const total = recipe.prep + recipe.cook;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      {/* Sticky header */}
      <div style={{
        padding: '18px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid var(--ink-100)',
        position: 'sticky', top: 0, background: 'var(--paper)', zIndex: 1,
      }}>
        <button
          onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink-600)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}
        >
          <IconChevronL size={16} /> Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="Add Recipe.html" style={{ textDecoration: 'none' }}>
            <button className="btn btn-ghost btn-sm" style={{ gap: 6, fontSize: 13 }}><IconEdit size={14} /> Edit</button>
          </a>
          <button className="btn btn-sm" style={{ background: 'var(--ink-50)', color: 'var(--ink-500)', border: '1px solid var(--ink-200)', width: 34, padding: 0 }}>
            <IconTrash size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 48px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px',
          borderRadius: 'var(--r-sm)', background: cfg.bg, color: cfg.fg,
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12,
        }}>{recipe.cat}</span>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 28, lineHeight: 1.06, letterSpacing: '-0.025em', color: 'var(--ink-900)', marginBottom: 12 }}>
          {recipe.name}
        </h2>

        {/* Rating — read-only; edit to change */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <StarRating value={rating} size={22} readonly showValue={rating > 0} />
          {rating === 0 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-400)' }}>Not yet rated</span>}
        </div>

        {/* Rory-approved */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-500)' }}>Rory-approved</span>
          {roryOk ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px',
              borderRadius: 'var(--r-pill)', fontSize: 11, fontWeight: 600,
              color: 'var(--green-700)', background: 'var(--green-50)',
              border: '1px solid var(--green-100)',
            }}>✓ Yes</span>
          ) : (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-400)' }}>Not yet</span>
          )}
        </div>

        {/* Meta chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
          {[['Prep', `${recipe.prep}m`], ['Cook', `${recipe.cook}m`], ['Total', `${total}m`], ['Serves', recipe.serves]].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--ink-50)', borderRadius: 'var(--r-sm)', padding: '5px 11px', border: '1px solid var(--ink-100)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--ink-500)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--ink-900)' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        {recipe.ingredients.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div className="t-eyebrow" style={{ marginBottom: 10 }}>Ingredients</div>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid var(--ink-100)', alignItems: 'center' }}>
                <span style={{ width: 52, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-500)', flexShrink: 0 }}>{ing.qty}</span>
                <span style={{ width: 64, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-500)', flexShrink: 0 }}>{ing.unit}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-900)', flex: 1 }}>{ing.name}</span>
              </div>
            ))}
          </section>
        )}

        {/* Instructions */}
        {recipe.instructions.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div className="t-eyebrow" style={{ marginBottom: 14 }}>Instructions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recipe.instructions.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--ink-900)', color: 'var(--bg-app)', display: 'grid', placeItems: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>{i + 1}</div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.65, color: 'var(--ink-800)', margin: '2px 0 0' }}>{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nutrition */}
        {recipe.nutrition && (
          <section style={{ marginBottom: 28 }}>
            <div className="t-eyebrow" style={{ marginBottom: 10 }}>
              Nutrition <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink-400)', fontSize: 11 }}>per serving</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {[['kcal', 'Calories'], ['protein', 'Protein'], ['carbs', 'Carbs'], ['fat', 'Fat'], ['fiber', 'Fiber']].map(([key, label]) => (
                <div key={label} style={{ background: 'var(--ink-50)', borderRadius: 'var(--r-md)', padding: '12px 6px', textAlign: 'center', border: '1px solid var(--ink-100)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>
                    {recipe.nutrition[key]}{key !== 'kcal' ? 'g' : ''}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        {recipe.notes && (
          <section>
            <div className="t-eyebrow" style={{ marginBottom: 10 }}>Notes</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-600)', fontStyle: 'italic', margin: 0 }}>
              {recipe.notes}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

// ── Main app ─────────────────────────────────────────────────────────────────
const RecipesApp = () => {
  const [view,      setView]      = React.useState('grid');
  const [catFilter, setCatFilter] = React.useState('All');
  const [tagFilter,  setTagFilter]  = React.useState(null);
  const [roryFilter, setRoryFilter] = React.useState(false);

  const handleCatFilter = (cat) => { setCatFilter(cat); setTagFilter(null); };

  const availableTags = React.useMemo(() => {
    if (catFilter === 'All' || !TAG_GROUPS[catFilter]) return [];
    const inCat = RECIPES.filter(r => r.cat === catFilter);
    const present = new Set(inCat.flatMap(r => r.tags || []));
    return TAG_GROUPS[catFilter].tags.filter(t => present.has(t));
  }, [catFilter]);
  const [search,    setSearch]    = React.useState('');
  const [selected,  setSelected]  = React.useState(null);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [ratings,   setRatings]   = React.useState(INITIAL_RATINGS);
  const updateRating = (id, val) => setRatings(prev => ({ ...prev, [id]: val }));

  const filtered = React.useMemo(() => RECIPES.filter(r => {
    if (catFilter !== 'All' && r.cat !== catFilter) return false;
    if (tagFilter && !(r.tags || []).includes(tagFilter)) return false;
    if (roryFilter && !RORY_APPROVED[r.id]) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [catFilter, tagFilter, roryFilter, search]);

  const openRecipe = (recipe) => {
    setSelected(recipe);
    requestAnimationFrame(() => setPanelOpen(true));
  };
  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelected(null), 300);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      <RecipesSidebar />

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Page header */}
        <div style={{ padding: '32px 40px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 6 }}>Cookbook · {RECIPES.length} recipes</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.03em', color: 'var(--ink-900)', margin: 0 }}>
              The cookbook.
            </h1>
          </div>
          <a href="Add Recipe.html" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary btn-lg"><IconPlus size={18} /> Add recipe</button>
          </a>
        </div>

        {/* Search bar + view toggle */}
        <div style={{ padding: '22px 40px 0' }}>
          <div style={{ background: 'var(--paper)', borderRadius: 'var(--r-2xl)', height: 56, padding: '0 18px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--ink-200)' }}>
            <IconSearch size={20} style={{ color: 'var(--ink-400)', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search recipes, ingredients, audience…"
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-900)', background: 'transparent' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-400)', display: 'grid', placeItems: 'center' }}>
                <IconClose size={16} />
              </button>
            )}
            <div style={{ width: 1, height: 22, background: 'var(--ink-200)', margin: '0 4px' }} />
            <div style={{ display: 'inline-flex', background: 'var(--ink-50)', borderRadius: 'var(--r-sm)', padding: 3, gap: 2 }}>
              {[['grid', IconGrid], ['list', IconList]].map(([v, Ico]) => (
                <button key={v} onClick={() => setView(v)} style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', borderRadius: 6, border: 'none', cursor: 'pointer', background: view === v ? 'var(--ink-900)' : 'transparent', color: view === v ? 'var(--bg-app)' : 'var(--ink-500)', transition: 'background 0.12s' }}>
                  <Ico size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ padding: '14px 40px 0', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATS_LIST.map(cat => (
              <button
                key={cat}
                onClick={() => handleCatFilter(cat)}
                style={{
                  height: 34, padding: '0 14px', borderRadius: 'var(--r-sm)', border: 'none',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12,
                  cursor: 'pointer', letterSpacing: '-0.003em',
                  background: catFilter === cat ? 'var(--ink-900)' : 'var(--paper)',
                  color:      catFilter === cat ? 'var(--bg-app)'  : 'var(--ink-700)',
                  outline: catFilter !== cat ? '1px solid var(--ink-200)' : 'none',
                  transition: 'background 0.12s, color 0.12s',
                }}
              >{cat}</button>
            ))}
          </div>
          <div style={{ width: 1, height: 22, background: 'var(--ink-200)', flexShrink: 0 }} />
          <button
            onClick={() => setRoryFilter(v => !v)}
            style={{
              height: 34, padding: '0 14px', borderRadius: 'var(--r-sm)', border: 'none',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              background: roryFilter ? 'var(--green-50)' : 'var(--paper)',
              color:      roryFilter ? 'var(--green-700)' : 'var(--ink-700)',
              outline: `1px solid ${roryFilter ? 'var(--green-200)' : 'var(--ink-200)'}`,
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            {roryFilter && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />}
            Rory-approved
          </button>
        </div>

        {/* Sub-filter tag row */}
        {availableTags.length > 0 && (
          <div style={{ padding: '8px 40px 0', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--ink-400)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 2 }}>
              {TAG_GROUPS[catFilter]?.label}
            </span>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(t => t === tag ? null : tag)}
                style={{
                  height: 28, padding: '0 12px', borderRadius: 'var(--r-pill)', border: 'none',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, cursor: 'pointer',
                  background: tagFilter === tag ? 'var(--orange-50)' : 'var(--paper)',
                  color:      tagFilter === tag ? 'var(--orange-700)' : 'var(--ink-600)',
                  outline:    `1px solid ${tagFilter === tag ? 'var(--orange-200)' : 'var(--ink-200)'}`,
                  transition: 'background 0.1s, color 0.1s',
                }}
              >{tag}</button>
            ))}
            {tagFilter && (
              <button onClick={() => setTagFilter(null)}
                style={{ height: 28, padding: '0 10px', borderRadius: 'var(--r-pill)', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-400)', textDecoration: 'underline' }}>
                Clear
              </button>
            )}
          </div>
        )}

        {/* Recipe grid / list */}
        <div style={{ padding: '20px 40px 48px', flex: 1 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-400)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink-300)', marginBottom: 8 }}>No recipes found</div>
              <div style={{ fontSize: 14 }}>Try adjusting your filters or search</div>
            </div>
          )}
          {view === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {filtered.map(r => <RecipeCard key={r.id} recipe={r} onClick={openRecipe} rating={ratings[r.id] || 0} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map(r => <RecipeRow key={r.id} recipe={r} onClick={openRecipe} rating={ratings[r.id] || 0} />)}
            </div>
          )}
        </div>
      </main>

      {/* Slide-over backdrop */}
      {selected && (
        <div
          onClick={closePanel}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(14,18,18,0.35)',
            zIndex: 40, opacity: panelOpen ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}

      {/* Slide-over panel */}
      {selected && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 560,
          background: 'var(--paper)', zIndex: 50, overflow: 'hidden',
          boxShadow: '-4px 0 40px rgba(14,18,18,0.14)',
          transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
          display: 'flex', flexDirection: 'column',
        }}>
          <DetailPanel recipe={selected} onClose={closePanel} rating={ratings[selected.id] || 0} onRate={v => updateRating(selected.id, v)} />
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<RecipesApp />);
