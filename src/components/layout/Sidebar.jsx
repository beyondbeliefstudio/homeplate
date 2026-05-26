import { NavLink } from 'react-router-dom'
import {
  IconHome, IconRecipes, IconPlanner, IconGrocery,
  IconSettings, IconSun, IconMoon,
} from '../icons'
import { Wordmark, Mark } from '../Wordmark'
import { useDarkMode } from '../../hooks/useDarkMode'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard', icon: IconHome,     label: 'Dashboard' },
  { to: '/recipes',   icon: IconRecipes,  label: 'Recipes'   },
  { to: '/planner',   icon: IconPlanner,  label: 'Planner'   },
  { to: '/grocery',   icon: IconGrocery,  label: 'Grocery'   },
]

export default function Sidebar({ isCompressed }) {
  const { isDark, toggle } = useDarkMode()

  return (
    <aside className={`sidebar ${isCompressed ? 'sidebar--compressed' : ''}`}>
      <div className="sidebar-wordmark">
        {isCompressed
          ? <Mark size={32} />
          : <Wordmark height={20} />
        }
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
            <Icon size={18} />
            {!isCompressed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link sidebar-link--settings ${isActive ? 'sidebar-link--active' : ''}`
          }
        >
          <IconSettings size={18} />
          {!isCompressed && <span>Settings</span>}
        </NavLink>

        <button
          className="sidebar-link sidebar-link--settings sidebar-theme-toggle"
          onClick={toggle}
          title="Toggle theme"
        >
          {isDark
            ? <IconSun size={18} />
            : <IconMoon size={18} />
          }
          {!isCompressed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>
      </div>
    </aside>
  )
}
