// HomePlate v2 desktop screens — bold sans, sage bg, no italic-accent-color trick

const HPSidebar = ({ active = 'planner' }) => {
  const items = [
    ['dashboard', IconHome,    'Dashboard'],
    ['planner',  IconPlanner, 'Planner'],
    ['recipes',  IconRecipes, 'Recipes'],
    ['grocery',  IconGrocery, 'Grocery'],
    ['stores',   IconStore,   'Stores'],
  ];
  return (
    <aside style={{
      width: 224, padding: '24px 14px 20px', display: 'flex', flexDirection: 'column', gap: 4,
      background: 'var(--paper)', borderRight: '1px solid var(--ink-100)',
    }}>
      <div style={{ padding: '4px 12px 22px' }}><Wordmark height={26} /></div>
      {items.map(([id, Ico, label]) => {
        const on = id === active;
        return (
          <div key={id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12,
            background: on ? 'var(--hot)' : 'transparent',
            color: on ? '#fff' : 'var(--ink-900)',
          }}>
            <Ico size={20}/>
            <span className="t-label" style={{ fontSize: 14 }}>{label}</span>
          </div>
        );
      })}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', color: 'var(--ink-500)' }}>
        <IconSettings size={18}/><span className="t-label" style={{ fontSize: 13 }}>Settings</span>
      </div>
    </aside>
  );
};

// ===== Weekly planner — priority =====
const PlannerScreen = () => (
  <div className="hp" style={{ display: 'flex' }}>
    <HPSidebar active="planner" />
    <main style={{ flex: 1, overflow: 'auto', padding: '32px 48px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
        <div className="t-eyebrow">Week of May 24 — May 30</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-icon btn-ghost btn-sm"><IconChevronL size={16}/></button>
          <button className="btn btn-icon btn-ghost btn-sm"><IconChevronR size={16}/></button>
          <button className="btn btn-secondary btn-md"><IconShare size={16}/> Share week</button>
        </div>
      </div>

      <h1 className="t-display" style={{ marginBottom: 28, marginTop: 10 }}>This week's lineup.</h1>

      {/* hero row — 4 meal-type cards, numbers leading */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 26 }}>
        <HeroStat tint="var(--hot)" textColor="#fff" Ico={IconDinner} label="Dinners" value="4" sub="0 made" lead/>
        <HeroStat tint="var(--paper)" textColor="var(--ink-900)" Ico={IconBreakfast} label="Breakfasts" value="0" sub="planned" border/>
        <HeroStat tint="var(--paper)" textColor="var(--ink-900)" Ico={IconLunch} label="Lunches" value="0" sub="planned" border/>
        <HeroStat tint="var(--paper)" textColor="var(--ink-900)" Ico={IconSnack} label="Snacks" value="0" sub="planned" border/>
      </div>

      {/* Dinners section */}
      <section style={{ background: 'var(--paper)', borderRadius: 28, padding: '24px 26px 26px', border: '1px solid var(--ink-100)', marginBottom: 18 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--hot)', color: '#fff', display: 'grid', placeItems: 'center' }}><IconDinner size={22}/></div>
            <h3 className="t-h2" style={{ fontSize: 36 }}>Dinners</h3>
            <span className="chip">0 of 4 made</span>
          </div>
          <IconChevronU size={18} style={{ color: 'var(--ink-500)' }}/>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DinnerCardSample />
          <DinnerRowCondensed name="Grilled Skirt Steak" side="Buttered Parmesan Pasta" audience="adults" color="var(--ink-900)" />
          <DinnerRowCondensed name="Ground Chicken Alfredo Pasta" side="L'oven Fresh Garlic Knots" audience="everyone" color="var(--leaf)" />
          <DinnerRowCondensed name="Sheet Pan Mini Meatloaf" side="Roasted Potatoes" audience="kids" color="var(--sun)" />
        </div>

        <div style={{ display: 'flex', gap: 22, marginTop: 18, paddingTop: 18, borderTop: '1px dashed var(--ink-100)' }}>
          <button className="t-label" style={{ color: 'var(--hot)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}><IconPlus size={16}/> Add dinner</button>
          <button className="t-label" style={{ color: 'var(--sun-700)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}><IconPantryRaid size={16}/> Pantry Raid</button>
          <button className="t-label" style={{ color: 'var(--ink-500)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>Dining out</button>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <SectionCardEmpty Ico={IconLunch} title="Lunches" count="0 planned" tint="var(--leaf)" tintBg="var(--leaf-50)" />
        <SectionCardEmpty Ico={IconBreakfast} title="Breakfasts" count="0 planned" tint="var(--sun-700)" tintBg="var(--sun-50)" />
      </section>

      <section>
        <SectionCardEmpty Ico={IconSnack} title="Snacks & Bakes" count="0 planned" tint="var(--orange)" tintBg="var(--orange-100)" />
      </section>
    </main>
  </div>
);

const HeroStat = ({ tint, textColor, Ico, label, value, sub, lead, border }) => (
  <div style={{
    background: tint, color: textColor, borderRadius: 22, padding: '20px 22px',
    border: border ? '1px solid var(--ink-100)' : 'none', position: 'relative', overflow: 'hidden',
    minHeight: lead ? 160 : 130,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: lead ? 'rgba(255,255,255,0.2)' : 'var(--ink-50)', color: 'inherit', display: 'grid', placeItems: 'center' }}><Ico size={16}/></div>
      <span className="t-eyebrow" style={{ color: 'inherit', opacity: lead ? 0.9 : 1 }}>{label}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: lead ? 18 : 6 }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: lead ? 96 : 56, lineHeight: .85, fontWeight: 700, letterSpacing: '-0.05em' }}>{value}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, opacity: 0.75 }}>{sub}</span>
    </div>
  </div>
);

const DinnerRowCondensed = ({ name, side, audience, color }) => (
  <div style={{ background: 'var(--bg-app-warm)', borderRadius: 18, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
    <button style={{ width: 26, height: 26, borderRadius: 9, border: '1.75px solid var(--ink-300)', flex: '0 0 auto' }} />
    <div style={{ width: 5, height: 36, borderRadius: 2.5, background: color }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, lineHeight: 1.1, letterSpacing: '-0.025em' }}>{name}</div>
      <div className="t-body-sm" style={{ color: 'var(--ink-500)' }}>{side}</div>
    </div>
    <span className={'chip ' + (audience==='kids' ? 'chip-sun' : audience==='everyone' ? 'chip-hot' : '')}>
      {audience==='adults' ? <IconAdults size={13}/> : audience==='kids' ? <IconKids size={13}/> : <IconEveryone size={13}/>}
      {audience==='adults' ? 'Adults' : audience==='kids' ? 'Kids' : 'Everyone'}
    </span>
    <div style={{ display: 'inline-flex', padding: 2, background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 10 }}>
      {['1×','2×','3×'].map((v, i) => (
        <span key={v} className="t-label" style={{ padding: '4px 10px', borderRadius: 8, background: i===0?'var(--ink-900)':'transparent', color: i===0?'#fff':'var(--ink-500)', fontSize: 12 }}>{v}</span>
      ))}
    </div>
    <button className="btn btn-icon btn-sm btn-ghost" style={{ borderColor: 'transparent' }}><IconChevronD size={16}/></button>
  </div>
);

const SectionCardEmpty = ({ Ico, title, count, tint, tintBg }) => (
  <div className="card-out" style={{ padding: '22px 24px' }}>
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: tintBg, color: tint, display: 'grid', placeItems: 'center' }}><Ico size={20}/></div>
        <h3 className="t-h3">{title}</h3>
        <span className="t-caption">{count}</span>
      </div>
      <IconChevronU size={18} style={{ color: 'var(--ink-500)' }}/>
    </header>
    <div style={{ display: 'flex', gap: 22 }}>
      <button className="t-label" style={{ color: 'var(--hot)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}><IconPlus size={16}/> Add recipe</button>
      <button className="t-label" style={{ color: 'var(--sun-700)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}><IconPantryRaid size={16}/> Pantry / Whatever</button>
      <button className="t-label" style={{ color: 'var(--ink-500)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>Dining out</button>
    </div>
  </div>
);

// ===== Grocery list =====
const GroceryScreen = () => (
  <div className="hp" style={{ display: 'flex' }}>
    <HPSidebar active="grocery" />
    <main style={{ flex: 1, overflow: 'auto', padding: '32px 48px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
        <div className="t-eyebrow">Grocery · 35 items</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-icon btn-ghost btn-sm"><IconChevronL size={16}/></button>
          <button className="btn btn-ghost btn-md">Week of May 24</button>
          <button className="btn btn-icon btn-ghost btn-sm"><IconChevronR size={16}/></button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, marginTop: 10, marginBottom: 24 }}>
        <h1 className="t-display" style={{ fontSize: 120 }}>23</h1>
        <div style={{ paddingBottom: 14 }}>
          <div className="t-h2" style={{ fontSize: 36, letterSpacing: '-0.02em' }}>still to grab.</div>
          <div className="t-body-sm" style={{ color: 'var(--ink-500)', marginTop: 4 }}>12 already got · 35 total · the haul of the week</div>
        </div>
      </div>

      {/* progress + filters */}
      <div className="card-out" style={{ padding: '20px 24px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="t-label">12 of 35 got</span>
            <span className="t-caption tabular">34%</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: 'var(--ink-50)', overflow: 'hidden' }}>
            <div style={{ width: '34%', height: '100%', background: 'var(--leaf)', borderRadius: 5 }}/>
          </div>
        </div>
        <div style={{ display: 'inline-flex', padding: 4, background: 'var(--ink-50)', borderRadius: 12 }}>
          <span className="t-label" style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--paper)' }}>All items</span>
          <span className="t-label" style={{ padding: '6px 14px', color: 'var(--ink-500)' }}>By store</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['Any', true],['Aldi'],['Publix'],['Target']].map(([s, on]) => (
            <span key={s} className={'chip ' + (on?'chip-hot':'')} style={{ height: 34, padding: '0 12px' }}>{s}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, alignItems: 'flex-start' }}>
        <div className="card-out" style={{ padding: '22px 24px 12px' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="t-h3">From your plan</h3>
            <span className="chip">22 items</span>
          </header>

          <AisleGroup title="Produce" tint="var(--leaf-700)" items={[
            ['1 lb baby potatoes, halved', 'Aldi', true],
            ['3 cups broccoli florets, chopped',  null,  false],
            ['1 head butter lettuce',  null,  false],
            ['2 cups fresh green beans, trimmed',  null,  true],
            ['4 ears fresh sweet corn', 'Aldi',  false],
            ['½ medium onion, finely chopped', null, false],
          ]}/>
          <AisleGroup title="Meat & Seafood" tint="var(--hot)" items={[
            ['2 lb grass fed skirt steak', null, true],
            ['1 lb ground chicken', null, false],
            ['1 lb lean ground beef', null, true],
            ['1 rack pork spare ribs (about 6 lb)', null, false],
            ['Meatchurch Blanco seasoning', 'Publix', false],
          ]}/>
          <AisleGroup title="Dairy & Eggs" tint="var(--sun-700)" items={[
            ['1 dozen eggs', null, true],
            ['½ cup freshly grated Parmesan cheese', null, false],
            ['1 cup grated parmesan cheese', null, false],
          ]}/>
          <AisleGroup title="Pantry & Dry Goods" tint="#5A2E9F" items={[
            ['1 jar Alfredo sauce', null, false],
            ['¼ cup ketchup or barbecue sauce', null, true],
            ['1 lb short cut pasta', null, false],
          ]}/>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card-out" style={{ padding: '20px 22px' }}>
            <div className="t-eyebrow" style={{ marginBottom: 10 }}>Added for this week</div>
            <div style={{ background: 'var(--ink-50)', borderRadius: 14, padding: '0 6px 0 18px', height: 48, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="t-body" style={{ flex: 1, color: 'var(--ink-300)' }}>e.g. paper towels, sparkling water…</span>
              <button className="btn btn-icon btn-sm" style={{ background: 'var(--hot)', color: '#fff' }}><IconPlus size={16}/></button>
            </div>
          </div>

          <div className="card-out" style={{ padding: '20px 22px' }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="t-h3" style={{ fontSize: 22 }}>Check your pantry</h3>
              <span className="chip chip-sun">13</span>
            </header>
            <p className="t-body-sm" style={{ color: 'var(--text-soft)', marginBottom: 12 }}>Recipes call for these — make sure you're stocked up.</p>
            {['⅓ cup apple cider vinegar','½ tbsp Dijon mustard','1 clove garlic','0.5 tsp Italian seasoning','1 cup olive oil','1 tbsp oil','salt and pepper'].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: '1px solid var(--ink-100)' }}>
                <div style={{ width: 20, height: 20, borderRadius: 7, border: '1.5px solid var(--ink-200)' }} />
                <span className="t-body-sm" style={{ color: 'var(--ink-500)' }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--ink-900)', borderRadius: 22, padding: '22px 24px', color: 'var(--paper)' }}>
            <div className="t-eyebrow" style={{ color: 'var(--ink-300)' }}>Always on my list</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, marginTop: 6, lineHeight: 1.05, letterSpacing: '-0.03em' }}>Coffee. Bananas. Olive oil.</div>
            <p className="t-body-sm" style={{ color: 'var(--ink-300)', marginTop: 10 }}>Saved staples auto-add each week.</p>
            <button className="btn btn-md" style={{ background: 'var(--paper)', color: 'var(--ink-900)', marginTop: 16 }}><IconPlus size={16}/> Add staple</button>
          </div>
        </div>
      </div>
    </main>
  </div>
);

const AisleGroup = ({ title, tint, items }) => (
  <div style={{ marginBottom: 18 }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 12px' }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: tint }}/>
      <span className="t-eyebrow" style={{ color: tint }}>{title}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--ink-100)', marginLeft: 6 }}/>
      <span className="t-caption">{items.length}</span>
    </header>
    <div>
      {items.map(([label, store, checked], i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 6px', borderTop: i === 0 ? 'none' : '1px solid var(--ink-100)' }}>
          {checked
            ? <div style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--leaf)', display: 'grid', placeItems: 'center', color: '#fff' }}><IconCheck size={14}/></div>
            : <div style={{ width: 22, height: 22, borderRadius: 7, border: '1.5px solid var(--ink-300)' }}/>
          }
          <span className="t-body" style={{ flex: 1, color: checked ? 'var(--ink-300)' : 'var(--ink-900)', textDecoration: checked ? 'line-through' : 'none' }}>{label}</span>
          {store
            ? <span className="chip" style={{ background: 'var(--hot-50)', color: 'var(--hot)', height: 26 }}>{store}</span>
            : <span className="chip" style={{ background: 'transparent', color: 'var(--ink-300)', border: '1px dashed var(--ink-200)', height: 26 }}><IconPlus size={11}/> store</span>
          }
        </div>
      ))}
    </div>
  </div>
);

// ===== Dashboard =====
const DashboardScreen = () => (
  <div className="hp" style={{ display: 'flex' }}>
    <HPSidebar active="dashboard" />
    <main style={{ flex: 1, overflow: 'auto', padding: '32px 48px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
        <div className="t-eyebrow">Sunday, May 25 · Week 21</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-md"><IconShare size={16}/> Share week</button>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--ink-900)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 14 }}>C</div>
        </div>
      </div>
      <h1 className="t-display" style={{ marginTop: 8, marginBottom: 28 }}>Hey Claire.</h1>

      {/* Row A — tonight + 3 stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>
        <div style={{ background: 'var(--hot)', color: '#fff', borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden', minHeight: 230 }}>
          <div className="t-eyebrow" style={{ color: 'var(--hot-100)' }}>Tonight · Sunday</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 56, lineHeight: .95, marginTop: 6, letterSpacing: '-0.025em' }}>
            Grilled Pork<br/>Spare Ribs.
          </div>
          <div className="t-body-sm" style={{ marginTop: 10, opacity: .9 }}>
            with Sweet Corn on the Cob · Butter Lettuce Salad
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center' }}>
            <span className="chip" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}><IconEveryone size={13}/> Everyone</span>
            <span className="chip" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}><IconClock size={13}/> 115 min</span>
            <button className="btn btn-md" style={{ background: '#fff', color: 'var(--ink-900)', marginLeft: 'auto' }}>Open recipe</button>
          </div>
          <div style={{ position: 'absolute', right: -18, bottom: -18, opacity: .14 }}><Mark size={170} bg="#fff" fg="var(--hot)" accent="var(--ink-900)"/></div>
        </div>

        <StatTile eyebrow="Dinners" big="0/4" sub="nights cooked" Ico={IconDinner} tint="var(--ink-900)" textColor="#fff"/>
        <StatTile eyebrow="Grocery" big="23" sub="items to grab" Ico={IconGrocery} tint="var(--leaf)" textColor="#fff"/>
        <StatTile eyebrow="Streak" big="12" sub="weeks cooking at home" Ico={IconFire} tint="var(--sun)" textColor="var(--ink-900)"/>
      </div>

      {/* Row B — Week at a glance */}
      <section className="card-out" style={{ padding: '20px 24px 22px', marginBottom: 18 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h3 className="t-h3">Week at a glance</h3>
            <span className="t-caption">May 24 — May 30</span>
          </div>
          <button className="t-label" style={{ color: 'var(--hot)' }}>Open planner →</button>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {[
            ['Sun','25','Tonight','Ribs · Corn · Salad', 'var(--hot)', 'now'],
            ['Mon','26','Dinner','Grilled Skirt Steak', 'var(--ink-900)', 'planned'],
            ['Tue','27','Pantry Raid','wide open', 'var(--sun)', 'raid'],
            ['Wed','28','Dinner','Chicken Alfredo', 'var(--leaf)', 'planned'],
            ['Thu','29','Dinner','Mini Meatloaf', 'var(--orange)', 'planned'],
            ['Fri','30','Dining out','Pizza night', null, 'out'],
            ['Sat','31','Open','no plan yet', null, 'empty'],
          ].map(([d, n, label, sub, c, kind]) => (
            <div key={d} style={{
              borderRadius: 16, padding: '14px 14px 16px',
              border: kind === 'empty' ? '1px dashed var(--ink-300)' : '1px solid var(--ink-100)',
              background: kind === 'now' ? 'var(--hot-50)' : kind === 'out' ? 'var(--bg-app-warm)' : 'var(--paper-off)',
              display: 'flex', flexDirection: 'column', gap: 8, minHeight: 130,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span className="t-eyebrow" style={{ color: kind === 'now' ? 'var(--hot)' : 'var(--ink-500)' }}>{d}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>{n}</span>
              </div>
              {c && <div style={{ width: '100%', height: 3, borderRadius: 2, background: c }}/>}
              <div className="t-label" style={{ marginTop: 4, fontSize: 12 }}>{label}</div>
              <div className="t-caption" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Row C — cooking this week + pantry watch */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, marginBottom: 18, alignItems: 'flex-start' }}>
        <section className="card-out" style={{ padding: '20px 24px 22px' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="t-h3">Cooking this week</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="chip">4 dinners</span>
              <span className="chip chip-sun">1 raid</span>
              <span className="chip" style={{ background: 'var(--bg-app-warm)' }}>1 out</span>
            </div>
          </header>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Sun','Grilled Pork Spare Ribs','Sweet Corn · Butter Lettuce','everyone','var(--hot)','today'],
              ['Mon','Grilled Skirt Steak','Buttered Parmesan Pasta','adults','var(--ink-900)','planned'],
              ['Wed','Ground Chicken Alfredo','Garlic Knots','everyone','var(--leaf)','planned'],
              ['Thu','Sheet Pan Mini Meatloaf','Roasted Potatoes','kids','var(--orange)','planned'],
            ].map(([d, n, s, a, c, status]) => (
              <div key={n} style={{ background: 'var(--paper-off)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: c, color: c === 'var(--sun)' ? 'var(--ink-900)' : '#fff', display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>{d}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{n}</div>
                  <div className="t-caption" style={{ marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</div>
                </div>
                <span className={'chip ' + (a==='kids'?'chip-sun':a==='everyone'?'chip-hot':'')} style={{ height: 24, padding: '0 10px', fontSize: 11 }}>
                  {a==='adults'?'Adults':a==='kids'?'Kids':'Everyone'}
                </span>
                {status === 'today'
                  ? <span className="chip" style={{ background: 'var(--ink-900)', color: '#fff', height: 24 }}>Tonight</span>
                  : <div style={{ width: 26, height: 26, borderRadius: 9, border: '1.75px solid var(--ink-300)' }}/>
                }
              </div>
            ))}
          </div>
        </section>

        <section className="card-out" style={{ padding: '20px 22px' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="t-h3">Pantry watch</h3>
            <span className="chip chip-sun">3 low</span>
          </header>
          <p className="t-body-sm" style={{ color: 'var(--ink-500)', marginBottom: 14 }}>Staples we use weekly that need a refill soon.</p>
          {[
            ['Olive oil', 'bottle nearly empty', true],
            ['Salt', 'last refill 3 wks ago', true],
            ['Garlic', '1 head left', true],
            ['Parmesan', 'plenty', false],
            ['Dijon mustard', 'plenty', false],
          ].map(([n, note, low]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--ink-100)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: low ? 'var(--sun)' : 'var(--leaf)', flex: '0 0 auto' }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-label" style={{ fontSize: 14 }}>{n}</div>
                <div className="t-caption">{note}</div>
              </div>
              {low && <button className="btn btn-sm btn-ghost" style={{ height: 28, padding: '0 10px', fontSize: 12 }}>+ Add</button>}
            </div>
          ))}
        </section>
      </div>

      {/* Row D — 3 stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 18 }}>
        <section className="card-out" style={{ padding: 22 }}>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Cook time · this week</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span className="t-num-lg">3<span style={{ fontSize: 32 }}>h</span> 35<span style={{ fontSize: 32 }}>m</span></span>
          </div>
          <div className="t-body-sm" style={{ color: 'var(--ink-500)', marginTop: 6 }}>across 4 nights · avg 54 min</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 14, alignItems: 'flex-end', height: 60 }}>
            {[40, 25, 0, 35, 45, 0, 0].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${(h/45)*100}%`, background: h ? 'var(--hot)' : 'var(--ink-100)', borderRadius: 4, minHeight: 6 }}/>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} className="t-caption" style={{ flex: 1, textAlign: 'center' }}>{d}</span>)}
          </div>
        </section>

        <section className="card-out" style={{ padding: 22 }}>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Audience mix</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="t-num-lg">4</span>
            <span className="t-body-sm" style={{ color: 'var(--ink-500)' }}>meals planned</span>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 16, height: 16, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ flex: 2, background: 'var(--hot)' }}/>
            <div style={{ flex: 1, background: 'var(--ink-900)' }}/>
            <div style={{ flex: 1, background: 'var(--sun)' }}/>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            <Legend dot="var(--hot)" label="Everyone" value="2"/>
            <Legend dot="var(--ink-900)" label="Adults only" value="1"/>
            <Legend dot="var(--sun)" label="Kids only" value="1"/>
          </div>
        </section>

        <section className="card-out" style={{ padding: 22 }}>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Most cooked · 30 days</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {[
              ['Sheet Pan Meatloaf', 4, 'var(--orange)'],
              ['Grilled Skirt Steak', 3, 'var(--ink-900)'],
              ['Chicken Alfredo', 3, 'var(--leaf)'],
              ['Pork Spare Ribs', 2, 'var(--hot)'],
            ].map(([n, c, color]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 28, borderRadius: 3, background: color }}/>
                <span className="t-label" style={{ flex: 1, fontSize: 13 }}>{n}</span>
                <span className="tabular" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{c}×</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Row E — recent activity + try this */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28 }}>
        <section className="card-out" style={{ padding: 22 }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="t-h3">Recent activity</h3>
            <button className="t-label" style={{ color: 'var(--ink-500)' }}>View all</button>
          </header>
          {[
            ['var(--hot)', 'You', 'planned Pork Spare Ribs for Sunday', '2h ago'],
            ['var(--leaf)', 'Ryan', 'checked off 4 items from grocery', '5h ago'],
            ['var(--sun)', 'You', 'added Pantry Raid Tuesday', 'yesterday'],
            ['var(--ink-900)', 'You', 'shared week with Ryan + the kids', '2 days ago'],
            ['var(--orange)', 'You', 'saved Cheesy Tortellini to cookbook', '3 days ago'],
          ].map(([c, who, what, when], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: i===0?'none':'1px solid var(--ink-100)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: c, color: c === 'var(--sun)' ? 'var(--ink-900)' : '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 12, flex: '0 0 auto' }}>{who[0]}</div>
              <div style={{ flex: 1 }}>
                <div className="t-body-sm"><span style={{ fontWeight: 600 }}>{who}</span> {what}</div>
                <div className="t-caption">{when}</div>
              </div>
            </div>
          ))}
        </section>

        <section style={{ background: 'var(--ink-900)', color: '#fff', borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div className="t-eyebrow" style={{ color: 'var(--sun)' }}>Try this week</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, lineHeight: 1, marginTop: 8, letterSpacing: '-0.025em' }}>
            Cheesy Baked Tortellini Casserole with Meat Sauce.
          </div>
          <p className="t-body-sm" style={{ color: 'var(--ink-300)', marginTop: 12, maxWidth: 360 }}>
            From your cookbook, never used. Serves 8 — great for a double batch and lunch leftovers Tuesday.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center' }}>
            <span className="chip" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}><IconClock size={13}/> 45 min</span>
            <span className="chip" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}><IconServes size={13}/> Serves 8</span>
            <button className="btn btn-md" style={{ background: 'var(--sun)', color: 'var(--ink-900)', marginLeft: 'auto' }}>Add to Tuesday</button>
          </div>
          <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: .14 }}><Mark size={150} bg="#fff" fg="var(--ink-900)" accent="var(--sun)"/></div>
        </section>
      </div>

      <div className="t-eyebrow" style={{ marginBottom: 12 }}>From your cookbook</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <RecipeCardCompact name="Chicken Crust Caesar Pizza" cat="Lunch" time="38" serves="2" audience="adults" color="var(--hot)"/>
        <RecipeCardCompact name="Buttered Parmesan Pasta" cat="Side" time="15" serves="4" audience="kids" color="var(--leaf)"/>
        <RecipeCardCompact name="L'oven Fresh Garlic Knots" cat="Side" time="20" serves="4" audience="everyone" color="var(--sun)"/>
        <RecipeCardCompact name="Cheesy Baked Tortellini" cat="Dinner" time="45" serves="8" audience="everyone" color="var(--ink-900)"/>
      </div>
    </main>
  </div>
);

const StatTile = ({ eyebrow, big, sub, Ico, tint, textColor }) => (
  <div style={{ background: tint, color: textColor, borderRadius: 24, padding: '20px 22px', minHeight: 230, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}><Ico size={16}/></div>
      <span className="t-eyebrow" style={{ color: 'inherit', opacity: .85 }}>{eyebrow}</span>
    </div>
    <div>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 88, lineHeight: .82, letterSpacing: '-0.045em' }}>{big}</span>
      <div className="t-body-sm" style={{ marginTop: 4, opacity: .85 }}>{sub}</div>
    </div>
  </div>
);

const Legend = ({ dot, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ width: 8, height: 8, borderRadius: 2, background: dot }}/>
    <span className="t-label" style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{label}</span>
    <span className="tabular" style={{ fontWeight: 600, fontSize: 13 }}>{value}</span>
  </div>
);

// ===== Recipe library =====
const RecipesScreen = () => (
  <div className="hp" style={{ display: 'flex' }}>
    <HPSidebar active="recipes" />
    <main style={{ flex: 1, overflow: 'auto', padding: '32px 48px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="t-eyebrow">Cookbook · 38 recipes</div>
        <button className="btn btn-primary btn-lg"><IconPlus size={18}/> Add recipe</button>
      </div>

      <h1 className="t-display" style={{ marginTop: 8, marginBottom: 24 }}>The cookbook.</h1>

      <div style={{ background: 'var(--paper)', borderRadius: 18, padding: '0 22px', height: 60, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--ink-200)', marginBottom: 18 }}>
        <IconSearch size={22} style={{ color: 'var(--ink-500)' }}/>
        <span className="t-body-lg" style={{ flex: 1, color: 'var(--ink-300)' }}>Search recipes, ingredients, audience…</span>
        <button className="btn btn-icon btn-sm btn-ghost" style={{ borderColor: 'transparent' }}><IconGrid size={16}/></button>
        <button className="btn btn-icon btn-sm" style={{ background: 'var(--ink-50)', color: 'var(--ink-900)' }}><IconList size={16}/></button>
      </div>

      <div style={{ display: 'flex', gap: 22, marginBottom: 22, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['All', true],['Breakfast'],['Lunch'],['Dinner'],['Side'],['Snack'],['Dessert']].map(([s, on]) => (
            <span key={s} className={'chip ' + (on?'chip-on':'')} style={{ height: 34, padding: '0 14px' }}>{s}</span>
          ))}
        </div>
        <span style={{ width: 1, height: 24, background: 'var(--ink-200)' }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="chip chip-hot" style={{ height: 34, padding: '0 12px' }}><IconEveryone size={13}/> Everyone</span>
          <span className="chip" style={{ height: 34, padding: '0 12px', background: 'var(--paper)', border: '1px solid var(--ink-200)' }}><IconAdults size={13}/> Adults</span>
          <span className="chip" style={{ height: 34, padding: '0 12px', background: 'var(--paper)', border: '1px solid var(--ink-200)' }}><IconKids size={13}/> Kids</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <RecipeCardCompact name="Chicken Crust Caesar Salad Pizza" cat="Lunch" time="38" serves="2" audience="adults" color="var(--hot)"/>
        <RecipeCardCompact name="Sheet Pan Mini Meatloaf and Roasted Potatoes" cat="Dinner" time="45" serves="4" audience="everyone" color="var(--ink-900)"/>
        <RecipeCardCompact name="L'oven Fresh Garlic Knots" cat="Side" time="20" serves="4" audience="kids" color="var(--leaf)"/>
        <RecipeCardCompact name="Ground Chicken Alfredo Pasta" cat="Dinner" time="35" serves="4" audience="everyone" color="var(--sun)"/>
        <RecipeCardCompact name="Butter Lettuce Salad with Apple Cider Vinegar" cat="Side" time="10" serves="4" audience="adults" color="var(--leaf)"/>
        <RecipeCardCompact name="Buttered Parmesan Pasta" cat="Side" time="15" serves="4" audience="kids" color="var(--sun)"/>
        <RecipeCardCompact name="Grilled Skirt Steak" cat="Dinner" time="25" serves="4" audience="adults" color="var(--ink-900)"/>
        <RecipeCardCompact name="Grilled Sweet Corn on the Cob" cat="Side" time="25" serves="4" audience="everyone" color="var(--hot)"/>
        <RecipeCardCompact name="Grilled Pork Spare Ribs" cat="Dinner" time="115" serves="6" audience="everyone" color="var(--hot)"/>
        <RecipeCardCompact name="Healthier Homemade One Pot Hamburger Helper" cat="Dinner" time="30" serves="6" audience="kids" color="var(--leaf)"/>
        <RecipeCardCompact name="Cheesy Baked Tortellini Casserole" cat="Dinner" time="45" serves="8" audience="everyone" color="var(--ink-900)"/>
        <RecipeCardCompact name="Pancakes the kids actually eat" cat="Breakfast" time="20" serves="4" audience="kids" color="var(--sun)"/>
      </div>
    </main>
  </div>
);

// ===== Add / edit recipe =====
const AddRecipeScreen = () => (
  <div className="hp" style={{ display: 'flex' }}>
    <HPSidebar active="recipes" />
    <main style={{ flex: 1, overflow: 'auto', padding: '28px 48px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="btn btn-ghost btn-md"><IconChevronL size={16}/> Back to cookbook</button>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost btn-md">Cancel</button>
          <button className="btn btn-primary btn-md"><IconCheck size={16}/> Save recipe</button>
        </div>
      </div>

      <div className="t-eyebrow">New recipe</div>
      <h1 className="t-display" style={{ fontSize: 80, marginTop: 6, marginBottom: 28 }}>What's the dish?</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 26 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>Recipe name</div>
            <div style={{ background: 'var(--paper)', borderRadius: 14, height: 60, padding: '0 22px', display: 'flex', alignItems: 'center', border: '2px solid var(--ink-900)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em' }}>Sheet Pan Mini Meatloaf<span style={{ borderLeft: '2px solid var(--hot)', height: 26, marginLeft: 2 }}/></span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 8 }}>Category</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[['Breakfast'],['Lunch'],['Dinner', true],['Side'],['Snack'],['Dessert']].map(([s, on]) => (
                  <span key={s} className={'chip ' + (on?'chip-on':'')} style={{ height: 34, padding: '0 14px' }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 8 }}>Audience</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="chip" style={{ height: 34, padding: '0 14px' }}><IconAdults size={13}/> Adults</span>
                <span className="chip" style={{ height: 34, padding: '0 14px' }}><IconKids size={13}/> Kids</span>
                <span className="chip chip-hot" style={{ height: 34, padding: '0 14px' }}><IconEveryone size={13}/> Everyone</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[['Prep','15','min'],['Cook','30','min'],['Serves','4','people']].map(([l, v, u]) => (
              <div key={l} className="card-out" style={{ padding: '14px 18px' }}>
                <div className="t-caption">{l}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <span className="t-num-md">{v}</span>
                  <span className="t-caption">{u}</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="t-eyebrow" style={{ marginBottom: 10 }}>Ingredients</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['1','lb','lean ground beef'],
                ['1','','egg'],
                ['¼','cup','fine bread crumbs'],
                ['½','cup','finely chopped onion'],
                ['¼','cup','ketchup or barbecue sauce'],
                ['1','lb','baby potatoes, halved'],
              ].map(([q, u, n], i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 12, height: 44, width: 80, display: 'flex', alignItems: 'center', padding: '0 12px' }}><span className="t-mono">{q}</span></div>
                  <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 12, height: 44, width: 80, display: 'flex', alignItems: 'center', padding: '0 12px' }}><span className="t-body-sm">{u}</span></div>
                  <div style={{ background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 12, height: 44, flex: 1, display: 'flex', alignItems: 'center', padding: '0 14px' }}><span className="t-body">{n}</span></div>
                  <button className="btn btn-icon btn-sm btn-ghost" style={{ borderColor: 'transparent' }}><IconClose size={16}/></button>
                </div>
              ))}
              <button className="t-label" style={{ color: 'var(--hot)', display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 4 }}><IconPlus size={16}/> Add ingredient</button>
            </div>
          </div>

          <div>
            <div className="t-eyebrow" style={{ marginBottom: 10 }}>Instructions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Preheat oven to 425°F (220°C). Line a baking sheet with parchment.',
                'In a large bowl, combine beef, egg, breadcrumbs, onion, and ketchup. Mix until just combined.',
                'Form into 4 small loaves on one side of the pan. Toss potatoes with oil and salt on the other side.',
              ].map((s, i) => (
                <div key={i} className="card-out" style={{ display: 'flex', gap: 14, padding: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--hot)', color: '#fff', display: 'grid', placeItems: 'center', flex: '0 0 auto', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>{i+1}</div>
                  <div className="t-body" style={{ flex: 1 }}>{s}</div>
                </div>
              ))}
              <button className="t-label" style={{ color: 'var(--hot)', display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 4 }}><IconPlus size={16}/> Add step</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ background: 'var(--bg-app-warm)', border: '1px dashed var(--ink-300)', borderRadius: 22, aspectRatio: '4/3', display: 'grid', placeItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--paper)', color: 'var(--ink-700)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><IconCamera size={26}/></div>
              <div className="t-label">Drop a photo, or click to upload</div>
              <div className="t-caption">JPG or PNG · up to 5MB</div>
            </div>
          </div>

          <div className="card-out" style={{ padding: 22 }}>
            <div className="t-eyebrow" style={{ marginBottom: 14 }}>Nutrition <span style={{ color: 'var(--text-soft)' }}>· auto · per serving</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {[['522','kcal'],['49','g protein'],['10','g carbs'],['31','g fat'],['1','g fiber']].map(([n, u], i) => (
                <div key={i} style={{ background: 'var(--ink-50)', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>{n}</div>
                  <div className="t-caption">{u}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-out" style={{ padding: 22 }}>
            <div className="t-eyebrow" style={{ marginBottom: 10 }}>Notes</div>
            <div className="t-body" style={{ color: 'var(--ink-500)', minHeight: 100 }}>Worth doubling — leftovers reheat well in the toaster oven. The kids prefer ketchup glaze; adults like the BBQ.</div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

Object.assign(window, {
  HPSidebar, PlannerScreen, GroceryScreen, DashboardScreen, RecipesScreen, AddRecipeScreen,
  HeroStat, StatTile, Legend, DinnerRowCondensed, SectionCardEmpty, AisleGroup,
});
