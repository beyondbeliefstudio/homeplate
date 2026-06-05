import { NavLink } from 'react-router-dom'
import {
  IconHome, IconRecipes, IconPlanner, IconGrocery, IconSettings, IconMoon,
} from '../icons'
import { Lockup, Mark } from '../Wordmark'
import { useUser } from '../../hooks/useAuth.jsx'
import { useDarkMode } from '../../hooks/useDarkMode.js'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard', icon: IconHome,     label: 'Dashboard' },
  { to: '/recipes',   icon: IconRecipes,  label: 'Recipes'   },
  { to: '/planner',   icon: IconPlanner,  label: 'Planner'   },
  { to: '/grocery',   icon: IconGrocery,  label: 'Grocery'   },
  { to: '/settings',  icon: IconSettings, label: 'Settings'  },
]

const GRAD = 'linear-gradient(135deg, #F0913C, #F4C233, #A6C948, #5BA63C)'

export default function Sidebar({ isCompressed }) {
  const user = useUser()
  const { isDark, toggle } = useDarkMode()
  const initials     = user?.user_metadata?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'H'
  const displayName  = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Home'

  return (
    <aside className={`sidebar${isCompressed ? ' sidebar--compressed' : ''}`}>

      {/* ── Logo ── */}
      <div className="sidebar-lockup">
        {isCompressed
          ? <Mark size={34} tile={true} />
          : <Lockup markSize={34} size={18} gap={10} tile={true} mono={true} />
        }
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}>
            {({ isActive }) => (
              <>
                <Icon size={18} stroke={isActive ? 2 : 1.75} />
                {!isCompressed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <button className="sidebar-dark-row" onClick={toggle}>
          <IconMoon size={16} />
          {!isCompressed && (
            <>
              <span className="sidebar-dark-label">Dark mode</span>
              <div className={`sidebar-toggle-track${isDark ? ' sidebar-toggle-track--on' : ''}`}>
                <div className="sidebar-toggle-thumb" />
              </div>
            </>
          )}
        </button>

        {!isCompressed && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" style={{ background: GRAD }}>
              <span>{initials}</span>
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-sub">HomePlate</div>
            </div>
          </div>
        )}
      </div>

    </aside>
  )
}
