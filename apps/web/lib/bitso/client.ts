// ============================================================
// BITSO BUSINESS CLIENT — Mock para desarrollo
// En producción: usar API Key y Secret de Bitso Business
// ============================================================

export interface BitsoVirtualAccount {
  id: string
  clabe: string
  status: 'active' | 'inactive'
  alias: string
  created_at: string
}

export interface BitsoOrder {
  id: string
  type: 'buy' | 'sell'
  status: 'open' | 'completed' | 'cancelled'
  amount_mxn: number
  amount_usdc: number
  exchange_rate: number
  fee_mxn: number
  created_at: string
  completed_at?: string
}

export interface BitsoTicker {
  pair: string
  last: number    // precio actual USDC/MXN
  bid: number
  ask: number
  volume: number
  created_at: string
}

// CLABE virtual mock para recibir SPEI
export const MOCK_VIRTUAL_ACCOUNT: BitsoVirtualAccount = {
  id: 'bitso-va-001',
  clabe: '646180157000000001',
  status: 'active',
  alias: 'Fluxo · Manufacturas del Norte',
  created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
}

export async function getVirtualAccount(): Promise<BitsoVirtualAccount> {
  await new Promise(r => setTimeout(r, 500))
  return MOCK_VIRTUAL_ACCOUNT
}

export async function getTicker(): Promise<BitsoTicker> {
  await new Promise(r => setTimeout(r, 300))
  // Simular pequeña variación en el tipo de cambio
  const base = 17.01
  const variation = (Math.random() - 0.5) * 0.1
  return {
    pair: 'USDCMXN',
    last: base + variation,
    bid: base + variation - 0.02,
    ask: base + variation + 0.02,
    volume: 1250000,
    created_at: new Date().toISOString(),
  }
}

export async function createBuyOrder(amountMXN: number): Promise<BitsoOrder> {
  await new Promise(r => setTimeout(r, 1500))
  const ticker = await getTicker()
  const fee = amountMXN * 0.005  // 0.5% fee
  const netMXN = amountMXN - fee
  const amountUSDC = netMXN / ticker.last

  return {
    id: `bitso-order-${Date.now()}`,
    type: 'buy',
    status: 'completed',
    amount_mxn: amountMXN,
    amount_usdc: amountUSDC,
    exchange_rate: ticker.last,
    fee_mxn: fee,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  }
}

export async function createSellOrder(amountUSDC: number): Promise<BitsoOrder> {
  await new Promise(r => setTimeout(r, 1500))
  const ticker = await getTicker()
  const amountMXN = amountUSDC * ticker.last
  const fee = amountMXN * 0.005

  return {
    id: `bitso-order-${Date.now()}`,
    type: 'sell',
    status: 'completed',
    amount_mxn: amountMXN - fee,
    amount_usdc: amountUSDC,
    exchange_rate: ticker.last,
    fee_mxn: fee,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  }
}
