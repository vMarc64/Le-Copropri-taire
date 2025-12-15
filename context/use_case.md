## 1. Roles & Hierarchy

### 1.1 Platform Level
- **Platform Admin** (internal) – Manages the SaaS platform

### 1.2 Organization Level (Syndic / Cabinet de Gestion)
- **Syndic** (Organization/Tenant in multi-tenant) – A property management company
- **Manager** (Gestionnaire) – Employee of a Syndic who manages condominiums

### 1.3 Condominium Level
- **Owner** (Copropriétaire) – Owns one or more lots
- **Resident** (Locataire) – Rents a lot from an owner

### Hierarchy Diagram
```
Platform Admin (you)
    └── creates Syndics (organizations)
            └── each Syndic has Managers (employees)
                    └── Managers handle: Condominiums, Owners, Residents
```

---

## 1.3 User Status Flow

### Manager Status
| Status | Description | Access |
|--------|-------------|--------|
| `pending` | Registered, waiting for syndic association | ❌ No access to /app |
| `active` | Associated to a syndic, account validated | ✅ Full access |
| `suspended` | Account disabled by admin | ❌ No access |

### Owner Status
| Status | Description | Access |
|--------|-------------|--------|
| `invited` | Invited by syndic, waiting for account creation | ❌ No access |
| `pending` | Self-registered, waiting for syndic association | ❌ No access |
| `active` | Account validated and associated | ✅ Full portal access |
| `managed` | Account managed by syndic (no self-access) | ❌ No portal access |
| `suspended` | Account disabled | ❌ No access |

### Invitation Flow (Owner)
1. Manager enters: firstName, lastName, email (+ optional: condominiums, lots)
2. Owner record created with status = `invited`
3. Email sent via N8N (Part 8 - Automation)
4. Owner clicks link → creates password
5. Status changes to `active`

---

## 2. Platform Admin – Use Cases
> Scope: Manage Syndics (property management companies) and their admin users

### 2.1 Syndic Management
- Create a Syndic (organization)
- Edit Syndic information (company name, SIRET, contact email, status)
- Activate / suspend a Syndic
- View Syndic overview (counts: managers, condominiums)
- Delete a Syndic (soft delete)

### 2.2 Syndic User Management
- Create / invite the first admin Manager for a Syndic
- View list of Managers per Syndic
- Revoke Manager access (disable user)
- Resend invitation email
- Force password reset (optional)

### 2.3 Pending Users Management
- View list of pending users (registered but not associated to any syndic)
- Associate a pending user to a syndic
- View user details before association

---

## 3. Manager (Gestionnaire) – Use Cases
> Employee of a Syndic, manages condominiums

### 3.1 Condominium Management
- Create a condominium
- Update condominium information
- Search for a condominium
- View condominium dashboard
- Manage lots (create/update, assign owners/tenants)

### 3.2 People Management
- Search for existing orphan owners (not yet associated to any syndic)
- Associate an orphan owner to the syndic
- Invite a new owner (sends email invitation, status = invited)
- Create a managed account for owners who cannot self-register (future: status = managed)
- Add / remove an owner from a condominium
- Add / remove a tenant from a condominium
- Assign lots to owners and tenants
- View owners list for a condominium (with status badges: active, invited, pending)

### 3.3 Dues & Payment Plans
- Define monthly advance payments (acompte)
- Generate due schedule (monthly / quarterly)
- Apply adjustments (corrections, one-off fees)
- View dues status per owner and per condominium

### 3.4 SEPA Payments
- Create / manage SEPA mandates
- Trigger SEPA direct debit batches
- View payment status (paid / pending / failed)
- Retry / relaunch failed payments
- Handle payment incidents (reject/cancel) (optional)
- Export SEPA batch summary (optional)

### 3.5 Banking (Open Banking)
- Connect a bank account to a condominium
- View bank balance
- View bank transactions
- Refresh / resync transactions

### 3.6 Reconciliation (Rapprochement)
- Match bank transactions with dues/payments (suggestions + manual)
- Confirm / unmatch reconciliation
- View unmatched transactions and unpaid dues

### 3.7 Documents
- Upload a document to a condominium
- Define document type (invoice, AG, quote, etc.)
- Control document visibility (manager-only / owners / tenants)
- View documents by type

### 3.8 Variable Charges / Consumption (If enabled)
- Record consumption (manual entry/import)
- View consumption per lot / per person
- Publish consumption summary to portals (optional)

### 3.9 Notifications (basic)
- Send payment reminders
- Send mandate reminders
- Send incident notifications (failed payment)

### 3.10 AI Assistant (Onglet IA)
- View AI suggestions (rapprochement automatique)
- View detected anomalies (paiements en double, montants inhabituels)
- Validate / reject AI suggestions
- View confidence score per suggestion
- Mark anomaly as resolved / false positive
- View AI activity log

#### 3.10.1 Rapprochement bancaire assisté par IA
- AI analyzes bank transactions (name, amount, reference)
- AI suggests matches: transaction → owner + invoice/due
- Confidence score displayed (0-100%)
- Manager validates or rejects suggestion
- Auto-match if confidence > 95% (optional setting)

#### 3.10.2 Détection d'anomalies
- Duplicate payments detected
- Unusual amounts (compared to history)
- Late payment from usually punctual owner
- Missing expected payment
- Manager reviews anomaly
- Mark as resolved or create action

#### 3.10.3 Extraction automatique factures (OCR)
- Upload PDF invoice
- AI extracts: amount, date, supplier, type
- Pre-fills form with extracted data
- Manager validates and saves

---

## 4. Owner (Copropriétaire) – Use Cases

> **IMPORTANT: Access Restrictions**
> - Owners ONLY have access to `/portal` routes
> - Owners CANNOT access `/app` routes (Manager backoffice)
> - Owners CANNOT see: Bank accounts, Bank transactions, Other owners, Management functions
> - Middleware must redirect any owner trying to access `/app` to `/portal`

### 4.1 Access & Information
- Access one or multiple condominiums (only those associated to the owner)
- View personal balance per condominium
- View lots owned
- View due schedule
- **NO ACCESS to**: bank management, other owners list, management functions

### 4.2 Payments
- Create / sign a SEPA mandate
- View payment history (own payments only)
- Pay by credit card if no SEPA mandate (optional)
- **NO ACCESS to**: batch payments, other owners' payments

### 4.3 Documents & Consumption
- View condominium documents (visibility = 'owners' or 'all')
- Filter documents by type
- View consumption history (if enabled)
- **NO ACCESS to**: manager-only documents (visibility = 'managers')

### 4.4 Profile
- Update profile info
- Manage notification preferences (optional)

---

## 5. Resident (Locataire) – Use Cases

### 5.1 Consumption
- View personal consumption history
- View consumption summaries by period (optional)

### 5.2 Profile
- Update profile info