import { createSupabaseAdminClient } from '@/lib/supabase'
import AMAArchive from '@/components/ama/AMAArchive'

export const revalidate = 60

async function getAMAs() {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('amas')
    .select(`
      *,
      subnets (subnet_number, name, slug, category),
      founders (name, handle, avatar_url)
    `)
    .eq('draft_status', 'published')
    .order('ama_date', { ascending: false })
  return data ?? []
}

export default async function AMAsPage() {
  const amas = await getAMAs()
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="section-label mb-3">AMA Archive</div>
        <h1 className="text-3xl font-mono font-bold text-text-primary mb-2">
          Founder Conversations
        </h1>
        <p className="text-text-secondary">
          Every AMA. Full write-ups, quote highlights, thesis updates.
        </p>
      </div>
      <AMAArchive amas={amas} />
    </div>
  )
}
