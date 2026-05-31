import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireRouteUser } from '@/lib/server-auth'

export async function POST(req: NextRequest) {
  try {
    await requireRouteUser()

    const { amaId, approvedFields } = await req.json()
    if (!amaId) return NextResponse.json({ error: 'amaId required' }, { status: 400 })
    if (!approvedFields) return NextResponse.json({ error: 'approvedFields required' }, { status: 400 })

    const supabase = createSupabaseAdminClient()

    const { error } = await supabase
      .from('amas')
      .update({
        published_x_post: approvedFields.x_post,
        published_recap: approvedFields.recap,
        published_quote_highlights: approvedFields.quote_highlights,
        published_what_changed: approvedFields.what_changed,
        draft_status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', amaId)

    if (error) throw error

    const { data: ama } = await supabase
      .from('amas')
      .select('subnet_id, founder_id, draft_thesis_update, draft_risks, draft_founder_update, draft_what_changed')
      .eq('id', amaId)
      .maybeSingle()

    if (ama?.subnet_id) {
      await supabase
        .from('subnets')
        .update({
          thesis: approvedFields.thesis_update ?? ama.draft_thesis_update,
          risks: approvedFields.risks ?? ama.draft_risks,
          latest_update: approvedFields.what_changed ?? ama.draft_what_changed,
          last_reviewed_at: new Date().toISOString(),
        } as any)
        .eq('id', ama.subnet_id)
    }

    if (ama?.founder_id && (approvedFields.founder_update ?? ama.draft_founder_update)) {
      await supabase
        .from('founders')
        .update({ bio: approvedFields.founder_update ?? ama.draft_founder_update } as any)
        .eq('id', ama.founder_id)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: err.message }, { status })
  }
}
