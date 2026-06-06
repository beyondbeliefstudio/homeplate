import { useState, useEffect } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'
import { useUser } from '../hooks/useAuth.jsx'
import { signOut, getHouseholdMembers, saveHouseholdMember, deleteHouseholdMember, getStores, saveStore, deleteStore } from '../lib/supabase'
import { IconPlus, IconTrash, IconClose, IconCheck } from '../components/icons'
import { STORE_PALETTES, getStorePalette } from '../lib/storePalettes'
import {
  loadCategories, saveCategories, DEFAULT_GROCERY_GROUPS, CATEGORY_COLORS,
} from '../lib/groceryCategories'
import './Settings.css'

// ─── Shared primitives ────────────────────────────────────────────────────────
const MEMBER_COLORS = [
  '#2563EB', '#D97757', '#16A34A', '#CA8A04', '#7C3AED', '#0891B2', '#E63957', '#E8732A',
]

function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 42, height: 24, borderRadius: 12, cursor: 'pointer', flexShrink: 0,
        background: on ? 'var(--hp-green)' : 'var(--hp-ink-200)',
        position: 'relative', transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.22)', transition: 'left 0.18s',
      }} />
    </div>
  )
}

function SHead({ title, desc }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: 'var(--hp-font-display)', fontWeight: 600, fontSize: 26,
        letterSpacing: '-0.02em', color: 'var(--hp-ink-900)', margin: '0 0 5px' }}>
        {title}
      </h2>
      {desc && (
        <p style={{ fontFamily: 'var(--hp-font-body)', fontSize: 13,
          color: 'var(--hp-ink-400)', margin: 0, lineHeight: 1.5 }}>
          {desc}
        </p>
      )}
    </div>
  )
}

function SettingRow({ label, desc, children, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 24, padding: '16px 0',
      borderBottom: last ? 'none' : '1px solid var(--hp-ink-100)',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--hp-font-body)', fontSize: 14, fontWeight: 600,
          color: 'var(--hp-ink-900)', marginBottom: desc ? 2 : 0 }}>{label}</div>
        {desc && (
          <div style={{ fontFamily: 'var(--hp-font-body)', fontSize: 12,
            color: 'var(--hp-ink-400)', lineHeight: 1.4 }}>{desc}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

// ─── Household section ────────────────────────────────────────────────────────
function MemberCard({ member, onChange, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(member)

  // Keep draft in sync if parent updates member (e.g. after save)
  useEffect(() => { setDraft(member) }, [member])

  const save   = () => { onChange(draft); setEditing(false) }
  const cancel = () => { setDraft(member); setEditing(false) }

  const toggleApproval = () => onChange({ ...member, meal_approval: !member.meal_approval })

  const initials = (member.name || 'M')[0].toUpperCase()

  return (
    <div style={{
      background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-100)',
      borderRadius: 'var(--r-xl)', padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Avatar + name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: member.color || MEMBER_COLORS[0],
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <span style={{ fontFamily: 'var(--hp-font-display)', fontWeight: 700,
            fontSize: 19, color: '#fff' }}>{initials}</span>
        </div>
        {editing ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <input value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              style={{ fontFamily: 'var(--hp-font-body)', fontWeight: 600, fontSize: 14,
                border: '1px solid var(--hp-ink-200)', borderRadius: 'var(--r-sm)',
                padding: '4px 8px', outline: 'none', color: 'var(--hp-ink-900)',
                width: '100%', boxSizing: 'border-box', background: 'var(--hp-paper)' }} />
            <input value={draft.role || ''} onChange={e => setDraft(d => ({ ...d, role: e.target.value }))}
              placeholder="Role or age"
              style={{ fontFamily: 'var(--hp-font-body)', fontSize: 12,
                border: '1px solid var(--hp-ink-200)', borderRadius: 'var(--r-sm)',
                padding: '4px 8px', outline: 'none', color: 'var(--hp-ink-500)',
                width: '100%', boxSizing: 'border-box', background: 'var(--hp-paper)' }} />
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--hp-font-body)', fontWeight: 700, fontSize: 15,
              color: 'var(--hp-ink-900)' }}>{member.name}</div>
            {member.role && (
              <div style={{ fontFamily: 'var(--hp-font-body)', fontSize: 12,
                color: 'var(--hp-ink-400)', marginTop: 1 }}>{member.role}</div>
            )}
          </div>
        )}
        <button
          onClick={() => editing ? cancel() : setEditing(true)}
          style={{
            background: 'var(--hp-ink-50)', border: '1px solid var(--hp-ink-100)',
            borderRadius: 'var(--r-sm)', padding: '4px 10px', cursor: 'pointer',
            fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 600,
            color: 'var(--hp-ink-600)', flexShrink: 0,
          }}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Color picker */}
      {editing && (
        <div>
          <div style={{ fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 700,
            color: 'var(--hp-ink-400)', letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 8 }}>Color</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {MEMBER_COLORS.map(c => (
              <button key={c} onClick={() => setDraft(d => ({ ...d, color: c }))}
                style={{
                  width: 24, height: 24, borderRadius: '50%', background: c, border: 'none',
                  cursor: 'pointer', boxSizing: 'border-box',
                  outline: draft.color === c ? `3px solid var(--hp-ink-900)` : '2px solid transparent',
                  outlineOffset: 2,
                }} />
            ))}
          </div>
        </div>
      )}

      {/* Save / delete */}
      {editing && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save}
            style={{
              flex: 1, height: 34, borderRadius: 'var(--r-sm)', border: 'none',
              background: 'var(--hp-ink-900)', color: 'var(--hp-bg-app)',
              fontFamily: 'var(--hp-font-body)', fontWeight: 600, fontSize: 12, cursor: 'pointer',
            }}>Save changes</button>
          <button onClick={() => onDelete(member.id)}
            style={{
              width: 34, height: 34, borderRadius: 'var(--r-sm)',
              border: '1px solid var(--hp-ink-200)', background: 'var(--hp-ink-50)',
              color: 'var(--hp-ink-500)', cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}>
            <IconTrash size={14} />
          </button>
        </div>
      )}

      {/* Meal approval toggle — always visible */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, paddingTop: 14,
        borderTop: '1px solid var(--hp-ink-100)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--hp-font-body)', fontSize: 13, fontWeight: 600,
            color: 'var(--hp-ink-800)', marginBottom: 2 }}>Meal approval tracking</div>
          <div style={{ fontFamily: 'var(--hp-font-body)', fontSize: 12,
            color: 'var(--hp-ink-400)', lineHeight: 1.4 }}>
            Show "{member.name} ✓" on recipes they enjoy
          </div>
        </div>
        <Toggle on={!!member.meal_approval} onChange={toggleApproval} />
      </div>
    </div>
  )
}

function HouseholdSection({ user, members, setMembers }) {
  const [saving, setSaving] = useState(false)

  async function addMember() {
    if (!user) return
    const name  = 'New member'
    const color = MEMBER_COLORS[members.length % MEMBER_COLORS.length]
    setSaving(true)
    const { data } = await saveHouseholdMember(user.id, { name, color })
    if (data) setMembers(m => [...m, data])
    setSaving(false)
  }

  async function updateMember(updated) {
    if (!user) return
    await saveHouseholdMember(user.id, updated)
    setMembers(ms => ms.map(m => m.id === updated.id ? updated : m))
  }

  async function removeMember(id) {
    if (!user) return
    await deleteHouseholdMember(id)
    setMembers(ms => ms.filter(m => m.id !== id))
  }

  return (
    <div>
      <SHead title="Household"
        desc="Manage family members whose names and meal preferences appear in the Planner." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {members.map(m => (
          <MemberCard key={m.id} member={m} onChange={updateMember} onDelete={removeMember} />
        ))}
      </div>
      <button onClick={addMember} disabled={saving}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 18px',
          borderRadius: 'var(--r-md)', border: '1.5px dashed var(--hp-ink-200)',
          background: 'transparent', cursor: 'pointer',
          fontFamily: 'var(--hp-font-body)', fontWeight: 600, fontSize: 13, color: 'var(--hp-ink-500)',
        }}>
        <IconPlus size={16} /> Add member
      </button>
    </div>
  )
}

// ─── Tags & Filters section ───────────────────────────────────────────────────
const INIT_TAG_GROUPS = {
  Dinner:    { label: 'Protein', tags: ['Chicken', 'Ground beef', 'Pork', 'Steak', 'Shrimp', 'Salmon'] },
  Lunch:     { label: 'Protein', tags: ['Chicken', 'Shrimp', 'Turkey', 'Vegetarian'] },
  Breakfast: { label: 'Style',   tags: ['Sweet', 'Savory', 'Quick'] },
  Side:      { label: 'Type',    tags: ['Salad', 'Bread', 'Vegetable', 'Pasta'] },
  Snack:     { label: 'Type',    tags: ['Sweet', 'Savory', 'No-cook', 'Make-ahead'] },
  Dessert:   { label: 'Type',    tags: ['Chocolate', 'Baked', 'No-bake'] },
  Beverage:  { label: 'Type',    tags: ['Smoothie', 'Juice', 'Coffee', 'Tea', 'Cocktail', 'Mocktail'] },
}

function TagGroupCard({ cat, group, onChange }) {
  const [newTag, setNewTag] = useState('')

  const addTag    = () => {
    const t = newTag.trim()
    if (t && !group.tags.includes(t)) onChange(cat, { ...group, tags: [...group.tags, t] })
    setNewTag('')
  }
  const removeTag = (tag) => onChange(cat, { ...group, tags: group.tags.filter(t => t !== tag) })

  return (
    <div style={{
      background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-100)',
      borderRadius: 'var(--r-xl)', padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--hp-font-display)', fontWeight: 600, fontSize: 15,
          color: 'var(--hp-ink-900)' }}>{cat}</span>
        <div style={{ width: 1, height: 13, background: 'var(--hp-ink-200)' }} />
        <span style={{ fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 700,
          color: 'var(--hp-ink-400)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {group.label}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, minHeight: 28 }}>
        {group.tags.map(tag => (
          <span key={tag} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 28, padding: '0 8px 0 11px', borderRadius: 'var(--r-pill)',
            background: 'var(--hp-ink-50)', border: '1px solid var(--hp-ink-100)',
            fontFamily: 'var(--hp-font-body)', fontSize: 12, fontWeight: 600,
            color: 'var(--hp-ink-700)',
          }}>
            {tag}
            <button onClick={() => removeTag(tag)}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--hp-ink-300)', display: 'grid', placeItems: 'center',
                padding: '0 1px', lineHeight: 1 }}>
              <IconClose size={10} />
            </button>
          </span>
        ))}
        {group.tags.length === 0 && (
          <span style={{ fontFamily: 'var(--hp-font-body)', fontSize: 12,
            color: 'var(--hp-ink-300)', fontStyle: 'italic' }}>No tags yet</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={newTag} onChange={e => setNewTag(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTag()}
          placeholder="Add a tag…"
          style={{
            flex: 1, fontFamily: 'var(--hp-font-body)', fontSize: 12,
            border: '1px solid var(--hp-ink-200)', borderRadius: 'var(--r-sm)',
            padding: '6px 10px', outline: 'none', color: 'var(--hp-ink-900)',
            background: 'var(--hp-bg-app)',
          }} />
        <button onClick={addTag}
          style={{
            height: 32, padding: '0 12px', borderRadius: 'var(--r-sm)',
            border: 'none', background: 'var(--hp-ink-900)', color: 'var(--hp-bg-app)',
            fontFamily: 'var(--hp-font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Add</button>
      </div>
    </div>
  )
}

function TagsSection() {
  const [groups, setGroups] = useState(INIT_TAG_GROUPS)
  const update = (cat, updated) => setGroups(g => ({ ...g, [cat]: updated }))

  return (
    <div>
      <SHead title="Tags & Filters"
        desc="Control the filter chips that appear in the Cookbook when browsing by category." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {Object.entries(groups).map(([cat, group]) => (
          <TagGroupCard key={cat} cat={cat} group={group} onChange={update} />
        ))}
      </div>
    </div>
  )
}

// ─── Stores section ───────────────────────────────────────────────────────────
function StoresSection({ user }) {
  const [stores,   setStores]   = useState([])
  const [newName,  setNewName]  = useState('')
  const [editId,   setEditId]   = useState(null)
  const [editName, setEditName] = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!user) return
    getStores(user.id).then(({ data }) => {
      setStores(data ?? [])
      setLoading(false)
    })
  }, [user])

  const addStore = async () => {
    const name = newName.trim()
    if (!name || !user) return
    const palette = stores.length % STORE_PALETTES.length
    const { data } = await saveStore(user.id, { name, palette })
    if (data) setStores(prev => [...prev, data])
    setNewName('')
  }

  const saveEdit = async (id) => {
    const name = editName.trim()
    if (name && user) {
      const store = stores.find(s => s.id === id)
      await saveStore(user.id, { ...store, name })
      setStores(prev => prev.map(s => s.id === id ? { ...s, name } : s))
    }
    setEditId(null)
  }

  const setPalette = async (store, paletteIdx) => {
    const updated = { ...store, palette: paletteIdx }
    setStores(prev => prev.map(s => s.id === store.id ? updated : s))
    await saveStore(user.id, updated)
  }

  const remove = async (id) => {
    await deleteStore(id)
    setStores(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div>
      <SHead title="Stores"
        desc="The stores that appear as tags on grocery list items. Add your regular shops." />

      <div style={{
        background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-100)',
        borderRadius: 'var(--r-xl)', padding: '4px 24px', marginBottom: 14,
      }}>
        {loading && (
          <div style={{ padding: '20px 0', color: 'var(--hp-ink-400)', fontSize: 13 }}>Loading…</div>
        )}
        {!loading && stores.length === 0 && (
          <div style={{ padding: '20px 0', fontFamily: 'var(--hp-font-body)', fontSize: 13,
            color: 'var(--hp-ink-300)', fontStyle: 'italic' }}>No stores yet — add one below.</div>
        )}
        {stores.map((store, i) => {
          const pal    = getStorePalette(store)
          const isLast = i === stores.length - 1
          return (
            <div key={store.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
              borderBottom: isLast ? 'none' : '1px solid var(--hp-ink-100)',
            }}>
              {/* Store name badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 12px',
                borderRadius: 'var(--r-pill)', background: pal.bg, color: pal.color,
                border: `1px solid ${pal.border}`, fontFamily: 'var(--hp-font-body)',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                flexShrink: 0, minWidth: 70, justifyContent: 'center',
              }}>{store.name}</span>

              {/* Store name / edit input */}
              {editId === store.id ? (
                <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(store.id); if (e.key === 'Escape') setEditId(null) }}
                  style={{
                    flex: 1, fontFamily: 'var(--hp-font-body)', fontSize: 14, fontWeight: 600,
                    border: '1px solid var(--hp-ink-200)', borderRadius: 'var(--r-sm)',
                    padding: '5px 10px', outline: 'none', color: 'var(--hp-ink-900)',
                    background: 'var(--hp-paper)',
                  }} />
              ) : (
                <span style={{ flex: 1, fontFamily: 'var(--hp-font-body)', fontSize: 14,
                  fontWeight: 600, color: 'var(--hp-ink-900)' }}>{store.name}</span>
              )}

              {/* Color swatches — always visible, one click to assign */}
              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                {STORE_PALETTES.map((p, idx) => (
                  <button key={idx} onClick={() => setPalette(store, idx)}
                    title={`Color ${idx + 1}`}
                    style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: p.color, border: 'none', cursor: 'pointer',
                      boxSizing: 'border-box', flexShrink: 0,
                      outline: (store.palette ?? 0) === idx ? '2px solid var(--hp-ink-900)' : '2px solid transparent',
                      outlineOffset: 2,
                      transition: 'outline-color 0.1s',
                    }} />
                ))}
              </div>

              {/* Rename / delete */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {editId === store.id ? (
                  <>
                    <button onClick={() => saveEdit(store.id)}
                      style={{ height: 30, padding: '0 12px', borderRadius: 'var(--r-sm)',
                        border: 'none', background: 'var(--hp-ink-900)', color: 'var(--hp-bg-app)',
                        fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditId(null)}
                      style={{ height: 30, padding: '0 10px', borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--hp-ink-200)', background: 'transparent',
                        fontFamily: 'var(--hp-font-body)', fontSize: 11, color: 'var(--hp-ink-500)', cursor: 'pointer' }}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => { setEditId(store.id); setEditName(store.name) }}
                    style={{ height: 30, padding: '0 12px', borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--hp-ink-200)', background: 'var(--hp-ink-50)',
                      fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 600,
                      color: 'var(--hp-ink-600)', cursor: 'pointer' }}>Rename</button>
                )}
                <button onClick={() => remove(store.id)}
                  style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--hp-ink-200)', background: 'var(--hp-ink-50)',
                    color: 'var(--hp-ink-400)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <IconTrash size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addStore()}
          placeholder="New store name (e.g. Costco, Trader Joe's…)"
          style={{
            flex: 1, fontFamily: 'var(--hp-font-body)', fontSize: 13,
            border: '1px solid var(--hp-ink-200)', borderRadius: 'var(--r-md)',
            padding: '9px 14px', outline: 'none', color: 'var(--hp-ink-900)',
            background: 'var(--hp-paper)',
          }} />
        <button onClick={addStore}
          style={{
            height: 40, padding: '0 18px', borderRadius: 'var(--r-md)',
            border: 'none', background: 'var(--hp-ink-900)', color: 'var(--hp-bg-app)',
            fontFamily: 'var(--hp-font-body)', fontWeight: 600, fontSize: 13,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <IconPlus size={15} /> Add store
        </button>
      </div>
    </div>
  )
}

// ─── Planner section ──────────────────────────────────────────────────────────
function PlannerSection() {
  const [weekStart, setWeekStart] = useState('Sunday')
  const [slots,     setSlots]     = useState({ Breakfast: true, Lunch: false, Dinner: true, Snacks: true })
  const [reminders, setReminders] = useState(false)

  return (
    <div>
      <SHead title="Planner" desc="Defaults for your weekly meal planning view." />
      <div style={{
        background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-100)',
        borderRadius: 'var(--r-xl)', padding: '4px 24px',
      }}>
        <SettingRow label="Week starts on" desc="First day shown in the planner">
          <div style={{ display: 'flex', gap: 6 }}>
            {['Sunday', 'Monday'].map(d => (
              <button key={d} onClick={() => setWeekStart(d)}
                style={{
                  height: 32, padding: '0 14px', borderRadius: 'var(--r-sm)', border: 'none',
                  cursor: 'pointer', fontFamily: 'var(--hp-font-body)', fontWeight: 600, fontSize: 12,
                  background: weekStart === d ? 'var(--hp-ink-900)' : 'var(--hp-ink-50)',
                  color:      weekStart === d ? 'var(--hp-bg-app)'  : 'var(--hp-ink-600)',
                  outline:    weekStart !== d ? '1px solid var(--hp-ink-200)' : 'none',
                }}>{d}</button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Default meal slots" desc="Which sections appear in the planner by default">
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.entries(slots).map(([slot, on]) => (
              <button key={slot} onClick={() => setSlots(s => ({ ...s, [slot]: !s[slot] }))}
                style={{
                  height: 32, padding: '0 11px', borderRadius: 'var(--r-sm)', border: 'none',
                  cursor: 'pointer', fontFamily: 'var(--hp-font-body)', fontWeight: 600, fontSize: 11,
                  background: on ? 'var(--hp-green-50)'  : 'var(--hp-ink-50)',
                  color:      on ? 'var(--hp-green-700)' : 'var(--hp-ink-500)',
                  outline:    `1px solid ${on ? 'var(--hp-green-200)' : 'var(--hp-ink-200)'}`,
                }}>{slot}</button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Planning reminder" desc="Remind you every Sunday to plan the next week" last>
          <Toggle on={reminders} onChange={setReminders} />
        </SettingRow>
      </div>
    </div>
  )
}

// ─── AI section ───────────────────────────────────────────────────────────────
function AISection() {
  const [summary,   setSummary]   = useState(true)
  const [threshold, setThreshold] = useState(4)
  const [recCount,  setRecCount]  = useState(4)
  const [proteinOn, setProteinOn] = useState(true)

  return (
    <div>
      <SHead title="AI & Recommendations"
        desc="Control how HomePlate's weekly summary and recipe suggestions work." />
      <div style={{
        background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-100)',
        borderRadius: 'var(--r-xl)', padding: '4px 24px',
      }}>
        <SettingRow label="Weekly AI summary" desc="Generate a written review of your week's meals every Monday">
          <Toggle on={summary} onChange={setSummary} />
        </SettingRow>
        <SettingRow label="Protein diversity nudge" desc="Flag weeks where the same protein appears 3+ times">
          <Toggle on={proteinOn} onChange={setProteinOn} />
        </SettingRow>
        <SettingRow label="Re-suggest after"
          desc="Recommend a recipe again after it hasn't been made for this many weeks">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="range" min={1} max={12} value={threshold}
              onChange={e => setThreshold(+e.target.value)}
              style={{ width: 110, accentColor: 'var(--hp-green)', cursor: 'pointer' }} />
            <span style={{ fontFamily: 'var(--hp-font-body)', fontWeight: 700, fontSize: 13,
              color: 'var(--hp-ink-900)', minWidth: 58 }}>
              {threshold} {threshold === 1 ? 'week' : 'weeks'}
            </span>
          </div>
        </SettingRow>
        <SettingRow label="Recommendations shown"
          desc="How many meals appear in the Recommended section on Dashboard" last>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="range" min={2} max={8} value={recCount}
              onChange={e => setRecCount(+e.target.value)}
              style={{ width: 110, accentColor: 'var(--hp-green)', cursor: 'pointer' }} />
            <span style={{ fontFamily: 'var(--hp-font-body)', fontWeight: 700, fontSize: 13,
              color: 'var(--hp-ink-900)', minWidth: 18 }}>{recCount}</span>
          </div>
        </SettingRow>
      </div>
    </div>
  )
}

// ─── Appearance section ───────────────────────────────────────────────────────
function AppearanceSection({ isDark, toggle: toggleDark }) {
  const getStored = () => localStorage.getItem('hp-theme') || 'light'
  const [mode, setMode] = useState(getStored)

  const apply = (t) => {
    setMode(t)
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      localStorage.removeItem('hp-theme')
    } else {
      document.documentElement.setAttribute('data-theme', t)
      localStorage.setItem('hp-theme', t)
    }
  }

  return (
    <div>
      <SHead title="Appearance"
        desc="Choose how HomePlate looks. Your preference is saved locally." />
      <div style={{
        background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-100)',
        borderRadius: 'var(--r-xl)', padding: '4px 24px',
      }}>
        <SettingRow label="Theme" desc="Light, dark, or follow your system setting" last>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['light', '☀︎ Light'], ['dark', '⏾ Dark'], ['system', '⊙ System']].map(([val, label]) => (
              <button key={val} onClick={() => apply(val)}
                style={{
                  height: 34, padding: '0 14px', borderRadius: 'var(--r-sm)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--hp-font-body)', fontWeight: 600, fontSize: 12,
                  background: mode === val ? 'var(--hp-ink-900)' : 'var(--hp-ink-50)',
                  color:      mode === val ? 'var(--hp-bg-app)'  : 'var(--hp-ink-600)',
                  outline:    mode !== val ? '1px solid var(--hp-ink-200)' : 'none',
                }}>{label}</button>
            ))}
          </div>
        </SettingRow>
      </div>

      {/* Preview swatches */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[['light', '#F7F8F5', '#FFFFFF', '#20241C'], ['dark', '#0F1510', '#182016', '#ECF2E8']].map(([name, bg, card, text]) => (
          <div key={name} onClick={() => apply(name)}
            style={{
              borderRadius: 'var(--r-xl)', overflow: 'hidden',
              border: `2px solid ${mode === name ? 'var(--hp-green)' : 'var(--hp-ink-100)'}`,
              cursor: 'pointer', transition: 'border-color 0.15s',
            }}>
            <div style={{ background: bg, padding: '16px 16px 12px' }}>
              <div style={{ width: 40, height: 6, borderRadius: 4, background: 'var(--green-700)', marginBottom: 12 }} />
              <div style={{ background: card, borderRadius: 6, padding: '12px 14px' }}>
                <div style={{ width: '60%', height: 8, borderRadius: 4, background: text, opacity: 0.8, marginBottom: 8 }} />
                <div style={{ width: '40%', height: 6, borderRadius: 4, background: text, opacity: 0.35 }} />
              </div>
            </div>
            <div style={{ background: card, padding: '8px 16px',
              borderTop: `1px solid ${name === 'dark' ? '#1E2C1A' : '#ECEDE2'}` }}>
              <span style={{ fontFamily: 'var(--hp-font-body)', fontSize: 12, fontWeight: 600,
                color: text, opacity: 0.7, textTransform: 'capitalize' }}>{name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Account section ──────────────────────────────────────────────────────────
function AccountSection({ user }) {
  return (
    <div>
      <SHead title="Account" desc="Your sign-in details and session management." />
      <div style={{
        background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-100)',
        borderRadius: 'var(--r-xl)', padding: '4px 24px',
      }}>
        <SettingRow label={user?.user_metadata?.full_name || 'Signed in'}
          desc={user?.email} last>
          <button className="btn btn-secondary btn-sm" onClick={signOut}>Sign out</button>
        </SettingRow>
      </div>
    </div>
  )
}

// ─── Grocery Categories section ───────────────────────────────────────────────
function GroceryCategoriesSection() {
  const [cats, setCats]         = useState(() => loadCategories())
  const [editKey, setEditKey]   = useState(null)  // key of row being edited
  const [draft, setDraft]       = useState({})     // { label, emoji }
  const [adding, setAdding]     = useState(false)
  const [newDraft, setNewDraft] = useState({ label: '', emoji: '🛒', color: CATEGORY_COLORS[0] })

  function persist(updated) {
    setCats(updated)
    saveCategories(updated)
    // Notify same-tab GroceryPage via a synthetic storage event
    window.dispatchEvent(new StorageEvent('storage', { key: 'hp-grocery-categories' }))
  }

  function startEdit(cat) {
    setEditKey(cat.key)
    setDraft({ label: cat.label, emoji: cat.emoji })
  }

  function saveEdit(key) {
    persist(cats.map(c => c.key === key ? { ...c, ...draft } : c))
    setEditKey(null)
  }

  function cancelEdit() { setEditKey(null) }

  function toggleHide(key) {
    // Can't hide "other" — it's the catch-all
    if (key === 'other') return
    persist(cats.map(c => c.key === key ? { ...c, hidden: !c.hidden } : c))
  }

  function moveUp(i) {
    if (i === 0) return
    const next = [...cats]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    persist(next)
  }

  function moveDown(i) {
    if (i === cats.length - 1) return
    const next = [...cats]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    persist(next)
  }

  function addCategory() {
    const label = newDraft.label.trim()
    if (!label) return
    const key = `custom-${Date.now()}`
    persist([...cats, { key, label, emoji: newDraft.emoji, color: newDraft.color, builtIn: false, hidden: false }])
    setNewDraft({ label: '', emoji: '🛒', color: CATEGORY_COLORS[0] })
    setAdding(false)
  }

  function deleteCategory(key) {
    persist(cats.filter(c => c.key !== key))
  }

  function resetToDefaults() {
    if (!window.confirm('Reset all categories to defaults? Custom categories will be removed.')) return
    persist(DEFAULT_GROCERY_GROUPS)
  }

  const rowStyle = (last) => ({
    display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0',
    borderBottom: last ? 'none' : '1px solid var(--hp-ink-100)',
  })

  return (
    <div>
      <SHead title="Grocery Categories"
        desc="Rename, reorder, or hide the sections that appear on your grocery list. Add custom categories for items that don't fit anywhere else." />

      <div style={{
        background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-100)',
        borderRadius: 'var(--r-xl)', padding: '4px 24px', marginBottom: 14,
      }}>
        {cats.map((cat, i) => {
          const isEditing = editKey === cat.key
          const isLast    = i === cats.length - 1
          return (
            <div key={cat.key} style={rowStyle(isLast)}>

              {/* Color dot */}
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                background: cat.hidden ? 'var(--hp-ink-200)' : cat.color,
                flexShrink: 0, transition: 'background 0.15s',
              }} />

              {/* Emoji + label — editable inline */}
              {isEditing ? (
                <div style={{ display: 'flex', gap: 6, flex: 1, alignItems: 'center' }}>
                  <input
                    value={draft.emoji}
                    onChange={e => setDraft(d => ({ ...d, emoji: e.target.value }))}
                    style={{
                      width: 38, textAlign: 'center', fontSize: 18,
                      border: '1px solid var(--hp-ink-200)', borderRadius: 'var(--r-sm)',
                      padding: '4px 2px', background: 'var(--hp-bg-app)', outline: 'none',
                    }}
                  />
                  <input
                    autoFocus
                    value={draft.label}
                    onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.key); if (e.key === 'Escape') cancelEdit() }}
                    style={{
                      flex: 1, fontFamily: 'var(--hp-font-body)', fontWeight: 600, fontSize: 14,
                      border: '1px solid var(--hp-ink-200)', borderRadius: 'var(--r-sm)',
                      padding: '5px 10px', outline: 'none', color: 'var(--hp-ink-900)',
                      background: 'var(--hp-paper)',
                    }}
                  />
                </div>
              ) : (
                <span style={{
                  flex: 1, fontFamily: 'var(--hp-font-body)', fontWeight: 500, fontSize: 14,
                  color: cat.hidden ? 'var(--hp-ink-300)' : 'var(--hp-ink-900)',
                  textDecoration: cat.hidden ? 'line-through' : 'none',
                }}>
                  {cat.emoji} {cat.label}
                  {!cat.builtIn && (
                    <span style={{ marginLeft: 8, fontFamily: 'var(--hp-font-body)', fontSize: 10,
                      fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: 'var(--hp-ink-300)' }}>custom</span>
                  )}
                </span>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                {isEditing ? (
                  <>
                    <button onClick={() => saveEdit(cat.key)}
                      style={{ height: 28, padding: '0 12px', borderRadius: 'var(--r-sm)',
                        border: 'none', background: 'var(--hp-ink-900)', color: 'var(--hp-bg-app)',
                        fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      Save
                    </button>
                    <button onClick={cancelEdit}
                      style={{ height: 28, padding: '0 10px', borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--hp-ink-200)', background: 'transparent',
                        fontFamily: 'var(--hp-font-body)', fontSize: 11, color: 'var(--hp-ink-500)', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {/* Up / Down */}
                    <button onClick={() => moveUp(i)} disabled={i === 0} title="Move up"
                      style={{ width: 26, height: 26, border: '1px solid var(--hp-ink-150, var(--hp-ink-100))',
                        borderRadius: 'var(--r-sm)', background: 'var(--hp-ink-50)',
                        cursor: i === 0 ? 'default' : 'pointer', fontSize: 11, color: i === 0 ? 'var(--hp-ink-200)' : 'var(--hp-ink-500)',
                        display: 'grid', placeItems: 'center' }}>↑</button>
                    <button onClick={() => moveDown(i)} disabled={isLast} title="Move down"
                      style={{ width: 26, height: 26, border: '1px solid var(--hp-ink-150, var(--hp-ink-100))',
                        borderRadius: 'var(--r-sm)', background: 'var(--hp-ink-50)',
                        cursor: isLast ? 'default' : 'pointer', fontSize: 11, color: isLast ? 'var(--hp-ink-200)' : 'var(--hp-ink-500)',
                        display: 'grid', placeItems: 'center' }}>↓</button>

                    {/* Rename */}
                    <button onClick={() => startEdit(cat)}
                      style={{ height: 28, padding: '0 10px', borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--hp-ink-200)', background: 'var(--hp-ink-50)',
                        fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 600,
                        color: 'var(--hp-ink-600)', cursor: 'pointer' }}>
                      Rename
                    </button>

                    {/* Hide / Show (built-in only, skip "other") */}
                    {cat.builtIn && cat.key !== 'other' && (
                      <button onClick={() => toggleHide(cat.key)}
                        style={{ height: 28, padding: '0 10px', borderRadius: 'var(--r-sm)',
                          border: '1px solid var(--hp-ink-200)', background: 'var(--hp-ink-50)',
                          fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 600,
                          color: cat.hidden ? 'var(--hp-green-700, #15803D)' : 'var(--hp-ink-500)', cursor: 'pointer' }}>
                        {cat.hidden ? 'Show' : 'Hide'}
                      </button>
                    )}

                    {/* Delete (custom only) */}
                    {!cat.builtIn && (
                      <button onClick={() => deleteCategory(cat.key)} title="Delete category"
                        style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)',
                          border: '1px solid var(--hp-ink-200)', background: 'var(--hp-ink-50)',
                          color: 'var(--hp-ink-400)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <IconTrash size={13} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add custom category */}
      {adding ? (
        <div style={{
          background: 'var(--hp-paper)', border: '1px solid var(--hp-ink-200)',
          borderRadius: 'var(--r-xl)', padding: '18px 24px', marginBottom: 14,
        }}>
          <div style={{ fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--hp-ink-400)',
            marginBottom: 12 }}>New category</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            <input value={newDraft.emoji}
              onChange={e => setNewDraft(d => ({ ...d, emoji: e.target.value }))}
              style={{ width: 44, textAlign: 'center', fontSize: 20,
                border: '1px solid var(--hp-ink-200)', borderRadius: 'var(--r-sm)',
                padding: '6px 4px', background: 'var(--hp-bg-app)', outline: 'none' }}
            />
            <input autoFocus value={newDraft.label}
              onChange={e => setNewDraft(d => ({ ...d, label: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') setAdding(false) }}
              placeholder="Category name…"
              style={{ flex: 1, fontFamily: 'var(--hp-font-body)', fontWeight: 600, fontSize: 14,
                border: '1px solid var(--hp-ink-200)', borderRadius: 'var(--r-sm)',
                padding: '7px 12px', outline: 'none', color: 'var(--hp-ink-900)',
                background: 'var(--hp-paper)' }}
            />
          </div>
          {/* Color swatches */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--hp-font-body)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--hp-ink-400)',
              marginBottom: 8 }}>Color</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORY_COLORS.map(c => (
                <button key={c} onClick={() => setNewDraft(d => ({ ...d, color: c }))}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: c,
                    border: 'none', cursor: 'pointer',
                    outline: newDraft.color === c ? '3px solid var(--hp-ink-900)' : '2px solid transparent',
                    outlineOffset: 2 }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addCategory} disabled={!newDraft.label.trim()}
              style={{ height: 34, padding: '0 18px', borderRadius: 'var(--r-sm)',
                border: 'none', background: 'var(--hp-ink-900)', color: 'var(--hp-bg-app)',
                fontFamily: 'var(--hp-font-body)', fontWeight: 600, fontSize: 12,
                cursor: newDraft.label.trim() ? 'pointer' : 'default', opacity: newDraft.label.trim() ? 1 : 0.4 }}>
              Add category
            </button>
            <button onClick={() => setAdding(false)}
              style={{ height: 34, padding: '0 14px', borderRadius: 'var(--r-sm)',
                border: '1px solid var(--hp-ink-200)', background: 'transparent',
                fontFamily: 'var(--hp-font-body)', fontSize: 12, color: 'var(--hp-ink-500)', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setAdding(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px',
              borderRadius: 'var(--r-md)', border: '1.5px dashed var(--hp-ink-200)',
              background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--hp-font-body)', fontWeight: 600, fontSize: 12, color: 'var(--hp-ink-500)' }}>
            <IconPlus size={14} /> Add custom category
          </button>
          <button onClick={resetToDefaults}
            style={{ height: 38, padding: '0 14px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--hp-ink-200)', background: 'transparent',
              fontFamily: 'var(--hp-font-body)', fontSize: 12, color: 'var(--hp-ink-400)', cursor: 'pointer' }}>
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Settings nav sections ────────────────────────────────────────────────────
const SETTING_SECTIONS = [
  { id: 'household',   label: 'Household'            },
  { id: 'tags',        label: 'Tags & Filters'       },
  { id: 'stores',      label: 'Stores'               },
  { id: 'categories',  label: 'Grocery Categories'   },
  { id: 'ai',          label: 'AI & Recommendations' },
  { id: 'appearance',  label: 'Appearance'           },
  { id: 'account',     label: 'Account'              },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { isDark, toggle } = useDarkMode()
  const user = useUser()

  const [active,  setActive]  = useState('household')
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (!user) return
    getHouseholdMembers(user.id).then(({ data }) => setMembers(data ?? []))
  }, [user])

  return (
    <div className="page settings-page">

      {/* ── Hero ── */}
      <div className="page-hero" style={{ paddingBottom: 0 }}>
        <div className="page-hero-top">
          <span className="t-eyebrow" style={{ color: 'var(--ink-400)' }}>HomePlate</span>
        </div>
        <h1 className="page-hero-title">Settings.</h1>
      </div>

      {/* ── Left nav + content ── */}
      <div className="settings-layout">

        {/* Section nav */}
        <nav className="settings-sidenav">
          {SETTING_SECTIONS.map(({ id, label }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`settings-sidenav-btn ${active === id ? 'settings-sidenav-btn--on' : ''}`}>
              {label}
            </button>
          ))}
        </nav>

        {/* Content pane */}
        <div className="settings-content">
          {active === 'household'  && <HouseholdSection user={user} members={members} setMembers={setMembers} />}
          {active === 'tags'       && <TagsSection />}
          {active === 'stores'     && <StoresSection user={user} />}
          {active === 'categories' && <GroceryCategoriesSection />}
          {active === 'ai'         && <AISection />}
          {active === 'appearance' && <AppearanceSection isDark={isDark} toggle={toggle} />}
          {active === 'account'    && <AccountSection user={user} />}
        </div>

      </div>
    </div>
  )
}
