import { NavLink } from 'react-router-dom'
import {
  UtensilsCrossed, CalendarDays, ShoppingCart,
  Store, Settings, Sun, Moon
} from 'lucide-react'
import { useDarkMode } from '../../hooks/useDarkMode'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/recipes',  icon: UtensilsCrossed, label: 'Recipes' },
  { to: '/planner',  icon: CalendarDays,    label: 'Planner' },
  { to: '/grocery',  icon: ShoppingCart,    label: 'Grocery' },
  { to: '/stores',   icon: Store,           label: 'Stores'  },
]

export default function Sidebar({ isCompressed }) {
  const { isDark, toggle } = useDarkMode()

  return (
    <aside className={`sidebar ${isCompressed ? 'sidebar--compressed' : ''}`}>
      <div className="sidebar-wordmark">
        {isCompressed ? (
          <span className="sidebar-mark">H</span>
        ) : (
          <span className="sidebar-logo">HomePlate</span>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {!isCompressed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
          }
        >
          <Settings size={18} strokeWidth={1.75} />
          {!isCompressed && <span>Settings</span>}
        </NavLink>

        <button className="sidebar-link sidebar-theme-toggle" onClick={toggle} title="Toggle theme">
          {isDark
            ? <Sun size={18} strokeWidth={1.75} />
            : <Moon size={18} strokeWidth={1.75} />
          }
          {!isCompressed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>
      </div>
    </aside>
  )
}
