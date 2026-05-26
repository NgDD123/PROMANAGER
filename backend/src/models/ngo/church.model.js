import { db } from '../../../utils/firebase.js';

const COLLECTION = 'ngo_church_records';

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

export class Church {
  static sanitize(data = {}) {
    const core = stripUndefined({
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      domain: data.domain,
      recordType: data.recordType,
      branchId: data.branchId,
      status: data.status,
      notes: (data.notes || '').trim() || undefined,
    });

    const payload = stripUndefined({
      ...data,
      ...core,
      title: (data.title || '').trim() || undefined,
      name: (data.name || '').trim() || undefined,
      firstName: (data.firstName || '').trim() || undefined,
      lastName: (data.lastName || '').trim() || undefined,
      memberId: (data.memberId || '').trim() || undefined,
      email: (data.email || '').trim() || undefined,
      phone: (data.phone || '').trim() || undefined,
      familyId: data.familyId,
      familyName: (data.familyName || '').trim() || undefined,
      membershipStatus: data.membershipStatus,
      amount: data.amount != null ? Number(data.amount) : undefined,
      currency: data.currency || 'USD',
      date: data.date,
      eventType: data.eventType,
      assetType: data.assetType,
      location: (data.location || '').trim() || undefined,
      documents: Array.isArray(data.documents) ? data.documents : undefined,
      photoUrl: data.photoUrl,
      photoPublicId: data.photoPublicId,
      linkedMemberId: data.linkedMemberId,
      leaderMemberId: data.leaderMemberId,
      ministryId: data.ministryId,
      ministry: (data.ministry || '').trim() || undefined,
      leader: (data.leader || '').trim() || undefined,
      occupation: (data.occupation || '').trim() || undefined,
      emergencyContact: (data.emergencyContact || '').trim() || undefined,
      metadata: data.metadata && typeof data.metadata === 'object' ? data.metadata : undefined,
    });

    return payload;
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
    if (filters.domain) query = query.where('domain', '==', filters.domain);
    if (filters.recordType) query = query.where('recordType', '==', filters.recordType);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    if (filters.branchId) query = query.where('branchId', '==', filters.branchId);
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

  static async countMembers(organizationId) {
    const members = await this.getAll(organizationId, {
      domain: 'members',
      recordType: 'member',
    });
    return members.length;
  }
}
