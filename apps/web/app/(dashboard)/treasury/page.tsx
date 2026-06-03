'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, TrendingUp, ArrowRight, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import { getMockSession } from '@/lib/mock/privy'
import { MOCK_BANK_ACCOUNTS, MOCK_WALLET } from '@/lib/mock/data'
import { getTicker } from '@/lib/bitso/client'
import Nav from '@/components/ui/nav'
import { createClient } from '@/lib/supabase/client'

type Step = 'idle' | 'confirming' | 'converting' | 'depositing' | 'done' | 'error'

export default function TreasuryPage() {
  const router = useRouter()
  // SECCIÓN CORREGIDA: Declaración del estado del usuario
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
      if (!supabaseUser) { 
        router.push('/login')
        return 
      }
      setUser(supabaseUser)
    })
  }, [router])

  // Carga del precio actual para cálculos
  useEffect(() => {
    getTicker().then(setTicker).catch(() => setTicker({ last: 17.01 }))
  }, [])

  const totalMXN = MOCK_BANK_ACCOUNTS.reduce((a, b) => a + b.available_balance, 0)
  const idleMXN = Math.max(totalMXN - buffer, 0)
  const idleUSDC = ticker ? idleMXN / ticker.last : 0
  const estimatedYearlyUSD = idleUSDC * (MOCK_WALLET.current_apy / 100)
  const estimatedDailyUSD = estimatedYearlyUSD / 365

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />

      {step !== 'idle' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: '1rem', backdropFilter: 'blur(4px)',
        }}>
          <div className="card animate-fade-up" style={{ padding: '1.75rem', width: '100%', maxWidth: 420 }}>
            {step === 'confirming' && (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--txt)', marginBottom: '0.4rem' }}>Confirmar conversión</h3>
                <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--txt3)' }}>Monto a convertir</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>{formatMXN(idleMXN)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--txt3)' }}>Recibirás aprox.</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--neon)' }}>${idleUSDC.toFixed(2)} USDC</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={reset} style={{ flex: 1, height: 44, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={handleConfirm} className="btn-neon" style={{ flex: 1, height: 44, border: 'none', borderRadius: 12, cursor: 'pointer' }}>Confirmar</button>
                </div>
              </>
            )}

            {(step === 'converting' || step === 'depositing') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <Loader2 size={26} color="var(--neon)" className="animate-spin" />
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--txt)' }}>
                  {step === 'converting' ? 'Convirtiendo MXN a USDC...' : 'Depositando en protocolo...'}
                </p>
              </div>
            )}

            {step === 'done' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <CheckCircle2 size={26} color="var(--neon)" />
                <p style={{ fontWeight: 800, color: 'var(--txt)' }}>¡Conversión exitosa!</p>
                <button onClick={reset} className="btn-neon" style={{ width: '100%', height: 44, border: 'none', borderRadius: 12 }}>Volver</button>
              </div>
            )}

            {step === 'error' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <AlertTriangle size={26} color="var(--red)" />
                <p style={{ color: 'var(--txt)' }}>{error}</p>
                <button onClick={reset} style={{ width: '100%', height: 44, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12 }}>Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--txt)', marginBottom: '1.5rem' }}>Automatización de tesorería</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="treasury-grid">
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Shield size={16} color="var(--txt3)" />
              <span style={{ fontSize: 15, fontWeight: 600 }}>Colchón de seguridad</span>
            </div>
            <input type="number" value={bufferInput}
              onChange={e => { setBufferInput(e.target.value); setBuffer(Number(e.target.value)) }}
              style={{ width: '100%', height: 44, padding: '0 1rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--txt)' }}
            />
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
             <button onClick={() => setStep('confirming')} disabled={idleMXN < 100} className="btn-neon"
              style={{ width: '100%', height: 52, border: 'none', borderRadius: 14, cursor: idleMXN < 100 ? 'not-allowed' : 'pointer' }}>
              Convertir {formatMXN(idleMXN)} ahora
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @media (min-width: 768px) { .treasury-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </div>
  )
}

function formatMXN(n: number) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n) }