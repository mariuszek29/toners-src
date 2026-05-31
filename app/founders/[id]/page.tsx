import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'

export const revalidate = 60

export default async function FounderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient()
  const { data: founder } = await supabase
    .from('founders')
    .select(`
      *,
      subnets (id, subnet_number, name, slug, category, thesis, nerds_score),
      amas (id, title, ama_date, draft_status, published_recap)
    `)
    .eq('id', params.id)
    .maybeSingle()

  if (!founder) notFound()

  const subnets = Array.isArray((founder as any).subnets) ? (founder as any).subnets : ((founder as any).subnets ? [(founder as any).subnets] : [])
  const amas = ((founder as any).amas ?? []).filter((ama: any) => ama.draft_status === 'published')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center gap-4">
        {founder.avatar_url ? (
          <img src={founder.avatar_url} alt={founder.name} className="h-16 w-16 rounded-full border border-bg-border" />
        ) : (
          <div className="h-16 w-16 rounded-full border border-bg-border bg-bg-elevated flex items-center justify-center font-mono text-2xl text-text-muted">
            {founder.name[0]}
          </div>
        )}
        <div>
          <div className="section-label mb-1">Founder Profile</div>
          <h1 className="text-3xl font-mono font-bold text-text-primary">{founder.name}</h1>
          {founder.handle && (
            <a href={`https://x.com/${founder.handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-accent-amber hover:underline">
              {founder.handle}
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 flex flex-col gap-4">
          <div className="card p-5">
            <div className="section-label mb-2">Bio</div>
            <p className="text-text-secondary leading-relaxed">{founder.bio ?? 'No bio written yet.'}</p>
          </div>
          <div className="card p-5">
            <div className="section-label mb-2">Background</div>
            <p className="text-text-secondary leading-relaxed">{founder.past_experience ?? '-'}</p>
          </div>
          <div className="card p-5">
            <div className="section-label mb-2">Credibility Signals</div>
            <p className="text-text-secondary leading-relaxed">{founder.credibility_signals ?? '-'}</p>
          </div>
          <div className="card p-5">
            <div className="section-label mb-2">Open Concerns</div>
            <p className="text-accent-red/80 leading-relaxed">{founder.open_concerns ?? '-'}</p>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="card p-5">
            <div className="section-label mb-3">Subnets</div>
            <div className="flex flex-col gap-3">
              {subnets.length === 0 && <p className="text-sm text-text-muted">No subnets linked.</p>}
              {subnets.map((subnet: any) => (
                <Link key={subnet.id} href={`/intelligence/${subnet.slug}`} className="rounded border border-bg-border p-3 transition-colors hover:border-accent-amber/50">
                  <div className="font-mono font-bold text-text-primary">SN{subnet.subnet_number} · {subnet.name}</div>
                  <div className="mt-1 text-xs font-mono text-text-muted">{subnet.category ?? 'Uncategorized'}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="section-label mb-3">Published AMAs</div>
            <div className="flex flex-col gap-3">
              {amas.length === 0 && <p className="text-sm text-text-muted">No published AMAs yet.</p>}
              {amas.map((ama: any) => (
                <Link key={ama.id} href={`/amas/${ama.id}`} className="rounded border border-bg-border p-3 transition-colors hover:border-accent-amber/50">
                  <div className="font-mono text-sm font-semibold text-text-primary">{ama.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
