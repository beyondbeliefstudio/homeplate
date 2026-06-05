// HomePlate v2 mobile screens

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

const MobileTabBar = ({ active = 'dashboard' }) => {
  const tabs = [
    ['dashboard', IconHome,    'Home'],
    ['planner',  IconPlanner, 'Planner'],
    ['recipes',  IconRecipes, 'Recipes'],
    ['grocery',  IconGrocery, 'Grocery'],
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 16, left: 12, right: 12, padding: '8px 8px',
      background: 'var(--paper)', borderRadius: 28, boxShadow: 'var(--shadow-2)',
      display: 'flex', justifyContent: 'space-around', border: '1px solid var(--ink-100)',
    }}>
      {tabs.map(([id, Ico, label]) => {
        const on = id === active;
        return (
          <div key={id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 12px',
            borderRadius: 16, background: on ? 'var(--ink-900)' : 'transparent',
            color: on ? '#fff' : 'var(--ink-500)', minWidth: 64,
          }}>
            <Ico size={20}/>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.02em' }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

const MobilePlannerScreen = () => (
  <div className="hp" style={{ background: 'var(--bg-app)', position: 'relative' }}>
    <StatusBar />
    <div style={{ padding: '8px 20px 110px', overflow: 'auto', height: 'calc(100% - 44px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <Wordmark height={22} />
        <button className="btn btn-icon btn-sm" style={{ background: 'var(--paper)', border: '1px solid var(--ink-200)' }}><IconShare size={16}/></button>
      </div>

      <div className="t-eyebrow">Week of May 24</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 56, letterSpacing: '-0.04em', lineHeight: .95, marginTop: 6, marginBottom: 18 }}>
        This week's<br/>lineup.
      </h1>

      <div style={{ background: 'var(--hot)', color: '#fff', borderRadius: 22, padding: 20, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
        <div className="t-eyebrow" style={{ color: 'var(--hot-100)' }}>Dinners this week</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 76, lineHeight: .9, fontWeight: 700, letterSpacing: '-0.05em' }}>0/4</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em' }}>made.</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.25)' }}/>)}
        </div>
      </div>

      <div className="card-out" style={{ padding: 18, marginBottom: 12 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--hot)', color: '#fff', display: 'grid', placeItems: 'center' }}><IconDinner size={18}/></div>
          <h3 className="t-h3" style={{ fontSize: 22 }}>Dinners</h3>
          <span className="chip" style={{ height: 22, marginLeft: 'auto' }}>4</span>
        </header>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Grilled Pork Spare Ribs','Sweet Corn · Butter Lettuce','everyone','var(--hot)'],
            ['Grilled Skirt Steak','Buttered Parmesan Pasta','adults','var(--ink-900)'],
            ['Ground Chicken Alfredo',"L'oven Fresh Garlic Knots",'everyone','var(--leaf)'],
            ['Sheet Pan Mini Meatloaf','Roasted Potatoes','kids','var(--sun)'],
          ].map(([n, s, a, c]) => (
            <div key={n} style={{ background: 'var(--bg-app-warm)', borderRadius: 14, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, border: '1.75px solid var(--ink-300)', flex: '0 0 auto' }}/>
              <div style={{ width: 4, height: 32, borderRadius: 2, background: c }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, lineHeight: 1.1, letterSpacing: '-0.025em' }}>{n}</div>
                <div className="t-caption" style={{ marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</div>
              </div>
              <span className={'chip ' + (a==='kids'?'chip-sun':a==='everyone'?'chip-hot':'')} style={{ height: 22, padding: '0 8px', fontSize: 11 }}>
                {a==='adults'?'Adults':a==='kids'?'Kids':'All'}
              </span>
            </div>
          ))}
        </div>
        <button className="t-label" style={{ color: 'var(--hot)', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 14 }}><IconPlus size={16}/> Add dinner</button>
      </div>

      {[
        [IconLunch,'Lunches','var(--leaf-50)','var(--leaf-700)'],
        [IconBreakfast,'Breakfasts','var(--sun-50)','var(--sun-700)'],
        [IconSnack,'Snacks & Bakes','var(--orange-100)','var(--orange)'],
      ].map(([Ico, title, bg, tint]) => (
        <div key={title} className="card-out" style={{ padding: 18, marginBottom: 12 }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, color: tint, display: 'grid', placeItems: 'center' }}><Ico size={18}/></div>
            <h3 className="t-h3" style={{ fontSize: 22 }}>{title}</h3>
            <span className="chip" style={{ height: 22, marginLeft: 'auto' }}>0</span>
            <IconChevronD size={16} style={{ color: 'var(--ink-500)' }}/>
          </header>
        </div>
      ))}
    </div>
    <MobileTabBar active="planner" />
  </div>
);

const MobileGroceryScreen = () => (
  <div className="hp" style={{ background: 'var(--bg-app)', position: 'relative' }}>
    <StatusBar />
    <div style={{ padding: '8px 20px 110px', overflow: 'auto', height: 'calc(100% - 44px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <Wordmark height={22} />
        <button className="btn btn-icon btn-sm" style={{ background: 'var(--paper)', border: '1px solid var(--ink-200)' }}><IconSearch size={16}/></button>
      </div>

      <div className="t-eyebrow">Week of May 24 · 35 items</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 6, marginBottom: 18 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 96, letterSpacing: '-0.05em', lineHeight: .85 }}>23</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em', paddingBottom: 12 }}>to grab.</span>
      </div>

      <div className="card-out" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="t-label">12 of 35 got</span>
          <span className="t-caption tabular">34%</span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: 'var(--ink-50)', overflow: 'hidden', marginTop: 8 }}>
          <div style={{ width: '34%', height: '100%', background: 'var(--leaf)' }}/>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflow: 'auto' }}>
        {[['Any', true],['Aldi'],['Publix'],['Target']].map(([s, on]) => (
          <span key={s} className={'chip ' + (on?'chip-hot':'')} style={{ height: 32, flex: '0 0 auto' }}>{s}</span>
        ))}
      </div>

      <div className="card-out" style={{ padding: 16, marginBottom: 12 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--leaf-700)' }}/>
          <span className="t-eyebrow" style={{ color: 'var(--leaf-700)' }}>Produce</span>
          <span style={{ flex: 1, height: 1, background: 'var(--ink-100)', marginLeft: 6 }}/>
          <span className="t-caption">6</span>
        </header>
        {[
          ['1 lb baby potatoes, halved', 'Aldi', true],
          ['3 cups broccoli florets', null, false],
          ['1 head butter lettuce', null, false],
          ['4 ears fresh sweet corn', 'Aldi', false],
          ['½ medium onion', null, false],
        ].map(([n, store, checked], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderTop: i===0?'none':'1px solid var(--ink-100)' }}>
            {checked
              ? <div style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--leaf)', display: 'grid', placeItems: 'center', color: '#fff' }}><IconCheck size={13}/></div>
              : <div style={{ width: 22, height: 22, borderRadius: 7, border: '1.75px solid var(--ink-300)' }}/>
            }
            <span className="t-body-sm" style={{ flex: 1, color: checked?'var(--ink-300)':'var(--ink-900)', textDecoration: checked?'line-through':'none' }}>{n}</span>
            {store && <span className="chip" style={{ height: 22, padding: '0 8px', fontSize: 11, background: 'var(--hot-50)', color: 'var(--hot)' }}>{store}</span>}
          </div>
        ))}
      </div>

      <div className="card-out" style={{ padding: 16, marginBottom: 12 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--hot)' }}/>
          <span className="t-eyebrow" style={{ color: 'var(--hot)' }}>Meat &amp; Seafood</span>
          <span style={{ flex: 1, height: 1, background: 'var(--ink-100)', marginLeft: 6 }}/>
          <span className="t-caption">5</span>
        </header>
        {[
          ['2 lb skirt steak', null, true],
          ['1 lb ground chicken', null, false],
          ['1 rack pork spare ribs', null, false],
        ].map(([n, store, checked], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderTop: i===0?'none':'1px solid var(--ink-100)' }}>
            {checked
              ? <div style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--leaf)', display: 'grid', placeItems: 'center', color: '#fff' }}><IconCheck size={13}/></div>
              : <div style={{ width: 22, height: 22, borderRadius: 7, border: '1.75px solid var(--ink-300)' }}/>
            }
            <span className="t-body-sm" style={{ flex: 1, color: checked?'var(--ink-300)':'var(--ink-900)', textDecoration: checked?'line-through':'none' }}>{n}</span>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--ink-50)', borderRadius: 14, padding: '0 6px 0 18px', height: 48, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="t-body-sm" style={{ flex: 1, color: 'var(--ink-400)' }}>Add an item…</span>
        <button className="btn btn-icon btn-sm" style={{ background: 'var(--hot)', color: '#fff' }}><IconPlus size={16}/></button>
      </div>
    </div>
    <MobileTabBar active="grocery" />
  </div>
);

const MobileDashboardScreen = () => (
  <div className="hp" style={{ background: 'var(--bg-app)', position: 'relative' }}>
    <StatusBar />
    <div style={{ padding: '8px 20px 110px', overflow: 'auto', height: 'calc(100% - 44px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Wordmark height={22} />
        <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--ink-900)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>C</div>
      </div>

      <div className="t-eyebrow">Sunday, May 25</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 64, letterSpacing: '-0.045em', lineHeight: .95, marginTop: 6, marginBottom: 22 }}>
        Hey Claire.
      </h1>

      <div style={{ background: 'var(--hot)', color: '#fff', borderRadius: 22, padding: 20, marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
        <div className="t-eyebrow" style={{ color: 'var(--hot-100)' }}>This week</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 100, lineHeight: .82, fontWeight: 700, letterSpacing: '-0.06em' }}>0/4</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, paddingBottom: 8, letterSpacing: '-0.025em' }}>done.</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.22)' }}/>)}
        </div>
        <div style={{ position: 'absolute', right: -20, top: -20, opacity: .14 }}><Mark size={140} bg="#fff" fg="var(--hot)" accent="var(--ink-900)"/></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={{ background: 'var(--leaf)', color: '#fff', borderRadius: 18, padding: 16 }}>
          <div className="t-eyebrow" style={{ color: 'var(--leaf-50)' }}>Grocery</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: .9, fontWeight: 700, marginTop: 4, letterSpacing: '-0.04em' }}>23</div>
          <div className="t-caption" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>to grab</div>
        </div>
        <div style={{ background: 'var(--sun)', color: 'var(--ink-900)', borderRadius: 18, padding: 16 }}>
          <div className="t-eyebrow">Pantry raid</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, lineHeight: 1.05, marginTop: 4, letterSpacing: '-0.025em' }}>Tue wide open.</div>
        </div>
      </div>

      <div className="t-eyebrow" style={{ marginBottom: 10 }}>Dinners on deck</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          ['Mon', 'Grilled Pork Spare Ribs', 'Sweet Corn · Butter Lettuce', 'var(--hot)'],
          ['Tue', 'Pantry Raid', 'No groceries needed', 'var(--sun)'],
          ['Wed', 'Grilled Skirt Steak', 'Buttered Parmesan Pasta', 'var(--ink-900)'],
          ['Thu', 'Ground Chicken Alfredo', "L'oven Fresh Garlic Knots", 'var(--leaf)'],
        ].map(([d, n, s, c]) => (
          <div key={d} className="card-out" style={{ display: 'flex', gap: 12, padding: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: c, color: c === 'var(--sun)' ? 'var(--ink-900)' : '#fff', display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{d}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, lineHeight: 1.1, letterSpacing: '-0.025em' }}>{n}</div>
              <div className="t-caption" style={{ marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <MobileTabBar active="dashboard" />
  </div>
);

const MobileRecipesScreen = () => (
  <div className="hp" style={{ background: 'var(--bg-app)', position: 'relative' }}>
    <StatusBar />
    <div style={{ padding: '8px 20px 110px', overflow: 'auto', height: 'calc(100% - 44px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Wordmark height={22} />
        <button className="btn btn-icon btn-sm" style={{ background: 'var(--hot)', color: '#fff' }}><IconPlus size={18}/></button>
      </div>
      <div className="t-eyebrow">Cookbook · 38 recipes</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 56, letterSpacing: '-0.04em', lineHeight: .95, marginTop: 6, marginBottom: 18 }}>
        The cookbook.
      </h1>
      <div style={{ background: 'var(--paper)', borderRadius: 14, padding: '0 18px', height: 48, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--ink-200)', marginBottom: 12 }}>
        <IconSearch size={18} style={{ color: 'var(--ink-500)' }}/>
        <span className="t-body" style={{ color: 'var(--ink-300)' }}>Search recipes…</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflow: 'auto' }}>
        {[['All',true],['Breakfast'],['Lunch'],['Dinner'],['Side'],['Snack']].map(([s, on]) => (
          <span key={s} className={'chip ' + (on?'chip-on':'')} style={{ height: 32, flex: '0 0 auto' }}>{s}</span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <RecipeCardCompact name="Chicken Crust Caesar" cat="Lunch" time="38" serves="2" audience="adults" color="var(--hot)"/>
        <RecipeCardCompact name="Sheet Pan Mini Meatloaf" cat="Dinner" time="45" serves="4" audience="everyone" color="var(--ink-900)"/>
        <RecipeCardCompact name="Garlic Knots" cat="Side" time="20" serves="4" audience="kids" color="var(--leaf)"/>
        <RecipeCardCompact name="Skirt Steak" cat="Dinner" time="25" serves="4" audience="adults" color="var(--sun)"/>
        <RecipeCardCompact name="Buttered Pasta" cat="Side" time="15" serves="4" audience="kids" color="var(--hot)"/>
        <RecipeCardCompact name="Pork Spare Ribs" cat="Dinner" time="115" serves="6" audience="everyone" color="var(--leaf)"/>
      </div>
    </div>
    <MobileTabBar active="recipes" />
  </div>
);

Object.assign(window, {
  StatusBar, MobileTabBar,
  MobilePlannerScreen, MobileGroceryScreen, MobileDashboardScreen, MobileRecipesScreen,
});
