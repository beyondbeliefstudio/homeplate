import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getRecipeById, saveRecipe, uploadRecipeImage, deleteRecipeImage } from '../lib/supabase'
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
function PhotoDropZone({ preview, onPick, onClear, onGenerate, generating, error }) {
  const fileRef         = useRef(null)
  const autoGenRef      = useRef(false)
  const [dragging, setDragging] = useState(false)

  function handlePickFile(e) {
    const file = e.target.files?.[0]
    if (file) {
      onPick(file)
      if (autoGenRef.current) {
        autoGenRef.current = false
        onGenerate(file)
      }
    }
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
    if (preview) {
      onGenerate()
    } else {
      autoGenRef.current = true
      fileRef.current?.click()
    }
  }

  return (
    <div
      className={`recipe-photo-zone${dragging ? ' recipe-photo-zone--drag' : ''}${preview ? ' recipe-photo-zone--filled' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !preview && fileRef.current?.click()}
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
            {generating ? 'Generating…' : '+ Generate with AI'}
          </button>
        </>
      ) : (
        <div className="recipe-photo-empty">
          <IconCamera size={28} className="recipe-photo-icon" />
          <p className="recipe-photo-label">Drop a photo here</p>
          <p className="recipe-photo-hint">JPG or PNG · up to 5 MB</p>
          <button type="button" className="btn btn-primary btn-sm"
            onClick={handleGenerateClick}>
            <IconSparkle size={13} />
            + Generate with AI
          </button>
        </div>
      )}
      {error && <p className="recipe-photo-error">{error}</p>}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function blankForm() {
  return {
    name: '', category: 'dinner',
    rory_approved: false, rating: null,
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

  async function handlePhotoGenerate(file) {
    const f = file || photoFile
    if (!f) return
    setPhotoGenerating(true)
    setPhotoError(null)
    try {
      const base64 = await fileToBase64(f)
      const data   = await callParseRecipe({ image: { mediaType: f.type || 'image/jpeg', data: base64 } })
      setForm(prev => ({ ...formFromData(data), image_url: prev.image_url }))
    } catch (err) {
      setPhotoError(err.message || 'Generation failed. Try again.')
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

      {/* ── AI Builder ─────────────────────────────────────────────────── */}
      {!isEditing && (
        <AIRecipeBuilder onGenerate={data => setForm(formFromData(data))} />
      )}

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

              <div className="form-toggle-row">
                <div className="form-toggle-info">
                  <span className="form-toggle-label">Rory-approved</span>
                  <span className="form-toggle-desc">Will the little guy eat this?</span>
                </div>
                <label className="form-toggle">
                  <input type="checkbox" checked={form.rory_approved}
                    onChange={e => set('rory_approved', e.target.checked)} />
                  <span className="form-toggle-track" />
                </label>
              </div>

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
