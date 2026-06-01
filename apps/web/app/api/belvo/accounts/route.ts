import { NextResponse } from 'next/server'
import { fetchBelvoAccounts } from '@/lib/belvo/client'

export async function GET() {
  try {
    const accounts = await fetchBelvoAccounts()
    return NextResponse.json({ success: true, accounts })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch accounts' }, { status: 500 })
  }
}
