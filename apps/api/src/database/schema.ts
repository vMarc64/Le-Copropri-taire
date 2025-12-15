import { pgTable, text, timestamp, uuid, boolean, varchar, integer, decimal, date, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// TENANTS (Property Managers)
// ============================================================================

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, suspended
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// USERS
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }), // null for platform_admin
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // platform_admin, manager, owner, tenant
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, suspended, pending
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// CONDOMINIUMS (Copropriétés)
// ============================================================================

export const condominiums = pgTable('condominiums', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  siret: varchar('siret', { length: 14 }),
  bankAccountId: uuid('bank_account_id'), // Link to open banking account
  
  // Payment settings
  callFrequency: varchar('call_frequency', { length: 20 }).notNull().default('monthly'), // monthly, quarterly
  sepaEnabled: boolean('sepa_enabled').notNull().default(false),
  cbEnabled: boolean('cb_enabled').notNull().default(false),
  
  // Manual bank details (when no Powens connection)
  bankIban: varchar('bank_iban', { length: 34 }),
  bankBic: varchar('bank_bic', { length: 11 }),
  bankName: varchar('bank_name', { length: 255 }),
  
  // Utility billing settings: individual, global_metered, global_fixed, none
  coldWaterBilling: varchar('cold_water_billing', { length: 20 }).notNull().default('none'),
  hotWaterBilling: varchar('hot_water_billing', { length: 20 }).notNull().default('none'),
  heatingBilling: varchar('heating_billing', { length: 20 }).notNull().default('none'), // Chauffage collectif
  gasBilling: varchar('gas_billing', { length: 20 }).notNull().default('none'),
  electricityCommonBilling: varchar('electricity_common_billing', { length: 20 }).notNull().default('none'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// LOTS
// ============================================================================

export const lots = pgTable('lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  condominiumId: uuid('condominium_id').notNull().references(() => condominiums.id, { onDelete: 'cascade' }),
  reference: varchar('reference', { length: 50 }).notNull(), // e.g., "A12", "B05"
  type: varchar('type', { length: 50 }).notNull(), // appartement, parking, cave
  floor: integer('floor'),
  surface: decimal('surface', { precision: 10, scale: 2 }), // in m²
  tantiemes: decimal('tantiemes', { precision: 10, scale: 3 }), // Quote-part (millièmes) - peut être décimal
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  tenantId_occupant: uuid('tenant_id_occupant').references(() => users.id, { onDelete: 'set null' }), // Locataire
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// OWNER CONDOMINIUMS (Association table)
// ============================================================================

export const ownerCondominiums = pgTable('owner_condominiums', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  condominiumId: uuid('condominium_id').notNull().references(() => condominiums.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================================================
// DOCUMENTS
// ============================================================================

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  condominiumId: uuid('condominium_id').references(() => condominiums.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // invoice, ag_report, quote, contract, other
  category: varchar('category', { length: 100 }), // charges, travaux, legal, etc.
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'), // in bytes
  mimeType: varchar('mime_type', { length: 100 }),
  visibility: varchar('visibility', { length: 50 }).notNull().default('managers'), // managers, owners, tenants, all
  uploadedById: uuid('uploaded_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// POWENS CONNECTIONS (Open Banking tokens - stored securely, never exposed to frontend)
// ============================================================================

export const powensConnections = pgTable('powens_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  condominiumId: uuid('condominium_id').notNull().references(() => condominiums.id, { onDelete: 'cascade' }),
  
  // Powens identifiers
  powensUserId: integer('powens_user_id'), // Powens user ID
  powensConnectionId: integer('powens_connection_id'), // Powens connection ID
  powensConnectorId: integer('powens_connector_id'), // Bank connector ID
  
  // Token - encrypted in production
  accessToken: text('access_token').notNull(), // Powens permanent access token
  
  // Connection status from Powens
  state: varchar('state', { length: 50 }), // null, SCARequired, wrongpass, actionNeeded, etc.
  errorMessage: text('error_message'),
  
  // Bank info
  bankName: varchar('bank_name', { length: 255 }),
  bankLogoUrl: text('bank_logo_url'),
  
  // Sync tracking
  lastSyncAt: timestamp('last_sync_at'),
  lastSyncStatus: varchar('last_sync_status', { length: 50 }), // success, error, pending
  
  // Status
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, disconnected, error, revoked
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// BANK ACCOUNTS (Open Banking - Powens)
// ============================================================================

export const bankAccounts = pgTable('bank_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  condominiumId: uuid('condominium_id').references(() => condominiums.id, { onDelete: 'cascade' }),
  powensConnectionId: uuid('powens_connection_id').references(() => powensConnections.id, { onDelete: 'cascade' }), // Link to Powens connection
  
  // Powens account identifiers
  powensAccountId: integer('powens_account_id'), // Powens account ID
  
  // Account details
  bankName: varchar('bank_name', { length: 255 }),
  accountName: varchar('account_name', { length: 255 }),
  accountType: varchar('account_type', { length: 50 }), // checking, savings, card, loan, etc.
  accountNumber: varchar('account_number', { length: 50 }), // Masked account number
  iban: varchar('iban', { length: 34 }),
  bic: varchar('bic', { length: 11 }),
  
  // Balance
  balance: decimal('balance', { precision: 15, scale: 2 }),
  comingBalance: decimal('coming_balance', { precision: 15, scale: 2 }), // Upcoming transactions
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  
  // Visibility and usage
  isMain: boolean('is_main').notNull().default(false), // Main account for the copro
  isDisabled: boolean('is_disabled').notNull().default(false), // User disabled this account
  
  // Sync tracking
  lastSyncAt: timestamp('last_sync_at'),
  
  // Status
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, disabled, error
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// BANK TRANSACTIONS
// ============================================================================

export const bankTransactions = pgTable('bank_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  bankAccountId: uuid('bank_account_id').notNull().references(() => bankAccounts.id, { onDelete: 'cascade' }),
  
  // Powens identifiers
  powensTransactionId: integer('powens_transaction_id'), // Powens transaction ID
  
  // Transaction details
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  grossAmount: decimal('gross_amount', { precision: 15, scale: 2 }), // Before fees
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  
  // Description
  originalWording: text('original_wording'), // Original bank wording
  simplifiedWording: text('simplified_wording'), // Cleaned wording from Powens
  description: text('description'), // User-friendly description
  
  // Counterparty
  counterpartyName: varchar('counterparty_name', { length: 255 }),
  counterpartyIban: varchar('counterparty_iban', { length: 34 }),
  
  // Dates
  transactionDate: date('transaction_date').notNull(), // Date of transaction
  valueDate: date('value_date'), // Value date (when money is available)
  applicationDate: date('application_date'), // Application date for deferred operations
  
  // Type and category
  type: varchar('type', { length: 50 }), // transfer, order, check, deposit, withdrawal, card, deferred_card, loan_payment, bank, unknown
  direction: varchar('direction', { length: 10 }), // credit, debit
  category: varchar('category', { length: 100 }), // Auto-categorized by Powens
  powensCategoryId: integer('powens_category_id'),
  
  // Status
  isComing: boolean('is_coming').notNull().default(false), // Upcoming transaction
  isActive: boolean('is_active').notNull().default(true),
  
  // Reconciliation
  reconciliationStatus: varchar('reconciliation_status', { length: 50 }).notNull().default('unmatched'), // unmatched, matched, ignored
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// SEPA MANDATES (Stripe)
// ============================================================================

export const sepaMandates = pgTable('sepa_mandates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  condominiumId: uuid('condominium_id').notNull().references(() => condominiums.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeMandateId: varchar('stripe_mandate_id', { length: 255 }),
  stripePaymentMethodId: varchar('stripe_payment_method_id', { length: 255 }),
  iban: varchar('iban', { length: 34 }).notNull(),
  bic: varchar('bic', { length: 11 }),
  accountHolderName: varchar('account_holder_name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, active, revoked, failed
  signedAt: timestamp('signed_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// PAYMENT SCHEDULES (Échéanciers)
// ============================================================================

export const paymentSchedules = pgTable('payment_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  condominiumId: uuid('condominium_id').notNull().references(() => condominiums.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lotId: uuid('lot_id').references(() => lots.id, { onDelete: 'set null' }),
  year: integer('year').notNull(),
  frequency: varchar('frequency', { length: 20 }).notNull().default('monthly'), // monthly, quarterly, annual
  monthlyAmount: decimal('monthly_amount', { precision: 10, scale: 2 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, paused, cancelled
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// PAYMENTS (Appels de fonds / Paiements)
// ============================================================================

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  condominiumId: uuid('condominium_id').notNull().references(() => condominiums.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lotId: uuid('lot_id').references(() => lots.id, { onDelete: 'set null' }),
  scheduleId: uuid('schedule_id').references(() => paymentSchedules.id, { onDelete: 'set null' }),
  type: varchar('type', { length: 50 }).notNull(), // regular, adjustment, exceptional
  description: varchar('description', { length: 255 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: date('due_date').notNull(),
  paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }).default('0'),
  paidAt: timestamp('paid_at'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, paid, partial, overdue, cancelled
  paymentMethod: varchar('payment_method', { length: 50 }), // sepa, card, transfer, check, cash
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// RECONCILIATIONS (Rapprochements bancaires)
// ============================================================================

export const reconciliations = pgTable('reconciliations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  bankTransactionId: uuid('bank_transaction_id').notNull().references(() => bankTransactions.id, { onDelete: 'cascade' }),
  paymentId: uuid('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
  matchType: varchar('match_type', { length: 50 }).notNull(), // auto, manual, ai_suggested
  confidence: decimal('confidence', { precision: 5, scale: 2 }), // AI confidence score 0-100
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, confirmed, rejected
  matchedById: uuid('matched_by_id').references(() => users.id, { onDelete: 'set null' }),
  matchedAt: timestamp('matched_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  condominiums: many(condominiums),
  lots: many(lots),
  documents: many(documents),
  powensConnections: many(powensConnections),
  bankAccounts: many(bankAccounts),
  bankTransactions: many(bankTransactions),
  sepaMandates: many(sepaMandates),
  paymentSchedules: many(paymentSchedules),
  payments: many(payments),
  reconciliations: many(reconciliations),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  ownedLots: many(lots, { relationName: 'owner' }),
  occupiedLots: many(lots, { relationName: 'tenant' }),
  documents: many(documents),
  sepaMandates: many(sepaMandates),
  paymentSchedules: many(paymentSchedules),
  payments: many(payments),
}));

export const condominiumsRelations = relations(condominiums, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [condominiums.tenantId],
    references: [tenants.id],
  }),
  lots: many(lots),
  documents: many(documents),
  powensConnections: many(powensConnections),
  bankAccounts: many(bankAccounts),
  sepaMandates: many(sepaMandates),
  paymentSchedules: many(paymentSchedules),
  payments: many(payments),
}));

export const lotsRelations = relations(lots, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [lots.tenantId],
    references: [tenants.id],
  }),
  condominium: one(condominiums, {
    fields: [lots.condominiumId],
    references: [condominiums.id],
  }),
  owner: one(users, {
    fields: [lots.ownerId],
    references: [users.id],
    relationName: 'owner',
  }),
  occupant: one(users, {
    fields: [lots.tenantId_occupant],
    references: [users.id],
    relationName: 'tenant',
  }),
  paymentSchedules: many(paymentSchedules),
  payments: many(payments),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [documents.tenantId],
    references: [tenants.id],
  }),
  condominium: one(condominiums, {
    fields: [documents.condominiumId],
    references: [condominiums.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedById],
    references: [users.id],
  }),
}));

// Powens Connections Relations
export const powensConnectionsRelations = relations(powensConnections, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [powensConnections.tenantId],
    references: [tenants.id],
  }),
  condominium: one(condominiums, {
    fields: [powensConnections.condominiumId],
    references: [condominiums.id],
  }),
  bankAccounts: many(bankAccounts),
}));

export const bankAccountsRelations = relations(bankAccounts, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [bankAccounts.tenantId],
    references: [tenants.id],
  }),
  condominium: one(condominiums, {
    fields: [bankAccounts.condominiumId],
    references: [condominiums.id],
  }),
  powensConnection: one(powensConnections, {
    fields: [bankAccounts.powensConnectionId],
    references: [powensConnections.id],
  }),
  transactions: many(bankTransactions),
}));

export const bankTransactionsRelations = relations(bankTransactions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [bankTransactions.tenantId],
    references: [tenants.id],
  }),
  bankAccount: one(bankAccounts, {
    fields: [bankTransactions.bankAccountId],
    references: [bankAccounts.id],
  }),
  reconciliations: many(reconciliations),
}));

export const sepaMandatesRelations = relations(sepaMandates, ({ one }) => ({
  tenant: one(tenants, {
    fields: [sepaMandates.tenantId],
    references: [tenants.id],
  }),
  condominium: one(condominiums, {
    fields: [sepaMandates.condominiumId],
    references: [condominiums.id],
  }),
  owner: one(users, {
    fields: [sepaMandates.ownerId],
    references: [users.id],
  }),
}));

export const paymentSchedulesRelations = relations(paymentSchedules, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [paymentSchedules.tenantId],
    references: [tenants.id],
  }),
  condominium: one(condominiums, {
    fields: [paymentSchedules.condominiumId],
    references: [condominiums.id],
  }),
  owner: one(users, {
    fields: [paymentSchedules.ownerId],
    references: [users.id],
  }),
  lot: one(lots, {
    fields: [paymentSchedules.lotId],
    references: [lots.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [payments.tenantId],
    references: [tenants.id],
  }),
  condominium: one(condominiums, {
    fields: [payments.condominiumId],
    references: [condominiums.id],
  }),
  owner: one(users, {
    fields: [payments.ownerId],
    references: [users.id],
  }),
  lot: one(lots, {
    fields: [payments.lotId],
    references: [lots.id],
  }),
  schedule: one(paymentSchedules, {
    fields: [payments.scheduleId],
    references: [paymentSchedules.id],
  }),
  reconciliations: many(reconciliations),
}));

export const reconciliationsRelations = relations(reconciliations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [reconciliations.tenantId],
    references: [tenants.id],
  }),
  bankTransaction: one(bankTransactions, {
    fields: [reconciliations.bankTransactionId],
    references: [bankTransactions.id],
  }),
  payment: one(payments, {
    fields: [reconciliations.paymentId],
    references: [payments.id],
  }),
  matchedBy: one(users, {
    fields: [reconciliations.matchedById],
    references: [users.id],
  }),
}));
