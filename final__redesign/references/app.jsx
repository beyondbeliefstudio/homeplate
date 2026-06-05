// HomePlate v2 — design canvas composition

const App = () => (
  <DesignCanvas>
    <DCSection
      id="cover"
      title="HomePlate"
      subtitle="A bold consumer brand for family meal planning. May 2026."
    >
      <DCArtboard id="cover" label="Cover" width={1280} height={720}>
        <CoverArtboard />
      </DCArtboard>
    </DCSection>

    <DCSection
      id="brand"
      title="Brand foundations"
      subtitle="Logo, color, typography, shape, elevation, icons, illustration."
    >
      <DCArtboard id="logo"   label="01 · Logo"          width={1240} height={820}><LogoArtboard /></DCArtboard>
      <DCArtboard id="color"  label="02 · Color"         width={1240} height={1100}><ColorArtboard /></DCArtboard>
      <DCArtboard id="type"   label="03 · Type"          width={1240} height={1280}><TypeArtboard /></DCArtboard>
      <DCArtboard id="shape"  label="04 · Shape"         width={1240} height={680}><ShapeArtboard /></DCArtboard>
      <DCArtboard id="shadow" label="05 · Elevation"     width={1240} height={600}><ShadowArtboard /></DCArtboard>
      <DCArtboard id="icons"  label="06 · Icons"         width={1240} height={780}><IconsArtboard /></DCArtboard>
      <DCArtboard id="illos"  label="07 · Illustration"  width={1240} height={620}><IllustrationsArtboard /></DCArtboard>
    </DCSection>

    <DCSection
      id="components"
      title="Component library"
      subtitle="Buttons, inputs, cards, toggles, badges, navigation."
    >
      <DCArtboard id="buttons"  label="Buttons"     width={1100} height={680}><ButtonsArtboard /></DCArtboard>
      <DCArtboard id="inputs"   label="Inputs"      width={1100} height={840}><InputsArtboard /></DCArtboard>
      <DCArtboard id="cards"    label="Recipe + planner cards" width={1100} height={920}><CardsArtboard /></DCArtboard>
      <DCArtboard id="toggles"  label="Toggles · badges · raid" width={1100} height={820}><TogglesArtboard /></DCArtboard>
      <DCArtboard id="nav"      label="Navigation samples" width={1100} height={640}><NavArtboard /></DCArtboard>
    </DCSection>

    <DCSection
      id="desktop"
      title="Desktop screens"
      subtitle="Dashboard and Planner lead. Then Grocery, Recipes, Add Recipe."
    >
      <DCArtboard id="dashboard-d"label="Dashboard · desktop"      width={1280} height={2000}><DashboardScreen /></DCArtboard>
      <DCArtboard id="planner-d"  label="Weekly planner · desktop" width={1280} height={1100}><PlannerScreen /></DCArtboard>
      <DCArtboard id="grocery-d"  label="Grocery list · desktop"   width={1280} height={1200}><GroceryScreen /></DCArtboard>
      <DCArtboard id="recipes-d"  label="Recipe library · desktop" width={1280} height={1000}><RecipesScreen /></DCArtboard>
      <DCArtboard id="addrecipe-d"label="Add recipe · desktop"     width={1280} height={1400}><AddRecipeScreen /></DCArtboard>
    </DCSection>

    <DCSection
      id="mobile"
      title="Mobile screens"
      subtitle="iPhone-sized — pocket grocery list, in-kitchen planner."
    >
      <DCArtboard id="dashboard-m"label="Dashboard · mobile" width={390} height={844}><MobileDashboardScreen /></DCArtboard>
      <DCArtboard id="planner-m"  label="Planner · mobile"   width={390} height={844}><MobilePlannerScreen /></DCArtboard>
      <DCArtboard id="grocery-m"  label="Grocery · mobile"   width={390} height={844}><MobileGroceryScreen /></DCArtboard>
      <DCArtboard id="recipes-m"  label="Recipes · mobile"   width={390} height={844}><MobileRecipesScreen /></DCArtboard>
    </DCSection>

    <DCSection
      id="navx"
      title="Navigation exploration"
      subtitle="Sidebar vs. top nav, with a recommendation."
    >
      <DCArtboard id="nav-explore" label="Sidebar vs top nav" width={1280} height={780}><NavExplorationArtboard /></DCArtboard>
    </DCSection>
  </DesignCanvas>
);

// ===== Cover artboard =====
const CoverArtboard = () => (
  <div className="hp" style={{ background: 'var(--bg-app)', padding: '64px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
    {/* corner ornaments — flat shapes, no gradients */}
    <div style={{ position: 'absolute', top: -100, right: -60, width: 360, height: 360, borderRadius: 90, background: 'var(--hot)' }}/>
    <div style={{ position: 'absolute', bottom: -80, left: -50, width: 240, height: 240, borderRadius: 70, background: 'var(--leaf)' }}/>
    <div style={{ position: 'absolute', top: 260, left: 100, width: 64, height: 64, borderRadius: 18, background: 'var(--sun)' }}/>

    <div style={{ position: 'relative', zIndex: 2 }}>
      <div className="t-eyebrow">HomePlate · Brand &amp; UI redesign · v2</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 16 }}>
        <Mark size={72} />
        <Wordmark height={56} />
      </div>
    </div>

    <div style={{ position: 'relative', zIndex: 2 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 180, lineHeight: .86, letterSpacing: '-0.055em', maxWidth: 980 }}>
        Dinner is handled.
      </div>
      <p className="t-body-lg" style={{ marginTop: 22, maxWidth: 560, color: 'var(--ink-700)' }}>
        A meal-planning app for families. Bright, bold, deeply opinionated about cool mist and a single cherry red.
        Zoom around — brand, components, screens, all in one place.
      </p>
    </div>

    <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 26, alignItems: 'center', color: 'var(--ink-700)' }}>
      <div className="t-caption">Cool mist + a bright trio</div>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }}/>
      <div className="t-caption">Funnel Display · Geist</div>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }}/>
      <div className="t-caption">Light only · dark tokens included</div>
    </div>
  </div>
);

Object.assign(window, { App, CoverArtboard });
