'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { AuditCheck } from '@/types/audit'

const CONFIG = {
  pass:    { Icon: CheckCircle2,  color: '#2D8A4E', bg: '#F0FFF4', border: '#C6F6D5', iconAnim: 'icon-pop', rowAnim: 'pass-flash' },
  warning: { Icon: AlertTriangle, color: '#C27A1A', bg: '#FFFBEB', border: '#FEF3C7', iconAnim: 'icon-nudge', rowAnim: 'warn-flash' },
  fail:    { Icon: XCircle,       color: '#C0392B', bg: '#FFF5F5', border: '#FED7D7', iconAnim: 'icon-shake', rowAnim: 'fail-flash' },
}

export default function CheckItem({ check, animate = false }: { check: AuditCheck; animate?: boolean }) {
  const { Icon, color, bg, border, iconAnim, rowAnim } = CONFIG[check.status]
  const [expanded, setExpanded] = useState(false)

  const hasRecommendation = Boolean(check.recommendation)
  const isInteractive = hasRecommendation && (check.status === 'warning' || check.status === 'fail')

  return (
    <div
      className={`${animate ? 'check-enter' : ''} ${animate ? rowAnim : ''}`}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: '10px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        cursor: isInteractive ? 'pointer' : 'default',
      }}
      onClick={() => {
        if (isInteractive) setExpanded(prev => !prev)
      }}
      onMouseEnter={() => {
        if (isInteractive) setExpanded(true)
      }}
      onMouseLeave={() => {
        if (isInteractive) setExpanded(false)
      }}
    >
      <div className="flex items-center gap-3">
        <span className={animate ? iconAnim : ''}>
          <Icon size={18} color={color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
        </span>
        <span className="font-semibold text-sm flex-1" style={{ color: 'var(--text)' }}>
          {check.label}
        </span>
        {check.value && (
          <span className="text-xs font-medium ml-auto" style={{ color: 'var(--muted)' }}>
            {check.value}
          </span>
        )}
      </div>
      {check.recommendation && (
        <div
          style={{
            maxHeight: expanded ? '80px' : '0px',
            opacity: expanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 250ms ease',
          }}
        >
          <p className="text-xs leading-relaxed pl-7" style={{ color: 'var(--muted)' }}>
            {check.recommendation}
          </p>
        </div>
      )}
    </div>
  )
}
