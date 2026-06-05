// HomePlate custom icon set
// 24×24 viewBox · 1.75px stroke · round caps & joins · outlined only
// Port of design_handoff_homeplate_rebrand/references/icons.jsx

function Icon({ size = 24, stroke = 1.75, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

// ─── Navigation ──────────────────────────────────────────────────────────────

// Recipes — open book / cookbook
export function IconRecipes(p) {
  return (
    <Icon {...p}>
      <path d="M4 5.5a1.5 1.5 0 0 1 1.5-1.5H10a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 1 4 16Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 0 20 16Z" />
      <path d="M7 8h2M7 11h2M15 8h2M15 11h2" />
    </Icon>
  )
}

// Planner — calendar with check
export function IconPlanner(p) {
  return (
    <Icon {...p}>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
      <path d="M9 15.5l2 2 4-4" />
    </Icon>
  )
}

// Grocery — bag with handles
export function IconGrocery(p) {
  return (
    <Icon {...p}>
      <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
      <path d="M8.5 8V6.5a3.5 3.5 0 1 1 7 0V8" />
    </Icon>
  )
}

// Settings — gear / cog radial lines
export function IconSettings(p) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M3 12h2.5M18.5 12H21M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </Icon>
  )
}

// Home — house outline
export function IconHome(p) {
  return (
    <Icon {...p}>
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1Z" />
    </Icon>
  )
}

// Store — shopfront with awning
export function IconStore(p) {
  return (
    <Icon {...p}>
      <path d="M4 9 5.5 5h13L20 9" />
      <path d="M4 9v10h16V9" />
      <path d="M4 9c0 1.7 1.5 3 3 3s3-1.3 3-3c0 1.7 1.5 3 3 3s3-1.3 3-3c0 1.7 1.5 3 3 3s3-1.3 3-3" />
    </Icon>
  )
}

// ─── Meal types ───────────────────────────────────────────────────────────────

// Breakfast — sun with rays
export function IconBreakfast(p) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </Icon>
  )
}

// Lunch — sandwich layers
export function IconLunch(p) {
  return (
    <Icon {...p}>
      <path d="M4.5 8.5h15l-1.2-2.8a2 2 0 0 0-1.8-1.2H7.5a2 2 0 0 0-1.8 1.2L4.5 8.5Z" />
      <path d="M4 12h16" />
      <path d="M4.5 15h15l-1.2 2.8a2 2 0 0 1-1.8 1.2H7.5a2 2 0 0 1-1.8-1.2L4.5 15Z" />
    </Icon>
  )
}

// Dinner — bowl with steam
export function IconDinner(p) {
  return (
    <Icon {...p}>
      <path d="M3.5 11h17a8 8 0 0 1-8.5 8h0a8 8 0 0 1-8.5-8Z" />
      <path d="M9 7c.5-1 .5-2 0-3M13 7c.5-1 .5-2 0-3" />
    </Icon>
  )
}

// Snack — cookie with dots
export function IconSnack(p) {
  return (
    <Icon {...p}>
      <path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-5-5 4 4 0 0 1-4-4Z" />
      <circle cx="8.5" cy="13" r=".8" fill="currentColor" stroke="none" />
      <circle cx="13" cy="16" r=".8" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="11.5" r=".8" fill="currentColor" stroke="none" />
    </Icon>
  )
}

// Side — fork & spoon
export function IconSide(p) {
  return (
    <Icon {...p}>
      {/* fork */}
      <path d="M7 2v4.5M5 2v3h4V2M7 6.5V21" />
      {/* spoon */}
      <ellipse cx="17" cy="5.5" rx="2.5" ry="3.5" />
      <path d="M17 9V21" />
    </Icon>
  )
}

// Dessert — cupcake
export function IconDessert(p) {
  return (
    <Icon {...p}>
      {/* wrapper */}
      <path d="M8 13h8l-1.5 8h-5Z" />
      {/* frosting dome */}
      <path d="M5.5 13a6.5 6.5 0 0 1 13 0" />
      {/* swirl peak */}
      <path d="M12 6.5V13" />
      {/* cherry */}
      <circle cx="12" cy="4.5" r="2" />
    </Icon>
  )
}

// ─── Audience ─────────────────────────────────────────────────────────────────

// Adults — two figures, taller
export function IconAdults(p) {
  return (
    <Icon {...p}>
      <circle cx="9" cy="9" r="3" />
      <circle cx="16" cy="10" r="2.4" />
      <path d="M3.5 19c.6-2.8 2.9-4.5 5.5-4.5s4.9 1.7 5.5 4.5" />
      <path d="M14.5 19c.4-2 2-3.3 4-3.3s3.5 1.3 4 3.3" />
    </Icon>
  )
}

// Kids — single figure, smaller
export function IconKids(p) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4 20c.7-3.6 4-6 8-6s7.3 2.4 8 6" />
      <path d="M9 9.5c.6.5 1.6.5 2-.2M13 9.5c.4-.7 1.4-.7 2-.2" />
    </Icon>
  )
}

// Everyone — three figures grouped
export function IconEveryone(p) {
  return (
    <Icon {...p}>
      <circle cx="8" cy="10" r="2.5" />
      <circle cx="16" cy="10" r="2.5" />
      <circle cx="12" cy="14" r="2.2" />
      <path d="M3 19c.4-1.8 2-3 4-3M21 19c-.4-1.8-2-3-4-3M8 21c.6-2 2-3 4-3s3.4 1 4 3" />
    </Icon>
  )
}

// ─── Actions ──────────────────────────────────────────────────────────────────

// Add — plus in circle
export function IconAdd(p) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </Icon>
  )
}

// Plus — bare cross
export function IconPlus(p) {
  return (
    <Icon {...p}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  )
}

// Search — magnifying glass
export function IconSearch(p) {
  return (
    <Icon {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </Icon>
  )
}

// Made / done — check in circle
export function IconMade(p) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </Icon>
  )
}

// Check — bare checkmark
export function IconCheck(p) {
  return (
    <Icon {...p}>
      <path d="m5 12 5 5L20 7" />
    </Icon>
  )
}

// Close / X
export function IconClose(p) {
  return (
    <Icon {...p}>
      <path d="M6 6l12 12M6 18 18 6" />
    </Icon>
  )
}

// Share — three circles connected
export function IconShare(p) {
  return (
    <Icon {...p}>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8.2 11 15.8 7M8.2 13l7.6 4" />
    </Icon>
  )
}

// Edit — pencil
export function IconEdit(p) {
  return (
    <Icon {...p}>
      <path d="M4 20h4l11-11-4-4L4 16Z" />
      <path d="m14 6 4 4" />
    </Icon>
  )
}

// Trash — bin
export function IconTrash(p) {
  return (
    <Icon {...p}>
      <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6.5 7 7.5 19a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2L17.5 7" />
    </Icon>
  )
}

// Camera — photo upload
export function IconCamera(p) {
  return (
    <Icon {...p}>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4Z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </Icon>
  )
}

// ─── Controls ─────────────────────────────────────────────────────────────────

// Multiplier — stacked circles
export function IconMultiplier(p) {
  return (
    <Icon {...p}>
      <circle cx="9" cy="9" r="4" />
      <circle cx="15" cy="15" r="4" />
    </Icon>
  )
}

// Pantry Raid — lightning bolt
export function IconPantryRaid(p) {
  return (
    <Icon {...p}>
      <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />
    </Icon>
  )
}

// ─── Chevrons ─────────────────────────────────────────────────────────────────

export function IconChevronL(p) {
  return <Icon {...p}><path d="m14 6-6 6 6 6" /></Icon>
}
export function IconChevronR(p) {
  return <Icon {...p}><path d="m10 6 6 6-6 6" /></Icon>
}
export function IconChevronD(p) {
  return <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>
}
export function IconChevronU(p) {
  return <Icon {...p}><path d="m6 15 6-6 6 6" /></Icon>
}

// ─── Info / stats ─────────────────────────────────────────────────────────────

// Clock — time
export function IconClock(p) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  )
}

// Serves — person silhouette
export function IconServes(p) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c.5-3.6 3.4-6 7.5-6s7 2.4 7.5 6" />
    </Icon>
  )
}

// Fire — calories
export function IconFire(p) {
  return (
    <Icon {...p}>
      <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5 2 1 3 2 3-3Z" />
    </Icon>
  )
}

// ─── View toggles ─────────────────────────────────────────────────────────────

export function IconGrid(p) {
  return (
    <Icon {...p}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Icon>
  )
}

export function IconList(p) {
  return (
    <Icon {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="4" cy="6" r=".4" fill="currentColor" stroke="none" />
    </Icon>
  )
}

// Sparkles — AI generate
export function IconSparkle(p) {
  return (
    <Icon {...p}>
      <path d="M12 3 13.5 8.5 19 10 13.5 11.5 12 17 10.5 11.5 5 10 10.5 8.5Z" />
      <path d="M19 14 19.8 16.2 22 17 19.8 17.8 19 20 18.2 17.8 16 17 18.2 16.2Z" />
    </Icon>
  )
}

// Refresh / reset — uncheck all
export function IconRefresh(p) {
  return (
    <Icon {...p}>
      <path d="M4 12a8 8 0 0 1 8-8 8 8 0 0 1 5.7 2.3L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-8 8 8 8 0 0 1-5.7-2.3L4 16" />
    </Icon>
  )
}

// ─── Theme toggle (not in brand reference set — minimal custom) ───────────────

// Sun — light mode
export function IconSun(p) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </Icon>
  )
}

// Moon — dark mode
export function IconMoon(p) {
  return (
    <Icon {...p}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </Icon>
  )
}

// External link / open full page
export function IconExternalLink(p) {
  return (
    <Icon {...p}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </Icon>
  )
}
