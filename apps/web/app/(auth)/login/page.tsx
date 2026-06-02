'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight, Loader2, Shield, TrendingUp, Fingerprint } from 'lucide-react'
import { MOCK_USERS, setMockSession } from '@/lib/mock/privy'
import ThemeToggle from '@/components/ui/theme-toggle'

const FEATURES = [
  { icon: Shield,     text: 'Capital protegido de la devaluación' },
  { icon: TrendingUp, text: 'Hasta 8% anual sobre liquidez ociosa' },
  { icon: Zap,        text: 'Automatización sin intervención manual' },
]

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  async function handleLogin(userId: string) {
    setSelectedUser(userId)
    setLoading(true)
    const user = MOCK_USERS.find(u => u.id === userId)
    if (!user) return
    await new Promise(r => setTimeout(r, 1200))
    setMockSession(user)
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>

      {/* Left panel */}
      <div style={{
        display: 'none',
        width: '50%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }} className="lg-panel">
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-100px',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#06100A" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--txt)', letterSpacing: '-0.02em' }}>Fluxo</span>
        </div>

        <div>
          <p style={{ fontSize: 13, color: 'var(--neon)', fontWeight: 600, marginBottom: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Smart Treasury Management</p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36,
            color: 'var(--txt)', lineHeight: 1.15, marginBottom: '2rem',
            letterSpacing: '-0.025em',
          }}>
            Tu tesorería<br />trabajando,<br />
            <span style={{ color: 'var(--neon)' }}>mientras tú diriges.</span>
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--neon-muted)',
                  border: '1px solid var(--neon-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} color="var(--neon)" />
                </div>
                <span style={{ fontSize: 14, color: 'var(--txt2)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--txt3)' }}>Fluxo · MVP v0.1 · Para PyMEs Mexicanas</p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <ThemeToggle />
        </div>

        <div style={{ width: '100%', maxWidth: 380 }} className="animate-fade-up">
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#06100A" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--txt)', letterSpacing: '-0.02em' }}>Fluxo</span>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--txt)', letterSpacing: '-0.025em', marginBottom: '0.4rem' }}>
              Bienvenido
            </h2>
            <p style={{ fontSize: 14, color: 'var(--txt2)', lineHeight: 1.6 }}>
              Accede con tu huella digital o Face ID.<br />Sin contraseñas, sin fricción.
            </p>
          </div>

          {/* User list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
            {MOCK_USERS.map(user => {
              const isLoading = loading && selectedUser === user.id
              const initials = user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
              return (
                <button key={user.id} onClick={() => handleLogin(user.id)} disabled={loading}
                  style={{
                    width: '100%', padding: '0.875rem 1rem',
                    background: 'var(--bg2)',
                    border: `1px solid ${isLoading ? 'var(--neon-border)' : 'var(--border)'}`,
                    borderRadius: 14,
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading && selectedUser !== user.id ? 0.45 : 1,
                    transition: 'all 0.18s ease',
                    textAlign: 'left',
                    boxShadow: isLoading ? 'var(--shadow-glow)' : 'var(--shadow-card)',
                  }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: isLoading ? 'var(--neon-muted)' : 'var(--bg3)',
                    border: `1px solid ${isLoading ? 'var(--neon-border)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.18s',
                  }}>
                    {isLoading
                      ? <Loader2 size={18} color="var(--neon)" className="animate-spin" />
                      : <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neon)', letterSpacing: '0.02em' }}>{initials}</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', marginBottom: 2 }}>{user.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--txt3)' }}>{user.company}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isLoading ? 'var(--neon)' : 'var(--txt3)' }}>
                    <Fingerprint size={16} />
                    <ArrowRight size={14} />
                  </div>
                </button>
              )
            })}
          </div>

          <p style={{ fontSize: 12, color: 'var(--txt3)', textAlign: 'center' }}>
            🔒 Modo demo · En producción: Face ID o huella digital
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
