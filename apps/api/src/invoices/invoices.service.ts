import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database';
import { invoices, condominiums, documents } from '../database/schema';
import { eq, and, desc, gte, lte, ilike, or } from 'drizzle-orm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  /**
   * Create a new invoice
   */
  async create(tenantId: string, data: CreateInvoiceDto) {
    // Verify condominium belongs to tenant
    const condo = await db.query.condominiums.findFirst({
      where: and(
        eq(condominiums.id, data.condominiumId),
        eq(condominiums.tenantId, tenantId)
      ),
    });

    if (!condo) {
      throw new NotFoundException('Condominium not found');
    }

    const [invoice] = await db.insert(invoices).values({
      tenantId,
      condominiumId: data.condominiumId,
      supplierName: data.supplierName,
      invoiceNumber: data.invoiceNumber,
      supplierReference: data.supplierReference,
      amountHt: data.amountHt?.toString(),
      amountTtc: data.amountTtc.toString(),
      vatAmount: data.vatAmount?.toString(),
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      category: data.category,
      description: data.description,
      documentId: data.documentId,
      status: 'pending',
    }).returning();

    return invoice;
  }

  /**
   * Find all invoices for a condominium
   */
  async findAll(
    tenantId: string,
    condominiumId: string,
    filters?: {
      status?: string;
      category?: string;
      supplier?: string;
      from?: string;
      to?: string;
    }
  ) {
    const conditions = [
      eq(invoices.tenantId, tenantId),
      eq(invoices.condominiumId, condominiumId),
    ];

    if (filters?.status) {
      conditions.push(eq(invoices.status, filters.status));
    }

    if (filters?.category) {
      conditions.push(eq(invoices.category, filters.category));
    }

    if (filters?.supplier) {
      conditions.push(ilike(invoices.supplierName, `%${filters.supplier}%`));
    }

    if (filters?.from) {
      conditions.push(gte(invoices.issueDate, filters.from));
    }

    if (filters?.to) {
      conditions.push(lte(invoices.issueDate, filters.to));
    }

    const results = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        supplierName: invoices.supplierName,
        amountHt: invoices.amountHt,
        amountTtc: invoices.amountTtc,
        vatAmount: invoices.vatAmount,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        category: invoices.category,
        status: invoices.status,
        description: invoices.description,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .where(and(...conditions))
      .orderBy(desc(invoices.issueDate));

    return results.map(inv => ({
      ...inv,
      amountHt: inv.amountHt ? Number(inv.amountHt) : null,
      amountTtc: Number(inv.amountTtc),
      vatAmount: inv.vatAmount ? Number(inv.vatAmount) : null,
    }));
  }

  /**
   * Find one invoice by ID
   */
  async findOne(tenantId: string, id: string) {
    const result = await db
      .select({
        id: invoices.id,
        condominiumId: invoices.condominiumId,
        invoiceNumber: invoices.invoiceNumber,
        supplierName: invoices.supplierName,
        supplierReference: invoices.supplierReference,
        amountHt: invoices.amountHt,
        amountTtc: invoices.amountTtc,
        vatAmount: invoices.vatAmount,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        periodStart: invoices.periodStart,
        periodEnd: invoices.periodEnd,
        category: invoices.category,
        description: invoices.description,
        status: invoices.status,
        paidAt: invoices.paidAt,
        documentId: invoices.documentId,
        extractedData: invoices.extractedData,
        confidenceScore: invoices.confidenceScore,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
      })
      .from(invoices)
      .where(and(
        eq(invoices.id, id),
        eq(invoices.tenantId, tenantId)
      ))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Invoice not found');
    }

    const inv = result[0];

    // Get document if linked
    let document = null;
    if (inv.documentId) {
      const docs = await db
        .select({
          id: documents.id,
          name: documents.name,
          fileUrl: documents.fileUrl,
          mimeType: documents.mimeType,
        })
        .from(documents)
        .where(eq(documents.id, inv.documentId))
        .limit(1);
      
      if (docs.length > 0) {
        document = docs[0];
      }
    }

    return {
      ...inv,
      amountHt: inv.amountHt ? Number(inv.amountHt) : null,
      amountTtc: Number(inv.amountTtc),
      vatAmount: inv.vatAmount ? Number(inv.vatAmount) : null,
      document,
    };
  }

  /**
   * Update an invoice
   */
  async update(tenantId: string, id: string, data: UpdateInvoiceDto) {
    // Verify invoice exists and belongs to tenant
    const existing = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.id, id),
        eq(invoices.tenantId, tenantId)
      ),
    });

    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.supplierName !== undefined) updateData.supplierName = data.supplierName;
    if (data.invoiceNumber !== undefined) updateData.invoiceNumber = data.invoiceNumber;
    if (data.supplierReference !== undefined) updateData.supplierReference = data.supplierReference;
    if (data.amountHt !== undefined) updateData.amountHt = data.amountHt.toString();
    if (data.amountTtc !== undefined) updateData.amountTtc = data.amountTtc.toString();
    if (data.vatAmount !== undefined) updateData.vatAmount = data.vatAmount.toString();
    if (data.issueDate !== undefined) updateData.issueDate = data.issueDate;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.periodStart !== undefined) updateData.periodStart = data.periodStart;
    if (data.periodEnd !== undefined) updateData.periodEnd = data.periodEnd;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.documentId !== undefined) updateData.documentId = data.documentId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.paidAt !== undefined) updateData.paidAt = new Date(data.paidAt);

    const [updated] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete an invoice
   */
  async delete(tenantId: string, id: string) {
    const existing = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.id, id),
        eq(invoices.tenantId, tenantId)
      ),
    });

    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }

    await db.delete(invoices).where(eq(invoices.id, id));

    return { success: true };
  }

  /**
   * Mark an invoice as paid
   */
  async markAsPaid(tenantId: string, id: string) {
    const existing = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.id, id),
        eq(invoices.tenantId, tenantId)
      ),
    });

    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }

    const [updated] = await db
      .update(invoices)
      .set({
        status: 'paid',
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    return updated;
  }

  /**
   * Get invoice statistics for a condominium
   */
  async getStats(tenantId: string, condominiumId: string) {
    const allInvoices = await db
      .select({
        status: invoices.status,
        amountTtc: invoices.amountTtc,
        category: invoices.category,
      })
      .from(invoices)
      .where(and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.condominiumId, condominiumId)
      ));

    const stats = {
      total: allInvoices.length,
      pending: 0,
      paid: 0,
      totalPending: 0,
      totalPaid: 0,
      byCategory: {} as Record<string, { count: number; amount: number }>,
    };

    for (const inv of allInvoices) {
      const amount = Number(inv.amountTtc);

      if (inv.status === 'pending' || inv.status === 'partial') {
        stats.pending++;
        stats.totalPending += amount;
      } else if (inv.status === 'paid') {
        stats.paid++;
        stats.totalPaid += amount;
      }

      if (!stats.byCategory[inv.category]) {
        stats.byCategory[inv.category] = { count: 0, amount: 0 };
      }
      stats.byCategory[inv.category].count++;
      stats.byCategory[inv.category].amount += amount;
    }

    return stats;
  }
}
