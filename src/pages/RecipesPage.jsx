import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getRecipes } from '../lib/supabase'
import { CATEGORY_LIST, getCategoryMeta } from '../lib/categories'
import {
  IconClock, IconServes, IconSearch, IconPlus, IconClose,
  IconChevronL, IconChevronR, IconEdit, IconTrash, IconGrid, IconList,
} from '../components/icons'
import { FOOD_ICON_MAP } from '../components/FoodIcons.jsx'
import { EmptyRecipes } from '../components/EmptyStates'
import './Recipes.css'

const CATS_LIST = ['All', ...CATEGORY_LIST.map(c => c.label)]

export default function RecipesPage() {
  const user     = useUser()
  const navigate = useNavigate()

  const [recipes,        setRecipes]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [search,         setSearch]         = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [roryFilter,     setRoryFilter]     = useState(false)
  const [view,           setView]           = useState('grid')

  // Slide-over state
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [panelOpen,      setPanelOpen]      = useState(false)

  useEffect(() => {
    if (!user) return
    getRecipes(user.id).then(({ data }) => {
      setRecipes(data ?? [])
      setLoading(false)
    })
  }, [user])

  const openDetail = useCallback((recipe) => {
    setSelectedRecipe(recipe)
    requestAnimationFrame(() => setPanelOpen(true))
  }, [])

  const closeDetail = useCallback(() => {
    setPanelOpen(false)
    setTimeout(() => setSelectedRecipe(null), 300)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeDetail() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeDetail])

  const filtered = recipes.filter(r => {
    const matchesSearch   = r.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleCatFilter = (cat) => {
    setActiveCategory(cat)
  }

  return (
    <div className="page recipes-page">

      {/* ── Hero ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div className="t-eyebrow" style={{ color: 'var(--ink-400)', marginBottom: 6 }}>
            Cookbook · {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
          </div>
          <h1 className="page-hero-title" style={{ margin: 0 }}>The cookbook.</h1>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/recipes/new')}
          style={{ flexShrink: 0, marginBottom: 4 }}>
          <IconPlus size={18} /> Add recipe
        </button>
      </div>

      {/* ── Search bar + view toggle ── */}
      <div className="recipes-search-row">
        <div className="recipes-search-wrap">
          <IconSearch size={18} className="recipes-search-icon" />
          <input
            className="input recipes-search-input"
            placeholder="Search recipes, ingredients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hp-ink-400)', display: 'grid', placeItems: 'center', padding: '0 4px' }}>
              <IconClose size={14} />
            </button>
          )}
          <div className="recipes-view-divider" />
          <div className="recipes-view-toggle">
            {[['grid', IconGrid], ['list', IconList]].map(([v, Ico]) => (
              <button key={v} onClick={() => setView(v)}
                className={`recipes-view-btn ${view === v ? 'recipes-view-btn--on' : ''}`}>
                <Ico size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="recipes-filter-row">
        {CATS_LIST.map(cat => {
          const val  = cat === 'All' ? 'all' : cat.toLowerCase()
          const isOn = activeCategory === val
          return (
            <button
              key={cat}
              className={`recipes-filter-chip ${isOn ? 'recipes-filter-chip--on' : ''}`}
              onClick={() => handleCatFilter(val)}
            >{cat}</button>
          )
        })}

        <span className="recipes-filter-divider" />

        <button
          className={`recipes-filter-chip ${roryFilter ? 'recipes-filter-chip--rory' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setRoryFilter(v => !v)}
        >
          {roryFilter && <span className="recipes-rory-dot" />}
          Rory-approved
        </button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="page-placeholder"><p>Loading recipes…</p></div>
      ) : filtered.length === 0 ? (
        search || activeCategory !== 'all' ? (
          <div className="page-placeholder"><p>No recipes match.</p></div>
        ) : (
          <div className="recipes-empty">
            <EmptyRecipes />
            <div className="recipes-empty-copy">
              <div className="t-h3">Your cookbook is empty.</div>
              <p className="t-body-sm" style={{ color: 'var(--hp-ink-500)', marginTop: 8 }}>
                Add your first recipe — it lives here forever.
              </p>
              <button className="btn btn-primary btn-md" style={{ marginTop: 18 }} onClick={() => navigate('/recipes/new')}>
                <IconPlus size={15} /> Add recipe
              </button>
            </div>
          </div>
        )
      ) : view === 'grid' ? (
        <div className="recipes-grid">
          {filtered.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={openDetail} />
          ))}
        </div>
      ) : (
        <div className="recipes-list">
          {filtered.map(recipe => (
            <RecipeRow key={recipe.id} recipe={recipe} onClick={openDetail} />
          ))}
        </div>
      )}

      {/* ── Slide-over backdrop ── */}
      {selectedRecipe && (
        <div
          onClick={closeDetail}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(14,18,18,0.35)',
            zIndex: 40,
            opacity: panelOpen ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}

      {/* ── Slide-over panel ── */}
      {selectedRecipe && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 560,
          background: 'var(--hp-paper)', zIndex: 50, overflow: 'hidden',
          boxShadow: '-4px 0 40px rgba(14,18,18,0.14)',
          transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
          display: 'flex', flexDirection: 'column',
        }}>
          <DetailPanel
            recipe={selectedRecipe}
            onClose={closeDetail}
            onEdit={() => navigate(`/recipes/${selectedRecipe.id}`)}
          />
        </div>
      )}
    </div>
  )
}

// ── Recipe card (grid view) ───────────────────────────────────────────────────
function RecipeCard({ recipe, onClick }) {
  const meta      = getCategoryMeta(recipe.category)
  const FoodIcon  = FOOD_ICON_MAP[recipe.category] ?? FOOD_ICON_MAP.other
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  return (
    <div className="recipe-card" onClick={() => onClick(recipe)}>
      {/* Photo / food-icon header */}
      <div className="recipe-card-header" style={{ background: recipe.image_url ? undefined : 'var(--hp-ink-50)' }}>
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ opacity: 0.38 }}>
              <FoodIcon size={80} />
            </div>
          </div>
        )}
        {/* Category chip — white pill top-left */}
        <span className="recipe-card-cat-chip">
          <span style={{ fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 700,
            color: 'var(--hp-ink-800)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {meta.label}
          </span>
        </span>
      </div>

      {/* Title */}
      <div style={{ flex: 1, padding: '14px 16px 10px' }}>
        <h3 className="recipe-card-name">{recipe.name}</h3>
      </div>

      {/* Footer: time · serves */}
      <div className="recipe-card-footer">
        {totalTime > 0 && (
          <span className="recipe-card-meta-item">
            <IconClock size={12} /> {totalTime}m
          </span>
        )}
        {recipe.servings > 0 && (
          <span className="recipe-card-meta-item">
            <IconServes size={12} /> {recipe.servings}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Recipe row (list view) ────────────────────────────────────────────────────
function RecipeRow({ recipe, onClick }) {
  const meta      = getCategoryMeta(recipe.category)
  const FoodIcon  = FOOD_ICON_MAP[recipe.category] ?? FOOD_ICON_MAP.other
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  const [hov, setHov] = useState(false)

  return (
    <div
      onClick={() => onClick(recipe)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--hp-paper-off)' : 'var(--hp-paper)',
        borderRadius: 'var(--r-lg)', border: '1px solid var(--hp-ink-100)',
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        gap: 16, cursor: 'pointer', transition: 'background 0.12s',
      }}
    >
      {/* Food illustration tile — 50×50, light grey bg */}
      <div style={{
        width: 50, height: 50, borderRadius: 'var(--r-md)',
        background: 'var(--hp-ink-50)',
        flexShrink: 0, display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        <FoodIcon size={34} />
      </div>

      {/* Meta row (category label) + name row */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top: category label — uniform dark grey, same for all */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3,
          fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--hp-ink-600)',
        }}>
          {meta.label}
        </div>
        {/* Bottom: recipe name */}
        <div style={{
          fontFamily: 'var(--hp-font-display)', fontWeight: 600, fontSize: 17,
          letterSpacing: '-0.02em', color: 'var(--hp-ink-900)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {recipe.name}
        </div>
      </div>

      {/* Time + serves */}
      <div style={{ display: 'flex', gap: 16, color: 'var(--hp-ink-500)', flexShrink: 0 }}>
        {totalTime > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}>
            <IconClock size={13} /> {totalTime} m
          </span>
        )}
        {recipe.servings > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}>
            <IconServes size={13} /> {recipe.servings}
          </span>
        )}
      </div>
      <div style={{ color: 'var(--hp-ink-300)', flexShrink: 0 }}>
        <IconChevronR size={16} />
      </div>
    </div>
  )
}

// ── Detail slide-over panel ───────────────────────────────────────────────────
function DetailPanel({ recipe, onClose, onEdit }) {
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
        position: 'sticky', top: 0, background: 'var(--hp-paper)', zIndex: 1,
        flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--hp-font-body)', fontSize: 14, fontWeight: 600,
          color: 'var(--hp-ink-600)', background: 'none', border: 'none',
          cursor: 'pointer', padding: '6px 0',
        }}>
          <IconChevronL size={16} /> Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onEdit}
            style={{ gap: 6, fontSize: 13 }}>
            <IconEdit size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Hero image / icon */}
      <div style={{ height: 200, background: recipe.image_url ? undefined : 'var(--hp-ink-50)',
        flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ opacity: 0.38 }}>
              <FoodIcon size={120} />
            </div>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 60px' }}>

        {/* Category chip */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px',
          borderRadius: 'var(--r-sm)', background: `color-mix(in oklab, ${meta.color} 14%, var(--hp-paper))`,
          fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: meta.color,
          marginBottom: 12,
        }}>{meta.label}</span>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--hp-font-display)', fontWeight: 600, fontSize: 28,
          lineHeight: 1.06, letterSpacing: '-0.025em', color: 'var(--hp-ink-900)',
          marginBottom: 20, marginTop: 0,
        }}>{recipe.name}</h2>

        {/* Meta chips */}
        {(recipe.prep_time || recipe.cook_time || recipe.servings) && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
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
                <span style={{ width: 64, fontFamily: 'var(--hp-font-body)', fontSize: 13,
                  color: 'var(--hp-ink-500)', flexShrink: 0 }}>{ing.unit}</span>
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
  )
}
