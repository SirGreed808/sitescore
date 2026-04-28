'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, CheckCircle2, Loader2, Zap, Clock, Shield, FileText, ImageIcon } from 'lucide-react'
import type { AuditCheck, AuditResult } from '@/types/audit'
import { getThemeForCity } from '@/lib/themes'
import AuditResults from '@/components/AuditResults'
import CheckItem from '@/components/CheckItem'

type Status = 'idle' | 'streaming' | 'done' | 'error'


const ROLLING_MESSAGES = [
  '> Connecting to target...',
  '> Fetching page source...',
  '> Parsing HTML structure...',
  '> Running diagnostics...',
  '> Analyzing on-page signals...',
  '> Cross-checking local markers...',
]

const FEATURE_CHIPS = [
  { icon: Shield, label: 'HTTPS security', color: '#16A34A', bg: '#DCFCE7' },
  { icon: FileText, label: 'Title & meta', color: '#2563EB', bg: '#DBEAFE' },
  { icon: ImageIcon, label: 'Alt text & H1s', color: '#D97706', bg: '#FEF3C7' },
  { icon: MapPin, label: 'City mentions', color: '#DC2626', bg: '#FEE2E2' },
]

function normalizeUrl(raw: string): string {
  let url = raw.trim()
  url = url.replace(/^www\./, '')
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  return url
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [city, setCity] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [streamedChecks, setStreamedChecks] = useState<AuditCheck[]>([])
  const [result, setResult] = useState<AuditResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [mounted, setMounted] = useState(false)

  const urlInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const theme = getThemeForCity(city || 'los angeles')

  useEffect(() => {
    setMounted(true)
  }, [])

  /* Auto-focus URL input after mount */
  useEffect(() => {
    if (mounted && urlInputRef.current && !url) {
      urlInputRef.current.focus()
    }
  }, [mounted, url])

  /* Dynamic page title when result arrives */
  useEffect(() => {
    if (result) {
      document.title = `SiteScore — ${result.score} in ${result.city}`
    } else {
      document.title = 'SiteScore — Local SEO Audit Tool'
    }
    return () => { document.title = 'SiteScore — Local SEO Audit Tool' }
  }, [result])

  /* Scroll to results when done */
  useEffect(() => {
    if (status === 'done' && resultsRef.current) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [status])

  /* Keyboard shortcut: Cmd/Ctrl+Enter submits */
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && status !== 'streaming') {
        e.preventDefault()
        const form = document.querySelector('form')
        form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [status])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary', theme.primaryColor)
    root.style.setProperty('--secondary', theme.secondaryColor)
    root.style.setProperty('--accent', theme.accentColor)
    root.style.setProperty('--bg', theme.backgroundColor)
    root.style.setProperty('--card', theme.cardColor)
    root.style.setProperty('--text', theme.textColor)
    root.style.setProperty('--muted', theme.mutedColor)
    root.style.setProperty('--border', '#E2E8F0')
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
    const normalized = normalizeUrl(auditUrl)
    setUrl(normalized)
    setCity(auditCity)
    setStatus('streaming')
    setStreamedChecks([])
    setResult(null)
    setErrorMsg('')
    startRollingMessages()

    try {
      const res = await fetch('/api/audit/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized, city: auditCity }),
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

  const statusLineText = isStreaming && completedCheckCount > 0
    ? `> Check ${Math.min(completedCheckCount, 6)} of 6 complete`
    : rollingMessage

  const showStatusLine = isStreaming

  return (
    <main
      className="relative min-h-screen flex flex-col items-center px-5 py-16 gap-10 overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Grain texture overlay */}
      <div className="grain-overlay" />

      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="blob-float absolute -top-16 -right-16 w-96 h-96 rounded-full"
          style={{ background: 'var(--primary)', opacity: 0.12 }}
        />
        <div
          className="pulse-ring absolute top-8 -left-24 w-72 h-72 rounded-full"
          style={{ border: '4px solid var(--accent)', opacity: 0.15 }}
        />
        <div
          className="diamond-spin absolute top-[35%] -left-12 w-32 h-32"
          style={{ background: 'var(--secondary)', opacity: 0.14, borderRadius: '12px' }}
        />
        <div
          className="blob-float absolute top-[28%] right-[5%] w-48 h-20 rounded-full"
          style={{ background: 'var(--accent)', opacity: 0.1, animationDelay: '-3s' }}
        />
        <div
          className="blob-float absolute bottom-[25%] left-[8%] w-20 h-20 rounded-full"
          style={{ background: 'var(--primary)', opacity: 0.13, animationDelay: '-5s' }}
        />
        <div
          className="blob-float absolute bottom-[18%] left-[3%] w-12 h-12 rounded-full"
          style={{ background: 'var(--secondary)', opacity: 0.16, animationDelay: '-7s' }}
        />
        <div
          className="pulse-ring absolute bottom-16 right-[12%] w-40 h-40 rounded-full"
          style={{ border: '3px solid var(--primary)', opacity: 0.12, animationDelay: '-2s' }}
        />
        <div
          className="diamond-spin absolute bottom-[8%] left-[45%] w-16 h-16"
          style={{ background: 'var(--accent)', opacity: 0.1, borderRadius: '8px', animationDelay: '-6s' }}
        />
        <div
          className="blob-float absolute top-[55%] right-[2%] w-24 h-24 rounded-3xl"
          style={{ background: 'var(--secondary)', opacity: 0.1, animationDelay: '-4s' }}
        />
        <div
          className="blob-float absolute top-[60%] left-[6%] w-28 h-28 rounded-full"
          style={{ border: '3px dashed var(--primary)', opacity: 0.12, animationDelay: '-8s' }}
        />
      </div>

      {/* Hero */}
      <div className="relative text-center max-w-xl">
        <div className="relative inline-block mb-7">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl"
            style={{
              background: 'var(--primary)',
              transform: 'rotate(-3deg)',
              boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
            }}
          >
            <Zap size={36} color="#FFD600" strokeWidth={2.5} />
          </div>
          <div
            className="wiggle-badge absolute -top-2 -right-12 px-3 py-1 rounded-full text-sm font-bold"
            style={{
              background: '#FF6B6B',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
              fontFamily: 'var(--font-hand), cursive',
            }}
          >
            free! 🎉
          </div>
        </div>

        <h1
          className="hero-pop font-display font-bold text-6xl mb-2 leading-[1.05]"
          style={{
            letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          SiteScore
        </h1>

        <p
          className="hero-pop-delay-1 text-2xl mb-3"
          style={{
            fontFamily: 'var(--font-hand), cursive',
            color: 'var(--text)',
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          Find out why your business isn't showing up on Google
        </p>

        <p
          className="hero-pop-delay-2 text-sm mb-6 font-medium"
          style={{ color: 'var(--muted)' }}
        >
          We check 6 things Google looks at. Takes 10 seconds.
        </p>

        <div className="hero-pop-delay-3 flex flex-wrap items-center justify-center gap-2">
          {FEATURE_CHIPS.map(({ icon: Icon, label, color, bg }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: bg, color }}
            >
              <Icon size={12} strokeWidth={2.5} />
              {label}
            </span>
          ))}
          <span
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: '#F3E8FF', color: '#7C3AED' }}
          >
            <Clock size={12} strokeWidth={2.5} />
            10 sec
          </span>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-3xl p-8 flex flex-col gap-5 relative z-10"
        style={{
          background: 'var(--card)',
          border: '3px solid var(--primary)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="url"
            className="text-sm font-bold"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
          >
            Website URL
          </label>
          <input
            ref={urlInputRef}
            id="url"
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="yourbusiness.com"
            required
            disabled={isStreaming}
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            style={{
              border: '2px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              pointerEvents: isStreaming ? 'none' : 'auto',
              opacity: isStreaming ? 0.6 : 1,
              transition: 'opacity 200ms ease',
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="city"
            className="text-sm font-bold"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
          >
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
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            style={{
              border: '2px solid var(--border)',
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
          className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl text-white font-bold text-base mt-1 transition-all duration-200 hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: 'var(--primary)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
          }}
        >
          {isStreaming ? (
            <>
              <Loader2 size={20} strokeWidth={2.5} className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search size={20} strokeWidth={2.5} />
              Run Free Audit
            </>
          )}
        </button>
      </form>


      {status === 'error' && (
        <p className="text-sm font-bold relative z-10" style={{ color: '#DC2626' }}>{errorMsg}</p>
      )}

      {/* Status line */}
      {showStatusLine && (
        <div
          className="w-full max-w-2xl font-mono text-sm relative z-10"
          style={{ color: 'var(--muted)', opacity: 1, transition: 'opacity 300ms ease' }}
        >
          {statusLineText}
          <span className="cursor-blink ml-0.5">▍</span>
        </div>
      )}

      {/* Initial loading state */}
      {isStreaming && streamedChecks.length === 0 && (
        <div className="flex flex-col gap-3 w-full max-w-2xl relative z-10">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="skeleton-pulse w-full h-16 rounded-2xl"
              style={{ background: 'var(--border)', animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      )}

      {/* Streaming checks */}
      {isStreaming && streamedChecks.length > 0 && (
        <div className="flex flex-col gap-3 w-full max-w-2xl relative z-10">
          {streamedChecks.map(check => (
            <CheckItem key={check.id} check={check} animate />
          ))}
        </div>
      )}

      {/* Results — with scroll ref */}
      <div ref={resultsRef} className="w-full flex flex-col items-center relative z-10">
        {status === 'done' && result && (
          <AuditResults result={result} theme={theme} />
        )}
      </div>

      <footer className="mt-auto pt-10 text-xs text-center relative z-10" style={{ color: 'var(--muted)' }}>
        Built by{' '}
        <a
          href="https://honestdev808.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          Honest Dev Consulting
        </a>
      </footer>
    </main>
  )
}
