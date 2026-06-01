import { NextResponse } from 'next/server'
import { getTicker } from '@/lib/bitso/client'

export async function GET() {
  try {
    const ticker = await getTicker()
    return NextResponse.json({ success: true, ticker })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch ticker' }, { status: 500 })
  }
}
