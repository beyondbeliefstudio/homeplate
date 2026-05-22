# HomePlate — Project Brief for Claude Code

This file is the canonical context document. Read it fully at the start of every session before touching any code.

---

## What the app is

HomePlate is a **personal meal planning and grocery shopping app** built for a single household. Users build a recipe library, assign recipes to a weekly meal planner, and generate a consolidated grocery list from the plan. The grocery list can be sorted by store aisle layout for efficient in-store shopping.

Design philosophy: **refined utilitarian** — modern, sharp, and confident. Think Linear, Vercel, or Notion. Intentional, considered, completely free of generic AI-generated aesthetics. No food-blog coziness, no produce illustrations, no template energy.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite) |
| Routing | React Router v6 |
| Database | Supabase (Postgres) |
| Hosting | Netlify |
| Icons | Lucide React (stroke only, no fill mixing) |
| Fonts | DM Sans (display + body) · DM Mono (numbers/code) |

No component library. All UI is hand-rolled with CSS custom properties. No auth — single household identified by a UUID (`hp-household-id` in localStorage).

---

## Running locally

```bash
cd ~/Downloads/homeplate
npm run dev
```

App runs at `http://localhost:8888`. Vite is configured to use port 8888 via `vite.config.js`.

### Environment variables

Stored in `.env` at the project root (not committed). Vite reads these with the `VITE_` prefix.

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find both values in: **Supabase dashboard → Project Settings → API**

---

## Design tokens

All tokens live in `src/index.css`. Never hardcode hex values in components.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0F0F0F` | App background |
| `--surface` | `#1A1A1A` | Cards, sidebar |
| `--surface-2` | `#222222` | Input backgrounds, hover states |
| `--surface-3` | `--2A2A2A` | Active/pressed states |
| `--accent` | `#E8732A` | Primary CTA, active nav, focus rings |
| `--accent-dim` | `rgba(232,115,42,0.12)` | Active nav bg, focus shadow fill |
| `--text-1` | `#F5F5F3` | Primary text |
| `--text-2` | `#A0A0A0` | Secondary / labels |
| `--text-3` | `#5A5A5A` | Placeholder, disabled, empty states |
| `--border` | `#2A2A2A` | Card and input borders |
| `--border-mid` | `#383838` | Hover borders |

Light mode overrides applied via `.light` class on `<html>` (toggled by `useDarkMode` hook, stored in `localStorage` as `hp-theme`).

---

## Typography rules

- **Font**: `DM Sans` for all UI. `DM Mono` for numbers/prices where precision matters.
- **Headings**: `font-weight: 600`, `letter-spacing: -0.02em` — editorial feel.
- **Page titles**: 28px, weight 600, use `.page-title` class.
- **Body**: 14px default. 13px for secondary labels.
- **Do not use**: Inter, Roboto, Arial, or system-ui as primary.

---

## File structure

```
homeplate/
├── .claude/
│   └── launch.json               # Vite dev server config for preview tool
├── netlify/
│   └── functions/                # (empty — reserved for future serverless functions)
├── public/
├── src/
│   ├── main.jsx                  # React root
│   ├── index.css                 # All global styles + design tokens
│   ├── App.jsx                   # Router — 5 routes: /recipes /planner /grocery /stores /settings
│   │
│   ├── hooks/
│   │   ├── useDarkMode.js        # Reads/writes localStorage 'hp-theme', toggles .light on <html>
│   │   └── useMediaQuery.js      # Generic media query hook for responsive breakpoints
│   │
│   ├── lib/
│   │   └── storage.js            # All localStorage read/write helpers for every entity type
│   │
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.jsx        # App shell: Sidebar (desktop) + BottomNav (mobile)
│   │       ├── Sidebar.jsx       # Fixed left nav, full (232px) or compressed rail (64px)
│   │       ├── Sidebar.css
│   │       ├── BottomNav.jsx     # Fixed bottom nav for < 980px
│   │       └── BottomNav.css
│   │
│   └── pages/
│       ├── RecipesPage.jsx       # Recipe library — placeholder
│       ├── PlannerPage.jsx       # Weekly meal planner — placeholder
│       ├── GroceryPage.jsx       # Grocery list — placeholder
│       ├── StoresPage.jsx        # Store layout manager — placeholder
│       └── SettingsPage.jsx      # Theme toggle + settings — basic working state
│
├── index.html                    # Dark mode inline script (applies .light before hydration)
├── vite.config.js                # Port 8888, React plugin
├── netlify.toml                  # Build config + SPA redirect
├── .env.example
└── CLAUDE.md                     # This file
```

---

## Data layer

All app data lives in **Supabase (Postgres)**. `src/lib/supabase.js` contains the client and all CRUD helpers. `src/lib/storage.js` is kept as a legacy fallback but is no longer the primary data store.

### Household identity

No auth. A UUID is generated on first load and stored in `localStorage` as `hp-household-id`. All Supabase queries filter by this value. To sync across devices, copy the UUID from Settings → Sync Code and paste it on the other device.

### localStorage keys (non-data)

| Key | Description |
|---|---|
| `hp-household-id` | The household UUID — the only identity the app needs |
| `hp-theme` | `"dark"` or `"light"` — theme preference |

### Database tables

| Table | Key columns | Notes |
|---|---|---|
| `recipes` | `id`, `household_id`, `name`, `category`, `ingredients` (jsonb), `instructions` (jsonb), `nutrition` (jsonb) | RLS disabled |
| `meal_plans` | `id`, `household_id`, `week_key`, `plan` (jsonb) | UNIQUE on `(household_id, week_key)` |
| `grocery_list` | `id`, `household_id`, `items` (jsonb) | UNIQUE on `household_id` — one active list |
| `stores` | `id`, `household_id`, `name`, `aisles` (jsonb) | RLS disabled |
| `staples` | `id`, `household_id`, `name` | UNIQUE on `(household_id, name)` |

Full schema in `supabase/schema.sql`. Run it in the Supabase SQL editor to initialize.

### Data models (in progress — expand as built)

**Recipe**
```js
{
  id: uuid,
  name: string,
  category: 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack' | 'side' | 'other',
  ingredients: [{ name, quantity, unit }],
  instructions: string[],
  servings: number,
  prepTime: number,       // minutes
  cookTime: number,       // minutes
  notes: string,
  imageUrl: string | null,
  nutrition: {            // estimated, computed from ingredients
    calories, protein, carbs, fat, fiber
  },
  createdAt: ISO string
}
```

**WeekPlan** (value in hp-meal-plans)
```js
{
  // Keys: '0'–'6' (Sun=0, Sat=6)
  [dayIndex]: {
    breakfast: recipeId | null,
    lunch:     recipeId | null,
    dinner:    recipeId | null,
    snack:     recipeId | null,
  }
}
```

**GroceryItem**
```js
{
  id: uuid,
  name: string,
  quantity: number,
  unit: string,
  category: string,        // used for aisle sorting
  recipeIds: uuid[],       // empty if manually added
  manual: boolean,
  checked: boolean,
}
```

**Store**
```js
{
  id: uuid,
  name: string,
  aisles: [{ name: string, categories: string[] }]
}
```

---

## Responsive layout

| Breakpoint | Layout |
|---|---|
| `< 980px` | Single column, `BottomNav` fixed at bottom |
| `980–1239px` | `Sidebar` compressed rail (64px, icon only) |
| `≥ 1240px` | `Sidebar` full (232px, icon + label) |

Detected via `useMediaQuery` hook. `Layout.jsx` passes `isCompressed` prop to `Sidebar`.

---

## Navigation

- **Desktop**: `Sidebar` — Recipes, Planner, Grocery, Stores (top); Settings, Theme toggle (bottom)
- **Mobile**: `BottomNav` — Recipes, Planner, Grocery, Stores
- Settings accessible via sidebar only (desktop) — may add to mobile later

Active state: accent color (`--accent`) + `--accent-dim` background fill.

---

## Component conventions

- All page components start with `<div className="page">` wrapper
- Page headers use `.page-header` + `.page-title` classes
- Empty/loading states use `.page-placeholder` class
- Buttons: `.btn` base + `.btn-primary` / `.btn-secondary` / `.btn-ghost` / `.btn-danger`
- Modifiers: `.btn-sm` / `.btn-lg`
- Inputs: `.input` class on `<input>`, `<textarea>`, `<select>`
- Cards: `.card` class

---

## Feature build status

| Feature | Status | Notes |
|---|---|---|
| Project scaffold | ✅ Done | Vite, routing, design system, layout |
| Dark/light mode | ✅ Done | useDarkMode hook, .light toggle, flash prevention |
| Responsive layout | ✅ Done | Sidebar + BottomNav, 3-tier breakpoints |
| Data layer | ✅ Done | storage.js helpers for all 5 entity types |
| Recipe library | 🔲 Not started | List, add, edit, delete, search/filter |
| Nutrition estimation | 🔲 Not started | Computed from ingredients on recipe save |
| Weekly planner | 🔲 Not started | Sun–Sat grid, assign recipes to meal slots |
| Grocery list | 🔲 Not started | Generate from plan, combine dupes, manual items, checkboxes |
| Store aisle manager | 🔲 Not started | Define stores + aisles, sort grocery list by aisle |
| Pantry staples | 🔲 Not started | Mark ingredients as always-on-hand, exclude from list |
| Settings page | 🔲 Basic | Theme toggle only |

---

## Build backlog (future)

- Duplicate last week's meal plan as a starting point
- Past week plan review
- Recipe photo upload
- Export grocery list (share sheet / copy to clipboard)
- Cross-device sync via Supabase (anonymous session, no login UI)
- Recipe import from URL (out of scope for v1 per spec)
