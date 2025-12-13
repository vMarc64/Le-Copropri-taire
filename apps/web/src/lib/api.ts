const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
  lots: string[];
  balance: number;
  hasSepaMandateActive: boolean;
}

export async function getOwners(): Promise<Owner[]> {
  return fetchApi<Owner[]>('/owners');
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
  lots: number;
  owners: number;
  balance: number;
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
  latePayments: number;
  unpaidAmount: number;
  ownersInArrears: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchApi<DashboardStats>('/dashboard/stats');
}

export async function getCondominiumsWithUnpaid(): Promise<CondominiumWithUnpaid[]> {
  return fetchApi<CondominiumWithUnpaid[]>('/dashboard/condominiums-with-unpaid');
}
