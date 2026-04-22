'use client'

import { useState } from 'react'
import { Share2, MapPin } from 'lucide-react'
import type { AuditResult, CityTheme } from '@/types/audit'
import ScoreRing from './ScoreRing'
import CheckItem from './CheckItem'

interface AuditResultsProps {
  result: AuditResult
  theme: CityTheme
}

export default function AuditResults({ result, theme }: AuditResultsProps) {
  const [copied, setCopied] = useState(false)

  const fails    = result.checks.filter(c => c.status === 'fail').length
  const warnings = result.checks.filter(c => c.status === 'warning').length
  const passes   = result.checks.filter(c => c.status === 'pass').length

  function handleShare() {
    if (!result.id) return
    navigator.clipboard.writeText(`${window.location.origin}/results/${result.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl">

      {/* Score header card */}
      <div className="rounded-2xl p-6 flex flex-wrap items-center gap-6"
        style={{ background: 'var(--card)', boxShadow: 'var(--shadow)' }}>

        <ScoreRing score={result.score} />

        <div className="flex-1 min-w-48">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} color="var(--primary)" strokeWidth={2.5} />
            <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--text)' }}>
              {result.city} SEO Audit
            </h2>
          </div>
          <p className="text-xs mb-4 break-all" style={{ color: 'var(--muted)' }}>{result.url}</p>

          <div className="flex gap-2 flex-wrap">
            <Pill count={passes}   label="Passing"  color="#2D8A4E" bg="#F0FFF4" />
            <Pill count={warnings} label="Warnings" color="#C27A1A" bg="#FFFBEB" />
            <Pill count={fails}    label="Failing"  color="#C0392B" bg="#FFF5F5" />
          </div>
        </div>

        {result.id && (
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity duration-200 hover:opacity-80 cursor-pointer"
            style={{
              background: copied ? '#2D8A4E' : 'var(--primary)',
              color: '#fff',
              border: 'none',
              flexShrink: 0,
            }}
          >
            <Share2 size={15} strokeWidth={2.5} />
            {copied ? 'Copied!' : 'Share'}
          </button>
        )}
      </div>

      {/* Check list */}
      <div className="flex flex-col gap-2.5">
        {result.checks.map(check => (
          <CheckItem key={check.id} check={check} />
        ))}
      </div>

      <p className="text-center text-xs italic" style={{ color: 'var(--muted)' }}>
        {theme.tagline}
      </p>
    </div>
  )
}

function Pill({ count, label, color, bg }: { count: number; label: string; color: string; bg: string }) {
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full"
      style={{ background: bg, color }}>
      {count} {label}
    </span>
  )
}
