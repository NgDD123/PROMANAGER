import { db } from '../../../utils/firebase.js';

export class Finance {
  static async create(data) {
    const docRef = await db().collection('ngo_finances').add({
      ...data,
      organizationId: data.organizationId,
      type: data.type,
      category: data.category,
      amount: data.amount,
      currency: data.currency || 'USD',
      date: data.date,
      description: data.description,
      projectId: data.projectId,
      departmentId: data.departmentId,
      donorId: data.donorId,
      grantId: data.grantId,
      accountCode: data.accountCode,
      reference: data.reference,
      paymentMethod: data.paymentMethod,
      status: data.status || 'pending',
      attachments: data.attachments || [],
      createdBy: data.createdBy,
      approvedBy: data.approvedBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...data };
  }

  static async getAll(organizationId, filters = {}) {
    let query = db().collection('ngo_finances');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (filters.type) query = query.where('type', '==', filters.type);
    if (filters.projectId) query = query.where('projectId', '==', filters.projectId);
    if (filters.status) query = query.where('status', '==', filters.status);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    if (filters.startDate && filters.endDate) {
      query = query.where('date', '>=', filters.startDate)
                   .where('date', '<=', filters.endDate);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection('ngo_finances').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    await db().collection('ngo_finances').doc(id).update({ 
      ...data, 
      updatedAt: new Date() 
    });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection('ngo_finances').doc(id).delete();
  }

  static async getFinancialSummary(organizationId, startDate, endDate) {
    const transactions = await this.getAll(organizationId, { startDate, endDate });
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
      transactionCount: transactions.length,
      period: { startDate, endDate }
    };
  }

  static async getByProject(projectId) {
    const snapshot = await db().collection('ngo_finances')
      .where('projectId', '==', projectId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
