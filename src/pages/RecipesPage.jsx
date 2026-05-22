import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getRecipes } from '../lib/supabase'
import { CATEGORY_LIST, getCategoryMeta } from '../lib/categories'
import { Clock, Users, Search, Plus } from 'lucide-react'
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
          <Plus size={15} strokeWidth={2} /> Add recipe
        </button>
      </div>

      {/* Search */}
      <div className="recipes-search-row">
        <div className="recipes-search-wrap">
          <Search size={15} className="recipes-search-icon" />
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
          className={`recipes-filter-chip ${activeCategory === 'all' ? 'recipes-filter-chip--active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {CATEGORY_LIST.map(cat => (
          <button
            key={cat.value}
            className={`recipes-filter-chip ${activeCategory === cat.value ? 'recipes-filter-chip--active' : ''}`}
            style={activeCategory === cat.value ? { '--chip-color': cat.color } : {}}
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
        <div className="page-placeholder">
          <p>{search || activeCategory !== 'all' ? 'No recipes match your search.' : 'No recipes yet. Add your first one!'}</p>
        </div>
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

  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="recipe-card-badge" style={{ '--cat-color': meta.color }}>
        {meta.label}
      </div>
      <h3 className="recipe-card-name">{recipe.name}</h3>
      <div className="recipe-card-meta">
        {totalTime > 0 && (
          <span className="recipe-card-meta-item">
            <Clock size={12} strokeWidth={2} />
            {totalTime} min
          </span>
        )}
        {recipe.servings > 0 && (
          <span className="recipe-card-meta-item">
            <Users size={12} strokeWidth={2} />
            Serves {recipe.servings}
          </span>
        )}
      </div>
    </div>
  )
}
