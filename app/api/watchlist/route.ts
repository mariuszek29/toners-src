import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getBearerUser } from '@/lib/server-auth'

// GET /api/watchlist — get current user's watchlist
export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const user = await getBearerUser(req)

    const { data } = await supabase
      .from('watchlists')
      .select('*, subnets(subnet_number, name, slug, category, nerds_score, alpha_price_usd, apy_percent)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ watchlist: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 })
  }
}

// POST /api/watchlist — add or remove a subnet
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const user = await getBearerUser(req)
    const { subnetId, action } = await req.json() // action: 'add' | 'remove'

    if (!subnetId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    if (action === 'remove') {
      await supabase.from('watchlists').delete().match({ user_id: user.id, subnet_id: subnetId })
      return NextResponse.json({ success: true, action: 'removed' })
    }

    const { error } = await supabase
      .from('watchlists')
      .upsert({ user_id: user.id, subnet_id: subnetId }, { onConflict: 'user_id,subnet_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, action: 'added' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 })
  }
}
