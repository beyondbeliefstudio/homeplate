import { ShoppingCart } from 'lucide-react'

export default function GroceryPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Grocery</h1>
      </div>
      <div className="page-placeholder">
        <ShoppingCart size={32} strokeWidth={1.5} />
        <p>Your shopping list lives here.</p>
      </div>
    </div>
  )
}
