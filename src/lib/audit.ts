import * as cheerio from 'cheerio'
import type { AuditCheck, AuditResult } from '@/types/audit'

export async function runAudit(url: string, city: string): Promise<AuditResult> {
  const result = await runAuditWithProgress(url, city, () => {})
  return result
}

// Runs checks one at a time, calling onCheck after each one completes.
// Used by the SSE streaming endpoint to push results as they arrive.
export async function runAuditWithProgress(
  url: string,
  city: string,
  onCheck: (check: AuditCheck) => void
): Promise<AuditResult> {
  const normalizedUrl = normalizeUrl(url)
  const html = await fetchPage(normalizedUrl)
  const $ = cheerio.load(html)
  const cityLower = city.toLowerCase()

  const checkFns = [
    () => checkHttps(normalizedUrl),
    () => checkTitle($, cityLower),
    () => checkMetaDescription($, cityLower),
    () => checkH1($),
    () => checkImages($),
    () => checkCityInBody($, cityLower),
  ]

  const checks: AuditCheck[] = []
  for (const fn of checkFns) {
    const check = fn()
    checks.push(check)
    onCheck(check)
  }

  const score = calculateScore(checks)
  return {
    url: normalizedUrl,
    city,
    score,
    checks,
    auditedAt: new Date().toISOString(),
  }
}

function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      // Mimic a real browser so sites don't block us
      'User-Agent': 'Mozilla/5.0 (compatible; SiteScore/1.0)',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`)
  }

  return res.text()
}

// V3 hook: add checkRobotsTxt(url), checkSitemap(url), checkPageSpeed(url), checkSchemaMarkup($), checkOpenGraph($) to checkFns above

function checkHttps(url: string): AuditCheck {
  const pass = url.startsWith('https://')
  return {
    id: 'https',
    label: 'HTTPS enabled',
    status: pass ? 'pass' : 'fail',
    value: pass ? 'Yes' : 'No',
    recommendation: pass ? null : 'Switch to HTTPS. Google uses it as a ranking signal and it builds visitor trust.',
  }
}

function checkTitle($: cheerio.CheerioAPI, city: string): AuditCheck {
  const title = $('title').first().text().trim()
  const length = title.length
  const hasCity = title.toLowerCase().includes(city)

  if (!title) {
    return {
      id: 'title',
      label: 'Page title',
      status: 'fail',
      value: 'Missing',
      recommendation: 'Add a page title. Include your city and primary service (e.g. "Plumber in Austin | Joe\'s Plumbing").',
    }
  }

  if (length < 30 || length > 60) {
    return {
      id: 'title',
      label: 'Page title',
      status: 'warning',
      value: `"${title}" (${length} chars)`,
      recommendation: `Title is ${length < 30 ? 'too short' : 'too long'}. Keep it between 30–60 characters for best display in search results.`,
    }
  }

  if (!hasCity) {
    return {
      id: 'title',
      label: 'Page title',
      status: 'warning',
      value: `"${title}"`,
      recommendation: `Add "${city}" to your title to improve local search visibility.`,
    }
  }

  return {
    id: 'title',
    label: 'Page title',
    status: 'pass',
    value: `"${title}"`,
    recommendation: null,
  }
}

function checkMetaDescription($: cheerio.CheerioAPI, city: string): AuditCheck {
  const desc = $('meta[name="description"]').attr('content')?.trim() ?? ''
  const length = desc.length
  const hasCity = desc.toLowerCase().includes(city)

  if (!desc) {
    return {
      id: 'meta-description',
      label: 'Meta description',
      status: 'fail',
      value: 'Missing',
      recommendation: 'Add a meta description (120–160 chars). Include your city and a call to action.',
    }
  }

  if (length < 80 || length > 160) {
    return {
      id: 'meta-description',
      label: 'Meta description',
      status: 'warning',
      value: `${length} characters`,
      recommendation: `Meta description is ${length < 80 ? 'too short' : 'too long'}. Aim for 120–160 characters.`,
    }
  }

  if (!hasCity) {
    return {
      id: 'meta-description',
      label: 'Meta description',
      status: 'warning',
      value: `${length} characters`,
      recommendation: `Add "${city}" to your meta description to signal local relevance to Google.`,
    }
  }

  return {
    id: 'meta-description',
    label: 'Meta description',
    status: 'pass',
    value: `${length} characters`,
    recommendation: null,
  }
}

function checkH1($: cheerio.CheerioAPI): AuditCheck {
  const h1s = $('h1')
  const count = h1s.length
  const text = h1s.first().text().trim()

  if (count === 0) {
    return {
      id: 'h1',
      label: 'H1 heading',
      status: 'fail',
      value: 'Missing',
      recommendation: 'Add one H1 tag. It should describe the page\'s main topic and include your primary keyword.',
    }
  }

  if (count > 1) {
    return {
      id: 'h1',
      label: 'H1 heading',
      status: 'warning',
      value: `${count} H1 tags found`,
      recommendation: 'Use only one H1 per page. Multiple H1s confuse search engines about the page\'s main topic.',
    }
  }

  return {
    id: 'h1',
    label: 'H1 heading',
    status: 'pass',
    value: `"${text}"`,
    recommendation: null,
  }
}

function checkImages($: cheerio.CheerioAPI): AuditCheck {
  const images = $('img')
  const total = images.length
  const missing = images.filter((_, el) => !$(el).attr('alt')?.trim()).length

  if (total === 0) {
    return {
      id: 'images-alt',
      label: 'Image alt text',
      status: 'pass',
      value: 'No images found',
      recommendation: null,
    }
  }

  if (missing === 0) {
    return {
      id: 'images-alt',
      label: 'Image alt text',
      status: 'pass',
      value: `All ${total} images have alt text`,
      recommendation: null,
    }
  }

  return {
    id: 'images-alt',
    label: 'Image alt text',
    status: missing === total ? 'fail' : 'warning',
    value: `${missing} of ${total} images missing alt text`,
    recommendation: 'Add descriptive alt text to all images. It helps accessibility and tells Google what the image shows.',
  }
}

function checkCityInBody($: cheerio.CheerioAPI, city: string): AuditCheck {
  const bodyText = $('body').text().toLowerCase()
  const count = (bodyText.match(new RegExp(city, 'g')) ?? []).length

  if (count === 0) {
    return {
      id: 'city-mention',
      label: `"${city}" mentioned on page`,
      status: 'fail',
      value: '0 mentions',
      recommendation: `Mention "${city}" naturally throughout your content. Google needs geographic signals to rank you in local searches.`,
    }
  }

  if (count < 3) {
    return {
      id: 'city-mention',
      label: `"${city}" mentioned on page`,
      status: 'warning',
      value: `${count} mention${count === 1 ? '' : 's'}`,
      recommendation: `Try to mention "${city}" at least 3–5 times naturally. Add it to headings, body copy, and your contact section.`,
    }
  }

  return {
    id: 'city-mention',
    label: `"${city}" mentioned on page`,
    status: 'pass',
    value: `${count} mentions`,
    recommendation: null,
  }
}

function calculateScore(checks: AuditCheck[]): number {
  const weights: Record<string, number> = {
    'https': 15,
    'title': 20,
    'meta-description': 20,
    'h1': 20,
    'images-alt': 10,
    'city-mention': 15,
  }

  let total = 0
  let earned = 0

  for (const check of checks) {
    const weight = weights[check.id] ?? 10
    total += weight
    if (check.status === 'pass') earned += weight
    if (check.status === 'warning') earned += weight * 0.5
  }

  return Math.round((earned / total) * 100)
}
