import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { event_type, data } = payload

    if (event_type === 'SPEI_RECEIVED') {
      const { amount, reference, clabe_origin } = data
      console.log(`SPEI recibido: $${amount} MXN · Ref: ${reference}`)
      return NextResponse.json({ success: true, message: 'SPEI procesado' })
    }

    return NextResponse.json({ success: true, message: 'Evento ignorado' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Webhook error' }, { status: 500 })
  }
}
