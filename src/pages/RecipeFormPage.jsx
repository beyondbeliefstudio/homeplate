import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getRecipeById, saveRecipe, uploadRecipeImage, deleteRecipeImage, getHouseholdMembers } from '../lib/supabase'
import { CATEGORIES } from '../lib/categories'
import { IconChevronL, IconPlus, IconClose, IconCamera, IconSparkle, IconCheck } from '../components/icons'
import './Recipes.css'

const LOADING_MESSAGES = [
  'Reading your recipe…',
  'Identifying ingredients…',
  'Structuring the steps…',
  'Almost done…',
]

const LOADING_MESSAGES_URL = [
  'Fetching the recipe page…',
  'Reading ingredients…',
  'Structuring the steps…',
  'Almost done…',
]

function looksLikeURL(str) {
  const s = str.trim()
  return s.startsWith('http://') || s.startsWith('https://')
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function callParseRecipe(body) {
  const resp = await fetch('/.netlify/functions/parse-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await resp.json()
  if (!resp.ok || data.error) throw new Error(data.error || 'Unexpected error')
  return data
}

const BLANK_INGREDIENT  = { name: '', quantity: '', unit: '' }
const BLANK_INSTRUCTION = ''
const FORM_CATEGORIES   = ['breakfast', 'lunch', 'dinner', 'side', 'snack', 'dessert', 'beverage']

// ─── AI Edit Assistant (edit mode only) ──────────────────────────────────────
const EDIT_MESSAGES = [
  'Reading your changes…',
  'Updating the recipe…',
  'Almost done…',
]

function AIEditAssistant({ form, onApply }) {
  const [open,    setOpen]    = useState(false)
  const [text,    setText]    = useState('')
  const [working, setWorking] = useState(false)
  const [msgIdx,  setMsgIdx]  = useState(0)
  const [error,   setError]   = useState(null)
  const [done,    setDone]    = useState(false)
  const intervalRef           = useRef(null)

  async function handleApply() {
    if (!text.trim()) return
    setError(null)
    setWorking(true)
    setMsgIdx(0)
    intervalRef.current = setInterval(() => setMsgIdx(i => (i + 1) % EDIT_MESSAGES.length), 2200)
    try {
      const resp = await fetch('/.netlify/functions/edit-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: form, changes: text.trim() }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Edit failed')
      onApply(data)
      setDone(true)
      setText('')
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      clearInterval(intervalRef.current)
      setWorking(false)
    }
  }

  if (!open) {
    return (
      <button type="button" className="ai-edit-collapsed" onClick={() => setOpen(true)}>
        <IconSparkle size={14} />
        <span>Edit with AI</span>
        <span className="ai-edit-collapsed-hint">Describe changes and let AI update the recipe</span>
      </button>
    )
  }

  return (
    <div className="ai-builder">
      <div className="ai-builder-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconSparkle size={15} className="ai-builder-sparkle" />
          <span className="ai-builder-title">Edit with AI</span>
          <span className="ai-builder-hint">Describe what you want to change</span>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}
          style={{ padding: '0 6px', color: 'var(--hp-ink-400)' }}>
          <IconClose size={14} />
        </button>
      </div>

      {done ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
          <span style={{ fontFamily: 'var(--hp-font-body)', fontSize: 13,
            color: 'var(--hp-green-700)', fontWeight: 500 }}>
            ✓ Recipe updated — review the changes below, then save.
          </span>
          <button type="button" className="btn btn-ghost btn-sm"
            onClick={() => { setDone(false); setText('') }}>
            Make another change
          </button>
        </div>
      ) : (
        <>
          <textarea
            className="input ai-builder-textarea"
            placeholder={'Describe what you want to change — e.g. "swap broccoli for spinach", "add a step about resting the meat", "reduce cook time by 10 minutes", "double the garlic"…'}
            value={text}
            rows={3}
            onChange={e => setText(e.target.value)}
            disabled={working}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleApply() }}
          />
          <div className="ai-builder-footer">
            <div />
            <div className="ai-builder-actions">
              {error && <span className="ai-builder-error">{error}</span>}
              <button type="button" className="btn btn-primary btn-sm"
                onClick={handleApply} disabled={working || !text.trim()}>
                {working ? EDIT_MESSAGES[msgIdx] : 'Apply changes →'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── AI Recipe Builder ────────────────────────────────────────────────────────
function AIRecipeBuilder({ onGenerate }) {
  const [text, setText]       = useState('')
  const [image, setImage]     = useState(null)
  const [parsing, setParsing] = useState(false)
  const [msgIdx, setMsgIdx]   = useState(0)
  const [error, setError]     = useState(null)
  const [done, setDone]       = useState(false)
  const fileRef               = useRef(null)
  const intervalRef           = useRef(null)

  function handleImagePick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview   = URL.createObjectURL(file)
    const mediaType = file.type || 'image/jpeg'
    setImage({ file, preview, mediaType })
    e.target.value = ''
  }

  function clearImage() {
    if (image?.preview) URL.revokeObjectURL(image.preview)
    setImage(null)
  }

  const isURL    = looksLikeURL(text)
  const messages = isURL ? LOADING_MESSAGES_URL : LOADING_MESSAGES

  async function handleGenerate() {
    if (!text.trim() && !image) return
    setError(null)
    setParsing(true)
    setMsgIdx(0)
    intervalRef.current = setInterval(() => {
      setMsgIdx(i => (i + 1) % messages.length)
    }, 2800)
    try {
      const body = { text: text.trim() || undefined }
      if (image) body.image = { mediaType: image.mediaType, data: await fileToBase64(image.file) }
      const data = await callParseRecipe(body)
      onGenerate(data)
      setDone(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      clearInterval(intervalRef.current)
      setParsing(false)
    }
  }

  if (done) {
    return (
      <div className="ai-builder ai-builder--done">
        <IconSparkle size={16} className="ai-builder-sparkle" />
        <span>Recipe generated — review and edit the fields below, then save.</span>
        <button className="btn btn-ghost btn-sm" onClick={() => { setDone(false); setText(''); clearImage() }}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="ai-builder">
      <div className="ai-builder-header">
        <IconSparkle size={15} className="ai-builder-sparkle" />
        <span className="ai-builder-title">Generate with AI</span>
        <span className="ai-builder-hint">Paste a URL, describe a dish, or photograph your recipe</span>
      </div>
      <textarea
        className="input ai-builder-textarea"
        placeholder={'Paste a recipe URL, describe it, or type it out — e.g. "chicken stir fry with ginger and sesame, serves 4"…'}
        value={text}
        rows={4}
        onChange={e => setText(e.target.value)}
        disabled={parsing}
      />
      {isURL && !parsing && (
        <p className="ai-builder-url-hint">🔗 Recipe URL detected — will fetch the page automatically</p>
      )}
      <div className="ai-builder-footer">
        <div className="ai-builder-photo-row">
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }} onChange={handleImagePick} />
          {image ? (
            <div className="ai-builder-preview">
              <img src={image.preview} alt="Recipe" />
              <button className="ai-builder-preview-remove" onClick={clearImage} title="Remove photo">
                <IconClose size={12} />
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm ai-builder-photo-btn"
              onClick={() => fileRef.current?.click()} disabled={parsing}>
              <IconCamera size={14} />
              Add photo
            </button>
          )}
        </div>
        <div className="ai-builder-actions">
          {error && <span className="ai-builder-error">{error}</span>}
          <button type="button" className="btn btn-primary btn-sm"
            onClick={handleGenerate} disabled={parsing || (!text.trim() && !image)}>
            {parsing ? messages[msgIdx] : 'Generate recipe →'}
          </button>
        </div>
      </div>
      <div className="ai-builder-divider">
        <span>or fill in manually below</span>
      </div>
    </div>
  )
}

// ─── Photo Drop Zone ──────────────────────────────────────────────────────────
function GenerateConfirmModal({ form, onConfirm, onCancel }) {
  const [extraContext, setExtraContext] = useState('')

  const hasName    = form.name.trim().length > 0
  const hasIngreds = form.ingredients.some(i => i.name.trim())
  const hasSteps   = form.instructions.some(s => s.trim())

  const checks = [
    { label: 'Recipe name',   ok: hasName },
    { label: 'Ingredients',   ok: hasIngreds },
    { label: 'Instructions',  ok: hasSteps },
  ]
  const allGood = checks.every(c => c.ok)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onCancel}>
      <div style={{
        background: 'var(--hp-paper)', borderRadius: 'var(--r-xl)',
        padding: '28px 28px 24px', maxWidth: 420, width: '100%',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: 'var(--hp-font-display)', fontWeight: 600, fontSize: 18,
          letterSpacing: '-0.02em', color: 'var(--hp-ink-900)', margin: '0 0 6px' }}>
          Ready to generate?
        </h3>
        <p style={{ fontFamily: 'var(--hp-font-body)', fontSize: 13,
          color: 'var(--hp-ink-500)', margin: '0 0 20px', lineHeight: 1.5 }}>
          The AI uses your recipe details to create the illustration. More complete recipes produce better images.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {checks.map(({ label, ok }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: ok ? 'var(--hp-green-100)' : 'var(--hp-ink-100)',
                display: 'grid', placeItems: 'center',
              }}>
                <span style={{ fontSize: 11, color: ok ? 'var(--hp-green-700)' : 'var(--hp-ink-400)' }}>
                  {ok ? '✓' : '–'}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--hp-font-body)', fontSize: 13,
                color: ok ? 'var(--hp-ink-800)' : 'var(--hp-ink-400)', fontWeight: ok ? 500 : 400 }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Extra context field */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: 'var(--hp-font-body)', fontSize: 12, fontWeight: 600,
            color: 'var(--hp-ink-600)', display: 'block', marginBottom: 6 }}>
            Additional instructions <span style={{ fontWeight: 400, color: 'var(--hp-ink-400)' }}>— optional</span>
          </label>
          <textarea
            value={extraContext}
            onChange={e => setExtraContext(e.target.value)}
            rows={3}
            placeholder={'e.g. "skirt steak should have visible grill marks, sliced thin, medium-rare" or "served in a cast iron pan"…'}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'vertical',
              fontFamily: 'var(--hp-font-body)', fontSize: 13, lineHeight: 1.5,
              border: '1px solid var(--hp-ink-200)', borderRadius: 'var(--r-md)',
              padding: '9px 12px', outline: 'none', color: 'var(--hp-ink-900)',
              background: 'var(--hp-bg-app)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={onCancel}
            style={{
              flex: 1, height: 38, borderRadius: 'var(--r-md)',
              border: '1px solid var(--hp-ink-200)', background: 'transparent',
              fontFamily: 'var(--hp-font-body)', fontSize: 13, fontWeight: 600,
              color: 'var(--hp-ink-600)', cursor: 'pointer',
            }}>Cancel</button>
          <button type="button" onClick={() => onConfirm(extraContext.trim())}
            style={{
              flex: 2, height: 38, borderRadius: 'var(--r-md)',
              border: 'none', background: allGood ? 'var(--hp-green)' : 'var(--hp-ink-900)',
              fontFamily: 'var(--hp-font-body)', fontSize: 13, fontWeight: 600,
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <IconSparkle size={13} />
            {allGood ? 'Generate image' : 'Generate anyway'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PhotoDropZone({ preview, onPick, onClear, onGenerate, generating, error, form }) {
  const fileRef = useRef(null)
  const [dragging,      setDragging]      = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)

  function handlePickFile(e) {
    const file = e.target.files?.[0]
    if (file) onPick(file)
    e.target.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) onPick(file)
  }

  function handleGenerateClick(e) {
    e.stopPropagation()
    setShowConfirm(true)
  }

  function handleConfirm(extraContext) {
    setShowConfirm(false)
    onGenerate(extraContext)
  }

  return (
    <>
      {showConfirm && (
        <GenerateConfirmModal
          form={form}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div
        className={`recipe-photo-zone${dragging ? ' recipe-photo-zone--drag' : ''}${preview ? ' recipe-photo-zone--filled' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }} onChange={handlePickFile} />

        {preview ? (
          <>
            <img src={preview} alt="Recipe" className="recipe-photo-img" />
            <button type="button" className="recipe-photo-remove"
              onClick={e => { e.stopPropagation(); onClear() }}>
              <IconClose size={12} />
            </button>
            <button type="button" className="btn btn-primary btn-sm recipe-photo-gen-btn"
              onClick={handleGenerateClick} disabled={generating}>
              <IconSparkle size={13} />
              {generating ? 'Generating…' : '↺ Regenerate with AI'}
            </button>
          </>
        ) : (
          <div className="recipe-photo-empty">
            <IconCamera size={28} className="recipe-photo-icon" />
            <p className="recipe-photo-label">Recipe photo</p>
            <p className="recipe-photo-hint">Drag & drop a JPG or PNG, or choose below</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button type="button" className="btn btn-ghost btn-sm"
                style={{ border: '1px solid var(--hp-ink-200)' }}
                onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>
                <IconCamera size={13} /> Upload photo
              </button>
              <button type="button" className="btn btn-primary btn-sm"
                onClick={handleGenerateClick} disabled={generating}>
                <IconSparkle size={13} />
                {generating ? 'Generating…' : '+ Generate with AI'}
              </button>
            </div>
          </div>
        )}
        {error && <p className="recipe-photo-error">{error}</p>}
      </div>
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function blankForm() {
  return {
    name: '', category: 'dinner',
    rory_approved: false, approved_by: [], rating: null,
    servings: 4, prep_time: 0, cook_time: 0,
    notes: '', image_url: null,
    ingredients: [{ ...BLANK_INGREDIENT }],
    instructions: [BLANK_INSTRUCTION],
    nutrition: { calories: '', protein: '', carbs: '', fat: '', fiber: '' },
  }
}

function formFromData(data) {
  return {
    name:          data.name          || '',
    category:      data.category      || 'dinner',
    rory_approved: data.rory_approved ?? false,
    approved_by:   data.approved_by   ?? [],
    rating:        data.rating        ?? null,
    servings:      data.servings      || 4,
    prep_time:     data.prep_time     || 0,
    cook_time:     data.cook_time     || 0,
    notes:         data.notes         || '',
    image_url:     data.image_url     || null,
    ingredients:   data.ingredients?.length  ? data.ingredients  : [{ ...BLANK_INGREDIENT }],
    instructions:  data.instructions?.length ? data.instructions : [BLANK_INSTRUCTION],
    nutrition: {
      calories: data.nutrition?.calories ?? '',
      protein:  data.nutrition?.protein  ?? '',
      carbs:    data.nutrition?.carbs    ?? '',
      fat:      data.nutrition?.fat      ?? '',
      fiber:    data.nutrition?.fiber    ?? '',
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RecipeFormPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const user      = useUser()
  const isEditing = Boolean(id)

  const [form, setForm]                       = useState(blankForm())
  const [approvalMembers, setApprovalMembers] = useState([])
  const [loading, setLoading]                 = useState(isEditing)
  const [saving, setSaving]                   = useState(false)
  const [error, setError]                     = useState(null)
  const [photoFile, setPhotoFile]             = useState(null)
  const [photoPreview, setPhotoPreview]       = useState(null)
  const [photoGenerating, setPhotoGenerating] = useState(false)
  const [photoError, setPhotoError]           = useState(null)

  useEffect(() => () => {
    if (photoPreview && !photoPreview.startsWith('http')) URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  useEffect(() => {
    if (!user) return
    getHouseholdMembers(user.id).then(({ data }) =>
      setApprovalMembers((data ?? []).filter(m => m.meal_approval))
    )
  }, [user])

  useEffect(() => {
    if (!isEditing) return
    getRecipeById(id).then(({ data }) => {
      if (!data) return
      setForm(formFromData(data))
      if (data.image_url) setPhotoPreview(data.image_url)
      setLoading(false)
    })
  }, [id, isEditing])

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }

  function setIngredient(i, field, value) {
    setForm(f => {
      const arr = [...f.ingredients]
      arr[i] = { ...arr[i], [field]: value }
      return { ...f, ingredients: arr }
    })
  }
  function addIngredient()     { setForm(f => ({ ...f, ingredients: [...f.ingredients, { ...BLANK_INGREDIENT }] })) }
  function removeIngredient(i) { setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) })) }

  function setInstruction(i, value) {
    setForm(f => { const arr = [...f.instructions]; arr[i] = value; return { ...f, instructions: arr } })
  }
  function addInstruction()     { setForm(f => ({ ...f, instructions: [...f.instructions, BLANK_INSTRUCTION] })) }
  function removeInstruction(i) { setForm(f => ({ ...f, instructions: f.instructions.filter((_, idx) => idx !== i) })) }

  function handlePhotoPick(file) {
    if (photoPreview && !photoPreview.startsWith('http')) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handlePhotoClear() {
    if (photoPreview && !photoPreview.startsWith('http')) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
    set('image_url', null)
  }

  async function handlePhotoGenerate(extraContext = '') {
    if (!form.name.trim()) {
      setPhotoError('Add a recipe name first so the AI knows what to illustrate.')
      return
    }
    setPhotoGenerating(true)
    setPhotoError(null)
    try {
      const resp = await fetch('/.netlify/functions/generate-recipe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         form.name,
          category:     form.category,
          ingredients:  form.ingredients.filter(i => i.name.trim()),
          instructions: form.instructions.filter(s => s.trim()),
          extraContext: extraContext || undefined,
        }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Generation failed')

      const filename = `${form.name.replace(/\s+/g, '-').toLowerCase()}.png`
      let blob

      if (data.b64) {
        // gpt-image-1 returns base64
        const binary = atob(data.b64)
        const bytes  = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        blob = new Blob([bytes], { type: 'image/png' })
      } else if (data.url) {
        // fallback: fetch from URL
        const imgResp = await fetch(data.url)
        blob = await imgResp.blob()
      } else {
        throw new Error('No image data returned')
      }

      handlePhotoPick(new File([blob], filename, { type: 'image/png' }))
    } catch (err) {
      setPhotoError(err.message || 'Image generation failed. Try again.')
    } finally {
      setPhotoGenerating(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Recipe name is required.'); return }
    setSaving(true)
    setError(null)

    let image_url    = form.image_url
    let uploadedPath = null

    if (photoFile) {
      const { url, path, error: upErr } = await uploadRecipeImage(user.id, photoFile)
      if (upErr) { setError('Photo upload failed. Please try again.'); setSaving(false); return }
      image_url    = url
      uploadedPath = path
    }

    const payload = {
      ...form,
      id:           isEditing ? id : undefined,
      image_url,
      ingredients:  form.ingredients.filter(i => i.name.trim()),
      instructions: form.instructions.filter(s => s.trim()),
      nutrition: Object.fromEntries(
        Object.entries(form.nutrition).map(([k, v]) => [k, v === '' ? null : Number(v)])
      ),
    }

    const { data, error: saveError } = await saveRecipe(user.id, payload)
    if (saveError) {
      if (uploadedPath) deleteRecipeImage(uploadedPath)
      setError(saveError.message)
      setSaving(false)
      return
    }
    navigate(`/recipes/${data.id}`)
  }

  function handleCancel() { navigate(isEditing ? `/recipes/${id}` : '/recipes') }

  if (loading) return <div className="page"><div className="page-placeholder"><p>Loading…</p></div></div>

  return (
    <div className="page recipe-form-page">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="recipe-form-header">
        <button type="button" className="btn btn-ghost btn-sm recipe-back-btn" onClick={handleCancel}>
          <IconChevronL size={16} /> Back to cookbook
        </button>
        <h1 className="recipe-form-header-title">
          {isEditing ? 'Edit recipe' : 'New recipe'}
        </h1>
        <div className="recipe-form-header-actions">
          {error && <span className="form-error-inline">{error}</span>}
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
          <button type="submit" form="recipe-form" className="btn btn-primary" disabled={saving}>
            <IconCheck size={14} />
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add recipe'}
          </button>
        </div>
      </div>

      {/* ── AI Builder / Edit Assistant ────────────────────────────────── */}
      {isEditing
        ? <AIEditAssistant form={form} onApply={data => setForm(f => ({ ...formFromData(data), image_url: f.image_url }))} />
        : <AIRecipeBuilder onGenerate={data => setForm(formFromData(data))} />
      }

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <form id="recipe-form" className="recipe-form" onSubmit={handleSubmit}>
        <div className="recipe-form-body">

          {/* ── Left column ────────────────────────────────────────────── */}
          <div className="recipe-form-main">

            <div className="form-section">
              <p className="form-section-title">Recipe name <span className="form-required">*</span></p>
              <input className="input recipe-form-name-input" placeholder="e.g. Roasted Garlic Pasta"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            <div className="form-section">
              <p className="form-section-title">Ingredients</p>
              <div className="form-ingredient-list">
                <div className="form-ingredient-header">
                  <span>Amount</span><span>Unit</span><span>Ingredient</span><span />
                </div>
                {form.ingredients.map((ing, i) => (
                  <div key={i} className="form-ingredient-row">
                    <input className="input input-sm" type="text" placeholder="2"
                      value={ing.quantity} onChange={e => setIngredient(i, 'quantity', e.target.value)} />
                    <input className="input input-sm" type="text" placeholder="cups"
                      value={ing.unit} onChange={e => setIngredient(i, 'unit', e.target.value)} />
                    <input className="input input-sm" type="text" placeholder="Ingredient name"
                      value={ing.name} onChange={e => setIngredient(i, 'name', e.target.value)} />
                    <button type="button" className="btn btn-ghost btn-sm form-remove-btn"
                      onClick={() => removeIngredient(i)} disabled={form.ingredients.length === 1}>
                      <IconClose size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-ghost btn-sm form-add-btn" onClick={addIngredient}>
                <IconPlus size={14} /> Add ingredient
              </button>
            </div>

            <div className="form-section">
              <p className="form-section-title">Instructions</p>
              <div className="form-instruction-list">
                {form.instructions.map((step, i) => (
                  <div key={i} className="form-instruction-row">
                    <span className="form-step-num">{i + 1}</span>
                    <textarea className="input input-sm" rows={2} placeholder={`Step ${i + 1}…`}
                      value={step} onChange={e => setInstruction(i, e.target.value)} />
                    <button type="button" className="btn btn-ghost btn-sm form-remove-btn"
                      onClick={() => removeInstruction(i)} disabled={form.instructions.length === 1}>
                      <IconClose size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-ghost btn-sm form-add-btn" onClick={addInstruction}>
                <IconPlus size={14} /> Add step
              </button>
            </div>

          </div>{/* /recipe-form-main */}

          {/* ── Right column ───────────────────────────────────────────── */}
          <div className="recipe-form-side">

            <PhotoDropZone
              preview={photoPreview}
              onPick={handlePhotoPick}
              onClear={handlePhotoClear}
              onGenerate={handlePhotoGenerate}
              generating={photoGenerating}
              error={photoError}
              form={form}
            />

            <div className="form-section">
              <p className="form-section-title">Details</p>

              <p className="form-subsection-label">Category</p>
              <div className="form-cat-chips">
                {FORM_CATEGORIES.map(val => (
                  <button key={val} type="button"
                    className={`form-cat-chip${form.category === val ? ' form-cat-chip--on' : ''}`}
                    onClick={() => set('category', val)}>
                    {CATEGORIES[val]?.label ?? val}
                  </button>
                ))}
              </div>

              <div className="form-stepper-group">
                {[
                  { field: 'servings',  label: 'Servings',  min: 1 },
                  { field: 'prep_time', label: 'Prep (min)', min: 0 },
                  { field: 'cook_time', label: 'Cook (min)', min: 0 },
                ].map(({ field, label, min }) => (
                  <div key={field} className="form-stepper-col">
                    <span className="form-stepper-label">{label}</span>
                    <div className="form-stepper">
                      <button type="button" className="form-stepper-btn"
                        onClick={() => set(field, Math.max(min, (form[field] || 0) - 1))}>−</button>
                      <span className="form-stepper-val">{form[field]}</span>
                      <button type="button" className="form-stepper-btn"
                        onClick={() => set(field, (form[field] || 0) + 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-divider" />

              {approvalMembers.length > 0 && (
                <div className="form-toggle-row" style={{ alignItems: 'flex-start' }}>
                  <div className="form-toggle-info">
                    <span className="form-toggle-label">Meal approval</span>
                    <span className="form-toggle-desc">Who will eat this?</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {approvalMembers.map(m => {
                      const on = (form.approved_by ?? []).includes(m.id)
                      return (
                        <button key={m.id} type="button"
                          onClick={() => set('approved_by', on
                            ? (form.approved_by ?? []).filter(id => id !== m.id)
                            : [...(form.approved_by ?? []), m.id]
                          )}
                          style={{
                            height: 30, padding: '0 12px', borderRadius: 'var(--r-pill)',
                            border: `1.5px solid ${on ? m.color : 'var(--hp-ink-200)'}`,
                            background: on ? m.color + '22' : 'var(--hp-ink-50)',
                            color: on ? m.color : 'var(--hp-ink-500)',
                            fontFamily: 'var(--hp-font-body)', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}>
                          {on && <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0 }} />}
                          {m.name} ✓
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="form-divider" />

              <div className="form-rating-row">
                <div className="form-toggle-info">
                  <span className="form-toggle-label">Your rating</span>
                  <span className="form-toggle-desc">How did this one turn out?</span>
                </div>
                <div className="form-stars">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button"
                      className={`form-star-btn${(form.rating ?? 0) >= n ? ' form-star-btn--on' : ''}`}
                      onClick={() => set('rating', form.rating === n ? null : n)}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section">
              <p className="form-section-title">
                Nutrition <span className="form-optional">per serving · optional</span>
              </p>
              <div className="form-nutrition-grid">
                {[
                  { key: 'calories', label: 'Calories', unit: 'kcal' },
                  { key: 'protein',  label: 'Protein',  unit: 'g'    },
                  { key: 'carbs',    label: 'Carbs',    unit: 'g'    },
                  { key: 'fat',      label: 'Fat',      unit: 'g'    },
                  { key: 'fiber',    label: 'Fiber',    unit: 'g'    },
                ].map(({ key, label, unit }) => (
                  <div key={key} className="form-nutrition-cell">
                    <input className="form-nutrition-input" type="number" min="0" placeholder="0"
                      value={form.nutrition[key]}
                      onChange={e => setForm(f => ({ ...f, nutrition: { ...f.nutrition, [key]: e.target.value } }))} />
                    <span className="form-nutrition-label-sm">{label}</span>
                    <span className="form-nutrition-unit">{unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <p className="form-section-title">
                Notes <span className="form-optional">optional</span>
              </p>
              <textarea className="input" rows={3} placeholder="Tips, variations, storage notes…"
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>

          </div>{/* /recipe-form-side */}

        </div>{/* /recipe-form-body */}
      </form>

    </div>
  )
}
