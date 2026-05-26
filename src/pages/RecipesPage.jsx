import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getRecipes } from '../lib/supabase'
import { CATEGORY_LIST, getCategoryMeta } from '../lib/categories'
import {
  IconClock, IconServes, IconSearch, IconPlus,
  IconAdults, IconKids, IconEveryone,
  IconBreakfast, IconLunch, IconDinner, IconSnack, IconSide, IconDessert,
} from '../components/icons'

import { EmptyRecipes } from '../components/EmptyStates'
import './Recipes.css'

// Map each category value to its illustration icon
const CATEGORY_ICONS = {
  breakfast: IconBreakfast,
  lunch:     IconLunch,
  dinner:    IconDinner,
  snack:     IconSnack,
  dessert:   IconDessert,
  side:      IconSide,
  other:     null,
}

const AUDIENCE_FILTERS = [
  { value: 'everyone', label: 'Everyone', Icon: IconEveryone },
  { value: 'adults',   label: 'Adults',   Icon: IconAdults },
  { value: 'kids',     label: 'Kids',     Icon: IconKids },
]

export default function RecipesPage() {
  const user = useUser()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeAudience, setActiveAudience] = useState('all')

  useEffect(() => {
    if (!user) return
    getRecipes(user.id).then(({ data }) => {
      setRecipes(data)
      setLoading(false)
    })
  }, [user])

  const filtered = recipes.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory
    const matchesAudience = activeAudience === 'all' || r.audience === activeAudience
    return matchesSearch && matchesCategory && matchesAudience
  })

  return (
    <div className="page recipes-page">

      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="page-hero-top">
          <span className="t-eyebrow" style={{ color: 'var(--ink-400)' }}>Cookbook · {recipes.length} recipes</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/recipes/new')}>
            <IconPlus size={15} /> Add recipe
          </button>
        </div>
        <h1 className="page-hero-title">The cookbook.</h1>
      </div>

      {/* ── Search ── */}
      <div className="recipes-search-row">
        <div className="recipes-search-wrap">
          <IconSearch size={18} className="recipes-search-icon" />
          <input
            className="input recipes-search-input"
            placeholder="Search recipes, ingredients, audience…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Filters: category + audience ── */}
      <div className="recipes-filter-row">
        {/* Category chips */}
        <button
          className={`chip recipes-filter-chip ${activeCategory === 'all' ? 'recipes-filter-chip--on' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {CATEGORY_LIST.map(cat => {
          const CatIcon = CATEGORY_ICONS[cat.value]
          const isActive = activeCategory === cat.value
          return (
            <button
              key={cat.value}
              className={`chip recipes-filter-chip ${isActive ? 'recipes-filter-chip--active' : ''}`}
              style={isActive ? { '--chip-cat': cat.color } : {}}
              onClick={() => setActiveCategory(cat.value)}
            >
              {CatIcon && <CatIcon size={13} />}
              {cat.label}
            </button>
          )
        })}

        {/* Divider */}
        <span className="recipes-filter-divider" />

        {/* Audience chips */}
        {AUDIENCE_FILTERS.map(({ value, label, Icon }) => {
          const isActive = activeAudience === value
          return (
            <button
              key={value}
              className={`chip recipes-filter-chip ${isActive ? 'recipes-filter-chip--audience-on' : ''}`}
              onClick={() => setActiveAudience(isActive ? 'all' : value)}
            >
              <Icon size={13} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="page-placeholder"><p>Loading recipes…</p></div>
      ) : filtered.length === 0 ? (
        search || activeCategory !== 'all' ? (
          <div className="page-placeholder">
            <p>No recipes match your search.</p>
          </div>
        ) : (
          <div className="recipes-empty">
            <EmptyRecipes />
            <div className="recipes-empty-copy">
              <div className="t-h3">Your cookbook is empty.</div>
              <p className="t-body-sm" style={{ color: 'var(--hp-ink-500)', marginTop: 8 }}>
                Add your first recipe — it lives here forever, even when the internet doesn't.
              </p>
              <button className="btn btn-primary btn-md" style={{ marginTop: 18 }} onClick={() => navigate('/recipes/new')}>
                <IconPlus size={15} /> Add recipe
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="recipes-grid">
          {filtered.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => navigate(`/recipes/${recipe.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function RecipeCard({ recipe, onClick }) {
  const meta = getCategoryMeta(recipe.category)
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  const audience = recipe.audience || 'everyone'
  const CatIcon = CATEGORY_ICONS[recipe.category]
  const audienceLabel = audience === 'kids' ? 'Kids' : audience === 'adults' ? 'Adults' : 'Everyone'

  // Pastel tint: 14% of category colour mixed with paper white
  const headerBg = `color-mix(in oklab, ${meta.color} 14%, var(--paper))`

  return (
    <div className="recipe-card" onClick={onClick}>
      {/* Pastel header */}
      <div className="recipe-card-header" style={{ background: headerBg }}>
        {/* Category label — uppercase, coloured, no chip */}
        <span className="recipe-card-cat-label" style={{ color: meta.color }}>
          {meta.label}
        </span>
        {/* Category icon — large, right side, faint */}
        {CatIcon && (
          <div className="recipe-card-icon-bg" style={{ color: meta.color }} aria-hidden="true">
            <CatIcon size={160} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="recipe-card-body">
        <h3 className="recipe-card-name">{recipe.name}</h3>
        <div className="recipe-card-meta">
          {totalTime > 0 && (
            <span className="recipe-card-meta-item">
              <IconClock size={13} />
              {totalTime}m
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="recipe-card-meta-item">
              <IconServes size={13} />
              {recipe.servings}
            </span>
          )}
          <span className="recipe-card-meta-audience">{audienceLabel}</span>
        </div>
      </div>
    </div>
  )
}
