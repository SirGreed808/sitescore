'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { AuditCheck } from '@/types/audit'

const CONFIG = {
  pass:    {
    Icon: CheckCircle2,
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#86EFAC',
    iconBg: '#DCFCE7',
    iconAnim: 'icon-pop',
    rowAnim: 'pass-flash',
  },
  warning: {
    Icon: AlertTriangle,
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FCD34D',
    iconBg: '#FEF3C7',
    iconAnim: 'icon-nudge',
    rowAnim: 'warn-flash',
  },
  fail:    {
    Icon: XCircle,
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FCA5A5',
    iconBg: '#FEE2E2',
    iconAnim: 'icon-shake',
    rowAnim: 'fail-flash',
  },
}

export default function CheckItem({ check, animate = false }: { check: AuditCheck; animate?: boolean }) {
  const { Icon, color, bg, border, iconBg, iconAnim, rowAnim } = CONFIG[check.status]
  const [expanded, setExpanded] = useState(false)

  const hasRecommendation = Boolean(check.recommendation)
  const isInteractive = hasRecommendation && (check.status === 'warning' || check.status === 'fail')

  return (
    <div
      className={`${animate ? 'check-enter' : ''} ${animate ? rowAnim : ''}`}
      style={{
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: '16px',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
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
      <div className="flex items-center gap-3.5">
        <span
          className={animate ? iconAnim : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 12,
            background: iconBg,
            flexShrink: 0,
          }}
        >
          <Icon size={20} color={color} strokeWidth={2.5} />
        </span>
        <span
          className="font-semibold text-sm flex-1"
          style={{
            color: 'var(--text)',
            fontFamily: 'var(--font-display), system-ui, sans-serif',
          }}
        >
          {check.label}
        </span>
        {check.value && (
          <span
            className="text-xs font-semibold ml-auto px-2.5 py-1 rounded-lg"
            style={{
              color: color,
              background: iconBg,
            }}
          >
            {check.value}
          </span>
        )}
      </div>
      {check.recommendation && (
        <div
          style={{
            maxHeight: expanded ? '100px' : '0px',
            opacity: expanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <p
            className="text-xs leading-relaxed pl-[50px]"
            style={{ color: 'var(--muted)' }}
          >
            {check.recommendation}
          </p>
        </div>
      )}
    </div>
  )
}
