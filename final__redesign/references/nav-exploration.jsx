// HomePlate v2 — navigation exploration

const NavExplorationArtboard = () => (
  <div className="hp" style={{ padding: 56, background: 'var(--bg-app)', overflow: 'auto' }}>
    <div className="t-eyebrow" style={{ marginBottom: 8 }}>Navigation exploration</div>
    <h2 className="t-h2" style={{ marginBottom: 12, maxWidth: 720 }}>Where should the chrome live?</h2>
    <p className="t-body" style={{ color: 'var(--text-soft)', marginBottom: 36, maxWidth: 640 }}>
      Two contenders. Sidebar is familiar for a tool you live in. Top nav frees the canvas — more editorial. Both run the same brand language.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 32 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span className="chip chip-hot">Recommended</span>
          <h3 className="t-h3">A · Branded sidebar</h3>
        </div>
        <div style={{ background: 'var(--paper)', borderRadius: 28, overflow: 'hidden', border: '1px solid var(--ink-100)', height: 360, display: 'flex' }}>
          <div style={{ width: 140, padding: '14px 10px', borderRight: '1px solid var(--ink-100)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ padding: '4px 10px 14px' }}><Wordmark height={18} /></div>
            <div style={{ padding: '8px 10px', borderRadius: 9, background: 'var(--hot)', color: '#fff', display: 'flex', gap: 8 }}><IconPlanner size={14}/> <span style={{ fontSize: 12, fontWeight: 600 }}>Planner</span></div>
            <div style={{ padding: '8px 10px', display: 'flex', gap: 8, color: 'var(--ink-700)' }}><IconRecipes size={14}/> <span style={{ fontSize: 12, fontWeight: 600 }}>Recipes</span></div>
            <div style={{ padding: '8px 10px', display: 'flex', gap: 8, color: 'var(--ink-700)' }}><IconGrocery size={14}/> <span style={{ fontSize: 12, fontWeight: 600 }}>Grocery</span></div>
            <div style={{ padding: '8px 10px', display: 'flex', gap: 8, color: 'var(--ink-700)' }}><IconStore size={14}/> <span style={{ fontSize: 12, fontWeight: 600 }}>Stores</span></div>
          </div>
          <div style={{ flex: 1, padding: '18px 22px', background: 'var(--bg-app)' }}>
            <div className="t-eyebrow" style={{ marginBottom: 4 }}>Week of May 24</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 44, lineHeight: .95, letterSpacing: '-0.035em' }}>This week's lineup.</div>
            <div style={{ marginTop: 14, height: 70, background: 'var(--hot)', borderRadius: 14 }}/>
          </div>
        </div>
        <ul className="t-body-sm" style={{ paddingLeft: 18, color: 'var(--ink-700)', marginTop: 14 }}>
          <li><strong>Pros:</strong> persistent labels, room to grow, screen identity is always one glance away.</li>
          <li><strong>Pros:</strong> sidebar feels grounded — it's a tool you live in, not a marketing site.</li>
          <li><strong>Cons:</strong> ~224px of horizontal real estate is permanently spent on chrome.</li>
        </ul>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span className="chip">Alternative</span>
          <h3 className="t-h3">B · Floating top nav</h3>
        </div>
        <div style={{ background: 'var(--bg-app)', borderRadius: 28, overflow: 'hidden', border: '1px solid var(--ink-100)', height: 360, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <Wordmark height={20} />
            <div style={{ display: 'inline-flex', padding: 3, background: 'var(--paper)', borderRadius: 12, marginLeft: 18, border: '1px solid var(--ink-100)' }}>
              <span className="t-label" style={{ padding: '6px 14px', borderRadius: 9, background: 'var(--hot)', color: '#fff', fontSize: 12 }}>Planner</span>
              <span className="t-label" style={{ padding: '6px 14px', color: 'var(--ink-500)', fontSize: 12 }}>Recipes</span>
              <span className="t-label" style={{ padding: '6px 14px', color: 'var(--ink-500)', fontSize: 12 }}>Grocery</span>
              <span className="t-label" style={{ padding: '6px 14px', color: 'var(--ink-500)', fontSize: 12 }}>Stores</span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ width: 28, height: 28, borderRadius: 9, background: 'var(--ink-900)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>C</div>
          </div>
          <div style={{ flex: 1, padding: '14px 30px' }}>
            <div className="t-eyebrow" style={{ marginBottom: 4 }}>Week of May 24</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 60, lineHeight: .95, letterSpacing: '-0.04em' }}>This week's lineup.</div>
            <div style={{ marginTop: 14, height: 70, background: 'var(--hot)', borderRadius: 14 }}/>
          </div>
        </div>
        <ul className="t-body-sm" style={{ paddingLeft: 18, color: 'var(--ink-700)', marginTop: 14 }}>
          <li><strong>Pros:</strong> the display type can run edge-to-edge — best for the big bold headlines.</li>
          <li><strong>Pros:</strong> better on tablet portrait where 224px sidebar gets tight.</li>
          <li><strong>Cons:</strong> tabs in a segmented control read more "settings" than "primary nav" at this scale.</li>
        </ul>
      </div>
    </div>

    <div style={{ background: 'var(--ink-900)', color: 'var(--paper)', padding: '28px 32px', borderRadius: 28, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
      <div>
        <div className="t-eyebrow" style={{ color: 'var(--sun)' }}>Recommendation</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, lineHeight: 1, marginTop: 8, letterSpacing: '-0.035em' }}>Branded sidebar.</div>
      </div>
      <p className="t-body" style={{ color: 'var(--ink-300)', maxWidth: 600 }}>
        HomePlate is a tool you live in across a week — the sidebar's persistent labels reduce cognition and keep brand always-on. Top nav looks prettier in a single screenshot; sidebar wins the daily-use test. Keep the alt in your pocket as a "compact" preference for tablet portrait later.
      </p>
    </div>
  </div>
);

Object.assign(window, { NavExplorationArtboard });
