import { createSupabaseAdminClient } from '@/lib/supabase'
import SubnetIndex from '@/components/subnet/SubnetIndex'
import StatsBar from '@/components/subnet/StatsBar'

export const revalidate = 60 // revalidate every 60 seconds

async function getSubnets() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('subnets')
    .select(`
      *,
      founders (id, name, handle, avatar_url),
      amas (id, ama_date, draft_status)
    `)
    .eq('status', 'active')
    .order('subnet_number', { ascending: true })

  if (error) {
    console.error('Error fetching subnets:', error)
    return []
  }
  return (data ?? []) as any[]
}

export default async function IntelligencePage() {
  const subnets = await getSubnets()

  const stats = {
    total: subnets.length,
    categories: [...new Set(subnets.map(s => s.category).filter(Boolean))].length,
    amasCompleted: subnets.reduce((acc, s) => {
      const published = (s.amas as any[])?.filter(a => a.draft_status === 'published').length ?? 0
      return acc + published
    }, 0),
    lastAdded: subnets.at(-1)?.name ?? '—',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-10">
        <div className="section-label mb-3">Subnet Intelligence Terminal</div>
        <h1 className="text-3xl sm:text-4xl font-mono font-bold text-text-primary mb-3">
          Every Bittensor subnet.<br />
          <span className="text-accent-green">One place.</span>
        </h1>
        <p className="text-text-secondary max-w-xl">
          Community-powered ratings, founder AMAs, emissions data, and daily signals —
          built by The Nerds for serious TAO investors.
        </p>
      </div>

      {/* Stats bar */}
      <StatsBar stats={stats} />

      {/* Subnet index table */}
      <SubnetIndex subnets={subnets} />
    </div>
  )
}
