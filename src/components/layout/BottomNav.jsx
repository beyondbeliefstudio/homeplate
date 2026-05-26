import { NavLink } from 'react-router-dom'
import { IconHome, IconPlanner, IconRecipes, IconGrocery } from '../icons'
import './BottomNav.css'

const NAV_ITEMS = [
  { to: '/dashboard', icon: IconHome,    label: 'Home'    },
  { to: '/planner',   icon: IconPlanner, label: 'Planner' },
  { to: '/recipes',   icon: IconRecipes, label: 'Recipes' },
  { to: '/grocery',   icon: IconGrocery, label: 'Grocery' },
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
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
