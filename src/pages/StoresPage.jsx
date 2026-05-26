import { useState, useEffect, useRef } from 'react'
import { useUser } from '../hooks/useAuth.jsx'
import { getStores, saveStore, deleteStore } from '../lib/supabase'
import { Camera, ChevronDown, ChevronUp, Trash2, Plus, Loader2, ArrowUp, ArrowDown, Check } from 'lucide-react'
import './Stores.css'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Grocery group definitions (mirrors GroceryPage) ─────────────────────────
// Exported so GroceryPage can import this list for display ordering.
export const STORE_GROUPS = [
  { key: 'produce',   label: 'Produce',            emoji: '🥦' },
  { key: 'meat',      label: 'Meat & Seafood',     emoji: '🥩' },
  { key: 'dairy',     label: 'Dairy & Eggs',       emoji: '🥛' },
  { key: 'bakery',    label: 'Bread & Bakery',     emoji: '🍞' },
  { key: 'frozen',    label: 'Frozen',              emoji: '🧊' },
  { key: 'canned',    label: 'Canned & Jarred',    emoji: '🥫' },
  { key: 'pantry',    label: 'Pantry & Dry Goods', emoji: '🌾' },
  { key: 'beverages', label: 'Beverages',           emoji: '🥤' },
  { key: 'other',     label: 'Other',               emoji: '🛒' },
]

const DEFAULT_STORE_NAMES = ['Aldi', 'Publix', 'Target']

// ─── AisleRow ─────────────────────────────────────────────────────────────────
// Extracted component so it can use hooks (useRef for file input).
function AisleRow({ aisle, group, idx, total, onLabelChange, onMove, onPhotoCapture, photoLoading }) {
  const fileRef = useRef(null)

  return (
    <div className="aisle-row">
      <span className="aisle-row-group">
        <span className="aisle-row-emoji">{group.emoji}</span>
        <span className="aisle-row-name">{group.label}</span>
      </span>

      <input
        className="input input-sm aisle-label-input"
        value={aisle.aisle_label}
        onChange={e => onLabelChange(e.target.value)}
        placeholder="e.g. Aisle 1"
      />

      <div className="aisle-row-actions">
        {/* Hidden file input for camera / photo library */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) onPhotoCapture(file)
            e.target.value = ''
          }}
        />
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={photoLoading}
          title="Update aisle label from photo"
        >
          {photoLoading
            ? <Loader2 size={13} strokeWidth={2} className="spin" />
            : <Camera size={13} strokeWidth={2} />
          }
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onMove(-1)}
          disabled={idx === 0}
          title="Move up"
        >
          <ArrowUp size={13} strokeWidth={2} />
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onMove(1)}
          disabled={idx === total - 1}
          title="Move down"
        >
          <ArrowDown size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

// ─── StoresPage ───────────────────────────────────────────────────────────────
export default function StoresPage() {
  const user = useUser()

  const [stores, setStores]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [seeding, setSeeding]             = useState(false)
  const [seedProgress, setSeedProgress]   = useState(0)   // 0–3 as each store generates
  const [expandedId, setExpandedId]       = useState(null)

  // Per-store working copies of aisle arrays (before/during auto-save)
  const [editingAisles, setEditingAisles] = useState({})   // { [storeId]: aisle[] }
  const [savingIds, setSavingIds]         = useState(new Set())
  const [savedIds, setSavedIds]           = useState(new Set())

  // Single key tracking which aisle row is waiting on an AI photo parse
  const [photoLoadingKey, setPhotoLoadingKey] = useState(null)  // 'storeId::groupKey'

  // Add-store form state
  const [addingStore, setAddingStore]     = useState(false)
  const [newStoreName, setNewStoreName]   = useState('')
  const [generatingNew, setGeneratingNew] = useState(false)

  const saveTimers  = useRef({})   // debounce timers per storeId
  const savedTimers = useRef({})   // "Saved" badge auto-clear timers

  // ── Load on mount ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    getStores(user.id).then(({ data }) => {
      if (data?.length) {
        setStores(data)
        setLoading(false)
      } else {
        seedDefaultStores()
      }
    })
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── AI layout generation ────────────────────────────────────────────────────
  async function generateLayout(storeName) {
    const resp = await fetch('/.netlify/functions/generate-store-layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeName }),
    })
    if (!resp.ok) throw new Error('Layout generation failed')
    const data = await resp.json()
    return data.aisles || []
  }

  async function seedDefaultStores() {
    setSeeding(true)
    setSeedProgress(0)
    try {
      // Generate all three layouts in parallel, updating progress as each resolves
      const results = await Promise.all(
        DEFAULT_STORE_NAMES.map(name =>
          generateLayout(name)
            .then(aisles => { setSeedProgress(p => p + 1); return { name, aisles } })
            .catch(() => {
              setSeedProgress(p => p + 1)
              return { name, aisles: STORE_GROUPS.map((g, i) => ({ group_key: g.key, aisle_label: g.label, order: i })) }
            })
        )
      )

      const saved = []
      for (const store of results) {
        const { data } = await saveStore(user.id, store)
        if (data) saved.push(data)
      }

      setStores(saved)
      if (saved.length) setExpandedId(saved[0].id)
    } catch (err) {
      console.error('Store seed failed:', err)
    }
    setSeeding(false)
    setLoading(false)
  }

  // ── Aisle helpers ───────────────────────────────────────────────────────────
  // Returns the working copy if it exists, otherwise the saved copy
  function getAisles(storeId) {
    return editingAisles[storeId] ?? stores.find(s => s.id === storeId)?.aisles ?? []
  }

  function scheduleAutoSave(storeId) {
    clearTimeout(saveTimers.current[storeId])
    saveTimers.current[storeId] = setTimeout(() => doSave(storeId), 700)
  }

  async function doSave(storeId) {
    // Only save if we have a local working copy (i.e., something actually changed)
    const aisles = editingAisles[storeId]
    if (!aisles) return
    const store = stores.find(s => s.id === storeId)
    if (!store) return

    setSavingIds(s => new Set([...s, storeId]))
    const { data } = await saveStore(user.id, { ...store, aisles })
    if (data) setStores(prev => prev.map(s => s.id === storeId ? data : s))
    setSavingIds(s => { const n = new Set(s); n.delete(storeId); return n })

    // Show brief "Saved ✓" indicator
    setSavedIds(s => new Set([...s, storeId]))
    clearTimeout(savedTimers.current[storeId])
    savedTimers.current[storeId] = setTimeout(() => {
      setSavedIds(s => { const n = new Set(s); n.delete(storeId); return n })
    }, 1800)
  }

  function updateAisleLabel(storeId, groupKey, label) {
    setEditingAisles(prev => {
      const current = prev[storeId] ?? stores.find(s => s.id === storeId)?.aisles ?? []
      return { ...prev, [storeId]: current.map(a => a.group_key === groupKey ? { ...a, aisle_label: label } : a) }
    })
    scheduleAutoSave(storeId)
  }

  function moveAisle(storeId, groupKey, dir) {
    setEditingAisles(prev => {
      const raw    = prev[storeId] ?? stores.find(s => s.id === storeId)?.aisles ?? []
      const sorted = [...raw].sort((a, b) => a.order - b.order)
      const idx    = sorted.findIndex(a => a.group_key === groupKey)
      if (idx === -1) return prev
      const to = idx + dir
      if (to < 0 || to >= sorted.length) return prev
      ;[sorted[idx], sorted[to]] = [sorted[to], sorted[idx]]
      return { ...prev, [storeId]: sorted.map((a, i) => ({ ...a, order: i })) }
    })
    scheduleAutoSave(storeId)
  }

  // ── Aisle photo parsing ─────────────────────────────────────────────────────
  async function handleAislePhoto(storeId, groupKey, file) {
    const key = `${storeId}::${groupKey}`
    setPhotoLoadingKey(key)
    try {
      const data  = await fileToBase64(file)
      const store = stores.find(s => s.id === storeId)
      const resp  = await fetch('/.netlify/functions/parse-aisle-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image:     { mediaType: file.type || 'image/jpeg', data },
          storeName: store?.name,
        }),
      })
      const result = await resp.json()
      if (result.aisle_label) {
        updateAisleLabel(storeId, groupKey, result.aisle_label)
      }
    } catch { /* silent fail — user can edit manually */ }
    setPhotoLoadingKey(null)
  }

  // ── Add / delete stores ─────────────────────────────────────────────────────
  async function handleAddStore() {
    const name = newStoreName.trim()
    if (!name) return
    setGeneratingNew(true)
    try {
      const aisles   = await generateLayout(name)
      const { data } = await saveStore(user.id, { name, aisles })
      if (data) {
        setStores(prev => [...prev, data])
        setExpandedId(data.id)
      }
    } catch { /* fallback: save with default layout */
      const aisles   = STORE_GROUPS.map((g, i) => ({ group_key: g.key, aisle_label: g.label, order: i }))
      const { data } = await saveStore(user.id, { name, aisles })
      if (data) { setStores(prev => [...prev, data]); setExpandedId(data.id) }
    }
    setGeneratingNew(false)
    setAddingStore(false)
    setNewStoreName('')
  }

  async function handleDeleteStore(id) {
    await deleteStore(id)
    setStores(prev => prev.filter(s => s.id !== id))
    if (expandedId === id) setExpandedId(null)
    setEditingAisles(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  // ── Loading / seeding state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page stores-page">
        <div className="page-header">
          <h1 className="page-title">Stores</h1>
        </div>
        {seeding ? (
          <div className="stores-seeding">
            <span className="stores-seeding-icon">🛒</span>
            <p className="stores-seeding-title">Setting up your stores…</p>
            <p className="stores-seeding-sub">Generating aisle layouts using AI</p>
            <div className="stores-seeding-stores">
              {DEFAULT_STORE_NAMES.map((name, i) => (
                <span
                  key={name}
                  className={`stores-seeding-store ${
                    i < seedProgress ? 'done' : i === seedProgress ? 'active' : ''
                  }`}
                >
                  {i < seedProgress && <Check size={11} strokeWidth={2.5} />}
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="page-placeholder"><p>Loading…</p></div>
        )}
      </div>
    )
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="page stores-page">
      <div className="page-header">
        <h1 className="page-title">Stores</h1>
      </div>

      <p className="stores-intro">
        Customize aisle layouts so your grocery list sorts in store order.
        Tap the camera icon on any row to update its label from an aisle sign photo.
      </p>

      <div className="stores-list">
        {stores.map(store => {
          const aisles       = getAisles(store.id)
          const sortedAisles = [...aisles].sort((a, b) => a.order - b.order)
          const isExpanded   = expandedId === store.id
          const isSaving     = savingIds.has(store.id)
          const isSaved      = savedIds.has(store.id)

          return (
            <div key={store.id} className={`store-card ${isExpanded ? 'store-card--expanded' : ''}`}>

              {/* Card header — clickable to expand/collapse */}
              <button
                className="store-card-header"
                onClick={() => setExpandedId(isExpanded ? null : store.id)}
              >
                <span className="store-card-name">{store.name}</span>
                <span className="store-card-status">
                  {isSaving ? (
                    <span className="store-status-saving">
                      <Loader2 size={12} strokeWidth={2} className="spin" /> Saving…
                    </span>
                  ) : isSaved ? (
                    <span className="store-status-saved">
                      <Check size={12} strokeWidth={2.5} /> Saved
                    </span>
                  ) : (
                    <span className="store-aisle-count">{sortedAisles.length} aisles</span>
                  )}
                </span>
                {isExpanded
                  ? <ChevronUp   size={16} strokeWidth={2} className="store-chevron" />
                  : <ChevronDown size={16} strokeWidth={2} className="store-chevron" />
                }
              </button>

              {/* Aisle editor — only visible when expanded */}
              {isExpanded && (
                <div className="store-card-body">
                  <div className="aisle-table-header">
                    <span>Category</span>
                    <span>Aisle / Location</span>
                    <span>Update</span>
                  </div>

                  {sortedAisles.map((aisle, idx) => {
                    const group = STORE_GROUPS.find(g => g.key === aisle.group_key)
                      || { key: aisle.group_key, label: aisle.group_key, emoji: '🛒' }
                    const photoKey = `${store.id}::${aisle.group_key}`

                    return (
                      <AisleRow
                        key={aisle.group_key}
                        aisle={aisle}
                        group={group}
                        idx={idx}
                        total={sortedAisles.length}
                        onLabelChange={label => updateAisleLabel(store.id, aisle.group_key, label)}
                        onMove={dir => moveAisle(store.id, aisle.group_key, dir)}
                        onPhotoCapture={file => handleAislePhoto(store.id, aisle.group_key, file)}
                        photoLoading={photoLoadingKey === photoKey}
                      />
                    )
                  })}

                  <div className="store-card-footer">
                    <button
                      className="btn btn-ghost btn-sm store-delete-btn"
                      onClick={() => handleDeleteStore(store.id)}
                    >
                      <Trash2 size={13} strokeWidth={2} /> Delete store
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Add store form / button */}
        {addingStore ? (
          <div className="store-add-form">
            <input
              className="input"
              placeholder="Store name (e.g. Whole Foods, Costco…)"
              value={newStoreName}
              onChange={e => setNewStoreName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddStore()}
              autoFocus
            />
            <div className="store-add-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setAddingStore(false); setNewStoreName('') }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddStore}
                disabled={!newStoreName.trim() || generatingNew}
              >
                {generatingNew
                  ? <><Loader2 size={14} strokeWidth={2} className="spin" /> Generating…</>
                  : <><Plus size={14} strokeWidth={2} /> Generate layout</>
                }
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-ghost stores-add-btn" onClick={() => setAddingStore(true)}>
            <Plus size={15} strokeWidth={2} /> Add store
          </button>
        )}
      </div>
    </div>
  )
}
