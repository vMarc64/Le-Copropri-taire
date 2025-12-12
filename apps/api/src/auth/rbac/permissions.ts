/**
 * User roles in the system
 * Hierarchical from least to most privileged
 */
export enum UserRole {
  // Locataire - resident of a lot
  TENANT = 'tenant',
  
  // Propriétaire - owner of lot(s)
  OWNER = 'owner',
  
  // Conseil Syndical - member of the syndicate council
  COUNCIL = 'council',
  
  // Gestionnaire - property manager (employee of syndic)
  MANAGER = 'manager',
  
  // Admin Gestionnaire - admin of the property management company
  ADMIN = 'admin',
  
  // Super Admin - platform administrator
  PLATFORM_ADMIN = 'platform_admin',
}

/**
 * Permissions available in the system
 * Grouped by domain
 */
export enum Permission {
  // User management
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Condominium management
  CONDO_VIEW = 'condo:view',
  CONDO_CREATE = 'condo:create',
  CONDO_UPDATE = 'condo:update',
  CONDO_DELETE = 'condo:delete',

  // Lot management
  LOT_VIEW = 'lot:view',
  LOT_CREATE = 'lot:create',
  LOT_UPDATE = 'lot:update',
  LOT_DELETE = 'lot:delete',

  // Financial management
  FINANCE_VIEW = 'finance:view',
  FINANCE_CREATE = 'finance:create',
  FINANCE_UPDATE = 'finance:update',
  FINANCE_APPROVE = 'finance:approve',
  FINANCE_EXPORT = 'finance:export',

  // Payment management
  PAYMENT_VIEW = 'payment:view',
  PAYMENT_CREATE = 'payment:create',
  PAYMENT_REFUND = 'payment:refund',

  // Document management
  DOCUMENT_VIEW = 'document:view',
  DOCUMENT_UPLOAD = 'document:upload',
  DOCUMENT_DELETE = 'document:delete',

  // AG (Assemblée Générale)
  AG_VIEW = 'ag:view',
  AG_CREATE = 'ag:create',
  AG_VOTE = 'ag:vote',
  AG_PROXY = 'ag:proxy',

  // Communication
  MESSAGE_VIEW = 'message:view',
  MESSAGE_SEND = 'message:send',
  ANNOUNCEMENT_CREATE = 'announcement:create',

  // Reports & Analytics
  REPORT_VIEW = 'report:view',
  REPORT_EXPORT = 'report:export',

  // Settings
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_UPDATE = 'settings:update',

  // Tenant (property manager) management
  TENANT_VIEW = 'tenant:view',
  TENANT_CREATE = 'tenant:create',
  TENANT_UPDATE = 'tenant:update',
  TENANT_SUSPEND = 'tenant:suspend',
}

/**
 * Role to permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.TENANT]: [
    // Basic view access
    Permission.CONDO_VIEW,
    Permission.LOT_VIEW,
    Permission.DOCUMENT_VIEW,
    Permission.MESSAGE_VIEW,
    Permission.MESSAGE_SEND,
    Permission.AG_VIEW,
    Permission.PAYMENT_VIEW,
    Permission.FINANCE_VIEW, // Own finances only
  ],

  [UserRole.OWNER]: [
    // Everything tenant can do plus:
    Permission.CONDO_VIEW,
    Permission.LOT_VIEW,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.MESSAGE_VIEW,
    Permission.MESSAGE_SEND,
    Permission.AG_VIEW,
    Permission.AG_VOTE,
    Permission.AG_PROXY,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_CREATE,
    Permission.FINANCE_VIEW,
    Permission.REPORT_VIEW,
  ],

  [UserRole.COUNCIL]: [
    // Everything owner can do plus:
    Permission.CONDO_VIEW,
    Permission.LOT_VIEW,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.MESSAGE_VIEW,
    Permission.MESSAGE_SEND,
    Permission.AG_VIEW,
    Permission.AG_CREATE,
    Permission.AG_VOTE,
    Permission.AG_PROXY,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_CREATE,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_APPROVE, // Can approve certain operations
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.ANNOUNCEMENT_CREATE,
  ],

  [UserRole.MANAGER]: [
    // Full management access
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.CONDO_VIEW,
    Permission.CONDO_CREATE,
    Permission.CONDO_UPDATE,
    Permission.LOT_VIEW,
    Permission.LOT_CREATE,
    Permission.LOT_UPDATE,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_DELETE,
    Permission.MESSAGE_VIEW,
    Permission.MESSAGE_SEND,
    Permission.ANNOUNCEMENT_CREATE,
    Permission.AG_VIEW,
    Permission.AG_CREATE,
    Permission.AG_VOTE,
    Permission.AG_PROXY,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_REFUND,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.FINANCE_APPROVE,
    Permission.FINANCE_EXPORT,
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.SETTINGS_VIEW,
  ],

  [UserRole.ADMIN]: [
    // Everything manager can do plus user deletion and settings
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.CONDO_VIEW,
    Permission.CONDO_CREATE,
    Permission.CONDO_UPDATE,
    Permission.CONDO_DELETE,
    Permission.LOT_VIEW,
    Permission.LOT_CREATE,
    Permission.LOT_UPDATE,
    Permission.LOT_DELETE,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_DELETE,
    Permission.MESSAGE_VIEW,
    Permission.MESSAGE_SEND,
    Permission.ANNOUNCEMENT_CREATE,
    Permission.AG_VIEW,
    Permission.AG_CREATE,
    Permission.AG_VOTE,
    Permission.AG_PROXY,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_REFUND,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.FINANCE_APPROVE,
    Permission.FINANCE_EXPORT,
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE,
  ],

  [UserRole.PLATFORM_ADMIN]: [
    // All permissions including tenant management
    ...Object.values(Permission),
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) ?? false;
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
