# SiteScore

Free local SEO audit tool. Enter any US city and your website URL — get a score, a prioritized fix list, and a UI that matches the vibe of your city.

**Live:** [sitescore-lac.vercel.app](https://sitescore-lac.vercel.app)

---

## What it does

SiteScore audits a webpage against 6 local SEO signals and returns a weighted 0–100 score with actionable recommendations:

| Check | Weight |
|---|---|
| HTTPS enabled | 15 pts |
| Page title (length + city mention) | 20 pts |
| Meta description (length + city mention) | 20 pts |
| H1 tag (present, only one) | 20 pts |
| Image alt text | 10 pts |
| City mentioned in body content | 15 pts |

Results include a pass/warning/fail breakdown and a one-line fix for every issue found.

## City themes

The UI theme shifts based on the city you enter:

| City | Vibe |
|---|---|
| Los Angeles | Warm coastal blues, golden hour |
| New York | Concrete grey, cab yellow |
| Miami | Neon pink/teal, Art Deco |
| Seattle | Pacific greens, morning fog |
| Any other city | Clean default |

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Scraping:** cheerio
- **Deployment:** Vercel

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Home — form + results
│   ├── api/audit/route.ts    # POST /api/audit endpoint
│   └── globals.css           # Theme CSS variables
├── components/
│   ├── AuditResults.tsx      # Score header + check list
│   ├── CheckItem.tsx         # Individual pass/warn/fail row
│   └── ScoreRing.tsx         # Animated SVG score circle
├── lib/
│   ├── audit.ts              # Fetch, scrape, score logic
│   └── themes.ts             # City → theme mapping
└── types/
    └── audit.ts              # TypeScript type definitions
```

## Built by

[Honest Dev Consulting](https://honestdev808.com) — transparent web consulting for small businesses and creators.
