## 1. Authentication Pages

### 1.1 Login Page
- Email input
- Password input
- Login button
- Forgot password link

### 1.2 Reset Password Page
- Email input
- Submit button
- Success / error state

### 1.3 Invitation Acceptance Page
- Invitation context (role, condominium)
- Set password
- Accept invitation button

---

## 2. Platform Admin Pages (Internal)

### 2.1 Platform Dashboard
- List of Property Managers (tenants)
- Status (active / suspended)
- Basic metrics (number of condos, users)
- Create Property Manager action

### 2.2 Create Property Manager Page
- Company name
- Contact email
- Initial admin user email
- Create tenant button

### 2.3 Property Manager Detail Page
- Property Manager information
- Status (active / suspended)
- List of users (tenant admins / managers)
- Invite new user action

---

## 3. Property Manager Pages

### 3.1 Manager Dashboard
- Global KPIs:
  - Late payments count
  - Unpaid amounts
- List of condominiums with issues
- Global search bar (condominiums / owners)
- Create condominium action

### 3.2 Condominium Dashboard
- Condominium summary
  - Name, address
  - Current balance
- KPIs:
  - Owners in arrears
  - Total unpaid amount
- Quick actions (buttons / icons):
  - Settings
  - Bank account
  - Documents
  - Owners
  - Payments
  - Reconciliation

### 3.3 Condominium Settings (Modal / Panel)
- Condominium information
- Payment configuration:
  - SEPA enabled / disabled
  - Bank account selection
- Save / cancel actions

### 3.4 Bank & Transactions View (Modal / Panel)
- Connected bank account
- Current balance
- Transactions list:
  - Date
  - Label
  - Amount
  - Matching status
- Action:
  - Match transaction
  - View linked payment

### 3.5 Bank Page (Full Page)
- Header with condominium name and back navigation
- Stats cards:
  - Current balance
  - Reconciled transactions count
  - Pending transactions count
  - Trend indicator
- Bank account details card:
  - Bank name & account name
  - IBAN (with copy button)
  - BIC
  - Account type
  - Coming balance
  - Last sync date
  - Sync button
- Connect bank button (if no account):
  - Opens Powens webview in modal/iframe
  - Full-screen on mobile
- Tabs:
  - Transactions: list with search, status filter, table (desktop) / cards (mobile)
  - Reconciliation: pending transactions + pending payments side by side
- Match dialog:
  - Transaction details
  - List of pending payments to match

### 3.6 Reconciliation View (Modal / Panel)
- Unmatched bank transactions
- Unpaid dues
- Suggested matches (confidence score)
- Confirm / reject match

### 3.6 Payments View (Modal / Panel)
- Upcoming SEPA batches
- Past batches with status
- Failed payments list
- Relaunch payment action

### 3.7 AI Assistant (Onglet IA)
- AI suggestions list:
  - Type (rapprochement / anomalie / OCR)
  - Date
  - Description
  - Confidence score
  - Status (pending / validated / rejected)
- Filters:
  - Type
  - Status
  - Date range
  - Condominium
- Actions per suggestion:
  - View details
  - Validate
  - Reject
  - Mark as false positive
- Suggestion detail modal:
  - Full context (transaction, owner, amount)
  - AI reasoning
  - Validate / reject buttons

### 3.8 Owners List (Modal / Panel)
- Owners table:
  - Name
  - Lots
  - Balance
  - Payment method (SEPA / none)
  - Status (ok / late)
- Action:
  - View owner profile
  - Invite owner

### 3.8 Owner Profile Page (Manager View)
- Overview:
  - Contact info
  - Lots owned
  - Current balance
- Payments:
  - Due schedule
  - Payment history
  - SEPA mandate status
- Documents:
  - Owner-related documents
- Consumption (if enabled)

### 3.9 Documents Page (Modal / Panel)
- Documents list
- Filters:
  - Type
  - Visibility
- Upload document action

### 3.10 Lots Management Page (Optional for v1)
- Lots table
- Owner / tenant assignment
- Tantièmes

### 3.11 Manager Settings Page
- Company information
- Users & roles
- Profile & password

---

## 4. Owner (Copropriétaire) Pages

### 4.1 Owner Dashboard
- List of condominiums
- Balance per condominium
- Status indicators (late / up to date)

### 4.2 Condominium Owner View
- Balance summary
- Payment schedule
- Payment history
- Action:
  - Sign SEPA mandate
  - Pay by card (if enabled)

### 4.3 Owner Documents Page
- Documents list
- Filters by type
- Download action

### 4.4 Owner Profile Page
- Personal information
- Notification preferences
- SEPA mandate info

---

## 5. Tenant Pages

### 5.1 Tenant Dashboard
- List of condominiums (if multiple)

### 5.2 Tenant Consumption Page
- Consumption history
- Period filter
- Charts (optional)

### 5.3 Tenant Profile Page
- Personal information

---

## 6. States & System Pages (for UI completeness)

### 6.1 Empty States
- No condominium yet
- No bank account connected
- No transactions
- No documents

### 6.2 Error States
- Access denied
- Session expired
- Integration error (bank / payment)

### 6.3 Loading States
- Dashboard loading
- Bank sync in progress