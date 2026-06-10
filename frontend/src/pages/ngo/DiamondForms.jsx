import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Gem,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Layers,
  ListTree,
  X,
  FileText,
  Tags,
} from 'lucide-react';
import {
  useGetNgoDiamondFormsQuery,
  useGetNgoDiamondOptionsQuery,
  useGetNgoDiamondSectionsQuery,
  useGetNgoOrganizationsQuery,
  useCreateNgoDiamondFormMutation,
  useUpdateNgoDiamondFormMutation,
  useDeleteNgoDiamondFormMutation,
  useCreateNgoDiamondOptionMutation,
  useUpdateNgoDiamondOptionMutation,
  useDeleteNgoDiamondOptionMutation,
  useCreateNgoDiamondSectionMutation,
  useUpdateNgoDiamondSectionMutation,
  useDeleteNgoDiamondSectionMutation,
  getNgoErrorMessage,
} from '../../store/actions/ngo.js';
import NGOModal, { NGOFormGrid, NGOFormField, NGO_INPUT_CLASS, ngoModalCopy } from '../../components/ngo/NGOModal';
import { DiamondFormRenderer } from '../../components/ngo/DiamondFormRenderer.jsx';
import { DiamondSectionJourney } from '../../components/ngo/DiamondSectionJourney.jsx';
import { resolveNgoTenantOrganization, ngoEntityModalCopy } from '../../utils/ngoTenant.js';
import {
  DIAMOND_FIELD_TYPES,
  DIAMOND_FORM_USAGES,
  DIAMOND_OPTION_FIELD_TYPES,
  EMPTY_DIAMOND_FORM,
  createDiamondId,
  diamondFormPayload,
  fieldTypeLabel,
  getUniqueOptionLabels,
  groupOptionsByLabel,
  emptyDiamondResponses,
  normalizeDiamondForm,
  orderSectionsByIds,
  sectionStepLabel,
  usageLabel,
} from '../../utils/diamondForm.js';

const NEW_OPTION_LABEL = '__new__';

const PAGE_TABS = [
  { id: 'forms', label: 'Forms', icon: FileText },
  { id: 'sections', label: 'Sections', icon: Layers },
  { id: 'options', label: 'Options', icon: Tags },
];

function TabButton({ tab, active, onClick }) {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      onClick={() => onClick(tab.id)}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-violet-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
      {tab.label}
    </button>
  );
}

function FieldBuilder({
  fields,
  sectionIds,
  sections,
  options,
  isSectioned,
  onChange,
  onCreateOption,
  lastCreatedOptionIds = [],
  readOnly = false,
}) {
  const [draft, setDraft] = useState({
    name: '',
    type: 'text',
    sectionId: '',
    optionIds: [],
  });
  const [pickerGroupLabel, setPickerGroupLabel] = useState('');

  const selectedSections = useMemo(
    () => orderSectionsByIds(sections, sectionIds),
    [sections, sectionIds]
  );
  const needsOptions = DIAMOND_OPTION_FIELD_TYPES.includes(draft.type);
  const optionGroups = useMemo(() => groupOptionsByLabel(options), [options]);
  const selectedOptionIdSet = useMemo(() => new Set(draft.optionIds), [draft.optionIds]);
  const availableGroups = useMemo(
    () => optionGroups.filter((group) => group.optionIds.some((id) => !selectedOptionIdSet.has(id))),
    [optionGroups, selectedOptionIdSet]
  );
  const selectedGroups = useMemo(() => {
    const selected = options.filter((option) => draft.optionIds.includes(option.id));
    return groupOptionsByLabel(selected);
  }, [draft.optionIds, options]);

  useEffect(() => {
    if (!lastCreatedOptionIds.length || !needsOptions) return;
    setDraft((prev) => {
      const nextIds = lastCreatedOptionIds.filter((id) => !prev.optionIds.includes(id));
      if (!nextIds.length) return prev;
      return { ...prev, optionIds: [...prev.optionIds, ...nextIds] };
    });
    setPickerGroupLabel('');
  }, [lastCreatedOptionIds, needsOptions]);

  const handleAddOption = () => {
    if (pickerGroupLabel) {
      const group = optionGroups.find((entry) => entry.label === pickerGroupLabel);
      if (!group) return;
      setDraft((prev) => {
        const nextIds = group.optionIds.filter((id) => !prev.optionIds.includes(id));
        if (!nextIds.length) return prev;
        return { ...prev, optionIds: [...prev.optionIds, ...nextIds] };
      });
      setPickerGroupLabel('');
      return;
    }
    onCreateOption?.();
  };

  const removeSelectedGroup = (groupLabel) => {
    setDraft((prev) => ({
      ...prev,
      optionIds: prev.optionIds.filter((id) => {
        const option = options.find((entry) => entry.id === id);
        return option?.label !== groupLabel;
      }),
    }));
  };

  const addField = () => {
    const name = draft.name.trim();
    if (!name) return;
    if (isSectioned && !draft.sectionId) return;
    if (needsOptions && draft.optionIds.length === 0) return;

    onChange([
      ...fields,
      {
        id: createDiamondId(),
        name,
        type: draft.type,
        sectionId: isSectioned ? draft.sectionId : null,
        optionIds: needsOptions ? draft.optionIds : [],
        order: fields.length,
      },
    ]);
    setDraft({ name: '', type: 'text', sectionId: '', optionIds: [] });
    setPickerGroupLabel('');
  };

  const removeField = (id) => onChange(fields.filter((field) => field.id !== id));

  const optionLabels = (optionIds = []) =>
    groupOptionsByLabel(options.filter((option) => optionIds.includes(option.id)))
      .map((group) => `${group.label} (${group.values.join(', ')})`)
      .join('; ');

  return (
    <div className="space-y-4">
      {fields.length > 0 ? (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {index + 1}. {field.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {fieldTypeLabel(field.type)}
                  {isSectioned
                    ? ` · ${sectionStepLabel(sections, sectionIds, field.sectionId) || '—'}`
                    : ''}
                  {field.optionIds?.length ? ` · ${optionLabels(field.optionIds)}` : ''}
                </p>
              </div>
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 rounded-lg border border-dashed border-gray-300 px-4 py-3">
          No fields yet. Add at least one field below.
        </p>
      )}

      {!readOnly ? (
        <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 space-y-4">
          <p className="text-sm font-medium text-teal-900">Add field</p>
          <NGOFormGrid>
            <NGOFormField label="Field name" required>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                className={NGO_INPUT_CLASS}
              />
            </NGOFormField>
            <NGOFormField label="Field type" required>
              <select
                value={draft.type}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, type: e.target.value, optionIds: [] }));
                  setPickerGroupLabel('');
                }}
                className={NGO_INPUT_CLASS}
              >
                {DIAMOND_FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </NGOFormField>
            {isSectioned ? (
              <NGOFormField label="Section" required>
                <select
                  value={draft.sectionId}
                  onChange={(e) => setDraft((prev) => ({ ...prev, sectionId: e.target.value }))}
                  className={NGO_INPUT_CLASS}
                >
                  <option value="">Select section</option>
                  {selectedSections.map((section, index) => (
                    <option key={section.id} value={section.id}>
                      Section {index + 1}: {section.title}
                    </option>
                  ))}
                </select>
              </NGOFormField>
            ) : null}
          </NGOFormGrid>

          {needsOptions ? (
            <NGOFormField label="Options" required>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={pickerGroupLabel}
                    onChange={(e) => setPickerGroupLabel(e.target.value)}
                    className={`${NGO_INPUT_CLASS} flex-1`}
                  >
                    <option value="">Select a label</option>
                    {availableGroups.map((group) => (
                      <option key={group.label} value={group.label}>
                        {group.label} ({group.values.join(', ')})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 shrink-0"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>

                {selectedGroups.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedGroups.map((group) => (
                      <div
                        key={group.label}
                        className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-teal-900">{group.label}</p>
                          <p className="text-xs text-teal-700 mt-0.5">{group.values.join(', ')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedGroup(group.label)}
                          className="rounded-full p-0.5 text-teal-700 hover:bg-teal-100 hover:text-teal-900 shrink-0"
                          aria-label={`Remove ${group.label}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Select a label from the dropdown to attach its values, or click Add to create a new option set.
                  </p>
                )}
              </div>
            </NGOFormField>
          ) : null}

          <button
            type="button"
            onClick={addField}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
          >
            <Plus size={15} />
            Add field to form
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FormsTab({
  forms,
  sections,
  options,
  searchTerm,
  onSearch,
  onCreate,
  onView,
  onEdit,
  onDelete,
}) {
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return forms;
    return forms.filter(
      (form) =>
        form.title?.toLowerCase().includes(term) ||
        form.description?.toLowerCase().includes(term)
    );
  }, [forms, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search forms..."
          className={`${NGO_INPUT_CLASS} pl-10`}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <Gem className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-600 font-medium">No diamond forms yet</p>
          <button type="button" onClick={onCreate} className="mt-4 text-violet-700 font-medium hover:underline">
            Create your first form
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Usage</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Structure</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fields</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50/80">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{form.title}</p>
                      {form.description ? (
                        <p className="text-sm text-gray-500 truncate max-w-xs">{form.description}</p>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{usageLabel(form.usage)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {form.isSectioned ? `${form.sectionIds?.length || 0} section(s)` : 'Flat'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{form.fields?.length || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => onView(form)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye size={18} />
                        </button>
                        <button type="button" onClick={() => onEdit(form)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <Edit size={18} />
                        </button>
                        <button type="button" onClick={() => onDelete(form)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function LibraryTab({
  type,
  items,
  searchTerm,
  onSearch,
  onCreate,
  onEdit,
  onDelete,
  onDeleteGroup,
}) {
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => {
      const label = type === 'options' ? item.label : item.title;
      const value = item.value || '';
      return label?.toLowerCase().includes(term) || value.toLowerCase().includes(term);
    });
  }, [items, searchTerm, type]);

  const groupedOptions = useMemo(
    () => (type === 'options' ? groupOptionsByLabel(filtered) : []),
    [filtered, type]
  );

  const labelColumn = type === 'options' ? 'Label' : 'Title';
  const emptyLabel = type === 'options' ? 'No options yet' : 'No sections yet';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={`Search ${type}...`}
            className={`${NGO_INPUT_CLASS} pl-10`}
          />
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium"
        >
          <Plus size={18} />
          Add {type === 'options' ? 'option' : 'section'}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-gray-500">{emptyLabel}</p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium"
          >
            <Plus size={18} />
            Add {type === 'options' ? 'option' : 'section'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{labelColumn}</th>
                {type === 'options' ? (
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Values</th>
                ) : null}
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {type === 'options'
                ? groupedOptions.map((group) => (
                    <tr key={group.label} className="hover:bg-gray-50/80">
                      <td className="px-6 py-4 font-medium text-gray-900">{group.label}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{group.values.join(', ')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onDeleteGroup?.(group)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => onEdit(item)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg">
                            <Edit size={18} />
                          </button>
                          <button type="button" onClick={() => onDelete(item)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DiamondForms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const openedFromQueryRef = useRef(false);
  const [activeTab, setActiveTab] = useState('forms');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalKind, setModalKind] = useState('form');
  const [modalMode, setModalMode] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_DIAMOND_FORM);
  const [libraryDraft, setLibraryDraft] = useState({ label: '', value: '', title: '' });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resumeFormAfterOption, setResumeFormAfterOption] = useState(false);
  const [resumeFormAfterSection, setResumeFormAfterSection] = useState(false);
  const [lastCreatedOptionIds, setLastCreatedOptionIds] = useState([]);
  const [pickerSectionId, setPickerSectionId] = useState('');
  const [optionSetLabel, setOptionSetLabel] = useState('');
  const [optionSetNewLabel, setOptionSetNewLabel] = useState('');
  const [optionValuesDraft, setOptionValuesDraft] = useState(['']);
  const [sectionTitlesDraft, setSectionTitlesDraft] = useState(['']);
  const [previewResponses, setPreviewResponses] = useState({});
  const { data: organizations = [] } = useGetNgoOrganizationsQuery();
  const { tenantOrganizationId, tenantOrganizationName } = resolveNgoTenantOrganization(organizations);
  const listParams = useMemo(
    () => (tenantOrganizationId ? { organizationId: tenantOrganizationId } : {}),
    [tenantOrganizationId]
  );

  const { data: forms = [], isLoading: loadingForms, error: formsError } = useGetNgoDiamondFormsQuery(listParams, {
    skip: !tenantOrganizationId,
  });
  const { data: options = [], isLoading: loadingOptions, error: optionsError } = useGetNgoDiamondOptionsQuery(listParams, {
    skip: !tenantOrganizationId,
  });
  const { data: sections = [], isLoading: loadingSections, error: sectionsError } = useGetNgoDiamondSectionsQuery(listParams, {
    skip: !tenantOrganizationId,
  });

  const [createForm] = useCreateNgoDiamondFormMutation();
  const [updateForm] = useUpdateNgoDiamondFormMutation();
  const [deleteForm] = useDeleteNgoDiamondFormMutation();
  const [createOption] = useCreateNgoDiamondOptionMutation();
  const [updateOption] = useUpdateNgoDiamondOptionMutation();
  const [deleteOption] = useDeleteNgoDiamondOptionMutation();
  const [createSection] = useCreateNgoDiamondSectionMutation();
  const [updateSection] = useUpdateNgoDiamondSectionMutation();
  const [deleteSection] = useDeleteNgoDiamondSectionMutation();

  const isLoading = loadingForms || loadingOptions || loadingSections;
  const loadError = formsError || optionsError || sectionsError;

  useEffect(() => {
    if (!tenantOrganizationId || openedFromQueryRef.current) return;
    const usage = searchParams.get('usage');
    const action = searchParams.get('action');
    const isValidUsage = DIAMOND_FORM_USAGES.some((entry) => entry.value === usage);
    if (action !== 'create' || !isValidUsage) return;

    openedFromQueryRef.current = true;
    setActiveTab('forms');
    setModalKind('form');
    setModalMode('add');
    setSelectedItem(null);
    setFormData({ ...EMPTY_DIAMOND_FORM, usage });
    setPreviewResponses({});
    setErrorMessage('');
    setShowModal(true);
    setSearchParams({}, { replace: true });
  }, [tenantOrganizationId, searchParams, setSearchParams]);

  const resetOptionValuesDraft = () => {
    setOptionSetLabel('');
    setOptionSetNewLabel('');
    setOptionValuesDraft(['']);
  };

  const resetSectionTitlesDraft = () => {
    setSectionTitlesDraft(['']);
  };

  const closeModal = () => {
    if (resumeFormAfterOption && modalKind === 'options') {
      setResumeFormAfterOption(false);
      setModalKind('form');
      setLibraryDraft({ label: '', value: '', title: '' });
      resetOptionValuesDraft();
      setErrorMessage('');
      return;
    }
    if (resumeFormAfterSection && modalKind === 'sections') {
      setResumeFormAfterSection(false);
      setModalKind('form');
      setLibraryDraft({ label: '', value: '', title: '' });
      resetSectionTitlesDraft();
      setErrorMessage('');
      return;
    }
    setShowModal(false);
    setSelectedItem(null);
    setFormData(EMPTY_DIAMOND_FORM);
    setLibraryDraft({ label: '', value: '', title: '' });
    resetOptionValuesDraft();
    resetSectionTitlesDraft();
    setErrorMessage('');
    setResumeFormAfterOption(false);
    setResumeFormAfterSection(false);
    setLastCreatedOptionIds([]);
    setPickerSectionId('');
    setPreviewResponses({});
  };

  const openFormModal = (mode, form = null) => {
    const normalized = normalizeDiamondForm(form);
    setModalKind('form');
    setModalMode(mode);
    setSelectedItem(form);
    setFormData(normalized);
    setPreviewResponses(emptyDiamondResponses(normalized));
    setErrorMessage('');
    setShowModal(true);
  };

  const openLibraryModal = (kind, mode, item = null) => {
    setModalKind(kind);
    setModalMode(mode);
    setSelectedItem(item);
    setLibraryDraft({
      label: item?.label || '',
      value: item?.value || '',
      title: item?.title || '',
    });
    if (kind === 'options' && mode === 'add') {
      resetOptionValuesDraft();
    }
    if (kind === 'sections' && mode === 'add') {
      resetSectionTitlesDraft();
    }
    setErrorMessage('');
    setShowModal(true);
  };

  const openOptionFromFieldBuilder = () => {
    setResumeFormAfterOption(true);
    setLastCreatedOptionIds([]);
    resetOptionValuesDraft();
    openLibraryModal('options', 'add');
  };

  const openSectionFromFormBuilder = () => {
    setResumeFormAfterSection(true);
    setLibraryDraft({ label: '', value: '', title: '' });
    resetSectionTitlesDraft();
    openLibraryModal('sections', 'add');
  };

  const updateSectionTitleRow = (index, value) => {
    setSectionTitlesDraft((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? value : row))
    );
  };

  const addSectionTitleRow = () => {
    setSectionTitlesDraft((prev) => [...prev, '']);
  };

  const removeSectionTitleRow = (index) => {
    setSectionTitlesDraft((prev) =>
      prev.length === 1 ? [''] : prev.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const updateOptionValueRow = (index, value) => {
    setOptionValuesDraft((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? value : row))
    );
  };

  const addOptionValueRow = () => {
    setOptionValuesDraft((prev) => [...prev, '']);
  };

  const removeOptionValueRow = (index) => {
    setOptionValuesDraft((prev) =>
      prev.length === 1 ? [''] : prev.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const resolvedOptionSetLabel = () =>
    optionSetLabel === NEW_OPTION_LABEL ? optionSetNewLabel.trim() : optionSetLabel.trim();

  const handleSave = async () => {
    if (!tenantOrganizationId) return;
    setSaving(true);
    setErrorMessage('');

    try {
      if (modalKind === 'form') {
        const payload = diamondFormPayload(formData, tenantOrganizationId);
        if (modalMode === 'add') await createForm(payload).unwrap();
        else await updateForm({ id: selectedItem.id, ...payload }).unwrap();
      } else if (modalKind === 'options') {
        if (modalMode === 'add') {
          const label = resolvedOptionSetLabel();
          const values = optionValuesDraft.map((row) => row.trim()).filter(Boolean);

          if (!label) {
            setErrorMessage('Select or enter a label for this option set.');
            return;
          }
          if (!values.length) {
            setErrorMessage('Add at least one value (e.g. Male, Female, Other).');
            return;
          }

          const created = await Promise.all(
            values.map((value) =>
              createOption({
                organizationId: tenantOrganizationId,
                label,
                value,
              }).unwrap()
            )
          );

          if (resumeFormAfterOption) {
            setLastCreatedOptionIds(created.map((option) => option.id));
            setModalKind('form');
            setResumeFormAfterOption(false);
            resetOptionValuesDraft();
            setErrorMessage('');
            return;
          }
        } else {
          const payload = {
            organizationId: tenantOrganizationId,
            label: libraryDraft.label.trim(),
            value: libraryDraft.value.trim() || libraryDraft.label.trim(),
          };
          await updateOption({ id: selectedItem.id, ...payload }).unwrap();
        }
      } else if (modalMode === 'add') {
        const titles = sectionTitlesDraft.map((row) => row.trim()).filter(Boolean);
        if (!titles.length) {
          setErrorMessage('Add at least one section title.');
          return;
        }

        const created = await Promise.all(
          titles.map((title) =>
            createSection({
              organizationId: tenantOrganizationId,
              title,
            }).unwrap()
          )
        );

        if (resumeFormAfterSection) {
          const createdIds = created.map((section) => section.id);
          setFormData((prev) => ({
            ...prev,
            sectionIds: [...prev.sectionIds, ...createdIds.filter((id) => !prev.sectionIds.includes(id))],
          }));
          setPickerSectionId('');
          setModalKind('form');
          setResumeFormAfterSection(false);
          resetSectionTitlesDraft();
          setErrorMessage('');
          return;
        }
      } else {
        const title = libraryDraft.title.trim();
        if (!title) {
          setErrorMessage('Enter a section title.');
          return;
        }
        await updateSection({
          id: selectedItem.id,
          organizationId: tenantOrganizationId,
          title,
        }).unwrap();
      }
      closeModal();
    } catch (err) {
      setErrorMessage(getNgoErrorMessage(err, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteForm = async (form) => {
    if (!window.confirm(`Delete "${form.title}"?`)) return;
    try {
      await deleteForm(form.id).unwrap();
    } catch (err) {
      window.alert(getNgoErrorMessage(err, 'Failed to delete form'));
    }
  };

  const handleDeleteOption = async (option) => {
    if (!window.confirm(`Delete option "${option.label}"?`)) return;
    try {
      await deleteOption(option.id).unwrap();
    } catch (err) {
      window.alert(getNgoErrorMessage(err, 'Failed to delete option'));
    }
  };

  const handleDeleteOptionGroup = async (group) => {
    if (!window.confirm(`Delete "${group.label}" and all its values (${group.values.join(', ')})?`)) return;
    try {
      await Promise.all(group.options.map((option) => deleteOption(option.id).unwrap()));
    } catch (err) {
      window.alert(getNgoErrorMessage(err, 'Failed to delete option set'));
    }
  };

  const handleDeleteSection = async (section) => {
    if (!window.confirm(`Delete section "${section.title}"?`)) return;
    try {
      await deleteSection(section.id).unwrap();
    } catch (err) {
      window.alert(getNgoErrorMessage(err, 'Failed to delete section'));
    }
  };

  const removeSectionId = (sectionId) => {
    setFormData((prev) => ({
      ...prev,
      sectionIds: prev.sectionIds.filter((id) => id !== sectionId),
    }));
  };

  const moveSectionId = (sectionId, direction) => {
    setFormData((prev) => {
      const ids = [...prev.sectionIds];
      const index = ids.indexOf(sectionId);
      if (index === -1) return prev;
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= ids.length) return prev;
      [ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]];
      return { ...prev, sectionIds: ids };
    });
  };

  const handleAddSection = () => {
    if (pickerSectionId) {
      setFormData((prev) => ({
        ...prev,
        sectionIds: prev.sectionIds.includes(pickerSectionId)
          ? prev.sectionIds
          : [...prev.sectionIds, pickerSectionId],
      }));
      setPickerSectionId('');
      return;
    }
    openSectionFromFormBuilder();
  };

  const selectedFormSections = useMemo(
    () => orderSectionsByIds(sections, formData.sectionIds),
    [sections, formData.sectionIds]
  );

  const availableFormSections = useMemo(
    () => sections.filter((section) => !formData.sectionIds.includes(section.id)),
    [sections, formData.sectionIds]
  );

  const modalCopy =
    modalKind === 'form'
      ? ngoEntityModalCopy('Diamond Form', modalMode, tenantOrganizationName) ||
        ngoModalCopy('Diamond Form', modalMode)
      : modalKind === 'options' && modalMode === 'add'
        ? { title: 'Add Options', subtitle: 'Choose one label, then add the values users can pick under it.' }
        : modalKind === 'options'
          ? ngoModalCopy('Option', modalMode)
          : modalKind === 'sections' && modalMode === 'add' && resumeFormAfterSection
            ? { title: 'Add Sections', subtitle: 'Add one or more section titles. Each will be created and added to this form.' }
            : modalKind === 'sections' && modalMode === 'add'
              ? { title: 'Add Sections', subtitle: 'Add one or more section titles.' }
              : ngoModalCopy('Section', modalMode);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gem className="text-violet-600" size={28} />
            Diamond Forms
          </h1>
          <p className="text-gray-600 mt-1">
            Manage form templates, reusable sections, and field options for dynamic data capture.
          </p>
        </div>
        {activeTab === 'forms' ? (
          <button
            type="button"
            onClick={() => openFormModal('add')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium"
          >
            <Plus size={18} />
            Create form
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {PAGE_TABS.map((tab) => (
          <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={setActiveTab} />
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={22} />
          Loading...
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {getNgoErrorMessage(loadError, 'Failed to load diamond form data')}
        </div>
      ) : activeTab === 'forms' ? (
        <FormsTab
          forms={forms}
          sections={sections}
          options={options}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onCreate={() => openFormModal('add')}
          onView={(form) => openFormModal('view', form)}
          onEdit={(form) => openFormModal('edit', form)}
          onDelete={handleDeleteForm}
        />
      ) : activeTab === 'sections' ? (
        <LibraryTab
          type="sections"
          items={sections}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onCreate={() => openLibraryModal('sections', 'add')}
          onEdit={(item) => openLibraryModal('sections', 'edit', item)}
          onDelete={handleDeleteSection}
        />
      ) : (
        <LibraryTab
          type="options"
          items={options}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onCreate={() => openLibraryModal('options', 'add')}
          onEdit={(item) => openLibraryModal('options', 'edit', item)}
          onDelete={handleDeleteOption}
          onDeleteGroup={handleDeleteOptionGroup}
        />
      )}

      <NGOModal
        open={showModal}
        onClose={closeModal}
        mode={modalMode}
        title={modalCopy.title}
        subtitle={modalCopy.subtitle}
        onSave={handleSave}
        saving={saving}
        maxWidth="4xl"
      >
        {modalKind === 'form' && modalMode === 'view' ? (
          <DiamondFormRenderer
            form={formData}
            sections={sections}
            options={options}
            responses={previewResponses}
            onChange={setPreviewResponses}
          />
        ) : modalKind === 'form' ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Header</h3>
              <NGOFormGrid>
                <NGOFormField label="Form title" required colSpan={2}>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className={NGO_INPUT_CLASS}
                  />
                </NGOFormField>
                <NGOFormField label="Usage">
                  <select
                    value={formData.usage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, usage: e.target.value }))}
                    className={NGO_INPUT_CLASS}
                  >
                    {DIAMOND_FORM_USAGES.map((usage) => (
                      <option key={usage.value} value={usage.value}>{usage.label}</option>
                    ))}
                  </select>
                </NGOFormField>
                <NGOFormField label="Description" colSpan={2}>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={NGO_INPUT_CLASS}
                  />
                </NGOFormField>
              </NGOFormGrid>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Sections</h3>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSectioned}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isSectioned: e.target.checked,
                      sectionIds: e.target.checked ? prev.sectionIds : [],
                    }))
                  }
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                Organize fields into a vertical journey (Section 1, Section 2, …)
              </label>
              {formData.isSectioned ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={pickerSectionId}
                      onChange={(e) => setPickerSectionId(e.target.value)}
                      className={`${NGO_INPUT_CLASS} flex-1`}
                    >
                      <option value="">Select a section</option>
                      {availableFormSections.map((section) => (
                        <option key={section.id} value={section.id}>{section.title}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 shrink-0"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>

                  <DiamondSectionJourney
                    mode="builder"
                    steps={selectedFormSections.map((section) => ({
                      id: section.id,
                      title: section.title,
                    }))}
                    onRemove={removeSectionId}
                    onMoveUp={(sectionId) => moveSectionId(sectionId, 'up')}
                    onMoveDown={(sectionId) => moveSectionId(sectionId, 'down')}
                    emptyMessage="Select a section from the dropdown, or click Add to create a new section."
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-2">
                <ListTree size={16} className="text-teal-600" />
                Fields
              </h3>
              <FieldBuilder
                fields={formData.fields}
                sectionIds={formData.sectionIds}
                sections={sections}
                options={options}
                isSectioned={formData.isSectioned}
                onChange={(fields) => setFormData((prev) => ({ ...prev, fields }))}
                onCreateOption={openOptionFromFieldBuilder}
                lastCreatedOptionIds={lastCreatedOptionIds}
              />
            </div>
          </div>
        ) : modalKind === 'options' && modalMode === 'add' ? (
          <div className="flex flex-col gap-4">
            <NGOFormField label="Label" required>
              <select
                value={optionSetLabel}
                onChange={(e) => setOptionSetLabel(e.target.value)}
                className={NGO_INPUT_CLASS}
              >
                <option value="">Select a label</option>
                {getUniqueOptionLabels(options).map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
                <option value={NEW_OPTION_LABEL}>Create new label...</option>
              </select>
              {optionSetLabel === NEW_OPTION_LABEL ? (
                <input
                  type="text"
                  value={optionSetNewLabel}
                  onChange={(e) => setOptionSetNewLabel(e.target.value)}
                  placeholder="e.g. Gender options"
                  className={`${NGO_INPUT_CLASS} mt-2`}
                />
              ) : null}
            </NGOFormField>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Values *</label>
              {optionValuesDraft.map((value, index) => (
                <div key={`option-value-${index}`} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateOptionValueRow(index, e.target.value)}
                    placeholder="e.g. Male"
                    className={NGO_INPUT_CLASS}
                    aria-label={`Option value ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeOptionValueRow(index)}
                    className="inline-flex items-center justify-center p-2.5 rounded-lg border border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 shrink-0"
                    aria-label="Remove value"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOptionValueRow}
                className="self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-300 bg-white text-teal-700 text-sm font-medium hover:bg-teal-50"
              >
                <Plus size={14} />
                Add another value
              </button>
            </div>
          </div>
        ) : modalKind === 'options' ? (
          <NGOFormGrid>
            <NGOFormField label="Label" required colSpan={2}>
              <input
                type="text"
                value={libraryDraft.label}
                onChange={(e) => setLibraryDraft((prev) => ({ ...prev, label: e.target.value }))}
                className={NGO_INPUT_CLASS}
              />
            </NGOFormField>
            <NGOFormField label="Value" colSpan={2} hint="Optional. Defaults to the label if left blank.">
              <input
                type="text"
                value={libraryDraft.value}
                onChange={(e) => setLibraryDraft((prev) => ({ ...prev, value: e.target.value }))}
                className={NGO_INPUT_CLASS}
              />
            </NGOFormField>
          </NGOFormGrid>
        ) : modalKind === 'sections' && modalMode === 'add' ? (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Section titles *</label>
            {sectionTitlesDraft.map((title, index) => (
              <div key={`section-title-${index}`} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => updateSectionTitleRow(index, e.target.value)}
                  placeholder="e.g. Personal details"
                  className={NGO_INPUT_CLASS}
                  aria-label={`Section title ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeSectionTitleRow(index)}
                  className="inline-flex items-center justify-center p-2.5 rounded-lg border border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 shrink-0"
                  aria-label="Remove section"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSectionTitleRow}
              className="self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-violet-300 bg-white text-violet-700 text-sm font-medium hover:bg-violet-50"
            >
              <Plus size={14} />
              Add another section
            </button>
          </div>
        ) : (
          <NGOFormField label="Section title" required colSpan={2}>
            <input
              type="text"
              value={libraryDraft.title}
              onChange={(e) => setLibraryDraft((prev) => ({ ...prev, title: e.target.value }))}
              className={NGO_INPUT_CLASS}
            />
          </NGOFormField>
        )}

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mt-4">
            {errorMessage}
          </div>
        ) : null}
      </NGOModal>
    </div>
  );
}
