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

  const radius = 54
  const circumference = 2 * Math.PI * radius
  // At idle: fully unfilled (stroke-dashoffset === circumference)
  // At counting/done: filled according to score
  const filled = phase === 'idle'
    ? circumference
    : circumference - (score / 100) * circumference

  const colorClass =
    score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low'

  const strokeColor =
    score >= 70 ? '#2D8A4E' : score >= 40 ? '#C27A1A' : '#C0392B'

  const rafRef = useRef<number>(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // T+400ms: show "Calculating..."
    timers.push(setTimeout(() => setPhase('calculating'), 400))

    // T+900ms: hide "Calculating..."
    timers.push(setTimeout(() => setPhase('idle'), 900))

    // T+1000ms: start ring fill + count-up
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

    // T+2500ms: reveal status label
    timers.push(setTimeout(() => setPhase('done'), 2500))

    return () => {
      timers.forEach(clearTimeout)
      cancelAnimationFrame(rafRef.current)
    }
  }, [score])

  const showGlow = phase === 'done' && score >= 70

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={showGlow ? 'ring-glow' : ''}
        style={{ borderRadius: '50%', width: 128, height: 128 }}
      >
        <svg width="128" height="128" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={filled}
            strokeLinecap="round"
            transform="rotate(-90 64 64)"
            style={{
              transition: phase === 'counting'
                ? 'stroke-dashoffset 1400ms cubic-bezier(0.4, 0, 0.2, 1)'
                : 'none',
            }}
          />
          <text
            x="64" y="64"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="28"
            fontWeight="700"
            fill={strokeColor}
          >
            {phase === 'idle' ? '—' : displayScore}
          </text>
          <text
            x="64" y="82"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted)"
          >
            / 100
          </text>
        </svg>
      </div>

      {/* Calculating indicator */}
      <div
        style={{
          opacity: phase === 'calculating' ? 1 : 0,
          transition: 'opacity 300ms ease',
          height: '16px',
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
          style={{ fontWeight: 600, fontSize: '14px' }}
        >
          {score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor'}
        </span>
      )}
    </div>
  )
}
