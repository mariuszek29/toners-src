import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { createSupabaseAdminClient } from '@/lib/supabase'

export const revalidate = 60

export default async function AMADetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient()
  const { data: ama } = await supabase
    .from('amas')
    .select(`
      *,
      subnets (subnet_number, name, slug, category),
      founders (id, name, handle, avatar_url)
    `)
    .eq('id', params.id)
    .eq('draft_status', 'published')
    .maybeSingle()

  if (!ama) notFound()

  const quotes = Array.isArray(ama.published_quote_highlights) ? ama.published_quote_highlights as any[] : []

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="section-label mb-2">
          AMA Recap
          {ama.subnets && <> · SN{(ama.subnets as any).subnet_number} · {(ama.subnets as any).category}</>}
        </div>
        <h1 className="text-3xl font-mono font-bold text-text-primary leading-tight">{ama.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono text-text-muted">
          {ama.founders && <span>{(ama.founders as any).name}</span>}
          {ama.ama_date && <span>{format(new Date(`${ama.ama_date}T00:00:00`), 'MMM d, yyyy')}</span>}
          {ama.subnets && (
            <Link href={`/intelligence/${(ama.subnets as any).slug}`} className="text-accent-amber hover:underline">
              View subnet
            </Link>
          )}
        </div>
      </div>

      {ama.published_recap && (
        <section className="card p-6 mb-6">
          <div className="section-label mb-3">Full Recap</div>
          <div className="space-y-4 text-text-secondary leading-relaxed">
            {ama.published_recap.split('\n').filter(Boolean).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {quotes.length > 0 && (
        <section className="card p-6 mb-6">
          <div className="section-label mb-3">Quote Highlights</div>
          <div className="flex flex-col gap-4">
            {quotes.map((item, index) => (
              <blockquote key={index} className="border-l-2 border-accent-amber/60 pl-4">
                <p className="text-text-primary">"{item.quote}"</p>
                {item.context && <footer className="mt-2 text-sm text-text-muted">{item.context}</footer>}
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {ama.published_what_changed && (
        <section className="card p-6">
          <div className="section-label mb-3">What Changed</div>
          <p className="text-text-secondary leading-relaxed">{ama.published_what_changed}</p>
        </section>
      )}
    </article>
  )
}
