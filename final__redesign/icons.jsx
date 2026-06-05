// HomePlate icons — custom set, 1.75px stroke, soft rounded
// All icons render in 24x24 viewBox. Use `size` prop to scale.

const Icon = ({ size = 24, stroke = 1.75, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children}
  </svg>
);

// Recipes — open book / cookbook
const IconRecipes = (p) => <Icon {...p}>
  <path d="M4 5.5a1.5 1.5 0 0 1 1.5-1.5H10a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 1 4 16Z" />
  <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 0 20 16Z" />
  <path d="M7 8h2M7 11h2M15 8h2M15 11h2" />
</Icon>;

// Planner — calendar with check
const IconPlanner = (p) => <Icon {...p}>
  <rect x="3.5" y="5" width="17" height="15" rx="3" />
  <path d="M8 3v4M16 3v4M3.5 10h17" />
  <path d="M9 15.5l2 2 4-4" />
</Icon>;

// Grocery — bag with handles
const IconGrocery = (p) => <Icon {...p}>
  <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
  <path d="M8.5 8V6.5a3.5 3.5 0 1 1 7 0V8" />
</Icon>;

// Settings — slider toggles
const IconSettings = (p) => <Icon {...p}>
  <circle cx="12" cy="12" r="3" />
  <path d="M12 3v2.5M12 18.5V21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M3 12h2.5M18.5 12H21M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
</Icon>;

// Add — plus in circle
const IconAdd = (p) => <Icon {...p}>
  <circle cx="12" cy="12" r="9" />
  <path d="M12 8v8M8 12h8" />
</Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;

// Search
const IconSearch = (p) => <Icon {...p}>
  <circle cx="11" cy="11" r="6.5" />
  <path d="M16 16l4 4" />
</Icon>;

// Made / done — checkmark
const IconMade = (p) => <Icon {...p}>
  <circle cx="12" cy="12" r="9" />
  <path d="M8 12.5l2.5 2.5L16 9.5" />
</Icon>;

// Audience — adults
const IconAdults = (p) => <Icon {...p}>
  <circle cx="9" cy="9" r="3" />
  <circle cx="16" cy="10" r="2.4" />
  <path d="M3.5 19c.6-2.8 2.9-4.5 5.5-4.5s4.9 1.7 5.5 4.5" />
  <path d="M14.5 19c.4-2 2-3.3 4-3.3s3.5 1.3 4 3.3" />
</Icon>;

// Audience — kids
const IconKids = (p) => <Icon {...p}>
  <circle cx="12" cy="8.5" r="3.5" />
  <path d="M4 20c.7-3.6 4-6 8-6s7.3 2.4 8 6" />
  <path d="M9 9.5c.6.5 1.6.5 2-.2M13 9.5c.4-.7 1.4-.7 2-.2" />
</Icon>;

// Audience — everyone
const IconEveryone = (p) => <Icon {...p}>
  <circle cx="8" cy="10" r="2.5" />
  <circle cx="16" cy="10" r="2.5" />
  <circle cx="12" cy="14" r="2.2" />
  <path d="M3 19c.4-1.8 2-3 4-3M21 19c-.4-1.8-2-3-4-3M8 21c.6-2 2-3 4-3s3.4 1 4 3" />
</Icon>;

// Multiplier — stacked circles
const IconMultiplier = (p) => <Icon {...p}>
  <circle cx="9" cy="9" r="4" />
  <circle cx="15" cy="15" r="4" />
</Icon>;

// Pantry raid — lightning bolt / wildcard
const IconPantryRaid = (p) => <Icon {...p}>
  <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />
</Icon>;

// Breakfast — sun
const IconBreakfast = (p) => <Icon {...p}>
  <circle cx="12" cy="12" r="4" />
  <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
</Icon>;

// Lunch — sandwich (two stacked lines)
const IconLunch = (p) => <Icon {...p}>
  <path d="M4.5 8.5h15l-1.2-2.8a2 2 0 0 0-1.8-1.2H7.5a2 2 0 0 0-1.8 1.2L4.5 8.5Z" />
  <path d="M4 12h16" />
  <path d="M4.5 15h15l-1.2 2.8a2 2 0 0 1-1.8 1.2H7.5a2 2 0 0 1-1.8-1.2L4.5 15Z" />
</Icon>;

// Dinner — bowl with steam
const IconDinner = (p) => <Icon {...p}>
  <path d="M3.5 11h17a8 8 0 0 1-8.5 8h0a8 8 0 0 1-8.5-8Z" />
  <path d="M9 7c.5-1 .5-2 0-3M13 7c.5-1 .5-2 0-3" />
</Icon>;

// Snack — cookie
const IconSnack = (p) => <Icon {...p}>
  <path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-5-5 4 4 0 0 1-4-4Z" />
  <circle cx="8.5" cy="13" r=".8" fill="currentColor" />
  <circle cx="13" cy="16" r=".8" fill="currentColor" />
  <circle cx="15.5" cy="11.5" r=".8" fill="currentColor" />
</Icon>;

// Side — fork & spoon (supporting cutlery)
const IconSide = (p) => <Icon {...p}>
  <path d="M8 3v6c0 1.1-.9 2-2 2H5v10" />
  <path d="M8 3v18" />
  <path d="M5 3v4M11 3v4" />
  <ellipse cx="17" cy="6" rx="2.2" ry="3.5" />
  <path d="M17 9.5v11.5" />
</Icon>;

// Dessert — cupcake
const IconDessert = (p) => <Icon {...p}>
  <path d="M6 13h12l-1.3 6.6a2 2 0 0 1-2 1.4H9.3a2 2 0 0 1-2-1.4L6 13Z" />
  <path d="M5 13a4 4 0 0 1 3.5-4 3 3 0 0 1 7 0A4 4 0 0 1 19 13" />
  <path d="M12 6V3.5" />
  <circle cx="12" cy="3" r=".6" fill="currentColor" />
</Icon>;

// Misc utility icons used in screens
const IconShare = (p) => <Icon {...p}>
  <circle cx="6" cy="12" r="2.4" />
  <circle cx="18" cy="6" r="2.4" />
  <circle cx="18" cy="18" r="2.4" />
  <path d="M8.2 11 15.8 7M8.2 13l7.6 4" />
</Icon>;
const IconChevronL = (p) => <Icon {...p}><path d="m14 6-6 6 6 6" /></Icon>;
const IconChevronR = (p) => <Icon {...p}><path d="m10 6 6 6-6 6" /></Icon>;
const IconChevronD = (p) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>;
const IconChevronU = (p) => <Icon {...p}><path d="m6 15 6-6 6 6" /></Icon>;
const IconClose = (p) => <Icon {...p}><path d="M6 6l12 12M6 18 18 6" /></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
const IconServes = (p) => <Icon {...p}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c.5-3.6 3.4-6 7.5-6s7 2.4 7.5 6" /></Icon>;
const IconFire = (p) => <Icon {...p}>
  <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5 2 1 3 2 3-3Z" />
</Icon>;
const IconHome = (p) => <Icon {...p}><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1Z" /></Icon>;
const IconStore = (p) => <Icon {...p}>
  <path d="M4 9 5.5 5h13L20 9" />
  <path d="M4 9v10h16V9" />
  <path d="M4 9c0 1.7 1.5 3 3 3s3-1.3 3-3c0 1.7 1.5 3 3 3s3-1.3 3-3c0 1.7 1.5 3 3 3s3-1.3 3-3" />
</Icon>;
const IconTrash = (p) => <Icon {...p}>
  <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  <path d="M6.5 7 7.5 19a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2L17.5 7" />
</Icon>;
const IconEdit = (p) => <Icon {...p}>
  <path d="M4 20h4l11-11-4-4L4 16Z" />
  <path d="m14 6 4 4" />
</Icon>;
const IconCheck = (p) => <Icon {...p}><path d="m5 12 5 5L20 7" /></Icon>;
const IconGrid = (p) => <Icon {...p}>
  <rect x="4" y="4" width="7" height="7" rx="1.5" />
  <rect x="13" y="4" width="7" height="7" rx="1.5" />
  <rect x="4" y="13" width="7" height="7" rx="1.5" />
  <rect x="13" y="13" width="7" height="7" rx="1.5" />
</Icon>;
const IconList = (p) => <Icon {...p}>
  <path d="M4 6h16M4 12h16M4 18h16" />
  <circle cx="4" cy="6" r=".4" fill="currentColor" />
</Icon>;
const IconCamera = (p) => <Icon {...p}>
  <path d="M4 8h3l1.5-2h7L17 8h3v11H4Z" />
  <circle cx="12" cy="13.5" r="3.5" />
</Icon>;

// ── Theme-aware sidebar logo ─────────────────────────────────────────────
const SidebarLogo = () => {
  const [dark, setDark] = React.useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  );
  React.useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.getAttribute('data-theme') === 'dark')
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return (
    <div style={{ padding: '4px 8px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
      {dark
        ? <Mark variant="plate" size={34} tile={false} color="#fff" />
        : <Mark variant="plate" size={34} tile />}
      <span style={{ color: '#fff' }}><Wordmark mono size={20} /></span>
    </div>
  );
};

// ── Theme toggle ─────────────────────────────────────────────────────────────
const ThemeToggle = () => {
  const [dark, setDark] = React.useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  );
  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('hp-theme', next);
    setDark(!dark);
  };
  return (
    <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 34, padding: '0 12px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
      <span style={{ fontSize: 13 }}>{dark ? '\u2600\ufe0e' : '\u263d'}</span>
      <span>{dark ? 'Light mode' : 'Dark mode'}</span>
      <div style={{ marginLeft: 'auto', width: 30, height: 17, borderRadius: 9, background: 'rgba(255,255,255,0.15)', position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2.5, left: dark ? 15 : 2.5, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left 0.18s', opacity: 0.9 }} />
      </div>
    </button>
  );
};

Object.assign(window, {
  IconRecipes, IconPlanner, IconGrocery, IconSettings, IconAdd, IconPlus,
  IconSearch, IconMade, IconAdults, IconKids, IconEveryone, IconMultiplier,
  IconPantryRaid, IconBreakfast, IconLunch, IconDinner, IconSnack, IconSide, IconDessert,
  IconShare, IconChevronL, IconChevronR, IconChevronD, IconChevronU, IconClose,
  IconClock, IconServes, IconFire, IconHome, IconStore, IconTrash, IconEdit, IconCheck,
  IconGrid, IconList, IconCamera,
  ThemeToggle, SidebarLogo,
});
