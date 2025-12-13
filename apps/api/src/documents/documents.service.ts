import { Injectable } from '@nestjs/common';
import { db } from '../database';
import { documents, condominiums, users } from '../database/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class DocumentsService {
  async findAll(tenantId: string, condominiumId?: string) {
    // Build where condition
    const whereCondition = condominiumId 
      ? and(eq(documents.tenantId, tenantId), eq(documents.condominiumId, condominiumId))
      : eq(documents.tenantId, tenantId);

    const results = await db
      .select({
        id: documents.id,
        name: documents.name,
        type: documents.type,
        category: documents.category,
        fileSize: documents.fileSize,
        mimeType: documents.mimeType,
        visibility: documents.visibility,
        condominiumId: documents.condominiumId,
        condominiumName: condominiums.name,
        uploadedBy: users.firstName,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .leftJoin(condominiums, eq(documents.condominiumId, condominiums.id))
      .leftJoin(users, eq(documents.uploadedById, users.id))
      .where(whereCondition);

    return results.map((doc) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      category: doc.category || '',
      fileSize: doc.fileSize || 0,
      mimeType: doc.mimeType || '',
      visibility: doc.visibility,
      condominiumId: doc.condominiumId || '',
      condominiumName: doc.condominiumName || '',
      uploadedBy: doc.uploadedBy || 'Système',
      createdAt: doc.createdAt.toISOString(),
    }));
  }

  async findOne(id: string, tenantId: string) {
    const doc = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.tenantId, tenantId)))
      .limit(1);

    return doc[0] || null;
  }
}
