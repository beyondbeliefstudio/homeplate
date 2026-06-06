import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getRecipes, getHouseholdMembers, getMealPlan, saveMealPlan } from '../lib/supabase'
import { getWeekKey } from '../lib/weeks'
import { CATEGORY_LIST, getCategoryMeta } from '../lib/categories'
import {
  IconClock, IconServes, IconSearch, IconPlus, IconClose,
  IconChevronL, IconChevronR, IconEdit, IconTrash, IconGrid, IconList, IconExternalLink,
} from '../components/icons'
import { FOOD_ICON_MAP } from '../components/FoodIcons.jsx'
import { abbreviateUnit } from '../lib/units'
import { EmptyRecipes } from '../components/EmptyStates'
import './Recipes.css'

function uid() { return Math.random().toString(36).slice(2, 9) }

const MEAL_SLOTS = [
  { key: 'dinners',    label: 'Dinner',    emoji: '🍽' },
  { key: 'lunches',    label: 'Lunch',     emoji: '🥗' },
  { key: 'breakfasts', label: 'Breakfast', emoji: '🍳' },
  { key: 'snacks',     label: 'Snack',     emoji: '🍪' },
]

const CATS_LIST = ['All', ...CATEGORY_LIST.map(c => c.label)]

// ── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ rating, size = 13, showNumber = true }) {
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

export default function RecipesPage() {
  const user        = useUser()
  const navigate    = useNavigate()
  const currentWeekKey = getWeekKey()

  const [recipes,         setRecipes]         = useState([])
  const [members,         setMembers]         = useState([])
  const [loading,         setLoading]         = useState(true)
  const [search,          setSearch]          = useState('')
  const [activeCategory,  setActiveCategory]  = useState('all')
  const [approvalFilters, setApprovalFilters] = useState(new Set())
  const [view,            setView]            = useState('grid')

  // Current week's plan (for "Add to planner")
  const [weekPlan,    setWeekPlan]    = useState({})
  const [addedMap,    setAddedMap]    = useState({}) // { recipeId: slotLabel }

  // Slide-over state
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [panelOpen,      setPanelOpen]      = useState(false)

  useEffect(() => {
    if (!user) return
    getRecipes(user.id).then(({ data }) => {
      setRecipes(data ?? [])
      setLoading(false)
    })
    getHouseholdMembers(user.id).then(({ data }) => setMembers(data ?? []))
    getMealPlan(user.id, currentWeekKey).then(({ data }) => setWeekPlan(data || {}))
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function addToPlanner(recipeId, slot) {
    const updated = { ...weekPlan }
    if (slot.key === 'dinners') {
      updated.dinners = [...(updated.dinners || []), { id: uid(), adultRecipeId: recipeId, multiplier: 1, madeCount: 0, kidsRecipeId: null, kidsMade: false, sides: [], memberIds: [], note: '' }]
    } else if (slot.key === 'breakfasts') {
      updated.breakfasts = [...(updated.breakfasts || []), { id: uid(), recipeId, isPantry: false, made: false, multiplier: 1, kidsRecipeId: null, kidsMade: false, memberIds: [], note: '' }]
    } else if (slot.key === 'lunches') {
      updated.lunches = [...(updated.lunches || []), { id: uid(), recipeId, isPantry: false, made: false, multiplier: 1, kidsRecipeId: null, memberIds: [], note: '' }]
    } else if (slot.key === 'snacks') {
      updated.snacks = [...(updated.snacks || []), { id: uid(), recipeId, made: false, multiplier: 1, memberIds: [], note: '' }]
    }
    setWeekPlan(updated)
    setAddedMap(m => ({ ...m, [recipeId]: slot.label }))
    await saveMealPlan(user.id, currentWeekKey, updated)
  }

  const approvalMembers = members.filter(m => m.meal_approval)

  const clickTimer = useRef(null)

  const openDetail = useCallback((recipe) => {
    if (clickTimer.current) clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => {
      setSelectedRecipe(recipe)
      requestAnimationFrame(() => setPanelOpen(true))
      clickTimer.current = null
    }, 220)
  }, [])

  const openFullPage = useCallback((recipe) => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null }
    navigate(`/recipes/${recipe.id}`)
  }, [navigate])

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
    const matchesApproval = approvalFilters.size === 0 || [...approvalFilters].every(id => (r.approved_by ?? []).includes(id))
    return matchesSearch && matchesCategory && matchesApproval
  })

  const handleCatFilter = (cat) => {
    setActiveCategory(cat)
  }

  return (
    <div className="page recipes-page">

      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="page-hero-top">
          <span className="t-eyebrow" style={{ color: 'var(--ink-400)' }}>
            Cookbook · {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/recipes/new')}>
            <IconPlus size={15} /> Add recipe
          </button>
        </div>
        <h1 className="page-hero-title">The cookbook.</h1>
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

        {approvalMembers.length > 0 && <span className="recipes-filter-divider" />}

        {approvalMembers.map(m => {
          const on = approvalFilters.has(m.id)
          return (
            <button key={m.id}
              className={`recipes-filter-chip ${on ? 'recipes-filter-chip--approval' : ''}`}
              style={on ? { '--approval-color': m.color } : {}}
              onClick={() => setApprovalFilters(prev => {
                const next = new Set(prev)
                on ? next.delete(m.id) : next.add(m.id)
                return next
              })}
            >
              {on && <span className="recipes-approval-dot" style={{ background: m.color }} />}
              {m.name} ✓
            </button>
          )
        })}
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
            <RecipeCard key={recipe.id} recipe={recipe} onClick={openDetail} onDoubleClick={openFullPage} approvalMembers={approvalMembers} addedSlot={addedMap[recipe.id]} onAddToPlanner={addToPlanner} />
          ))}
        </div>
      ) : (
        <div className="recipes-list">
          {filtered.map(recipe => (
            <RecipeRow key={recipe.id} recipe={recipe} onClick={openDetail} approvalMembers={approvalMembers} addedSlot={addedMap[recipe.id]} onAddToPlanner={addToPlanner} />
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
            approvalMembers={approvalMembers}
            onClose={closeDetail}
            onEdit={() => navigate(`/recipes/${selectedRecipe.id}/edit`)}
            onOpenFull={() => navigate(`/recipes/${selectedRecipe.id}`)}
            addedSlot={addedMap[selectedRecipe.id]}
            onAddToPlanner={addToPlanner}
          />
        </div>
      )}
    </div>
  )
}

// ── Add to Planner button with slot dropdown ─────────────────────────────────
function AddToPlannerButton({ recipeId, addedSlot, onAddToPlanner, compact = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (addedSlot) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        height: compact ? 26 : 30, padding: compact ? '0 9px' : '0 12px',
        borderRadius: 'var(--r-sm)', fontSize: compact ? 11 : 12, fontWeight: 600,
        fontFamily: 'var(--hp-font-body)',
        background: 'var(--hp-green-50)', color: 'var(--hp-green-600, #15803D)',
        border: '1px solid var(--hp-green-200, #BBF7D0)',
        whiteSpace: 'nowrap',
      }}>
        ✓ Added to {addedSlot}
      </span>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          height: compact ? 26 : 30, padding: compact ? '0 9px' : '0 12px',
          borderRadius: 'var(--r-sm)', fontSize: compact ? 11 : 12, fontWeight: 600,
          fontFamily: 'var(--hp-font-body)',
          background: 'transparent', color: 'var(--hp-ink-700)',
          border: '1px solid var(--hp-ink-300)',
          cursor: 'pointer', whiteSpace: 'nowrap',
          transition: 'background 0.12s, border-color 0.12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--hp-ink-50)'; e.currentTarget.style.borderColor = 'var(--hp-ink-400)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--hp-ink-300)' }}
      >
        <IconPlus size={compact ? 11 : 12} /> Add to planner
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
          background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-150, var(--hp-ink-100))',
          borderRadius: 'var(--r-md)', boxShadow: '0 8px 24px rgba(14,18,18,0.12)',
          minWidth: 160, zIndex: 200, overflow: 'hidden',
          padding: '4px 0',
        }}>
          {MEAL_SLOTS.map(slot => (
            <button
              key={slot.key}
              onClick={e => { e.stopPropagation(); onAddToPlanner(recipeId, slot); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--hp-font-body)', fontSize: 13, fontWeight: 500,
                color: 'var(--hp-ink-800)', textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hp-ink-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: 15 }}>{slot.emoji}</span> {slot.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Recipe card (grid view) ───────────────────────────────────────────────────
function RecipeCard({ recipe, onClick, onDoubleClick, approvalMembers = [], addedSlot, onAddToPlanner }) {
  const meta      = getCategoryMeta(recipe.category)
  const FoodIcon  = FOOD_ICON_MAP[recipe.category] ?? FOOD_ICON_MAP.other
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  const approvedBy = approvalMembers.filter(m => (recipe.approved_by ?? []).includes(m.id))

  return (
    <div className="recipe-card" onClick={() => onClick(recipe)} onDoubleClick={() => onDoubleClick(recipe)}>
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

      {/* Title + rating + approval badges */}
      <div style={{ flex: 1, padding: '14px 16px 10px' }}>
        <h3 className="recipe-card-name">{recipe.name}</h3>
        {recipe.rating && (
          <div style={{ marginTop: 6 }}>
            <StarRating rating={recipe.rating} size={12} />
          </div>
        )}
        {approvedBy.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
            {approvedBy.map(m => (
              <span key={m.id} className="recipe-card-approval-badge"
                style={{ background: m.color + '22', color: m.color, borderColor: m.color + '44' }}>
                {m.name} ✓
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: time · serves · add to planner */}
      <div className="recipe-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
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
        <AddToPlannerButton recipeId={recipe.id} addedSlot={addedSlot} onAddToPlanner={onAddToPlanner} compact />
      </div>
    </div>
  )
}

// ── Recipe row (list view) ────────────────────────────────────────────────────
function RecipeRow({ recipe, onClick, approvalMembers = [], addedSlot, onAddToPlanner }) {
  const meta      = getCategoryMeta(recipe.category)
  const FoodIcon  = FOOD_ICON_MAP[recipe.category] ?? FOOD_ICON_MAP.other
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  const approvedBy = approvalMembers.filter(m => (recipe.approved_by ?? []).includes(m.id))
  const [hov, setHov] = useState(false)

  return (
    <div
      onClick={() => onClick(recipe)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--hp-paper-off)' : 'var(--hp-paper)',
        borderRadius: 'var(--r-lg)', border: '1px solid var(--hp-ink-100)',
        padding: '12px 16px', display: 'flex', alignItems: 'center',
        gap: 14, cursor: 'pointer', transition: 'background 0.12s',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 72, height: 54, borderRadius: 'var(--r-md)',
        background: 'var(--hp-ink-50)', flexShrink: 0, overflow: 'hidden',
      }}>
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
            <FoodIcon size={30} />
          </div>
        )}
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Category label — small + muted, clearly secondary */}
        <div style={{
          fontFamily: 'var(--hp-font-body)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--hp-ink-400)', marginBottom: 3,
        }}>
          {meta.label}
        </div>
        {/* Recipe name — dominant */}
        <div style={{
          fontFamily: 'var(--hp-font-display)', fontWeight: 600, fontSize: 16,
          letterSpacing: '-0.02em', color: 'var(--hp-ink-900)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 5,
        }}>
          {recipe.name}
        </div>
        {/* Rating + approval badges */}
        {(recipe.rating || approvedBy.length > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {recipe.rating && <StarRating rating={recipe.rating} size={11} />}
            {approvedBy.map(m => (
              <span key={m.id} className="recipe-card-approval-badge"
                style={{ background: m.color + '22', color: m.color, borderColor: m.color + '44', fontSize: 10, padding: '2px 7px' }}>
                {m.name} ✓
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Time + serves */}
      <div style={{ display: 'flex', gap: 14, color: 'var(--hp-ink-400)', flexShrink: 0, fontSize: 12 }}>
        {totalTime > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
            <IconClock size={12} /> {totalTime}m
          </span>
        )}
        {recipe.servings > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
            <IconServes size={12} /> {recipe.servings}
          </span>
        )}
      </div>
      <div onClick={e => e.stopPropagation()}>
        <AddToPlannerButton recipeId={recipe.id} addedSlot={addedSlot} onAddToPlanner={onAddToPlanner} compact />
      </div>
      <div style={{ color: 'var(--hp-ink-300)', flexShrink: 0 }}>
        <IconChevronR size={15} />
      </div>
    </div>
  )
}

// ── Detail slide-over panel ───────────────────────────────────────────────────
function DetailPanel({ recipe, onClose, onEdit, onOpenFull, approvalMembers = [], addedSlot, onAddToPlanner }) {
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
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={onOpenFull}
            title="Open full page"
            style={{ padding: '0 8px', color: 'var(--hp-ink-400)' }}>
            <IconExternalLink size={14} />
          </button>
          <AddToPlannerButton recipeId={recipe.id} addedSlot={addedSlot} onAddToPlanner={onAddToPlanner} />
          <button className="btn btn-primary btn-sm" onClick={onEdit}
            style={{ gap: 6, fontSize: 13 }}>
            <IconEdit size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Scrollable body — image is first item inside so it scrolls with content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 60px' }}>

        {/* Hero image */}
        <div style={{
          aspectRatio: '3 / 2', background: 'var(--hp-ink-50)',
          overflow: 'hidden', flexShrink: 0,
        }}>
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ opacity: 0.38 }}>
                <FoodIcon size={120} />
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '24px 28px 0' }}>

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

        {/* Approval badges — own row */}
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

        </div>{/* end inner padding div */}
      </div>{/* end scrollable body */}
    </div>
  )
}
