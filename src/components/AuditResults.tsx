'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Share2, CheckCheck, MapPin, ArrowRight } from 'lucide-react'
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
    <div className="flex flex-col gap-4 w-full max-w-2xl fade-scale-in">

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
            <Pill count={passes} label="Passing" color="#2D8A4E" bg="#F0FFF4" />
            <Pill count={warnings} label="Warnings" color="#C27A1A" bg="#FFFBEB" />
            <Pill count={fails} label="Failing" color="#C0392B" bg="#FFF5F5" />
          </div>
        </div>

        {result.id && (
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
            style={{
              background: copied ? '#2D8A4E' : 'var(--primary)',
              color: '#fff',
              border: 'none',
              flexShrink: 0,
              transition: 'all 200ms ease',
              transform: copied ? 'scale(1)' : undefined,
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
            {copied ? <CheckCheck size={15} strokeWidth={2.5} /> : <Share2 size={15} strokeWidth={2.5} />}
            <span style={{ transition: 'all 200ms ease' }}>
              {copied ? 'Link copied' : 'Share'}
            </span>
          </button>
        )}
      </div>

      {/* Check list — staggered reveal */}
      <div
        className="flex flex-col gap-2.5"
        style={{ animation: 'fadeScaleIn 0.45s ease-out 300ms both' }}
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
          borderTop: '1px solid var(--border)',
          paddingTop: '1rem',
          marginTop: '1.5rem',
        }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={14} strokeWidth={2} />
          <span>How does this score compare in another city?</span>
        </div>
        <button
          onClick={handleCompareCity}
          className="font-semibold cursor-pointer hover:underline"
          style={{ color: 'var(--primary)', background: 'none', border: 'none' }}
        >
          Try another city →
        </button>
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

function LeadCTA({ score }: { score: number }) {
  const content =
    score < 50
      ? {
          headline: 'Your business is nearly invisible online.',
          body: "Most customers search before they call. Right now they're finding your competitors instead.",
          cta: 'Book a free 15-min call',
        }
      : score < 70
      ? {
          headline: "You're leaving rankings on the table.",
          body: "A few targeted fixes could move you from page 2 to page 1. We've done it for businesses just like yours.",
          cta: 'See how we can help',
        }
      : {
          headline: "Solid foundation — let's take it further.",
          body: 'Professional SEO management can turn good visibility into a steady stream of new customers.',
          cta: 'Talk to us',
        }

  return (
    <div className="rounded-2xl p-6"
      style={{ background: 'var(--card)', border: '1.5px solid var(--primary)', boxShadow: 'var(--shadow)' }}>
      <p className="font-heading font-bold text-base mb-1" style={{ color: 'var(--text)' }}>
        {content.headline}
      </p>
      <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
        {content.body}
      </p>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <a
          href="https://honestdev808.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity duration-200 hover:opacity-85 cursor-pointer"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          {content.cta}
          <ArrowRight size={14} strokeWidth={2.5} />
        </a>
        <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
          Honest Dev Consulting
        </span>
      </div>
    </div>
  )
}
