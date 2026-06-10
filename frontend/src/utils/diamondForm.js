export const DIAMOND_FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'richText', label: 'Rich text' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
];

export const DIAMOND_FORM_USAGES = [
  { value: 'general', label: 'General' },
  { value: 'outcomes', label: 'Objectives & Outcomes' },
  { value: 'indicators', label: 'Indicators' },
  { value: 'activities', label: 'Activities' },
  { value: 'beneficiaries', label: 'Beneficiaries' },
  { value: 'risks', label: 'Risks & Notes' },
];

export const DIAMOND_OPTION_FIELD_TYPES = ['boolean', 'select', 'checkbox'];

export function createDiamondId() {
  return crypto.randomUUID();
}

export function fieldTypeLabel(type) {
  return DIAMOND_FIELD_TYPES.find((item) => item.value === type)?.label || type;
}

export function usageLabel(usage) {
  return DIAMOND_FORM_USAGES.find((item) => item.value === usage)?.label || usage;
}

export function hydrateDiamondForm(form, sections = [], options = []) {
  if (!form) return null;
  const sectionById = Object.fromEntries(sections.map((section) => [section.id, section]));
  const optionById = Object.fromEntries(options.map((option) => [option.id, option]));

  return {
    ...form,
    sections: (form.sectionIds || [])
      .map((id) => sectionById[id])
      .filter(Boolean),
    options: options.filter((option) =>
      (form.fields || []).some((field) => (field.optionIds || []).includes(option.id))
    ),
    fields: (form.fields || []).map((field) => ({
      ...field,
      section: field.sectionId ? sectionById[field.sectionId] : null,
      resolvedOptions: (field.optionIds || [])
        .map((id) => optionById[id])
        .filter(Boolean),
    })),
  };
}

export function orderSectionsByIds(sections = [], sectionIds = []) {
  const sectionById = Object.fromEntries(sections.map((section) => [section.id, section]));
  return sectionIds.map((id) => sectionById[id]).filter(Boolean);
}

export function sectionStepLabel(sections = [], sectionIds = [], sectionId) {
  const index = sectionIds.indexOf(sectionId);
  if (index === -1) return null;
  const section = sections.find((entry) => entry.id === sectionId);
  return section ? `Section ${index + 1}: ${section.title}` : `Section ${index + 1}`;
}

export function groupFieldsBySection(form, sections = []) {
  const fields = form?.fields || [];
  if (!form?.isSectioned) {
    return [{ id: null, title: null, fields }];
  }

  const sectionById = Object.fromEntries(sections.map((section) => [section.id, section]));
  const groups = (form.sectionIds || []).map((sectionId) => ({
    id: sectionId,
    title: sectionById[sectionId]?.title || 'Section',
    fields: fields.filter((field) => field.sectionId === sectionId),
  }));

  const ungrouped = fields.filter(
    (field) => !field.sectionId || !(form.sectionIds || []).includes(field.sectionId)
  );
  if (ungrouped.length) {
    groups.push({ id: 'ungrouped', title: 'Other', fields: ungrouped });
  }

  return groups;
}

export function optionDisplayLabel(option) {
  return option?.value || option?.label || '';
}

export function groupOptionsByLabel(options = []) {
  const groups = new Map();
  options.forEach((option) => {
    const label = String(option.label || '').trim();
    if (!label) return;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(option);
  });

  return [...groups.entries()].map(([label, items]) => ({
    label,
    options: items,
    optionIds: items.map((item) => item.id),
    values: items.map((item) => optionDisplayLabel(item)),
  }));
}

export function getUniqueOptionLabels(options = []) {
  return [...new Set(options.map((option) => String(option.label || '').trim()).filter(Boolean))];
}

export function formatDiamondResponseValue(field, value, options = []) {
  if (value == null || value === '') return '—';

  if (field.type === 'checkbox') {
    const values = Array.isArray(value) ? value : [value];
    return values
      .map((entry) => {
        const match = options.find((option) => option.value === entry || option.id === entry);
        return match ? optionDisplayLabel(match) : entry;
      })
      .join(', ');
  }

  if (DIAMOND_OPTION_FIELD_TYPES.includes(field.type)) {
    const match = options.find((option) => option.value === value || option.id === value);
    return match ? optionDisplayLabel(match) : String(value);
  }

  if (field.type === 'richText') {
    return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '—';
  }

  return String(value);
}

export const EMPTY_DIAMOND_FORM = {
  title: '',
  description: '',
  usage: 'general',
  isSectioned: false,
  sectionIds: [],
  fields: [],
};

export function normalizeDiamondForm(form) {
  if (!form) return EMPTY_DIAMOND_FORM;
  return {
    title: form.title || '',
    description: form.description || '',
    usage: form.usage || 'general',
    isSectioned: Boolean(form.isSectioned),
    sectionIds: Array.isArray(form.sectionIds) ? form.sectionIds : [],
    fields: Array.isArray(form.fields) ? form.fields : [],
  };
}

export function diamondFormPayload(formData, organizationId) {
  return {
    organizationId,
    title: formData.title?.trim(),
    description: formData.description?.trim() || '',
    usage: formData.usage || 'general',
    isSectioned: Boolean(formData.isSectioned),
    sectionIds: formData.isSectioned ? formData.sectionIds : [],
    fields: formData.fields,
  };
}

export function emptyDiamondResponses(form) {
  const responses = {};
  (form?.fields || []).forEach((field) => {
    responses[field.id] = field.type === 'checkbox' ? [] : '';
  });
  return responses;
}

export function normalizeDiamondResponses(form, responses = {}) {
  const base = emptyDiamondResponses(form);
  if (!responses || typeof responses !== 'object') return base;
  (form?.fields || []).forEach((field) => {
    const value = responses[field.id];
    if (field.type === 'checkbox') {
      base[field.id] = Array.isArray(value) ? value : value ? [value] : [];
    } else if (value != null) {
      base[field.id] = value;
    }
  });
  return base;
}
