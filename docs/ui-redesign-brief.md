# SiteScore — Visual Redesign Brief

**For:** Kimi K2.6
**Date:** 2026-04-25
**Project:** SiteScore — Local SEO Audit Tool
**Live:** Deployed on Vercel (Next.js App Router)

> **Before writing any Next.js code:** Read the relevant guide in `node_modules/next/dist/docs/` — this version may differ from your training data.

---

## About the App

SiteScore runs a local SEO audit on any website URL. The user enters a URL and city, the app streams 6 real-time audit checks via Server-Sent Events (SSE), and displays a 0–100 score with pass/warn/fail results. Reports are saved to Supabase and shareable via `/results/[id]`. The city theme system maps 16+ cities to distinct color palettes.

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v3, lucide-react, Supabase. Deployed on Vercel.

---

## Files to Know

| File | Role |
|---|---|
| `src/app/page.tsx` | Home page — client component. Form, SSE streaming, state, results rendering |
| `src/app/results/[id]/page.tsx` | Shareable report — server component |
| `src/components/AuditResults.tsx` | Score ring + check list + share button + CTA |
| `src/components/CheckItem.tsx` | Single check row (pass/warn/fail) |
| `src/components/ScoreRing.tsx` | Animated SVG score ring |
| `src/components/ThemeApplier.tsx` | Injects CSS theme vars client-side |
| `src/app/globals.css` | All CSS, keyframe animations, CSS variables |
| `src/lib/themes.ts` | City → theme color mapping |
| `src/types/audit.ts` | TypeScript types |

---

## This Is a Full Visual Redesign

Do NOT preserve the existing visual design. Replace it entirely. The current site has an indigo-leaning palette with standard card layouts — none of that carries over. Build something completely different.

**Interaction features from a previous pass are already built.** The following are functional in the current code — do NOT rebuild them, just restyle them to look right in your new design:

- Submit button transforms to "Scanning…" with spinner, inputs lock
- Rolling status feed (cycling messages + check count during streaming)
- Per-check entrance animations: pass = pop, warn = nudge, fail = shake + row flash
- Check recommendations hidden by default, expand on hover
- Score ring: staged reveal — T+0 at 0, T+1s count-up, T+2.5s status label, glow pulse for ≥70
- Share button: CheckCheck icon + "Link copied" on click, reverts after 2.5s
- "Compare with another city" CTA after results
- Audit history chips (last 3 runs, localStorage, below form)
- Shareable `/results/[id]` page with styled back-link

Your job: give all of the above a new face.

---

## Design Direction — Bright, Bold, Playful

**"The audit is an event. Make it feel like one."**

This site should look nothing like a typical SaaS tool or SEO checker. It should feel like something a design-obsessed developer built to show off. Joyful, colorful, energetic — every element has personality.

### Visual Principles

- **Bright.** White or near-white base. Color lives in cards, accents, shapes, and typography — not in the background itself. The page should feel light and alive.
- **Colorful.** Use 3–4 bold accent colors that feel cohesive but vivid. Don't pull from the Honest Dev brand (no navy, copper, cream). Make your own palette. Consider combinations like: electric yellow + cobalt + coral, lime + deep violet + hot orange, or cyan + magenta + warm yellow. Pick what you think looks great together and owns its identity.
- **Asymmetrical.** Not everything on a centered grid. Give cards subtle rotations (1–3°). Offset elements. Overlap layers with z-index depth. Use color blocks behind elements that don't perfectly align. The layout should feel curated, like a poster or editorial spread — not a form centered on a page.
- **Typographically loud.** Load a display/personality font from Google Fonts for headings, the score number, and key labels. Consider Syne, Fraunces, Space Grotesk, Clash Display (via Fontshare), Outfit, Cabinet Grotesk (via Fontshare), or any font with real personality. Pair it with a clean readable sans for body text and UI copy. Size contrast should be dramatic — the score number should be enormous.
- **Rounded and dimensional.** Cards with generous border-radius (16px+). Thick colored borders on key containers. Soft drop shadows with color (not just black/gray — shadow in the accent hue). Give the UI physical depth.

### The Score Ring

This is the hero element. Make it big, bold, and unmissable. Ideas (pick what works):
- Gradient stroke around the ring
- Very thick stroke with one of your accent colors
- A number inside in the display font at a large size
- A color fill behind the ring that changes with score (green/amber/red adapted to your palette)

### Check Items

Give each status type (pass/warn/fail) a distinctive visual treatment. Colored left borders, icon badge backgrounds, pill shapes with a fill, or stacked card styling. The three states should be instantly readable by color and shape alone.

### City Themes

The city theme system in `src/lib/themes.ts` maps cities to CSS custom properties that get injected by `ThemeApplier.tsx`. The mechanism stays, but **update the color values** for every theme to match the energy of the new design — vivid, saturated, distinct per city. The muted/washed palettes from the previous version won't fit here. Each city should feel exciting.

Update `primaryRgb` values to match your new `primary` colors. The `CityTheme` interface and `ThemeApplier.tsx` structure stays the same — just update the values.

---

## What You Can Change

Everything visual:
- `src/app/globals.css` — full replacement
- `src/app/page.tsx` — layout, class names, structural markup changes for design (keep all interaction logic)
- `src/components/AuditResults.tsx` — visual redesign
- `src/components/CheckItem.tsx` — visual redesign (keep animate prop and animation triggers)
- `src/components/ScoreRing.tsx` — visual redesign (keep the staged reveal sequence)
- `src/components/ThemeApplier.tsx` — only if needed to support new CSS var names
- `src/app/results/[id]/page.tsx` — visual redesign
- `src/lib/themes.ts` — update color values (not structure, not the `getThemeForCity` logic)
- `tailwind.config.js` — update the color palette to match your new design system
- `src/app/layout.tsx` — update Google Fonts imports for your chosen typefaces

---

## Files NOT to Touch

- `src/lib/audit.ts`
- `src/lib/supabase.ts`
- `src/app/api/audit/route.ts`
- `src/app/api/audit/stream/route.ts`
- `src/types/audit.ts` (unless a structural change forces a type update — keep additions minimal)
- The city matching logic in `themes.ts` (`getThemeForCity` function, abbreviation map) — only the color values change

---

## Acceptance Criteria

**Design:**
- [ ] Site looks completely different from the previous version — no carry-over of old colors, fonts, or layout conventions
- [ ] Display/personality font loaded and applied to headings and the score number
- [ ] 3–4 bold accent colors applied coherently throughout
- [ ] At least 2–3 asymmetrical layout choices visible (rotation, offset, overlap)
- [ ] Score ring is the visual focal point of the results section
- [ ] Pass/warn/fail check items have distinct visual treatments
- [ ] City themes updated with vivid palette values

**Functionality (must not break):**
- [ ] All streaming works end-to-end (6 SSE checks + done event)
- [ ] Rolling status feed still cycles and updates during streaming
- [ ] Per-check entrance animations still fire (pop/nudge/shake)
- [ ] Staged score reveal sequence still works (delay → count-up → status label → glow)
- [ ] Recommendation text still hidden by default, expands on hover
- [ ] Share button: CheckCheck + "Link copied" behavior still works
- [ ] "Compare with another city" CTA still navigates home and pre-fills URL
- [ ] Audit history chips still populate from localStorage and trigger re-runs
- [ ] Shareable `/results/[id]` page still loads and displays correctly
- [ ] Audit results still save to Supabase and return a shareable ID
- [ ] All error states still display
- [ ] City themes still apply on both home and results pages
- [ ] Flexible city matching still works (LA, NYC, "Los Angeles, CA" all resolve)
