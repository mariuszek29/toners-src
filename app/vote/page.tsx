import { createSupabaseAdminClient } from '@/lib/supabase'
import VoteBoard from '@/components/voting/VoteBoard'

export const revalidate = 60

async function getVoteData() {
  const supabase = createSupabaseAdminClient()

  const [subnetsRes, snapshotsRes] = await Promise.all([
    supabase
      .from('subnets')
      .select('id, subnet_number, name, slug, category, nerds_score')
      .eq('status', 'active')
      .order('subnet_number'),
    supabase
      .from('vote_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: false }),
  ])

  // Latest snapshot per subnet
  const latestSnapshots: Record<string, any> = {}
  for (const snap of snapshotsRes.data ?? []) {
    if (!latestSnapshots[snap.subnet_id]) {
      latestSnapshots[snap.subnet_id] = snap
    }
  }

  return {
    subnets: subnetsRes.data ?? [],
    snapshots: latestSnapshots,
  }
}

export default async function VotePage() {
  const { subnets, snapshots } = await getVoteData()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="section-label mb-2">Community Intelligence</div>
        <h1 className="text-3xl font-mono font-bold text-text-primary mb-2">
          Community Vote
        </h1>
        <p className="text-text-secondary">
          Bullish, neutral, or bearish? Rate subnets. One vote per subnet. Your conviction shapes the Nerds score.
        </p>
      </div>
      <VoteBoard subnets={subnets} snapshots={snapshots} />
    </div>
  )
}
