import { db } from '../../../utils/firebase.js';

export class Audit {
  static async create(data) {
    const docRef = await db().collection('ngo_audits').add({
      ...data,
      organizationId: data.organizationId,
      auditType: data.auditType,
      title: data.title,
      description: data.description,
      scope: data.scope,
      startDate: data.startDate,
      endDate: data.endDate,
      auditorId: data.auditorId,
      auditorName: data.auditorName,
      auditFirm: data.auditFirm,
      departmentId: data.departmentId,
      projectId: data.projectId,
      findings: data.findings || [],
      recommendations: data.recommendations || [],
      riskLevel: data.riskLevel,
      status: data.status || 'scheduled',
      reportUrl: data.reportUrl,
      attachments: data.attachments || [],
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...data };
  }

  static async getAll(organizationId, filters = {}) {
    let query = db().collection('ngo_audits');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (filters.auditType) query = query.where('auditType', '==', filters.auditType);
    if (filters.status) query = query.where('status', '==', filters.status);
    if (filters.riskLevel) query = query.where('riskLevel', '==', filters.riskLevel);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection('ngo_audits').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    await db().collection('ngo_audits').doc(id).update({ 
      ...data, 
      updatedAt: new Date() 
    });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection('ngo_audits').doc(id).delete();
  }

  static async addFinding(auditId, finding) {
    const audit = await this.getById(auditId);
    if (!audit) throw new Error('Audit not found');
    
    const findings = [...(audit.findings || []), {
      ...finding,
      id: Date.now().toString(),
      createdAt: new Date()
    }];

    await db().collection('ngo_audits').doc(auditId).update({
      findings,
      updatedAt: new Date()
    });
    return this.getById(auditId);
  }

  static async getAuditTrail(organizationId, entityType, entityId) {
    const snapshot = await db().collection('ngo_audits')
      .where('organizationId', '==', organizationId)
      .where(`${entityType}Id`, '==', entityId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getComplianceStatus(organizationId) {
    const audits = await this.getAll(organizationId);
    const total = audits.length;
    const completed = audits.filter(a => a.status === 'completed').length;
    const highRisk = audits.filter(a => a.riskLevel === 'high').length;
    
    return {
      totalAudits: total,
      completedAudits: completed,
      pendingAudits: total - completed,
      highRiskFindings: highRisk,
      complianceRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
    };
  }
}
