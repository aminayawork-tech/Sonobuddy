# SonoBuddy — CLAUDE.md

## What This App Is

SonoBuddy is a **Progressive Web App (PWA)** built for sonographers (ultrasound technologists), particularly new graduates entering the field. It provides instant, phone-in-pocket access to:

- **Measurement reference tables** — normal/abnormal values with clinical context
- **Exam protocols** — step-by-step guides with tips, key images, and report checklists
- **Calculators** — ABI, Resistive Index, organ volume, AFI, gestational age, EDD, thyroid volume
- **Pathology library** — ultrasound findings, red flags, differentials, and reporting tips

Target market: 12,000–50,000 active sonographers in the US. MVP competitors include _Ultrasound Protocol Handbook_ ($14.99/mo), _EchoRef_ (free, cardiac-heavy), and physical cheat sheets.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 with custom `sono-*` colors |
| PWA | next-pwa (service worker + manifest) |
| Icons | lucide-react |
| Utilities | clsx |
| Deployment | Vercel (zero-config) |

**No backend, no database** in MVP. All content is static TypeScript data files bundled with the app.

---

## Directory Structure

```
/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Navigation, PWA meta)
│   ├── page.tsx                  # Home / Search page
│   ├── globals.css               # Global styles (Tailwind + custom)
│   ├── measurements/
│   │   └── page.tsx              # Measurement tables with filter + expand
│   ├── protocols/
│   │   ├── page.tsx              # Protocol list with search
│   │   └── [id]/page.tsx         # Protocol detail (steps / images / report tabs)
│   ├── calculators/
│   │   └── page.tsx              # Calculator list + inline calculator UI
│   └── pathologies/
│       └── page.tsx              # Pathology cards with red flags
│
├── components/                   # Reusable UI components
│   ├── Navigation.tsx            # Fixed bottom nav bar (5 tabs)
│   ├── SearchBar.tsx             # Global search with dropdown results
│   ├── RangeBar.tsx              # Color-coded normal/abnormal range display
│   ├── CategoryBadge.tsx         # Category pill badge
│   └── PageHeader.tsx            # Page header with optional back link
│
├── data/                         # All clinical content (TypeScript)
│   ├── measurements.ts           # ~20 measurements (vascular, abdomen, OB, thyroid, cardiac)
│   ├── protocols.ts              # ~6 protocols with full step-by-step content
│   ├── calculators.ts            # ~8 calculators with formulas + compute functions
│   └── pathologies.ts            # ~8 pathologies with US findings + red flags
│
├── lib/
│   └── search.ts                 # Global cross-section search aggregator
│
├── public/
│   ├── manifest.json             # PWA manifest (icons, colors, shortcuts)
│   ├── robots.txt
│   └── icons/                    # PWA icons (192x192, 512x512 — generate these)
│
├── next.config.js                # next-pwa config
├── tailwind.config.ts            # Custom colors + dark mode
├── tsconfig.json
├── package.json
└── .env.example                  # Environment variable template
```

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (also generates PWA service worker)
npm run start        # Serve production build locally
npm run lint         # ESLint
```

**Note:** PWA service worker is disabled in development (`NODE_ENV === 'development'`). Run `npm run build && npm run start` to test PWA behavior locally.

---

## Design System

### Colors (Tailwind custom config)

All custom colors are under the `sono` prefix:

```
sono-blue    #0EA5E9   — primary accent, interactive elements
sono-cyan    #06B6D4   — secondary accent
sono-dark    #0F172A   — page background
sono-card    #1E293B   — card/surface background
sono-border  #334155   — borders
sono-muted   #64748B   — secondary text, placeholders
sono-green   #10B981   — success/normal values
sono-amber   #F59E0B   — warning/borderline values
sono-red     #EF4444   — danger/abnormal values
```

### Dark Mode

The app is **dark mode only** (`darkMode: 'class'` in tailwind.config, `dark` class on `<html>`). Sonographers often scan in darkened rooms — dark UI reduces eye strain.

### Spacing Conventions

- `pb-nav` utility class = `padding-bottom: calc(76px + env(safe-area-inset-bottom))` — ensures content isn't hidden behind the fixed nav
- `safe-area-bottom` on the nav itself handles iPhone notch/home bar
- All pages start with `pt-12` to clear the top safe area (no top nav bar by design)

### Typography

- System font stack via Tailwind (no external font loading for performance)
- Cards: `text-sm` for primary content, `text-xs` for secondary
- Section labels: `text-[11px] font-semibold uppercase tracking-wide`

---

## Data Layer Conventions

### Adding Measurements (`data/measurements.ts`)

Each `Measurement` requires:
- `id`: kebab-case unique string
- `name`: Human-readable display name
- `category`: one of `MeasurementCategory` union
- `ranges`: array of `NormalRange` objects (ordered normal → abnormal → critical)
- `tags`: search keywords (lowercase, include synonyms)
- `clinicalNote`: practical exam-room context

Range color coding is **positional** (index 0 = green, 1 = amber, 2 = red, 3 = blue) — order your ranges from normal to most abnormal.

### Adding Protocols (`data/protocols.ts`)

Each `Protocol` requires:
- `steps`: ordered array — each step has `title`, `description`, optional `probe`, optional `tips[]`
- `keyImages`: flat string array — what images to save to PACS
- `reportChecklist`: items to include in the written report
- `difficulty`: `'beginner' | 'intermediate' | 'advanced'`

### Adding Calculators (`data/calculators.ts`)

1. Add a `Calculator` object to the `calculators` array
2. Add a calculation function (pure function, returns `CalcResult`)
3. Wire it in the `calculate()` switch in `app/calculators/page.tsx`

`CalcResult.color` drives the result card color: `'green' | 'amber' | 'red' | 'blue'`.

### Adding Pathologies (`data/pathologies.ts`)

Each `Pathology` requires:
- `ultrasoundFindings`: list of sonographic features
- `redFlags`: critical findings that change management
- `differentials`: what to rule out
- `reportingTips`: practical advice for writing the report

---

## Key Architectural Decisions

### Why No Backend (MVP)

All content is hardcoded TypeScript. This means:
- Zero server cost
- Works offline (PWA service worker caches JS)
- Instant search (client-side filter, no API latency)
- No auth complexity

**Trade-off:** Content updates require a code deploy. Acceptable for MVP — users won't notice a small delay between "this measurement changed" and "it's in the app."

### Global Search Architecture

`lib/search.ts` aggregates results from all four data modules. The `SearchBar` component calls `globalSearch()` client-side with debounce-free real-time filtering (data is small enough). Results are typed and carry a `href` for direct navigation.

### Calculator Architecture

Calculators are self-contained: `data/calculators.ts` exports both the schema (`Calculator[]`) and the compute functions. The page wires them in a switch statement. This keeps all math logic testable and separate from UI.

### No ORM / No DB

If/when a backend is needed (user accounts, saved favorites, premium gating), the recommended path is:
- **Auth**: Clerk (easy, has free tier) or NextAuth.js
- **DB**: Supabase (Postgres) or PlanetScale
- **Payments**: Stripe (one-time or subscription)

---

## Premium Tier (Roadmap)

The MVP is entirely free. The planned premium tier unlocks:

1. **Full pathologies library** (more conditions, annotated images)
2. **Advanced protocols** (OB anatomy survey, penile duplex, portal hypertension)
3. **Favorites** (pin measurements/protocols for quick access)
4. **Today's Scans** (quick worklist for busy days)
5. **Beginner tips** (what to double-check as a new grad)
6. **Offline mode** (enhanced — currently partial via PWA)
7. **Dark/light mode toggle**
8. **Custom units** (cm vs mm)

Gating strategy: free content works fully offline and unauthenticated. Premium requires auth + Stripe subscription check.

---

## Clinical Accuracy Standards

- All measurement ranges are sourced from published guidelines (SRU, AIUM, ACR, ACOG, ACC/AHA)
- When in doubt, cite the source in `clinicalNote` or `reference` fields
- Never state absolute diagnostic conclusions — use "concern for," "consider," "correlate clinically"
- TI-RADS scoring follows **ACR TI-RADS 2017** (not TIRADS-EU)
- Carotid stenosis follows **SRU 2003 consensus** criteria

**IMPORTANT:** SonoBuddy is a **reference tool**, not a diagnostic authority. Clinical decisions must involve the ordering provider and interpreting physician.

---

## Adding PWA Icons

The app needs real PNG icons at `public/icons/icon-192.png` and `public/icons/icon-512.png`. Generate using:

```bash
# Option 1: Use a tool like pwa-asset-generator
npx pwa-asset-generator logo.svg public/icons --manifest public/manifest.json

# Option 2: Create manually with any image editor
# 192×192 and 512×512 PNG, dark background (#0F172A), stethoscope or ultrasound icon
```

---

## Deployment (Vercel)

```bash
# Push to main branch → auto-deploys on Vercel
git push origin main

# Or deploy manually
vercel --prod
```

Zero configuration needed. Vercel detects Next.js automatically. PWA service worker is generated at build time by `next-pwa`.

Set environment variables in Vercel dashboard (see `.env.example`).

---

## Testing Checklist Before PR

- [ ] `npm run build` completes without error
- [ ] `npm run lint` passes
- [ ] Search returns relevant results for "aorta", "carotid", "abi", "dvt"
- [ ] All calculators return a result with correct interpretation
- [ ] Protocol detail page renders all tabs (steps / images / report)
- [ ] Bottom nav highlights the active route correctly
- [ ] No hydration errors in browser console
- [ ] Mobile layout looks correct at 390px width (iPhone 14 viewport)
