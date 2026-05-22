import { UtensilsCrossed } from 'lucide-react'

export default function RecipesPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Recipes</h1>
        <button className="btn btn-primary btn-sm">
          <span>+ Add recipe</span>
        </button>
      </div>
      <div className="page-placeholder">
        <UtensilsCrossed size={32} strokeWidth={1.5} />
        <p>Your recipe library lives here.</p>
      </div>
    </div>
  )
}
