import { NavLink } from 'react-router-dom'
import { UtensilsCrossed, CalendarDays, ShoppingCart, Store } from 'lucide-react'
import './BottomNav.css'

const NAV_ITEMS = [
  { to: '/recipes',  icon: UtensilsCrossed, label: 'Recipes' },
  { to: '/planner',  icon: CalendarDays,    label: 'Planner' },
  { to: '/grocery',  icon: ShoppingCart,    label: 'Grocery' },
  { to: '/stores',   icon: Store,           label: 'Stores'  },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `bottom-nav-link ${isActive ? 'bottom-nav-link--active' : ''}`
          }
        >
          <Icon size={20} strokeWidth={1.75} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
