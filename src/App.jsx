import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import RecipesPage from './pages/RecipesPage'
import PlannerPage from './pages/PlannerPage'
import GroceryPage from './pages/GroceryPage'
import StoresPage from './pages/StoresPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/recipes" replace />} />
          <Route path="/recipes/*" element={<RecipesPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/grocery" element={<GroceryPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
