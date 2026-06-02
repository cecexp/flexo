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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--neon)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ fontSize: 14, color: 'var(--txt2)' }}>Sincronizando cuentas...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav onSync={loadData} />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }} className="animate-fade-up">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--txt)', letterSpacing: '-0.025em', marginBottom: '0.3rem' }}>
            Cuentas bancarias
          </h1>
          <p style={{ fontSize: 14, color: 'var(--txt3)' }}>Sincronizadas en tiempo real via Open Banking</p>
        </div>

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="accounts-grid">
          
          {/* Column: Accounts & Transactions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Bank Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {accounts.map(acc => (
                <div 
                  key={acc.id} 
                  onClick={() => handleSelectAccount(acc.id)} 
                  className="card"
                  style={{
                    padding: '1.5rem', 
                    cursor: 'pointer',
                    background: 'var(--bg2)',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: selectedAccount === acc.id ? 'var(--neon)' : 'var(--border)',
                    boxShadow: selectedAccount === acc.id ? '0 0 20px rgba(0, 255, 136, 0.15)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: 44, height: 44, borderRadius: 12, 
                        background: 'var(--bg3)', border: '1px solid var(--border)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--neon)' }}>{acc.institution.name.slice(0, 2)}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--txt)' }}>{acc.institution.name}</p>
                        <p style={{ fontSize: 13, color: 'var(--txt3)' }}>{acc.name} · {acc.number}</p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                      background: acc.status === 'VALID' ? 'var(--neon-muted)' : 'rgba(204,42,64,0.08)',
                      color: acc.status === 'VALID' ? 'var(--neon)' : 'var(--red)',
                      border: `1px solid ${acc.status === 'VALID' ? 'var(--neon-border)' : 'rgba(204,42,64,0.2)'}`,
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {acc.status === 'VALID' ? 'Activa' : 'Error'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', paddingLeft: '0.25rem' }}>
                    {[['Saldo actual', acc.balance.current], ['Disponible', acc.balance.available]].map(([label, val]) => (
                      <div key={label as string}>
                        <p style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: '0.4rem', fontWeight: 500 }}>{label}</p>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--txt)', letterSpacing: '-0.02em' }}>
                          {formatMXN(val as number)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    Última sincronización: {new Date(acc.last_accessed_at).toLocaleTimeString('es-MX')}
                  </p>
                </div>
              ))}
            </div>

            {/* Transactions List */}
            {transactions.length > 0 && (
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>Movimientos recientes</p>
                  <p style={{ fontSize: 12, color: 'var(--txt3)', marginTop: '0.15rem' }}>
                    {accounts.find(a => a.id === selectedAccount)?.institution.name}
                  </p>
                </div>
                {transactions.map((tx, i) => (
                  <div key={tx.id} style={{
                    padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: tx.type === 'INFLOW' ? 'var(--neon-muted)' : 'rgba(204,42,64,0.07)',
                      border: `1px solid ${tx.type === 'INFLOW' ? 'var(--neon-border)' : 'rgba(204,42,64,0.18)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {tx.type === 'INFLOW' ? <ArrowDownRight size={15} color="var(--neon)" /> : <ArrowUpRight size={15} color="var(--red)" />}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: 13, color: 'var(--txt)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</p>
                      <p style={{ fontSize: 11, color: 'var(--txt3)' }}>{new Date(tx.value_date).toLocaleDateString('es-MX')} · Ref: {tx.reference.slice(-6)}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, flexShrink: 0, color: tx.amount > 0 ? 'var(--neon)' : 'var(--red)' }}>
                      {tx.amount > 0 ? '+' : ''}{formatMXN(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="accounts-sidebar">
            {virtualAccount && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', marginBottom: '0.25rem' }}>CLABE para recibir fondos</p>
                <p style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: '1rem' }}>Envía un SPEI a esta CLABE para depositar en Fluxo</p>
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.875rem 1rem', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: '0.3rem' }}>CLABE interbancaria</p>
                  <p style={{ fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.08em', color: 'var(--txt)', fontWeight: 600 }}>{virtualAccount.clabe}</p>
                </div>
                <button onClick={copyClabe} style={{
                  width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: copied ? 'var(--neon-muted)' : 'var(--bg3)',
                  border: `1px solid ${copied ? 'var(--neon-border)' : 'var(--border)'}`,
                  borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  color: copied ? 'var(--neon)' : 'var(--txt2)',
                  transition: 'all 0.18s',
                }}>
                  {copied ? <><CheckCircle2 size={14} />¡Copiada!</> : <><Copy size={14} />Copiar CLABE</>}
                </button>
                <p style={{ fontSize: 11, color: 'var(--txt3)', textAlign: 'center', marginTop: '0.75rem' }}>Alias: {virtualAccount.alias}</p>
              </div>
            )}
{ticker && (
  <div 
    className="card" 
    style={{ 
      padding: '1.5rem',
      background: 'var(--bg2)', /* Fondo de tarjeta */
      border: '1px solid var(--border)', /* Línea de contorno sutil */
      borderRadius: '16px', /* Esquinas redondeadas modernas */
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s ease'
    }}
  >
    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', marginBottom: '1rem' }}>Tipo de cambio</p>
    
    <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: 'var(--txt)', letterSpacing: '-0.02em' }}>
        ${ticker.last.toFixed(4)}
      </p>
      <p style={{ fontSize: 13, color: 'var(--txt3)', marginTop: '0.25rem' }}>MXN por USDC</p>
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
      {[['Compra', ticker.bid.toFixed(4)], ['Venta', ticker.ask.toFixed(4)], ['Volumen', `${(ticker.volume / 1000).toFixed(0)}K`]].map(([label, val]) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: '0.3rem', fontWeight: 500 }}>{label}</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt)' }}>${val}</p>
        </div>
      ))}
    </div>
  </div>
)}
          </div>
        </div>
      </main>

      <style>{`
        @media (min-width: 1024px) {
          .accounts-grid { grid-template-columns: 1fr 300px !important; }
        }
      `}</style>
    </div>
  )
}

function formatMXN(n: number) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n) }