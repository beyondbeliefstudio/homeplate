import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoryMeta } from '../lib/categories'
import { FOOD_ICON_MAP } from './FoodIcons.jsx'
import { abbreviateUnit } from '../lib/units'
import {
  IconChevronL, IconEdit, IconExternalLink,
} from './icons'

// ── Star rating ───────────────────────────────────────────────────────────────
export function StarRating({ rating, size = 13, showNumber = true }) {
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
        <span style={{ fontFamily: 'var(--hp-font-mono)', fontSize: size - 1, fontWeight: 600,
          color: 'var(--hp-ink-500)', lineHeight: 1 }}>{Number(rating).toFixed(1)}</span>
      )}
    </span>
  )
}

// ── Slide-over panel content ──────────────────────────────────────────────────
export function RecipePanelContent({ recipe, onClose, onEdit, onOpenFull, approvalMembers = [] }) {
  const meta     = getCategoryMeta(recipe.category)
  const FoodIcon = FOOD_ICON_MAP[recipe.category] ?? FOOD_ICON_MAP.other
  const total    = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  const ingredients  = recipe.ingredients  || []
  const instructions = recipe.instructions || []
  const nutrition    = recipe.nutrition    || null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--hp-paper)' }}>

      {/* Sticky header */}
      <div style={{
        padding: '18px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid var(--hp-ink-100)',
        position: 'sticky', top: 0, background: 'var(--hp-paper)', zIndex: 1, flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--hp-font-body)', fontSize: 14, fontWeight: 600,
          color: 'var(--hp-ink-600)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
        }}>
          <IconChevronL size={16} /> Back
        </button>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {onOpenFull && (
            <button className="btn btn-ghost btn-sm" onClick={onOpenFull}
              title="Open full page" style={{ padding: '0 8px', color: 'var(--hp-ink-400)' }}>
              <IconExternalLink size={14} />
            </button>
          )}
          {onEdit && (
            <button className="btn btn-primary btn-sm" onClick={onEdit}
              style={{ gap: 6, fontSize: 13 }}>
              <IconEdit size={14} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 60px' }}>

        {/* Hero image */}
        <div style={{ aspectRatio: '3 / 2', background: 'var(--hp-ink-50)', overflow: 'hidden', flexShrink: 0 }}>
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ opacity: 0.38 }}><FoodIcon size={120} /></div>
            </div>
          )}
        </div>

        <div style={{ padding: '24px 28px 0' }}>

          {/* Category chip */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px',
            borderRadius: 'var(--r-sm)', background: `color-mix(in oklab, ${meta.color} 14%, var(--hp-paper))`,
            fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: meta.color, marginBottom: 12,
          }}>{meta.label}</span>

          {/* Title */}
          <h2 style={{
            fontFamily: 'var(--hp-font-display)', fontWeight: 600, fontSize: 28,
            lineHeight: 1.06, letterSpacing: '-0.025em', color: 'var(--hp-ink-900)',
            marginBottom: 14, marginTop: 0,
          }}>{recipe.name}</h2>

          {/* Rating */}
          {recipe.rating && (
            <div style={{ marginBottom: 12 }}>
              <StarRating rating={recipe.rating} size={18} />
            </div>
          )}

          {/* Meta chips */}
          {(recipe.prep_time || recipe.cook_time || recipe.servings) && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap',
              marginBottom: approvalMembers.filter(m => (recipe.approved_by ?? []).includes(m.id)).length > 0 ? 10 : 28 }}>
              {[
                recipe.prep_time  && ['Prep',   `${recipe.prep_time}m`],
                recipe.cook_time  && ['Cook',   `${recipe.cook_time}m`],
                (recipe.prep_time || recipe.cook_time) && ['Total', `${(recipe.prep_time||0)+(recipe.cook_time||0)}m`],
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
            </div>
          )}

          {/* Approval badges */}
          {approvalMembers.filter(m => (recipe.approved_by ?? []).includes(m.id)).length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
              {approvalMembers.filter(m => (recipe.approved_by ?? []).includes(m.id)).map(m => (
                <span key={m.id} className="recipe-card-approval-badge"
                  style={{ background: m.color + '22', color: m.color, borderColor: m.color + '44', fontSize: 11, padding: '4px 10px' }}>
                  {m.name} ✓
                </span>
              ))}
            </div>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div className="t-eyebrow" style={{ marginBottom: 10 }}>Ingredients</div>
              {ingredients.map((ing, i) => (
                <div key={i} style={{
                  display: 'flex', padding: '10px 0',
                  borderBottom: '1px solid var(--hp-ink-100)', alignItems: 'center',
                }}>
                  <span style={{ width: 52, fontFamily: 'var(--hp-font-mono)', fontSize: 12,
                    color: 'var(--hp-ink-500)', flexShrink: 0 }}>{ing.quantity || ing.qty}</span>
                  <span style={{ width: 52, fontFamily: 'var(--hp-font-body)', fontSize: 13,
                    color: 'var(--hp-ink-500)', flexShrink: 0 }}>{abbreviateUnit(ing.unit)}</span>
                  <span style={{ fontFamily: 'var(--hp-font-body)', fontSize: 14,
                    color: 'var(--hp-ink-900)', flex: 1 }}>{ing.name}</span>
                </div>
              ))}
            </section>
          )}

          {/* Instructions */}
          {instructions.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div className="t-eyebrow" style={{ marginBottom: 14 }}>Instructions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {instructions.map((step, i) => {
                  const text = typeof step === 'string' ? step : (step.text || step.instruction || '')
                  return (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'var(--hp-ink-900)', color: 'var(--hp-bg-app)',
                        display: 'grid', placeItems: 'center', flexShrink: 0,
                        fontFamily: 'var(--hp-font-display)', fontWeight: 700, fontSize: 13,
                      }}>{i + 1}</div>
                      <p style={{ fontFamily: 'var(--hp-font-body)', fontSize: 14,
                        lineHeight: 1.65, color: 'var(--hp-ink-800)', margin: '2px 0 0' }}>
                        {text}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Nutrition */}
          {nutrition && (
            <section style={{ marginBottom: 28 }}>
              <div className="t-eyebrow" style={{ marginBottom: 10 }}>
                Nutrition{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0,
                  color: 'var(--hp-ink-400)', fontSize: 11 }}>per serving</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {[
                  ['kcal',    'Calories', nutrition.calories ?? nutrition.kcal],
                  ['protein', 'Protein',  nutrition.protein],
                  ['carbs',   'Carbs',    nutrition.carbs],
                  ['fat',     'Fat',      nutrition.fat],
                  ['fiber',   'Fiber',    nutrition.fiber],
                ].filter(([, , v]) => v != null).map(([key, label, val]) => (
                  <div key={key} style={{
                    background: 'var(--hp-ink-50)', borderRadius: 'var(--r-md)',
                    padding: '12px 6px', textAlign: 'center', border: '1px solid var(--hp-ink-100)',
                  }}>
                    <div style={{ fontFamily: 'var(--hp-font-display)', fontWeight: 700,
                      fontSize: 22, letterSpacing: '-0.02em', color: 'var(--hp-ink-900)' }}>
                      {val}{key !== 'kcal' ? 'g' : ''}
                    </div>
                    <div style={{ fontFamily: 'var(--hp-font-body)', fontSize: 11,
                      color: 'var(--hp-ink-500)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {recipe.notes && (
            <section>
              <div className="t-eyebrow" style={{ marginBottom: 10 }}>Notes</div>
              <p style={{ fontFamily: 'var(--hp-font-body)', fontSize: 14, lineHeight: 1.7,
                color: 'var(--hp-ink-600)', fontStyle: 'italic', margin: 0 }}>
                {recipe.notes}
              </p>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Slide-over shell (backdrop + animated panel) ──────────────────────────────
export function RecipeSlideOver({ recipe, approvalMembers, onClose, onEdit, onOpenFull }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (recipe) requestAnimationFrame(() => setOpen(true))
    else setOpen(false)
  }, [recipe])

  if (!recipe) return null

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(14,18,18,0.35)',
        zIndex: 40, opacity: open ? 1 : 0, transition: 'opacity 0.25s ease',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 560,
        background: 'var(--hp-paper)', zIndex: 50, overflow: 'hidden',
        boxShadow: '-4px 0 40px rgba(14,18,18,0.14)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        <RecipePanelContent
          recipe={recipe}
          approvalMembers={approvalMembers}
          onClose={onClose}
          onEdit={onEdit}
          onOpenFull={onOpenFull}
        />
      </div>
    </>
  )
}

// ── Hook: manages slide-over open/close state with click delay ────────────────
export function useRecipePanel() {
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [panelOpen,      setPanelOpen]      = useState(false)
  const clickTimer = useRef(null)

  const openPanel = useCallback((recipe) => {
    if (clickTimer.current) clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => {
      setSelectedRecipe(recipe)
      requestAnimationFrame(() => setPanelOpen(true))
      clickTimer.current = null
    }, 220)
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    setTimeout(() => setSelectedRecipe(null), 300)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closePanel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closePanel])

  return { selectedRecipe, panelOpen, openPanel, closePanel }
}
