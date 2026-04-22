# SiteScore

Free local SEO audit tool for small businesses. Enter any US city and your website URL — get a weighted score, a prioritized fix list, and a UI that matches the vibe of your city.

**Live:** [sitescore.honestdev808.com](https://sitescore.honestdev808.com)

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

Results stream in one by one as each check completes. Every issue includes a plain-language fix recommendation. Reports are saved to Supabase with a shareable URL.

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
- **Styling:** Tailwind v3 + CSS variables
- **Scraping:** cheerio
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## Features

- **SSE streaming** — checks appear one by one as they complete, with skeleton loading state
- **Shareable reports** — every audit gets a unique URL via Supabase (`/results/[id]`)
- **City-aware themes** — CSS variables swap at runtime per city, including hero gradient
- **Remembers last audit** — URL and city persist in localStorage
- **Lead CTA** — score-aware call to action at the bottom of every report

## Running locally

```bash
npm install
npm run dev
```

Add a `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # Home — form + streaming results
│   ├── layout.tsx                # Fonts + metadata
│   ├── globals.css               # Theme tokens + animations
│   ├── api/
│   │   ├── audit/route.ts        # POST /api/audit
│   │   └── audit/stream/route.ts # SSE streaming endpoint
│   └── results/[id]/page.tsx     # Shareable report page
├── components/
│   ├── AuditResults.tsx          # Score header + check list + lead CTA
│   ├── CheckItem.tsx             # Individual pass/warn/fail row
│   ├── ScoreRing.tsx             # Animated SVG score circle
│   └── ThemeApplier.tsx          # Client-side theme swap for /results pages
├── lib/
│   ├── audit.ts                  # Fetch, scrape, score logic
│   ├── themes.ts                 # City → theme mapping
│   └── supabase.ts               # Save + fetch audit reports
└── types/
    └── audit.ts                  # TypeScript interfaces
```

## Built by

[Honest Dev Consulting](https://honestdev808.com) — transparent consulting for small businesses and creators.
