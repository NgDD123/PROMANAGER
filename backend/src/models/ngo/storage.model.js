import { db } from '../../../utils/firebase.js';

const COLLECTION = 'ngo_storages';

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

export class Storage {
  static sanitize(data = {}) {
    return stripUndefined({
      organizationId: data.organizationId,
      projectId: data.projectId,
      contractId: data.contractId,
      createdBy: data.createdBy,
      name: (data.name || '').trim(),
      location: (data.location || '').trim(),
      custodian: (data.custodian || '').trim(),
      retention: (data.retention || '').trim(),
      accessLevel: data.accessLevel || 'Standard',
      status: data.status || 'Active',
      notes: (data.notes || '').trim(),
    });
  }

  static async create(data) {
    const storage = this.sanitize(data);
    const docRef = await db().collection(COLLECTION).add({
      ...storage,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...storage };
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
