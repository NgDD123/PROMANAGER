import { db } from '../../../utils/firebase.js';

const COLLECTION = 'ngo_field_sites';

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

export class FieldSite {
  static sanitize(data = {}) {
    return stripUndefined({
      organizationId: data.organizationId,
      branchId: data.branchId,
      createdBy: data.createdBy,
      name: (data.name || '').trim(),
      officer: (data.officer || '').trim(),
      gps: (data.gps || '').trim(),
      beneficiaries: Number(data.beneficiaries) || 0,
      status: data.status || 'Active',
      notes: (data.notes || '').trim(),
    });
  }

  static async create(data) {
    const site = this.sanitize(data);
    const docRef = await db().collection(COLLECTION).add({
      ...site,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...site };
  }

  static async getAll(organizationId, filters = {}) {
    let query = db().collection(COLLECTION);
    const orgId = organizationId || filters.organizationId;
    if (orgId) query = query.where('organizationId', '==', orgId);
    if (filters.branchId) query = query.where('branchId', '==', filters.branchId);
    if (filters.status) query = query.where('status', '==', filters.status);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    await db().collection(COLLECTION).doc(id).update({
      ...this.sanitize(data),
      updatedAt: new Date(),
    });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection(COLLECTION).doc(id).delete();
  }
}
