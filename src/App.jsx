import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import Layout from './components/layout/Layout'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import RecipesPage from './pages/RecipesPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import RecipeFormPage from './pages/RecipeFormPage'
import PlannerPage from './pages/PlannerPage'
import GroceryPage from './pages/GroceryPage'
import StoresPage from './pages/StoresPage'
import SettingsPage from './pages/SettingsPage'

function AppRoutes() {
  const session = useAuth()

  if (session === undefined) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-3)', fontSize: 14,
      }}>
        Loading…
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"        element={<DashboardPage />} />
        <Route path="/recipes"          element={<RecipesPage />} />
        <Route path="/recipes/new"      element={<RecipeFormPage />} />
        <Route path="/recipes/:id"      element={<RecipeDetailPage />} />
        <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
        <Route path="/planner"          element={<PlannerPage />} />
        <Route path="/grocery"          element={<GroceryPage />} />
        <Route path="/stores"           element={<StoresPage />} />
        <Route path="/settings"         element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
