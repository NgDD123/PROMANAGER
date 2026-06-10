import React, { useMemo, useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Building2,
  Calendar,
  User,
  HandCoins,
  Target,
  Users
} from 'lucide-react';
import {
  useGetNgoProjectsQuery,
  useGetNgoOrganizationsQuery,
  useCreateNgoProjectMutation,
  useUpdateNgoProjectMutation,
  useDeleteNgoProjectMutation,
  getNgoErrorMessage,
} from '../../store/actions/ngo.js';
import NGOModal, { NGOFormGrid, NGOFormField, NGO_INPUT_CLASS, ngoModalCopy } from '../../components/ngo/NGOModal';
import { resolveNgoTenantOrganization, ngoEntityModalCopy } from '../../utils/ngoTenant.js';

const STATUS_OPTIONS = ['Planning', 'Active', 'On Hold', 'Closed'];

const EMPTY_FORM = {
  organizationId: '',
  code: '',
  name: '',
  programArea: '',
  donor: '',
  manager: '',
  startDate: '',
  endDate: '',
  budget: '',
  spent: '',
  beneficiariesTarget: '',
  beneficiariesReached: '',
  status: '',
  outcome: ''
};

function normalizeProject(project) {
  if (!project) return EMPTY_FORM;
  return {
    organizationId: project.organizationId || '',
    code: project.code || '',
    name: project.name || '',
    programArea: project.programArea || '',
    donor: project.donor || '',
    manager: project.manager || '',
    startDate: project.startDate || '',
    endDate: project.endDate || '',
    budget: project.budget != null && project.budget !== '' ? String(project.budget) : '',
    spent: project.spent != null && project.spent !== '' ? String(project.spent) : '',
    beneficiariesTarget: project.beneficiariesTarget != null && project.beneficiariesTarget !== '' ? String(project.beneficiariesTarget) : '',
    beneficiariesReached: project.beneficiariesReached != null && project.beneficiariesReached !== '' ? String(project.beneficiariesReached) : '',
    status: project.status || '',
    outcome: project.outcome || project.expectedOutcome || ''
  };
}

function projectPayload(formData, { isCreate = false } = {}) {
  const payload = {
    organizationId: formData.organizationId,
    name: formData.name?.trim(),
    programArea: formData.programArea?.trim() || '',
    donor: formData.donor?.trim() || '',
    manager: formData.manager?.trim() || '',
    startDate: formData.startDate || '',
    endDate: formData.endDate || '',
    budget: formData.budget === '' ? 0 : Number(formData.budget) || 0,
    spent: formData.spent === '' ? 0 : Number(formData.spent) || 0,
    beneficiariesTarget: formData.beneficiariesTarget === '' ? 0 : Number(formData.beneficiariesTarget) || 0,
    beneficiariesReached: formData.beneficiariesReached === '' ? 0 : Number(formData.beneficiariesReached) || 0,
    status: formData.status || 'Planning',
    outcome: formData.outcome?.trim() || ''
  };

  if (!isCreate && formData.code?.trim()) {
    payload.code = formData.code.trim();
  }

  return payload;
}

function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function statusBadgeClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return 'bg-green-100 text-green-700';
  if (s === 'planning') return 'bg-blue-100 text-blue-700';
  if (s === 'on hold') return 'bg-amber-100 text-amber-800';
  if (s === 'closed') return 'bg-gray-100 text-gray-600';
  return 'bg-gray-100 text-gray-600';
}

function formatDateLabel(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTimeline(startDate, endDate) {
  if (!startDate && !endDate) return '—';
  return `${formatDateLabel(startDate)} → ${formatDateLabel(endDate)}`;
}

function ProjectDetailItem({ icon: Icon, label, value, iconClass = 'text-gray-500' }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 ${iconClass}`}>
        <Icon size={14} />
        {label}
      </div>
      <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
  );
}

function ProjectViewPanel({ project, organizationName, onEdit }) {
  const outcome = project.outcome || project.expectedOutcome || '';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-teal-100 bg-linear-to-br from-teal-50 via-white to-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
              <FolderKanban className="text-teal-600" size={28} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-gray-900 break-words">{project.name}</h3>
              <p className="text-sm text-gray-500 mt-1 font-mono">{project.code || '—'}</p>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                <Building2 size={15} className="text-teal-600 shrink-0" />
                <span className="truncate">{organizationName}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusBadgeClass(project.status)}`}>
              {project.status || 'Planning'}
            </span>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Edit size={15} />
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProjectDetailItem icon={Target} label="Program Area" value={project.programArea} iconClass="text-indigo-600" />
        <ProjectDetailItem icon={HandCoins} label="Donor" value={project.donor} iconClass="text-amber-600" />
        <ProjectDetailItem icon={User} label="Manager" value={project.manager} iconClass="text-blue-600" />
        <ProjectDetailItem
          icon={Calendar}
          label="Project Period"
          value={formatTimeline(project.startDate, project.endDate)}
          iconClass="text-teal-600"
        />
      </div>

      {outcome ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            <Users size={14} className="text-teal-600" />
            Expected Outcome
          </div>
          <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{outcome}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function Projects() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const listParams = useMemo(() => {
    const filters = {};
    if (filterOrg) filters.organizationId = filterOrg;
    if (filterStatus) filters.status = filterStatus;
    return filters;
  }, [filterOrg, filterStatus]);

  const { data: organizations = [] } = useGetNgoOrganizationsQuery();
  const { tenantOrganizationId, tenantOrganizationName } = resolveNgoTenantOrganization(organizations);
  const {
    data: projects = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetNgoProjectsQuery(listParams);

  const [createProject, { isLoading: creating }] = useCreateNgoProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateNgoProjectMutation();
  const [deleteProject] = useDeleteNgoProjectMutation();

  const saving = creating || updating;
  const errorMessage = error
    ? getNgoErrorMessage(error, 'Failed to fetch projects')
    : null;

  const orgById = useMemo(
    () => Object.fromEntries(organizations.map((o) => [o.id, o])),
    [organizations]
  );

  const handleAdd = () => {
    setModalMode('add');
    setSelectedProject(null);
    setFormData({
      ...EMPTY_FORM,
      organizationId: tenantOrganizationId
    });
    setShowModal(true);
  };

  const handleEdit = (project) => {
    setModalMode('edit');
    setSelectedProject(project);
    setFormData({ ...normalizeProject(project), organizationId: tenantOrganizationId });
    setShowModal(true);
  };

  const handleView = (project) => {
    setModalMode('view');
    setSelectedProject(project);
    setFormData({ ...normalizeProject(project), organizationId: tenantOrganizationId });
    setShowModal(true);
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    try {
      await deleteProject(project.id).unwrap();
    } catch (err) {
      alert('Failed to delete project: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('Project name is required.');
      return;
    }

    try {
      const payload = projectPayload(
        {
          ...formData,
          organizationId: formData.organizationId || tenantOrganizationId,
        },
        { isCreate: modalMode === 'add' }
      );
      if (modalMode === 'add') {
        await createProject(payload).unwrap();
      } else {
        await updateProject({ id: selectedProject.id, ...payload }).unwrap();
      }
      setShowModal(false);
    } catch (err) {
      alert('Failed to save project: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const modalCopy =
    ngoEntityModalCopy('Project', modalMode, tenantOrganizationName) ||
    ngoModalCopy('Project', modalMode);
  const formSubtitle = modalCopy.subtitle;

  const filteredProjects = projects.filter((project) => {
    const term = searchTerm.toLowerCase();
    return (
      project.code?.toLowerCase().includes(term) ||
      project.name?.toLowerCase().includes(term) ||
      project.programArea?.toLowerCase().includes(term) ||
      project.donor?.toLowerCase().includes(term) ||
      project.manager?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Projects & Tenders</h1>
          <p className="text-gray-600 mt-1">
            Create and manage NGO programs with budget, timeline, and beneficiary tracking
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Add Project</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{errorMessage}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
            <span className="text-gray-600">Loading projects...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program / Donor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiaries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <FolderKanban className="text-teal-600" size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.code || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {orgById[project.organizationId]?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{project.programArea || '—'}</div>
                      <div className="text-xs text-gray-500">{project.donor || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {project.startDate || '—'} → {project.endDate || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{formatCurrency(project.budget)}</div>
                      <div className="text-xs text-gray-500">Spent {formatCurrency(project.spent)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {project.beneficiariesReached ?? 0} / {project.beneficiariesTarget ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadgeClass(project.status)}`}>
                        {project.status || 'Planning'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(project)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(project)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(project)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProjects.length === 0 && !loading && (
              <div className="text-center py-12">
                <FolderKanban className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No projects found</p>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Create your first project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <NGOModal
        open={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        title={modalMode === 'view' ? formData.name || modalCopy.title : modalCopy.title}
        subtitle={
          modalMode === 'view'
            ? formData.code
              ? `Project code: ${formData.code}`
              : formSubtitle
            : formSubtitle
        }
        onSave={handleSave}
        saving={saving}
        saveLabel={modalMode === 'add' ? 'Create Project' : 'Update Project'}
        maxWidth="4xl"
      >
        {modalMode === 'view' && selectedProject ? (
          <ProjectViewPanel
            project={selectedProject}
            organizationName={orgById[selectedProject.organizationId]?.name || tenantOrganizationName}
            onEdit={() => handleEdit(selectedProject)}
          />
        ) : (
          <NGOFormGrid>
            <NGOFormField label="Project Name" required>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={NGO_INPUT_CLASS}
                placeholder="e.g. Rural Health Outreach"
              />
            </NGOFormField>

            <NGOFormField label="Program Area">
              <input
                type="text"
                value={formData.programArea}
                onChange={(e) => setFormData({ ...formData, programArea: e.target.value })}
                className={NGO_INPUT_CLASS}
                placeholder="e.g. Health, Education"
              />
            </NGOFormField>

            <NGOFormField label="Donor">
              <input
                type="text"
                value={formData.donor}
                onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
                className={NGO_INPUT_CLASS}
                placeholder="Funding partner"
              />
            </NGOFormField>

            <NGOFormField label="Manager">
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className={NGO_INPUT_CLASS}
                placeholder="Project manager name"
              />
            </NGOFormField>

            <NGOFormField label="Start Date">
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={NGO_INPUT_CLASS}
              />
            </NGOFormField>

            <NGOFormField label="End Date">
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={NGO_INPUT_CLASS}
              />
            </NGOFormField>

            <NGOFormField label="Status">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={NGO_INPUT_CLASS}
              >
                <option value="">Select status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </NGOFormField>

            <NGOFormField label="Expected Outcome" colSpan={2}>
              <textarea
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                rows={3}
                className={NGO_INPUT_CLASS}
                placeholder="Primary outcome this project aims to achieve"
              />
            </NGOFormField>
          </NGOFormGrid>
        )}
      </NGOModal>
    </div>
  );
}
