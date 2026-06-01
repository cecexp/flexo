import { NextResponse } from 'next/server'
import { syncBelvoAccount } from '@/lib/belvo/client'

export async function POST(req: Request) {
  try {
    const { linkId } = await req.json()
    const accounts = await syncBelvoAccount(linkId || 'mock-link')
    return NextResponse.json({ success: true, accounts })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 })
  }
}
