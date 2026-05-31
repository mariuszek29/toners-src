'use client'

import { useState } from 'react'
import { Zap, CheckCircle, Edit3, Send, AlertCircle, Loader } from 'lucide-react'
import { clsx } from 'clsx'

type DraftSection = {
  key: string
  label: string
  description: string
  isArray?: boolean
}

const SECTIONS: DraftSection[] = [
  { key: 'x_post', label: 'X Post', description: 'Thread for Twitter/X' },
  { key: 'recap', label: 'Full Recap', description: '3-5 paragraph editorial' },
  { key: 'founder_update', label: 'Founder Profile Update', description: 'Bio / credibility update' },
  { key: 'thesis_update', label: 'Thesis Update', description: 'Updated subnet thesis' },
  { key: 'risks', label: 'Risk Section', description: 'Key risks surfaced' },
  { key: 'quote_highlights', label: 'Quote Highlights', description: 'Key quotes + context', isArray: true },
  { key: 'what_changed', label: 'What Changed', description: 'Post-AMA delta vs before' },
]

export default function AMAPipelinePage() {
  const [step, setStep] = useState<'input' | 'generating' | 'review' | 'approved'>('input')
  const [input, setInput] = useState({ transcript: '', founderName: '', subnetName: '', subnetNumber: '' })
  const [drafts, setDrafts] = useState<Record<string, any>>({})
  const [edited, setEdited] = useState<Record<string, any>>({})
  const [amaId, setAmaId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [publishing, setPublishing] = useState(false)

  async function generate() {
    setError('')
    setStep('generating')
    try {
      const res = await fetch('/api/amas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: input.transcript,
          founderName: input.founderName,
          subnetName: input.subnetName,
          subnetNumber: input.subnetNumber,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDrafts(data.drafts)
      setEdited(data.drafts)
      setAmaId(data.amaId)
      setStep('review')
    } catch (err: any) {
      setError(err.message)
      setStep('input')
    }
  }

  async function publish() {
    setPublishing(true)
    try {
      const res = await fetch('/api/amas/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amaId, approvedFields: edited }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Publish failed')
      setStep('approved')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="section-label mb-2">Admin · AMA Pipeline</div>
        <h1 className="text-2xl font-mono font-bold text-text-primary mb-1">
          AMA → Content Automation
        </h1>
        <p className="text-text-secondary text-sm">
          Paste transcript or notes. AI drafts all 7 content sections. You review and approve. Nothing publishes without your sign-off.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8 text-xs font-mono">
        {['input', 'generating', 'review', 'approved'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={clsx(
              'px-2 py-1 rounded border',
              step === s ? 'border-accent-green text-accent-green' : 'border-bg-border text-text-muted'
            )}>
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
            {i < 3 && <span className="text-text-muted">→</span>}
          </div>
        ))}
      </div>

      {/* STEP 1: Input */}
      {step === 'input' && (
        <div className="card p-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="section-label mb-1 block">Founder Name</label>
              <input
                type="text"
                value={input.founderName}
                onChange={e => setInput(p => ({ ...p, founderName: e.target.value }))}
                placeholder="e.g. Alex Tenczar"
                className="w-full bg-bg-base border border-bg-border rounded px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50"
              />
            </div>
            <div>
              <label className="section-label mb-1 block">Subnet Name</label>
              <input
                type="text"
                value={input.subnetName}
                onChange={e => setInput(p => ({ ...p, subnetName: e.target.value }))}
                placeholder="e.g. Compute"
              className="w-full bg-bg-base border border-bg-border rounded px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50"
              />
            </div>
            <div>
              <label className="section-label mb-1 block">Subnet #</label>
              <input
                type="text"
                value={input.subnetNumber}
                onChange={e => setInput(p => ({ ...p, subnetNumber: e.target.value }))}
                placeholder="e.g. 27"
                className="w-full bg-bg-base border border-bg-border rounded px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50"
              />
            </div>
          </div>

          <div>
            <label className="section-label mb-1 block">Transcript / Raw Notes</label>
            <textarea
              value={input.transcript}
              onChange={e => setInput(p => ({ ...p, transcript: e.target.value }))}
              placeholder="Paste full transcript, voice note transcription, or rough bullets here..."
              rows={16}
              className="w-full bg-bg-base border border-bg-border rounded px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 resize-y"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-accent-red text-sm font-mono">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={!input.transcript || !input.founderName}
            className="flex items-center gap-2 px-5 py-3 bg-accent-green text-bg-base font-mono font-bold rounded hover:bg-accent-green-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-fit"
          >
            <Zap size={16} />
            Generate 7 Content Drafts
          </button>
        </div>
      )}

      {/* STEP 2: Generating */}
      {step === 'generating' && (
        <div className="card p-12 flex flex-col items-center gap-4 text-center">
          <Loader size={32} className="text-accent-green animate-spin" />
          <div className="font-mono text-text-primary">Generating drafts...</div>
          <div className="text-sm text-text-muted">
            Claude is writing all 7 sections. Usually 15-30 seconds.
          </div>
        </div>
      )}

      {/* STEP 3: Review & Edit */}
      {step === 'review' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-mono text-text-secondary">
              Review each section. Edit anything before publishing.
            </div>
            <button
              onClick={publish}
              disabled={publishing || !amaId}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-green text-bg-base font-mono font-bold rounded hover:bg-accent-green-dim transition-colors disabled:opacity-40"
            >
              {publishing ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
              Approve & Publish
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-accent-red text-sm font-mono">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {SECTIONS.map(({ key, label, description, isArray }) => (
            <div key={key} className="card p-5">
              <div className="flex items-center gap-2 mb-1">
                <Edit3 size={14} className="text-accent-green" />
                <span className="font-mono font-bold text-text-primary text-sm">{label}</span>
                <span className="text-xs text-text-muted">— {description}</span>
              </div>

              {isArray ? (
                // Quote highlights special rendering
                <div className="flex flex-col gap-3 mt-3">
                  {(edited[key] ?? []).map((item: any, i: number) => (
                    <div key={i} className="border border-bg-border rounded p-3 flex flex-col gap-2">
                      <textarea
                        value={item.quote}
                        onChange={e => {
                          const next = [...edited[key]]
                          next[i] = { ...next[i], quote: e.target.value }
                          setEdited(p => ({ ...p, [key]: next }))
                        }}
                        className="w-full bg-bg-base border border-bg-border rounded px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-green/50 resize-none"
                        rows={2}
                        placeholder="Quote"
                      />
                      <input
                        value={item.context}
                        onChange={e => {
                          const next = [...edited[key]]
                          next[i] = { ...next[i], context: e.target.value }
                          setEdited(p => ({ ...p, [key]: next }))
                        }}
                        className="w-full bg-bg-base border border-bg-border rounded px-3 py-2 text-sm font-mono text-text-muted focus:outline-none focus:border-accent-green/50"
                        placeholder="Why this quote matters"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  value={edited[key] ?? ''}
                  onChange={e => setEdited(p => ({ ...p, [key]: e.target.value }))}
                  rows={key === 'recap' ? 10 : key === 'x_post' ? 8 : 5}
                  className="w-full mt-2 bg-bg-base border border-bg-border rounded px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-green/50 resize-y"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={publish}
              disabled={publishing || !amaId}
              className="flex items-center gap-2 px-6 py-3 bg-accent-green text-bg-base font-mono font-bold rounded hover:bg-accent-green-dim transition-colors disabled:opacity-40"
            >
              {publishing ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
              Approve & Publish All
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Published */}
      {step === 'approved' && (
        <div className="card p-12 flex flex-col items-center gap-4 text-center">
          <CheckCircle size={40} className="text-accent-green" />
          <div className="font-mono text-xl font-bold text-text-primary">Published</div>
          <p className="text-text-secondary text-sm max-w-sm">
            AMA content is live. Subnet thesis, founder profile, recap, and X post are all updated.
          </p>
          <button
            onClick={() => { setStep('input'); setInput({ transcript: '', founderName: '', subnetName: '', subnetNumber: '' }); setDrafts({}); setEdited({}); setAmaId(null) }}
            className="mt-4 text-sm font-mono text-accent-green border border-accent-green/30 px-4 py-2 rounded hover:bg-accent-green/10 transition-colors"
          >
            Run another AMA
          </button>
        </div>
      )}
    </div>
  )
}
