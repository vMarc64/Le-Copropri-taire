/**
 * Zone Guards for Le Copropriétaire
 * 
 * The application has different zones with different access requirements:
 * 
 * 1. PUBLIC ZONE (/api/auth/*, /api/health)
 *    - No authentication required
 *    - No tenant context
 *    - Use: @Public() + @SkipTenantCheck()
 * 
 * 2. OWNER PORTAL (/api/portal/*)
 *    - Authentication required
 *    - Roles: owner, tenant, council
 *    - Tenant context required (owner's tenant)
 * 
 * 3. MANAGER ZONE (/api/manage/*)
 *    - Authentication required
 *    - Roles: manager, admin
 *    - Tenant context required
 * 
 * 4. PLATFORM ADMIN (/api/admin/*)
 *    - Authentication required
 *    - Role: platform_admin only
 *    - Optional tenant context (for impersonation)
 */

export enum Zone {
  PUBLIC = 'public',
  PORTAL = 'portal',        // Espace copropriétaire
  MANAGE = 'manage',        // Espace gestionnaire
  ADMIN = 'admin',          // Admin plateforme
}

/**
 * Roles allowed in each zone
 */
export const ZONE_ROLES: Record<Zone, string[]> = {
  [Zone.PUBLIC]: [], // No authentication needed
  [Zone.PORTAL]: ['owner', 'tenant', 'council', 'manager', 'admin', 'platform_admin'],
  [Zone.MANAGE]: ['manager', 'admin', 'platform_admin'],
  [Zone.ADMIN]: ['platform_admin'],
};
