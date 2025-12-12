## 1. Roles
- Platform Admin (internal)
- Property Manager (Gestionnaire / Syndic)
- Owner (Copropriétaire)
- Tenant (Locataire)

---

## 2. Platform Admin – Use Cases
> Scope: ONLY create & manage Property Managers (tenants)

### 2.1 Property Manager (Tenant) Management
- Create a Property Manager (tenant)
- Edit Property Manager information (name, contact, status)
- Activate / suspend a Property Manager
- View Property Manager overview (counts: users / condos) (optional)

### 2.2 Tenant User Management
- Create / invite the first tenant admin user
- Invite additional collaborator users (MANAGER)
- Revoke access (disable user)
- Resend invitation
- Reset a user access (force password reset / revoke sessions) (optional)

---

## 3. Property Manager – Use Cases

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

## 5. Tenant – Use Cases

### 5.1 Consumption
- View personal consumption history
- View consumption summaries by period (optional)

### 5.2 Profile
- Update profile info