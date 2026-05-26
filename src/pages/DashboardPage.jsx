import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getMealPlan, getRecipes } from '../lib/supabase'
import { getWeekKey, shiftWeek, formatWeekOf } from '../lib/weeks'
import { getCategoryMeta } from '../lib/categories'
import {
  IconDinner, IconBreakfast, IconGrocery,
  IconClock, IconServes, IconFire,
  IconChevronL, IconChevronR,
  IconPlus, IconShare,
  IconAdults, IconKids, IconEveryone,
} from '../components/icons'
import { Mark } from '../components/Wordmark'
import './Dashboard.css'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const STRIP_COLORS = [
  'var(--hp-cherry)', 'var(--hp-ink-900)', 'var(--hp-spring)',
  'var(--hp-marigold)', 'var(--hp-tangerine)', 'var(--hp-cherry-600)', 'var(--hp-spring-700)',
]

// Derive Sunday of the given weekKey (YYYY-WW)
function weekStartSunday(weekKey) {
  const [year, week] = weekKey.split('-').map(Number)
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dow = simple.getDay()
  simple.setDate(simple.getDate() - dow)
  return simple
}

function StatTile({ eyebrow, big, sub, Icon, tint, textColor, dark }) {
  return (
    <div className="dash-stat-tile" style={{ background: tint, color: textColor }}>
      <div className="dash-stat-top">
        <div className="dash-stat-icon" style={{ background: dark ? 'rgba(255,255,255,0.18)' : 'var(--hp-ink-50)' }}>
          <Icon size={16} />
        </div>
        <span className="t-eyebrow" style={{ color: 'inherit', opacity: dark ? 0.85 : 1 }}>{eyebrow}</span>
      </div>
      <div className="dash-stat-bottom">
        <span className="dash-stat-num">{big}</span>
        <span className="dash-stat-sub">{sub}</span>
      </div>
    </div>
  )
}

function Legend({ dot, label, value }) {
  return (
    <div className="dash-legend-row">
      <span className="dash-legend-dot" style={{ background: dot }} />
      <span className="t-label" style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{label}</span>
      <span className="tabular" style={{ fontWeight: 600, fontSize: 13 }}>{value}</span>
    </div>
  )
}

export default function DashboardPage() {
  const user = useUser()
  const navigate = useNavigate()
  const [weekKey, setWeekKey] = useState(() => getWeekKey())
  const [plan, setPlan] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    if (!user) return
    getRecipes(user.id).then(({ data }) => setRecipes(data || []))
  }, [user])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getMealPlan(user.id, weekKey).then(({ data }) => {
      setPlan(data || {})
      setLoading(false)
    })
  }, [user, weekKey])

  const recipeMap = useMemo(() => Object.fromEntries(recipes.map(r => [r.id, r])), [recipes])

  const dinners   = plan?.dinners ?? []
  const dinnersMade = dinners.reduce((n, d) => n + Math.min(d.madeCount ?? 0, d.multiplier ?? 1), 0)
  const groceryEst = useMemo(() => {
    let c = 0
    dinners.forEach(d => { c += (recipeMap[d.adultRecipeId]?.ingredients?.length ?? 0) * (d.multiplier ?? 1) })
    return c
  }, [dinners, recipeMap])

  const audienceMix = useMemo(() => {
    const m = { everyone: 0, adults: 0, kids: 0 }
    dinners.forEach(d => { m[d.audience ?? 'everyone']++ })
    return m
  }, [dinners])

  const cookTime = useMemo(() => dinners.reduce((sum, d) => {
    const r = recipeMap[d.adultRecipeId]
    return sum + ((r?.cook_time || 0) + (r?.prep_time || 0)) * (d.multiplier ?? 1)
  }, 0), [dinners, recipeMap])

  const tonightDinner = dinners.find(d => (d.madeCount ?? 0) < (d.multiplier ?? 1))
  const tonightRecipe = tonightDinner ? recipeMap[tonightDinner.adultRecipeId] : null
  const tonightSides  = (tonightDinner?.sides ?? []).map(s => recipeMap[s.recipeId]?.name).filter(Boolean)
  const tonightTime   = tonightRecipe ? ((tonightRecipe.prep_time || 0) + (tonightRecipe.cook_time || 0)) : 0

  const today = new Date()
  const sunday = weekStartSunday(weekKey)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return d
  })

  const suggestRecipe = useMemo(() => {
    if (!recipes.length) return null
    return recipes[Math.floor(Math.random() * Math.min(recipes.length, 8))]
  }, [recipes]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleShare() {
    const text = `HomePlate · ${formatWeekOf(weekKey)}\n${
      dinners.map(d => recipeMap[d.adultRecipeId]?.name ?? '(recipe)').filter(Boolean).join('\n')
    }`
    try {
      if (navigator.share) await navigator.share({ text })
      else await navigator.clipboard.writeText(text)
    } catch { await navigator.clipboard.writeText(text).catch(() => {}) }
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  if (loading) return <div className="page"><div className="page-placeholder"><p>Loading…</p></div></div>

  return (
    <div className="page dash-page">

      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="page-hero-top">
          <span className="t-eyebrow" style={{ color: 'var(--ink-400)' }}>Home</span>
          <div className="week-nav">
            <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setWeekKey(k => shiftWeek(k, -1))}>
              <IconChevronL size={16} />
            </button>
            <span className="week-nav-label">{formatWeekOf(weekKey)}</span>
            <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setWeekKey(k => shiftWeek(k, 1))}>
              <IconChevronR size={16} />
            </button>
            {weekKey !== getWeekKey() && (
              <button className="btn btn-ghost btn-sm week-nav-today" onClick={() => setWeekKey(getWeekKey())}>
                This week
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleShare}>
              <IconShare size={14} /> {shared ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
        <h1 className="page-hero-title">
          {weekKey === getWeekKey() ? 'This week.' : 'The week.'}
        </h1>
      </div>

      {/* ── Row A: tonight + 3 stats ── */}
      <div className="dash-row-a">

        {/* Tonight tile */}
        <div className="dash-tonight">
          <div className="t-eyebrow dash-tonight-label">
            Tonight · {DAYS[today.getDay()]}
          </div>
          {tonightRecipe ? (
            <>
              <div className="dash-tonight-name">{tonightRecipe.name}</div>
              {tonightSides.length > 0 && (
                <p className="t-body-sm dash-tonight-sides">
                  with {tonightSides.join(' · ')}
                </p>
              )}
              <div className="dash-tonight-chips">
                {tonightDinner.audience && (
                  <span className="chip" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
                    {tonightDinner.audience === 'kids'   ? <IconKids size={13} />
                     : tonightDinner.audience === 'adults' ? <IconAdults size={13} />
                     : <IconEveryone size={13} />}
                    {' '}{tonightDinner.audience === 'everyone' ? 'Everyone'
                          : tonightDinner.audience === 'kids' ? 'Kids' : 'Adults'}
                  </span>
                )}
                {tonightTime > 0 && (
                  <span className="chip" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
                    <IconClock size={13} /> {tonightTime} min
                  </span>
                )}
                <button className="btn btn-md" style={{ background: '#fff', color: 'var(--hp-ink-900)', marginLeft: 'auto' }}
                  onClick={() => navigate(`/recipes/${tonightRecipe.id}`)}>
                  Open recipe
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="dash-tonight-name" style={{ opacity: .7 }}>No dinner planned.</div>
              <button className="btn btn-md" style={{ background: '#fff', color: 'var(--hp-ink-900)', marginTop: 16, alignSelf: 'flex-start' }}
                onClick={() => navigate('/planner')}>
                <IconPlus size={15} /> Plan tonight
              </button>
            </>
          )}
          <div className="dash-tonight-watermark">
            <Mark size={160} bg="#fff" fg="var(--hp-cherry)" accent="var(--hp-ink-900)" />
          </div>
        </div>

        <StatTile eyebrow="Dinners" big={`${dinnersMade}/${dinners.length}`}
          sub="nights cooked" Icon={IconDinner}
          tint="var(--hp-ink-900)" textColor="#fff" dark />
        <StatTile eyebrow="Grocery" big={String(groceryEst || '—')}
          sub="ingredients" Icon={IconGrocery}
          tint="var(--hp-spring)" textColor="#fff" dark />
        <StatTile eyebrow="Recipes" big={String(recipes.length)}
          sub="in cookbook" Icon={IconBreakfast}
          tint="var(--hp-paper)" textColor="var(--hp-ink-900)" />
      </div>

      {/* ── Row B: week at a glance ── */}
      <section className="card-out dash-card">
        <header className="dash-card-header">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h3 className="t-h3">Week at a glance</h3>
          </div>
          <button className="t-label" style={{ color: 'var(--hp-cherry)', fontSize: 13 }}
            onClick={() => navigate('/planner')}>Open planner →</button>
        </header>
        <div className="dash-week-grid">
          {weekDays.map((date, i) => {
            const dinner = dinners[i]
            const recipe = dinner ? recipeMap[dinner.adultRecipeId] : null
            const isToday = date.toDateString() === today.toDateString()
            return (
              <div key={i} className={`dash-day-cell ${isToday ? 'dash-day-cell--today' : ''} ${!dinner ? 'dash-day-cell--empty' : ''}`}>
                <div className="dash-day-top">
                  <span className="t-eyebrow" style={{ color: isToday ? 'var(--hp-cherry)' : 'var(--hp-ink-400)' }}>
                    {DAYS[date.getDay()]}
                  </span>
                  <span className="dash-day-num">{date.getDate()}</span>
                </div>
                {dinner && recipe?.name
                  ? <div className="dash-day-recipe">{recipe.name}</div>
                  : <div className="dash-day-empty">open</div>
                }
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Row C: cooking + pantry watch ── */}
      <div className="dash-row-c">
        <section className="card-out dash-card">
          <header className="dash-card-header">
            <h3 className="t-h3">Cooking this week</h3>
            <span className="chip">{dinners.length} dinner{dinners.length !== 1 ? 's' : ''}</span>
          </header>
          {dinners.length === 0 ? (
            <div className="dash-empty-hint">
              <p className="t-body-sm">No dinners planned yet.</p>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/planner')}>
                <IconPlus size={14} /> Add dinners
              </button>
            </div>
          ) : (
            <div className="dash-cook-list">
              {dinners.map((d, i) => {
                const r = recipeMap[d.adultRecipeId]
                if (!r) return null
                const sides = (d.sides ?? []).map(s => recipeMap[s.recipeId]?.name).filter(Boolean)
                const color = STRIP_COLORS[i % STRIP_COLORS.length]
                const isFirst = i === 0 && (d.madeCount ?? 0) === 0
                return (
                  <div key={d.id} className="dash-cook-row">
                    <div className="dash-cook-day" style={{
                      background: color,
                      color: (color === 'var(--hp-marigold)') ? 'var(--hp-ink-900)' : '#fff',
                    }}>
                      {DAYS[i] ?? `D${i+1}`}
                    </div>
                    <div className="dash-cook-info">
                      <div className="dash-cook-name">{r.name}</div>
                      {sides.length > 0 && (
                        <div className="t-caption" style={{ color: 'var(--hp-ink-500)' }}>{sides.join(' · ')}</div>
                      )}
                    </div>
                    <span className={`chip ${d.audience === 'everyone' ? 'chip-hot' : d.audience === 'kids' ? 'chip-sun' : ''}`}
                      style={{ height: 24, padding: '0 10px', fontSize: 11 }}>
                      {d.audience === 'adults' ? 'Adults' : d.audience === 'kids' ? 'Kids' : 'Everyone'}
                    </span>
                    {isFirst
                      ? <span className="chip chip-on" style={{ height: 24 }}>Tonight</span>
                      : <div className="dash-cook-check" />
                    }
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="card-out dash-card">
          <header className="dash-card-header">
            <h3 className="t-h3">Pantry watch</h3>
          </header>
          <p className="t-body-sm" style={{ color: 'var(--hp-ink-500)', marginBottom: 14 }}>
            Common staples your recipes call for this week.
          </p>
          {(() => {
            const STAPLES = ['salt', 'pepper', 'olive oil', 'butter', 'garlic', 'onion', 'oil', 'flour', 'sugar', 'egg']
            const found = new Set()
            dinners.forEach(d => {
              recipeMap[d.adultRecipeId]?.ingredients?.forEach(ing => {
                const n = (ing.name ?? '').toLowerCase()
                STAPLES.forEach(s => { if (n.includes(s)) found.add(ing.name) })
              })
            })
            const items = [...found].slice(0, 6)
            return items.length > 0 ? (
              <div>
                {items.map((name, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: i === 0 ? 'none' : '1px solid var(--hp-ink-100)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--hp-spring)', flex: '0 0 auto' }} />
                    <span className="t-label" style={{ flex: 1, fontSize: 13 }}>{name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty-hint t-body-sm" style={{ color: 'var(--hp-ink-400)' }}>
                Plan some dinners to see pantry items here.
              </div>
            )
          })()}
        </section>
      </div>

      {/* ── Row D: cook time + audience + quick nav ── */}
      <div className="dash-row-d">
        {/* Cook time */}
        <section className="card-out">
          <div className="t-eyebrow" style={{ marginBottom: 10, color: 'var(--hp-ink-500)' }}>Cook time · this week</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span className="t-num-md">{cookTime}</span>
            <span className="t-body-sm" style={{ color: 'var(--hp-ink-500)' }}>min total</span>
          </div>
          <div className="t-body-sm" style={{ color: 'var(--hp-ink-500)', marginTop: 4 }}>
            across {dinners.length} night{dinners.length !== 1 ? 's' : ''}
          </div>
          <div className="dash-bar-chart">
            {weekDays.map((date, i) => {
              const d = dinners[i]
              const r = d ? recipeMap[d.adultRecipeId] : null
              const h = r ? ((r.prep_time || 0) + (r.cook_time || 0)) : 0
              const max = 120
              return (
                <div key={i} className="dash-bar-col">
                  <div className="dash-bar" style={{
                    height: h ? `${Math.max(10, (h / max) * 100)}%` : '10%',
                    background: h ? 'var(--hp-cherry)' : 'var(--hp-ink-100)',
                  }} />
                  <span className="t-caption" style={{ color: 'var(--hp-ink-400)' }}>{DAYS[i][0]}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Audience mix */}
        <section className="card-out">
          <div className="t-eyebrow" style={{ marginBottom: 10, color: 'var(--hp-ink-500)' }}>Audience mix</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="t-num-md">{dinners.length}</span>
            <span className="t-body-sm" style={{ color: 'var(--hp-ink-500)' }}>meals planned</span>
          </div>
          {dinners.length > 0 && (
            <div className="dash-audience-bar">
              {audienceMix.everyone > 0 && <div style={{ flex: audienceMix.everyone, background: 'var(--hp-cherry)' }} />}
              {audienceMix.adults  > 0 && <div style={{ flex: audienceMix.adults,   background: 'var(--hp-ink-900)' }} />}
              {audienceMix.kids    > 0 && <div style={{ flex: audienceMix.kids,     background: 'var(--hp-marigold)' }} />}
            </div>
          )}
          <div className="dash-legend">
            <Legend dot="var(--hp-cherry)"   label="Everyone"    value={String(audienceMix.everyone)} />
            <Legend dot="var(--hp-ink-900)"  label="Adults only" value={String(audienceMix.adults)} />
            <Legend dot="var(--hp-marigold)" label="Kids only"   value={String(audienceMix.kids)} />
          </div>
        </section>

        {/* Quick nav */}
        <section className="card-out dash-quick-nav">
          <div className="t-eyebrow" style={{ marginBottom: 14, color: 'var(--hp-ink-500)' }}>Jump to</div>
          {[
            { label: 'Planner', sub: `${dinners.length} dinner${dinners.length !== 1 ? 's' : ''}`, path: '/planner', bg: 'var(--hp-cherry)', Icon: IconDinner },
            { label: 'Grocery', sub: `${groceryEst} ingredients`, path: '/grocery', bg: 'var(--hp-spring)', Icon: IconGrocery },
            { label: 'Recipes', sub: `${recipes.length} saved`, path: '/recipes', bg: 'var(--hp-marigold)', Icon: IconFire },
          ].map(({ label, sub, path, bg, Icon }) => (
            <button key={path} className="dash-quick-btn" onClick={() => navigate(path)}>
              <div className="dash-quick-icon" style={{ background: bg, color: bg === 'var(--hp-marigold)' ? 'var(--hp-ink-900)' : '#fff' }}>
                <Icon size={16} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div className="t-label" style={{ fontSize: 14 }}>{label}</div>
                <div className="t-caption" style={{ color: 'var(--hp-ink-500)', marginTop: 1 }}>{sub}</div>
              </div>
            </button>
          ))}
        </section>
      </div>

      {/* ── Row E: cookbook grid + try this ── */}
      <div className="dash-row-e">
        <section className="card-out dash-card">
          <header className="dash-card-header">
            <h3 className="t-h3">From your cookbook</h3>
            <button className="t-label" style={{ color: 'var(--hp-ink-400)', fontSize: 13 }}
              onClick={() => navigate('/recipes')}>View all</button>
          </header>
          {recipes.length === 0 ? (
            <div className="dash-empty-hint">
              <p className="t-body-sm">No recipes yet.</p>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/recipes/new')}>
                <IconPlus size={14} /> Add recipe
              </button>
            </div>
          ) : (
            <div className="dash-cookbook-grid">
              {recipes.slice(0, 4).map(r => {
                const meta = getCategoryMeta(r.category)
                return (
                  <div key={r.id} className="dash-mini-card" onClick={() => navigate(`/recipes/${r.id}`)}>
                    <div className="dash-mini-strip" style={{ background: meta.color }} />
                    <div className="dash-mini-name">{r.name}</div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Try this week */}
        <section className="dash-try-card">
          <div className="t-eyebrow dash-try-label">Try this week</div>
          {suggestRecipe ? (
            <>
              <div className="dash-try-name">{suggestRecipe.name}</div>
              <p className="t-body-sm" style={{ color: 'var(--hp-ink-300)', marginTop: 10, maxWidth: 300 }}>
                From your cookbook · serves {suggestRecipe.servings || '?'}.
              </p>
              <div className="dash-try-chips">
                {((suggestRecipe.prep_time || 0) + (suggestRecipe.cook_time || 0)) > 0 && (
                  <span className="chip" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                    <IconClock size={13} /> {(suggestRecipe.prep_time || 0) + (suggestRecipe.cook_time || 0)} min
                  </span>
                )}
                {suggestRecipe.servings > 0 && (
                  <span className="chip" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                    <IconServes size={13} /> Serves {suggestRecipe.servings}
                  </span>
                )}
                <button className="btn btn-md" style={{ background: 'var(--hp-marigold)', color: 'var(--hp-ink-900)', marginLeft: 'auto' }}
                  onClick={() => navigate(`/recipes/${suggestRecipe.id}`)}>
                  Add to Tuesday
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="dash-try-name">Add recipes to your cookbook.</div>
              <button className="btn btn-md" style={{ background: 'var(--hp-marigold)', color: 'var(--hp-ink-900)', marginTop: 16, alignSelf: 'flex-start' }}
                onClick={() => navigate('/recipes/new')}>
                <IconPlus size={15} /> Add recipe
              </button>
            </>
          )}
          <div className="dash-try-watermark">
            <Mark size={140} bg="#fff" fg="var(--hp-ink-900)" accent="var(--hp-marigold)" />
          </div>
        </section>
      </div>

    </div>
  )
}
