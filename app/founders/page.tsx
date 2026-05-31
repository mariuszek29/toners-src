import { createSupabaseAdminClient } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

async function getFounders() {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('founders')
    .select(`*, subnets(subnet_number, name, slug)`)
    .order('name')
  return data ?? []
}

export default async function FoundersPage() {
  const founders = await getFounders()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="section-label mb-2">Founder Intelligence</div>
        <h1 className="text-3xl font-mono font-bold text-text-primary mb-2">
          Subnet Founders
        </h1>
        <p className="text-text-secondary">
          The people building Bittensor. Background, credibility signals, AMA history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {founders.length === 0 && (
          <div className="col-span-full card p-12 text-center font-mono text-text-muted">
            No founders added yet.
          </div>
        )}
        {founders.map((founder: any) => (
          <div key={founder.id} className="card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {founder.avatar_url ? (
                <img src={founder.avatar_url} alt={founder.name} className="w-12 h-12 rounded-full border border-bg-border" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-bg-elevated border border-bg-border flex items-center justify-center font-mono text-text-muted text-lg">
                  {founder.name[0]}
                </div>
              )}
              <div>
                <Link href={`/founders/${founder.id}`} className="font-mono font-bold text-text-primary hover:text-accent-amber transition-colors">
                  {founder.name}
                </Link>
                {founder.handle && (
                  <a href={`https://x.com/${founder.handle.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-mono text-text-muted hover:text-accent-green transition-colors">
                    {founder.handle}
                  </a>
                )}
              </div>
            </div>

            {founder.subnets && (
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(founder.subnets) ? founder.subnets : [founder.subnets]).map((s: any) => (
                  <Link key={s.subnet_number} href={`/intelligence/${s.slug}`}
                    className="text-xs font-mono text-accent-green border border-accent-green/30 px-2 py-0.5 rounded hover:bg-accent-green/10 transition-colors">
                    SN{s.subnet_number} · {s.name}
                  </Link>
                ))}
              </div>
            )}

            {founder.bio && (
              <p className="text-sm text-text-secondary leading-relaxed">{founder.bio}</p>
            )}

            {founder.past_experience && (
              <div>
                <div className="section-label mb-1">Background</div>
                <p className="text-sm text-text-muted">{founder.past_experience}</p>
              </div>
            )}

            {founder.credibility_signals && (
              <div>
                <div className="section-label mb-1">Credibility</div>
                <p className="text-sm text-text-muted">{founder.credibility_signals}</p>
              </div>
            )}

            {founder.open_concerns && (
              <div>
                <div className="section-label mb-1">Open Concerns</div>
                <p className="text-sm text-accent-red/80">{founder.open_concerns}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
