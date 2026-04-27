'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Share2, CheckCheck, MapPin, ArrowRight, Sparkles } from 'lucide-react'
import type { AuditResult, CityTheme } from '@/types/audit'
import ScoreRing from './ScoreRing'
import CheckItem from './CheckItem'

interface AuditResultsProps {
  result: AuditResult
  theme: CityTheme
}

export default function AuditResults({ result, theme }: AuditResultsProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const fails = result.checks.filter(c => c.status === 'fail').length
  const warnings = result.checks.filter(c => c.status === 'warning').length
  const passes = result.checks.filter(c => c.status === 'pass').length

  function handleShare() {
    if (!result.id) return
    navigator.clipboard.writeText(`${window.location.origin}/results/${result.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleCompareCity() {
    localStorage.setItem('ss_url', result.url)
    localStorage.setItem('ss_city', '')
    router.push('/')
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl fade-scale-in">

      {/* Score header card */}
      <div
        className="rounded-3xl p-7 flex flex-wrap items-center gap-6 relative z-10"
        style={{
          background: 'var(--card)',
          border: '3px solid var(--primary)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <ScoreRing score={result.score} />

        <div className="flex-1 min-w-48">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: '20px' }}>{theme.emoji}</span>
            <h2
              className="font-display font-bold text-xl"
              style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
            >
              {result.city} SEO Audit
            </h2>
          </div>
          <p className="text-xs mb-5 break-all" style={{ color: 'var(--muted)' }}>
            {result.url}
          </p>

          <div className="flex gap-2 flex-wrap">
            <Pill count={passes} label="Passing" color="#16A34A" bg="#DCFCE7" />
            <Pill count={warnings} label="Warnings" color="#D97706" bg="#FEF3C7" />
            <Pill count={fails} label="Failing" color="#DC2626" bg="#FEE2E2" />
          </div>
        </div>

        {result.id && (
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold cursor-pointer"
            style={{
              background: copied ? '#16A34A' : 'var(--primary)',
              color: '#fff',
              border: 'none',
              flexShrink: 0,
              transition: 'all 200ms ease',
              transform: copied ? 'scale(1)' : undefined,
              boxShadow: copied
                ? '0 4px 16px rgba(22, 163, 74, 0.3)'
                : '0 4px 16px rgba(37, 99, 235, 0.25)',
            }}
            onMouseDown={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.transform = 'scale(0.95)'
            }}
            onMouseUp={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.transform = 'scale(1)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.transform = 'scale(1)'
            }}
          >
            {copied ? <CheckCheck size={16} strokeWidth={2.5} /> : <Share2 size={16} strokeWidth={2.5} />}
            <span style={{ transition: 'all 200ms ease' }}>
              {copied ? 'Link copied' : 'Share'}
            </span>
          </button>
        )}
      </div>

      {/* Check list */}
      <div
        className="flex flex-col gap-3"
        style={{ animation: 'fadeScaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 300ms both' }}
      >
        {result.checks.map(check => (
          <CheckItem key={check.id} check={check} />
        ))}
      </div>

      <LeadCTA score={result.score} />

      {/* Compare with another city */}
      <div
        className="flex items-center justify-between gap-3"
        style={{
          fontSize: '0.875rem',
          color: 'var(--muted)',
          borderTop: '2px dashed var(--border)',
          paddingTop: '1.25rem',
          marginTop: '1.5rem',
        }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={14} strokeWidth={2} />
          <span>How does this score compare in another city?</span>
        </div>
        <button
          onClick={handleCompareCity}
          className="font-bold cursor-pointer hover:underline"
          style={{ color: 'var(--primary)', background: 'none', border: 'none' }}
        >
          Try another city →
        </button>
      </div>

      <p
        className="text-center text-sm font-medium italic"
        style={{ color: 'var(--muted)' }}
      >
        {theme.tagline}
      </p>
    </div>
  )
}

function Pill({ count, label, color, bg }: { count: number; label: string; color: string; bg: string }) {
  return (
    <span
      className="text-xs font-bold px-3.5 py-1.5 rounded-xl"
      style={{ background: bg, color }}
    >
      {count} {label}
    </span>
  )
}

function LeadCTA({ score }: { score: number }) {
  const content =
    score < 50
      ? {
          headline: 'Your business is nearly invisible online.',
          body: "Most customers search before they call. Right now they're finding your competitors instead.",
          cta: 'Book a free 15-min call',
          accent: '#DC2626',
        }
      : score < 70
      ? {
          headline: "You're leaving rankings on the table.",
          body: "A few targeted fixes could move you from page 2 to page 1. We've done it for businesses just like yours.",
          cta: 'See how we can help',
          accent: '#D97706',
        }
      : {
          headline: "Solid foundation — let's take it further.",
          body: 'Professional SEO management can turn good visibility into a steady stream of new customers.',
          cta: 'Talk to us',
          accent: '#16A34A',
        }

  return (
    <div
      className="rounded-3xl p-7 relative z-10"
      style={{
        background: 'var(--card)',
        border: `3px solid ${content.accent}`,
        boxShadow: `0 8px 32px ${content.accent}20`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} color={content.accent} strokeWidth={2.5} />
        <p
          className="font-display font-bold text-base"
          style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
        >
          {content.headline}
        </p>
      </div>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
        {content.body}
      </p>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <a
          href="https://honestdev808.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 hover:opacity-90 cursor-pointer"
          style={{
            background: content.accent,
            color: '#fff',
            boxShadow: `0 4px 16px ${content.accent}40`,
          }}
        >
          {content.cta}
          <ArrowRight size={14} strokeWidth={2.5} />
        </a>
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--muted)' }}
        >
          Honest Dev Consulting
        </span>
      </div>
    </div>
  )
}
