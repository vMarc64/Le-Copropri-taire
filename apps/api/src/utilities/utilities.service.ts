import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../database';
import { lotMeters, utilityBills, meterReadings, lots, condominiums } from '../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import {
  CreateLotMeterDto,
  UpdateLotMeterDto,
  CreateUtilityBillDto,
  UpdateUtilityBillDto,
  CreateMeterReadingDto,
  BulkCreateMeterReadingsDto,
  UpdateMeterReadingDto,
  MeterType,
} from './dto';

@Injectable()
export class UtilitiesService {
  // ============================================================================
  // LOT METERS
  // ============================================================================

  async getMetersForLot(lotId: string, tenantId: string) {
    // Verify lot belongs to tenant
    const [lot] = await db
      .select({ id: lots.id })
      .from(lots)
      .where(and(eq(lots.id, lotId), eq(lots.tenantId, tenantId)));

    if (!lot) {
      throw new NotFoundException('Lot non trouvé');
    }

    return db
      .select()
      .from(lotMeters)
      .where(and(eq(lotMeters.lotId, lotId), eq(lotMeters.tenantId, tenantId)))
      .orderBy(lotMeters.meterType);
  }

  async getMetersForCondominium(condominiumId: string, tenantId: string, meterType?: MeterType) {
    // Verify condominium belongs to tenant
    const [condo] = await db
      .select({ id: condominiums.id })
      .from(condominiums)
      .where(and(eq(condominiums.id, condominiumId), eq(condominiums.tenantId, tenantId)));

    if (!condo) {
      throw new NotFoundException('Copropriété non trouvée');
    }

    // Get all meters for lots in this condominium
    const query = db
      .select({
        meter: lotMeters,
        lot: {
          id: lots.id,
          reference: lots.reference,
          type: lots.type,
          floor: lots.floor,
        },
      })
      .from(lotMeters)
      .innerJoin(lots, eq(lotMeters.lotId, lots.id))
      .where(
        and(
          eq(lots.condominiumId, condominiumId),
          eq(lotMeters.tenantId, tenantId),
          eq(lotMeters.isActive, true),
          meterType ? eq(lotMeters.meterType, meterType) : undefined
        )
      )
      .orderBy(lots.reference, lotMeters.meterType);

    return query;
  }

  async createMeter(data: CreateLotMeterDto, tenantId: string) {
    // Verify lot belongs to tenant
    const [lot] = await db
      .select({ id: lots.id, condominiumId: lots.condominiumId })
      .from(lots)
      .where(and(eq(lots.id, data.lotId), eq(lots.tenantId, tenantId)));

    if (!lot) {
      throw new NotFoundException('Lot non trouvé');
    }

    // Check if meter of same type already exists for this lot
    const [existing] = await db
      .select({ id: lotMeters.id })
      .from(lotMeters)
      .where(
        and(
          eq(lotMeters.lotId, data.lotId),
          eq(lotMeters.meterType, data.meterType),
          eq(lotMeters.isActive, true)
        )
      );

    if (existing) {
      throw new BadRequestException(`Un compteur de type ${data.meterType} existe déjà pour ce lot`);
    }

    const [meter] = await db
      .insert(lotMeters)
      .values({
        tenantId,
        lotId: data.lotId,
        meterType: data.meterType,
        meterNumber: data.meterNumber,
        isDualTariff: data.isDualTariff || false,
      })
      .returning();

    return meter;
  }

  async updateMeter(meterId: string, data: UpdateLotMeterDto, tenantId: string) {
    const [existing] = await db
      .select()
      .from(lotMeters)
      .where(and(eq(lotMeters.id, meterId), eq(lotMeters.tenantId, tenantId)));

    if (!existing) {
      throw new NotFoundException('Compteur non trouvé');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.meterNumber !== undefined) updateData.meterNumber = data.meterNumber;
    if (data.isDualTariff !== undefined) updateData.isDualTariff = data.isDualTariff;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updated] = await db
      .update(lotMeters)
      .set(updateData)
      .where(eq(lotMeters.id, meterId))
      .returning();

    return updated;
  }

  async deleteMeter(meterId: string, tenantId: string) {
    const [existing] = await db
      .select()
      .from(lotMeters)
      .where(and(eq(lotMeters.id, meterId), eq(lotMeters.tenantId, tenantId)));

    if (!existing) {
      throw new NotFoundException('Compteur non trouvé');
    }

    // Soft delete - just deactivate
    await db
      .update(lotMeters)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(lotMeters.id, meterId));

    return { success: true };
  }

  // ============================================================================
  // UTILITY BILLS
  // ============================================================================

  async getBillsForCondominium(condominiumId: string, tenantId: string) {
    // Verify condominium belongs to tenant
    const [condo] = await db
      .select({ id: condominiums.id })
      .from(condominiums)
      .where(and(eq(condominiums.id, condominiumId), eq(condominiums.tenantId, tenantId)));

    if (!condo) {
      throw new NotFoundException('Copropriété non trouvée');
    }

    return db
      .select()
      .from(utilityBills)
      .where(and(eq(utilityBills.condominiumId, condominiumId), eq(utilityBills.tenantId, tenantId)))
      .orderBy(desc(utilityBills.periodEnd));
  }

  async getBill(billId: string, tenantId: string) {
    const [bill] = await db
      .select()
      .from(utilityBills)
      .where(and(eq(utilityBills.id, billId), eq(utilityBills.tenantId, tenantId)));

    if (!bill) {
      throw new NotFoundException('Facture non trouvée');
    }

    // Get readings for this bill
    const readings = await db
      .select({
        reading: meterReadings,
        meter: lotMeters,
        lot: {
          id: lots.id,
          reference: lots.reference,
          type: lots.type,
        },
      })
      .from(meterReadings)
      .innerJoin(lotMeters, eq(meterReadings.lotMeterId, lotMeters.id))
      .innerJoin(lots, eq(lotMeters.lotId, lots.id))
      .where(eq(meterReadings.utilityBillId, billId))
      .orderBy(lots.reference);

    return { bill, readings };
  }

  async createBill(data: CreateUtilityBillDto, tenantId: string) {
    // Verify condominium belongs to tenant
    const [condo] = await db
      .select({ id: condominiums.id })
      .from(condominiums)
      .where(and(eq(condominiums.id, data.condominiumId), eq(condominiums.tenantId, tenantId)));

    if (!condo) {
      throw new NotFoundException('Copropriété non trouvée');
    }

    const [bill] = await db
      .insert(utilityBills)
      .values({
        tenantId,
        condominiumId: data.condominiumId,
        utilityType: data.utilityType,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        globalIndexStart: data.globalIndexStart?.toString(),
        globalIndexEnd: data.globalIndexEnd?.toString(),
        globalIndexOffPeakStart: data.globalIndexOffPeakStart?.toString(),
        globalIndexOffPeakEnd: data.globalIndexOffPeakEnd?.toString(),
        totalConsumption: data.totalConsumption?.toString(),
        totalConsumptionOffPeak: data.totalConsumptionOffPeak?.toString(),
        unit: data.unit,
        totalAmount: data.totalAmount.toString(),
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate,
        supplierName: data.supplierName,
        notes: data.notes,
        status: 'draft',
      })
      .returning();

    return bill;
  }

  async updateBill(billId: string, data: UpdateUtilityBillDto, tenantId: string) {
    const [existing] = await db
      .select()
      .from(utilityBills)
      .where(and(eq(utilityBills.id, billId), eq(utilityBills.tenantId, tenantId)));

    if (!existing) {
      throw new NotFoundException('Facture non trouvée');
    }

    if (existing.status === 'distributed') {
      throw new BadRequestException('Impossible de modifier une facture déjà distribuée');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    
    if (data.periodStart !== undefined) updateData.periodStart = data.periodStart;
    if (data.periodEnd !== undefined) updateData.periodEnd = data.periodEnd;
    if (data.globalIndexStart !== undefined) updateData.globalIndexStart = data.globalIndexStart.toString();
    if (data.globalIndexEnd !== undefined) updateData.globalIndexEnd = data.globalIndexEnd.toString();
    if (data.globalIndexOffPeakStart !== undefined) updateData.globalIndexOffPeakStart = data.globalIndexOffPeakStart.toString();
    if (data.globalIndexOffPeakEnd !== undefined) updateData.globalIndexOffPeakEnd = data.globalIndexOffPeakEnd.toString();
    if (data.totalConsumption !== undefined) updateData.totalConsumption = data.totalConsumption.toString();
    if (data.totalConsumptionOffPeak !== undefined) updateData.totalConsumptionOffPeak = data.totalConsumptionOffPeak.toString();
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount.toString();
    if (data.invoiceNumber !== undefined) updateData.invoiceNumber = data.invoiceNumber;
    if (data.invoiceDate !== undefined) updateData.invoiceDate = data.invoiceDate;
    if (data.supplierName !== undefined) updateData.supplierName = data.supplierName;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const [updated] = await db
      .update(utilityBills)
      .set(updateData)
      .where(eq(utilityBills.id, billId))
      .returning();

    return updated;
  }

  async deleteBill(billId: string, tenantId: string) {
    const [existing] = await db
      .select()
      .from(utilityBills)
      .where(and(eq(utilityBills.id, billId), eq(utilityBills.tenantId, tenantId)));

    if (!existing) {
      throw new NotFoundException('Facture non trouvée');
    }

    if (existing.status === 'distributed') {
      throw new BadRequestException('Impossible de supprimer une facture déjà distribuée');
    }

    // Delete readings first (cascade should handle this, but explicit)
    await db.delete(meterReadings).where(eq(meterReadings.utilityBillId, billId));
    
    await db.delete(utilityBills).where(eq(utilityBills.id, billId));

    return { success: true };
  }

  async validateBill(billId: string, tenantId: string) {
    const { bill, readings } = await this.getBill(billId, tenantId);

    if (bill.status !== 'draft') {
      throw new BadRequestException('Cette facture a déjà été validée');
    }

    // Check all meters have readings
    const metersForCondo = await this.getMetersForCondominium(
      bill.condominiumId,
      tenantId,
      bill.utilityType as MeterType
    );

    if (readings.length < metersForCondo.length) {
      throw new BadRequestException(
        `Tous les relevés n'ont pas été saisis. ${readings.length}/${metersForCondo.length} compteurs renseignés.`
      );
    }

    const [updated] = await db
      .update(utilityBills)
      .set({ status: 'validated', updatedAt: new Date() })
      .where(eq(utilityBills.id, billId))
      .returning();

    return updated;
  }

  async distributeBill(billId: string, tenantId: string) {
    const { bill, readings } = await this.getBill(billId, tenantId);

    if (bill.status === 'draft') {
      throw new BadRequestException('La facture doit être validée avant distribution');
    }

    if (bill.status === 'distributed') {
      throw new BadRequestException('Cette facture a déjà été distribuée');
    }

    // Calculate total consumption from readings
    let totalConsumption = 0;
    let totalConsumptionOffPeak = 0;

    for (const r of readings) {
      totalConsumption += parseFloat(r.reading.consumption?.toString() || '0');
      totalConsumptionOffPeak += parseFloat(r.reading.consumptionOffPeak?.toString() || '0');
    }

    const totalAmount = parseFloat(bill.totalAmount?.toString() || '0');
    const grandTotal = totalConsumption + totalConsumptionOffPeak;

    if (grandTotal === 0) {
      throw new BadRequestException('La consommation totale est nulle');
    }

    // Calculate allocated amount for each reading
    for (const r of readings) {
      const consumption = parseFloat(r.reading.consumption?.toString() || '0');
      const consumptionOffPeak = parseFloat(r.reading.consumptionOffPeak?.toString() || '0');
      const lotTotal = consumption + consumptionOffPeak;
      
      const allocatedAmount = (lotTotal / grandTotal) * totalAmount;

      await db
        .update(meterReadings)
        .set({ allocatedAmount: allocatedAmount.toFixed(2), updatedAt: new Date() })
        .where(eq(meterReadings.id, r.reading.id));

      // Update last reading on meter
      await db
        .update(lotMeters)
        .set({
          lastReadingDate: bill.periodEnd,
          lastReadingValue: r.reading.currentIndex,
          lastReadingValueOffPeak: r.reading.currentIndexOffPeak,
          updatedAt: new Date(),
        })
        .where(eq(lotMeters.id, r.meter.id));
    }

    const [updated] = await db
      .update(utilityBills)
      .set({ status: 'distributed', updatedAt: new Date() })
      .where(eq(utilityBills.id, billId))
      .returning();

    return updated;
  }

  // ============================================================================
  // METER READINGS
  // ============================================================================

  async getReadingsForBill(billId: string, tenantId: string) {
    const [bill] = await db
      .select()
      .from(utilityBills)
      .where(and(eq(utilityBills.id, billId), eq(utilityBills.tenantId, tenantId)));

    if (!bill) {
      throw new NotFoundException('Facture non trouvée');
    }

    return db
      .select({
        reading: meterReadings,
        meter: lotMeters,
        lot: {
          id: lots.id,
          reference: lots.reference,
          type: lots.type,
        },
      })
      .from(meterReadings)
      .innerJoin(lotMeters, eq(meterReadings.lotMeterId, lotMeters.id))
      .innerJoin(lots, eq(lotMeters.lotId, lots.id))
      .where(eq(meterReadings.utilityBillId, billId))
      .orderBy(lots.reference);
  }

  async bulkCreateReadings(data: BulkCreateMeterReadingsDto, tenantId: string) {
    const [bill] = await db
      .select()
      .from(utilityBills)
      .where(and(eq(utilityBills.id, data.utilityBillId), eq(utilityBills.tenantId, tenantId)));

    if (!bill) {
      throw new NotFoundException('Facture non trouvée');
    }

    if (bill.status === 'distributed') {
      throw new BadRequestException('Impossible de modifier les relevés d\'une facture distribuée');
    }

    const results = [];

    for (const reading of data.readings) {
      // Verify meter exists and belongs to tenant
      const [meter] = await db
        .select()
        .from(lotMeters)
        .where(and(eq(lotMeters.id, reading.lotMeterId), eq(lotMeters.tenantId, tenantId)));

      if (!meter) {
        throw new NotFoundException(`Compteur ${reading.lotMeterId} non trouvé`);
      }

      // Check if reading already exists for this bill + meter
      const [existing] = await db
        .select()
        .from(meterReadings)
        .where(
          and(
            eq(meterReadings.utilityBillId, data.utilityBillId),
            eq(meterReadings.lotMeterId, reading.lotMeterId)
          )
        );

      const consumption = reading.currentIndex - reading.previousIndex;
      const consumptionOffPeak =
        reading.currentIndexOffPeak && reading.previousIndexOffPeak
          ? reading.currentIndexOffPeak - reading.previousIndexOffPeak
          : null;

      if (existing) {
        // Update existing reading
        const [updated] = await db
          .update(meterReadings)
          .set({
            previousIndex: reading.previousIndex.toString(),
            currentIndex: reading.currentIndex.toString(),
            previousIndexOffPeak: reading.previousIndexOffPeak?.toString(),
            currentIndexOffPeak: reading.currentIndexOffPeak?.toString(),
            consumption: consumption.toString(),
            consumptionOffPeak: consumptionOffPeak?.toString(),
            updatedAt: new Date(),
          })
          .where(eq(meterReadings.id, existing.id))
          .returning();

        results.push(updated);
      } else {
        // Create new reading
        const [created] = await db
          .insert(meterReadings)
          .values({
            tenantId,
            utilityBillId: data.utilityBillId,
            lotMeterId: reading.lotMeterId,
            previousIndex: reading.previousIndex.toString(),
            currentIndex: reading.currentIndex.toString(),
            previousIndexOffPeak: reading.previousIndexOffPeak?.toString(),
            currentIndexOffPeak: reading.currentIndexOffPeak?.toString(),
            consumption: consumption.toString(),
            consumptionOffPeak: consumptionOffPeak?.toString(),
          })
          .returning();

        results.push(created);
      }
    }

    return results;
  }

  async updateReading(readingId: string, data: UpdateMeterReadingDto, tenantId: string) {
    const [existing] = await db
      .select({
        reading: meterReadings,
        bill: utilityBills,
      })
      .from(meterReadings)
      .innerJoin(utilityBills, eq(meterReadings.utilityBillId, utilityBills.id))
      .where(and(eq(meterReadings.id, readingId), eq(meterReadings.tenantId, tenantId)));

    if (!existing) {
      throw new NotFoundException('Relevé non trouvé');
    }

    if (existing.bill.status === 'distributed') {
      throw new BadRequestException('Impossible de modifier les relevés d\'une facture distribuée');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    
    const previousIndex = parseFloat(existing.reading.previousIndex?.toString() || '0');
    const previousIndexOffPeak = parseFloat(existing.reading.previousIndexOffPeak?.toString() || '0');

    if (data.currentIndex !== undefined) {
      updateData.currentIndex = data.currentIndex.toString();
      updateData.consumption = (data.currentIndex - previousIndex).toString();
    }

    if (data.currentIndexOffPeak !== undefined) {
      updateData.currentIndexOffPeak = data.currentIndexOffPeak.toString();
      updateData.consumptionOffPeak = (data.currentIndexOffPeak - previousIndexOffPeak).toString();
    }

    const [updated] = await db
      .update(meterReadings)
      .set(updateData)
      .where(eq(meterReadings.id, readingId))
      .returning();

    return updated;
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  async initializeReadingsForBill(billId: string, tenantId: string) {
    const [bill] = await db
      .select()
      .from(utilityBills)
      .where(and(eq(utilityBills.id, billId), eq(utilityBills.tenantId, tenantId)));

    if (!bill) {
      throw new NotFoundException('Facture non trouvée');
    }

    // Get all meters of this type for the condominium
    const meters = await this.getMetersForCondominium(
      bill.condominiumId,
      tenantId,
      bill.utilityType as MeterType
    );

    const readings: CreateMeterReadingDto[] = meters.map((m) => ({
      lotMeterId: m.meter.id,
      previousIndex: parseFloat(m.meter.lastReadingValue?.toString() || '0'),
      currentIndex: parseFloat(m.meter.lastReadingValue?.toString() || '0'), // Same as previous, user will update
      previousIndexOffPeak: m.meter.isDualTariff
        ? parseFloat(m.meter.lastReadingValueOffPeak?.toString() || '0')
        : undefined,
      currentIndexOffPeak: m.meter.isDualTariff
        ? parseFloat(m.meter.lastReadingValueOffPeak?.toString() || '0')
        : undefined,
    }));

    return this.bulkCreateReadings({ utilityBillId: billId, readings }, tenantId);
  }
}
