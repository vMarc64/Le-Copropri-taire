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

All tables include a `tenant_id` column (except `tenants` table) to ensure data isolation:

- **tenants**: Property Managers (= SaaS tenants)
- **users**: All users (platform_admin, manager, owner, tenant/locataire)
  - `tenantId` is NULL for platform_admin
  - `role` field: platform_admin | manager | owner | tenant
- **condominiums**: Copropriétés (each belongs to a tenant)
- **lots**: Units/apartments/parking (linked to condominium and owner/tenant)

### Key Points

1. **Tenant Isolation**: Every query should filter by `tenant_id` (except platform_admin operations)
2. **Cascade Deletes**: Deleting a tenant cascades to all related data
3. **UUIDs**: All IDs use UUID v4 for security and distributed systems
4. **Timestamps**: All tables have `createdAt` and `updatedAt`

## Next Steps

After setting up the database:

1. Create a NestJS module for database access
2. Implement tenant context middleware
3. Add repositories/services with tenant filtering
4. Create seed data (optional)

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Supabase Docs](https://supabase.com/docs)
