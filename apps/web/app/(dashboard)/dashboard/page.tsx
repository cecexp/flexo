'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, TrendingUp, Building2, ArrowUpRight, ArrowDownRight, RefreshCw, LogOut, Shield, ChevronRight } from 'lucide-react'
import { getMockSession, clearMockSession } from '@/lib/mock/privy'
import { MOCK_WALLET, MOCK_BANK_ACCOUNTS, MOCK_TRANSACTIONS } from '@/lib/mock/data'
import ThemeToggle from '@/components/ui/theme-toggle'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const session = getMockSession()
    if (!session) { router.push('/login'); return }
    setUser(session)
  }, [router])

  async function handleSync() { setSyncing(true); await new Promise(r => setTimeout(r, 1200)); setSyncing(false) }

  if (!user) return null

  const totalMXN = MOCK_BANK_ACCOUNTS.reduce((a, b) => a + b.available_balance, 0)
  const totalIdleMXN = MOCK_BANK_ACCOUNTS.reduce((a, b) => a + b.idle_liquidity, 0)
  const exchangeRate = 17.01
  const totalMXNEquiv = totalMXN + (MOCK_WALLET.usdc_total * exchangeRate)

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 bg-gray-950 dark:bg-gray-950 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-white font-semibold text-sm">Fluxo</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: 'Dashboard', path: '/dashboard', active: true },
                { label: 'Cuentas', path: '/accounts' },
                { label: 'Tesorería', path: '/treasury' },
              ].map(({ label, path, active }) => (
                <button key={path} onClick={() => router.push(path)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${active
                    ? 'bg-gray-800 text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={handleSync} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <div className="w-px h-4 bg-gray-800" />
            <button onClick={() => { clearMockSession(); router.push('/login') }} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-gray-400 text-sm mb-0.5">{user.company}</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Buenos días, {user.name.split(' ')[0]} 👋</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Patrimonio total', value: formatMXN(totalMXNEquiv), sub: 'Bancario + rendimientos', trend: '+2.3%' },
            { label: 'Liquidez bancaria', value: formatMXN(totalMXN), sub: `${MOCK_BANK_ACCOUNTS.length} cuentas activas` },
            { label: 'Generando rendimiento', value: `$${MOCK_WALLET.usdc_total.toFixed(0)} USD`, sub: `${MOCK_WALLET.current_apy}% APY`, trend: '+8.2%' },
            { label: 'Rendimiento total', value: `$${MOCK_WALLET.yield_earned_total.toFixed(2)} USD`, sub: 'Acumulado', trend: `+$${(MOCK_WALLET.yield_earned_total / 30).toFixed(2)}/día` },
          ].map(({ label, value, sub, trend }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-3">{label}</p>
              <p className="text-white text-lg font-bold tracking-tight mb-0.5">{value}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-gray-500 text-xs truncate">{sub}</p>
                {trend && <span className="text-emerald-400 text-xs font-medium flex-shrink-0">{trend}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {totalIdleMXN > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-amber-400 text-sm font-medium">{formatMXN(totalIdleMXN)} sin generar rendimiento</p>
                  <p className="text-gray-500 text-xs mt-0.5">~${(totalIdleMXN / exchangeRate).toFixed(0)} USD por convertir</p>
                </div>
                <button onClick={() => router.push('/treasury')} className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex-shrink-0">
                  Convertir ahora
                </button>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-white font-medium text-sm">Cuentas bancarias</span>
                </div>
                <button onClick={() => router.push('/accounts')} className="text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
                  Ver todas <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {MOCK_BANK_ACCOUNTS.map((acc, i) => (
                <div key={acc.id} className={`px-5 py-3.5 flex items-center justify-between ${i < MOCK_BANK_ACCOUNTS.length - 1 ? 'border-b border-gray-800' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-xl flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-300">{acc.institution.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{acc.institution}</p>
                      <p className="text-gray-500 text-xs">{acc.account_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{formatMXN(acc.available_balance)}</p>
                    <p className={`text-xs ${acc.idle_liquidity > 0 ? 'text-amber-400' : 'text-gray-500'}`}>
                      {acc.idle_liquidity > 0 ? `${formatMXN(acc.idle_liquidity)} ocioso` : 'Sin ocioso'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
                <span className="text-white font-medium text-sm">Actividad reciente</span>
                <button className="text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
                  Ver todo <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {MOCK_TRANSACTIONS.map((tx, i) => (
                <div key={tx.id} className={`px-5 py-3 flex items-center gap-3 ${i < MOCK_TRANSACTIONS.length - 1 ? 'border-b border-gray-800' : ''}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'yield_earned' ? 'bg-emerald-500/10' :
                    tx.type === 'deposit' ? 'bg-blue-500/10' : 'bg-gray-800'}`}>
                    {tx.type === 'yield_earned' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> :
                     tx.type === 'deposit' ? <ArrowDownRight className="w-3.5 h-3.5 text-blue-400" /> :
                     <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{tx.description}</p>
                    <p className="text-gray-500 text-xs">{formatTime(tx.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-medium">
                      {tx.currency === 'MXN' ? formatMXN(tx.amount) : `$${tx.amount.toFixed(2)} ${tx.currency}`}
                    </p>
                    <p className="text-gray-500 text-xs">{formatStatus(tx.status)}</                </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-white font-medium text-sm">Rendimiento activo</span>
              </div>
              <div className="text-center py-3 border border-gray-800 rounded-xl mb-4">
                <p className="text-3xl font-bold text-emerald-400">{MOCK_WALLET.current_apy}%</p>
                <p className="text-gray-400 text-xs mt-0.5">APY estimado anual</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'En rendimiento', value: `$${MOCK_WALLET.usdc_in_protocol.toFixed(2)} USD` },
                  { label: 'Disponible', value: `$${MOCK_WALLET.usdc_balance.toFixed(2)} USD` },
                  { label: 'Total generado', value: `+$${MOCK_WALLET.yield_earned_total.toFixed(2)} USD`, green: true },
                ].map(({ label, value, green }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400 text-xs">{label}</span>
                    <span className={`text-xs font-medium ${green ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-white font-medium text-sm">Colchón de seguridad</span>
              </div>
              {MOCK_BANK_ACCOUNTS.map(acc => (
                <div key={acc.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-400 text-xs">{acc.institution}</span>
                    <span className="text-white text-xs font-medium">{formatMXN(acc.safety_buffer)}</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((acc.safety_buffer / acc.current_balance) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
              <button onClick={() => router.push('/treasury')} className="w-full mt-4 h-9 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-all">
                Configurar colchón
              </button>
            </div>
          </div>
        </div>
      </main>
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
