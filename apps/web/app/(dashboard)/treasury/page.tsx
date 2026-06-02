'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, TrendingUp, ArrowRight, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import { getMockSession } from '@/lib/mock/privy'
import { MOCK_BANK_ACCOUNTS, MOCK_WALLET } from '@/lib/mock/data'
import { getTicker, createBuyOrder } from '@/lib/bitso/client'
import Nav from '@/components/ui/nav'

type Step = 'idle' | 'confirming' | 'converting' | 'depositing' | 'done' | 'error'

export default function TreasuryPage() {
  const router = useRouter()
  const [ticker, setTicker] = useState<any>(null)
  const [buffer, setBuffer] = useState(200000)
  const [bufferInput, setBufferInput] = useState('200000')
  const [step, setStep] = useState<Step>('idle')
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const session = getMockSession()
    if (!session) { router.push('/login'); return }
    getTicker().then(setTicker)
  }, [router])

  const totalMXN = MOCK_BANK_ACCOUNTS.reduce((a, b) => a + b.available_balance, 0)
  const idleMXN = Math.max(totalMXN - buffer, 0)
  const idleUSDC = ticker ? idleMXN / ticker.last : 0
  const estimatedYearlyUSD = idleUSDC * (MOCK_WALLET.current_apy / 100)
  const estimatedDailyUSD = estimatedYearlyUSD / 365

  async function handleConfirm() {
    try {
      setStep('converting')
      await new Promise(r => setTimeout(r, 1000))
      const o = await createBuyOrder(idleMXN)
      setOrder(o)
      setStep('depositing')
      await new Promise(r => setTimeout(r, 2000))
      setStep('done')
    } catch {
      setError('Error al procesar la conversión')
      setStep('error')
    }
  }

  function reset() { setStep('idle'); setOrder(null); setError('') }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />

      {/* Modal */}
      {step !== 'idle' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: '1rem',
          backdropFilter: 'blur(4px)',
          animation: 'fade-in 0.2s ease',
        }}>
          <div className="card animate-fade-up" style={{ padding: '1.75rem', width: '100%', maxWidth: 420 }}>

            {step === 'confirming' && (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--txt)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Confirmar conversión</h3>
                <p style={{ fontSize: 14, color: 'var(--txt2)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Estás a punto de convertir tu liquidez ociosa a USDC para generar rendimiento.</p>
                <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Monto a convertir',  value: formatMXN(idleMXN),               color: 'var(--txt)' },
                    { label: 'Recibirás aprox.',    value: `$${idleUSDC.toFixed(2)} USDC`,   color: 'var(--neon)' },
                    { label: 'Tipo de cambio',      value: `$${ticker?.last.toFixed(4)} MXN/USDC`, color: 'var(--txt)' },
                    { label: 'Comisión estimada',   value: formatMXN(idleMXN * 0.005),        color: 'var(--txt)' },
                    { label: 'APY estimado',        value: `${MOCK_WALLET.current_apy}%`,     color: 'var(--neon)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--txt3)' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={reset} style={{ flex: 1, height: 44, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, fontWeight: 500, color: 'var(--txt2)', cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={handleConfirm} className="btn-neon" style={{ flex: 1, height: 44, border: 'none', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>Confirmar</button>
                </div>
              </>
            )}

            {(step === 'converting' || step === 'depositing') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '0.5rem 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--neon-muted)', border: '1px solid var(--neon-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={26} color="var(--neon)" className="animate-spin" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--txt)', marginBottom: '0.3rem' }}>
                    {step === 'converting' ? 'Convirtiendo MXN a USDC...' : 'Depositando en protocolo...'}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--txt3)' }}>
                    {step === 'converting' ? 'Ejecutando orden en Bitso Business' : 'Depositando USDC de forma segura'}
                  </p>
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                 { label: 'Conversión MXN → USDC', done: (step as string) === 'depositing' || (step as string) === 'done' },
                 { label: 'Depósito en protocolo',  done: (step as string) === 'done' },
                  ].map(({ label, done }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {done
                        ? <CheckCircle2 size={16} color="var(--neon)" />
                        : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border)' }} />
                      }
                      <span style={{ fontSize: 13, color: done ? 'var(--txt)' : 'var(--txt3)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'done' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--neon-muted)', border: '1px solid var(--neon-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={26} color="var(--neon)" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--txt)', marginBottom: '0.3rem' }}>¡Conversión exitosa!</p>
                  <p style={{ fontSize: 13, color: 'var(--txt3)' }}>Tu liquidez ya está generando rendimiento.</p>
                </div>
                <button onClick={reset} className="btn-neon" style={{ width: '100%', height: 44, border: 'none', borderRadius: 12, fontSize: 14, cursor: 'pointer', marginTop: '0.5rem' }}>
                  Volver al resumen
                </button>
              </div>
            )}

            {step === 'error' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(204,42,64,0.08)', border: '1px solid rgba(204,42,64,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={26} color="var(--red)" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--txt)' }}>{error}</p>
                <button onClick={reset} style={{ width: '100%', height: 44, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, color: 'var(--txt2)', cursor: 'pointer' }}>Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }} className="animate-fade-up">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--txt)', letterSpacing: '-0.025em', marginBottom: '0.3rem' }}>Automatización de tesorería</h1>
          <p style={{ fontSize: 14, color: 'var(--txt3)' }}>Configura tu colchón de seguridad y convierte tu liquidez ociosa en rendimiento.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="treasury-grid animate-fade-up">
          {/* Buffer config */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Shield size={16} color="var(--txt3)" />
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--txt)' }}>Colchón de seguridad</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--txt3)', marginBottom: '1.5rem' }}>Define cuánto MXN mantener siempre disponible en tus cuentas.</p>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--txt2)', marginBottom: '0.4rem' }}>Monto del colchón (MXN)</label>
            <input type="number" value={bufferInput}
              onChange={e => { setBufferInput(e.target.value); setBuffer(Number(e.target.value)) }}
              style={{
                width: '100%', height: 44, padding: '0 0.875rem', marginBottom: '1rem',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 10, fontSize: 14, color: 'var(--txt)', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--neon-border)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[50000, 100000, 200000, 500000].map(v => (
                <button key={v} onClick={() => { setBuffer(v); setBufferInput(String(v)) }}
                  style={{
                    padding: '0.5rem 0.75rem', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    background: buffer === v ? 'var(--neon-muted)' : 'var(--bg3)',
                    border: `1px solid ${buffer === v ? 'var(--neon-border)' : 'var(--border)'}`,
                    color: buffer === v ? 'var(--neon)' : 'var(--txt2)',
                    transition: 'all 0.15s',
                  }}>
                  {formatMXN(v)}
                </button>
              ))}
            </div>

            <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: 'Total en cuentas',  value: formatMXN(totalMXN),    color: 'var(--txt)' },
                { label: 'Colchón reservado', value: `- ${formatMXN(buffer)}`, color: 'var(--blue)' },
                { label: 'Liquidez ociosa',   value: formatMXN(idleMXN),     color: idleMXN > 0 ? 'var(--amber)' : 'var(--txt3)', divider: true },
              ].map(({ label, value, color, divider }) => (
                <div key={label}>
                  {divider && <div style={{ height: 1, background: 'var(--border)', margin: '0.25rem 0' }} />}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projection + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <TrendingUp size={16} color="var(--txt3)" />
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--txt)' }}>Proyección de rendimiento</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Liquidez a convertir',   value: formatMXN(idleMXN),                              color: 'var(--txt)' },
                  { label: 'USDC estimado',           value: `$${idleUSDC.toFixed(2)} USDC`,                  color: 'var(--txt)' },
                  { label: 'APY actual',              value: `${MOCK_WALLET.current_apy}%`,                   color: 'var(--neon)' },
                  { label: 'Rendimiento diario est.', value: `+$${estimatedDailyUSD.toFixed(4)} USD`,         color: 'var(--neon)' },
                  { label: 'Rendimiento anual est.',  value: `+$${estimatedYearlyUSD.toFixed(2)} USD`,        color: 'var(--neon)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--txt3)' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setStep('confirming')} disabled={idleMXN < 100} className="btn-neon"
              style={{ width: '100%', height: 52, border: 'none', borderRadius: 14, fontSize: 15, cursor: idleMXN < 100 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {idleMXN < 100
                ? 'Sin liquidez ociosa para convertir'
                : <><span>Convertir {formatMXN(idleMXN)} ahora</span><ArrowRight size={16} /></>
              }
            </button>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.875rem 1rem' }}>
              <p style={{ fontSize: 12, color: 'var(--txt3)', textAlign: 'center' }}>
                🔒 Tu capital permanece bajo tu control en todo momento. La conversión se puede revertir cuando lo necesites.
              </p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (min-width: 768px) {
          .treasury-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function formatMXN(n: number) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n) }
