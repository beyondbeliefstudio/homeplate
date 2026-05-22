import { useDarkMode } from '../hooks/useDarkMode'
import { useUser } from '../hooks/useAuth.jsx'
import { signOut } from '../lib/supabase'

export default function SettingsPage() {
  const { isDark, toggle } = useDarkMode()
  const user = useUser()

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>

        {/* Account */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 12 }}>Account</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{user?.user_metadata?.full_name || 'Signed in'}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 2 }}>{user?.email}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={signOut}>Sign out</button>
          </div>
        </div>

        {/* Appearance */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 12 }}>Appearance</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Theme</div>
              <div style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 2 }}>{isDark ? 'Dark mode' : 'Light mode'}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={toggle}>
              Switch to {isDark ? 'light' : 'dark'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
