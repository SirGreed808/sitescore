import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { AuditCheck } from '@/types/audit'

const CONFIG = {
  pass:    { Icon: CheckCircle2,  color: '#2D8A4E', bg: '#F0FFF4', border: '#C6F6D5' },
  warning: { Icon: AlertTriangle, color: '#C27A1A', bg: '#FFFBEB', border: '#FEF3C7' },
  fail:    { Icon: XCircle,       color: '#C0392B', bg: '#FFF5F5', border: '#FED7D7' },
}

export default function CheckItem({ check, animate = false }: { check: AuditCheck; animate?: boolean }) {
  const { Icon, color, bg, border } = CONFIG[check.status]

  return (
    <div
      className={animate ? 'check-enter' : ''}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: '10px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} color={color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
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
        <p className="text-xs leading-relaxed pl-7" style={{ color: 'var(--muted)' }}>
          {check.recommendation}
        </p>
      )}
    </div>
  )
}
