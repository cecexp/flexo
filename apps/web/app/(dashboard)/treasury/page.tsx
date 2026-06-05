'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, TrendingUp, ArrowRight, CheckCircle2, Loader2, AlertTriangle, Zap } from 'lucide-react'
import { MOCK_BANK_ACCOUNTS, MOCK_WALLET } from '@/lib/mock/data'
import { getTicker } from '@/lib/bitso/client'
import Nav from '@/components/ui/nav'
import { createClient } from '@/lib/supabase/client'

type Step = 'idle' | 'confirming' | 'converting' | 'depositing' | 'done' | 'error'

export default function TreasuryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [ticker, setTicker] = useState<any>(null)
  const [buffer, setBuffer] = useState(200000)
  const [bufferInput, setBufferInput] = useState('200000')
  const [step, setStep] = useState<Step>('idle')
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: supabaseUser } }) => {
      if (!supabaseUser) { router.push('/login'); return }
      setUser(supabaseUser)
    })
  }, [router])

  useEffect(() => {
    getTicker().then(setTicker).catch(() => setTicker({ last: 17.01 }))
  }, [])

  const totalMXN = MOCK_BANK_ACCOUNTS.reduce((a, b) => a + b.available_balance, 0)
  const idleMXN = Math.max(totalMXN - buffer, 0)
  const exchangeRate = ticker?.last ?? 17.01
  const idleUSDC = idleMXN / exchangeRate
  const estimatedYearlyUSD = idleUSDC * (MOCK_WALLET.current_apy / 100)
  const estimatedDailyUSD = estimatedYearlyUSD / 365
  const estimatedMonthlyUSD = estimatedYearlyUSD / 12

  async function handleConfirm() {
    try {
      setStep('converting')
      const res = await fetch('/api/bitso/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_mxn: idleMXN,
          company_id: '00000000-0000-0000-0000-000000000001',
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setOrder(data.order)
      setStep('depositing')
      await new Promise(r => setTimeout(r, 2000))
      setStep('done')
    } catch {
      setError('Error al procesar la conversión')
      setStep('error')
    }
  }

  function reset() { setStep('idle'); setOrder(null); setError('') }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />

      {/* ── Modal de conversión ── */}
      {step !== 'idle' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem', backdropFilter: 'blur(4px)',
        }}>
          <div className="card animate-fade-up" style={{ padding: '1.75rem', width: '100%', maxWidth: 420 }}>

            {step === 'confirming' && (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--txt)', marginBottom: '1rem' }}>
                  Confirmar conversión
                </h3>
                <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    ['Monto a convertir', formatMXN(idleMXN), false],
                    ['Recibirás aprox.', `$${idleUSDC.toFixed(2)} USDC`, true],
                    ['Tasa actual', `$${exchangeRate.toFixed(4)} MXN/USDC`, false],
                  ].map(([label, val, green]) => (
                    <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: 13, color: 'var(--txt3)' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: green ? 'var(--neon)' : 'var(--txt)' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={reset} style={{ flex: 1, height: 44, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, cursor: 'pointer', color: 'var(--txt2)' }}>
                    Cancelar
                  </button>
                  <button onClick={handleConfirm} className="btn-neon" style={{ flex: 1, height: 44, border: 'none', borderRadius: 12, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                    Confirmar
                  </button>
                </div>
              </>
            )}

            {(step === 'converting' || step === 'depositing') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '0.5rem 0' }}>
                <Loader2 size={28} color="var(--neon)" className="animate-spin" />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--txt)', marginBottom: '0.3rem' }}>
                    {step === 'converting' ? 'Convirtiendo MXN a USDC...' : 'Depositando en protocolo...'}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--txt3)' }}>Esto puede tomar unos segundos</p>
                </div>
              </div>
            )}

            {step === 'done' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--neon-muted)', border: '1px solid var(--neon-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={24} color="var(--neon)" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--txt)', marginBottom: '0.3rem' }}>¡Conversión exitosa!</p>
                  <p style={{ fontSize: 13, color: 'var(--txt3)' }}>Tu capital ya está generando rendimiento</p>
                </div>
                <button onClick={reset} className="btn-neon" style={{ width: '100%', height: 44, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Volver al resumen
                </button>
              </div>
            )}

            {step === 'error' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(204,42,64,0.08)', border: '1px solid rgba(204,42,64,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={24} color="var(--red)" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--txt)', marginBottom: '0.3rem' }}>Algo salió mal</p>
                  <p style={{ fontSize: 13, color: 'var(--txt3)' }}>{error}</p>
                </div>
                <button onClick={reset} style={{ width: '100%', height: 44, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, cursor: 'pointer', color: 'var(--txt2)' }}>
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem) clamp(0.75rem, 3vw, 1.5rem)' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(20px, 5vw, 26px)',
            color: 'var(--txt)', letterSpacing: '-0.025em', marginBottom: '0.3rem',
          }}>
            Automatización de tesorería
          </h1>
          <p style={{ fontSize: 14, color: 'var(--txt3)' }}>Convierte capital ocioso en rendimiento automático</p>
        </div>

        <div className="treasury-grid">

          {/* ── Columna izquierda ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>

            {/* Colchón de seguridad */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Shield size={15} color="var(--txt3)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Colchón de seguridad</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: '0.75rem' }}>
                Monto mínimo que siempre quedará en tus cuentas bancarias
              </p>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--txt3)', pointerEvents: 'none' }}>$</span>
                <input
                  type="number"
                  value={bufferInput}
                  onChange={e => { setBufferInput(e.target.value); setBuffer(Number(e.target.value)) }}
                  style={{
                    width: '100%', height: 44, paddingLeft: '1.75rem', paddingRight: '1rem',
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 10, color: 'var(--txt)', fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              {/* Barra visual por cuenta */}
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {MOCK_BANK_ACCOUNTS.map(acc => (
                  <div key={acc.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{acc.institution}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)' }}>{formatMXN(acc.safety_buffer)}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', background: 'var(--blue)', borderRadius: 99,
                        width: `${Math.min((acc.safety_buffer / acc.current_balance) * 100, 100)}%`,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desglose de cuentas */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Cuentas bancarias</p>
              </div>
              {MOCK_BANK_ACCOUNTS.map((acc, i) => (
                <div key={acc.id} style={{
                  padding: '0.875rem 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                  borderBottom: i < MOCK_BANK_ACCOUNTS.length - 1 ? '1px solid var(--border)' : 'none',
                  minWidth: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--neon)' }}>{acc.institution.slice(0, 2)}</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.institution}</p>
                      <p style={{ fontSize: 11, color: acc.idle_liquidity > 0 ? 'var(--amber)' : 'var(--txt3)' }}>
                        {acc.idle_liquidity > 0 ? `${formatMXN(acc.idle_liquidity)} ocioso` : 'Sin ocioso'}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt)', flexShrink: 0 }}>{formatMXN(acc.available_balance)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Columna derecha (sidebar) ── */}
          <div className="treasury-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Rendimiento estimado */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TrendingUp size={15} color="var(--txt3)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Rendimiento estimado</span>
              </div>

              {/* APY destacado */}
              <div style={{
                textAlign: 'center', padding: '0.875rem',
                background: 'var(--neon-muted)', border: '1px solid var(--neon-border)',
                borderRadius: 12, marginBottom: '1rem',
              }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: 'var(--neon)', letterSpacing: '-0.02em' }}>
                  {MOCK_WALLET.current_apy}%
                </p>
                <p style={{ fontSize: 12, color: 'var(--txt3)', marginTop: '0.15rem' }}>APY estimado anual</p>
              </div>

              {/* Capital ocioso */}
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: '0.3rem' }}>Capital ocioso disponible</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: idleMXN > 0 ? 'var(--amber)' : 'var(--txt)', letterSpacing: '-0.02em' }}>
                  {formatMXN(idleMXN)}
                </p>
                <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: '0.2rem' }}>≈ ${idleUSDC.toFixed(0)} USDC</p>
              </div>

              {/* Proyecciones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[
                  ['Por día',   `+$${estimatedDailyUSD.toFixed(2)} USD`],
                  ['Por mes',   `+$${estimatedMonthlyUSD.toFixed(2)} USD`],
                  ['Por año',   `+$${estimatedYearlyUSD.toFixed(2)} USD`],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--neon)' }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Botón principal */}
              <button
                onClick={() => setStep('confirming')}
                disabled={idleMXN < 100}
                className="btn-neon"
                style={{
                  width: '100%', height: 48, border: 'none', borderRadius: 12,
                  fontSize: 14, fontWeight: 600, cursor: idleMXN < 100 ? 'not-allowed' : 'pointer',
                  opacity: idleMXN < 100 ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                <Zap size={15} />
                Convertir {formatMXN(idleMXN)}
              </button>

              {idleMXN < 100 && (
                <p style={{ fontSize: 11, color: 'var(--txt3)', textAlign: 'center', marginTop: '0.6rem' }}>
                  Ajusta el colchón para liberar capital ocioso
                </p>
              )}
            </div>

            {/* Auto-Hedge info */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Shield size={15} color="var(--txt3)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Auto-Hedge activo</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--txt3)', lineHeight: 1.6 }}>
                El sistema reconvierte USDC → MXN automáticamente 48h antes de cada fecha de nómina o pago a proveedores.
              </p>
              <div style={{ marginTop: '0.875rem', padding: '0.75rem', background: 'var(--neon-muted)', border: '1px solid var(--neon-border)', borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: 'var(--neon)', fontWeight: 500 }}>✓ Protección cambiaria habilitada</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Móvil: 1 columna, sidebar arriba */
        .treasury-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .treasury-sidebar {
          order: -1;
        }

        /* Desktop: 2 columnas, sidebar a la derecha */
        @media (min-width: 768px) {
          .treasury-grid {
            grid-template-columns: 1fr 300px;
          }
          .treasury-sidebar {
            order: 0;
          }
        }
      `}</style>
    </div>
  )
}

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}