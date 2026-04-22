'use client'

import { useState, useEffect } from 'react'
import type { AuditResult } from '@/types/audit'
import { getThemeForCity } from '@/lib/themes'
import AuditResults from '@/components/AuditResults'

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function Home() {
  const [url, setUrl] = useState('')
  const [city, setCity] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<AuditResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const theme = getThemeForCity(city || 'los angeles')

  // Apply theme CSS variables to :root whenever theme changes
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary', theme.primaryColor)
    root.style.setProperty('--secondary', theme.secondaryColor)
    root.style.setProperty('--accent', theme.accentColor)
    root.style.setProperty('--bg', theme.backgroundColor)
    root.style.setProperty('--card', theme.cardColor)
    root.style.setProperty('--text', theme.textColor)
    root.style.setProperty('--muted', theme.mutedColor)
  }, [theme])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setResult(null)
    setErrorMsg('')

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, city }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Audit failed')
      }

      setResult(data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 20px',
      gap: '40px',
    }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', maxWidth: '560px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>{theme.emoji}</div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', lineHeight: 1.2 }}>
          SiteScore
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '17px' }}>
          Free local SEO audit for any US city. Get your score and fix list in seconds.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          padding: '32px',
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="url" style={{ fontWeight: 600, fontSize: '14px' }}>Website URL</label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="yourbusiness.com"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="city" style={{ fontWeight: 600, fontSize: '14px' }}>City</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Los Angeles"
            required
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '14px',
            fontSize: '16px',
            fontWeight: 700,
            marginTop: '8px',
            opacity: status === 'loading' ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {status === 'loading' ? 'Auditing…' : 'Run Free Audit'}
        </button>
      </form>

      {status === 'error' && (
        <p style={{ color: '#C0392B', fontWeight: 500 }}>{errorMsg}</p>
      )}

      {status === 'done' && result && (
        <AuditResults result={result} theme={theme} />
      )}

      {/* Footer */}
      <footer style={{ marginTop: 'auto', paddingTop: '40px', color: 'var(--muted)', fontSize: '13px', textAlign: 'center' }}>
        Built by{' '}
        <a href="https://honestdev808.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Honest Dev Consulting
        </a>
      </footer>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  border: '1.5px solid var(--border)',
  borderRadius: '8px',
  padding: '12px 14px',
  fontSize: '15px',
  color: 'var(--text)',
  background: 'var(--bg)',
  outline: 'none',
  width: '100%',
}
