import { useState, useEffect } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'
import { useUser } from '../hooks/useAuth.jsx'
import { signOut, getHouseholdMembers, saveHouseholdMember, deleteHouseholdMember } from '../lib/supabase'
import { Plus, Trash2, Check, X } from 'lucide-react'
import './Settings.css'

const MEMBER_COLORS = [
  '#6B8FF5', '#4CAF7D', '#F5A84A', '#D47AA0',
  '#4BBFC4', '#C97B4B', '#A47DD4', '#E8732A',
]

export default function SettingsPage() {
  const { isDark, toggle } = useDarkMode()
  const user = useUser()

  const [members, setMembers]       = useState([])
  const [adding, setAdding]         = useState(false)
  const [newName, setNewName]       = useState('')
  const [newColor, setNewColor]     = useState(MEMBER_COLORS[0])
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    if (!user) return
    getHouseholdMembers(user.id).then(({ data }) => setMembers(data))
  }, [user])

  async function handleAddMember() {
    if (!newName.trim()) return
    setSaving(true)
    const { data } = await saveHouseholdMember(user.id, {
      name: newName.trim(),
      color: newColor,
      sort_order: members.length,
    })
    if (data) setMembers(m => [...m, data])
    setNewName('')
    setNewColor(MEMBER_COLORS[members.length % MEMBER_COLORS.length])
    setAdding(false)
    setSaving(false)
  }

  async function handleDelete(id) {
    await deleteHouseholdMember(id)
    setMembers(m => m.filter(x => x.id !== id))
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="settings-stack">

        {/* Account */}
        <div className="card">
          <div className="settings-section-label">Account</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-title">{user?.user_metadata?.full_name || 'Signed in'}</div>
              <div className="settings-row-sub">{user?.email}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={signOut}>Sign out</button>
          </div>
        </div>

        {/* Family members */}
        <div className="card">
          <div className="settings-section-label">Family members</div>
          <p className="settings-hint">Add everyone in your household. In the Planner, you can switch any meal slot between "Shared" and "Individual" so each person picks their own recipe.</p>

          {members.length > 0 && (
            <div className="member-list">
              {members.map(m => (
                <div key={m.id} className="member-row">
                  <span className="member-dot" style={{ background: m.color }} />
                  <span className="member-name">{m.name}</span>
                  <button className="btn btn-ghost btn-sm member-delete" onClick={() => handleDelete(m.id)}>
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {adding ? (
            <div className="member-add-form">
              <input
                className="input input-sm"
                placeholder="Name (e.g. Lauren)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddMember(); if (e.key === 'Escape') setAdding(false) }}
                autoFocus
                style={{ flex: 1 }}
              />
              <div className="member-color-row">
                {MEMBER_COLORS.map(c => (
                  <button
                    key={c}
                    className={`member-color-swatch ${newColor === c ? 'member-color-swatch--active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setNewColor(c)}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setAdding(false)}>
                  <X size={14} strokeWidth={2} /> Cancel
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleAddMember} disabled={saving || !newName.trim()}>
                  <Check size={14} strokeWidth={2} /> Add
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: members.length ? 10 : 0, color: 'var(--accent)' }}
              onClick={() => { setAdding(true); setNewColor(MEMBER_COLORS[members.length % MEMBER_COLORS.length]) }}>
              <Plus size={14} strokeWidth={2} /> Add member
            </button>
          )}
        </div>

        {/* Appearance */}
        <div className="card">
          <div className="settings-section-label">Appearance</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-title">Theme</div>
              <div className="settings-row-sub">{isDark ? 'Dark mode' : 'Light mode'}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={toggle}>
              Switch to {isDark ? 'light' : 'dark'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
