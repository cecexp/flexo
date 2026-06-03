// ============================================================
// BELVO CLIENT — Sandbox real
// ============================================================

export interface BelvoAccount {
  id: string
  link: string
  institution: { name: string; type: string }
  name: string
  number: string
  balance: { current: number; available: number }
  currency: string
  type: string
  status: string
  last_accessed_at: string
}

export interface BelvoTransaction {
  id: string
  account: string
  amount: number
  currency: string
  description: string
  merchant: { name: string } | null
  reference: string
  status: string
  type: string
  value_date: string
  accounting_date: string
}

async function belvoFetch(path: string, options?: RequestInit) {
  const id  = process.env.BELVO_SECRET_ID
  const pwd = process.env.BELVO_SECRET_PASSWORD
  const url = process.env.BELVO_URL ?? 'https://sandbox.belvo.com'

  if (!id || !pwd) throw new Error('Belvo credentials missing')

  const credentials = Buffer.from(`${id}:${pwd}`).toString('base64')

  const res = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Belvo ${res.status}: ${err}`)
  }

  return res.json()
}

// Crear un link de sandbox con una institución de prueba
export async function createSandboxLink(): Promise<string> {
  const data = await belvoFetch('/api/links/', {
    method: 'POST',
    body: JSON.stringify({
      institution: 'erebus_mx_retail',  // banco sandbox de Belvo para MX
      username: 'bnk_user_m',
      password: 'full',
      access_mode: 'single',
    }),
  })
  return data.id
}

export async function fetchBelvoAccounts(linkId?: string): Promise<BelvoAccount[]> {
  try {
    // Si no hay linkId, crear uno sandbox
    const id = linkId ?? await createSandboxLink()

    const data = await belvoFetch('/api/accounts/', {
      method: 'POST',
      body: JSON.stringify({
        link: id,
        save_data: true,
      }),
    })

    const accounts = Array.isArray(data) ? data : [data]

    return accounts.map((acc: any) => ({
      id: acc.id,
      link: acc.link,
      institution: {
        name: acc.institution?.name ?? 'Banco Sandbox',
        type: acc.institution?.type ?? 'bank',
      },
      name: acc.name ?? 'Cuenta',
      number: acc.number ?? '****0000',
      balance: {
        current:   acc.balance?.current   ?? acc.balance ?? 0,
        available: acc.balance?.available ?? acc.balance ?? 0,
      },
      currency: acc.currency ?? 'MXN',
      type: acc.type ?? 'CHECKING_ACCOUNT',
      status: acc.status ?? 'VALID',
      last_accessed_at: acc.last_accessed_at ?? new Date().toISOString(),
    }))
  } catch (err) {
    console.error('[Belvo] fetchAccounts error:', err)
    // Fallback a mock si Belvo falla
    return MOCK_BELVO_ACCOUNTS
  }
}

export async function fetchBelvoTransactions(
  accountId: string,
  linkId?: string
): Promise<BelvoTransaction[]> {
  try {
    const id = linkId ?? await createSandboxLink()
    const today = new Date().toISOString().split('T')[0]
    const from  = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const data = await belvoFetch('/api/transactions/', {
      method: 'POST',
      body: JSON.stringify({
        link: id,
        account: accountId,
        date_from: from,
        date_to: today,
        save_data: true,
      }),
    })

    const txs = Array.isArray(data) ? data : [data]

    return txs.map((tx: any) => ({
      id: tx.id,
      account: tx.account?.id ?? accountId,
      amount: Math.abs(tx.amount ?? 0),
      currency: tx.currency ?? 'MXN',
      description: tx.description ?? tx.reference ?? 'Movimiento',
      merchant: tx.merchant ? { name: tx.merchant.name } : null,
      reference: tx.reference ?? tx.id,
      status: tx.status ?? 'PROCESSED',
      type: (tx.amount ?? 0) >= 0 ? 'INFLOW' : 'OUTFLOW',
      value_date: tx.value_date ?? tx.accounting_date ?? new Date().toISOString(),
      accounting_date: tx.accounting_date ?? new Date().toISOString(),
    }))
  } catch (err) {
    console.error('[Belvo] fetchTransactions error:', err)
    return MOCK_BELVO_TRANSACTIONS.filter(tx => tx.account === accountId)
  }
}

export async function syncBelvoAccount(linkId: string): Promise<BelvoAccount[]> {
  return fetchBelvoAccounts(linkId)
}

// ── Fallback mock ─────────────────────────────────────────────
const MOCK_BELVO_ACCOUNTS: BelvoAccount[] = [
  {
    id: 'belvo-acc-001',
    link: 'belvo-link-bbva-001',
    institution: { name: 'BBVA México', type: 'bank' },
    name: 'Cuenta Operativa',
    number: '****4567',
    balance: { current: 850000, available: 850000 },
    currency: 'MXN',
    type: 'CHECKING_ACCOUNT',
    status: 'VALID',
    last_accessed_at: new Date().toISOString(),
  },
  {
    id: 'belvo-acc-002',
    link: 'belvo-link-banorte-001',
    institution: { name: 'Banorte', type: 'bank' },
    name: 'Cuenta Nómina',
    number: '****4568',
    balance: { current: 320000, available: 320000 },
    currency: 'MXN',
    type: 'CHECKING_ACCOUNT',
    status: 'VALID',
    last_accessed_at: new Date().toISOString(),
  },
]

const MOCK_BELVO_TRANSACTIONS: BelvoTransaction[] = [
  {
    id: 'belvo-tx-001',
    account: 'belvo-acc-001',
    amount: 150000,
    currency: 'MXN',
    description: 'SPEI RECIBIDO - CLIENTE ABC SA DE CV',
    merchant: null,
    reference: 'SPEI202501150001',
    status: 'PROCESSED',
    type: 'INFLOW',
    value_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    accounting_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'belvo-tx-002',
    account: 'belvo-acc-001',
    amount: -45000,
    currency: 'MXN',
    description: 'PAGO PROVEEDOR - INSUMOS NORTE SA',
    merchant: { name: 'Insumos Norte SA' },
    reference: 'SPEI202501140001',
    status: 'PROCESSED',
    type: 'OUTFLOW',
    value_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    accounting_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
]