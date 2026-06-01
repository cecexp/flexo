'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, Copy, CheckCircle2 } from 'lucide-react'
import { getMockSession } from '@/lib/mock/privy'
import { fetchBelvoAccounts, fetchBelvoTransactions, type BelvoAccount, type BelvoTransaction } from '@/lib/belvo/client'
import { getVirtualAccount, getTicker, type BitsoVirtualAccount, type BitsoTicker } from '@/lib/bitso/client'
import Nav from '@/components/ui/nav'

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<BelvoAccount[]>([])
  const [transactions, setTransactions] = useState<BelvoTransaction[]>([])
  const [virtualAccount, setVirtualAccount] = useState<BitsoVirtualAccount | null>(null)
  const [ticker, setTicker] = useState<BitsoTicker | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getMockSession()
    if (!session) { router.push('/login'); return }
    loadData()
  }, [router])

  async function loadData() {
    setLoading(true)
    const [accs, va, tick] = await Promise.all([fetchBelvoAccounts(), getVirtualAccount(), getTicker()])
    setAccounts(accs); setVirtualAccount(va); setTicker(tick)
    if (accs.length > 0) {
      setSelectedAccount(accs[0].id)
      setTransactions(await fetchBelvoTransactions(accs[0].id))
    }
    setLoading(false)
  }

  async function handleSelectAccount(id: string) {
    setSelectedAccount(id)
    setTransactions(await fetchBelvoTransactions(id))
  }

  function copyClabe() {
    if (!virtualAccount) return
    navigator.clipboard.writeText(virtualAccount.clabe)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Sincronizando cuentas...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Nav onSync={loadData} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Cuentas bancarias</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Sincronizadas en tiempo real via Open Banking</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {accounts.map(acc => (
              <div key={acc.id} onClick={() => handleSelectAccount(acc.id)}
                className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 cursor-pointer transition-all ${selectedAccount === acc.id ? 'border-emerald-500/50' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{acc.institution.name.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">{acc.institution.name}</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs">{acc.name} · {acc.number}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${acc.status === 'VALID' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                    {acc.status === 'VALID' ? 'Activa' : 'Error'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[['Saldo actual', acc.balance.current], ['Disponible', acc.balance.available]].map(([label, val]) => (
                    <div key={label as string}>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mb-1">{label}</p>
                      <p className="text-gray-900 dark:text-white text-xl font-bold">{formatMXN(val as number)}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-400 dark:text-gray-600 text-xs mt-3">Última sync: {new Date(acc.last_accessed_at).toLocaleTimeString('es-MX')}</p>
              </div>
            ))}

            {transactions.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-gray-900 dark:text-white font-medium text-sm">Movimientos recientes</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{accounts.find(a => a.id === selectedAccount)?.institution.name}</p>
                </div>
                {transactions.map((tx, i) => (
                  <div key={tx.id} className={`px-5 py-3.5 flex items-center gap-3 ${i < transactions.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'INFLOW' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                      {tx.type === 'INFLOW' ? <ArrowDownRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white text-sm truncate">{tx.description}</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs">{new Date(tx.value_date).toLocaleDateString('es-MX')} · Ref: {tx.reference.slice(-6)}</p>
                    </div>
                    <p className={`text-sm font-semibold flex-shrink-0 ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatMXN(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {virtualAccount && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                <p className="text-gray-900 dark:text-white font-medium text-sm mb-1">CLABE para recibir fondos</p>
                <p className="text-gray-400 dark:text-gray-400 text-xs mb-4">Envía un SPEI a esta CLABE para depositar en Fluxo</p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-3">
                  <p className="text-gray-400 dark:text-gray-400 text-xs mb-1">CLABE interbancaria</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm tracking-wider">{virtualAccount.clabe}</p>
                </div>
                <button onClick={copyClabe} className="w-full h-10 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-emerald-500/50 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl text-sm transition-all">
                  {copied ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-emerald-500">¡Copiada!</span></> : <><Copy className="w-4 h-4" />Copiar CLABE</>}
                </button>
                <p className="text-gray-400 dark:text-gray-600 text-xs text-center mt-3">Alias: {virtualAccount.alias}</p>
              </div>
            )}

            {ticker && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                <p className="text-gray-900 dark:text-white font-medium text-sm mb-4">Tipo de cambio</p>
                <div className="text-center py-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">${ticker.last.toFixed(4)}</p>
                  <p className="text-gray-400 dark:text-gray-400 text-sm mt-1">MXN por USDC</p>
                </div>
                <div className="flex justify-between mt-4">
                  {[['Compra', ticker.bid.toFixed(4)], ['Venta', ticker.ask.toFixed(4)], ['Volumen', `${(ticker.volume / 1000).toFixed(0)}K`]].map(([label, val]) => (
                    <div key={label} className="text-center">
                      <p className="text-gray-400 dark:text-gray-500 text-xs">{label}</p>
                      <p className="text-gray-900 dark:text-white text-sm font-medium">${val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function formatMXN(n: number) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n) }
