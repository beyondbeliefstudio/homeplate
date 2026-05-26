import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getRecipes } from '../lib/supabase'
import { CATEGORY_LIST, getCategoryMeta } from '../lib/categories'
import {
  IconClock, IconServes, IconSearch, IconPlus,
  IconAdults, IconKids, IconEveryone,
} from '../components/icons'
import { EmptyRecipes } from '../components/EmptyStates'
import './Recipes.css'

export default function RecipesPage() {
  const user = useUser()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

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
    return matchesSearch && matchesCategory
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Recipes</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/recipes/new')}>
          <IconPlus size={15} /> Add recipe
        </button>
      </div>

      {/* Search */}
      <div className="recipes-search-row">
        <div className="recipes-search-wrap">
          <IconSearch size={18} className="recipes-search-icon" />
          <input
            className="input recipes-search-input"
            placeholder="Search recipes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="recipes-filter-row">
        <button
          className={`chip recipes-filter-chip ${activeCategory === 'all' ? 'chip-on' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {CATEGORY_LIST.map(cat => (
          <button
            key={cat.value}
            className={`chip recipes-filter-chip ${activeCategory === cat.value ? 'recipes-filter-chip--active' : ''}`}
            style={activeCategory === cat.value ? { '--chip-cat': cat.color } : {}}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
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

  return (
    <div className="recipe-card" onClick={onClick}>
      {/* Coloured header strip */}
      <div className="recipe-card-header" style={{ background: meta.color }}>
        {/* Watermark circle */}
        <svg className="recipe-card-watermark" width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="34" fill="#fff" opacity=".18" />
        </svg>
        {/* Category chip */}
        <span className="recipe-card-badge">{meta.label}</span>
        {/* Audience badge */}
        <span className="recipe-card-audience">
          {audience === 'kids'   ? <IconKids size={16} />
           : audience === 'adults' ? <IconAdults size={16} />
           : <IconEveryone size={16} />}
        </span>
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
        </div>
      </div>
    </div>
  )
}
