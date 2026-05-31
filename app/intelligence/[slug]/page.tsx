import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'

export const revalidate = 60

function money(value: number | null) {
  if (!value) return '-'
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toFixed(0)}`
}

export default async function SubnetProfilePage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('subnets')
    .select(`
      *,
      founders (*),
      amas (id, title, ama_date, draft_status, published_recap, published_what_changed),
      vote_snapshots (*)
    `)
    .eq('slug', params.slug)
    .maybeSingle()

  const subnet = data as any
  if (!subnet) notFound()

  const publishedAmas = ((subnet.amas as any[]) ?? [])
    .filter(ama => ama.draft_status === 'published')
    .sort((a, b) => String(b.ama_date ?? '').localeCompare(String(a.ama_date ?? '')))

  const latestSnapshot = ((subnet.vote_snapshots as any[]) ?? [])
    .sort((a, b) => String(b.snapshot_date).localeCompare(String(a.snapshot_date)))[0]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="section-label mb-2">Subnet Profile</div>
          <h1 className="text-3xl font-mono font-bold text-text-primary">
            SN{subnet.subnet_number} · {subnet.name}
          </h1>
          <p className="mt-2 text-text-secondary max-w-2xl">{subnet.category ?? 'Uncategorized'}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {subnet.website_url && (
            <a href={subnet.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded border border-bg-border px-3 py-2 text-xs font-mono text-text-secondary transition-colors hover:border-accent-amber/50 hover:text-text-primary">
              Website <ExternalLink size={12} />
            </a>
          )}
          {subnet.github_url && (
            <a href={subnet.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded border border-bg-border px-3 py-2 text-xs font-mono text-text-secondary transition-colors hover:border-accent-amber/50 hover:text-text-primary">
              GitHub <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-bg-border rounded-lg overflow-hidden mb-8">
        {[
          { label: 'Nerds Score', value: subnet.nerds_score ?? '-' },
          { label: 'Community', value: latestSnapshot?.community_score ? `${latestSnapshot.community_score}%` : '-' },
          { label: 'Market Cap', value: money(subnet.market_cap_usd) },
          { label: 'Alpha', value: subnet.alpha_price_usd ? `$${subnet.alpha_price_usd.toFixed(4)}` : '-' },
          { label: 'APY', value: subnet.apy_percent ? `${subnet.apy_percent.toFixed(1)}%` : '-' },
        ].map(item => (
          <div key={item.label} className="bg-bg-surface px-4 py-4">
            <div className="section-label mb-1">{item.label}</div>
            <div className="font-mono text-lg font-bold text-text-primary">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 flex flex-col gap-4">
          <div className="card p-5">
            <div className="section-label mb-2">Thesis</div>
            <p className="text-text-secondary leading-relaxed">{subnet.thesis ?? 'No thesis written yet.'}</p>
          </div>

          <div className="card p-5">
            <div className="section-label mb-2">Recent Catalysts</div>
            <p className="text-text-secondary leading-relaxed">{subnet.recent_catalysts ?? '-'}</p>
          </div>

          <div className="card p-5">
            <div className="section-label mb-2">Key Risks</div>
            <p className="text-text-secondary leading-relaxed whitespace-pre-line">{subnet.risks ?? '-'}</p>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="card p-5">
            <div className="section-label mb-3">Founder</div>
            {subnet.founders ? (
              <div className="flex flex-col gap-3">
                <div className="font-mono font-bold text-text-primary">{(subnet.founders as any).name}</div>
                {(subnet.founders as any).handle && (
                  <a href={`https://x.com/${(subnet.founders as any).handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-accent-amber hover:underline">
                    {(subnet.founders as any).handle}
                  </a>
                )}
                {(subnet.founders as any).bio && <p className="text-sm text-text-secondary">{(subnet.founders as any).bio}</p>}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No founder linked yet.</p>
            )}
          </div>

          <div className="card p-5">
            <div className="section-label mb-3">AMA History</div>
            <div className="flex flex-col gap-3">
              {publishedAmas.length === 0 && <p className="text-sm text-text-muted">No published AMAs yet.</p>}
              {publishedAmas.map(ama => (
                <Link key={ama.id} href={`/amas/${ama.id}`} className="rounded border border-bg-border p-3 transition-colors hover:border-accent-amber/50">
                  <div className="font-mono text-sm font-semibold text-text-primary">{ama.title}</div>
                  {ama.ama_date && <div className="mt-1 text-xs font-mono text-text-muted">{format(new Date(`${ama.ama_date}T00:00:00`), 'MMM d, yyyy')}</div>}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
