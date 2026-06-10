import { randomUUID } from 'crypto';
import { db } from '../../../utils/firebase.js';
import { DiamondOption } from './diamondOption.model.js';
import { DiamondSection } from './diamondSection.model.js';

const COLLECTION = 'ngo_diamond_forms';

export const DIAMOND_FIELD_TYPES = [
  'boolean',
  'select',
  'checkbox',
  'calendar',
  'richText',
  'text',
];

export const DIAMOND_OPTION_FIELD_TYPES = ['boolean', 'select', 'checkbox'];
export const DIAMOND_FORM_USAGES = [
  'general',
  'outcomes',
  'indicators',
  'activities',
  'beneficiaries',
  'risks',
];

function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

function sanitizeIdList(ids = []) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map((id) => String(id)).filter(Boolean))];
}

export class DiamondFormField {
  static sanitize(data = {}, index = 0, { sectionIds = new Set(), optionIds = new Set() } = {}) {
    const type = DIAMOND_FIELD_TYPES.includes(data.type) ? data.type : 'text';
    const name = String(data.name || '').trim();
    const sectionId = data.sectionId ? String(data.sectionId) : null;
    const optionIdsList = sanitizeIdList(data.optionIds);

    return stripUndefined({
      id: data.id || randomUUID(),
      name,
      type,
      sectionId: sectionId && sectionIds.has(sectionId) ? sectionId : null,
      optionIds: optionIdsList.filter((id) => optionIds.has(id)),
      order: Number.isFinite(Number(data.order)) ? Number(data.order) : index,
    });
  }

  static sanitizeList(fields = [], context = {}) {
    if (!Array.isArray(fields)) return [];
    return fields
      .map((field, index) => this.sanitize(field, index, context))
      .filter((field) => field.name);
  }
}

export class DiamondForm {
  static sanitize(data = {}) {
    const isSectioned = Boolean(data.isSectioned);
    const sectionIds = isSectioned ? sanitizeIdList(data.sectionIds) : [];
    const usage = DIAMOND_FORM_USAGES.includes(data.usage) ? data.usage : 'general';

    return stripUndefined({
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      title: String(data.title || '').trim(),
      description: String(data.description || '').trim(),
      usage,
      isSectioned,
      sectionIds,
      fields: Array.isArray(data.fields) ? data.fields : [],
    });
  }

  static async validate(form) {
    if (!form.title) {
      throw new Error('Form title is required');
    }

    const [sections, options] = await Promise.all([
      DiamondSection.getAll(form.organizationId),
      DiamondOption.getAll(form.organizationId),
    ]);

    const sectionIds = new Set(sections.map((section) => section.id));
    const optionIds = new Set(options.map((option) => option.id));

    if (form.isSectioned) {
      if (!form.sectionIds.length) {
        throw new Error('Select at least one section when sectioned mode is enabled');
      }
      form.sectionIds.forEach((id) => {
        if (!sectionIds.has(id)) {
          throw new Error(`Section "${id}" was not found in the library`);
        }
      });
    }

    form.fields = DiamondFormField.sanitizeList(form.fields, {
      sectionIds: form.isSectioned ? new Set(form.sectionIds) : sectionIds,
      optionIds,
    });

    if (form.fields.length === 0) {
      throw new Error('Add at least one field to the form');
    }

    form.fields.forEach((field, index) => {
      if (form.isSectioned && !field.sectionId) {
        throw new Error(`Field "${field.name || `#${index + 1}`}" must belong to a section`);
      }

      if (DIAMOND_OPTION_FIELD_TYPES.includes(field.type) && field.optionIds.length === 0) {
        throw new Error(`Field "${field.name}" requires at least one option`);
      }
    });

    return form;
  }

  static async create(data) {
    const form = await this.validate(this.sanitize(data));
    const docRef = await db().collection(COLLECTION).add({
      ...form,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...form };
  }

  static async getAll(organizationId, filters = {}) {
    let query = db().collection(COLLECTION);
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (filters.createdBy) query = query.where('createdBy', '==', filters.createdBy);
    if (filters.usage) query = query.where('usage', '==', filters.usage);
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    const form = await this.validate(this.sanitize(data));
    await db().collection(COLLECTION).doc(id).update({
      ...form,
      updatedAt: new Date(),
    });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection(COLLECTION).doc(id).delete();
  }
}
