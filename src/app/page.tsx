'use client'

import { useState, useEffect } from 'react'
import type { AuditCheck, AuditResult } from '@/types/audit'
import { getThemeForCity } from '@/lib/themes'
import AuditResults from '@/components/AuditResults'
import CheckItem from '@/components/CheckItem'

type Status = 'idle' | 'streaming' | 'done' | 'error'

export default function Home() {
  const [url, setUrl] = useState('')
  const [city, setCity] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [streamedChecks, setStreamedChecks] = useState<AuditCheck[]>([])
  const [result, setResult] = useState<AuditResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const theme = getThemeForCity(city || 'los angeles')

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
    setStatus('streaming')
    setStreamedChecks([])
    setResult(null)
    setErrorMsg('')

    try {
      const res = await fetch('/api/audit/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, city }),
      })

      if (!res.body) throw new Error('No response stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          const event = JSON.parse(part.slice(6))

          if (event.type === 'check') {
            setStreamedChecks(prev => [...prev, event.check])
          } else if (event.type === 'done') {
            setResult(event.result)
            setStatus('done')
          } else if (event.type === 'error') {
            throw new Error(event.error)
          }
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  const isActive = status === 'streaming' || status === 'done'

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
          disabled={status === 'streaming'}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '14px',
            fontSize: '16px',
            fontWeight: 700,
            marginTop: '8px',
            opacity: status === 'streaming' ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {status === 'streaming' ? 'Auditing…' : 'Run Free Audit'}
        </button>
      </form>

      {status === 'error' && (
        <p style={{ color: '#C0392B', fontWeight: 500 }}>{errorMsg}</p>
      )}

      {/* Streaming checks — appear one by one, replaced by full results when done */}
      {isActive && status !== 'done' && streamedChecks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '680px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 500 }}>
            Auditing {url}…
          </p>
          {streamedChecks.map(check => (
            <CheckItem key={check.id} check={check} />
          ))}
        </div>
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
