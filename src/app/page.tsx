'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin } from 'lucide-react'
import type { AuditCheck, AuditResult } from '@/types/audit'
import { getThemeForCity } from '@/lib/themes'
import AuditResults from '@/components/AuditResults'
import CheckItem from '@/components/CheckItem'

type Status = 'idle' | 'streaming' | 'done' | 'error'

export default function Home() {
  const [url,            setUrl]            = useState('')
  const [city,           setCity]           = useState('')
  const [status,         setStatus]         = useState<Status>('idle')
  const [streamedChecks, setStreamedChecks] = useState<AuditCheck[]>([])
  const [result,         setResult]         = useState<AuditResult | null>(null)
  const [errorMsg,       setErrorMsg]       = useState('')

  const theme = getThemeForCity(city || 'los angeles')

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary',    theme.primaryColor)
    root.style.setProperty('--secondary',  theme.secondaryColor)
    root.style.setProperty('--accent',     theme.accentColor)
    root.style.setProperty('--bg',         theme.backgroundColor)
    root.style.setProperty('--card',       theme.cardColor)
    root.style.setProperty('--text',       theme.textColor)
    root.style.setProperty('--muted',      theme.mutedColor)
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

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

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

  const isStreaming = status === 'streaming'

  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-16 gap-10"
      style={{ background: 'var(--bg)' }}>

      {/* Hero */}
      <div className="text-center max-w-xl">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
          style={{ background: 'var(--primary)' }}>
          <MapPin size={26} color="#fff" strokeWidth={2.5} />
        </div>
        <h1 className="font-heading font-extrabold text-5xl mb-3 leading-tight"
          style={{ color: 'var(--text)' }}>
          SiteScore
        </h1>
        <p className="text-lg" style={{ color: 'var(--muted)' }}>
          Find out why your business isn't showing up on Google.
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
          We check 6 things Google looks at when ranking local businesses. Takes 10 seconds.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl p-8 flex flex-col gap-5"
        style={{ background: 'var(--card)', boxShadow: 'var(--shadow)' }}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="url" className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Website URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="yourbusiness.com"
            required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-shadow duration-150
              focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1"
            style={{
              border:     '1.5px solid var(--border)',
              background: 'var(--bg)',
              color:      'var(--text)',
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Los Angeles"
            required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-shadow duration-150
              focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1"
            style={{
              border:     '1.5px solid var(--border)',
              background: 'var(--bg)',
              color:      'var(--text)',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isStreaming}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
            text-white font-semibold text-base mt-1 transition-opacity duration-200
            hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: 'var(--primary)', border: 'none' }}
        >
          <Search size={18} strokeWidth={2.5} />
          {isStreaming ? 'Auditing…' : 'Run Free Audit'}
        </button>
      </form>

      {status === 'error' && (
        <p className="text-sm font-medium" style={{ color: '#C0392B' }}>{errorMsg}</p>
      )}

      {/* Streaming checks — animate in one by one */}
      {isStreaming && streamedChecks.length > 0 && (
        <div className="flex flex-col gap-2.5 w-full max-w-2xl">
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Auditing <span className="font-semibold" style={{ color: 'var(--text)' }}>{url}</span>…
          </p>
          {streamedChecks.map(check => (
            <CheckItem key={check.id} check={check} animate />
          ))}
        </div>
      )}

      {status === 'done' && result && (
        <AuditResults result={result} theme={theme} />
      )}

      <footer className="mt-auto pt-8 text-xs text-center" style={{ color: 'var(--muted)' }}>
        Built by{' '}
        <a
          href="https://honestdev808.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          Honest Dev Consulting
        </a>
      </footer>
    </main>
  )
}
