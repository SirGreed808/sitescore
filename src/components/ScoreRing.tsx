'use client'

interface ScoreRingProps {
  score: number
}

export default function ScoreRing({ score }: ScoreRingProps) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const filled = circumference - (score / 100) * circumference

  const colorClass =
    score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low'

  const strokeColor =
    score >= 70 ? '#2D8A4E' : score >= 40 ? '#C27A1A' : '#C0392B'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
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
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x="64" y="64"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fill={strokeColor}
        >
          {score}
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
      <span className={colorClass} style={{ fontWeight: 600, fontSize: '14px' }}>
        {score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor'}
      </span>
    </div>
  )
}
