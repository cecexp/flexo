'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Zap, RefreshCw, LogOut } from 'lucide-react'
import { clearMockSession } from '@/lib/mock/privy'
import ThemeToggle from './theme-toggle'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/dashboard'    },
  { label: 'Cuentas',       path: '/accounts'     },
  { label: 'Tesorería',     path: '/treasury'     },
  { label: 'Transacciones', path: '/transactions' },
]

export default function Nav({ onSync }: { onSync?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    if (!onSync) return
    setSyncing(true)
    await onSync()
    setSyncing(false)
  }

  return (
    <header style={{
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#06100A" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--txt)', letterSpacing: '-0.02em' }}>Fluxo</span>
          </button>
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            {NAV_ITEMS.map(({ label, path }) => {
              const active = pathname === path
              return (
                <button key={path} onClick={() => router.push(path)} style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  background: active ? 'var(--bg3)' : 'transparent',
                  color: active ? 'var(--txt)' : 'var(--txt3)',
                  transition: 'all 0.15s ease',
                }}>
                  {label}
                </button>
              )
            })}
          </nav>
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ThemeToggle />
          {onSync && (
            <button onClick={handleSync} style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--bg3)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--txt2)',
            }}>
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            </button>
          )}
          <button onClick={() => { clearMockSession(); router.push('/login') }} style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--bg3)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--txt3)',
          }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  )
}
