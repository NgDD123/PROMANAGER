import { db } from '../../../utils/firebase.js';

const COLLECTION = 'ngo_field_visits';

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

export class FieldVisit {
  static sanitize(data = {}) {
    return stripUndefined({
      organizationId: data.organizationId,
      siteId: data.siteId,
      createdBy: data.createdBy,
      officer: (data.officer || '').trim(),
      visitDate: data.visitDate || '',
      purpose: (data.purpose || '').trim(),
      findings: (data.findings || '').trim(),
      status: data.status || 'Completed',
      gps: (data.gps || '').trim(),
    });
  }

  static async create(data) {
    const visit = this.sanitize(data);
    const docRef = await db().collection(COLLECTION).add({
      ...visit,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...visit };
  }

  static async getAll(organizationId, filters = {}) {
    let query = db().collection(COLLECTION);
    const orgId = organizationId || filters.organizationId;
    if (orgId) query = query.where('organizationId', '==', orgId);
    if (filters.siteId) query = query.where('siteId', '==', filters.siteId);
    if (filters.officer) query = query.where('officer', '==', filters.officer);
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
