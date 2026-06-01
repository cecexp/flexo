// ============================================================
// BELVO CLIENT — Mock para desarrollo
// En producción: usar credenciales reales de Belvo Sandbox
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

// Mock de cuentas bancarias como las devuelve Belvo
export const MOCK_BELVO_ACCOUNTS: BelvoAccount[] = [
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

export const MOCK_BELVO_TRANSACTIONS: BelvoTransaction[] = [
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
  {
    id: 'belvo-tx-003',
    account: 'belvo-acc-001',
    amount: 280000,
    currency: 'MXN',
    description: 'SPEI RECIBIDO - DISTRIBUIDOR XYZ',
    merchant: null,
    reference: 'SPEI202501130001',
    status: 'PROCESSED',
    type: 'INFLOW',
    value_date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    accounting_date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
]

// Simula llamada a API de Belvo
export async function fetchBelvoAccounts(): Promise<BelvoAccount[]> {
  await new Promise(r => setTimeout(r, 800))
  return MOCK_BELVO_ACCOUNTS
}

export async function fetchBelvoTransactions(accountId: string): Promise<BelvoTransaction[]> {
  await new Promise(r => setTimeout(r, 600))
  return MOCK_BELVO_TRANSACTIONS.filter(tx => tx.account === accountId)
}

export async function syncBelvoAccount(linkId: string): Promise<BelvoAccount[]> {
  await new Promise(r => setTimeout(r, 1200))
  // Simular balance actualizado con pequeña variación
  return MOCK_BELVO_ACCOUNTS.map(acc => ({
    ...acc,
    balance: {
      current: acc.balance.current + Math.floor(Math.random() * 10000 - 5000),
      available: acc.balance.available + Math.floor(Math.random() * 10000 - 5000),
    },
    last_accessed_at: new Date().toISOString(),
  }))
}
