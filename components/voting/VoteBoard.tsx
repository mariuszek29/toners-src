'use client'

import { useState, useCallback } from 'react'
import { clsx } from 'clsx'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import type { Sentiment } from '@/types/database'

const SENTIMENTS: { value: Sentiment; label: string; color: string }[] = [
  { value: 'bullish', label: '▲ Bullish', color: 'badge-bullish' },
  { value: 'neutral', label: '— Neutral', color: 'badge-neutral' },
  { value: 'bearish', label: '▼ Bearish', color: 'badge-bearish' },
]

function communityScore(snap: any): number | null {
  if (!snap) return null
  const total = snap.bullish_count + snap.neutral_count + snap.bearish_count
  if (total === 0) return null
  return Math.round((snap.bullish_count / total) * 100)
}

function sentimentBar(snap: any) {
  if (!snap) return null
  const total = snap.bullish_count + snap.neutral_count + snap.bearish_count
  if (total === 0) return null
  return {
    bullish: Math.round((snap.bullish_count / total) * 100),
    neutral: Math.round((snap.neutral_count / total) * 100),
    bearish: Math.round((snap.bearish_count / total) * 100),
    total,
  }
}

export default function VoteBoard({ subnets, snapshots }: { subnets: any[]; snapshots: Record<string, any> }) {
  const [votes, setVotes] = useState<Record<string, { sentiment: Sentiment; confidence: number; submitting: boolean }>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const supabase = createSupabaseBrowserClient()

  async function submitVote(subnetId: string) {
    const vote = votes[subnetId]
    if (!vote) return

    setVotes(p => ({ ...p, [subnetId]: { ...p[subnetId], submitting: true } }))

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Sign in to vote')
      setVotes(p => ({ ...p, [subnetId]: { ...p[subnetId], submitting: false } }))
      return
    }

    const { error } = await supabase
      .from('votes')
      .upsert({
        subnet_id: subnetId,
        user_id: user.id,
        sentiment: vote.sentiment,
        confidence: vote.confidence,
      } as any, { onConflict: 'subnet_id,user_id' })

    if (!error) {
      setSubmitted(p => ({ ...p, [subnetId]: true }))
    }

    setVotes(p => ({ ...p, [subnetId]: { ...p[subnetId], submitting: false } }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subnets.map(subnet => {
        const snap = snapshots[subnet.id]
        const bar = sentimentBar(snap)
        const score = communityScore(snap)
        const vote = votes[subnet.id]
        const isSubmitted = submitted[subnet.id]

        return (
          <div key={subnet.id} className="card p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="section-label mb-1">SN{subnet.subnet_number} · {subnet.category}</div>
                <div className="font-mono font-bold text-text-primary">{subnet.name}</div>
              </div>
              {score !== null && (
                <div className="text-right">
                  <div className="section-label">Community</div>
                  <div className={clsx('font-mono font-bold', score >= 60 ? 'text-accent-green' : score >= 40 ? 'text-accent-amber' : 'text-accent-red')}>
                    {score}%
                  </div>
                </div>
              )}
            </div>

            {/* Sentiment bar */}
            {bar && (
              <div>
                <div className="flex rounded overflow-hidden h-2 gap-px">
                  <div className="bg-accent-green/70" style={{ width: `${bar.bullish}%` }} />
                  <div className="bg-text-muted/40" style={{ width: `${bar.neutral}%` }} />
                  <div className="bg-accent-red/70" style={{ width: `${bar.bearish}%` }} />
                </div>
                <div className="flex justify-between text-xs font-mono text-text-muted mt-1">
                  <span className="text-accent-green">{bar.bullish}% bull</span>
                  <span>{bar.total} votes</span>
                  <span className="text-accent-red">{bar.bearish}% bear</span>
                </div>
              </div>
            )}

            {!bar && (
              <div className="text-xs font-mono text-text-muted">No votes yet — be first</div>
            )}

            {/* Vote UI */}
            {isSubmitted ? (
              <div className="text-xs font-mono text-accent-green border border-accent-green/30 px-3 py-2 rounded text-center">
                ✓ Vote recorded
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Sentiment */}
                <div className="flex gap-2">
                  {SENTIMENTS.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setVotes(p => ({
                        ...p,
                        [subnet.id]: { sentiment: value, confidence: p[subnet.id]?.confidence ?? 3, submitting: false }
                      }))}
                      className={clsx(
                        'flex-1 text-xs font-mono py-1.5 px-2 rounded border transition-colors',
                        vote?.sentiment === value
                          ? color
                          : 'border-bg-border text-text-muted hover:border-text-muted'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Confidence */}
                {vote?.sentiment && (
                  <div>
                    <div className="section-label mb-1">Confidence (1-5)</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setVotes(p => ({ ...p, [subnet.id]: { ...p[subnet.id], confidence: n } }))}
                          className={clsx(
                            'flex-1 py-1.5 font-mono text-xs rounded border transition-colors',
                            vote.confidence === n
                              ? 'border-accent-green text-accent-green bg-accent-green/10'
                              : 'border-bg-border text-text-muted hover:border-text-muted'
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {vote?.sentiment && (
                  <button
                    onClick={() => submitVote(subnet.id)}
                    disabled={vote.submitting}
                    className="w-full py-2 text-xs font-mono bg-accent-green text-bg-base rounded font-bold hover:bg-accent-green-dim transition-colors disabled:opacity-50"
                  >
                    {vote.submitting ? 'Submitting...' : 'Submit Vote'}
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
