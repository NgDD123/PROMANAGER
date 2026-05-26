import { db } from '../../../utils/firebase.js';

const COLLECTION = 'ngo_service_controls';

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

export class ServiceControl {
  static sanitize(data = {}) {
    return stripUndefined({
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      service: (data.service || '').trim(),
      status: data.status || 'Needs Setup',
      owner: (data.owner || '').trim(),
      permission: (data.permission || '').trim(),
      notes: (data.notes || '').trim(),
    });
  }

  static async create(data) {
    const record = this.sanitize(data);
    const docRef = await db().collection(COLLECTION).add({
      ...record,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...record };
  }

  static async getAll(organizationId, filters = {}) {
    let query = db().collection(COLLECTION);
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    if (filters.status) query = query.where('status', '==', filters.status);
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
