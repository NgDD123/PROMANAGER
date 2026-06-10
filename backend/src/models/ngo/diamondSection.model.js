import { randomUUID } from 'crypto';
import { db } from '../../../utils/firebase.js';

const COLLECTION = 'ngo_diamond_sections';

function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

export class DiamondSection {
  static sanitize(data = {}, index = 0) {
    const title = String(data.title || data.name || '').trim();
    return stripUndefined({
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      id: data.id || randomUUID(),
      title,
      order: Number.isFinite(Number(data.order)) ? Number(data.order) : index,
    });
  }

  static validate(section) {
    if (!section.title) throw new Error('Section title is required');
    return section;
  }

  static async create(data) {
    const section = this.validate(this.sanitize(data));
    const { id, ...rest } = section;
    await db().collection(COLLECTION).doc(id).set({
      ...rest,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return section;
  }

  static async getAll(organizationId, filters = {}) {
    let query = db().collection(COLLECTION);
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    const snapshot = await query.get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  static async getById(id) {
    const doc = await db().collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;
    const section = this.validate(this.sanitize({ ...existing, ...data, id }));
    const { id: _id, ...rest } = section;
    await db().collection(COLLECTION).doc(id).update({
      ...rest,
      updatedAt: new Date(),
    });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection(COLLECTION).doc(id).delete();
  }
}
