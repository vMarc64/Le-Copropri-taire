import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../database';
import { fundCalls, fundCallItems, ownerCondominiums, condominiums, users, lots } from '../database/schema';
import { eq, and, desc, sum, sql } from 'drizzle-orm';
import { CreateFundCallDto, GenerateFundCallDto, UpdateFundCallItemDto } from './dto/create-fund-call.dto';
import { UpdateFundCallDto } from './dto/update-fund-call.dto';

@Injectable()
export class FundCallsService {
  /**
   * Create a new fund call manually
   */
  async create(tenantId: string, data: CreateFundCallDto) {
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

    const [fundCall] = await db.insert(fundCalls).values({
      tenantId,
      condominiumId: data.condominiumId,
      reference: data.reference,
      title: data.title,
      type: data.type,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      dueDate: data.dueDate,
      totalAmount: data.totalAmount.toString(),
      documentId: data.documentId,
      status: 'draft',
    }).returning();

    return fundCall;
  }

  /**
   * Generate a fund call with items for all owners based on tantièmes
   */
  async generate(tenantId: string, data: GenerateFundCallDto) {
    // Verify condominium
    const condo = await db.query.condominiums.findFirst({
      where: and(
        eq(condominiums.id, data.condominiumId),
        eq(condominiums.tenantId, tenantId)
      ),
    });

    if (!condo) {
      throw new NotFoundException('Condominium not found');
    }

    // Get all owner-condominium associations with their tantièmes
    const ownersData = await db
      .select({
        ownerCondominiumId: ownerCondominiums.id,
        ownerId: ownerCondominiums.ownerId,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(ownerCondominiums)
      .innerJoin(users, eq(users.id, ownerCondominiums.ownerId))
      .where(and(
        eq(ownerCondominiums.condominiumId, data.condominiumId),
        eq(ownerCondominiums.tenantId, tenantId)
      ));

    if (ownersData.length === 0) {
      throw new BadRequestException('No owners found for this condominium');
    }

    // Calculate tantièmes for each owner from their lots
    const ownerTantiemes: { ownerCondominiumId: string; tantiemes: number }[] = [];
    let totalTantiemes = 0;

    for (const owner of ownersData) {
      const ownerLots = await db
        .select({ tantiemes: lots.tantiemes })
        .from(lots)
        .where(and(
          eq(lots.condominiumId, data.condominiumId),
          eq(lots.ownerId, owner.ownerId),
          eq(lots.tenantId, tenantId)
        ));

      const ownerTotal = ownerLots.reduce((sum, lot) => sum + Number(lot.tantiemes || 0), 0);
      ownerTantiemes.push({ ownerCondominiumId: owner.ownerCondominiumId, tantiemes: ownerTotal });
      totalTantiemes += ownerTotal;
    }

    if (totalTantiemes === 0) {
      throw new BadRequestException('No tantièmes defined for lots in this condominium');
    }

    const totalAmount = data.totalAmount || 10000; // Default amount if not provided

    // Generate reference
    const year = new Date(data.periodStart).getFullYear();
    const quarter = Math.ceil((new Date(data.periodStart).getMonth() + 1) / 3);
    const reference = data.type === 'regular' 
      ? `AF-${year}-Q${quarter}` 
      : `AF-${year}-EXC-${Date.now().toString().slice(-4)}`;

    // Create fund call
    const [fundCall] = await db.insert(fundCalls).values({
      tenantId,
      condominiumId: data.condominiumId,
      reference,
      title: data.type === 'regular' 
        ? `Appel de fonds ${quarter}e trimestre ${year}`
        : `Appel de fonds exceptionnel`,
      type: data.type,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      dueDate: data.dueDate,
      totalAmount: totalAmount.toString(),
      status: 'draft',
    }).returning();

    // Create items for each owner
    const items = [];
    for (const owner of ownerTantiemes) {
      const proportion = owner.tantiemes / totalTantiemes;
      const amount = Math.round(totalAmount * proportion * 100) / 100;

      const [item] = await db.insert(fundCallItems).values({
        tenantId,
        fundCallId: fundCall.id,
        ownerCondominiumId: owner.ownerCondominiumId,
        tantiemes: owner.tantiemes.toString(),
        amount: amount.toString(),
        paidAmount: '0',
        status: 'pending',
      }).returning();

      items.push(item);
    }

    return {
      fundCall,
      items,
      summary: {
        totalOwners: items.length,
        totalTantiemes,
        totalAmount,
      },
    };
  }

  /**
   * Find all fund calls for a condominium
   */
  async findAll(tenantId: string, condominiumId: string, filters?: { status?: string; type?: string }) {
    const conditions = [
      eq(fundCalls.tenantId, tenantId),
      eq(fundCalls.condominiumId, condominiumId),
    ];

    if (filters?.status) {
      conditions.push(eq(fundCalls.status, filters.status));
    }

    if (filters?.type) {
      conditions.push(eq(fundCalls.type, filters.type));
    }

    const results = await db
      .select({
        id: fundCalls.id,
        reference: fundCalls.reference,
        title: fundCalls.title,
        type: fundCalls.type,
        periodStart: fundCalls.periodStart,
        periodEnd: fundCalls.periodEnd,
        dueDate: fundCalls.dueDate,
        totalAmount: fundCalls.totalAmount,
        status: fundCalls.status,
        sentAt: fundCalls.sentAt,
        createdAt: fundCalls.createdAt,
      })
      .from(fundCalls)
      .where(and(...conditions))
      .orderBy(desc(fundCalls.createdAt));

    // Get paid amounts for each fund call
    const fundCallsWithProgress = await Promise.all(
      results.map(async (fc) => {
        const itemsAgg = await db
          .select({
            totalPaid: sum(fundCallItems.paidAmount),
            itemCount: sql<number>`count(*)`,
            paidCount: sql<number>`count(*) filter (where ${fundCallItems.status} = 'paid')`,
          })
          .from(fundCallItems)
          .where(eq(fundCallItems.fundCallId, fc.id));

        const agg = itemsAgg[0];
        const totalAmount = Number(fc.totalAmount);
        const totalPaid = Number(agg?.totalPaid || 0);

        return {
          ...fc,
          totalAmount,
          totalPaid,
          progress: totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0,
          itemCount: Number(agg?.itemCount || 0),
          paidCount: Number(agg?.paidCount || 0),
        };
      })
    );

    return fundCallsWithProgress;
  }

  /**
   * Find one fund call with its items
   */
  async findOne(tenantId: string, id: string) {
    const fundCall = await db.query.fundCalls.findFirst({
      where: and(
        eq(fundCalls.id, id),
        eq(fundCalls.tenantId, tenantId)
      ),
    });

    if (!fundCall) {
      throw new NotFoundException('Fund call not found');
    }

    // Get items with owner details
    const items = await db
      .select({
        id: fundCallItems.id,
        ownerCondominiumId: fundCallItems.ownerCondominiumId,
        tantiemes: fundCallItems.tantiemes,
        amount: fundCallItems.amount,
        paidAmount: fundCallItems.paidAmount,
        status: fundCallItems.status,
        notificationSentAt: fundCallItems.notificationSentAt,
        reminderCount: fundCallItems.reminderCount,
        ownerId: ownerCondominiums.ownerId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(fundCallItems)
      .innerJoin(ownerCondominiums, eq(ownerCondominiums.id, fundCallItems.ownerCondominiumId))
      .innerJoin(users, eq(users.id, ownerCondominiums.ownerId))
      .where(eq(fundCallItems.fundCallId, id))
      .orderBy(users.lastName);

    const formattedItems = items.map(item => ({
      id: item.id,
      ownerCondominiumId: item.ownerCondominiumId,
      owner: {
        id: item.ownerId,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
      },
      tantiemes: Number(item.tantiemes),
      amount: Number(item.amount),
      paidAmount: Number(item.paidAmount),
      balance: Number(item.amount) - Number(item.paidAmount),
      status: item.status,
      notificationSentAt: item.notificationSentAt,
      reminderCount: item.reminderCount,
    }));

    const totalPaid = formattedItems.reduce((sum, item) => sum + item.paidAmount, 0);
    const totalAmount = Number(fundCall.totalAmount);

    return {
      ...fundCall,
      totalAmount,
      totalPaid,
      balance: totalAmount - totalPaid,
      progress: totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0,
      items: formattedItems,
    };
  }

  /**
   * Update a fund call
   */
  async update(tenantId: string, id: string, data: UpdateFundCallDto) {
    const existing = await db.query.fundCalls.findFirst({
      where: and(
        eq(fundCalls.id, id),
        eq(fundCalls.tenantId, tenantId)
      ),
    });

    if (!existing) {
      throw new NotFoundException('Fund call not found');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.reference !== undefined) updateData.reference = data.reference;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.periodStart !== undefined) updateData.periodStart = data.periodStart;
    if (data.periodEnd !== undefined) updateData.periodEnd = data.periodEnd;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.documentId !== undefined) updateData.documentId = data.documentId;

    const [updated] = await db
      .update(fundCalls)
      .set(updateData)
      .where(eq(fundCalls.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete a fund call
   */
  async delete(tenantId: string, id: string) {
    const existing = await db.query.fundCalls.findFirst({
      where: and(
        eq(fundCalls.id, id),
        eq(fundCalls.tenantId, tenantId)
      ),
    });

    if (!existing) {
      throw new NotFoundException('Fund call not found');
    }

    // Delete items first (cascade should handle this, but being explicit)
    await db.delete(fundCallItems).where(eq(fundCallItems.fundCallId, id));
    await db.delete(fundCalls).where(eq(fundCalls.id, id));

    return { success: true };
  }

  /**
   * Send a fund call to all owners
   */
  async send(tenantId: string, id: string) {
    const fundCall = await db.query.fundCalls.findFirst({
      where: and(
        eq(fundCalls.id, id),
        eq(fundCalls.tenantId, tenantId)
      ),
    });

    if (!fundCall) {
      throw new NotFoundException('Fund call not found');
    }

    if (fundCall.status !== 'draft') {
      throw new BadRequestException('Fund call has already been sent');
    }

    // Update fund call status
    const [updated] = await db
      .update(fundCalls)
      .set({
        status: 'sent',
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(fundCalls.id, id))
      .returning();

    // Update all items notification timestamp
    await db
      .update(fundCallItems)
      .set({
        notificationSentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(fundCallItems.fundCallId, id));

    // TODO: Actually send emails via queue

    return updated;
  }

  /**
   * Send reminders to unpaid owners
   */
  async remind(tenantId: string, id: string) {
    const fundCall = await db.query.fundCalls.findFirst({
      where: and(
        eq(fundCalls.id, id),
        eq(fundCalls.tenantId, tenantId)
      ),
    });

    if (!fundCall) {
      throw new NotFoundException('Fund call not found');
    }

    // Get unpaid items
    const unpaidItems = await db
      .select()
      .from(fundCallItems)
      .where(and(
        eq(fundCallItems.fundCallId, id),
        sql`${fundCallItems.status} IN ('pending', 'partial', 'overdue')`
      ));

    // Update reminder count and timestamp
    for (const item of unpaidItems) {
      await db
        .update(fundCallItems)
        .set({
          reminderCount: (item.reminderCount || 0) + 1,
          lastReminderAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(fundCallItems.id, item.id));
    }

    // TODO: Actually send reminder emails via queue

    return {
      reminded: unpaidItems.length,
    };
  }

  /**
   * Get a specific fund call item
   */
  async getItem(tenantId: string, itemId: string) {
    const item = await db
      .select({
        id: fundCallItems.id,
        fundCallId: fundCallItems.fundCallId,
        ownerCondominiumId: fundCallItems.ownerCondominiumId,
        tantiemes: fundCallItems.tantiemes,
        amount: fundCallItems.amount,
        paidAmount: fundCallItems.paidAmount,
        status: fundCallItems.status,
        ownerId: ownerCondominiums.ownerId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(fundCallItems)
      .innerJoin(ownerCondominiums, eq(ownerCondominiums.id, fundCallItems.ownerCondominiumId))
      .innerJoin(users, eq(users.id, ownerCondominiums.ownerId))
      .where(and(
        eq(fundCallItems.id, itemId),
        eq(fundCallItems.tenantId, tenantId)
      ))
      .limit(1);

    if (item.length === 0) {
      throw new NotFoundException('Fund call item not found');
    }

    return {
      ...item[0],
      tantiemes: Number(item[0].tantiemes),
      amount: Number(item[0].amount),
      paidAmount: Number(item[0].paidAmount),
      balance: Number(item[0].amount) - Number(item[0].paidAmount),
    };
  }

  /**
   * Update a fund call item (for adjustments)
   */
  async updateItem(tenantId: string, itemId: string, data: UpdateFundCallItemDto) {
    const existing = await db.query.fundCallItems.findFirst({
      where: and(
        eq(fundCallItems.id, itemId),
        eq(fundCallItems.tenantId, tenantId)
      ),
    });

    if (!existing) {
      throw new NotFoundException('Fund call item not found');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.amount !== undefined) updateData.amount = data.amount.toString();
    if (data.paidAmount !== undefined) {
      updateData.paidAmount = data.paidAmount.toString();
      
      // Auto-update status based on payment
      const amount = data.amount !== undefined ? data.amount : Number(existing.amount);
      if (data.paidAmount >= amount) {
        updateData.status = 'paid';
      } else if (data.paidAmount > 0) {
        updateData.status = 'partial';
      }
    }

    const [updated] = await db
      .update(fundCallItems)
      .set(updateData)
      .where(eq(fundCallItems.id, itemId))
      .returning();

    // Update fund call status based on all items
    await this.updateFundCallStatusFromItems(existing.fundCallId);

    return updated;
  }

  /**
   * Helper: Update fund call status based on items
   */
  private async updateFundCallStatusFromItems(fundCallId: string) {
    const items = await db
      .select({
        status: fundCallItems.status,
      })
      .from(fundCallItems)
      .where(eq(fundCallItems.fundCallId, fundCallId));

    const allPaid = items.every(i => i.status === 'paid');
    const anyPaid = items.some(i => i.status === 'paid' || i.status === 'partial');

    let newStatus: string;
    if (allPaid) {
      newStatus = 'completed';
    } else if (anyPaid) {
      newStatus = 'partial';
    } else {
      return; // Keep current status
    }

    await db
      .update(fundCalls)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(fundCalls.id, fundCallId));
  }

  /**
   * Get items for a fund call
   */
  async getItems(tenantId: string, fundCallId: string) {
    const items = await db
      .select({
        id: fundCallItems.id,
        ownerCondominiumId: fundCallItems.ownerCondominiumId,
        tantiemes: fundCallItems.tantiemes,
        amount: fundCallItems.amount,
        paidAmount: fundCallItems.paidAmount,
        status: fundCallItems.status,
        notificationSentAt: fundCallItems.notificationSentAt,
        reminderCount: fundCallItems.reminderCount,
        ownerId: ownerCondominiums.ownerId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(fundCallItems)
      .innerJoin(ownerCondominiums, eq(ownerCondominiums.id, fundCallItems.ownerCondominiumId))
      .innerJoin(users, eq(users.id, ownerCondominiums.ownerId))
      .where(and(
        eq(fundCallItems.fundCallId, fundCallId),
        eq(fundCallItems.tenantId, tenantId)
      ))
      .orderBy(users.lastName);

    return items.map(item => ({
      id: item.id,
      ownerCondominiumId: item.ownerCondominiumId,
      owner: {
        id: item.ownerId,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
      },
      tantiemes: Number(item.tantiemes),
      amount: Number(item.amount),
      paidAmount: Number(item.paidAmount),
      balance: Number(item.amount) - Number(item.paidAmount),
      status: item.status,
      notificationSentAt: item.notificationSentAt,
      reminderCount: item.reminderCount,
    }));
  }
}
