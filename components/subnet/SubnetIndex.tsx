'use client'

import { Fragment, useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { clsx } from 'clsx'
import type { Subnet } from '@/types/database'

type SubnetWithRelations = Subnet & {
  founders: { id: string; name: string; handle: string | null; avatar_url: string | null } | null
  amas: { id: string; ama_date: string | null; draft_status: string }[]
}

function scoreClass(score: number | null) {
  if (score === null) return 'score-badge border-bg-border text-text-muted'
  if (score >= 70) return 'score-high'
  if (score >= 40) return 'score-mid'
  return 'score-low'
}

function subnetBadgeClass(subnetNumber: number) {
  const classes = [
    'border-accent-amber/60 bg-accent-amber/10 text-accent-amber',
    'border-orange-400/60 bg-orange-400/10 text-orange-300',
    'border-cyan-400/60 bg-cyan-400/10 text-cyan-300',
    'border-accent-green/60 bg-accent-green/10 text-accent-green',
    'border-accent-purple/60 bg-accent-purple/10 text-accent-purple',
  ]
  return classes[subnetNumber % classes.length]
}

function categoryClass(category: string | null) {
  const key = (category ?? '').toLowerCase()
  if (key.includes('inference')) return 'border-cyan-400/40 text-cyan-300 bg-cyan-400/10'
  if (key.includes('train') || key.includes('pretrain')) return 'border-accent-purple/40 text-accent-purple bg-accent-purple/10'
  if (key.includes('data')) return 'border-accent-blue/40 text-accent-blue bg-accent-blue/10'
  if (key.includes('storage')) return 'border-accent-green/40 text-accent-green bg-accent-green/10'
  if (key.includes('compute')) return 'border-accent-amber/40 text-accent-amber bg-accent-amber/10'
  return 'border-bg-border text-text-secondary bg-bg-elevated'
}

function formatMarketCap(val: number | null) {
  if (!val) return '—'
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`
  return `$${val.toFixed(0)}`
}

export default function SubnetIndex({ subnets }: { subnets: SubnetWithRelations[] }) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortKey, setSortKey] = useState<keyof Subnet>('subnet_number')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [expanded, setExpanded] = useState<string | null>(null)

  const categories = useMemo(
    () => ['All', ...([...new Set(subnets.map(s => s.category).filter(Boolean))] as string[]).sort()],
    [subnets]
  )

  const filtered = useMemo(() => {
    return subnets
      .filter(s => {
        const q = search.toLowerCase()
        const matchSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          String(s.subnet_number).includes(q) ||
          s.founders?.name.toLowerCase().includes(q) ||
          (s.category ?? '').toLowerCase().includes(q)
        const matchCat = categoryFilter === 'All' || s.category === categoryFilter
        return matchSearch && matchCat
      })
      .sort((a, b) => {
        const aVal = (a as any)[sortKey] ?? 0
        const bVal = (b as any)[sortKey] ?? 0
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
        return 0
      })
  }, [subnets, search, categoryFilter, sortKey, sortDir])

  function toggleSort(key: keyof Subnet) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortIcon({ col }: { col: keyof Subnet }) {
    if (sortKey !== col) return <span className="opacity-20">↕</span>
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search subnets, founders, categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-bg-surface border border-bg-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={clsx(
                'px-3 py-2 text-xs font-mono rounded border transition-colors',
                categoryFilter === cat
                  ? 'border-accent-green text-accent-green bg-accent-green/10'
                  : 'border-bg-border text-text-muted hover:border-bg-elevated hover:text-text-secondary'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                {[
                  { label: '#', key: 'subnet_number' },
                  { label: 'Subnet', key: 'name' },
                  { label: 'Category', key: 'category' },
                  { label: 'Founder', key: null },
                  { label: 'Mkt Cap', key: 'market_cap_usd' },
                  { label: 'APY', key: 'apy_percent' },
                  { label: 'Score', key: 'nerds_score' },
                  { label: 'AMA', key: null },
                ].map(({ label, key }) => (
                  <th
                    key={label}
                    onClick={() => key && toggleSort(key as keyof Subnet)}
                    className={clsx(
                      'px-4 py-3 text-left font-mono text-xs text-text-muted uppercase tracking-wider whitespace-nowrap',
                      key && 'cursor-pointer hover:text-text-secondary select-none'
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {key && <SortIcon col={key as keyof Subnet} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center font-mono text-text-muted">
                    No subnets found
                  </td>
                </tr>
              )}
              {filtered.map(subnet => {
                const hasAma = subnet.amas?.some(a => a.draft_status === 'published')
                const isExpanded = expanded === subnet.id

                return (
                  <Fragment key={subnet.id}>
                    <tr
                      onClick={() => setExpanded(isExpanded ? null : subnet.id)}
                      className={clsx(
                        'border-b border-bg-border cursor-pointer transition-colors',
                        isExpanded
                          ? 'bg-bg-elevated border-accent-green/20'
                          : 'hover:bg-bg-elevated'
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-text-muted text-xs">
                        <span className={clsx('inline-flex h-7 min-w-12 items-center justify-center rounded border px-2 font-mono text-xs font-bold', subnetBadgeClass(subnet.subnet_number))}>
                          SN{subnet.subnet_number}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-medium text-text-primary">
                          {subnet.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('inline-flex rounded border px-2 py-0.5 text-xs font-mono', categoryClass(subnet.category))}>
                          {subnet.category ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-text-secondary">
                        {subnet.founders?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-text-primary">
                        {formatMarketCap(subnet.market_cap_usd)}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-accent-green">
                        {subnet.apy_percent ? `${subnet.apy_percent.toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-28 items-center gap-2">
                          <span className={scoreClass(subnet.nerds_score)}>
                            {subnet.nerds_score ?? '—'}
                          </span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-border">
                            <div
                              className={clsx(
                                'h-full rounded-full',
                                (subnet.nerds_score ?? 0) >= 70
                                  ? 'bg-accent-green'
                                  : (subnet.nerds_score ?? 0) >= 40
                                    ? 'bg-accent-amber'
                                    : 'bg-accent-red'
                              )}
                              style={{ width: `${subnet.nerds_score ?? 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {hasAma ? (
                          <span className="text-xs font-mono text-accent-green border border-accent-green/30 px-2 py-0.5 rounded">
                            AMA
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-text-muted">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {isExpanded && (
                      <tr key={`${subnet.id}-expanded`} className="bg-bg-elevated border-b border-bg-border">
                        <td colSpan={8} className="px-6 py-5">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Thesis */}
                            <div>
                              <div className="section-label mb-2">Thesis</div>
                              <p className="text-sm text-text-secondary leading-relaxed">
                                {subnet.thesis ?? 'No thesis written yet.'}
                              </p>
                            </div>

                            {/* Recent catalysts */}
                            <div>
                              <div className="section-label mb-2">Recent Catalysts</div>
                              <p className="text-sm text-text-secondary leading-relaxed">
                                {subnet.recent_catalysts ?? '—'}
                              </p>
                            </div>

                            {/* Risks */}
                            <div>
                              <div className="section-label mb-2">Key Risks</div>
                              <p className="text-sm text-text-secondary leading-relaxed">
                                {subnet.risks ?? '—'}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex items-center gap-3">
                            <Link
                              href={`/intelligence/${subnet.slug}`}
                              className="text-xs font-mono text-accent-amber border border-accent-amber/30 px-3 py-1.5 rounded hover:bg-accent-amber/10 transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              Full Profile
                            </Link>
                            {hasAma && (
                              <Link
                                href={`/amas?subnet=${subnet.subnet_number}`}
                                className="text-xs font-mono text-text-secondary border border-bg-border px-3 py-1.5 rounded hover:border-text-muted transition-colors"
                                onClick={e => e.stopPropagation()}
                              >
                                View AMA
                              </Link>
                            )}
                            {subnet.website_url && (
                              <a
                                href={subnet.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-text-muted flex items-center gap-1 hover:text-text-secondary"
                                onClick={e => e.stopPropagation()}
                              >
                                Website <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 text-xs font-mono text-text-muted text-right">
        {filtered.length} of {subnets.length} subnets · click row to expand
      </div>
    </div>
  )
}
