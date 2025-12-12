import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

export const EMAIL_QUEUE = 'email';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id}: ${job.data.subject} to ${job.data.to}`);

    // TODO: Implement actual email sending logic
    // This will be handled by N8N in production
    // For now, just log the job data

    await this.sendEmail(job.data);

    this.logger.log(`Email job ${job.id} completed`);
  }

  private async sendEmail(data: EmailJobData): Promise<void> {
    // Placeholder for email sending logic
    // In production, this could trigger a webhook to N8N
    // or use a service like SendGrid, AWS SES, etc.
    this.logger.debug(`Would send email to ${data.to}: ${data.subject}`);
  }
}
