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
- /app/condominiums
- /app/condominiums/new
- /app/condominiums/[id]

### 3.3 Condominium Sections (Modal / Panels)
- /app/condominiums/[id]/settings
- /app/condominiums/[id]/bank               # Bank connection, transactions, reconciliation
- /app/condominiums/[id]/documents
- /app/condominiums/[id]/people
- /app/condominiums/[id]/payments
- /app/condominiums/[id]/reconciliation
- /app/condominiums/[id]/charges
- /app/condominiums/[id]/reports
- /app/condominiums/[id]/lots               # Lots management
- /app/condominiums/[id]/utilities          # Utility bills management (eau, gaz, chauffage)
- /app/condominiums/[id]/utilities/new      # Create utility bill with readings

### 3.4 Owners
- /app/owners                         # List all owners for tenant (with pagination & filters)
- /app/owners/new                     # Create new owner
- /app/owners/[ownerId]               # Owner detail page (all condos, lots, payments, mandates)
- /app/owners/[ownerId]/balance       # Owner balance details
- /app/owners/[ownerId]/mandates      # Owner SEPA mandates
- /app/condominiums/[id]/owners       # List owners for a specific condominium
- /app/condominiums/[id]/owners/new   # Add owner to specific condominium

### 3.5 Tenants (Locataires)
- /app/condominiums/[id]/locataires
- /app/condominiums/[id]/locataires/new
- /app/condominiums/[id]/locataires/[tenantId]

### 3.6 Lots
- /app/condominiums/[id]/lots
- /app/condominiums/[id]/lots/new
- /app/condominiums/[id]/lots/[lotId]

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
- GET    /condominiums/:id/lots                    # List lots
- POST   /condominiums/:id/lots                    # Create lot
- PATCH  /condominiums/lots/:lotId                 # Update lot
- DELETE /condominiums/lots/:lotId                 # Delete lot
- PATCH  /condominiums/lots/:lotId/assign          # Assign owner to lot
- GET    /condominiums/:id/owners                  # List owners of condominium
- GET    /owners                       # List owners for tenant
- POST   /owners                       # Create owner (status = invited)
- GET    /owners/:id
- GET    /owners/search?q=             # Search orphan owners (no tenant)
- POST   /owners/:id/associate         # Associate orphan owner to tenant
- POST   /owners/:id/resend-invite     # Resend invitation email (future: via N8N)
- GET    /documents
- POST   /documents
- GET    /dashboard/stats
- GET    /dashboard/condominiums-with-unpaid

### Bank API (tenant-scoped)
- GET    /bank/accounts                            # List bank accounts
- GET    /bank/accounts/:id                        # Get account details
- GET    /bank/transactions                        # List transactions
- POST   /bank/sync/:condominiumId                 # Sync transactions from Powens
- GET    /bank/connect/:condominiumId              # Get Powens webview URL
- GET    /bank/connect/callback                    # Powens OAuth callback
- POST   /bank/connect/finalize                    # Finalize bank connection

### Condominium Settings API
- GET    /condominiums/:id/settings                # Get condominium settings
- PUT    /condominiums/:id/settings                # Update condominium settings

### Utilities API (Consommations)
- GET    /utilities/meters/lot/:lotId              # List meters for a lot
- GET    /utilities/meters/condominium/:id         # List meters for condominium (optional ?type=)
- POST   /utilities/meters                         # Create meter for lot
- PATCH  /utilities/meters/:id                     # Update meter
- DELETE /utilities/meters/:id                     # Delete meter

- GET    /utilities/bills/condominium/:id          # List utility bills for condo
- POST   /utilities/bills                          # Create utility bill
- GET    /utilities/bills/:id                      # Get bill with readings
- PATCH  /utilities/bills/:id                      # Update bill
- DELETE /utilities/bills/:id                      # Delete bill
- POST   /utilities/bills/:id/validate             # Validate bill (lock readings)
- POST   /utilities/bills/:id/distribute           # Calculate and distribute amounts
- POST   /utilities/bills/:id/initialize-readings  # Initialize readings from lot meters

- GET    /utilities/readings/:billId               # Get readings for a bill
- POST   /utilities/readings                       # Bulk create/update readings
- PATCH  /utilities/readings/:id                   # Update single reading

### Powens API (Open Banking)
- GET    /powens/health                            # Health check
- GET    /powens/banks                             # List available banks
- GET    /powens/banks/:id                         # Get bank details
- GET    /powens/connections                       # List connections
- POST   /powens/connections                       # Create connection
- GET    /powens/connections/:id                   # Get connection
- POST   /powens/connections/:id/sync              # Force sync
- DELETE /powens/connections/:id                   # Delete connection
- GET    /powens/accounts                          # List accounts
- GET    /powens/accounts/:id                      # Get account
- GET    /powens/transactions                      # List transactions
- POST   /powens/webhooks                          # Receive webhooks