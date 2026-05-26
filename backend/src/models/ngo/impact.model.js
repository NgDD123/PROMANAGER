import { db } from '../../../utils/firebase.js';

export class Impact {
  static async create(data) {
    const docRef = await db().collection('ngo_impacts').add({
      ...data,
      organizationId: data.organizationId,
      projectId: data.projectId,
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...data };
  }

  static async getAll(organizationId, projectId, filters = {}) {
    let query = db().collection('ngo_impacts');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (projectId) query = query.where('projectId', '==', projectId);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection('ngo_impacts').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    await db().collection('ngo_impacts').doc(id).update({ ...data, updatedAt: new Date() });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection('ngo_impacts').doc(id).delete();
  }
}
