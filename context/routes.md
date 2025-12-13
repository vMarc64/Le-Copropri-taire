## 1. Public & Authentication

### 1.1 Home & Product
- /                                   # Landing page with 3 blocks (Product, Owner Space, Manager Space)
- /product                            # Product presentation / marketing page

### 1.2 Owner Authentication (Copropriétaires)
- /owner/login                        # Login for owners (neutral colors)
- /owner/register                     # Registration for owners (creates pending account)

### 1.3 Manager Authentication (Gestionnaires)
- /manager/login                      # Login for managers (primary/green colors)
- /manager/register                   # Registration for managers (creates pending account)

### 1.4 Common Auth Routes
- /forgot-password
- /reset-password
- /invite/[token]                     # Accept invitation (manager/owner/resident)

### 1.5 Pending Pages
- /app/pending                        # Pending page for managers awaiting syndic association
- /portal/pending                     # Pending page for owners awaiting copropriété association

---

## 2. Platform Admin Routes (/platform)
> Scope: Manage Syndics (property management organizations) and their managers
> Access: role = 'platform_admin'

### 2.1 Dashboard
- /platform                           # Dashboard with KPIs (total syndics, managers, condos)
                                      # + Syndics list table with creation modal

### 2.2 Syndics (Organizations)
- /platform/tenants                   # List all Syndics (alias for syndics)
- /platform/tenants/[syndicId]        # Syndic details

### 2.3 Users Management
- /platform/users                     # List pending users, associate to syndics

---

## 3. Manager Routes (/app)
> Scope: Manage condominiums for a Syndic
> Access: role = 'manager' or 'admin' (within their tenant/syndic)

### 3.1 Dashboard
- /app/dashboard

### 3.2 Condominiums
- /app/coproprietes
- /app/coproprietes/new
- /app/coproprietes/[coproId]

### 3.3 Condominium Sections (Modal / Panels)
- /app/coproprietes/[coproId]/settings
- /app/coproprietes/[coproId]/bank
- /app/coproprietes/[coproId]/documents
- /app/coproprietes/[coproId]/people
- /app/coproprietes/[coproId]/payments
- /app/coproprietes/[coproId]/reconciliation
- /app/coproprietes/[coproId]/charges
- /app/coproprietes/[coproId]/reports

### 3.4 Owners
- /app/coproprietes/[coproId]/coproprietaires
- /app/coproprietes/[coproId]/coproprietaires/new
- /app/coproprietes/[coproId]/coproprietaires/[ownerId]
- /app/coproprietes/[coproId]/coproprietaires/[ownerId]/balance
- /app/coproprietes/[coproId]/coproprietaires/[ownerId]/mandates

### 3.5 Tenants (Locataires)
- /app/coproprietes/[coproId]/locataires
- /app/coproprietes/[coproId]/locataires/new
- /app/coproprietes/[coproId]/locataires/[tenantId]

### 3.6 Lots
- /app/coproprietes/[coproId]/lots
- /app/coproprietes/[coproId]/lots/new
- /app/coproprietes/[coproId]/lots/[lotId]

### 3.7 AI Assistant
- /app/ai                             # AI suggestions dashboard
- /app/ai/suggestions
- /app/ai/suggestions/[suggestionId]  # suggestion detail
- /app/ai/anomalies
- /app/ai/history

### 3.8 Property Manager Settings
- /app/settings/company
- /app/settings/users
- /app/settings/ai                    # AI configuration (auto-match threshold, etc.)
- /app/profile
- /app/support

---

## 4. Owner (Copropriétaire) Routes (/portal)
> Access: role = 'owner'

- /portal                             # Dashboard (list condos, balances)
- /portal/coproprietes/[coproId]      # Condo details
- /portal/coproprietes/[coproId]/payments
- /portal/coproprietes/[coproId]/mandate
- /portal/coproprietes/[coproId]/documents
- /portal/profile

---

## 5. Resident (Locataire) Routes (/resident)
> Access: role = 'resident'

- /resident                           # Dashboard
- /resident/coproprietes/[coproId]/consommations
- /resident/profile

---

## API Routes (Backend NestJS)

### Auth
- POST /auth/login
- POST /auth/register
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/invite/accept

### Platform Admin API (/platform/*)
- GET    /platform/stats              # KPIs
- GET    /platform/syndics            # List syndics
- POST   /platform/syndics            # Create syndic
- GET    /platform/syndics/:id        # Get syndic
- PATCH  /platform/syndics/:id        # Update syndic
- DELETE /platform/syndics/:id        # Soft delete syndic
- GET    /platform/syndics/:id/managers      # List managers
- POST   /platform/syndics/:id/managers      # Invite manager
- DELETE /platform/syndics/:id/managers/:uid # Revoke manager

### Manager API (tenant-scoped)
- GET    /condominiums
- POST   /condominiums
- GET    /condominiums/:id
- PATCH  /condominiums/:id
- DELETE /condominiums/:id
- GET    /owners
- POST   /owners
- GET    /documents
- POST   /documents
- GET    /bank/accounts
- GET    /bank/transactions
- GET    /dashboard/stats