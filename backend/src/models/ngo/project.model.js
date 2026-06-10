import { db } from '../../../utils/firebase.js';
import { generateProjectCode, resolveUniqueProjectCode } from '../../utils/ngoProjectCode.js';

const COLLECTION = 'ngo_projects';

function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

export class Project {
  static sanitize(data = {}) {
    return stripUndefined({
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      code: (data.code || '').trim(),
      name: (data.name || '').trim(),
      programArea: (data.programArea || '').trim(),
      donor: (data.donor || '').trim(),
      manager: (data.manager || '').trim(),
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      budget: Number(data.budget) || 0,
      spent: Number(data.spent) || 0,
      beneficiariesTarget: Number(data.beneficiariesTarget) || 0,
      beneficiariesReached: Number(data.beneficiariesReached) || 0,
      status: data.status || 'Planning',
      outcome: (data.outcome || data.expectedOutcome || '').trim()
    });
  }

  static async create(data) {
    const project = this.sanitize(data);
    if (!project.name) {
      throw new Error('Project name is required');
    }

    if (!project.code) {
      const existing = await this.getAll(project.organizationId);
      const baseCode = generateProjectCode(project.name);
      project.code = resolveUniqueProjectCode(
        baseCode,
        existing.map((item) => item.code)
      );
    }

    const docRef = await db().collection(COLLECTION).add({
      ...project,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...project };
  }

  static async getAll(organizationId, filters = {}) {
    let query = db().collection(COLLECTION);
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    if (filters.status) query = query.where('status', '==', filters.status);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    const existing = await this.getById(id);
    const updates = this.sanitize(data);
    if (!updates.name) {
      throw new Error('Project name is required');
    }
    updates.code = existing?.code || updates.code;
    await db().collection(COLLECTION).doc(id).update({
      ...updates,
      updatedAt: new Date()
    });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection(COLLECTION).doc(id).delete();
  }
}
