# Drizzle ORM Configuration

This project uses **Drizzle ORM** with **PostgreSQL** (hosted on Supabase) for database management.

## Setup

1. **Install dependencies** (already done):
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Set your Supabase PostgreSQL connection string:
     ```
     DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```

3. **Generate migrations**:
   ```bash
   pnpm db:generate
   ```

4. **Apply migrations**:
   ```bash
   pnpm db:migrate
   ```
   
   Or push schema directly (dev only):
   ```bash
   pnpm db:push
   ```

## Scripts

- `pnpm db:generate` - Generate SQL migrations from schema changes
- `pnpm db:migrate` - Apply pending migrations to database
- `pnpm db:push` - Push schema directly to database (dev only, no migration files)
- `pnpm db:studio` - Open Drizzle Studio (visual database browser)

## Schema Structure

### Multi-tenant Architecture

All tables include a `tenant_id` column (except `tenants` table) to ensure data isolation.

### Tables Overview

| Table | Description |
|-------|-------------|
| `tenants` | Property Managers (SaaS tenants) |
| `users` | All users (platform_admin, manager, owner, tenant) |
| `condominiums` | Copropriétés |
| `lots` | Units/apartments/parking |
| `owner_condominiums` | Association propriétaires ↔ copropriétés |
| `documents` | Documents (factures, PV AG, devis...) |
| `powens_connections` | Connexions Open Banking |
| `bank_accounts` | Comptes bancaires synchronisés |
| `bank_transactions` | Transactions bancaires |
| `sepa_mandates` | Mandats SEPA (Stripe) |
| `payment_schedules` | Échéanciers de paiement |
| `fund_calls` | **Appels de fonds globaux** |
| `fund_call_items` | **Détail appels de fonds par propriétaire** |
| `payments` | Paiements reçus des propriétaires |
| `invoices` | **Factures fournisseurs (hors consommation)** |
| `utility_bills` | Factures consommation (eau, élec, gaz) |
| `lot_meters` | Compteurs individuels par lot |
| `meter_readings` | Relevés de compteurs |
| `reconciliations` | Rapprochements bancaires |

### Financial Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        APPELS DE FONDS                          │
├─────────────────────────────────────────────────────────────────┤
│  fund_calls (global)                                            │
│       │                                                         │
│       └── fund_call_items (par propriétaire)                    │
│                 │                                               │
│                 └── payments (paiements reçus)                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     FACTURES FOURNISSEURS                       │
├─────────────────────────────────────────────────────────────────┤
│  invoices (assurance, travaux, maintenance...)                  │
│  utility_bills (eau, électricité, gaz, chauffage)               │
│       │                                                         │
│       └── reconciliations ←── bank_transactions                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    RAPPROCHEMENT BANCAIRE                       │
├─────────────────────────────────────────────────────────────────┤
│  bank_transactions                                              │
│       │                                                         │
│       └── reconciliations                                       │
│                 ├── target_type: 'payment'      → payments      │
│                 ├── target_type: 'invoice'      → invoices      │
│                 ├── target_type: 'utility_bill' → utility_bills │
│                 └── target_type: 'fund_call_item' → fund_call_items │
└─────────────────────────────────────────────────────────────────┘
```

### Key Tables Details

#### fund_calls
Appels de fonds globaux pour une copropriété :
- `reference`: Ex: "AF-2025-Q1"
- `type`: 'regular' (trimestriel) | 'exceptional' (travaux)
- `status`: 'draft' | 'sent' | 'partial' | 'completed' | 'cancelled'

#### fund_call_items
Détail de chaque appel par propriétaire :
- Calculé automatiquement selon les tantièmes
- Suivi des paiements partiels
- Gestion des relances

#### invoices
Factures fournisseurs (hors consommation) :
- `category`: 'insurance' | 'maintenance' | 'works' | 'fees' | 'cleaning' | 'gardening' | 'elevator' | 'other'
- Support OCR/IA avec `extracted_data` et `confidence_score`

#### reconciliations
Rapprochement bancaire multi-cible :
- `target_type`: Type de cible ('payment', 'invoice', 'utility_bill', 'fund_call_item')
- `queue_status`: 'pending' | 'suggested' | 'validated' | 'rejected' | 'ignored'
- `confidence_score`: Score IA (0-100)
- `matching_details`: Détails du scoring JSON

### Key Points

1. **Tenant Isolation**: Every query should filter by `tenant_id` (except platform_admin operations)
2. **Cascade Deletes**: Deleting a tenant cascades to all related data
3. **UUIDs**: All IDs use UUID v4 for security and distributed systems
4. **Timestamps**: All tables have `createdAt` and `updatedAt`

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Supabase Docs](https://supabase.com/docs)
