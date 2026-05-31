import { createSupabaseAdminClient } from '@/lib/supabase'
import SignalFeed from '@/components/signal/SignalFeed'
import { format } from 'date-fns'

export const revalidate = 300 // 5 minutes

async function getSignals() {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('signals')
    .select('*, subnets(subnet_number, name, slug)')
    .eq('status', 'published')
    .order('signal_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)
  return data ?? []
}

export default async function SignalPage() {
  const signals = await getSignals()
  const today = format(new Date(), 'EEEE, MMMM d')

  // Group by date
  const byDate: Record<string, typeof signals> = {}
  for (const signal of signals) {
    const d = signal.signal_date
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(signal)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="section-label mb-2">Daily Intelligence</div>
        <h1 className="text-3xl font-mono font-bold text-text-primary mb-2">
          TAO Signal
        </h1>
        <p className="text-text-secondary">
          What matters in the Bittensor ecosystem today. Updated daily by The Nerds.
        </p>
      </div>

      {signals.length === 0 ? (
        <div className="card p-12 text-center font-mono text-text-muted">
          No signals published yet. Check back soon.
        </div>
      ) : (
        <SignalFeed signalsByDate={byDate} />
      )}
    </div>
  )
}
