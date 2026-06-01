import { NextResponse } from 'next/server'
import { createBuyOrder } from '@/lib/bitso/client'

export async function POST(req: Request) {
  try {
    const { amount_mxn } = await req.json()
    if (!amount_mxn || amount_mxn < 100) {
      return NextResponse.json({ success: false, error: 'Monto mínimo: $100 MXN' }, { status: 400 })
    }
    const order = await createBuyOrder(amount_mxn)
    return NextResponse.json({ success: true, order })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Conversion failed' }, { status: 500 })
  }
}
