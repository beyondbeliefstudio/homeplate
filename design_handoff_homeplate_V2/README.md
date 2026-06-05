# HomePlate Design System & Dashboard — Claude Code Handoff

## Overview
HomePlate is a family meal-planning app. This package contains the complete design system (tokens, typography, color, components, icons) and a high-fidelity dashboard mockup. The goal is to implement these designs in the production codebase.

## About the Design Files
The files in this bundle are **HTML/React/CSS design references** — high-fidelity prototypes built to show exact intended look, layout, and behavior. They are **not** production code to copy directly. Your task is to **recreate these designs in the target codebase's existing framework** (React, Next.js, React Native, etc.) using its established patterns, component libraries, and routing. The design tokens in `ds.css` translate directly to whatever token system you use (CSS custom properties, Tailwind config, styled-system theme, etc.).

## Fidelity
**High-fidelity.** Colors, typography, spacing, radius, shadows, and component styles are final and should be matched as closely as possible. Mock content (names, dates, recipe titles) should be replaced with real data from your data layer.

---

## Design System

### Fonts
Load via Fontshare + Google Fonts (already in `ds.css`). Both must be loaded before rendering.

| Role | Family | Weights |
|------|--------|---------|
| Display / Headlines | Clash Grotesk | 400, 500, 600, 700 |
| Body / UI | General Sans | 400, 500, 600, 700 |
| Monospace | Geist Mono | 400, 500 |

**Google Fonts import:**
```
https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap
```
**Fontshare import:**
```
https://api.fontshare.com/v2/css?f[]=clash-grotesk@400,500,600,700&f[]=general-sans@400,500,600,700&display=swap
```

### Color Tokens

#### Canvas & Surfaces
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-app` | `#F7F8F5` | Page background |
| `--paper` | `#FFFFFF` | Card / surface background |
| `--paper-off` | `#FAFBF8` | Subtle surface (card footers) |

#### Primary — Green
| Token | Value |
|-------|-------|
| `--green` | `#5BA63C` |
| `--green-600` | `#4A8B30` |
| `--green-700` | `#3A7024` |
| `--green-100` | `#DCF0C5` |
| `--green-50` | `#EEF7E1` |

#### Spectrum Accents (orange → yellow → lime → green)
| Token | Value | Usage |
|-------|-------|-------|
| `--orange` | `#F0913C` | Spectrum start, warm accent |
| `--orange-600` | `#D2741E` | Hover |
| `--orange-100` | `#FAE0C0` | Tint |
| `--orange-50` | `#FDF0E1` | Tint |
| `--yellow` | `#F4C233` | Spectrum mid |
| `--yellow-100` | `#FBEDB5` | Tint |
| `--lime` | `#A6C948` | Spectrum bridge |
| `--lime-100` | `#E5EFBF` | Tint |

#### Warm Neutrals
| Token | Value |
|-------|-------|
| `--ink-900` | `#20241C` |
| `--ink-700` | `#3E443A` |
| `--ink-600` | `#565C4F` |
| `--ink-500` | `#6E7466` |
| `--ink-400` | `#969B8C` |
| `--ink-300` | `#BCC0B2` |
| `--ink-200` | `#DBDDD0` |
| `--ink-100` | `#ECEDE2` |
| `--ink-50` | `#F4F5EC` |

#### Semantic
| Token | Points to |
|-------|-----------|
| `--success` | `--green` |
| `--warning` | `--yellow` |
| `--danger` | `#DA4A36` |

#### The Spectrum Gradient
Used liberally throughout the UI — borders, progress bars, charts, CTAs, data viz:
```css
linear-gradient(90deg, var(--orange), var(--yellow), var(--lime), var(--green))
```

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--r-xs` | `5px` | Tiny chips |
| `--r-sm` | `7px` | Chips, icon buttons |
| `--r-md` | `9px` | Buttons, inputs |
| `--r-lg` | `12px` | Cards (primary) |
| `--r-xl` | `14px` | Larger cards |
| `--r-2xl` | `18px` | Modal sheets |
| `--r-pill` | `9999px` | Pill chips, avatars |

### Elevation / Shadows
```css
--shadow-1: 0 1px 2px rgba(32,36,28,.05)
--shadow-2: 0 3px 10px rgba(32,36,28,.07)
--shadow-3: 0 10px 26px rgba(32,36,28,.10)
--shadow-4: 0 18px 40px rgba(32,36,28,.13)
```

### Typography Scale
| Class | Font | Weight | Size | Line-height | Letter-spacing |
|-------|------|--------|------|-------------|----------------|
| display | Clash Grotesk | 700 | 76px | 0.98 | -0.03em |
| h1 | Clash Grotesk | 700 | 52px | 1.02 | -0.025em |
| h2 | Clash Grotesk | 700 | 36px | 1.06 | -0.02em |
| h3 | Clash Grotesk | 700 | 24px | 1.12 | -0.015em |
| h4 | General Sans | 700 | 18px | 1.25 | -0.01em |
| eyebrow | General Sans | 600 | 11px | 1 | 0.12em uppercase |
| body-lg | General Sans | 400 | 17px | 1.55 | — |
| body | General Sans | 400 | 15px | 1.55 | — |
| body-sm | General Sans | 400 | 13px | 1.5 | — |
| label | General Sans | 600 | 13px | 1.2 | -0.005em |
| caption | General Sans | 500 | 11px | 1.3 | — |

### Buttons
All buttons: `border-radius: var(--r-md)` (9px), `font-family: General Sans`, `font-weight: 600`.

| Variant | Background | Color | Border | Hover bg |
|---------|------------|-------|--------|----------|
| primary | `--green` | white | none | `--green-600` |
| secondary | `--ink-900` | white | none | black |
| accent | `--orange` | white | none | `--orange-600` |
| ghost | white | `--ink-900` | `1px solid --ink-200` | `--ink-50` |
| quiet | `--green-50` | `--green-600` | none | `--green-100` |
| gradient CTA | spectrum gradient | `--ink-900` (dark) | none | darken |

Sizes:
- lg: height 50px, padding 0 22px, font-size 15px
- md: height 42px, padding 0 18px, font-size 14px
- sm: height 34px, padding 0 14px, font-size 13px

### Chips
Height 30px, padding 0 12px, border-radius `--r-sm` (7px), font General Sans 600 12px.
- Default: bg `--ink-50`, color `--ink-700`
- Selected (on): bg `--green`, color white
- Outlined: bg white, border `1px solid --ink-200`

### Cards
- Standard: `background: white; border: 1px solid --ink-100; border-radius: --r-lg (12px)`
- Elevated: replace border with `box-shadow: --shadow-2`
- Gradient border: use the background-clip trick —
  ```css
  background-image: linear-gradient(white, white),
    linear-gradient(135deg, var(--orange), var(--yellow), var(--lime), var(--green));
  background-origin: border-box;
  background-clip: padding-box, border-box;
  border: 2px solid transparent;
  ```

---

## Logo & Mark

### Mark
SVG place-setting icon: a plate (two concentric circles) with a fork (left) and knife (right). Used as app icon, favicon, sidebar header. Provided in `ds-logo.jsx` as `<Mark variant="plate" size={N} tile={true/false} />`.
- `tile=true`: rounded-square olive-green badge with cream mark. Tile color: `--green`.
- `tile=false`: line mark in `currentColor`.

### Wordmark
`HomePlate` — Clash Grotesk 700, -3% tracking. "Home" in `--ink-900`, "Plate" in `--green`. Provided as `<Wordmark size={N} />`.

### Full lockup
`<Lockup variant="plate" markSize={34} size={20} />` — mark + wordmark side by side, gap 14px.

---

## Meal-Type Icon System
Seven flat geometric food illustrations, one per meal category. Provided in `ds-foodicons.jsx`. Each takes a `size` prop (SVG px). Style: filled shapes, bold, multi-colour, no strokes except thin details. Use on: category chips (16px), fallback card state (52px), week-at-a-glance grid (18px), today's meals row (36px).

| Category | Component | Description |
|----------|-----------|-------------|
| Breakfast | `FoodBreakfast` | Fried egg — cream blob + orange yolk |
| Lunch | `FoodLunch` | Burger stack — bun, lettuce, tomato, patty |
| Dinner | `FoodDinner` | Rice bowl — green bowl, yellow rice, coloured toppings |
| Side | `FoodSide` | Herb sprig — 3 green geometric leaves |
| Snack | `FoodSnack` | Apple — red geometric apple + green leaf |
| Dessert | `FoodDessert` | Cupcake — orange wrapper, cream frosting, cherry, sprinkles |
| Beverage | `FoodBeverage` | Martini glass — yellow cocktail, orange-slice garnish |

---

## Functional Icon System
Custom line-icon set (1.75px stroke, rounded, 24×24 viewBox). Provided in `icons.jsx`. Scale via `size` prop.

Key icons: `IconHome`, `IconPlanner`, `IconRecipes`, `IconGrocery`, `IconSettings`, `IconSearch`, `IconPlus`, `IconClock`, `IconServes`, `IconCheck`, `IconTrash`, `IconEdit`, `IconBreakfast`, `IconLunch`, `IconDinner`, `IconSide`, `IconSnack`, `IconDessert` (line versions of meal types), `IconMade`, `IconCamera`, `IconGrid`, `IconList`.

---

## Dashboard Screen

### Layout
- Full-viewport: sidebar (220px fixed left) + scrollable main content
- Main max-width: 1100px, padding: 0 32px 60px
- Background: `--bg-app`

### Sidebar
- Width: 220px, bg: white, right border: `1px solid --ink-100`
- Top: Lockup logo (mark 34px + wordmark 20px)
- Nav items (height 42px, padding 0 12px, border-radius 9px):
  - Active: bg `--green-50`, color `--green-600`, font-weight 600, stroke 2
  - Inactive: transparent bg, color `--ink-600`, font-weight 400
- Bottom: User avatar (32px gradient circle) + name/plan text

### Top Bar (padding 28px 32px 0)
- Left: greeting h1 (28px Clash Grotesk 700) + date caption
- Right: ghost "Add meal" button + gradient "Generate grocery list" button

### AI Weekly Summary Card (full width, gradient border)
- Layout: 2-col grid — rating left (min-width 100px) + content right, gap 28px
- Rating number: 72px Clash Grotesk 700, gradient text (orange→green)
- Rating sub: "/ 10 this week", caption
- Right: eyebrow "✦ AI WEEKLY SUMMARY", body text (14px 1.6 line-height), tag chips

### Week at a Glance Card (full width)
- Header: eyebrow + "Open planner →" link
- Grid: 7 columns × 4 rows (day headers + B/L/D rows)
- Day header cells: day name (caption bold) + date number (20px Clash Grotesk 700)
- Today column: bg `--green-50`, date color `--green-600`, gradient underbar (3px h, 24px w, border-radius 2)
- Meal cells: min-height 58px, 8px padding — food icon 18px + truncated meal name (11px 2-line clamp), or "—" in `--ink-300` when empty
- All cells: border-right + border-bottom `1px solid --ink-100`

### Today's Meals Card (300px right column)
- 3 rows (Breakfast / Lunch / Dinner), each: food icon 36px + meal type caption + meal name (14px 600) + clock time
- Rows separated by `1px solid --ink-100`

### This Week's Recipes Strip (full width, horizontal scroll)
- Header: eyebrow + count
- Horizontal flex, gap 12px, overflow-x auto, no scrollbar
- Each card: 176px min-width, white card — food icon 32px + day chip + meal name 13px 600 + time/category caption

### Most Cooked Card
- List of 5 items: food icon 22px + name (13px 600) + count (caption tabular bold)
- Below each: frequency bar — height 7px, bg `--ink-100`, fill = spectrum gradient, width = (count/max)×100%

### Pantry Stash Card
- List of 5 items: name + status dot (8px circle, red/yellow/green) + status label
- Bottom: "Add low items to grocery list" ghost button

### Stats Card (2×2 grid)
- 4 stat blocks: bg `--bg-app`, border-radius 9px, padding 14px
- Value: 32px Clash Grotesk 700 (days-planned stat uses gradient text)
- Sub: caption
- Below grid: planning progress bar (height 8px, fill = spectrum gradient, width = days/7 × 100%)

### Recommended Recipe Card (full width, flex row)
- Left: food icon 56px on `--green-50` tinted square (border-radius 9px, 16px padding)
- Right: eyebrow + "Not made in N weeks" orange chip + recipe name (22px Clash Grotesk 700) + time/serves captions + primary button

### Planning Streak Card
- Large number 42px + "weeks in a row" label
- Bar chart: 8 weekly bars (flex, items-end, height 60px total). Each bar is a div with calculated height. All bars `--ink-100` except current week which uses the spectrum gradient.
- Bar labels: 9.5px below, current week in `--green-600`
- Below: "Best streak" + "All-time meals planned" stats (20px Clash Grotesk 700 each)

---

## Data Model Notes (for Claude Code)
The dashboard needs these data sources from your backend:

| Widget | Data needed |
|--------|-------------|
| AI Summary | Call an LLM at page load with the week's meal plan — prompt it to rate (1–10) and summarise the nutritional variety, prep time, and balance |
| Week at a glance | Array of 7 days with b/l/d meal slots (recipe IDs + names) |
| Today's meals | Filter week data for today's date |
| This week's recipes | Deduplicated list of planned recipes for the current week |
| Most cooked | Aggregated cook count per recipe across all time |
| Pantry stash | User-maintained pantry items with stock levels |
| Stats | Count from week data + grocery list item count |
| Recommended | Recipe with longest time since last cooked (filter from recipe log) |
| Streak | Weekly planning history — % of days with at least one meal planned |

---

## AI Summary — Suggested Prompt
```
You are a helpful meal-planning assistant for a family. Here is this week's meal plan:

[WEEK_PLAN_JSON]

Write a brief 2–3 sentence summary covering:
1. A rating out of 10 for nutritional variety and planning quality
2. Any patterns or concerns (e.g. same protein repeated, missing vegetables)
3. One actionable suggestion for next week

Also return an array of 3–4 short tag strings (e.g. "Protein-forward", "Quick weeknights ✓").

Return JSON: { rating: number, summary: string, tags: string[] }
```

---

## Recipe Cards (for Recipe Library screen)
- Photo-led: top image area 142px (fill with AI-generated photo on create)
- Fallback (no photo): `--ink-50` bg, food illustration icon 52px centered + "Generating photo…" caption
- Category chip (top-left overlay): white pill (opacity 93%), food icon 16px + uppercase category text, `box-shadow: --shadow-1`
- Title: 18px General Sans 600, `-0.01em` tracking, `text-wrap: balance`
- Footer: border-top `--ink-100`, bg `--paper-off`, time/serves left + audience label right
- AI photo generation: generate once at recipe save time, store URL on recipe record. Never regenerate unless user requests it.

---

## Files in This Package

| File | Purpose |
|------|---------|
| `ds.css` | All design tokens — import this first in your app |
| `icons.jsx` | Functional line icons (24×24 SVG components) |
| `ds-foodicons.jsx` | Flat geometric food illustrations (meal-type icons) |
| `ds-logo.jsx` | Mark, Wordmark, Lockup components |
| `Design System.html` | Interactive design system review page (reference) |
| `ds-page.jsx` | Design system page components |
| `Dashboard.html` | Full dashboard mockup (open in browser to inspect) |
| `dash-widgets.jsx` | All dashboard widget components |
| `dashboard.jsx` | Dashboard composition + mock data |

---

## Implementation Notes for Claude Code
1. **Start with `ds.css`** — translate tokens to your system first (Tailwind config, CSS custom properties, theme object).
2. **Food icons** (`ds-foodicons.jsx`) are pure SVG React components — drop them in as-is or extract the SVG markup.
3. **Functional icons** (`icons.jsx`) are also pure SVG — copy or adapt.
4. **The gradient** `linear-gradient(90deg, #F0913C, #F4C233, #A6C948, #5BA63C)` is used everywhere: progress bars, card borders, CTA buttons, chart fills, the AI rating number. Wire it as a CSS variable or utility class early.
5. **Gradient text** technique: `background: [gradient]; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`
6. **Gradient border** technique: see the Card section above — uses `background-clip: padding-box, border-box`.
7. **Dashboard sidebar** is sticky — use `position: sticky; top: 0; height: 100vh` on the sidebar, `overflow-y: auto` on the main content.
8. Replace all mock data (names, dates, recipe lists, counts) with real API calls — the structure and shape are shown in the `WEEK_DATA`, `MOST_COOKED`, `PANTRY`, etc. arrays in `dash-widgets.jsx`.
