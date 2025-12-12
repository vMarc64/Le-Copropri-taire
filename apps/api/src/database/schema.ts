import { pgTable, text, timestamp, uuid, boolean, varchar, integer, decimal } from 'drizzle-orm/pg-core';
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
  sepaEnabled: boolean('sepa_enabled').notNull().default(false),
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
  tantiemes: integer('tantiemes'), // Quote-part (millièmes)
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  tenantId_occupant: uuid('tenant_id_occupant').references(() => users.id, { onDelete: 'set null' }), // Locataire
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
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  ownedLots: many(lots, { relationName: 'owner' }),
  occupiedLots: many(lots, { relationName: 'tenant' }),
}));

export const condominiumsRelations = relations(condominiums, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [condominiums.tenantId],
    references: [tenants.id],
  }),
  lots: many(lots),
}));

export const lotsRelations = relations(lots, ({ one }) => ({
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
}));
