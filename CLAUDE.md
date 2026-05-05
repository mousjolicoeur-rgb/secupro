# CLAUDE.md — SecuPRO

## Projet

SecuPRO est une plateforme SaaS B2B de **gestion opérationnelle pour la sécurité privée** (agents et entreprises). Deux espaces distincts : espace agent (mobile-first) et espace société (dashboard exploitation).

Abonnement : 9,99 €/mois via Stripe. Déploiement : **Vercel** (`vercel --prod`).

---

## Stack technique

| Couche | Techno |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Langage | TypeScript strict |
| Style | Tailwind CSS v4 + inline styles (tokens cyan) |
| Auth & DB | Supabase (anon key côté client, service key côté API) |
| Paiement | Stripe (webhook + lien de paiement live) |
| Emails | Resend (`noreply@secupro.app`) |
| Erreurs | Sentry (tunnel `/monitoring`, sourcemaps désactivées) |
| AI | Anthropic SDK — feature SecuAI (`/agent/secu-ai`) |
| PDF | jsPDF + jspdf-autotable |
| Cartes | Leaflet + react-leaflet |
| Charts | Recharts |
| OCR | Tesseract.js |
| Graphes | react-force-graph-2d + graphify |

---

## Architecture des routes (App Router)

```
/                          Landing page publique
/login                     Connexion agent
/register                  Inscription agent
/abonnement                Page abonnement Stripe
/success                   Confirmation paiement Stripe

/agent                     Hub agent (AgentLanding + AgentTopBar)
/agent/hub                 Tableau de bord principal
/agent/planning            Planning de l'agent
/agent/mission             Fiche mission
/agent/calendrier          Calendrier
/agent/docs                Documents
/agent/paie                Bulletins de paie
/agent/profil              Profil agent
/agent/espace-pro          Espace professionnel
/agent/secu-ai             IA conversationnelle (Anthropic)
/agent/actualites          Actualités sécurité
/agent/support             Support
/agent/code                Code de conduite
/agent/activate            Activation compte agent

/espace-societe            Connexion société
/espace-societe/dashboard  Dashboard exploitation société
/espace-societe/support    Support société
/espace-societe/activate   Activation compte société

/dashboard                 Dashboard performance (PerformanceDashboard)
/dashboard-exploitation    Planning mensuel exploitation
/provisioning              Interface de provisionnement
/performance               Métriques de performance
/business/connexion        Connexion espace business

/agents                    Liste des agents
/agents-liste              (variante liste agents)
/pro/listing               Listing professionnel

/cgv                       Conditions générales de vente
/mentions-legales          Mentions légales (adresse : Lyon 69007)

/api/webhook               Webhook Supabase → emails Resend
/api/planning              API planning
/api/provisioning          API provisionnement
/api/performance-metrics   API métriques
/api/actualites            RSS actualités sécurité
/api/docs                  API documents
/api/paie                  API bulletins de paie
/api/checkout              Checkout Stripe
/api/notify                Notifications
/api/admin                 Admin
/api/gsc                   Google Search Console
/monitoring                Tunnel Sentry
```

---

## Structure des fichiers clés

```
lib/
  supabaseClient.ts     Client Supabase navigateur (clé anon, schéma public)
  authClient.ts         Helpers auth Supabase
  authGuard.ts          Guard de route côté client
  agentSession.ts       Gestion session agent
  theme.ts              Tokens de thème

services/
  agentLeadService.ts   Insert leads agents (table agent_leads)
  entrepriseService.ts  CRUD entreprises
  rapportService.ts     Génération rapports
  signalService.ts      Signaux / alertes

components/
  AgentLanding.tsx      Page d'accueil espace agent
  AgentTopBar.tsx       Barre top agent (titre + nom + thème)
  AgentAvatar.tsx       Avatar agent
  AgentActivation.tsx   Flux d'activation
  SecuProLogo.tsx       Logo officiel SVG
  ThemeClient.tsx       Injection thème CSS
  Footer.tsx            Footer global
  TrialBanner.tsx       Bandeau période d'essai
  VerrouTactique.tsx    Composant verrouillage tactique
  GraphVisualization.tsx Visualisation graphe
  dashboard/            Sous-composants dashboard (PerformanceDashboard, MapRadar…)
  provisioning/         Sous-composants provisionnement
```

---

## Design system

- **Couleur principale** : cyan `#00d1ff` (alias `CYAN`)
- **Fond** : dark navy `#0B1426` / `#0A1F2F`
- **Texte** : `#f1f5f9` (clair) / `rgba(100,120,150,0.45)` (muted)
- **Bordures** : `rgba(0,209,255,0.12)` → `rgba(0,209,255,0.30)` au hover
- **Font** : Geist Sans + Geist Mono (CSS variables `--font-geist-sans`)
- **Thème** : dark uniquement (`nocturne`)
- Style : inline styles pour les composants custom + Tailwind pour layout

---

## Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
ADMIN_EMAIL=contact@secupro.app
FROM_EMAIL=SECUPRO <noreply@secupro.app>
WEBHOOK_SECRET=
ANTHROPIC_API_KEY=
SENTRY_AUTH_TOKEN=
SENTRY_DSN=
```

---

## Règles de développement

### Deploy
Après chaque modification, lancer `vercel --prod` immédiatement.

### Supabase
- Côté client (`"use client"`) : toujours `supabaseClient.ts` (clé anon uniquement)
- Côté serveur (`route.ts`, `server actions`) : client service role séparé
- Schéma : `public` uniquement

### Stripe
- Lien de paiement live à 9,99 €/mois déjà configuré
- Ne pas recréer de lien Stripe sans confirmation

### Sécurité
- CSP définie dans `next.config.ts` uniquement — **ne jamais dupliquer dans `vercel.json`**
- Middleware (`middleware.ts`) actuellement en passthrough — réactiver CSP avec nonce quand l'app est stabilisée
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client

### Style
- Respecter le thème dark cyan — ne pas introduire d'autres couleurs primaires
- Inline styles pour les composants UI custom (cohérence avec l'existant)
- Tailwind pour les layouts et utilitaires

### TypeScript
- `strict: true` — pas de `any` implicite
- Toujours typer les retours des fonctions async

### Performance
- `NODE_OPTIONS=--max-old-space-size=4096` requis au build (config dans `package.json`)

---

## Contexte métier

SecuPRO cible les **agents de sécurité privée** (ADS) et les **entreprises de sécurité** (sociétés de gardiennage). Fonctionnalités clés :
- Gestion de planning et missions
- Bulletins de paie
- Documents réglementaires (carte pro, diplômes)
- Tableau de bord de performance avec cartographie radar
- IA conversationnelle (SecuAI) pour assistance opérationnelle
- Provisionnement de ressources
- Actualités sectorielles sécurité

**Audience** : terrain (agents mobile), pas développeurs — UX doit rester simple, claire, tactique.

---

## Vault Obsidian

- **Chemin du vault** : `G:\SecuPRO-Intelligence`
- **Notes à consulter avant de coder** :
  - `Projets/SecuPRO.md`
  - `Systemes/CLAUDE.md`
  - `Systemes/Schéma Base de Données.md`
  - `Ressources/Code Couleur Brand.md`

### Contexte stratégique

- **Lancement commercial** : début mai 2026
- **Cible marché** : 180 000 agents de sécurité privée en France
- **Vercel** : bloqué temporairement (impayé) — règlement prévu dans quelques jours

### Intégrations & IDs

- **Meta Pixel ID** : `2235641066843857`
- **Stripe Price IDs** :
  - Essentiel : `price_1TIIyL2MgRlKiK2HV8OIvkwV`
  - Pro : `price_1TIIz92MgRlKiK2HuZhM02Id`
  - Premium : `price_1TIJ012MgRlKiK2HLsnto1el`

### Fondateur

Mustapha, 60 ans, Lyon — auto-entrepreneur APE 6201Z, ex-agent de sécurité (CIRC, Musée des Confluences, Pierre Martinet).
