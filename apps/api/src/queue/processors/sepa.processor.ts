import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export interface SepaJobData {
  tenantId: string;
  condominiumId: string;
  batchId: string;
  payments: Array<{
    ownerId: string;
    amount: number;
    reference: string;
    mandateId: string;
  }>;
}

export const SEPA_QUEUE = 'sepa';

@Processor(SEPA_QUEUE)
export class SepaProcessor extends WorkerHost {
  private readonly logger = new Logger(SepaProcessor.name);

  async process(job: Job<SepaJobData>): Promise<void> {
    this.logger.log(`Processing SEPA batch job ${job.id} for tenant ${job.data.tenantId}`);

    const { batchId, payments } = job.data;

    // TODO: Implement actual SEPA batch generation logic
    // 1. Generate SEPA XML file
    // 2. Submit to PSP
    // 3. Update payment statuses in database

    this.logger.log(`SEPA batch ${batchId}: Processing ${payments.length} payments`);

    for (const payment of payments) {
      await this.processPayment(payment);
    }

    this.logger.log(`SEPA batch job ${job.id} completed`);
  }

  private async processPayment(payment: SepaJobData['payments'][0]): Promise<void> {
    // Placeholder for individual payment processing
    this.logger.debug(`Processing payment ${payment.reference}: ${payment.amount}€`);
  }
}
