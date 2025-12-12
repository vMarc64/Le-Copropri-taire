## 1. Public & Authentication
- /login
- /forgot-password
- /reset-password
- /invite/[token]                     # accept invitation (manager/owner/tenant)

---

## 2. Platform Admin Routes (/platform)
> Scope: ONLY create & manage Property Managers (tenants)

### 2.1 Authentication
- /platform/login

### 2.2 Dashboard
- /platform/dashboard                 # list + KPIs (basic)

### 2.3 Property Managers (Tenants)
- /platform/property-managers
- /platform/property-managers/new
- /platform/property-managers/[pmId]                 # details (status, contact, settings)
- /platform/property-managers/[pmId]/users           # tenant admins/collaborators management
- /platform/property-managers/[pmId]/invitations     # pending invites (optional)

---

## 3. Property Manager Routes (/app)

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
- /portal/login
- /portal/forgot-password
- /portal/reset-password
- /portal
- /portal/coproprietes/[coproId]
- /portal/coproprietes/[coproId]/payments
- /portal/coproprietes/[coproId]/mandate
- /portal/coproprietes/[coproId]/documents
- /portal/profile

---

## 5. Tenant (Locataire) Routes (/tenant)
- /tenant/login
- /tenant/forgot-password
- /tenant/reset-password
- /tenant
- /tenant/coproprietes/[coproId]/consommations
- /tenant/profile