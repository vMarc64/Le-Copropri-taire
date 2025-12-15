const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Use relative URLs for browser (Next.js proxy) and absolute for server
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser: use relative URL (goes through Next.js API routes)
    return '/api';
  }
  // Server: use backend URL directly
  return API_URL;
};

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Include cookies
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Owners API
export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  condominiums: string[];
  condominiumIds?: string[];
  lots: string[];
  balance: number;
  hasSepaMandateActive: boolean;
}

export async function getOwners(): Promise<Owner[]> {
  return fetchApi<Owner[]>('/owners');
}

export async function updateOwnerCondominiums(ownerId: string, condominiumIds: string[]): Promise<{ success: boolean; count: number }> {
  return fetchApi<{ success: boolean; count: number }>(`/owners/${ownerId}/condominiums`, {
    method: 'POST',
    body: JSON.stringify({ condominiumIds }),
  });
}

export interface OrphanOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
}

export async function searchOrphanOwners(query: string): Promise<OrphanOwner[]> {
  if (!query || query.length < 2) return [];
  return fetchApi<OrphanOwner[]>(`/owners/search?q=${encodeURIComponent(query)}`);
}

export async function associateOwnerToSyndic(ownerId: string): Promise<Owner> {
  return fetchApi<Owner>(`/owners/${ownerId}/associate`, {
    method: 'POST',
  });
}

// Lots API for owners
export interface AvailableLot {
  id: string;
  reference: string;
  type: string;
  floor: number | null;
  surface: string | null;
  tantiemes: number | null;
  condominiumId: string;
  condominiumName: string;
  ownerId: string | null;
  isAssigned: boolean;
}

export async function getAvailableLotsForOwner(ownerId: string): Promise<AvailableLot[]> {
  return fetchApi<AvailableLot[]>(`/owners/${ownerId}/lots/available`);
}

export async function updateOwnerLots(ownerId: string, lotIds: string[]): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(`/owners/${ownerId}/lots`, {
    method: 'POST',
    body: JSON.stringify({ lotIds }),
  });
}

// Documents API
export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  fileSize: number;
  mimeType: string;
  visibility: string;
  condominiumId: string;
  condominiumName: string;
  uploadedBy: string;
  createdAt: string;
}

export async function getDocuments(condominiumId?: string): Promise<Document[]> {
  const params = condominiumId ? `?condominiumId=${condominiumId}` : '';
  return fetchApi<Document[]>(`/documents${params}`);
}

// Bank API
export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  iban: string;
  balance: number;
  lastSyncAt: string | null;
  status: string;
  condominiumId: string;
  condominiumName: string;
}

export interface Transaction {
  id: string;
  bankAccountId: string;
  amount: number;
  type: string;
  description: string;
  counterpartyName: string | null;
  transactionDate: string;
  reconciliationStatus: string;
  category: string | null;
}

export async function getBankAccounts(condominiumId?: string): Promise<BankAccount[]> {
  const params = condominiumId ? `?condominiumId=${condominiumId}` : '';
  return fetchApi<BankAccount[]>(`/bank/accounts${params}`);
}

export async function getTransactions(accountId?: string, condominiumId?: string): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (accountId) params.append('accountId', accountId);
  if (condominiumId) params.append('condominiumId', condominiumId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<Transaction[]>(`/bank/transactions${query}`);
}

// Condominiums API (for filters)
export interface Condominium {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  sepaEnabled: boolean;
  cbEnabled: boolean;
  callFrequency: 'monthly' | 'quarterly';
  lots: number;
  owners: number;
  balance: number;
  hasBankAccount: boolean;
}

export async function getCondominiums(): Promise<Condominium[]> {
  return fetchApi<Condominium[]>('/condominiums');
}

export async function getCondominium(id: string): Promise<Condominium | null> {
  return fetchApi<Condominium | null>(`/condominiums/${id}`);
}

// Dashboard API
export interface DashboardStats {
  latePayments: number;
  latePaymentsTrend: number;
  totalUnpaid: number;
  totalUnpaidTrend: number;
  failedDirectDebits: number;
  failedDirectDebitsTrend: number;
}

export interface CondominiumWithUnpaid {
  id: string;
  name: string;
  address: string;
  unpaidAmount: number;
  ownersInArrears: number;
  failedDirectDebits: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchApi<DashboardStats>('/dashboard/stats');
}

export async function getCondominiumsWithUnpaid(): Promise<CondominiumWithUnpaid[]> {
  return fetchApi<CondominiumWithUnpaid[]>('/dashboard/condominiums-with-unpaid');
}

// =============================================================================
// Platform Admin API
// =============================================================================

export interface Syndic {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  managersCount?: number;
  condominiumsCount?: number;
  ownersCount?: number;
}

export interface SyndicDetail extends Syndic {
  managers?: Manager[];
  condominiums?: { id: string; name: string; address: string; city: string }[];
}

export interface SyndicListResponse {
  data: Syndic[];
  total: number;
  page: number;
  limit: number;
}

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStats {
  syndics: number;
  users: number;
  condominiums: number;
  owners: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return fetchApi<PlatformStats>('/platform/stats');
}

export async function getSyndics(options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<SyndicListResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);
  if (options?.status) params.append('status', options.status);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<SyndicListResponse>(`/platform/syndics${query}`);
}

export async function getSyndic(id: string): Promise<SyndicDetail> {
  return fetchApi<SyndicDetail>(`/platform/syndics/${id}`);
}

export interface CreateSyndicData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  siret?: string;
}

export async function createSyndic(data: CreateSyndicData): Promise<Syndic> {
  return fetchApi<Syndic>('/platform/syndics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSyndic(id: string, data: Partial<Syndic>): Promise<Syndic> {
  return fetchApi<Syndic>(`/platform/syndics/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSyndic(id: string): Promise<{ message: string }> {
  return fetchApi<{ message: string }>(`/platform/syndics/${id}`, {
    method: 'DELETE',
  });
}

export async function getManagers(syndicId: string): Promise<{ data: Manager[]; total: number }> {
  return fetchApi<{ data: Manager[]; total: number }>(`/platform/syndics/${syndicId}/managers`);
}

export async function createManager(syndicId: string, data: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<Manager> {
  return fetchApi<Manager>(`/platform/syndics/${syndicId}/managers`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteManager(syndicId: string, managerId: string): Promise<{ message: string }> {
  return fetchApi<{ message: string }>(`/platform/syndics/${syndicId}/managers/${managerId}`, {
    method: 'DELETE',
  });
}

// =============================================================================
// Pending Users API (Platform Admin)
// =============================================================================

export interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface PendingUsersResponse {
  data: PendingUser[];
  total: number;
  page: number;
  limit: number;
}

export async function getPendingUsers(options?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}): Promise<PendingUsersResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);
  if (options?.role) params.append('role', options.role);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<PendingUsersResponse>(`/platform/users/pending${query}`);
}

export async function associateUserToSyndic(userId: string, syndicId: string): Promise<PendingUser> {
  return fetchApi<PendingUser>(`/platform/users/${userId}/associate/${syndicId}`, {
    method: 'POST',
  });
}

