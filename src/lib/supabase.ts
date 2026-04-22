import { createClient } from '@supabase/supabase-js'
import type { AuditResult } from '@/types/audit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function saveAudit(result: AuditResult): Promise<string> {
  const { data, error } = await supabase
    .from('audits')
    .insert({
      url: result.url,
      city: result.city,
      score: result.score,
      checks: result.checks,
      audited_at: result.auditedAt,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data.id
}

export async function getAudit(id: string): Promise<AuditResult | null> {
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    url: data.url,
    city: data.city,
    score: data.score,
    checks: data.checks,
    auditedAt: data.audited_at,
  }
}

export default supabase
