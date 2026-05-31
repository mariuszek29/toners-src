'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Search } from 'lucide-react'
import { clsx } from 'clsx'

export default function AMAArchive({ amas }: { amas: any[] }) {
  const [search, setSearch] = useState('')

  const filtered = amas.filter(a => {
    const q = search.toLowerCase()
    return (
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.subnets?.name.toLowerCase().includes(q) ||
      a.founders?.name.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-bg-border rounded-lg overflow-hidden mb-8">
        {[
          { label: 'Total AMAs', value: amas.length },
          { label: 'With Full Write-Up', value: amas.filter(a => a.published_recap).length },
          { label: 'Latest AMA', value: amas[0]?.ama_date ? format(new Date(amas[0].ama_date), 'MMM d') : '—' },
          { label: 'Categories', value: Array.from(new Set(amas.map(a => a.subnets?.category).filter(Boolean))).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-bg-surface px-5 py-4">
            <div className="section-label mb-1">{label}</div>
            <div className="font-mono text-xl text-text-primary font-bold">{value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search AMAs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-bg-surface border border-bg-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 transition-colors"
        />
      </div>

      {/* AMA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 font-mono text-text-muted">
            No AMAs found
          </div>
        )}
        {filtered.map(ama => (
          <Link
            key={ama.id}
            href={`/amas/${ama.id}`}
            className="card-hover p-5 flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                {ama.subnets && (
                  <div className="section-label mb-1">
                    SN{ama.subnets.subnet_number} · {ama.subnets.category}
                  </div>
                )}
                <h3 className="font-mono font-bold text-text-primary leading-snug">
                  {ama.title}
                </h3>
              </div>
              {ama.founders?.avatar_url && (
                <img
                  src={ama.founders.avatar_url}
                  alt={ama.founders.name}
                  className="w-10 h-10 rounded-full border border-bg-border flex-shrink-0"
                />
              )}
            </div>

            {/* Founder + date */}
            <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
              {ama.founders && <span>{ama.founders.name}</span>}
              {ama.ama_date && (
                <>
                  <span>·</span>
                  <span>{format(new Date(ama.ama_date), 'MMM d, yyyy')}</span>
                </>
              )}
            </div>

            {/* Recap preview */}
            {ama.published_recap && (
              <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
                {ama.published_recap}
              </p>
            )}

            {/* Quote highlight preview */}
            {Array.isArray(ama.published_quote_highlights) && ama.published_quote_highlights.length > 0 && (
              <blockquote className="border-l-2 border-accent-green/40 pl-3 text-sm text-text-muted italic">
                "{(ama.published_quote_highlights[0] as any).quote}"
              </blockquote>
            )}

            <div className="text-xs font-mono text-accent-green mt-auto">
              Read full recap →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
