import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * Mock Stripe Service for SEPA Direct Debit
 * 
 * This service simulates Stripe API calls for development and testing.
 * Replace with real Stripe SDK in production.
 * 
 * Key Stripe features used:
 * - SEPA Direct Debit (payment method)
 * - Payment Intents (one-time charges)
 * - Mandates (authorization for recurring)
 * - Customers (owner/tenant records)
 */

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  metadata: Record<string, string>;
  created: number;
}

export interface StripeSepaDebitPaymentMethod {
  id: string;
  type: 'sepa_debit';
  sepa_debit: {
    bank_code: string;
    branch_code: string;
    country: string;
    fingerprint: string;
    last4: string;
  };
  billing_details: {
    name: string;
    email: string;
  };
  created: number;
  customer: string | null;
}

export interface StripeMandate {
  id: string;
  payment_method: string;
  status: 'pending' | 'active' | 'inactive' | 'revoked';
  type: 'single_use' | 'multi_use';
  customer_acceptance: {
    type: 'online' | 'offline';
    accepted_at: number;
    online?: {
      ip_address: string;
      user_agent: string;
    };
  };
  created: number;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  customer: string;
  payment_method: string | null;
  mandate: string | null;
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'succeeded'
    | 'canceled';
  description: string | null;
  metadata: Record<string, string>;
  created: number;
  charges?: {
    data: Array<{
      id: string;
      amount: number;
      status: string;
      created: number;
    }>;
  };
}

export interface CreateCustomerDto {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}

export interface CreateSepaPaymentMethodDto {
  iban: string;
  accountHolderName: string;
  email: string;
}

export interface CreatePaymentIntentDto {
  amount: number;
  currency?: string;
  customerId: string;
  paymentMethodId?: string;
  mandateId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class StripeMockService {
  private readonly logger = new Logger(StripeMockService.name);
  
  // In-memory storage for mock data
  private customers: Map<string, StripeCustomer> = new Map();
  private paymentMethods: Map<string, StripeSepaDebitPaymentMethod> = new Map();
  private mandates: Map<string, StripeMandate> = new Map();
  private paymentIntents: Map<string, StripePaymentIntent> = new Map();

  constructor() {
    this.logger.log('Stripe Mock Service initialized (DEVELOPMENT MODE)');
    this.seedMockData();
  }

  private seedMockData() {
    // Create sample customers
    const customer1: StripeCustomer = {
      id: 'cus_mock_001',
      email: 'jean.dupont@example.com',
      name: 'Jean Dupont',
      metadata: { userId: '1', tenantId: '1' },
      created: Date.now() / 1000,
    };
    this.customers.set(customer1.id, customer1);

    // Create sample SEPA payment method
    const pm1: StripeSepaDebitPaymentMethod = {
      id: 'pm_mock_sepa_001',
      type: 'sepa_debit',
      sepa_debit: {
        bank_code: '30002',
        branch_code: '00550',
        country: 'FR',
        fingerprint: 'fp_mock_abc123',
        last4: '3456',
      },
      billing_details: {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
      },
      created: Date.now() / 1000,
      customer: 'cus_mock_001',
    };
    this.paymentMethods.set(pm1.id, pm1);

    // Create sample mandate
    const mandate1: StripeMandate = {
      id: 'mandate_mock_001',
      payment_method: 'pm_mock_sepa_001',
      status: 'active',
      type: 'multi_use',
      customer_acceptance: {
        type: 'online',
        accepted_at: Date.now() / 1000 - 86400 * 30,
        online: {
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
        },
      },
      created: Date.now() / 1000 - 86400 * 30,
    };
    this.mandates.set(mandate1.id, mandate1);

    this.logger.debug('Mock data seeded');
  }

  // ============ CUSTOMERS ============

  async createCustomer(dto: CreateCustomerDto): Promise<StripeCustomer> {
    const customer: StripeCustomer = {
      id: `cus_${randomUUID().slice(0, 14)}`,
      email: dto.email,
      name: dto.name,
      metadata: dto.metadata || {},
      created: Date.now() / 1000,
    };
    this.customers.set(customer.id, customer);
    this.logger.debug(`Created mock customer: ${customer.id}`);
    return customer;
  }

  async getCustomer(customerId: string): Promise<StripeCustomer | null> {
    return this.customers.get(customerId) || null;
  }

  async listCustomers(): Promise<StripeCustomer[]> {
    return Array.from(this.customers.values());
  }

  // ============ PAYMENT METHODS (SEPA) ============

  async createSepaPaymentMethod(
    dto: CreateSepaPaymentMethodDto,
  ): Promise<StripeSepaDebitPaymentMethod> {
    // Validate IBAN format (basic check)
    const iban = dto.iban.replace(/\s/g, '').toUpperCase();
    if (!iban.match(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/)) {
      throw new Error('Invalid IBAN format');
    }

    const pm: StripeSepaDebitPaymentMethod = {
      id: `pm_${randomUUID().slice(0, 14)}`,
      type: 'sepa_debit',
      sepa_debit: {
        bank_code: iban.slice(4, 9),
        branch_code: iban.slice(9, 14),
        country: iban.slice(0, 2),
        fingerprint: `fp_${randomUUID().slice(0, 8)}`,
        last4: iban.slice(-4),
      },
      billing_details: {
        name: dto.accountHolderName,
        email: dto.email,
      },
      created: Date.now() / 1000,
      customer: null,
    };
    this.paymentMethods.set(pm.id, pm);
    this.logger.debug(`Created mock SEPA payment method: ${pm.id}`);
    return pm;
  }

  async attachPaymentMethodToCustomer(
    paymentMethodId: string,
    customerId: string,
  ): Promise<StripeSepaDebitPaymentMethod> {
    const pm = this.paymentMethods.get(paymentMethodId);
    if (!pm) throw new Error('Payment method not found');
    
    const customer = this.customers.get(customerId);
    if (!customer) throw new Error('Customer not found');

    pm.customer = customerId;
    this.paymentMethods.set(paymentMethodId, pm);
    this.logger.debug(`Attached ${paymentMethodId} to customer ${customerId}`);
    return pm;
  }

  async getPaymentMethod(paymentMethodId: string): Promise<StripeSepaDebitPaymentMethod | null> {
    return this.paymentMethods.get(paymentMethodId) || null;
  }

  async listPaymentMethods(customerId: string): Promise<StripeSepaDebitPaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(
      (pm) => pm.customer === customerId,
    );
  }

  // ============ MANDATES ============

  async createMandate(paymentMethodId: string, ipAddress = '127.0.0.1', userAgent = 'Unknown'): Promise<StripeMandate> {
    const pm = this.paymentMethods.get(paymentMethodId);
    if (!pm) throw new Error('Payment method not found');

    const mandate: StripeMandate = {
      id: `mandate_${randomUUID().slice(0, 14)}`,
      payment_method: paymentMethodId,
      status: 'pending',
      type: 'multi_use',
      customer_acceptance: {
        type: 'online',
        accepted_at: Date.now() / 1000,
        online: {
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      },
      created: Date.now() / 1000,
    };
    this.mandates.set(mandate.id, mandate);
    this.logger.debug(`Created mock mandate: ${mandate.id}`);

    // Simulate async activation (in reality, takes 1-2 business days)
    setTimeout(() => {
      mandate.status = 'active';
      this.mandates.set(mandate.id, mandate);
      this.logger.debug(`Mandate ${mandate.id} activated`);
    }, 2000);

    return mandate;
  }

  async getMandate(mandateId: string): Promise<StripeMandate | null> {
    return this.mandates.get(mandateId) || null;
  }

  async revokeMandate(mandateId: string): Promise<StripeMandate> {
    const mandate = this.mandates.get(mandateId);
    if (!mandate) throw new Error('Mandate not found');

    mandate.status = 'revoked';
    this.mandates.set(mandateId, mandate);
    this.logger.debug(`Mandate ${mandateId} revoked`);
    return mandate;
  }

  // ============ PAYMENT INTENTS ============

  async createPaymentIntent(dto: CreatePaymentIntentDto): Promise<StripePaymentIntent> {
    const pi: StripePaymentIntent = {
      id: `pi_${randomUUID().slice(0, 14)}`,
      amount: dto.amount,
      currency: dto.currency || 'eur',
      customer: dto.customerId,
      payment_method: dto.paymentMethodId || null,
      mandate: dto.mandateId || null,
      status: dto.paymentMethodId ? 'requires_confirmation' : 'requires_payment_method',
      description: dto.description || null,
      metadata: dto.metadata || {},
      created: Date.now() / 1000,
    };
    this.paymentIntents.set(pi.id, pi);
    this.logger.debug(`Created mock payment intent: ${pi.id} for ${dto.amount / 100} EUR`);
    return pi;
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
    const pi = this.paymentIntents.get(paymentIntentId);
    if (!pi) throw new Error('Payment intent not found');

    if (pi.status !== 'requires_confirmation') {
      throw new Error(`Cannot confirm payment intent with status: ${pi.status}`);
    }

    pi.status = 'processing';
    this.paymentIntents.set(paymentIntentId, pi);
    this.logger.debug(`Payment intent ${paymentIntentId} is processing`);

    // Simulate SEPA processing delay (real: 3-7 business days)
    setTimeout(() => {
      pi.status = 'succeeded';
      pi.charges = {
        data: [
          {
            id: `ch_${randomUUID().slice(0, 14)}`,
            amount: pi.amount,
            status: 'succeeded',
            created: Date.now() / 1000,
          },
        ],
      };
      this.paymentIntents.set(paymentIntentId, pi);
      this.logger.debug(`Payment intent ${paymentIntentId} succeeded`);
    }, 3000);

    return pi;
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
    const pi = this.paymentIntents.get(paymentIntentId);
    if (!pi) throw new Error('Payment intent not found');

    if (['succeeded', 'canceled'].includes(pi.status)) {
      throw new Error(`Cannot cancel payment intent with status: ${pi.status}`);
    }

    pi.status = 'canceled';
    this.paymentIntents.set(paymentIntentId, pi);
    this.logger.debug(`Payment intent ${paymentIntentId} canceled`);
    return pi;
  }

  async getPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent | null> {
    return this.paymentIntents.get(paymentIntentId) || null;
  }

  async listPaymentIntents(customerId?: string): Promise<StripePaymentIntent[]> {
    const all = Array.from(this.paymentIntents.values());
    return customerId ? all.filter((pi) => pi.customer === customerId) : all;
  }

  // ============ WEBHOOKS (simulated) ============

  simulateWebhookEvent(
    type: string,
    data: Record<string, unknown>,
  ): { id: string; type: string; data: { object: Record<string, unknown> }; created: number } {
    return {
      id: `evt_${randomUUID().slice(0, 14)}`,
      type,
      data: { object: data },
      created: Date.now() / 1000,
    };
  }
}
