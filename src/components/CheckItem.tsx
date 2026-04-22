import type { AuditCheck } from '@/types/audit'

const ICONS: Record<string, string> = {
  pass: '✓',
  warning: '⚠',
  fail: '✗',
}

export default function CheckItem({ check }: { check: AuditCheck }) {
  const bgClass = `status-${check.status}-bg`

  return (
    <div
      className={bgClass}
      style={{
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className={`status-${check.status}`} style={{ fontWeight: 700, fontSize: '16px', minWidth: '16px' }}>
          {ICONS[check.status]}
        </span>
        <span style={{ fontWeight: 600, fontSize: '15px' }}>{check.label}</span>
        {check.value && (
          <span style={{ color: 'var(--muted)', fontSize: '13px', marginLeft: 'auto' }}>
            {check.value}
          </span>
        )}
      </div>
      {check.recommendation && (
        <p style={{ fontSize: '13px', color: 'var(--muted)', paddingLeft: '26px', lineHeight: '1.5' }}>
          {check.recommendation}
        </p>
      )}
    </div>
  )
}
