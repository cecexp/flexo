'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Zap, RefreshCw, LogOut } from 'lucide-react'
import { clearMockSession } from '@/lib/mock/privy'
import ThemeToggle from './theme-toggle'
import { useState } from 'react'

const LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Cuentas', path: '/accounts' },
  { label: 'Tesorería', path: '/treasury' },
]

export default function Nav({ onSync }: { onSync?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    setSyncing(true)
    await onSync?.()
    await new Promise(r => setTimeout(r, 1200))
    setSyncing(false)
  }

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-900 dark:text-white font-semibold text-sm">Fluxo</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(({ label, path }) => (
              <button key={path} onClick={() => router.push(path)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${pathname === path
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {onSync && (
            <button onClick={handleSync} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          )}
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1" />
          <button onClick={() => { clearMockSession(); router.push('/login') }}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
