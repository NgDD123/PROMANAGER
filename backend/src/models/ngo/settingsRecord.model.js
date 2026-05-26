import { db } from '../../../utils/firebase.js';

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

function collectionFor(type) {
  if (type === 'permission') return 'ngo_permissions';
  if (type === 'document') return 'ngo_documents';
  throw new Error('Invalid settings record type');
}

export class SettingsRecord {
  static sanitize(data = {}) {
    return stripUndefined({
      ...data,
      organizationId: data.organizationId,
      createdBy: data.createdBy,
    });
  }

  static async create(type, data) {
    const collection = collectionFor(type);
    const record = this.sanitize(data);
    const docRef = await db().collection(collection).add({
      ...record,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...record };
  }

  static async getAll(type, organizationId, filters = {}) {
    const collection = collectionFor(type);
    let query = db().collection(collection);
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(type, id) {
    const doc = await db().collection(collectionFor(type)).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(type, id, data) {
    await db().collection(collectionFor(type)).doc(id).update({
      ...this.sanitize(data),
      updatedAt: new Date(),
    });
    return this.getById(type, id);
  }

  static async delete(type, id) {
    await db().collection(collectionFor(type)).doc(id).delete();
  }
}
