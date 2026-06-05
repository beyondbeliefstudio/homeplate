// HomePlate v2 component library — bold sans, solid buttons, sage canvas

// ===== Buttons artboard =====
const ButtonsArtboard = () => (
  <div className="hp" style={{ padding: 48, background: 'var(--bg-app)', overflow: 'auto' }}>
    <div className="t-eyebrow" style={{ marginBottom: 10 }}>Components</div>
    <h2 className="t-h2" style={{ marginBottom: 28 }}>Buttons</h2>

    <div style={{ display: 'grid', gridTemplateColumns: 'max-content repeat(3, max-content)', gap: '28px 36px', alignItems: 'center', marginBottom: 36 }}>
      <div className="t-caption">Primary</div>
      <button className="btn btn-primary btn-lg"><IconPlus size={18}/> Add recipe</button>
      <button className="btn btn-primary btn-md"><IconPlus size={16}/> Add recipe</button>
      <button className="btn btn-primary btn-sm">Add</button>

      <div className="t-caption">Secondary</div>
      <button className="btn btn-secondary btn-lg"><IconShare size={18}/> Share week</button>
      <button className="btn btn-secondary btn-md"><IconShare size={16}/> Share</button>
      <button className="btn btn-secondary btn-sm">Share</button>

      <div className="t-caption">Ghost</div>
      <button className="btn btn-ghost btn-lg">Cancel</button>
      <button className="btn btn-ghost btn-md">Cancel</button>
      <button className="btn btn-ghost btn-sm">Cancel</button>

      <div className="t-caption">Destructive</div>
      <button className="btn btn-destructive btn-lg"><IconTrash size={18}/> Delete recipe</button>
      <button className="btn btn-destructive btn-md"><IconTrash size={16}/> Delete</button>
      <button className="btn btn-destructive btn-sm">Delete</button>

      <div className="t-caption">Icon only</div>
      <button className="btn btn-icon" style={{ background: 'var(--hot)', color: '#fff' }}><IconAdd size={22}/></button>
      <button className="btn btn-icon btn-ghost"><IconSearch size={20}/></button>
      <button className="btn btn-icon btn-ghost btn-sm"><IconEdit size={16}/></button>
    </div>

    <hr className="divider" style={{ marginBottom: 28 }} />
    <div className="t-eyebrow" style={{ marginBottom: 18 }}>States — primary</div>
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
      <button className="btn btn-primary btn-md"><IconPlus size={16}/> Default</button>
      <button className="btn btn-primary btn-md" style={{ background: 'var(--hot-600)' }}><IconPlus size={16}/> Hover</button>
      <button className="btn btn-primary btn-md" style={{ background: 'var(--hot-600)', opacity: .92 }}><IconPlus size={16}/> Pressed</button>
      <button className="btn btn-primary btn-md" style={{ background: 'var(--ink-200)', color: 'var(--ink-500)' }} disabled><IconPlus size={16}/> Disabled</button>
      <button className="btn btn-primary btn-md" style={{ background: 'var(--hot)', boxShadow: '0 0 0 3px var(--hot-100)' }}><IconPlus size={16}/> Focus</button>
    </div>

    <div className="t-eyebrow" style={{ marginTop: 28, marginBottom: 18 }}>Floating action · segmented · big CTA</div>
    <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
      <button className="btn" style={{ width: 60, height: 60, background: 'var(--ink-900)', color: '#fff', borderRadius: 18 }}>
        <IconPlus size={24}/>
      </button>
      <div style={{ display: 'inline-flex', padding: 4, background: 'var(--ink-50)', borderRadius: 14 }}>
        <button className="btn btn-sm" style={{ background: 'var(--paper)', color: 'var(--ink-900)' }}>All items</button>
        <button className="btn btn-sm" style={{ color: 'var(--text-soft)' }}>By store</button>
      </div>
      <button className="btn btn-lg" style={{ background: 'var(--leaf)', color: '#fff', padding: '0 28px', height: 56, fontSize: 16 }}><IconCheck size={20}/> Mark week done</button>
    </div>
  </div>
);

// ===== Inputs artboard =====
const InputsArtboard = () => (
  <div className="hp" style={{ padding: 48, background: 'var(--bg-app)', overflow: 'auto' }}>
    <div className="t-eyebrow" style={{ marginBottom: 10 }}>Components</div>
    <h2 className="t-h2" style={{ marginBottom: 28 }}>Inputs</h2>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
      <div>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Text · default</div>
        <div style={{ background: 'var(--paper)', borderRadius: 14, height: 52, padding: '0 18px', display: 'flex', alignItems: 'center', border: '1px solid var(--ink-200)' }}>
          <span className="t-body" style={{ color: 'var(--ink-300)' }}>Recipe name…</span>
        </div>
      </div>
      <div>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Text · focused</div>
        <div style={{ background: 'var(--paper)', borderRadius: 14, height: 52, padding: '0 18px', display: 'flex', alignItems: 'center', border: '2px solid var(--ink-900)' }}>
          <span className="t-body" style={{ color: 'var(--ink-900)' }}>Sheet Pan Mini Meatloaf<span style={{ borderLeft: '2px solid var(--hot)', height: 18, marginLeft: 2 }}/></span>
        </div>
      </div>
      <div>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Text · filled</div>
        <div style={{ background: 'var(--paper)', borderRadius: 14, height: 52, padding: '0 18px', display: 'flex', alignItems: 'center', border: '1px solid var(--ink-200)' }}>
          <span className="t-body">Grilled Skirt Steak</span>
        </div>
      </div>
      <div>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Text · error</div>
        <div style={{ background: 'var(--paper)', borderRadius: 14, height: 52, padding: '0 18px', display: 'flex', alignItems: 'center', border: '2px solid var(--hot)' }}>
          <span className="t-body" style={{ color: 'var(--ink-900)' }}>Recipe</span>
        </div>
        <div className="t-caption" style={{ color: 'var(--hot)', marginTop: 6 }}>Name is required</div>
      </div>

      <div style={{ gridColumn: 'span 2' }}>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Search</div>
        <div style={{ background: 'var(--paper)', borderRadius: 18, height: 56, padding: '0 22px', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--ink-200)' }}>
          <IconSearch size={22} style={{ color: 'var(--ink-500)' }}/>
          <span className="t-body-lg" style={{ color: 'var(--ink-300)' }}>Search recipes…</span>
        </div>
      </div>

      <div>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Quantity stepper</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 14, padding: 4 }}>
          <button className="btn btn-icon btn-sm" style={{ background: 'var(--ink-50)' }}><span style={{ fontSize: 18, fontWeight: 700, marginTop: -2 }}>−</span></button>
          <span className="tabular" style={{ minWidth: 56, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>2</span>
          <button className="btn btn-icon btn-sm" style={{ background: 'var(--ink-50)' }}><span style={{ fontSize: 18, fontWeight: 700, marginTop: -2 }}>+</span></button>
        </div>
      </div>

      <div>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Select</div>
        <div style={{ background: 'var(--paper)', borderRadius: 14, height: 52, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--ink-200)' }}>
          <span className="t-body">Dinner</span>
          <IconChevronD size={18} style={{ color: 'var(--ink-500)' }}/>
        </div>
      </div>

      <div>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Ingredient row</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ background: 'var(--paper)', borderRadius: 12, height: 44, padding: '0 12px', display: 'flex', alignItems: 'center', border: '1px solid var(--ink-200)', minWidth: 80 }}><span className="t-mono">1 1/2</span></div>
          <div style={{ background: 'var(--paper)', borderRadius: 12, height: 44, padding: '0 12px', display: 'flex', alignItems: 'center', border: '1px solid var(--ink-200)', minWidth: 80 }}><span className="t-body-sm">cups</span></div>
          <div style={{ background: 'var(--paper)', borderRadius: 12, height: 44, padding: '0 14px', display: 'flex', alignItems: 'center', border: '1px solid var(--ink-200)', flex: 1 }}><span className="t-body">prepared caesar salad</span></div>
          <button className="btn btn-icon btn-sm btn-ghost" style={{ borderColor: 'transparent' }}><IconClose size={16}/></button>
        </div>
      </div>

      <div>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Checkbox · grocery item</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, border: '1.5px solid var(--ink-300)' }} />
          <span className="t-body">1 lb skirt steak</span>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: 'var(--leaf)', display: 'grid', placeItems: 'center' }}><IconCheck size={14} style={{ color: '#fff' }}/></div>
          <span className="t-body" style={{ textDecoration: 'line-through', color: 'var(--ink-300)' }}>1 lb chicken</span>
        </div>
      </div>
    </div>
  </div>
);

// ===== Recipe card (used in many places) =====
const RecipeCardCompact = ({ name, cat, time, serves, audience = 'everyone', color = 'var(--hot)' }) => (
  <div style={{ background: 'var(--paper)', borderRadius: 22, overflow: 'hidden', border: '1px solid var(--ink-100)' }}>
    <div style={{ height: 130, background: color, position: 'relative', display: 'grid', placeItems: 'center' }}>
      {/* graphic placeholder — chunky utensil silhouette */}
      <svg width="60" height="60" viewBox="0 0 60 60" style={{ opacity: .18 }}>
        <circle cx="30" cy="30" r="22" fill="#fff"/>
      </svg>
      <span style={{ position: 'absolute', top: 12, left: 12 }} className="chip">{cat}</span>
      <span style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: 10, background: 'var(--paper)', display: 'grid', placeItems: 'center' }}>
        {audience === 'kids' ? <IconKids size={16}/> : audience === 'adults' ? <IconAdults size={16}/> : <IconEveryone size={16}/>}
      </span>
    </div>
    <div style={{ padding: '14px 16px 16px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, lineHeight: 1.1, letterSpacing: '-0.025em' }}>{name}</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 10, color: 'var(--ink-500)' }}>
        <span className="t-caption tabular" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconClock size={14}/> {time}m</span>
        <span className="t-caption tabular" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconServes size={14}/> {serves}</span>
      </div>
    </div>
  </div>
);

const CardsArtboard = () => (
  <div className="hp" style={{ padding: 48, background: 'var(--bg-app)', overflow: 'auto' }}>
    <div className="t-eyebrow" style={{ marginBottom: 10 }}>Components</div>
    <h2 className="t-h2" style={{ marginBottom: 28 }}>Recipe cards</h2>

    <div className="t-eyebrow" style={{ marginBottom: 14 }}>Compact · grid view</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
      <RecipeCardCompact name="Sheet Pan Mini Meatloaf" cat="Dinner" time="45" serves="4" audience="everyone" color="var(--hot)"/>
      <RecipeCardCompact name="Chicken Crust Caesar Pizza" cat="Lunch" time="38" serves="2" audience="adults" color="var(--sun)"/>
      <RecipeCardCompact name="Buttered Parmesan Pasta" cat="Side" time="15" serves="4" audience="kids" color="var(--leaf)"/>
      <RecipeCardCompact name="Grilled Skirt Steak" cat="Dinner" time="25" serves="4" audience="adults" color="var(--ink-900)"/>
    </div>

    <div className="t-eyebrow" style={{ marginBottom: 14 }}>Expanded · list row</div>
    <div className="card-out" style={{ padding: 18, display: 'flex', gap: 18, alignItems: 'center', marginBottom: 36 }}>
      <div style={{ width: 96, height: 96, borderRadius: 16, background: 'var(--hot)', flex: '0 0 auto' }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <span className="chip" style={{ background: 'var(--hot-50)', color: 'var(--hot)' }}>Dinner</span>
          <span className="chip chip-leaf">Everyone</span>
        </div>
        <div className="t-h3">Sheet Pan Mini Meatloaf and Roasted Potatoes</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, color: 'var(--ink-500)' }}>
          <span className="t-body-sm tabular" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><IconClock size={14}/> 45 min</span>
          <span className="t-body-sm tabular" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><IconServes size={14}/> Serves 4</span>
          <span className="t-body-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><IconFire size={14}/> 522 kcal</span>
        </div>
      </div>
      <button className="btn btn-ghost btn-md">Open</button>
    </div>

    <h2 className="t-h2" style={{ marginBottom: 20 }}>Planner cards</h2>
    <div className="t-eyebrow" style={{ marginBottom: 14 }}>Dinner entry — full controls</div>
    <DinnerCardSample/>
  </div>
);

const DinnerCardSample = () => (
  <div className="card-out" style={{ padding: 24, maxWidth: 760 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <button style={{ width: 28, height: 28, borderRadius: 9, border: '1.75px solid var(--ink-300)', flex: '0 0 auto', marginTop: 4 }} />
      <div style={{ flex: 1 }}>
        <div className="t-h3">Grilled Pork Spare Ribs</div>
        <div className="t-body-sm" style={{ color: 'var(--ink-500)', marginTop: 4 }}>
          Grilled Sweet Corn on the Cob · Butter Lettuce Salad with Apple Cider Vinegar Dressing
        </div>
      </div>
      <div style={{ display: 'inline-flex', padding: 3, background: 'var(--ink-50)', borderRadius: 10 }}>
        {['1×','2×','3×'].map((v, i) => (
          <span key={v} className="t-label" style={{ padding: '6px 12px', borderRadius: 8, background: i===0?'var(--ink-900)':'transparent', color: i===0?'#fff':'var(--ink-500)' }}>{v}</span>
        ))}
      </div>
      <button className="btn btn-icon btn-sm btn-ghost" style={{ borderColor: 'transparent' }}><IconClose size={16}/></button>
    </div>

    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <span className="chip"><IconAdults size={13}/> Adults only</span>
      <span className="chip chip-hot"><IconEveryone size={13}/> Everyone</span>
    </div>

    <div style={{ marginTop: 18, padding: 14, background: 'var(--bg-app-warm)', borderRadius: 14 }}>
      <div className="t-eyebrow" style={{ marginBottom: 8 }}>Sides</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="chip" style={{ background: 'var(--paper)' }}>Grilled Sweet Corn on the Cob <IconClose size={11}/></span>
        <span className="chip" style={{ background: 'var(--paper)' }}>Butter Lettuce Salad <IconClose size={11}/></span>
        <span className="chip" style={{ background: 'transparent', border: '1px dashed var(--ink-300)', color: 'var(--ink-500)' }}><IconPlus size={12}/> Add side</span>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
      {['C','L','R','J'].map((l, i) => (
        <div key={l} style={{ width: 28, height: 28, borderRadius: 9, background: ['var(--hot)','var(--leaf)','var(--sun)','var(--ink-900)'][i], color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>{l}</div>
      ))}
      <span className="chip chip-sun"><IconKids size={13}/> Kids only</span>
      <button className="t-label" style={{ color: 'var(--hot)', marginLeft: 'auto' }}>+ Add kids meal</button>
    </div>
  </div>
);

// ===== Toggles / badges =====
const TogglesArtboard = () => (
  <div className="hp" style={{ padding: 48, background: 'var(--bg-app)', overflow: 'auto' }}>
    <div className="t-eyebrow" style={{ marginBottom: 10 }}>Components</div>
    <h2 className="t-h2" style={{ marginBottom: 28 }}>Toggles, badges, controls</h2>

    <div className="t-eyebrow" style={{ marginBottom: 12 }}>Made toggle — all states</div>
    <div style={{ display: 'flex', gap: 36, alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
      <MadeToggle state="empty" label="Not yet" />
      <MadeToggle state="partial" label="1 of 2" />
      <MadeToggle state="done" label="Made" />
      <MadeToggle state="skip" label="Skipped" />
    </div>

    <div className="t-eyebrow" style={{ marginBottom: 12 }}>Audience badges</div>
    <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
      <span className="chip"><IconAdults size={13}/> Adults only</span>
      <span className="chip chip-sun"><IconKids size={13}/> Kids only</span>
      <span className="chip chip-hot"><IconEveryone size={13}/> Everyone</span>
    </div>

    <div className="t-eyebrow" style={{ marginBottom: 12 }}>Category chips</div>
    <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
      <span className="chip" style={{ background: 'var(--hot-50)', color: 'var(--hot)' }}>Breakfast</span>
      <span className="chip chip-leaf">Lunch</span>
      <span className="chip chip-sun">Dinner</span>
      <span className="chip">Side</span>
      <span className="chip" style={{ background: '#F0E6FF', color: '#5A2E9F' }}>Dessert</span>
      <span className="chip chip-orange">Snack</span>
    </div>

    <div className="t-eyebrow" style={{ marginBottom: 12 }}>Multiplier</div>
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 32 }}>
      {[0,1,2].map((sel) => (
        <div key={sel} style={{ display: 'inline-flex', padding: 3, background: 'var(--ink-50)', borderRadius: 10 }}>
          {['1×','2×','3×'].map((v, i) => (
            <span key={v} className="t-label" style={{ padding: '6px 14px', borderRadius: 8, background: i===sel?'var(--ink-900)':'transparent', color: i===sel?'#fff':'var(--ink-500)' }}>{v}</span>
          ))}
        </div>
      ))}
    </div>

    <div className="t-eyebrow" style={{ marginBottom: 12 }}>Pantry Raid card (wildcard slot)</div>
    <div style={{ background: 'var(--sun-50)', border: '1px dashed var(--sun-700)', borderRadius: 22, padding: 20, display: 'flex', alignItems: 'center', gap: 16, maxWidth: 480 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--sun)', color: 'var(--ink-900)', display: 'grid', placeItems: 'center' }}>
        <IconPantryRaid size={26}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.025em' }}>Pantry Raid Tuesday</div>
        <div className="t-body-sm" style={{ color: 'var(--ink-700)' }}>Open invitation. No groceries needed.</div>
      </div>
    </div>
  </div>
);

const MadeToggle = ({ state, label }) => {
  let body;
  if (state === 'empty') {
    body = <div style={{ width: 44, height: 44, borderRadius: 14, border: '1.75px solid var(--ink-300)' }}/>;
  } else if (state === 'partial') {
    body = (
      <div style={{ width: 44, height: 44, borderRadius: 14, border: '1.75px solid var(--leaf)', background: `linear-gradient(135deg, var(--leaf) 0 50%, var(--paper) 50% 100%)`, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 5, borderRadius: 9, background: 'var(--paper)', display: 'grid', placeItems: 'center' }}>
          <span className="t-mono" style={{ fontWeight: 700 }}>½</span>
        </div>
      </div>
    );
  } else if (state === 'done') {
    body = <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--leaf)', display: 'grid', placeItems: 'center', color: '#fff' }}><IconCheck size={22}/></div>;
  } else {
    body = <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--ink-100)', display: 'grid', placeItems: 'center', color: 'var(--ink-500)' }}><IconClose size={20}/></div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {body}
      <span className="t-caption">{label}</span>
    </div>
  );
};

// ===== Navigation =====
const NavArtboard = () => (
  <div className="hp" style={{ padding: 48, background: 'var(--bg-app)', overflow: 'auto' }}>
    <div className="t-eyebrow" style={{ marginBottom: 10 }}>Components</div>
    <h2 className="t-h2" style={{ marginBottom: 28 }}>Navigation</h2>

    <div className="t-eyebrow" style={{ marginBottom: 14 }}>Desktop sidebar</div>
    <div style={{ display: 'flex', gap: 28, marginBottom: 36 }}>
      <SidebarSample />
      <div className="t-body-sm" style={{ color: 'var(--text-soft)', maxWidth: 420 }}>
        White sidebar floats on warm oat. Active item is a clay terracotta fill — no shadow, no animation gimmicks. The wordmark is the home link.
      </div>
    </div>

    <div className="t-eyebrow" style={{ marginBottom: 14 }}>Mobile bottom tab bar</div>
    <div style={{ display: 'flex', gap: 28 }}>
      <MobileTabBarSample />
      <div className="t-body-sm" style={{ color: 'var(--text-soft)', maxWidth: 420 }}>
        A flat white bar with active tab in ink. Icons are 20px, label sits underneath in 10px bold.
      </div>
    </div>
  </div>
);

const SidebarSample = () => (
  <div style={{ width: 224, background: 'var(--paper)', borderRadius: 22, padding: '22px 12px', display: 'flex', flexDirection: 'column', gap: 4, border: '1px solid var(--ink-100)' }}>
    <div style={{ padding: '4px 12px 18px' }}><Wordmark height={26} /></div>
    {[
      [IconPlanner, 'Planner', true],
      [IconRecipes, 'Recipes', false],
      [IconGrocery, 'Grocery', false],
      [IconStore, 'Stores', false],
    ].map(([Ico, label, on]) => (
      <div key={label} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12,
        background: on ? 'var(--hot)' : 'transparent', color: on ? '#fff' : 'var(--ink-900)',
      }}>
        <Ico size={20}/>
        <span className="t-label" style={{ fontSize: 14 }}>{label}</span>
      </div>
    ))}
    <div style={{ flex: 1 }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', color: 'var(--ink-500)' }}>
      <IconSettings size={18}/><span className="t-label" style={{ fontSize: 13 }}>Settings</span>
    </div>
  </div>
);

const MobileTabBarSample = () => (
  <div style={{ width: 340, background: 'var(--paper)', borderRadius: 28, padding: '8px 8px', display: 'flex', justifyContent: 'space-around', boxShadow: 'var(--shadow-2)' }}>
    {[
      [IconRecipes, 'Recipes', false],
      [IconPlanner, 'Planner', true],
      [IconGrocery, 'Grocery', false],
      [IconSettings, 'Settings', false],
    ].map(([Ico, label, on]) => (
      <div key={label} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 14px',
        borderRadius: 16, background: on ? 'var(--ink-900)' : 'transparent', color: on ? '#fff' : 'var(--ink-500)',
        minWidth: 64,
      }}>
        <Ico size={20}/>
        <span style={{ fontSize: 10, fontWeight: 700 }}>{label}</span>
      </div>
    ))}
  </div>
);

Object.assign(window, {
  ButtonsArtboard, InputsArtboard, CardsArtboard, TogglesArtboard, NavArtboard,
  RecipeCardCompact, DinnerCardSample, MadeToggle, SidebarSample, MobileTabBarSample,
});
