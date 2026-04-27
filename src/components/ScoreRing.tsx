'use client'

import { useState, useEffect, useRef } from 'react'

interface ScoreRingProps {
  score: number
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function ScoreRing({ score }: ScoreRingProps) {
  const [phase, setPhase] = useState<'idle' | 'calculating' | 'counting' | 'done'>('idle')
  const [displayScore, setDisplayScore] = useState(0)

  const radius = 72
  const circumference = 2 * Math.PI * radius
  const filled = phase === 'idle'
    ? circumference
    : circumference - (score / 100) * circumference

  const colorClass =
    score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low'

  const strokeColor =
    score >= 70 ? '#16A34A' : score >= 40 ? '#D97706' : '#DC2626'

  const bgFillColor =
    score >= 70 ? 'rgba(22, 163, 74, 0.08)' : score >= 40 ? 'rgba(217, 119, 6, 0.08)' : 'rgba(220, 38, 38, 0.08)'

  const rafRef = useRef<number>(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setPhase('calculating'), 400))
    timers.push(setTimeout(() => setPhase('idle'), 900))

    timers.push(
      setTimeout(() => {
        setPhase('counting')

        const start = performance.now()
        const duration = 1400

        const tick = (now: number) => {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = easeInOutCubic(progress)
          setDisplayScore(Math.round(eased * score))

          if (progress < 1) {
            rafRef.current = requestAnimationFrame(tick)
          }
        }

        rafRef.current = requestAnimationFrame(tick)
      }, 1000)
    )

    timers.push(setTimeout(() => setPhase('done'), 2500))

    return () => {
      timers.forEach(clearTimeout)
      cancelAnimationFrame(rafRef.current)
    }
  }, [score])

  const showGlow = phase === 'done' && score >= 70
  const showBreathe = phase === 'done' && score >= 70

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={showGlow ? 'ring-glow' : ''}
        style={{
          borderRadius: '50%',
          width: 176,
          height: 176,
          background: bgFillColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="176" height="176" viewBox="0 0 176 176">
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx="88" cy="88" r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="14"
          />
          {/* Progress */}
          <circle
            cx="88" cy="88" r={radius}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={filled}
            strokeLinecap="round"
            transform="rotate(-90 88 88)"
            style={{
              transition: phase === 'counting'
                ? 'stroke-dashoffset 1400ms cubic-bezier(0.4, 0, 0.2, 1)'
                : 'none',
            }}
          />
          <text
            x="88" y="84"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="48"
            fontWeight="700"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fill={strokeColor}
          >
            {phase === 'idle' ? '—' : displayScore}
          </text>
          <text
            x="88" y="108"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="14"
            fontWeight="500"
            fill="var(--muted)"
          >
            / 100
          </text>
        </svg>
      </div>

      {/* Breathing glow for high scores */}
      {showBreathe && (
        <div
          className="ring-breathe"
          style={{
            position: 'absolute',
            width: 176,
            height: 176,
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Calculating indicator */}
      <div
        style={{
          opacity: phase === 'calculating' ? 1 : 0,
          transition: 'opacity 300ms ease',
          height: '20px',
        }}
      >
        <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          Calculating...
        </span>
      </div>

      {/* Status label */}
      {phase === 'done' && (
        <span
          className={`${colorClass} ${score < 50 ? 'status-pulse' : ''} slide-up`}
          style={{
            fontWeight: 700,
            fontSize: '16px',
            fontFamily: 'var(--font-display), system-ui, sans-serif',
            letterSpacing: '-0.01em',
          }}
        >
          {score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor'}
        </span>
      )}
    </div>
  )
}
