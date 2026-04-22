# SiteScore

A free local SEO audit tool for small businesses. Enter a URL and city, get a weighted 0–100 score and a prioritized fix list — streamed to the screen in real time with a UI that shifts to match the city.

**Live:** [sitescore.honestdev808.com](https://sitescore.honestdev808.com)

![SiteScore results page showing Miami theme with score ring and streaming check items](docs/screenshot.png)

---

## Why I built this

Most small business owners don't know why they're invisible on Google. This tool gives them a plain-language answer in under 10 seconds — and shows off a few things I wanted to build: SSE streaming, dynamic theming via CSS variables, and a Supabase-backed shareable report URL.

## How it works

SiteScore fetches the page server-side, runs 6 checks, and streams each result to the client as it completes:

| Check | Weight |
|---|---|
| HTTPS enabled | 15 pts |
| Page title (length + city mention) | 20 pts |
| Meta description (length + city mention) | 20 pts |
| H1 tag (present, only one) | 20 pts |
| Image alt text | 10 pts |
| City mentioned in body content | 15 pts |

Every failing or warning check includes a one-line plain-language fix. The final report is saved to Supabase and gets a shareable URL (`/results/[id]`).

## City themes

The UI theme shifts dynamically based on the city entered — CSS variables swap at runtime, including the hero gradient:

| City | Theme |
|---|---|
| Los Angeles | Warm blues + golden accent |
| New York | Dark navy + cab yellow |
| Miami | Teal + neon pink |
| Seattle | Pacific greens |
| Any other city | Clean default |

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind v3 + CSS variables
- **Scraping:** cheerio
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## Features

- **SSE streaming** — checks appear one by one as they complete, with skeleton loading state before the first result
- **Shareable reports** — every audit gets a unique URL via Supabase (`/results/[id]`)
- **Dynamic theming** — CSS variables swap per city, applied via `useEffect` on the client
- **Remembers last audit** — URL and city persist in localStorage

## Running locally

```bash
git clone https://github.com/SirGreed808/sitescore.git
cd sitescore
npm install
```

Add a `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

```bash
npm run dev
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
│   ├── AuditResults.tsx          # Score header + check list
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
