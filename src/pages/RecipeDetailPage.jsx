import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getRecipeById, deleteRecipe } from '../lib/supabase'
import { getCategoryMeta } from '../lib/categories'
import { IconChevronL, IconClock, IconFire, IconServes, IconEdit, IconTrash } from '../components/icons'
import './Recipes.css'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useUser()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getRecipeById(id).then(({ data }) => {
      setRecipe(data)
      setLoading(false)
    })
  }, [id])

  async function handleDelete() {
    if (!confirm(`Delete "${recipe.name}"? This can't be undone.`)) return
    setDeleting(true)
    await deleteRecipe(id)
    navigate('/recipes')
  }

  if (loading) return <div className="page"><div className="page-placeholder"><p>Loading…</p></div></div>
  if (!recipe)  return <div className="page"><div className="page-placeholder"><p>Recipe not found.</p></div></div>

  const meta      = getCategoryMeta(recipe.category)
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  const nutrition = recipe.nutrition || {}
  const hasNutrition = nutrition.calories || nutrition.protein || nutrition.carbs || nutrition.fat

  return (
    <div className="page recipe-detail">
      {/* Header */}
      <div className="recipe-detail-header">
        <button className="btn btn-ghost btn-sm recipe-back-btn" onClick={() => navigate('/recipes')}>
          <IconChevronL size={16} /> Back
        </button>
        <div className="recipe-detail-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/recipes/${id}/edit`)}>
            <IconEdit size={14} /> Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
            <IconTrash size={14} />
          </button>
        </div>
      </div>

      {/* Title block */}
      <div className="recipe-detail-title-block">
        <div className="recipe-card-badge" style={{ '--cat-color': meta.color }}>{meta.label}</div>
        <h1 className="recipe-detail-name">{recipe.name}</h1>

        <div className="recipe-detail-stats">
          {recipe.prep_time > 0 && (
            <div className="recipe-stat">
              <IconClock size={14} />
              <span className="recipe-stat-label">Prep</span>
              <span className="recipe-stat-value">{recipe.prep_time}m</span>
            </div>
          )}
          {recipe.cook_time > 0 && (
            <div className="recipe-stat">
              <IconFire size={14} />
              <span className="recipe-stat-label">Cook</span>
              <span className="recipe-stat-value">{recipe.cook_time}m</span>
            </div>
          )}
          {totalTime > 0 && (
            <div className="recipe-stat">
              <IconClock size={14} />
              <span className="recipe-stat-label">Total</span>
              <span className="recipe-stat-value">{totalTime}m</span>
            </div>
          )}
          {recipe.servings > 0 && (
            <div className="recipe-stat">
              <IconServes size={14} />
              <span className="recipe-stat-label">Serves</span>
              <span className="recipe-stat-value">{recipe.servings}</span>
            </div>
          )}
        </div>
      </div>

      {/* Ingredients */}
      {recipe.ingredients?.length > 0 && (
        <section className="recipe-section">
          <h2 className="recipe-section-title">Ingredients</h2>
          <ul className="recipe-ingredients">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="recipe-ingredient">
                <span className="recipe-ingredient-amount">
                  {ing.quantity} {ing.unit}
                </span>
                <span className="recipe-ingredient-name">{ing.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Instructions */}
      {recipe.instructions?.length > 0 && (
        <section className="recipe-section">
          <h2 className="recipe-section-title">Instructions</h2>
          <ol className="recipe-instructions">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="recipe-instruction-step">
                <span className="recipe-step-num">{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Nutrition */}
      {hasNutrition && (
        <section className="recipe-section">
          <h2 className="recipe-section-title">Nutrition <span className="recipe-section-subtitle">per serving</span></h2>
          <div className="recipe-nutrition-grid">
            {[
              { label: 'Calories', value: nutrition.calories, unit: 'kcal' },
              { label: 'Protein',  value: nutrition.protein,  unit: 'g' },
              { label: 'Carbs',    value: nutrition.carbs,    unit: 'g' },
              { label: 'Fat',      value: nutrition.fat,      unit: 'g' },
              { label: 'Fiber',    value: nutrition.fiber,    unit: 'g' },
            ].filter(n => n.value).map(n => (
              <div key={n.label} className="recipe-nutrition-cell">
                <span className="recipe-nutrition-value">{n.value}</span>
                <span className="recipe-nutrition-unit">{n.unit}</span>
                <span className="recipe-nutrition-label">{n.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {recipe.notes && (
        <section className="recipe-section">
          <h2 className="recipe-section-title">Notes</h2>
          <p className="recipe-notes">{recipe.notes}</p>
        </section>
      )}
    </div>
  )
}
