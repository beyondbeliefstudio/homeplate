# Handoff: HomePlate v5 — Full Design System + Desktop & Mobile Screens

## Overview

HomePlate is a family meal-planning app with five core surfaces:
- **Dashboard** — weekly at-a-glance, tonight's dinner, stats, activity
- **Planner** — weekly meal planning grid (Dinner/Lunch/Breakfast/Snacks) with sides and notes
- **Recipes** — cookbook with search, category filters, and recipe detail panel
- **Grocery** — auto-generated shopping list from the week's plan, organized by aisle
- **Settings** — household members, stores, planner prefs, tags, AI, appearance

The existing app is functionally complete. This handoff documents the **v5 visual design**: every token, component, layout, and interaction. The developer's job is to apply this design to the real codebase — not ship the reference HTML directly.

---

## About the design files

All files in this folder are **high-fidelity HTML/React prototypes** — design references only. They demonstrate exact colors, typography, spacing, interactions, and component patterns. They are not production code.

Apply the design to the target codebase using whatever framework, component library, and styling approach it already uses. If a discrepancy exists between this README and the HTML, the README wins.

**Key design files (root of project):**

| File | What it covers |
|------|---------------|
| `ds.css` | Full design token CSS — source of truth for all values |
| `Dashboard.html` | Desktop dashboard screen |
| `Planner.html` | Desktop planner screen |
| `Recipes.html` | Desktop recipes/cookbook screen |
| `Grocery.html` | Desktop grocery list screen |
| `Settings.html` | Desktop settings screen |
| `Mobile App.html` | Full mobile app — all 4 tabs + settings sheet |
| `icons.jsx` | All app icons (SVG components) |
| `ds-foodicons.jsx` | Food category illustration icons |
| `ds-logo.jsx` | Wordmark + logomark components |
| `mobile.jsx` | Mobile: Recipes screen + AccountSheet + MobileTabBar |
| `mobile-planner.jsx` | Mobile: Planner screen (full CRUD) |
| `mobile-dashboard.jsx` | Mobile: Dashboard screen |
| `mobile-grocery.jsx` | Mobile: Grocery screen |

---

## Fidelity

**High-fidelity.** All hex values, font sizes, weights, spacing, radius values, and interaction states are exact. Recreate pixel-faithfully.

---

## Design tokens

All tokens live in `ds.css`. Below is the full list.

### Color palette

#### Surfaces
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-app` | `#F7F8F5` | App background (barely green-gray off-white) |
| `--bg-app-2` | `#EEF0EA` | Alt section bands |
| `--paper` | `#FFFFFF` | Card backgrounds |
| `--paper-off` | `#FAFBF8` | Nested card surface, inset rows |

#### Warm neutrals (olive-tinted)
| Token | Value |
|-------|-------|
| `--ink-900` | `#20241C` |
| `--ink-800` | `#2D3227` |
| `--ink-700` | `#3E443A` |
| `--ink-600` | `#565C4F` |
| `--ink-500` | `#6E7466` |
| `--ink-400` | `#969B8C` |
| `--ink-300` | `#BCC0B2` |
| `--ink-200` | `#DBDDD0` |
| `--ink-100` | `#ECEDE2` |
| `--ink-50` | `#F4F5EC` |

#### Primary — Grass green
| Token | Value |
|-------|-------|
| `--green` | `#5BA63C` |
| `--green-600` | `#4A8B30` |
| `--green-700` | `#3A7024` |
| `--green-200` | `#C2DFAA` |
| `--green-100` | `#DCF0C5` |
| `--green-50` | `#EEF7E1` |

#### Accent — Orange
| Token | Value |
|-------|-------|
| `--orange` | `#F0913C` |
| `--orange-600` | `#D2741E` |
| `--orange-100` | `#FAE0C0` |
| `--orange-50` | `#FDF0E1` |

#### Accent — Yellow
| Token | Value |
|-------|-------|
| `--yellow` | `#F4C233` |
| `--yellow-600` | `#CE9C12` |
| `--yellow-100` | `#FBEDB5` |
| `--yellow-50` | `#FEF8DC` |

#### Accent — Lime
| Token | Value |
|-------|-------|
| `--lime` | `#A6C948` |
| `--lime-100` | `#E5EFBF` |
| `--lime-50` | `#F2F7E0` |

#### Semantic
| Token | Value |
|-------|-------|
| `--success` | `var(--green)` |
| `--warning` | `var(--yellow)` |
| `--danger` | `#DA4A36` |
| `--sidebar` | `var(--green-700)` — `#3A7024` |

### Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--r-xs` | `2px` | Tiny accents |
| `--r-sm` | `4px` | Small chips, tags |
| `--r-md` | `5px` | Buttons, inputs |
| `--r-lg` | `7px` | Cards, sections |
| `--r-xl` | `8px` | Larger cards |
| `--r-2xl` | `10px` | Search bars |
| `--r-pill` | `9999px` | Badges, pills |

### Elevation
| Token | Value |
|-------|-------|
| `--shadow-1` | `0 1px 2px rgba(32,36,28,.05)` |
| `--shadow-2` | `0 3px 10px rgba(32,36,28,.07)` |
| `--shadow-3` | `0 10px 26px rgba(32,36,28,.10)` |
| `--shadow-4` | `0 18px 40px rgba(32,36,28,.13)` |

### Typography
| Token | Value |
|-------|-------|
| `--font-display` | `'Clash Grotesk'` (fallback: `ui-sans-serif`) |
| `--font-body` | `'General Sans'` (fallback: `ui-sans-serif`) |
| `--font-mono` | `'Geist Mono'` (fallback: `ui-monospace`) |

#### Type scale (from ds.css)
| Class | Font | Weight | Size | Line-height | Letter-spacing |
|-------|------|--------|------|-------------|----------------|
| `.t-display` | display | 700 | 76px | 0.98 | -0.03em |
| `.t-h1` | display | 700 | 52px | 1.02 | -0.025em |
| `.t-h2` | display | 700 | 36px | 1.06 | -0.02em |
| `.t-h3` | display | 700 | 24px | 1.12 | -0.015em |
| `.t-h4` | body | 700 | 18px | 1.25 | -0.01em |
| `.t-eyebrow` | body | 600 | 11px | 1 | 0.12em, uppercase |
| `.t-body-lg` | body | 400 | 17px | 1.55 | — |
| `.t-body` | body | 400 | 15px | 1.55 | — |
| `.t-body-sm` | body | 400 | 13px | 1.5 | — |
| `.t-label` | body | 600 | 13px | 1.2 | -0.005em |
| `.t-caption` | body | 500 | 11px | 1.3 | — |
| `.t-mono` | mono | 400 | 12px | — | — |
| `.t-num-lg` | display | 700 | 48px | 0.92 | -0.03em |
| `.t-num-md` | display | 700 | 30px | 0.98 | -0.02em |

**Mobile headings (scaled down from desktop):**
All mobile page h1s use `font-family: var(--font-display), font-weight: 500, font-size: 34px, letter-spacing: -0.04em, line-height: 0.95`.

### Buttons
```
.btn base: inline-flex, align-items center, gap 8px,
          font-family body, font-weight 600,
          border-radius var(--r-md),
          transition 0.14s ease

Sizes: lg(50px/22px pad/15px), md(42px/18px pad/14px), sm(34px/14px pad/13px)

Variants:
  .btn-primary   bg:--green          color:#fff   hover:--green-600
  .btn-secondary bg:--ink-900        color:#fff   hover:#000
  .btn-accent    bg:--orange         color:#fff   hover:--orange-600
  .btn-ghost     bg:--paper          color:--ink-900  border:--ink-200  hover:--ink-50
  .btn-quiet     bg:--green-50       color:--green-600  hover:--green-100
  .btn-icon      40×40px, no padding, --r-sm
```

### Chips
```
height:30px  padding:0 12px  border-radius:--r-sm
font:body/600/12px  bg:--ink-50  color:--ink-700
.chip-pill  border-radius:--r-pill
.chip-on    bg:--green  color:#fff
.chip-out   bg:--paper  border:--ink-200
```

### Cards
```
.card        bg:--paper  border-radius:--r-lg
.card-out    bg:--paper  border-radius:--r-lg  border:1px solid --ink-100
.card-lifted bg:--paper  border-radius:--r-lg  box-shadow:--shadow-2
```

---

## Dark mode

Dark mode is token-only — no separate component code needed. Toggle by setting `data-theme="dark"` on `<html>`. Full dark overrides are in `ds.css`. Key values:

| Token | Dark value |
|-------|-----------|
| `--bg-app` | `#0F1510` |
| `--paper` | `#182016` |
| `--ink-900` | `#ECF2E8` |
| `--ink-500` | `#6D8268` |
| `--sidebar` | `#111A0E` |

---

## Desktop layout

### Navigation
- **Sidebar**: 220px wide, `var(--green-700)` background, sticky full-height
- **Logo**: `Wordmark` component (see `ds-logo.jsx`) at top, 26px height
- **Nav items**: 42px height, 12px left/right padding, `var(--r-md)` radius. Active: `rgba(255,255,255,0.18)` bg, white text, weight 600. Inactive: `rgba(255,255,255,0.55)` text.
- **Settings link**: bottom of sidebar, same style as nav items
- **User avatar**: bottom of sidebar — gradient circle (orange→yellow→lime→green, 135°) 32px, user initial in white Clash Grotesk 700/14px

### Page structure
All pages follow: `display:flex, height:100vh, overflow:hidden`
- Left sidebar (220px, fixed)
- Right `<main>`: `flex:1, overflow-y:auto, padding:32px 40px 48px`

### Page headings (all screens)
```
Eyebrow (.t-eyebrow): "Dashboard" / "Planner" / "Grocery" / "Cookbook · N recipes"
h1: 72px, weight 500, letter-spacing -0.03em
  Dashboard: "Hey Claire."
  Planner:   "This week."
  Recipes:   "The cookbook."
  Grocery:   "The list."
  Settings:  "Settings."
```

---

## Desktop screens

### Dashboard

**Sections in order:**
1. **Tonight hero card** — `var(--green-700)` bg, white text, 24px radius, 24px padding. Eyebrow: "Tonight · [Day]". Recipe name in Clash Grotesk 20px/600. Sides in 11px body. Meta chips (Everyone/Cook time) in `rgba(255,255,255,0.14)` bg. "Open recipe →" button in white with `var(--green-700)` text.

2. **Stats row** (3 tiles): Dinners (`var(--ink-900)`, white text), Grocery (`var(--green)`, white text), Streak (`var(--yellow-50)`, `var(--yellow-600)` text). Each: 12px border-radius, 12×14px padding, 10px eyebrow, 28px display number, 11px sub-label.

3. **Week at a glance** — scrollable horizontal row, 3 cards visible, each `calc((100%-16px)/3)` wide min 100px. Card: `var(--paper)` bg, `1px solid var(--ink-100)` border, 12px radius, 12px padding. Day name (9px eyebrow), date number (16px display/700), color bar (3px, category color), meal name (12px/600, 2-line clamp).

4. **Cooking this week** — `var(--paper)` card, border. Each row: 42px height, 34×34px day badge (category color bg, white initials), name (600/13px), sides (10px/400), audience tag (Kids=yellow-50/yellow-600, Adults=ink-50/ink-500), check-off box.

5. **Pantry watch** — list of low items, yellow dot (7px square, 2px radius), name + note, "+ Add" ghost button.

6. **Cook time** — bar chart (7 bars, S–S), total hours, avg per night.

7. **Audience mix** — stacked bar + legend (Everyone/Adults/Kids).

8. **Most cooked 30d** — ranked list, 4px left color bar per entry.

9. **Try this week** — `var(--ink-900)` card, `var(--yellow-600)` eyebrow, white recipe name 18px/600, body text in `rgba(255,255,255,0.5)`, meta chips.

10. **Recent activity** — avatar (28×28px, colored), who + what + when.

---

### Planner

**Structure:**
- Header: "Planner" eyebrow, "This week." h1, week nav (`‹ date ›` in ghost buttons)
- 4 collapsible sections: Dinners, Lunches, Breakfasts, Snacks & Bakes
- Section header: `var(--green-700)` bg, 9px uppercase eyebrow label (white/80%), count badge, chevron
- Each meal row: 16px checkbox (3px radius), type badge (Out=orange-100/orange-600, Pantry=ink-100/ink-500), recipe name, sides, Rory ✓ badge (green-50/green-700), serve-count selector
- Add buttons: "+ Recipe", "+ Pantry", "+ Dining out" in dashed ghost style
- Sides panel: indented, lighter bg, own add buttons
- Week notes card: same green header, bullet list with delete

---

### Recipes

**Structure:**
- Header with search bar (60px, 18px radius), category filter chips, tag filter chips, Rory filter
- **List view** (default): each recipe as a `var(--paper)` card, `var(--r-lg)` border, `1px solid var(--ink-100)`. 52×52px thumbnail (food icon or photo), category eyebrow, recipe name (600/14px, 2-line clamp), cook time + serves.
- **Detail panel**: slides in from right (desktop), bottom sheet (mobile). Hero photo/icon, category chip, title, Rory badge, meta chips, ingredient rows, numbered instructions, notes.

**Category colors:**
```
Breakfast: var(--yellow-50)    Lunch: var(--orange-50)    Dinner: var(--ink-50)
Side:      var(--green-50)     Snack: var(--lime-50)      Dessert: var(--yellow-50)
```

---

### Grocery

**Structure:**
- Header: "The list." h1, week nav
- Progress bar card: `N of total got`, percentage, green fill bar
- Store filter chips: All / Aldi / Publix / Untagged
- **From your plan** — aisle groups (collapsible on mobile):
  - Header: 7px square color dot, uppercase label, count
  - Each row: checkbox (18px, 3px radius), **qty** (monospace/700/12px, ink-800) + **unit** (body/11px, ink-500) left side, item name (body/13px) right side. Source recipe subtitle (10px, ink-400). Store chip (Aldi=green-50/green-700, Publix=orange-50/orange-600, untagged=dashed ghost).
- **Added for this week** — quick-add input
- **Check your pantry** — checklist of pantry staples
- **Always on my list** — saved staples with add/remove

---

### Settings

6 sections via left nav (196px): Household, Tags & Filters, Stores, Planner, AI & Recommendations, Appearance.

**Household**: editable member cards (2-col grid), each with: 46px gradient avatar, name input, role input, dietary notes input, meal approval tracking toggle.

**Tags & Filters**: per-category (Dinner/Lunch/Breakfast/Side/Snack/Dessert/Beverage) tag chip sets with add/remove.

**Stores**: list of stores with color-coded badges. Add/rename/delete. Color palettes cycle through 4 preset oklch values.

**Planner**: week-start toggle (Sun/Mon), default slot chips, reminder toggle.

**AI**: summary toggle, protein nudge toggle, re-suggest threshold slider (1–12 weeks), recommendation count slider (2–8).

**Appearance**: Light / Dark / Auto segmented control + visual preview swatches.

---

## Mobile layout

### iOS frame
- Device: 402×874px, 48px border-radius
- Dynamic Island: 126×37px pill at y:11
- Status bar: position:absolute, top:0, z-index:55 (always above content)
- Home indicator: 139×5px at bottom

### Bottom tab bar
```
position:absolute, bottom:20px, left/right:12px
background:--paper, border-radius:28px
box-shadow: 0 8px 28px rgba(32,36,28,.12), 0 0 0 1px --ink-100
Tabs: Home / Planner / Recipes / Grocery / Profile
Tab width: flex:1, padding:13px 6px, border-radius:20px
Active: background:var(--green-700), color:#fff
Inactive: transparent bg, color:--ink-500
Icons: 20px. Profile tab: 20×20px gradient circle (orange→yellow→lime→green, 135°) with initials.
```

### Sticky headers (all screens)
```
position:absolute, top:0, left:0, right:0, z-index:10
paddingTop:62px (below status bar), paddingBottom:10px, padding left/right:14px
background:var(--bg-app), borderBottom: 1px solid --ink-100
Content: Wordmark (18px) left. Right side varies:
  Planner & Grocery: week nav pill (‹ date ›), height 28px, 1px --ink-200 border, radius:8px
  Dashboard: date string (11px/600/--ink-400)
  Recipes: wordmark only
Scroll container: paddingTop:106-110px
```

### Mobile page headings (all screens)
```
Eyebrow: font-body/600/10px, letter-spacing:0.12em, uppercase, --ink-500
h1: font-display/500/34px, line-height:0.95, letter-spacing:-0.04em, --ink-900
```

### Mobile screens

#### Dashboard
- Tonight hero: `var(--green-700)`, white text, 14px radius, 16px padding
- 3 stat tiles: flex row, gap:8px. Dinners (ink-900/white), Grocery (green/white), Streak (yellow-50/yellow-600)
- Week at a glance: horizontal scroll, 3 cards wide, `var(--r-lg)`, 12px padding, snap scrolling
- Cooking this week: `var(--paper)` card, 34×34px day badge, rows 10px pad
- Pantry watch: low items with yellow dots, "+ Add" buttons
- Cook time: 44px bar chart
- Audience mix + Most cooked: 2-col grid
- Try this week: `var(--ink-900)` dark card
- Recent activity: avatar list

#### Planner
- Same CRUD as desktop: add recipe/pantry/dining out via bottom sheets, sides panel, week notes
- Section headers: `var(--green-700)`, 10px uppercase label, chevron
- Meal rows: 10×12px padding, 16px checkbox, 12px font-body name, 9px Rory badge
- Add buttons: 26px height, dashed border
- Bottom sheets: 95% height, 16px border-radius, spring animation (cubic-bezier(0.22,1,0.36,1) 320ms)

#### Recipes
- Each recipe: individual `var(--paper)` card, `var(--r-lg)` border, 52×52px thumbnail, 2-line name clamp
- Search: 38px height, `var(--r-xl)`
- Filter chips: 27px height, `var(--r-sm)`
- Detail sheet: 90% height, bottom sheet. Hero (150px photo or 100px icon placeholder), category chip, title 20px, meta chips, ingredient rows (9px pad), numbered steps (20px circle), notes.

#### Grocery
- Collapsible aisle sections: tappable header (color dot + uppercase label + chevron), items below
- Each row: 18px checkbox, 9×12px padding, item info
- Added / Pantry / Always sections: `var(--green-50)` header, collapsible
- Store picker: bottom sheet, list of stores
- Quick-add: flex row, 36px input + 36px button

#### Settings (bottom sheet, 95% height)
- Section nav: horizontal scrollable chips at top (28px height)
- 6 sections: Profile / Household / Stores / Planner / Tags / AI
- Setting rows: 13px padding top/bottom, 1px --ink-100 divider
- Toggles: 40×23px, green when on, with 18px white thumb

---

## Interactions & animations

### Bottom sheets (mobile)
- Trigger: tap or state change
- Backdrop: `rgba(14,18,18,0.45)`, fade 250ms
- Sheet: `translateY(100%)` → `translateY(0)`, `cubic-bezier(0.22,1,0.36,1)` 320ms
- Dismiss: tap backdrop or ✕ button, reverse animation 300ms

### Checkboxes
- 16–18px square, 3px border-radius
- Unchecked: `1.5px solid --ink-300`, transparent bg
- Checked: no border, `var(--green)` bg, white ✓ (9px/800 weight)
- Transition: all 0.12s

### Toggles
- 40×23px pill, thumb 18×18px
- Off: `var(--ink-200)` bg, thumb at left:2.5px
- On: `var(--green)` bg, thumb at left:19px
- Transition: background 0.2s, left 0.18s

### Collapsible sections
- Chevron rotates 90° when open, `transition: transform 0.16–0.18s`
- Content appears/disappears immediately (no height animation needed)

### Cards (desktop hover)
- Recipe list rows: `background: var(--paper-off)` on hover, `transition 0.12s`

### FAB (Recipes mobile)
- `position:absolute, bottom:90px, right:16px, z-index:19`
- 46×46px circle, `var(--green)` bg
- `box-shadow: 0 4px 14px rgba(91,166,60,0.38)`

---

## Component inventory

### Icons
All icons live in `icons.jsx`. They are inline SVG components accepting `size` and `style` props. Key icons: `IconHome`, `IconPlanner`, `IconRecipes`, `IconGrocery`, `IconSettings`, `IconPlus`, `IconSearch`, `IconClose`, `IconChevronR`, `IconChevronL`, `IconClock`, `IconServes`, `IconTrash`, `IconFire`.

### Food icons
In `ds-foodicons.jsx`: `FoodBreakfast`, `FoodLunch`, `FoodDinner`, `FoodSide`, `FoodBeverage`. Used as recipe category illustrations.

### Logo
In `ds-logo.jsx`: `Wordmark` (accepts `height` prop), `Mark`, `SidebarLogo`. The wordmark renders "Home" in `var(--ink-900)` and "Plate" in `var(--green)` using Clash Grotesk.

### Rory ✓ badge
```
font-size: 10–11px, font-weight: 600
color: var(--green-700), background: var(--green-50)
padding: 2px 7px, border-radius: var(--r-pill)
border: 1px solid var(--green-100)
```

### "Out" badge (dining out items)
```
font-size: 8–9px, font-weight: 700, uppercase
background: var(--orange-100), color: var(--orange-600)
padding: 1–2px 4–5px, border-radius: 2–3px
```

### Store chips (Aldi / Publix)
```
Aldi:   bg:--green-50   color:--green-700   border:--green-200
Publix: bg:--orange-50  color:--orange-600  border:--orange-100
```

---

## Assets

- **Fonts**: Clash Grotesk (display), General Sans (body), Geist Mono (mono) — loaded from Fontshare and Google Fonts CDN
- **Custom fonts**: Tanker (`uploads/Tanker-Regular.otf`), Quilon (`uploads/Quilon-Variable.ttf`) — variable font, available for display use
- **Recipe photos**: `uploads/pizza.png`, `uploads/tortellini bake.png` — sample food photography
- **Logo**: SVG-based, defined in `ds-logo.jsx`

---

## Data model (reference — match your existing schema)

**Recipe**: `id, name, cat (Breakfast|Lunch|Dinner|Side|Snack|Dessert|Beverage), prep (min), cook (min), serves, rory (bool), photo?, ingredients [{qty, unit, name}], instructions [string], notes?, tags [], nutrition?`

**Planner item**: `id, type (recipe|pantry|diningout), name, rory, sides [{id, type, name, rory}]`

**Grocery item**: `id, qty, unit, name, src (recipe name), store (null|'aldi'|'publix'|...), bundled?`

**Household member**: `id, name, role, initials, color, dietary, approvalTracking`

---

## Notes for the developer

1. **Token translation**: Convert the CSS custom properties in `ds.css` into whatever token format your codebase uses (Tailwind config, SCSS vars, JS theme object). All values are in the file verbatim.

2. **Font loading**: Clash Grotesk and General Sans are loaded from Fontshare (`api.fontshare.com`). In a production app you'll want to self-host or use a licensed copy. Tanker and Quilon are self-hosted via `@font-face` — the OTF/TTF files are in `uploads/`.

3. **Mobile vs desktop**: The designs are separate — `Mobile App.html` for mobile, individual `*.html` files for desktop. Same tokens, same data, different layouts.

4. **Dark mode**: Implemented as a CSS `[data-theme="dark"]` override block in `ds.css`. Toggle by setting the attribute on `<html>`. No JS-heavy theming system required.

5. **Rory ✓ system**: "Rory" is a child household member. Any recipe or meal can be flagged as Rory-approved (`rory: true`). This flag surfaces as a green badge on recipe cards, list rows, and planner items throughout.

6. **Sidebar color**: The desktop sidebar uses `var(--green-700)` = `#3A7024`. This is a key brand moment — dark olive green, not black.

7. **The week nav pill**: Used on Planner, Grocery (desktop + mobile). A compact `‹ Jun 3–9 ›` control with borderRadius:8px and a 1px `--ink-200` border.
