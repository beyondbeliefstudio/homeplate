import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { useMediaQuery } from '../../hooks/useMediaQuery'

export default function Layout() {
  const isDesktop = useMediaQuery('(min-width: 980px)')
  const isFullSidebar = useMediaQuery('(min-width: 1240px)')

  return (
    <div className="app-shell">
      {isDesktop && <Sidebar isCompressed={!isFullSidebar} />}
      <main className="main-content">
        <Outlet />
      </main>
      {!isDesktop && <BottomNav />}
    </div>
  )
}
