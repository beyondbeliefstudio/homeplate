import { Store } from 'lucide-react'

export default function StoresPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Stores</h1>
        <button className="btn btn-primary btn-sm">+ Add store</button>
      </div>
      <div className="page-placeholder">
        <Store size={32} strokeWidth={1.5} />
        <p>Store layouts and aisle maps go here.</p>
      </div>
    </div>
  )
}
