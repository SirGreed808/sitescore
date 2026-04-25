'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, CheckCircle2, Loader2 } from 'lucide-react'
import type { AuditCheck, AuditResult } from '@/types/audit'
import { getThemeForCity } from '@/lib/themes'
import AuditResults from '@/components/AuditResults'
import CheckItem from '@/components/CheckItem'

type Status = 'idle' | 'streaming' | 'done' | 'error'

interface HistoryItem {
  url: string
  city: string
  score: number
  id: string
}

const ROLLING_MESSAGES = [
  '> Connecting to target...',
  '> Fetching page source...',
  '> Parsing HTML structure...',
  '> Running diagnostics...',
  '> Analyzing on-page signals...',
  '> Cross-checking local markers...',
]

export default function Home() {
  const [url, setUrl] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('ss_url') ?? '' : '')
  const [city, setCity] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('ss_city') ?? '' : '')
  const [status, setStatus] = useState<Status>('idle')
  const [streamedChecks, setStreamedChecks] = useState<AuditCheck[]>([])
  const [result, setResult] = useState<AuditResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem('ss_history')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

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
    root.style.setProperty('--border', '#E5E7EB')
    root.style.setProperty('--primary-rgb', theme.primaryRgb)
  }, [theme])

  const rollingIndexRef = useRef(0)
  const rollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [rollingMessage, setRollingMessage] = useState(ROLLING_MESSAGES[0])

  function startRollingMessages() {
    rollingIndexRef.current = 0
    setRollingMessage(ROLLING_MESSAGES[0])

    function cycle() {
      rollingTimerRef.current = setTimeout(() => {
        rollingIndexRef.current = (rollingIndexRef.current + 1) % ROLLING_MESSAGES.length
        setRollingMessage(ROLLING_MESSAGES[rollingIndexRef.current])
        cycle()
      }, 900)
    }
    cycle()
  }

  function stopRollingMessages() {
    if (rollingTimerRef.current) {
      clearTimeout(rollingTimerRef.current)
      rollingTimerRef.current = null
    }
  }

  const runAudit = useCallback(async (auditUrl: string, auditCity: string) => {
    setUrl(auditUrl)
    setCity(auditCity)
    setStatus('streaming')
    setStreamedChecks([])
    setResult(null)
    setErrorMsg('')
    localStorage.setItem('ss_url', auditUrl)
    localStorage.setItem('ss_city', auditCity)
    startRollingMessages()

    try {
      const res = await fetch('/api/audit/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: auditUrl, city: auditCity }),
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
            setStreamedChecks(prev => {
              const next = [...prev, event.check]
              return next
            })
          } else if (event.type === 'done') {
            stopRollingMessages()
            setResult(event.result)
            setStatus('done')

            // Save to history
            if (event.result.id) {
              setHistory(prev => {
                const next = [{
                  url: event.result.url,
                  city: event.result.city,
                  score: event.result.score,
                  id: event.result.id,
                }, ...prev].slice(0, 3)
                localStorage.setItem('ss_history', JSON.stringify(next))
                return next
              })
            }
          } else if (event.type === 'error') {
            throw new Error(event.error)
          }
        }
      }
    } catch (err) {
      stopRollingMessages()
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await runAudit(url, city)
  }

  const isStreaming = status === 'streaming'
  const completedCheckCount = streamedChecks.length
  const isRolling = isStreaming && completedCheckCount === 0

  const statusLineText = isStreaming && completedCheckCount > 0
    ? `> Check ${Math.min(completedCheckCount, 6)} of 6 complete`
    : rollingMessage

  const showStatusLine = isStreaming

  return (
    <main className="relative min-h-screen flex flex-col items-center px-5 py-16 gap-10"
      style={{ background: 'var(--bg)' }}>

      {/* City-tinted hero glow */}
      <div className="absolute inset-x-0 top-0 h-[480px] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ background: 'radial-gradient(ellipse 80% 100% at 50% 0%, var(--primary), transparent 70%)' }} />
      </div>

      {/* Hero */}
      <div className="relative text-center max-w-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
          style={{ background: 'var(--primary)' }}>
          <MapPin size={28} color="#fff" strokeWidth={2.5} />
        </div>
        <h1 className="font-heading font-extrabold text-5xl mb-3 leading-tight"
          style={{ color: 'var(--text)' }}>
          SiteScore
        </h1>
        <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>
          Find out why your business isn't showing up on Google.
        </p>
        <p className="text-sm mt-2 mb-5" style={{ color: 'var(--muted)' }}>
          We check 6 things Google looks at when ranking local businesses. Takes 10 seconds.
        </p>
        <div className="flex flex-col items-center gap-1.5">
          {[
            'HTTPS security, page title & meta description',
            'H1 headings, image alt text & city mentions',
            'Prioritized fix recommendations included',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
              <CheckCircle2 size={13} color="var(--accent)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
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
            disabled={isStreaming}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200
              focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1"
            style={{
              border: '1.5px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              pointerEvents: isStreaming ? 'none' : 'auto',
              opacity: isStreaming ? 0.6 : 1,
              transition: 'opacity 200ms ease',
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
            disabled={isStreaming}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200
              focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1"
            style={{
              border: '1.5px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              pointerEvents: isStreaming ? 'none' : 'auto',
              opacity: isStreaming ? 0.6 : 1,
              transition: 'opacity 200ms ease',
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
          {isStreaming ? (
            <>
              <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search size={18} strokeWidth={2.5} />
              Run Free Audit
            </>
          )}
        </button>
      </form>

      {/* History chips */}
      {history.length > 0 && (
        <div className="w-full max-w-lg flex items-center gap-2 flex-wrap slide-up">
          <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Recent:</span>
          {history.map((item, i) => {
            const scoreColor = item.score >= 70 ? '#2D8A4E' : item.score >= 40 ? '#C27A1A' : '#C0392B'
            return (
              <button
                key={`${item.id}-${i}`}
                onClick={() => runAudit(item.url, item.city)}
                className="cursor-pointer"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  background: 'var(--card)',
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                  transition: 'opacity 200ms ease, transform 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                {(() => {
                  try {
                    return new URL(item.url).hostname.replace(/^www\./, '')
                  } catch {
                    return item.url
                  }
                })()} / {item.city}{' '}
                <span style={{ color: scoreColor, fontWeight: 600 }}>— {item.score}</span>
              </button>
            )
          })}
        </div>
      )}

      {status === 'error' && (
        <p className="text-sm font-medium" style={{ color: '#C0392B' }}>{errorMsg}</p>
      )}

      {/* Status line */}
      {showStatusLine && (
        <div
          className="w-full max-w-2xl font-mono text-sm"
          style={{
            color: 'var(--muted)',
            opacity: 1,
            transition: 'opacity 300ms ease',
          }}
        >
          {statusLineText}
          <span className="cursor-blink ml-0.5">▍</span>
        </div>
      )}

      {/* Initial loading state — before first check arrives */}
      {isStreaming && streamedChecks.length === 0 && (
        <div className="flex flex-col gap-2.5 w-full max-w-2xl">
          {[0, 1, 2].map(i => (
            <div key={i} className="skeleton-pulse w-full h-14 rounded-xl"
              style={{ background: 'var(--border)', animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      )}

      {/* Streaming checks — animate in one by one */}
      {isStreaming && streamedChecks.length > 0 && (
        <div className="flex flex-col gap-2.5 w-full max-w-2xl">
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
