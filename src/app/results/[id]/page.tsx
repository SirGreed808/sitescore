import { notFound } from 'next/navigation'
import { getAudit } from '@/lib/supabase'
import { getThemeForCity } from '@/lib/themes'
import AuditResults from '@/components/AuditResults'
import ThemeApplier from '@/components/ThemeApplier'
import { ArrowLeft } from 'lucide-react'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAudit(id)

  if (!result) notFound()

  const theme = getThemeForCity(result.city)

  return (
    <>
      <ThemeApplier theme={theme} />
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px',
        gap: '40px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>{theme.emoji}</div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>SiteScore</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Shared audit report</p>
        </div>

        <AuditResults result={result} theme={theme} />

        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity duration-200 hover:opacity-80"
          style={{
            color: 'var(--primary)',
            border: '1px solid var(--border)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Audit your own site
        </a>
      </main>
    </>
  )
}
