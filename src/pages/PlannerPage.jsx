import { CalendarDays } from 'lucide-react'

export default function PlannerPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Planner</h1>
      </div>
      <div className="page-placeholder">
        <CalendarDays size={32} strokeWidth={1.5} />
        <p>Weekly meal plan goes here.</p>
      </div>
    </div>
  )
}
