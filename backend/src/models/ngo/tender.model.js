import { db } from '../../../utils/firebase.js';

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

export class Tender {
  static sanitize(data = {}) {
    return stripUndefined({
      organizationId: data.organizationId,
      projectId: data.projectId,
      createdBy: data.createdBy,
      title: data.title,
      description: data.description,
      referenceNo: data.referenceNo,
      submissionDeadline: data.submissionDeadline,
      openingDate: data.openingDate,
      estimatedBudget: data.estimatedBudget,
      currency: data.currency,
      status: data.status || 'draft',
      bidders: data.bidders || [],
      awardedTo: data.awardedTo,
      awardedAmount: data.awardedAmount,
      notes: data.notes,
    });
  }

  static async create(data) {
    const tender = this.sanitize(data);
    const docRef = await db().collection('ngo_tenders').add({
      ...tender,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...tender };
  }

  static async getAll(organizationId, projectId, filters = {}) {
    let query = db().collection('ngo_tenders');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (projectId) query = query.where('projectId', '==', projectId);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection('ngo_tenders').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    const updates = this.sanitize(data);
    await db().collection('ngo_tenders').doc(id).update({ ...updates, updatedAt: new Date() });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection('ngo_tenders').doc(id).delete();
  }
}
