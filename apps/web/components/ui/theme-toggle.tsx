'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('fluxo-theme')
    const isDark = stored !== 'light'
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('fluxo-theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      style={{
        width: 36, height: 36,
        borderRadius: 10,
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
        color: 'var(--txt2)',
      }}
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
