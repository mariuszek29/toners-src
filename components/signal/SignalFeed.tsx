import Link from 'next/link'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import type { Signal } from '@/types/database'

const SIGNAL_ICONS: Record<string, string> = {
  launch: '🚀',
  price_move: '📈',
  apy_spike: '⚡',
  founder_update: '👤',
  github_update: '⚙️',
  ama_announcement: '🎙️',
  gaining_momentum: '↑',
  losing_momentum: '↓',
  watchlist_change: '👁️',
  general: '◈',
}

const SIGNAL_LABELS: Record<string, string> = {
  launch: 'Launch',
  price_move: 'Price Move',
  apy_spike: 'APY Spike',
  founder_update: 'Founder Update',
  github_update: 'Dev Update',
  ama_announcement: 'AMA',
  gaining_momentum: 'Gaining',
  losing_momentum: 'Losing',
  watchlist_change: 'Watchlist',
  general: 'Signal',
}

function severityColor(severity: string) {
  if (severity === 'high') return 'border-l-accent-red'
  if (severity === 'low') return 'border-l-text-muted'
  return 'border-l-accent-green/40'
}

export default function SignalFeed({ signalsByDate }: { signalsByDate: Record<string, any[]> }) {
  const dates = Object.keys(signalsByDate).sort().reverse()

  return (
    <div className="flex flex-col gap-10">
      {dates.map(date => {
        const signals = signalsByDate[date]
        const isToday = date === new Date().toISOString().split('T')[0]

        return (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="font-mono font-bold text-text-primary">
                {isToday && <span className="text-accent-green mr-2">TODAY —</span>}
                {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d')}
              </div>
              {isToday && <span className="live-dot" />}
              <div className="flex-1 h-px bg-bg-border" />
              <span className="text-xs font-mono text-text-muted">{signals.length} signals</span>
            </div>

            {/* Signals */}
            <div className="flex flex-col gap-3">
              {signals.map((signal: any) => (
                <div
                  key={signal.id}
                  className={clsx(
                    'card border-l-2 px-5 py-4',
                    severityColor(signal.severity)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5">
                      {SIGNAL_ICONS[signal.signal_type] ?? '◈'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-text-muted">
                          {SIGNAL_LABELS[signal.signal_type]}
                        </span>
                        {signal.subnets && (
                          <Link
                            href={`/intelligence/${signal.subnets.slug}`}
                            className="text-xs font-mono text-accent-green hover:underline"
                          >
                            SN{signal.subnets.subnet_number} · {signal.subnets.name}
                          </Link>
                        )}
                        {signal.severity === 'high' && (
                          <span className="text-xs font-mono text-accent-red border border-accent-red/30 px-1.5 py-0.5 rounded">
                            HIGH
                          </span>
                        )}
                      </div>
                      <h3 className="font-mono font-semibold text-text-primary text-sm mb-1">
                        {signal.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {signal.body}
                      </p>
                      {signal.source_url && (
                        <a
                          href={signal.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs font-mono text-text-muted hover:text-accent-green transition-colors"
                        >
                          Source →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
