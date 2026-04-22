import { NextRequest } from 'next/server'
import { runAuditWithProgress } from '@/lib/audit'
import { saveAudit } from '@/lib/supabase'
import type { AuditRequest, AuditCheck, AuditResult } from '@/types/audit'

type StreamEvent =
  | { type: 'check'; check: AuditCheck }
  | { type: 'done'; result: AuditResult }
  | { type: 'error'; error: string }

function encode(event: StreamEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`)
}

export async function POST(req: NextRequest) {
  let body: AuditRequest

  try {
    body = await req.json()
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }

  const { url, city } = body

  if (!url || !city) {
    return new Response('url and city are required', { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await runAuditWithProgress(url.trim(), city.trim(), (check) => {
          controller.enqueue(encode({ type: 'check', check }))
        })

        const id = await saveAudit(result)
        controller.enqueue(encode({ type: 'done', result: { ...result, id } }))
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Audit failed'
        controller.enqueue(encode({ type: 'error', error }))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
