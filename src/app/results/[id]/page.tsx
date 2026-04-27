import { notFound } from 'next/navigation'
import { getAudit } from '@/lib/supabase'
import { getThemeForCity } from '@/lib/themes'
import AuditResults from '@/components/AuditResults'
import ThemeApplier from '@/components/ThemeApplier'
import { ArrowLeft, Zap } from 'lucide-react'

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
      <main
        className="relative min-h-screen flex flex-col items-center px-5 py-16 gap-10 overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        {/* Grain texture overlay */}
        <div className="grain-overlay" />

        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="blob-float absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.12]"
            style={{ background: 'var(--primary)' }}
          />
          <div
            className="blob-float absolute top-[40%] -left-32 w-64 h-64 rounded-full opacity-[0.10]"
            style={{ background: 'var(--accent)', animationDelay: '-4s' }}
          />
          <div
            className="pulse-ring absolute bottom-16 right-[12%] w-40 h-40 rounded-full"
            style={{ border: '3px solid var(--primary)', opacity: 0.12, animationDelay: '-2s' }}
          />
        </div>

        <div className="relative text-center z-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'var(--primary)',
              transform: 'rotate(-3deg)',
              boxShadow: '0 8px 32px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Zap size={28} color="#FFD600" strokeWidth={2.5} />
          </div>
          <h1
            className="font-display font-bold text-4xl mb-2"
            style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}
          >
            SiteScore
          </h1>
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Shared audit report
          </p>
        </div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <AuditResults result={result} theme={theme} />
        </div>

        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 hover:opacity-80 relative z-10"
          style={{
            color: 'var(--primary)',
            border: '2px solid var(--border)',
            textDecoration: 'none',
            background: 'var(--card)',
          }}
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Audit your own site
        </a>
      </main>
    </>
  )
}
