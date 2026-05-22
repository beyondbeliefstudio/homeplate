import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { supabase } from './lib/supabase.js'
import { seedIfEmpty } from './lib/seedData.js'

// Seed placeholder recipes for new users after auth resolves
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) seedIfEmpty(session.user.id)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
