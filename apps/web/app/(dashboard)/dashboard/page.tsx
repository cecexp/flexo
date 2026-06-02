'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Building2, ArrowUpRight, ArrowDownRight, Shield, ChevronRight } from 'lucide-react'
import { getMockSession, clearMockSession } from '@/lib/mock/privy'
import { MOCK_WALLET, MOCK_BANK_ACCOUNTS, MOCK_TRANSACTIONS } from '@/lib/mock/data'
import Nav from '@/components/ui/nav'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const session = getMockSession()
    if (!session) { router.push('/login'); return }
    setUser(session)
  }, [router])

  if (!user) return null

  const totalMXN = MOCK_BANK_ACCOUNTS.reduce((a, b) => a + b.available_balance, 0)
  const totalIdleMXN = MOCK_BANK_ACCOUNTS.reduce((a, b) => a + b.idle_liquidity, 0)
  const exchangeRate = 17.01
  const totalMXNEquiv = totalMXN + (MOCK_WALLET.usdc_total * exchangeRate)

  const kpis = [
    { label: 'Patrimonio total',       value: formatMXN(totalMXNEquiv),                        sub: 'Bancario + rendimientos',    trend: '+2.3%',  trendUp: true  },
    { label: 'Liquidez bancaria',      value: formatMXN(totalMXN),                             sub: `${MOCK_BANK_ACCOUNTS.length} cuentas activas` },
    { label: 'Generando rendimiento',  value: `$${MOCK_WALLET.usdc_total.toFixed(0)} USD`,      sub: `${MOCK_WALLET.current_apy}% APY`,            trend: '+8.2%', trendUp: true  },
    { label: 'Rendimiento total',      value: `$${MOCK_WALLET.yield_earned_total.toFixed(2)} USD`, sub: 'Acumulado',                trend: `+$${(MOCK_WALLET.yield_earned_total / 30).toFixed(2)}/día`, trendUp: true },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Greeting */}
        <div style={{ marginBottom: '2rem' }} className="animate-fade-up">
          <p style={{ fontSize: 13, color: 'var(--txt3)', marginBottom: '0.3rem' }}>{user.company}</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--txt)', letterSpacing: '-0.025em' }}>
            Buenos días, {user.name.split(' ')[0]} 👋
          </h1>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }} className="kpi-grid animate-fade-up">
          {kpis.map(({ label, value, sub, trend, trendUp }) => (
            <div key={label} className="card" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: '0.75rem', fontWeight: 500 }}>{label}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--txt)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>{value}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <p style={{ fontSize: 12, color: 'var(--txt2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>
                {trend && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--neon)', flexShrink: 0, background: 'var(--neon-muted)', padding: '2px 6px', borderRadius: 6 }}>
                    {trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="main-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Idle alert */}
            {totalIdleMXN > 0 && (
              <div style={{
                background: 'var(--amber-bg)', border: '1px solid var(--amber-border)',
                borderRadius: 14, padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amber)', marginBottom: '0.2rem' }}>
                    {formatMXN(totalIdleMXN)} sin generar rendimiento
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--txt2)' }}>
                    ~${(totalIdleMXN / exchangeRate).toFixed(0)} USD por convertir
                  </p>
                </div>
                <button onClick={() => router.push('/treasury')} className="btn-neon"
                  style={{ padding: '0.5rem 1rem', borderRadius: 10, border: 'none', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Convertir ahora
                </button>
              </div>
            )}
{/* Bank accounts */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
  {/* Encabezado de la sección fuera de las tarjetas */}
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Building2 size={14} color="var(--txt3)" />
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Cuentas bancarias</span>
    </div>
    <button onClick={() => router.push('/accounts')}
      style={{ fontSize: 12, color: 'var(--txt3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
      Ver todas <ChevronRight size={12} />
    </button>
  </div>

  {/* Tarjetas individuales con bordes */}
  {MOCK_BANK_ACCOUNTS.map((acc) => (
    <div 
      key={acc.id} 
      className="card" /* Reutiliza los estilos globales de tu archivo css */
      style={{
        padding: '1.25rem',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        border: '1px solid var(--border)', /* Token sutil de borde */
        borderRadius: '12px', /* Esquinas redondeadas modernas */
        background: 'var(--bg2)', /* Fondo para hacer contraste con el fondo principal */
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border2)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Lado izquierdo: Información del banco */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neon)' }}>{acc.institution.slice(0, 2)}</span>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>{acc.institution}</p>
          <p style={{ fontSize: 12, color: 'var(--txt3)' }}>{acc.account_name}</p>
        </div>
      </div>

      {/* Lado derecho: Saldos */}
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt)' }}>{formatMXN(acc.available_balance)}</p>
        <p style={{ fontSize: 12, color: acc.idle_liquidity > 0 ? 'var(--amber)' : 'var(--txt3)', fontWeight: acc.idle_liquidity > 0 ? 500 : 400 }}>
          {acc.idle_liquidity > 0 ? `${formatMXN(acc.idle_liquidity)} ocioso` : 'Sin ocioso'}
        </p>
      </div>
    </div>
  ))}
</div>

            {/* Recent activity */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Actividad reciente</span>
                <button style={{ fontSize: 12, color: 'var(--txt3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  Ver todo <ChevronRight size={12} />
                </button>
              </div>
              {MOCK_TRANSACTIONS.map((tx, i) => {
                const isYield = tx.type === 'yield_earned'
                const isDeposit = tx.type === 'deposit'
                return (
                  <div key={tx.id} style={{
                    padding: '0.75rem 1.25rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    borderBottom: i < MOCK_TRANSACTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: isYield ? 'var(--neon-muted)' : isDeposit ? 'rgba(77,166,255,0.08)' : 'var(--bg3)',
                      border: `1px solid ${isYield ? 'var(--neon-border)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isYield ? <TrendingUp size={14} color="var(--neon)" /> :
                       isDeposit ? <ArrowDownRight size={14} color="var(--blue)" /> :
                       <ArrowUpRight size={14} color="var(--txt3)" />}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: 13, color: 'var(--txt)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</p>
                      <p style={{ fontSize: 11, color: 'var(--txt3)' }}>{formatTime(tx.created_at)}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>
                        {tx.currency === 'MXN' ? formatMXN(tx.amount) : `$${tx.amount.toFixed(2)} ${tx.currency}`}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--txt3)' }}>{formatStatus(tx.status)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="sidebar">
            {/* Yield card */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TrendingUp size={14} color="var(--txt3)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Rendimiento activo</span>
              </div>
              <div style={{
                textAlign: 'center', padding: '1rem',
                background: 'var(--neon-muted)', border: '1px solid var(--neon-border)',
                borderRadius: 12, marginBottom: '1rem',
              }} className="animate-pulse-neon">
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--neon)', letterSpacing: '-0.02em' }}>{MOCK_WALLET.current_apy}%</p>
                <p style={{ fontSize: 12, color: 'var(--txt3)', marginTop: '0.2rem' }}>APY estimado anual</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { label: 'En rendimiento', value: `$${MOCK_WALLET.usdc_in_protocol.toFixed(2)} USD` },
                  { label: 'Disponible',     value: `$${MOCK_WALLET.usdc_balance.toFixed(2)} USD` },
                  { label: 'Total generado', value: `+$${MOCK_WALLET.yield_earned_total.toFixed(2)} USD`, green: true },
                ].map(({ label, value, green }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: green ? 'var(--neon)' : 'var(--txt)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety buffer */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Shield size={14} color="var(--txt3)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Colchón de seguridad</span>
              </div>
              {MOCK_BANK_ACCOUNTS.map(acc => (
                <div key={acc.id} style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{acc.institution}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)' }}>{formatMXN(acc.safety_buffer)}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--blue)', borderRadius: 99, width: `${Math.min((acc.safety_buffer / acc.current_balance) * 100, 100)}%`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
              <button onClick={() => router.push('/treasury')} style={{
                width: '100%', height: 38, marginTop: '0.5rem',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--txt2)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                Configurar colchón
              </button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (min-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .main-grid { grid-template-columns: 1fr 300px !important; }
        }
      `}</style>
    </div>
  )
}

function formatMXN(n: number) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n) }
function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours} h`
  return new Date(iso).toLocaleDateString('es-MX')
}
function formatStatus(s: string) { return ({ completed: 'Completado', pending: 'Pendiente', processing: 'Procesando', failed: 'Fallido' }[s] || s) }
