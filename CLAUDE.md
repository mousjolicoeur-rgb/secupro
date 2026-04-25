# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (NODE_OPTIONS=--max-old-space-size=4096) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `vercel --prod` | Deploy to Vercel |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript strict mode |
| Styling | Tailwind CSS v4 + inline styles (cyan theme) |
| Auth & DB | Supabase (anon key client-side, service role server-side) |
| Payments | Stripe (9.99€/mois subscription) |
| Emails | Resend (noreply@secupro.app) |
| Monitoring | Sentry (tunnel /monitoring) |
| AI | Anthropic SDK |
| Maps | Leaflet + react-leaflet |
| Charts | Recharts |
| PDF | jsPDF + jspdf-autotable |
| OCR | Tesseract.js |
| Graphs | react-force-graph-2d + graphify |

---

## Architecture

**Two distinct user spaces:**
- `/agent/*` — Mobile-first interface for security agents
- `/espace-societe/*` — Dashboard for security companies

**Route organization:**
- Public routes: `/`, `/login`, `/register`, `/abonnement`, `/success`
- Agent space: `/agent/hub`, `/agent/planning`, `/agent/mission`, `/agent/calendrier`, `/agent/docs`, `/agent/paie`, `/agent/profil`, `/agent/espace-pro`, `/agent/secu-ai`, `/agent/actualites`, `/agent/support`
- Company space: `/espace-societe/dashboard`, `/espace-societe/support`
- Admin: `/dashboard`, `/dashboard-exploitation`, `/provisioning`, `/boss-admin-portal`

**API routes:** `/api/webhook`, `/api/planning`, `/api/provisioning`, `/api/performance-metrics`, `/api/actualites`, `/api/docs`, `/api/paie`, `/api/checkout`, `/api/notify`, `/api/admin`, `/api/gsc`

---

## Design System

- **Primary color:** Cyan `#00d1ff` (used inline for UI elements)
- **Backgrounds:** Dark navy `#0B1426` / `#0A1F2F`
- **Text:** `#f1f5f9` (primary), `rgba(148,163,184,0.75)` (secondary)
- **Theme:** Dark-only (`nocturne`), with toggle to light mode (`normal`)
- **Font:** Geist Sans + Geist Mono

**Styling convention:**
- Inline styles for custom components (visual consistency)
- Tailwind for layout and utility classes

---

## Supabase Configuration

- **Client-side:** Use `@/lib/supabaseClient` (anon key only, `public` schema)
- **Server-side:** Separate service role client for API routes/server actions
- **RLS policies:** Configured in `supabase/sql/` and `secupro-schema.sql`
- **Trigger:** `handle_new_user()` auto-creates profile on signup

**Key tables:**
- `profiles` — User profiles with `is_approved` flag
- `agents` — Agent records linked to organizations
- `agent_leads` — Lead form submissions (anonymous insert)
- `rapports` — Agent reports/missions
- `rapports_mensuels` — Monthly reports for companies
- `contrats` — Agent contracts
- `performances` — Monthly agent performance metrics
- `import_audits` — Import tracking

---

## Security

- **CSP:** Defined in `next.config.ts` only — never duplicate in `vercel.json`
- **Middleware:** Currently passthrough (CSP with nonce disabled until app stabilized)
- **Keys:** Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side
- **RLS:** Client uses anon key with strict policies; server uses service role

---

## Development Rules

1. **TypeScript:** Strict mode — no implicit `any`, always type async returns
2. **Build:** `NODE_OPTIONS=--max-old-space-size=4096` required (configured in `package.json`)
3. **Deployment:** Run `vercel --prod` after changes
4. **Stripe:** Live link at 9.99€/mois — don't recreate without confirmation
5. **Theme:** Use cyan primary, dark backgrounds — no other primary colors

---

## Key Files

| Path | Purpose |
|------|---------|
| `lib/supabaseClient.ts` | Browser Supabase client (anon key) |
| `lib/authClient.ts` | Auth helpers |
| `lib/authGuard.ts` | Route protection (checks `is_approved`) |
| `lib/agentSession.ts` | Agent session/profile persistence |
| `lib/theme.ts` | Theme state management |
| `services/agentLeadService.ts` | Lead insertion |
| `services/entrepriseService.ts` | Company CRUD |
| `services/rapportService.ts` | Report generation |
| `services/signalService.ts` | Mission signal/alerts |
| `components/AgentLanding.tsx` | Agent hub interface |
| `components/AgentTopBar.tsx` | Agent navigation bar |
| `components/AgentAvatar.tsx` | Agent avatar component |
| `components/VerrouTactique.tsx` | Feature lock component |

---

## Context

**Target:** French security agents (ADS) and security companies (gardiennage).
**Launch:** Early May 2026.
**Market:** ~180,000 French security agents.
**Founder:** Mustapha, Lyon (auto-entrepreneur APE 6201Z).
