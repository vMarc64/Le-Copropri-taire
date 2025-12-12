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
- Cache / Queue: Redis + BullMQ (ou SQS / PubSub managé)
- Storage: S3 (AWS) / Cloud Storage (GCP)
- Observabilité: OpenTelemetry + Sentry + logs structurés

#### Choix Drizzle vs Prisma
- **Schema natif TypeScript** (pas de DSL propriétaire)
- **SQL explicite** → meilleur contrôle pour le multi-tenant
- **Coût zéro garanti** (aucun service payant)
- **Compatible** Next.js + NestJS
- **Migrations flexibles** (générées ou manuelles)

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

  API --> Q[Queue]
  Q --> W[Workers NestJS]
  W --> DB
  W --> PSP
  W --> OB
  W --> OBJ
