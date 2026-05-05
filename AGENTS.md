# AGENTS.md — SecuPRO

> Fichier de configuration pour agents IA (Claude Code, Cursor, Copilot, etc.)
> Projet : **SecuPRO** — SaaS B2B pour la sécurité privée française
> Stack : Next.js 14 App Router · Supabase · Vercel Pro · Stripe
> Répertoire local : `E:\secupro`

---

## 🗂️ Structure du projet

```
E:\secupro/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Layout racine
│   ├── page.tsx                # Landing page / accueil
│   ├── agents/                 # Interface gestion agents B2B
│   │   └── page.tsx
│   ├── performance/            # Dashboard performances
│   │   └── page.tsx
│   ├── provisioning/           # Import CSV agents (5 étapes)
│   │   └── page.tsx
│   ├── api/                    # Routes API Next.js
│   │   ├── stripe/             # Webhooks & checkout Stripe
│   │   ├── secuia/             # Assistant IA IDCC 1351
│   │   └── cron/               # Scraping nightly (Actu Sécu)
│   └── (auth)/                 # Pages auth (login, register)
├── components/                 # Composants réutilisables
├── lib/                        # Utilitaires & clients
│   ├── supabase.ts             # Client Supabase
│   ├── stripe.ts               # Client Stripe
│   └── utils.ts
├── public/                     # Assets statiques
│   ├── showcase.html           # Page vitrine Apple-style
│   └── icons/                  # PWA icons
├── supabase/
│   └── migrations/             # Migrations SQL
├── .env.local                  # Variables d'environnement (NE PAS COMMITER)
└── AGENTS.md                   # Ce fichier
```

---

## 🗄️ Base de données Supabase

**Projet ID** : `ladvecmpjpictubnnnsq`  
**Région** : West EU (Paris)

### Tables principales

| Table | Description |
|-------|-------------|
| `societes` | Entreprises clientes (B2B) |
| `agents` | Agents de sécurité rattachés à une société |
| `contrats` | Contrats de travail des agents |
| `performances` | Métriques de performance par agent |
| `import_audits` | Logs des imports CSV (provisioning) |

### Schéma de référence

```sql
-- societes
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
nom text NOT NULL
siret text UNIQUE
email_contact text
created_at timestamptz DEFAULT now()

-- agents
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
societe_id uuid REFERENCES societes(id) ON DELETE CASCADE
nom text NOT NULL
prenom text NOT NULL
matricule text
email text
telephone text
carte_pro text         -- Numéro carte professionnelle CNAPS
statut text            -- actif | inactif | suspendu
created_at timestamptz DEFAULT now()

-- contrats
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
agent_id uuid REFERENCES agents(id) ON DELETE CASCADE
type_contrat text      -- CDI | CDD | temps_partiel
date_debut date
date_fin date
coefficient integer    -- Grille IDCC 1351
taux_horaire numeric(6,2)

-- performances
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
agent_id uuid REFERENCES agents(id) ON DELETE CASCADE
periode text           -- format YYYY-MM
heures_realisees numeric(6,2)
heures_contrat numeric(6,2)
taux_absenteisme numeric(5,2)
infractions integer DEFAULT 0
note_client numeric(3,1)

-- import_audits
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
societe_id uuid REFERENCES societes(id)
fichier_nom text
nb_lignes integer
nb_succes integer
nb_erreurs integer
erreurs jsonb
created_at timestamptz DEFAULT now()
```

---

## ⚙️ Variables d'environnement requises

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ladvecmpjpictubnnnsq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

# Anthropic (SecuIA)
ANTHROPIC_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=https://secupro.app
```

---

## 🤖 Actions disponibles pour les agents

### 1. Créer un agent

```typescript
// lib/actions/agents.ts
import { supabase } from '@/lib/supabase'

export async function createAgent(data: {
  societe_id: string
  nom: string
  prenom: string
  email?: string
  carte_pro?: string
  statut?: 'actif' | 'inactif' | 'suspendu'
}) {
  const { data: agent, error } = await supabase
    .from('agents')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return agent
}
```

### 2. Lister les agents d'une société

```typescript
export async function getAgentsBySociete(societeId: string) {
  const { data, error } = await supabase
    .from('agents')
    .select(`
      *,
      contrats(*),
      performances(*)
    `)
    .eq('societe_id', societeId)
    .order('nom', { ascending: true })

  if (error) throw error
  return data
}
```

### 3. Import CSV en masse (provisioning)

Format attendu du CSV :

```csv
nom,prenom,email,telephone,carte_pro,coefficient,taux_horaire
DUPONT,Jean,j.dupont@example.com,0600000001,AUT-XXX-XXXX-20240101-X-XXXXX-XXXXX-X,150,12.50
MARTIN,Sophie,s.martin@example.com,0600000002,AUT-YYY-YYYY-20240101-Y-YYYYY-YYYYY-Y,140,12.20
```

Validation appliquée :
- `carte_pro` : format CNAPS obligatoire
- `coefficient` : entre 120 et 200 (grille IDCC 1351)
- `taux_horaire` : ≥ SMIC horaire en vigueur
- Email : format RFC 5322
- Doublon sur `(societe_id, email)` → rejeté avec message d'erreur

### 4. Mettre à jour le statut d'un agent

```typescript
export async function updateAgentStatus(
  agentId: string,
  statut: 'actif' | 'inactif' | 'suspendu'
) {
  const { error } = await supabase
    .from('agents')
    .update({ statut })
    .eq('id', agentId)

  if (error) throw error
}
```

### 5. Générer un rapport de performance

```typescript
export async function getPerformanceReport(
  societeId: string,
  periode: string  // format 'YYYY-MM'
) {
  const { data, error } = await supabase
    .from('performances')
    .select(`
      *,
      agents!inner(nom, prenom, statut, societe_id)
    `)
    .eq('agents.societe_id', societeId)
    .eq('periode', periode)

  if (error) throw error
  return data
}
```

### 6. Supprimer un agent (soft delete)

```typescript
export async function deactivateAgent(agentId: string) {
  // Soft delete : on passe en inactif plutôt que de supprimer
  return updateAgentStatus(agentId, 'inactif')
}
```

---

## 🚀 Commandes de développement

```bash
# Démarrer le serveur de dev
npm run dev

# Lancer le serveur statique (public/)
npx serve public

# Build production
npm run build

# Vérifier les types TypeScript
npx tsc --noEmit

# Linter
npm run lint

# Appliquer une migration Supabase
npx supabase db push

# Générer les types TypeScript depuis Supabase
npx supabase gen types typescript --project-id ladvecmpjpictubnnnsq > lib/database.types.ts
```

---

## 📋 Conventions de code

### Nommage
- **Composants** : PascalCase (`AgentCard.tsx`, `ProvisioningWizard.tsx`)
- **Utilitaires** : camelCase (`formatDate.ts`, `validateCsv.ts`)
- **Routes API** : kebab-case (`/api/import-agents`, `/api/send-report`)
- **Tables SQL** : snake_case pluriel (`agents`, `import_audits`)

### Règles importantes
1. **Ne jamais exposer** `SUPABASE_SERVICE_ROLE_KEY` côté client
2. **Toujours valider** les données CSV avant insertion en base
3. **Row Level Security (RLS)** activé sur toutes les tables — chaque société ne voit que ses propres agents
4. **Stripe** : toujours vérifier la signature webhook avant traitement
5. **SecuIA** : contexte limité à IDCC 1351 + réglementation CNAPS

### Gestion des erreurs
```typescript
// Pattern standard pour les server actions
try {
  const result = await someSupabaseAction()
  return { success: true, data: result }
} catch (error) {
  console.error('[SecuPRO]', error)
  return { success: false, error: 'Une erreur est survenue.' }
}
```

---

## 🎯 Modèle tarifaire (Stripe)

> Cible : sociétés de sécurité privée de **20 à 100 agents**

| Plan | Prix | Agents max | Features |
|------|------|-----------|---------|
| **Essentiel** | 49,99€/mois | 50 | Gestion agents, import CSV, alertes CNAPS |
| **Pro** | 99,99€/mois | 150 | + Dashboard performances, SecuIA assistant légal |
| **Premium** | 199,99€/mois | Illimité | + Rapports PDF, support prioritaire, onboarding dédié |

Tous les plans incluent un essai gratuit de 7 jours.  
IDs produits Stripe à récupérer depuis `.env.local`.

---

## 🏷️ Branding

- **Logo** : "Secu" en blanc + "PRO" en bleu sur fond sombre
- **Tagline** : *"Par un agent. Pour les agents."*
- **Domaine** : `secupro.app` (OVH)
- **Email** : `contact@secupro.app`
- **Meta Pixel** : `2235641066843857`
- **Facebook** : Page "Secu PRO"

---

## 📌 Contexte métier (important pour les agents IA)

SecuPRO cible les **180 000 agents de sécurité privée en France**, encadrés par :
- La **Convention Collective IDCC 1351** (branche sécurité privée)
- Le **CNAPS** (Conseil National des Activités Privées de Sécurité)
- Les qualifications : **CQP APS**, **SSIAP 1/2/3**, **SST**, **carte professionnelle**

Le modèle B2B cible en priorité les **sociétés de sécurité de la région lyonnaise** comme premiers clients.

Toute suggestion de code ou de feature doit tenir compte de ces contraintes réglementaires spécifiques.

---

*Dernière mise à jour : 25 avril 2026 — Mustapha, fondateur SecuPRO*
