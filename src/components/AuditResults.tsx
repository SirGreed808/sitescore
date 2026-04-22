'use client'

import { useState } from 'react'
import type { AuditResult } from '@/types/audit'
import type { CityTheme } from '@/types/audit'
import ScoreRing from './ScoreRing'
import CheckItem from './CheckItem'

interface AuditResultsProps {
  result: AuditResult
  theme: CityTheme
}

export default function AuditResults({ result, theme }: AuditResultsProps) {
  const [copied, setCopied] = useState(false)
  const fails = result.checks.filter(c => c.status === 'fail').length
  const warnings = result.checks.filter(c => c.status === 'warning').length
  const passes = result.checks.filter(c => c.status === 'pass').length

  function handleShare() {
    if (!result.id) return
    const url = `${window.location.origin}/results/${result.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '680px' }}>
      {/* Header card */}
      <div style={{
        background: 'var(--card)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        flexWrap: 'wrap',
      }}>
        <ScoreRing score={result.score} />
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '22px' }}>{theme.emoji}</span>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
              {result.city} SEO Audit
            </h2>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px', wordBreak: 'break-all' }}>
            {result.url}
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Pill count={passes} label="Passing" color="#2D8A4E" bg="#F0FFF4" />
            <Pill count={warnings} label="Warnings" color="#C27A1A" bg="#FFFBEB" />
            <Pill count={fails} label="Failing" color="#C0392B" bg="#FFF5F5" />
          </div>
        </div>
      </div>

      {/* Check list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {result.checks.map(check => (
          <CheckItem key={check.id} check={check} />
        ))}
      </div>

      {/* Tagline */}
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', fontStyle: 'italic' }}>
        {theme.tagline}
      </p>

      {result.id && (
        <button
          onClick={handleShare}
          style={{
            background: copied ? '#2D8A4E' : 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background 0.2s',
            alignSelf: 'flex-start',
          }}
        >
          {copied ? '✓ Link copied!' : '🔗 Share this report'}
        </button>
      )}
    </div>
  )
}

function Pill({ count, label, color, bg }: { count: number; label: string; color: string; bg: string }) {
  return (
    <span style={{
      background: bg,
      color,
      fontWeight: 600,
      fontSize: '13px',
      padding: '4px 12px',
      borderRadius: '999px',
    }}>
      {count} {label}
    </span>
  )
}
