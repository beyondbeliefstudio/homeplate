import { useState, useEffect } from 'react'

export function useDarkMode() {
  // Light is now the default — dark is opt-in
  const [theme, setTheme] = useState(() => localStorage.getItem('hp-theme') || 'light')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('hp-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return { theme, toggle, isDark: theme === 'dark' }
}
