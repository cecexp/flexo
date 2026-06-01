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

  const totalMXN = MOCK_BANK_ACCOUNTS.reduce((a, b) => a +available_balance, 0)
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Nav />

      {step !== 'idle' && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md">
            {step === 'confirming' && (
              <>
                <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">Confirmar conversión</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Estás a punto de convertir tu liquidez ociosa a USDC para generar rendimiento.</p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 flex flex-col gap-3">
                  {[
                    { label: 'Monto a convertir', value: formatMXN(idleMXN), color: 'text-gray-900 dark:text-white' },
                    { label: 'Recibirás aprox.', value: `$${idleUSDC.toFixed(2)} USDC`, color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Tipo de cambio', value: `$${ticker?.last.toFixed(4)} MXN/USDC`, color: 'text-gray-900 dark:text-white' },
                    { label: 'Comisión estimada', value: formatMXN(idleMXN * 0.005), color: 'text-gray-900 dark:text-white' },
                    { label: 'APY estimado', value: `${MOCK_WALLET.current_apy}%`, color: 'text-emerald-600 dark:text-emerald-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-400 dark:text-gray-400 text-sm">{label}</span>
                      <span className={`text-sm font-medium ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={reset} className="flex-1 h-11 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:border-gray-900 dark:hover:border-gray-600 transition-colors">Cancelar</button>
                  <button onClick={handleConfirm} className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition-colors">Confirmar</button>
                </div>
              </>
            )}

            {(step === 'converting' || step === 'depositing') && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-gray-900 dark:text-white font-semibold mb-1">
                    {step === 'converting' ? 'Convirtiendo MXN a USDC...' : 'Depositando en protocolo...'}
                  </p>
                  <p className="text-gray-400 dark:text-gray-400 text-sm">
                    {step === 'converting' ? 'Ejecutando orden en Bitso Business' : 'Depositando USDC de forma segura'}
                  </p>
                </div>
                <div className="w-full flex flex-col gap-2">
                  {[
                    { label: 'Conversión MXN → USDC', done: step === 'depositing' || step === 'done' },
                    { label: 'Depósito en protocolo', done: step === 'done' },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2">
                      {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 border-2 border-gray-200 dark:border-gray-700 rounded-full" />}
                      <span className={`text-sm ${done ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'done' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="text-gray-900 dark:text-white font-bold text-lg mb-1">¡Listo!</p>
                  <p className="text-gray-400 dark:text-gray-400 text-sm">Tu liquidez ya está generando rendimiento.</p>
                </div>
                {order && (
                  <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-2">
                    {[
                      { label: 'Convertido', value: formatMXN(order.amount_mxn), c-gray-900 dark:text-white' },
                      { label: 'USDC depositados', value: `$${order.amount_usdc.toFixed(2)} USDC`, color: 'text-emerald-600 dark:text-emerald-400' },
                      { label: 'Rendimiento/día est.', value: `+$${(order.amount_usdc * MOCK_WALLET.current_apy / 100 / 365).toFixed(4)} USD`, color: 'text-emerald-600 dark:text-emerald-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-400 dark:text-gray-400 text-sm">{label}</span>
                        <span className={`text-sm font-semibold ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={reset} className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition-colors">Volver a tesorería</button>
              </div>
            )}

            {step === 'error' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <p className="text-gray-900 dark:text-white font-semibold">{error}</p>
                <button onClick={reset} className="w-full h-11 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm transition-colors">Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Automatización de tesorería</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Configura tu colchón de seguridad y convierte tu liquidez ociosa en rendimiento.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">Colchón de seguridad</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Define cuánto MXN mantener siempre disponible en tus cuentas.</p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Monto del colchón (MXN)</label>
              <input type="number" value={bufferInput}
                onChange={e => { setBufferInput(e.target.value); setBuffer(Number(e.target.value)) }}
                className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[50000, 100000, 200000, 500000].map(v => (
                <button key={v} onClick={() => { setBuffer(v); setBufferInput(String(v)) }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${buffer === v
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white'}`}>
                  {formatMXN(v)}
                </button>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-2">
              {[
                { label: 'Total en cuentas', value: formatMXN(totalMXN), color: 'text-gray-900 dark:text-white' },
                { label: 'Colchón reservado', value: `- ${formatMXN(buffer)}`, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Liquidez ociosa', value: formatMXN(idleMXN), color: idleMXN > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500', divider: true },
              ].map(({ label, value, color, divider }) => (
                <div key={label}>
                  {divider && <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />}
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 text-xs">{label}</span>
                    <span className={`text-xs font-semibold ${color}`}>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">Proyección de rendimiento</span>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Liquidez a convertir', value: formatMXN(idleMXN), color: 'text-gray-900 dark:text-white' },
                  { label: 'USDC estimado', value: `$${iFixed(2)} USDC`, color: 'text-gray-900 dark:text-white' },
                  { label: 'APY actual', value: `${MOCK_WALLET.current_apy}%`, color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Rendimiento diario est.', value: `+$${estimatedDailyUSD.toFixed(4)} USD`, color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Rendimiento anual est.', value: `+$${estimatedYearlyUSD.toFixed(2)} USD`, color: 'text-emerald-600 dark:text-emerald-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 text-sm">{label}</span>
                    <span className={`text-sm font-medium ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setStep('confirming')} disabled={idleMXN < 100}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              {idleMXN < 100 ? 'Sin liquidez ociosa para convertir' : <>Convertir {formatMXN(idleMXN)} ahora <ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <p className="text-gray-400 dark:text-gray-400 text-xs text-center">
                🔒 Tu capital permanece bajo tu control en todo momento. La conversión se puede revertir cuando lo necesites.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function formatMXN(n: number) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n) }
