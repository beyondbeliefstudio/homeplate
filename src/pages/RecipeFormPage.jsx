import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useAuth.jsx'
import { getRecipeById, saveRecipe } from '../lib/supabase'
import { CATEGORY_LIST } from '../lib/categories'
import { ChevronLeft, Plus, Trash2, Camera, X, Sparkles } from 'lucide-react'
import './Recipes.css'

const LOADING_MESSAGES = [
  'Reading your recipe…',
  'Identifying ingredients…',
  'Structuring the steps…',
  'Almost done…',
]

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const BLANK_INGREDIENT  = { name: '', quantity: '', unit: '' }
const BLANK_INSTRUCTION = ''

// ─── AI Recipe Builder ────────────────────────────────────────────────────────
function AIRecipeBuilder({ onGenerate }) {
  const [text, setText]           = useState('')
  const [image, setImage]         = useState(null)   // { file, preview, mediaType }
  const [parsing, setParsing]     = useState(false)
  const [msgIdx, setMsgIdx]       = useState(0)
  const [error, setError]         = useState(null)
  const [done, setDone]           = useState(false)
  const fileRef                   = useRef(null)
  const intervalRef               = useRef(null)

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

  async function handleGenerate() {
    if (!text.trim() && !image) return
    setError(null)
    setParsing(true)
    setMsgIdx(0)

    intervalRef.current = setInterval(() => {
      setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length)
    }, 2800)

    try {
      const body = { text: text.trim() || undefined }
      if (image) {
        body.image = { mediaType: image.mediaType, data: await fileToBase64(image.file) }
      }

      const resp = await fetch('/.netlify/functions/parse-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await resp.json()
      if (!resp.ok || data.error) throw new Error(data.error || 'Unexpected error')

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
        <Sparkles size={16} strokeWidth={2} className="ai-builder-sparkle" />
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
        <Sparkles size={15} strokeWidth={2} className="ai-builder-sparkle" />
        <span className="ai-builder-title">Generate with AI</span>
        <span className="ai-builder-hint">Describe or photograph your recipe</span>
      </div>

      <textarea
        className="input ai-builder-textarea"
        placeholder={"Describe your recipe here — paste it from the web, type it out, or just say \"chicken stir fry with ginger and sesame, serves 4\"…"}
        value={text}
        rows={4}
        onChange={e => setText(e.target.value)}
        disabled={parsing}
      />

      <div className="ai-builder-footer">
        <div className="ai-builder-photo-row">
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }} onChange={handleImagePick} />
          {image ? (
            <div className="ai-builder-preview">
              <img src={image.preview} alt="Recipe" />
              <button className="ai-builder-preview-remove" onClick={clearImage} title="Remove photo">
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm ai-builder-photo-btn"
              onClick={() => fileRef.current?.click()} disabled={parsing}>
              <Camera size={14} strokeWidth={2} />
              Add photo
            </button>
          )}
        </div>

        <div className="ai-builder-actions">
          {error && <span className="ai-builder-error">{error}</span>}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleGenerate}
            disabled={parsing || (!text.trim() && !image)}
          >
            {parsing ? LOADING_MESSAGES[msgIdx] : 'Generate recipe'}
          </button>
        </div>
      </div>

      <div className="ai-builder-divider">
        <span>or fill in manually below</span>
      </div>
    </div>
  )
}

function blankForm() {
  return {
    name: '', category: 'dinner', audience: 'everyone', servings: 2,
    prep_time: 0, cook_time: 0, notes: '',
    ingredients: [{ ...BLANK_INGREDIENT }],
    instructions: [BLANK_INSTRUCTION],
    nutrition: { calories: '', protein: '', carbs: '', fat: '', fiber: '' },
  }
}

export default function RecipeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useUser()
  const isEditing = Boolean(id)

  const [form, setForm] = useState(blankForm())
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEditing) return
    getRecipeById(id).then(({ data }) => {
      if (!data) return
      setForm({
        name:         data.name || '',
        category:     data.category || 'dinner',
        audience:     data.audience || 'everyone',
        servings:     data.servings || 2,
        prep_time:    data.prep_time || 0,
        cook_time:    data.cook_time || 0,
        notes:        data.notes || '',
        ingredients:  data.ingredients?.length ? data.ingredients : [{ ...BLANK_INGREDIENT }],
        instructions: data.instructions?.length ? data.instructions : [BLANK_INSTRUCTION],
        nutrition: {
          calories: data.nutrition?.calories ?? '',
          protein:  data.nutrition?.protein  ?? '',
          carbs:    data.nutrition?.carbs    ?? '',
          fat:      data.nutrition?.fat      ?? '',
          fiber:    data.nutrition?.fiber    ?? '',
        },
      })
      setLoading(false)
    })
  }, [id, isEditing])

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }

  // Ingredients
  function setIngredient(i, field, value) {
    setForm(f => {
      const arr = [...f.ingredients]
      arr[i] = { ...arr[i], [field]: value }
      return { ...f, ingredients: arr }
    })
  }
  function addIngredient()    { setForm(f => ({ ...f, ingredients: [...f.ingredients, { ...BLANK_INGREDIENT }] })) }
  function removeIngredient(i) {
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }))
  }

  // Instructions
  function setInstruction(i, value) {
    setForm(f => {
      const arr = [...f.instructions]
      arr[i] = value
      return { ...f, instructions: arr }
    })
  }
  function addInstruction()     { setForm(f => ({ ...f, instructions: [...f.instructions, BLANK_INSTRUCTION] })) }
  function removeInstruction(i) {
    setForm(f => ({ ...f, instructions: f.instructions.filter((_, idx) => idx !== i) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Recipe name is required.'); return }
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      id: isEditing ? id : undefined,
      ingredients:  form.ingredients.filter(i => i.name.trim()),
      instructions: form.instructions.filter(s => s.trim()),
      nutrition: Object.fromEntries(
        Object.entries(form.nutrition).map(([k, v]) => [k, v === '' ? null : Number(v)])
      ),
    }

    const { data, error: saveError } = await saveRecipe(user.id, payload)
    if (saveError) { setError(saveError.message); setSaving(false); return }
    navigate(`/recipes/${data.id}`)
  }

  if (loading) return <div className="page"><div className="page-placeholder"><p>Loading…</p></div></div>

  return (
    <div className="page recipe-form-page">
      <div className="recipe-detail-header">
        <button className="btn btn-ghost btn-sm recipe-back-btn"
          onClick={() => navigate(isEditing ? `/recipes/${id}` : '/recipes')}>
          <ChevronLeft size={16} strokeWidth={2} />
          {isEditing ? 'Cancel' : 'Back'}
        </button>
        <h1 className="page-title" style={{ fontSize: 20 }}>
          {isEditing ? 'Edit recipe' : 'New recipe'}
        </h1>
      </div>

      {/* AI builder — only on new recipes */}
      {!isEditing && (
        <AIRecipeBuilder onGenerate={data => {
          setForm({
            name:         data.name         || '',
            category:     data.category     || 'dinner',
            audience:     data.audience     || 'everyone',
            servings:     data.servings     || 2,
            prep_time:    data.prep_time    || 0,
            cook_time:    data.cook_time    || 0,
            notes:        data.notes        || '',
            ingredients:  data.ingredients?.length  ? data.ingredients  : [{ name: '', quantity: '', unit: '' }],
            instructions: data.instructions?.length ? data.instructions : [''],
            nutrition: {
              calories: data.nutrition?.calories ?? '',
              protein:  data.nutrition?.protein  ?? '',
              carbs:    data.nutrition?.carbs    ?? '',
              fat:      data.nutrition?.fat      ?? '',
              fiber:    data.nutrition?.fiber    ?? '',
            },
          })
        }} />
      )}

      <form className="recipe-form" onSubmit={handleSubmit}>

        {/* Name */}
        <div className="form-field">
          <label className="form-label">Recipe name *</label>
          <input className="input" placeholder="e.g. Roasted Garlic Pasta" value={form.name}
            onChange={e => set('name', e.target.value)} />
        </div>

        {/* Category + Audience + Servings */}
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORY_LIST.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Who eats this</label>
            <select className="input" value={form.audience} onChange={e => set('audience', e.target.value)}>
              <option value="everyone">Everyone</option>
              <option value="adults">Adults only</option>
              <option value="kids">Kids only</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Servings</label>
            <input className="input" type="number" min="1" value={form.servings}
              onChange={e => set('servings', Number(e.target.value))} />
          </div>
        </div>

        {/* Times */}
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Prep time (min)</label>
            <input className="input" type="number" min="0" value={form.prep_time}
              onChange={e => set('prep_time', Number(e.target.value))} />
          </div>
          <div className="form-field">
            <label className="form-label">Cook time (min)</label>
            <input className="input" type="number" min="0" value={form.cook_time}
              onChange={e => set('cook_time', Number(e.target.value))} />
          </div>
        </div>

        {/* Ingredients */}
        <div className="form-field">
          <label className="form-label">Ingredients</label>
          <div className="form-ingredient-list">
            <div className="form-ingredient-header">
              <span>Amount</span><span>Unit</span><span>Ingredient</span><span />
            </div>
            {form.ingredients.map((ing, i) => (
              <div key={i} className="form-ingredient-row">
                <input className="input input-sm" type="text" placeholder="2" value={ing.quantity}
                  onChange={e => setIngredient(i, 'quantity', e.target.value)} />
                <input className="input input-sm" type="text" placeholder="cups" value={ing.unit}
                  onChange={e => setIngredient(i, 'unit', e.target.value)} />
                <input className="input input-sm" type="text" placeholder="Ingredient name" value={ing.name}
                  onChange={e => setIngredient(i, 'name', e.target.value)} />
                <button type="button" className="btn btn-ghost btn-sm form-remove-btn"
                  onClick={() => removeIngredient(i)} disabled={form.ingredients.length === 1}>
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addIngredient}
            style={{ marginTop: 8, color: 'var(--accent)' }}>
            <Plus size={14} strokeWidth={2} /> Add ingredient
          </button>
        </div>

        {/* Instructions */}
        <div className="form-field">
          <label className="form-label">Instructions</label>
          <div className="form-instruction-list">
            {form.instructions.map((step, i) => (
              <div key={i} className="form-instruction-row">
                <span className="form-step-num">{i + 1}</span>
                <textarea className="input input-sm" rows={2} placeholder={`Step ${i + 1}…`}
                  value={step} onChange={e => setInstruction(i, e.target.value)} />
                <button type="button" className="btn btn-ghost btn-sm form-remove-btn"
                  onClick={() => removeInstruction(i)} disabled={form.instructions.length === 1}>
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addInstruction}
            style={{ marginTop: 8, color: 'var(--accent)' }}>
            <Plus size={14} strokeWidth={2} /> Add step
          </button>
        </div>

        {/* Notes */}
        <div className="form-field">
          <label className="form-label">Notes <span className="form-optional">(optional)</span></label>
          <textarea className="input" rows={3} placeholder="Tips, variations, storage notes…"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        {/* Nutrition */}
        <div className="form-field">
          <label className="form-label">Nutrition per serving <span className="form-optional">(optional)</span></label>
          <div className="form-nutrition-grid">
            {[
              { key: 'calories', label: 'Calories', unit: 'kcal' },
              { key: 'protein',  label: 'Protein',  unit: 'g' },
              { key: 'carbs',    label: 'Carbs',    unit: 'g' },
              { key: 'fat',      label: 'Fat',      unit: 'g' },
              { key: 'fiber',    label: 'Fiber',    unit: 'g' },
            ].map(({ key, label, unit }) => (
              <div key={key} className="form-nutrition-cell">
                <label className="form-label" style={{ fontSize: 11 }}>{label} ({unit})</label>
                <input className="input input-sm" type="number" min="0" placeholder="—"
                  value={form.nutrition[key]}
                  onChange={e => setForm(f => ({ ...f, nutrition: { ...f.nutrition, [key]: e.target.value } }))} />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary"
            onClick={() => navigate(isEditing ? `/recipes/${id}` : '/recipes')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add recipe'}
          </button>
        </div>

      </form>
    </div>
  )
}
