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
- Invite a property owner (email invitation)
- Add / remove an owner from a condominium
- Add / remove a tenant from a condominium
- Assign lots to owners and tenants
- View owners list for a condominium

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

### 4.1 Access & Information
- Access one or multiple condominiums
- View personal balance per condominium
- View lots owned
- View due schedule

### 4.2 Payments
- Create / sign a SEPA mandate
- View payment history
- Pay by credit card if no SEPA mandate (optional)

### 4.3 Documents & Consumption
- View condominium documents
- Filter documents by type
- View consumption history (if enabled)

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