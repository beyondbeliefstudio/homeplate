import { Settings } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'

export default function SettingsPage() {
  const { isDark, toggle } = useDarkMode()

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Theme</div>
            <div style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 2 }}>
              {isDark ? 'Dark mode' : 'Light mode'}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={toggle}>
            Switch to {isDark ? 'light' : 'dark'}
          </button>
        </div>
      </div>
    </div>
  )
}
