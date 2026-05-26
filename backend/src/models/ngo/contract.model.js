import { db } from '../../../utils/firebase.js';

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
    return stripUndefined({
      organizationId: data.organizationId,
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
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    await db().collection(COLLECTION).doc(id).update({
      ...this.sanitize(data),
      updatedAt: new Date()
    });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection(COLLECTION).doc(id).delete();
  }

  static async getAnalytics(organizationId, projectId) {
    const records = await this.getAll(organizationId, projectId);
    const totals = records.reduce((acc, record) => {
      const activities = Array.isArray(record.activities) ? record.activities : [];
      const completedActivities = activities.filter((activity) =>
        String(activity.status || '').toLowerCase() === 'completed'
      ).length;
      const beneficiaries = Array.isArray(record.beneficiaries) ? record.beneficiaries : [];
      const reached = beneficiaries.reduce((sum, item) => sum + asNumber(item.numberReached), 0);

      acc.projects += 1;
      acc.budget += asNumber(record.budget);
      acc.expense += asNumber(record.expense) || activities.reduce((sum, item) => sum + asNumber(item.budgetUsed), 0);
      acc.activities += activities.length;
      acc.activitiesCompleted += completedActivities;
      acc.beneficiariesReached += reached || asNumber(record.beneficiaryTotal);
      acc.performance += asNumber(record.performance);
      acc.completion += asNumber(record.completion);
      return acc;
    }, {
      projects: 0,
      budget: 0,
      expense: 0,
      activities: 0,
      activitiesCompleted: 0,
      beneficiariesReached: 0,
      performance: 0,
      completion: 0
    });

    const denominator = totals.projects || 1;
    return {
      ...totals,
      budgetUtilization: totals.budget ? Math.round((totals.expense / totals.budget) * 100) : 0,
      activityCompletion: totals.activities ? Math.round((totals.activitiesCompleted / totals.activities) * 100) : 0,
      performance: Math.round(totals.performance / denominator),
      projectCompletion: Math.round(totals.completion / denominator),
      records
    };
  }
}
