import { NextResponse } from 'next/server'
import { createBuyOrder } from '@/lib/bitso/client'
import { createClient } from '@/lib/supabase/client'

export async function POST(req: Request) {
  try {
    const { amount_mxn, company_id } = await req.json()

    if (!amount_mxn || amount_mxn < 100) {
      return NextResponse.json({ success: false, error: 'Monto mínimo: $100 MXN' }, { status: 400 })
    }

    // Log 1: verificar env vars
    console.log('[convert] SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30))
    console.log('[convert] company_id:', company_id)

    const order = await createBuyOrder(amount_mxn)
    console.log('[convert] order:', order.id, order.status)

    // Insertar directo sin la capa de queries
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        company_id,
        type: 'conversion_buy',
        status: 'completed',
        amount: amount_mxn,
        currency: 'MXN',
        amount_usd: order.amount_usdc,
        exchange_rate: order.exchange_rate,
        fee: order.fee_mxn,
        description: 'Conversión automática de liquidez ociosa',
        external_id: order.id,
      })
      .select()

    console.log('[convert] insert data:', JSON.stringify(data))
    console.log('[convert] insert error:', JSON.stringify(error))

    return NextResponse.json({ success: true, order, db: { data, error } })
  } catch (err) {
    console.error('[convert] catch:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}