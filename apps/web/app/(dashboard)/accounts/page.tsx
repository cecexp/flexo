'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, Copy, CheckCircle2 } from 'lucide-react'
import { fetchBelvoAccounts, fetchBelvoTransactions, type BelvoAccount, type BelvoTransaction } from '@/lib/belvo/client'
import { getVirtualAccount, getTicker, type BitsoVirtualAccount, type BitsoTicker } from '@/lib/bitso/client'
import { createClient } from '@/lib/supabase/client'
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
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      loadData()
    })
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

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem) clamp(0.75rem, 3vw, 1.5rem)' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '1.5rem' }} className="animate-fade-up">
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(20px, 5vw, 26px)',
            color: 'var(--txt)', letterSpacing: '-0.025em', marginBottom: '0.3rem',
          }}>
            Cuentas bancarias
          </h1>
          <p style={{ fontSize: 14, color: 'var(--txt3)' }}>Sincronizadas en tiempo real via Open Banking</p>
        </div>

        {/* ── Main grid ── */}
        <div className="accounts-grid">

          {/* ── Columna izquierda ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>

            {/* Tarjetas de cuentas */}
            {accounts.map(acc => (
              <div
                key={acc.id}
                onClick={() => handleSelectAccount(acc.id)}
                className="card"
                style={{
                  padding: 'clamp(1rem, 3vw, 1.5rem)',
                  cursor: 'pointer', background: 'var(--bg2)', borderRadius: 16,
                  border: '1px solid',
                  borderColor: selectedAccount === acc.id ? 'var(--neon)' : 'var(--border)',
                  boxShadow: selectedAccount === acc.id ? '0 0 20px rgba(0,255,136,0.15)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                  minWidth: 0,
                }}
              >
                {/* Header de la tarjeta */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--neon)' }}>{acc.institution.name.slice(0, 2)}</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.institution.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--txt3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name} · {acc.number}</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0,
                    background: acc.status === 'VALID' ? 'var(--neon-muted)' : 'rgba(204,42,64,0.08)',
                    color: acc.status === 'VALID' ? 'var(--neon)' : 'var(--red)',
                    border: `1px solid ${acc.status === 'VALID' ? 'var(--neon-border)' : 'rgba(204,42,64,0.2)'}`,
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                  }}>
                    {acc.status === 'VALID' ? 'Activa' : 'Error'}
                  </span>
                </div>

                {/* Saldos — 2 columnas en móvil también, pero con menos gap */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(1rem, 4vw, 2rem)', paddingLeft: '0.25rem' }}>
                  {([['Saldo actual', acc.balance.current], ['Disponible', acc.balance.available]] as [string, number][]).map(([label, val]) => (
                    <div key={label}>
                      <p style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: '0.4rem', fontWeight: 500 }}>{label}</p>
                      <p style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: 'clamp(18px, 4vw, 24px)',
                        color: 'var(--txt)', letterSpacing: '-0.02em',
                      }}>
                        {formatMXN(val)}
                      </p>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  Última sincronización: {new Date(acc.last_accessed_at).toLocaleTimeString('es-MX')}
                </p>
              </div>
            ))}

            {/* Movimientos recientes */}
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
                    padding: '0.875rem 1.25rem',
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none',
                    minWidth: 0,
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: tx.type === 'INFLOW' ? 'var(--neon-muted)' : 'rgba(204,42,64,0.07)',
                      border: `1px solid ${tx.type === 'INFLOW' ? 'var(--neon-border)' : 'rgba(204,42,64,0.18)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {tx.type === 'INFLOW'
                        ? <ArrowDownRight size={15} color="var(--neon)" />
                        : <ArrowUpRight size={15} color="var(--red)" />}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
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

          {/* ── Sidebar (arriba en móvil, derecha en desktop) ── */}
          <div className="accounts-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* CLABE */}
            {virtualAccount && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', marginBottom: '0.25rem' }}>CLABE para recibir fondos</p>
                <p style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: '1rem' }}>Envía un SPEI a esta CLABE para depositar en Fluxo</p>
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.875rem 1rem', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: '0.3rem' }}>CLABE interbancaria</p>
                  {/* Monospace con overflow-x scroll en pantallas muy pequeñas */}
                  <p style={{ fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.08em', color: 'var(--txt)', fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {virtualAccount.clabe}
                  </p>
                </div>
                <button onClick={copyClabe} style={{
                  width: '100%', height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: copied ? 'var(--neon-muted)' : 'var(--bg3)',
                  border: `1px solid ${copied ? 'var(--neon-border)' : 'var(--border)'}`,
                  borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  color: copied ? 'var(--neon)' : 'var(--txt2)', transition: 'all 0.18s',
                }}>
                  {copied ? <><CheckCircle2 size={14} />¡Copiada!</> : <><Copy size={14} />Copiar CLABE</>}
                </button>
                <p style={{ fontSize: 11, color: 'var(--txt3)', textAlign: 'center', marginTop: '0.75rem' }}>Alias: {virtualAccount.alias}</p>
              </div>
            )}

            {/* Tipo de cambio */}
            {ticker && (
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', marginBottom: '1rem' }}>Tipo de cambio</p>
                <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: 'clamp(24px, 5vw, 32px)',
                    color: 'var(--txt)', letterSpacing: '-0.02em',
                  }}>
                    ${ticker.last.toFixed(4)}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--txt3)', marginTop: '0.25rem' }}>MXN por USDC</p>
                </div>
                {/* Compra / Venta / Volumen en fila */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  {([['Compra', ticker.bid.toFixed(4)], ['Venta', ticker.ask.toFixed(4)], ['Volumen', `${(ticker.volume / 1000).toFixed(0)}K`]] as [string, string][]).map(([label, val]) => (
                    <div key={label} style={{ textAlign: 'center', flex: 1 }}>
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
        /* ── Móvil: 1 columna, sidebar arriba ── */
        .accounts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        .accounts-sidebar {
          order: -1;
        }

        /* ── Desktop: sidebar a la derecha ── */
        @media (min-width: 1024px) {
          .accounts-grid {
            grid-template-columns: 1fr 300px;
          }
          .accounts-sidebar {
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