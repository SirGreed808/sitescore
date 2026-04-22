import { notFound } from 'next/navigation'
import { getAudit } from '@/lib/supabase'
import { getThemeForCity } from '@/lib/themes'
import AuditResults from '@/components/AuditResults'
import ThemeApplier from '@/components/ThemeApplier'

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

        <a href="/" style={{
          color: 'var(--primary)',
          fontWeight: 600,
          fontSize: '14px',
          textDecoration: 'underline',
        }}>
          Audit your own site →
        </a>
      </main>
    </>
  )
}
