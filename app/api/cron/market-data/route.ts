/**
 * Cron route: refresh subnet market data from Taostats API
 * Schedule in netlify.toml: every 15 minutes
 *
 * Taostats API docs: https://api.taostats.io/docs
 */
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

const TAOSTATS_BASE = 'https://api.taostats.io/api'

interface TaostatsSubnet {
  netuid: number
  alpha_price: number
  market_cap: number
  apy: number
  emission: number // daily TAO emissions
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createSupabaseAdminClient()

    // Fetch all subnet market data from Taostats
    const res = await fetch(`${TAOSTATS_BASE}/subnet/latest/v1?limit=256`, {
      headers: {
        'Authorization': `Bearer ${process.env.TAOSTATS_API_KEY}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      throw new Error(`Taostats API error: ${res.status}`)
    }

    const json = await res.json()
    const subnetsData: TaostatsSubnet[] = json.data ?? json.subnets ?? []

    // Batch update our subnets
    let updated = 0
    for (const sn of subnetsData) {
      const { error } = await supabase
        .from('subnets')
        .update({
          alpha_price_usd: sn.alpha_price,
          market_cap_usd: sn.market_cap,
          apy_percent: sn.apy,
          emissions_daily: sn.emission,
          market_data_updated_at: new Date().toISOString(),
        })
        .eq('subnet_number', sn.netuid)

      if (!error) updated++
    }

    // Snapshot votes for trending (run daily)
    const hour = new Date().getUTCHours()
    if (hour === 0) {
      await snapshotVotes(supabase)
    }

    return NextResponse.json({
      success: true,
      updated,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Market data cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function snapshotVotes(supabase: ReturnType<typeof createSupabaseAdminClient>) {
  const today = new Date().toISOString().split('T')[0]

  // Get all subnets
  const { data: subnets } = await supabase.from('subnets').select('id')
  if (!subnets) return

  for (const subnet of subnets) {
    const { data: votes } = await supabase
      .from('votes')
      .select('sentiment, confidence')
      .eq('subnet_id', subnet.id)

    if (!votes || votes.length === 0) continue

    const bullish = votes.filter(v => v.sentiment === 'bullish').length
    const neutral = votes.filter(v => v.sentiment === 'neutral').length
    const bearish = votes.filter(v => v.sentiment === 'bearish').length
    const avgConf = votes.reduce((a, v) => a + v.confidence, 0) / votes.length
    const communityScore = Math.round((bullish / votes.length) * 100)

    await supabase.from('vote_snapshots').upsert({
      subnet_id: subnet.id,
      snapshot_date: today,
      bullish_count: bullish,
      neutral_count: neutral,
      bearish_count: bearish,
      avg_confidence: avgConf,
      community_score: communityScore,
    }, { onConflict: 'subnet_id,snapshot_date' })
  }
}
