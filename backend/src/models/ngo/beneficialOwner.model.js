import { db } from '../../../utils/firebase.js';

export class BeneficialOwner {
  static async create(data) {
    const docRef = await db().collection('ngo_beneficial_owners').add({
      ...data,
      organizationId: data.organizationId,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      dateOfBirth: data.dateOfBirth,
      nationality: data.nationality,
      idType: data.idType,
      idNumber: data.idNumber,
      ownershipPercentage: data.ownershipPercentage || 0,
      ownershipType: data.ownershipType,
      position: data.position,
      address: data.address,
      country: data.country,
      phone: data.phone,
      email: data.email,
      isPoliticallyExposed: data.isPoliticallyExposed || false,
      verificationStatus: data.verificationStatus || 'pending',
      verificationDate: data.verificationDate,
      documents: data.documents || [],
      notes: data.notes,
      status: data.status || 'active',
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...data };
  }

  static async getAll(organizationId, filters = {}) {
    let query = db().collection('ngo_beneficial_owners');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (filters.status) query = query.where('status', '==', filters.status);
    if (filters.verificationStatus) query = query.where('verificationStatus', '==', filters.verificationStatus);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection('ngo_beneficial_owners').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    await db().collection('ngo_beneficial_owners').doc(id).update({ 
      ...data, 
      updatedAt: new Date() 
    });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection('ngo_beneficial_owners').doc(id).delete();
  }

  static async verify(id, verifiedBy) {
    await db().collection('ngo_beneficial_owners').doc(id).update({
      verificationStatus: 'verified',
      verificationDate: new Date(),
      verifiedBy,
      updatedAt: new Date()
    });
    return this.getById(id);
  }

  static async getOwnershipStructure(organizationId) {
    const owners = await this.getAll(organizationId);
    const totalOwnership = owners.reduce((sum, owner) => sum + (owner.ownershipPercentage || 0), 0);
    
    return {
      owners: owners.map(owner => ({
        id: owner.id,
        name: owner.fullName,
        percentage: owner.ownershipPercentage,
        type: owner.ownershipType,
        position: owner.position
      })),
      totalOwnership,
      ownerCount: owners.length
    };
  }

  static async getPoliticallyExposed(organizationId) {
    const snapshot = await db().collection('ngo_beneficial_owners')
      .where('organizationId', '==', organizationId)
      .where('isPoliticallyExposed', '==', true)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
