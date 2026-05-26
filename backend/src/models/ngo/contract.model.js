import { db } from '../../../utils/firebase.js';
import { aggregateMeMetrics, deriveMeMetrics, formatUtilizationPercent } from '../../utils/meMetrics.js';

const COLLECTION = 'ngo_contracts';

function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

function asNumber(value) {
  return Number(value) || 0;
}

export class Contract {
  static sanitize(data = {}) {
    const base = stripUndefined({
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      projectId: data.projectId,
      tenderId: data.tenderId || '',
      projectCode: (data.projectCode || data.projectId || '').trim(),
      projectName: (data.projectName || data.contractTitle || data.name || '').trim(),
      program: (data.program || data.programArea || '').trim(),
      projectManager: (data.projectManager || data.manager || '').trim(),
      startDate: data.startDate || data.projectStartDate || '',
      endDate: data.endDate || data.projectEndDate || '',
      status: data.status || data.projectStatus || 'Planning',
      budget: asNumber(data.budget || data.contractValue),
      donor: (data.donor || data.funder || '').trim(),
      targetArea: (data.targetArea || '').trim(),
      branchRegion: (data.branchRegion || data.region || '').trim(),
      goal: (data.goal || data.projectGoal || '').trim(),
      objectives: Array.isArray(data.objectives) ? data.objectives : [],
      expectedOutcomes: Array.isArray(data.expectedOutcomes) ? data.expectedOutcomes : [],
      expectedOutputs: Array.isArray(data.expectedOutputs) ? data.expectedOutputs : [],
      successCriteria: Array.isArray(data.successCriteria) ? data.successCriteria : [],
      assumptions: Array.isArray(data.assumptions) ? data.assumptions : [],
      risks: Array.isArray(data.risks) ? data.risks : [],
      indicators: Array.isArray(data.indicators) ? data.indicators : [],
      activities: Array.isArray(data.activities) ? data.activities : [],
      beneficiaries: Array.isArray(data.beneficiaries) ? data.beneficiaries : [],
      dataCollection: Array.isArray(data.dataCollection) ? data.dataCollection : [],
      fieldVisits: Array.isArray(data.fieldVisits) ? data.fieldVisits : [],
      riskIssues: Array.isArray(data.riskIssues) ? data.riskIssues : [],
      reports: Array.isArray(data.reports) ? data.reports : [],
      gisLocations: Array.isArray(data.gisLocations) ? data.gisLocations : [],
      expense: asNumber(data.expense),
      performance: asNumber(data.performance),
      completion: asNumber(data.completion),
      beneficiaryTotal: asNumber(data.beneficiaryTotal),
      notes: (data.notes || '').trim()
    });
    const metrics = deriveMeMetrics(base);
    return stripUndefined({
      ...base,
      expense: metrics.expense,
      performance: metrics.performance,
      completion: metrics.completion,
      beneficiaryTotal: metrics.beneficiariesReached
    });
  }

  static async create(data) {
    const contract = this.sanitize(data);
    const docRef = await db().collection(COLLECTION).add({
      ...contract,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...contract };
  }

  static async getAll(organizationId, projectId, filters = {}) {
    let query = db().collection(COLLECTION);
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (projectId) query = query.where('projectId', '==', projectId);
    if (filters.status) query = query.where('status', '==', filters.status);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    await db().collection(COLLECTION).doc(id).update({
      ...this.sanitize({ ...existing, ...data }),
      updatedAt: new Date()
    });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection(COLLECTION).doc(id).delete();
  }

  static async getAnalytics(organizationId, projectId) {
    const records = await this.getAll(organizationId, projectId);
    const aggregated = aggregateMeMetrics(records);
    return {
      ...aggregated,
      budgetUtilization: formatUtilizationPercent(aggregated.budgetUtilization),
      activityCompletion: formatUtilizationPercent(aggregated.activityCompletion),
      performance: formatUtilizationPercent(aggregated.performance),
      projectCompletion: formatUtilizationPercent(aggregated.projectCompletion),
      records
    };
  }
}
