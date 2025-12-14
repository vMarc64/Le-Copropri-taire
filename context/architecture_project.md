# Architecture Web — Option A (SaaS multi-tenant) — Le copropriétaire

## 0. Principe
Une **seule application** (front + API) servira **tous les gestionnaires** et **tous les copropriétaires**, avec une **isolation des données par tenant** (= gestionnaire).  
Le produit comprend :
- **Backoffice Gestionnaire**
- **Portail Copropriétaire**
- Modules paiements (SEPA / CB rattrapage) + Open Banking + rapprochement bancaire

---

## 1. Stack (TypeScript partout)

### Front & BFF
- **Next.js (React) + TypeScript**
- Rôles :
  - Frontend (UI, routing, SSR)
  - BFF (Backend For Frontend : `/api`, server actions)
- UI: Tailwind + shadcn/ui
- Data: TanStack Query (ou tRPC)
- Validation: Zod

### Backend métier
- **NestJS + TypeScript**
- API: REST + OpenAPI (Swagger)
- ORM: **Drizzle ORM** (TypeScript-first, SQL explicite)
- DB: **PostgreSQL** (hébergé sur Supabase)
- Cache / Queue: Redis + BullMQ (jobs critiques métier)
- Storage: S3 (AWS) / Cloud Storage (GCP)
- Observabilité: OpenTelemetry + Sentry + logs structurés

#### Choix Drizzle vs Prisma
- **Schema natif TypeScript** (pas de DSL propriétaire)
- **SQL explicite** → meilleur contrôle pour le multi-tenant
- **Coût zéro garanti** (aucun service payant)
- **Compatible** Next.js + NestJS
- **Migrations flexibles** (générées ou manuelles)

### Automatisation & IA
- **N8N** (self-hosted, open-source)
- Rôles :
  - Workflows d'automatisation (emails, notifications)
  - Rapprochement bancaire assisté par IA
  - Détection d'anomalies (paiements en double, montants inhabituels)
  - OCR et extraction de données (factures PDF)
  - Orchestration de tâches complexes
- Intégrations :
  - Webhooks depuis/vers NestJS API
  - LLMs (OpenAI, Anthropic, Mistral) pour matching intelligent
  - Services emails (SMTP, SendGrid, etc.)
  - Services SMS/Slack (notifications)

#### Répartition Workers NestJS vs N8N
| Responsabilité | NestJS Workers (BullMQ) | N8N + IA |
|----------------|------------------------|----------|
| Génération batch SEPA | ✅ | ❌ |
| Calculs charges/balances | ✅ | ❌ |
| Sync transactions bancaires | ✅ (insertion DB) | 🔄 Déclenche workflows |
| Rapprochement auto transactions | ❌ | ✅ IA + règles |
| Emails/notifications | ❌ | ✅ |
| Relances impayés | ❌ | ✅ Workflows conditionnels |
| OCR factures | ❌ | ✅ IA extraction |
| Détection anomalies | ❌ | ✅ IA analyse |

---

## 2. Architecture logique (vue d’ensemble)

```mermaid
flowchart LR
  U1[Gestionnaire] --> WEB[Next.js Web App (Front)]
  U2[Copropriétaire] --> WEB

  WEB --> BFF[Next.js BFF]
  BFF --> API[NestJS API (Business)]

  API --> DB[(PostgreSQL)]
  API --> REDIS[(Redis)]
  API --> OBJ[(Object Storage: S3 / GCS)]
  API --> PSP[PSP Paiement SEPA / CB]
  API --> OB[Open Banking Provider]

  API --> Q[Queue BullMQ]
  Q --> W[Workers NestJS]
  W --> DB
  W --> PSP
  W --> OB
  W --> OBJ

  API <--> N8N[N8N Workflows + IA]
  N8N --> DB
  N8N --> MAIL[Email Service]
  N8N --> SMS[SMS / Slack]
  N8N --> AI[LLM APIs]
  N8N --> PSP
  N8N --> OB

```

---

## 3. Environnements de déploiement

### UAT (User Acceptance Testing)
- **URL**: https://uat.lecopropietaire.fr
- **Infrastructure**: VPS avec Docker Compose
- **Services**:
  - Next.js (Frontend + BFF) - port 3000
  - NestJS API - port 3002
  - Nginx reverse proxy (SSL via Let's Encrypt)
- **Base de données**: Supabase PostgreSQL (partagée avec dev)
- **Open Banking**: Powens Sandbox (lecoproprietaire-sandbox.biapi.pro)

### Production (à venir)
- Infrastructure à définir (VPS, Kubernetes, ou cloud managed)
- Powens production domain
- Base de données PostgreSQL dédiée

---

## 4. Intégrations externes

### Powens (Open Banking / PSD2)
- **Sandbox domain**: lecoproprietaire-sandbox
- **Flux d'authentification**:
  1. GET /bank/connect/:condominiumId → génère webview URL
  2. Utilisateur complète la connexion dans l'iframe
  3. Callback avec code → échange contre access_token
  4. POST /bank/connect/finalize → stocke connection + accounts en DB
  5. POST /bank/sync/:condominiumId → synchronise les transactions
- **Tables DB**:
  - powens_connections - stocke les connexions avec access_token
  - bank_accounts - comptes bancaires liés aux copropriétés
  - bank_transactions - transactions synchronisées depuis Powens

### Stripe (Paiements SEPA/CB)
- Mock service disponible en développement
- Intégration production à implémenter
