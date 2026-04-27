// V2 hook: add 'streaming' status for SSE progress updates
export type CheckStatus = 'pass' | 'fail' | 'warning'

export interface AuditCheck {
  id: string
  label: string
  status: CheckStatus
  value: string | null  // what we found
  recommendation: string | null  // what to fix, null if passing
}

export interface AuditResult {
  url: string
  city: string
  score: number          // 0-100
  checks: AuditCheck[]
  auditedAt: string      // ISO timestamp
  // V2 hook: id string for shareable URLs (populated when saved to Supabase)
  id?: string
}

export interface AuditRequest {
  url: string
  city: string
}

// City themes
export type ThemeKey =
  | 'los-angeles' | 'new-york' | 'miami' | 'seattle' | 'chicago' | 'austin'
  | 'denver' | 'portland' | 'nashville' | 'new-orleans' | 'san-francisco' | 'boston'
  | 'atlanta' | 'phoenix' | 'las-vegas' | 'honolulu'
  | 'dallas' | 'houston' | 'san-diego' | 'san-jose' | 'philadelphia' | 'san-antonio'
  | 'detroit' | 'columbus' | 'indianapolis' | 'jacksonville' | 'fort-worth' | 'charlotte'
  | 'el-paso' | 'memphis' | 'baltimore' | 'milwaukee' | 'tucson' | 'fresno'
  | 'sacramento' | 'mesa' | 'kansas-city' | 'washington-dc' | 'tampa' | 'riverside'
  | 'raleigh' | 'long-beach' | 'virginia-beach' | 'oakland' | 'minneapolis' | 'tulsa'
  | 'st-louis' | 'pittsburgh' | 'cleveland' | 'anaheim'
  | 'default'

export interface CityTheme {
  key: ThemeKey
  label: string
  // CSS variable values injected at runtime
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  cardColor: string
  textColor: string
  mutedColor: string
  // RGB string for rgba() effects (e.g. "26, 111, 168")
  primaryRgb: string
  emoji: string
  tagline: string
}
