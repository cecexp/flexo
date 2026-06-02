'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, TrendingUp, RefreshCw, Filter } from 'lucide-react'
import { getMockSession } from '@/lib/mock/privy'
import { createClient } from '@/lib/supabase/client'
import Nav from '@/components/ui/nav'

const COMPANY_ID = '00000000-0000-0000-0000-000000000001'

type TxType = 'conversion_buy' | 'conversion_sell' | 'yield_earned' | 'yield_deposit' | 'deposit' | 'withdrawal'
type TxStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface Transaction {
  id: string
  type: TxType
  status: TxStatus
  amount: number
  currency: string
  amount_usd?: number
  exchange_rate?: number
  description: string
  external_id?: string
  created_at: string
}

type FilterType = 'all' | TxType

const FILTER_LABELS: Record<FilterType, string> = {
  all:             'Todos',
  conversion_buy:  'Conversiones',
  yield_earned:    'Rendimientos',
  yield_deposit:   'Depósitos protocolo',
  deposit:         'Depósitos SPEI',
  conversion_sell: 'Retiros',
  withdrawal:      'Retiros',
}

export default function TransactionsPage() {
  const router = useRouter()
  const [txs, setTxs] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('company_id', COMPANY_ID)
      .order('created_at', { ascending: false })
      .limit(50)
    setTxs(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const session = getMockSession()
    if (!session) { router.push('/login'); return }
    load()
  }, [router, load])

  const filtered = filter === 'all' ? txs : txs.filter(t => t.type === filter)

  const totalConvertido = txs.filter(t => t.type === 'conversion_buy').reduce((a, t) => a + t.amount, 0)
  const totalRendimiento = txs.filter(t => t.type === 'yield_earned').reduce((a, t) => a + t.amount, 0)
  const totalDepositado = txs.filter(t => t.type === 'deposit').reduce((a, t) => a + t.amount, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>

        <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div className="animate-fade-up">
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--txt)', letterSpacing: '-0.025em', marginBottom: '0.3rem' }}>
              Transacciones
            </h1>
            <p style={{ fontSize: 14, color: 'var(--txt3)' }}>🟢 Datos en tiempo real desde Supabase</p>
          </div>
          <button onClick={load} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 0.875rem', borderRadius: 10, fontSize: 13,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            color: 'var(--txt2)', cursor: 'pointer',
          }}>
            <RefreshCw size={13} />Actualizar
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }} className="animate-fade-up">
          {[
            { label: 'Total depositado',   value: formatMXN(totalDepositado),           color: 'var(--blue)'  },
            { label: 'Total convertido',   value: formatMXN(totalConvertido),           color: 'var(--amber)' },
            { label: 'Rendimiento ganado', value: `$${totalRendimiento.toFixed(4)} USDC`, color: 'var(--neon)'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ padding: '1rem 1.25rem' }}>
              <p style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: '0.4rem' }}>{label}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={14} color="var(--txt3)" />
          {(['all', 'conversion_buy', 'yield_earned', 'deposit'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: 13, cursor: 'pointer',
              fontWeight: filter === f ? 600 : 400,
              background: filter === f ? 'var(--neon-muted)' : 'var(--bg2)',
              border: `1px solid ${filter === f ? 'var(--neon-border)' : 'var(--border)'}`,
              color: filter === f ? 'var(--neon)' : 'var(--txt3)',
              transition: 'all 0.15s',
            }}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="card animate-fade-up" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--neon)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
              <span style={{ fontSize: 14, color: 'var(--txt3)' }}>Cargando...</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--txt3)' }}>
                {txs.length === 0 ? 'Aún no hay transacciones. Haz una conversión en Tesorería.' : 'Sin transacciones para este filtro.'}
              </p>
            </div>
          ) : filtered.map((tx, i) => {
            const meta = getTxMeta(tx.type)
            return (
              <div key={tx.id} style={{
                padding: '0.875rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: meta.bg, border: `1px solid ${meta.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <meta.Icon size={15} color={meta.color} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.description}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--txt3)' }}>
                    {formatRelTime(tx.created_at)}
                    {tx.exchange_rate ? ` · TC: $${Number(tx.exchange_rate).toFixed(4)}` : ''}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: meta.color }}>
                    {tx.currency === 'MXN' ? formatMXN(tx.amount) : `$${Number(tx.amount).toFixed(4)} ${tx.currency}`}
                  </p>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    background: tx.status === 'completed' ? 'var(--neon-muted)' : 'var(--bg3)',
                    color: tx.status === 'completed' ? 'var(--neon)' : 'var(--txt3)',
                    border: `1px solid ${tx.status === 'completed' ? 'var(--neon-border)' : 'var(--border)'}`,
                  }}>
                    {tx.status === 'completed' ? 'Completado' : tx.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {!loading && txs.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--txt3)', textAlign: 'center', marginTop: '1rem' }}>
            {filtered.length} transacciones
          </p>
        )}
      </main>
    </div>
  )
}

function getTxMeta(type: string) {
  const map: Record<string, { Icon: typeof TrendingUp; color: string; bg: string; border: string }> = {
    yield_earned:    { Icon: TrendingUp,     color: 'var(--neon)',  bg: 'var(--neon-muted)',       border: 'var(--neon-border)'         },
    yield_deposit:   { Icon: TrendingUp,     color: 'var(--neon)',  bg: 'var(--neon-muted)',       border: 'var(--neon-border)'         },
    conversion_buy:  { Icon: ArrowUpRight,   color: 'var(--amber)', bg: 'var(--amber-bg)',         border: 'var(--amber-border)'        },
    conversion_sell: { Icon: ArrowDownRight, color: 'var(--blue)',  bg: 'rgba(77,166,255,0.08)',   border: 'rgba(77,166,255,0.2)'       },
    deposit:         { Icon: ArrowDownRight, color: 'var(--blue)',  bg: 'rgba(77,166,255,0.08)',   border: 'rgba(77,166,255,0.2)'       },
    withdrawal:      { Icon: ArrowUpRight,   color: 'var(--red)',   bg: 'rgba(204,42,64,0.07)',    border: 'rgba(204,42,64,0.18)'       },
  }
  return map[type] ?? map['deposit']!
}

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

function formatRelTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}