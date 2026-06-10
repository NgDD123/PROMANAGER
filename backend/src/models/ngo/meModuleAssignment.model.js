import { db } from '../../../utils/firebase.js';

const COLLECTION = 'ngo_me_module_assignments';
const MODULE_IDS = ['outcomes', 'indicators', 'activities', 'beneficiaries', 'risks'];

function emptyAssignments() {
  return Object.fromEntries(
    MODULE_IDS.map((moduleId) => [moduleId, { formId: '', evaluatorId: '' }])
  );
}

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

function sanitizeModuleEntry(entry = {}) {
  return {
    formId: String(entry.formId || '').trim(),
    evaluatorId: String(entry.evaluatorId || '').trim(),
  };
}

export class MeModuleAssignment {
  static sanitize(data = {}) {
    const incoming = data.assignments && typeof data.assignments === 'object'
      ? data.assignments
      : {};
    const assignments = emptyAssignments();
    MODULE_IDS.forEach((moduleId) => {
      assignments[moduleId] = sanitizeModuleEntry(incoming[moduleId]);
    });

    return stripUndefined({
      organizationId: data.organizationId,
      assignments,
      updatedBy: data.updatedBy,
    });
  }

  static async getByOrganizationId(organizationId) {
    if (!organizationId) return null;
    const doc = await db().collection(COLLECTION).doc(organizationId).get();
    if (!doc.exists) {
      return {
        id: organizationId,
        organizationId,
        assignments: emptyAssignments(),
      };
    }
    const data = doc.data();
    return this.sanitize({
      organizationId,
      assignments: data.assignments,
      updatedBy: data.updatedBy,
    });
  }

  static async upsert(organizationId, data = {}) {
    const existing = await db().collection(COLLECTION).doc(organizationId).get();
    const record = this.sanitize({
      organizationId,
      assignments: data.assignments,
      updatedBy: data.updatedBy,
    });
    await db().collection(COLLECTION).doc(organizationId).set({
      ...record,
      createdAt: existing.exists ? existing.data().createdAt : new Date(),
      updatedAt: new Date(),
    }, { merge: true });
    return this.getByOrganizationId(organizationId);
  }
}
