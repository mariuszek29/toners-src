import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireRouteUser } from '@/lib/server-auth'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM_PROMPT = `You are Mariusz's editorial assistant for TAO NERDS — a crypto-native media platform covering the Bittensor ecosystem.

Your job: take raw AMA transcripts or notes and generate structured content drafts that Mariusz will review and approve before publishing.

Write in Mariusz's voice: short declarative sentences, no corporate hedging, crypto-native vocabulary intact (subnet, emissions, dTAO, alpha, validators, miners). Direct, honest, no hype. Surface real risks and open questions — not just positives.

Always respond with valid JSON matching the specified schema.`

export async function POST(req: NextRequest) {
  try {
    await requireRouteUser()

    const { amaId, transcript, rawNotes, subnetName, subnetNumber, founderName } = await req.json()

    if (!transcript && !rawNotes) {
      return NextResponse.json({ error: 'transcript or rawNotes required' }, { status: 400 })
    }

    if (!founderName || !subnetName || !subnetNumber) {
      return NextResponse.json({ error: 'founderName, subnetName, and subnetNumber required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 })
    }

    const content = transcript || rawNotes

    const prompt = `You are generating editorial drafts for an AMA with ${founderName}, founder of SN${subnetNumber} (${subnetName}) on the Bittensor network.

Raw content:
---
${content}
---

Generate all 7 content sections as a JSON object with these exact keys:

{
  "x_post": "A punchy X/Twitter thread post. Max 280 chars for first tweet, then 2-3 follow-up bullets. Format: FIRST TWEET\\n\\n1/ ...\\n2/ ...\\n3/ ...",
  "recap": "A 3-5 paragraph editorial recap. What was discussed, what stood out, what changed. Written in Mariusz's direct voice.",
  "founder_update": "2-3 sentences updating the founder profile. What's new about their background, credibility, or approach based on this AMA.",
  "thesis_update": "Updated subnet thesis in 2-4 sentences. What the subnet does, why it matters in the Bittensor ecosystem, any pivots since last review.",
  "risks": "3-5 bullet points of real risks surfaced or remaining. Be honest — not a press release.",
  "quote_highlights": [
    { "quote": "exact quote from founder", "context": "why this quote matters" },
    { "quote": "another key quote", "context": "context" }
  ],
  "what_changed": "What specifically changed or was clarified after this AMA vs before. Could be about the thesis, risks, team, product, or community perception."
}

Return ONLY the JSON object. No markdown, no explanation.`

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as any).text
    const drafts = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim())

    const supabase = createSupabaseAdminClient()
    const netuid = Number(subnetNumber)
    const { data: subnet } = await supabase
      .from('subnets')
      .select('id, founder_id, subnet_number, name')
      .eq('subnet_number', netuid)
      .maybeSingle()

    const { data: founder } = await supabase
      .from('founders')
      .select('id')
      .ilike('name', founderName)
      .maybeSingle()

    const row = {
      subnet_id: subnet?.id ?? null,
      founder_id: subnet?.founder_id ?? founder?.id ?? null,
      title: `SN${subnetNumber} ${subnetName} AMA with ${founderName}`,
      transcript: transcript ?? null,
      raw_notes: rawNotes ?? null,
      draft_x_post: drafts.x_post,
      draft_recap: drafts.recap,
      draft_founder_update: drafts.founder_update,
      draft_thesis_update: drafts.thesis_update,
      draft_risks: drafts.risks,
      draft_quote_highlights: drafts.quote_highlights ?? [],
      draft_what_changed: drafts.what_changed,
      draft_status: 'drafted',
    }

    let savedAmaId = amaId

    if (amaId) {
      const { error } = await supabase
        .from('amas')
        .update(row as any)
        .eq('id', amaId)
      if (error) throw error
    } else {
      const { data, error } = await supabase
        .from('amas')
        .insert(row as any)
        .select('id')
        .single()

      if (error) throw error
      savedAmaId = data.id
    }

    return NextResponse.json({ drafts, amaId: savedAmaId, success: true })
  } catch (err: any) {
    console.error('AMA generation error:', err)
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: err.message }, { status })
  }
}
