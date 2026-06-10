import { randomUUID } from 'crypto';
import { db } from '../../../utils/firebase.js';

const COLLECTION = 'ngo_diamond_options';

function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

export class DiamondOption {
  static sanitize(data = {}, index = 0) {
    const label = String(data.label || '').trim();
    const value = String(data.value ?? label).trim();
    return stripUndefined({
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      id: data.id || randomUUID(),
      label,
      value: value || label,
      order: Number.isFinite(Number(data.order)) ? Number(data.order) : index,
    });
  }

  static validate(option) {
    if (!option.label) throw new Error('Option label is required');
    return option;
  }

  static async create(data) {
    const option = this.validate(this.sanitize(data));
    const { id, ...rest } = option;
    await db().collection(COLLECTION).doc(id).set({
      ...rest,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return option;
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
    const option = this.validate(this.sanitize({ ...existing, ...data, id }));
    const { id: _id, ...rest } = option;
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
