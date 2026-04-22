import { NextRequest, NextResponse } from 'next/server'
import { runAudit } from '@/lib/audit'
import { saveAudit } from '@/lib/supabase'
import type { AuditRequest } from '@/types/audit'

// V2 hook: add POST /api/audit/stream route.ts alongside this for SSE progress

export async function POST(req: NextRequest) {
  let body: AuditRequest

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { url, city } = body

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  if (!city || typeof city !== 'string') {
    return NextResponse.json({ error: 'city is required' }, { status: 400 })
  }

  try {
    const result = await runAudit(url.trim(), city.trim())
    const id = await saveAudit(result)
    return NextResponse.json({ ...result, id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Audit failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
