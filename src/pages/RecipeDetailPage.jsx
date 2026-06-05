import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getRecipeById, deleteRecipe, getHouseholdMembers } from '../lib/supabase'
import { getCategoryMeta } from '../lib/categories'
import { FOOD_ICON_MAP } from '../components/FoodIcons.jsx'
import { IconChevronL, IconEdit, IconTrash } from '../components/icons'
import { abbreviateUnit } from '../lib/units'
import './Recipes.css'

function StarRating({ rating, size = 18, showNumber = true }) {
  if (!rating) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-flex', gap: 1 }}>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = rating >= i + 1
          const half   = !filled && rating >= i + 0.5
          return (
            <span key={i} style={{ position: 'relative', fontSize: size, lineHeight: 1,
              color: filled ? '#F5A623' : 'var(--hp-ink-200)' }}>
              ★
              {half && (
                <span style={{ position: 'absolute', left: 0, top: 0, width: '50%',
                  overflow: 'hidden', color: '#F5A623' }}>★</span>
              )}
            </span>
          )
        })}
      </span>
      {showNumber && (
        <span style={{ fontFamily: 'var(--hp-font-mono)', fontSize: size - 2, fontWeight: 600,
          color: 'var(--hp-ink-500)', lineHeight: 1 }}>{Number(rating).toFixed(1)}</span>
      )}
    </span>
  )
}

export default function RecipeDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const user      = useUser()

  const [recipe,          setRecipe]          = useState(null)
  const [approvalMembers, setApprovalMembers] = useState([])
  const [loading,         setLoading]         = useState(true)
  const [deleting,        setDeleting]        = useState(false)

  useEffect(() => {
    getRecipeById(id).then(({ data }) => { setRecipe(data); setLoading(false) })
  }, [id])

  useEffect(() => {
    if (!user) return
    getHouseholdMembers(user.id).then(({ data }) =>
      setApprovalMembers((data ?? []).filter(m => m.meal_approval))
    )
  }, [user])

  async function handleDelete() {
    if (!confirm(`Delete "${recipe.name}"? This can't be undone.`)) return
    setDeleting(true)
    await deleteRecipe(id)
    navigate('/recipes')
  }

  if (loading) return <div className="page"><div className="page-placeholder"><p>Loading…</p></div></div>
  if (!recipe)  return <div className="page"><div className="page-placeholder"><p>Recipe not found.</p></div></div>

  const meta         = getCategoryMeta(recipe.category)
  const FoodIcon     = FOOD_ICON_MAP[recipe.category] ?? FOOD_ICON_MAP.other
  const total        = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  const ingredients  = recipe.ingredients  || []
  const instructions = recipe.instructions || []
  const nutrition    = recipe.nutrition    || null

  return (
    <div className="page recipe-detail-page">

      {/* ── Header bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 18, borderBottom: '1px solid var(--hp-ink-100)', marginBottom: 24,
      }}>
        <button onClick={() => navigate('/recipes')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--hp-font-body)', fontSize: 14, fontWeight: 600,
          color: 'var(--hp-ink-600)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
        }}>
          <IconChevronL size={16} /> Back
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleDelete} disabled={deleting}
            style={{ color: 'var(--hp-ink-400)', padding: '0 8px' }}>
            <IconTrash size={14} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/recipes/${id}/edit`)}
            style={{ gap: 6, fontSize: 13 }}>
            <IconEdit size={14} /> Edit
          </button>
        </div>
      </div>

      {/* ── Two-column layout: title+content left, image+sidebar right ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>

        {/* ── Left: title block + ingredients + instructions ── */}
        <div>
          {/* Category + title + rating + meta */}
          <div style={{ marginBottom: 32 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px',
              borderRadius: 'var(--r-sm)', background: `color-mix(in oklab, ${meta.color} 14%, var(--hp-paper))`,
              fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: meta.color, marginBottom: 10,
            }}>{meta.label}</span>

            <h1 style={{
              fontFamily: 'var(--hp-font-display)', fontWeight: 600, fontSize: 36,
              lineHeight: 1.04, letterSpacing: '-0.025em', color: 'var(--hp-ink-900)',
              margin: '0 0 14px',
            }}>{recipe.name}</h1>

            {recipe.rating && (
              <div style={{ marginBottom: 14 }}>
                <StarRating rating={recipe.rating} size={20} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                recipe.prep_time  && ['Prep',   `${recipe.prep_time}m`],
                recipe.cook_time  && ['Cook',   `${recipe.cook_time}m`],
                total > 0         && ['Total',  `${total}m`],
                recipe.servings   && ['Serves', recipe.servings],
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'var(--hp-ink-50)', borderRadius: 'var(--r-sm)',
                  padding: '5px 11px', border: '1px solid var(--hp-ink-100)',
                }}>
                  <span style={{ fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 600, color: 'var(--hp-ink-500)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 700, color: 'var(--hp-ink-900)' }}>{val}</span>
                </div>
              ))}
              {approvalMembers.filter(m => (recipe.approved_by ?? []).includes(m.id)).map(m => (
                <span key={m.id} className="recipe-card-approval-badge"
                  style={{ background: m.color + '22', color: m.color, borderColor: m.color + '44', fontSize: 11, padding: '4px 10px' }}>
                  {m.name} ✓
                </span>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <div className="t-eyebrow" style={{ marginBottom: 10 }}>Ingredients</div>
              {ingredients.map((ing, i) => (
                <div key={i} style={{
                  display: 'flex', padding: '10px 0',
                  borderBottom: '1px solid var(--hp-ink-100)', alignItems: 'center',
                }}>
                  <span style={{ width: 56, fontFamily: 'var(--hp-font-mono)', fontSize: 12,
                    color: 'var(--hp-ink-500)', flexShrink: 0 }}>{ing.quantity || ing.qty}</span>
                  <span style={{ width: 56, fontFamily: 'var(--hp-font-body)', fontSize: 13,
                    color: 'var(--hp-ink-500)', flexShrink: 0 }}>{abbreviateUnit(ing.unit)}</span>
                  <span style={{ fontFamily: 'var(--hp-font-body)', fontSize: 14,
                    color: 'var(--hp-ink-900)', flex: 1 }}>{ing.name}</span>
                </div>
              ))}
            </section>
          )}

          {/* Instructions */}
          {instructions.length > 0 && (
            <section>
              <div className="t-eyebrow" style={{ marginBottom: 14 }}>Instructions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {instructions.map((step, i) => {
                  const text = typeof step === 'string' ? step : (step.text || step.instruction || '')
                  return (
                    <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--hp-ink-900)', color: 'var(--hp-bg-app)',
                        display: 'grid', placeItems: 'center', flexShrink: 0,
                        fontFamily: 'var(--hp-font-display)', fontWeight: 700, fontSize: 13,
                      }}>{i + 1}</div>
                      <p style={{ fontFamily: 'var(--hp-font-body)', fontSize: 14,
                        lineHeight: 1.7, color: 'var(--hp-ink-800)', margin: '2px 0 0' }}>
                        {text}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* ── Right: image at top, then nutrition + notes ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Image — full width of sidebar */}
          <div style={{
            aspectRatio: '3 / 2', borderRadius: 'var(--r-xl)',
            overflow: 'hidden', background: 'var(--hp-ink-50)',
          }}>
            {recipe.image_url ? (
              <img src={recipe.image_url} alt={recipe.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ opacity: 0.25 }}><FoodIcon size={80} /></div>
              </div>
            )}
          </div>

          {/* Nutrition */}
          {nutrition && (
            <div style={{
              background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-100)',
              borderRadius: 'var(--r-xl)', padding: '18px 20px',
            }}>
              <div className="t-eyebrow" style={{ marginBottom: 12 }}>
                Nutrition{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0,
                  color: 'var(--hp-ink-400)', fontSize: 11 }}>per serving</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  ['kcal',    'Calories', nutrition.calories ?? nutrition.kcal],
                  ['protein', 'Protein',  nutrition.protein],
                  ['carbs',   'Carbs',    nutrition.carbs],
                  ['fat',     'Fat',      nutrition.fat],
                  ['fiber',   'Fiber',    nutrition.fiber],
                ].filter(([, , v]) => v != null).map(([key, label, val]) => (
                  <div key={key} style={{
                    background: 'var(--hp-bg-app)', borderRadius: 'var(--r-md)',
                    padding: '10px 6px', textAlign: 'center', border: '1px solid var(--hp-ink-100)',
                  }}>
                    <div style={{ fontFamily: 'var(--hp-font-display)', fontWeight: 700,
                      fontSize: 20, letterSpacing: '-0.02em', color: 'var(--hp-ink-900)' }}>
                      {val}{key !== 'kcal' ? 'g' : ''}
                    </div>
                    <div style={{ fontFamily: 'var(--hp-font-body)', fontSize: 10,
                      color: 'var(--hp-ink-500)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {recipe.notes && (
            <div style={{
              background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-100)',
              borderRadius: 'var(--r-xl)', padding: '18px 20px',
            }}>
              <div className="t-eyebrow" style={{ marginBottom: 8 }}>Notes</div>
              <p style={{ fontFamily: 'var(--hp-font-body)', fontSize: 13, lineHeight: 1.7,
                color: 'var(--hp-ink-600)', fontStyle: 'italic', margin: 0 }}>
                {recipe.notes}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
