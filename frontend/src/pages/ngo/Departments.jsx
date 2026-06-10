import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  useGetNgoDepartmentsQuery,
  useGetNgoOrganizationsQuery,
  useGetNgoBranchesQuery,
  useGetNgoUsersQuery,
  useCreateNgoDepartmentMutation,
  useUpdateNgoDepartmentMutation,
  useDeleteNgoDepartmentMutation,
  getNgoErrorMessage,
} from '../../store/actions/ngo.js';
import NGOModal, { NGOFormGrid, NGOFormField, NGO_INPUT_CLASS, ngoModalCopy } from '../../components/ngo/NGOModal';
import { resolveNgoTenantOrganization, ngoEntityModalCopy } from '../../utils/ngoTenant.js';

const EMPTY_FORM = {
  organizationId: '',
  branchId: '',
  name: '',
  code: '',
  description: '',
  headId: '',
  parentDepartmentId: '',
  budget: '',
  employeeCount: '',
  functionsText: '',
  status: 'active'
};

function normalizeDepartment(dept) {
  if (!dept) return EMPTY_FORM;
  return {
    organizationId: dept.organizationId || '',
    branchId: dept.branchId || '',
    name: dept.name || '',
    code: dept.code || '',
    description: dept.description || '',
    headId: dept.headId || '',
    parentDepartmentId: dept.parentDepartmentId || '',
    budget: dept.budget != null ? String(dept.budget) : '',
    employeeCount: dept.employeeCount != null ? String(dept.employeeCount) : '',
    functionsText: Array.isArray(dept.functions) ? dept.functions.join(', ') : '',
    status: dept.status || 'active'
  };
}

function departmentPayload(formData) {
  const functions = formData.functionsText
    ? formData.functionsText.split(',').map((item) => item.trim()).filter(Boolean)
    : [];

  const payload = {
    organizationId: formData.organizationId,
    branchId: formData.branchId,
    name: formData.name?.trim(),
    code: formData.code?.trim() || undefined,
    description: formData.description?.trim() || undefined,
    headId: formData.headId?.trim() || undefined,
    parentDepartmentId: formData.parentDepartmentId || null,
    budget: Number(formData.budget) || 0,
    employeeCount: Number(formData.employeeCount) || 0,
    functions,
    status: formData.status || 'active'
  };

  if (!payload.parentDepartmentId) {
    payload.parentDepartmentId = null;
  }

  return payload;
}

function formatStatus(status) {
  if (!status) return 'Active';
  return String(status).charAt(0).toUpperCase() + String(status).slice(1);
}

function isActiveStatus(status) {
  return String(status || 'active').toLowerCase() === 'active';
}

function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function Departments() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const listParams = useMemo(() => {
    const filters = {};
    if (filterOrg) filters.organizationId = filterOrg;
    if (filterBranch) filters.branchId = filterBranch;
    if (filterStatus) filters.status = filterStatus;
    return filters;
  }, [filterOrg, filterBranch, filterStatus]);

  const { data: organizations = [] } = useGetNgoOrganizationsQuery();
  const { tenantOrganizationId, tenantOrganizationName } = resolveNgoTenantOrganization(organizations);

  const { data: branches = [] } = useGetNgoBranchesQuery();
  const {
    data: departments = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetNgoDepartmentsQuery(listParams);

  const { data: filterBranches = [] } = useGetNgoBranchesQuery(
    { organizationId: filterOrg },
    { skip: !filterOrg }
  );

  const activeOrganizationId = formData.organizationId || tenantOrganizationId;

  const { data: formBranches = [] } = useGetNgoBranchesQuery(
    { organizationId: activeOrganizationId },
    { skip: !activeOrganizationId }
  );

  const { data: staff = [] } = useGetNgoUsersQuery(
    { organizationId: activeOrganizationId },
    { skip: !activeOrganizationId }
  );

  const [createDepartment, { isLoading: creating }] = useCreateNgoDepartmentMutation();
  const [updateDepartment, { isLoading: updating }] = useUpdateNgoDepartmentMutation();
  const [deleteDepartment] = useDeleteNgoDepartmentMutation();

  const saving = creating || updating;
  const errorMessage = error
    ? getNgoErrorMessage(error, 'Failed to fetch departments')
    : null;

  const orgById = useMemo(
    () => Object.fromEntries(organizations.map((o) => [o.id, o])),
    [organizations]
  );

  const branchById = useMemo(() => {
    const all = [...branches, ...filterBranches, ...formBranches];
    return Object.fromEntries(all.map((b) => [b.id, b]));
  }, [branches, filterBranches, formBranches]);

  const deptById = useMemo(
    () => Object.fromEntries(departments.map((d) => [d.id, d])),
    [departments]
  );

  const parentOptions = useMemo(() => {
    return departments.filter((d) => {
      if (d.id === selectedDept?.id) return false;
      if (formData.organizationId && d.organizationId !== formData.organizationId) return false;
      if (formData.branchId && d.branchId !== formData.branchId) return false;
      return true;
    });
  }, [departments, selectedDept, formData.organizationId, formData.branchId]);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedDept(null);
    setFormData({
      ...EMPTY_FORM,
      organizationId: tenantOrganizationId,
      branchId: filterBranch || ''
    });
    setShowModal(true);
  };

  const handleEdit = (dept) => {
    setModalMode('edit');
    setSelectedDept(dept);
    setFormData({ ...normalizeDepartment(dept), organizationId: tenantOrganizationId });
    setShowModal(true);
  };

  const handleView = (dept) => {
    setModalMode('view');
    setSelectedDept(dept);
    setFormData({ ...normalizeDepartment(dept), organizationId: tenantOrganizationId });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id).unwrap();
    } catch (err) {
      alert('Failed to delete department: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const handleSave = async () => {
    if (!formData.branchId || !formData.name?.trim()) {
      alert('Branch and department name are required.');
      return;
    }

    try {
      const payload = departmentPayload({
        ...formData,
        organizationId: formData.organizationId || tenantOrganizationId,
      });
      if (modalMode === 'add') {
        await createDepartment(payload).unwrap();
      } else {
        await updateDepartment({ id: selectedDept.id, ...payload }).unwrap();
      }
      setShowModal(false);
    } catch (err) {
      alert('Failed to save department: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const modalCopy =
    ngoEntityModalCopy('Department', modalMode, tenantOrganizationName) ||
    ngoModalCopy('Department', modalMode);

  const filteredDepartments = departments.filter((dept) => {
    const term = searchTerm.toLowerCase();
    return (
      (dept.name || '').toLowerCase().includes(term) ||
      (dept.code || '').toLowerCase().includes(term) ||
      (dept.description || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Departments</h1>
          <p className="text-gray-600 mt-1">
            Manage departments by organization and branch
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus size={20} />
          <span>Add Department</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterOrg}
            onChange={(e) => {
              setFilterOrg(e.target.value);
              setFilterBranch('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            disabled={!filterOrg}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          >
            <option value="">All Branches</option>
            {filterBranches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
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
            <span className="text-gray-600">Loading departments...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="text-indigo-600" size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                          <div className="text-sm text-gray-500">{dept.code || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {orgById[dept.organizationId]?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {branchById[dept.branchId]?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {dept.parentDepartmentId
                        ? deptById[dept.parentDepartmentId]?.name || '—'
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatCurrency(dept.budget)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {dept.employeeCount ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isActiveStatus(dept.status)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {formatStatus(dept.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(dept)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(dept)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(dept.id)}
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

            {filteredDepartments.length === 0 && !loading && (
              <div className="text-center py-12">
                <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No departments found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <NGOModal
        open={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        title={modalCopy.title}
        subtitle={modalCopy.subtitle}
        onSave={handleSave}
        saving={saving}
        saveLabel="Save Department"
        maxWidth="4xl"
      >
        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
              Assignment
            </h3>
            <NGOFormGrid>
              <NGOFormField label="Branch" required colSpan={2}>
                <select
                  value={formData.branchId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branchId: e.target.value,
                      ...(modalMode !== 'add' ? { parentDepartmentId: '' } : {}),
                    })
                  }
                  disabled={modalMode === 'view' || !activeOrganizationId}
                  className={NGO_INPUT_CLASS}
                >
                  <option value="">Select branch</option>
                  {formBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </NGOFormField>
            </NGOFormGrid>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
              Department details
            </h3>
            <NGOFormGrid>
              <NGOFormField label="Department Name" required>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={modalMode === 'view'}
                  className={NGO_INPUT_CLASS}
                  placeholder="e.g. Programs, Finance, HR"
                />
              </NGOFormField>

              <NGOFormField label="Status" required>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={modalMode === 'view'}
                  className={NGO_INPUT_CLASS}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </NGOFormField>

              <NGOFormField label="Description" colSpan={2}>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={modalMode === 'view'}
                  rows={3}
                  className={NGO_INPUT_CLASS}
                  placeholder="Department role and responsibilities"
                />
              </NGOFormField>

              <NGOFormField
                label="Department Head"
                colSpan={2}
                hint="Optional — assign a staff member from your organization"
              >
                <select
                  value={formData.headId}
                  onChange={(e) => setFormData({ ...formData, headId: e.target.value })}
                  disabled={modalMode === 'view' || !activeOrganizationId}
                  className={NGO_INPUT_CLASS}
                >
                  <option value="">Not assigned</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName || member.name || member.email || member.id}
                    </option>
                  ))}
                </select>
              </NGOFormField>
            </NGOFormGrid>
          </section>

          {modalMode !== 'add' ? (
            <section>
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                Additional details (optional)
              </h3>
              <NGOFormGrid>
                <NGOFormField label="Department Code">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={modalMode === 'view'}
                    className={NGO_INPUT_CLASS}
                    placeholder="e.g. DEPT-001"
                  />
                </NGOFormField>

                <NGOFormField label="Parent Department">
                  <select
                    value={formData.parentDepartmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, parentDepartmentId: e.target.value })
                    }
                    disabled={modalMode === 'view' || !formData.branchId}
                    className={NGO_INPUT_CLASS}
                  >
                    <option value="">None (top-level department)</option>
                    {parentOptions.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </NGOFormField>

                <NGOFormField label="Annual Budget (USD)">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    disabled={modalMode === 'view'}
                    className={NGO_INPUT_CLASS}
                    placeholder="0"
                  />
                </NGOFormField>

                <NGOFormField label="Employee Count">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.employeeCount}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeCount: e.target.value })
                    }
                    disabled={modalMode === 'view'}
                    className={NGO_INPUT_CLASS}
                    placeholder="0"
                  />
                </NGOFormField>

                <NGOFormField
                  label="Functions"
                  colSpan={2}
                  hint="Comma-separated list, e.g. Fundraising, Reporting, Compliance"
                >
                  <input
                    type="text"
                    value={formData.functionsText}
                    onChange={(e) =>
                      setFormData({ ...formData, functionsText: e.target.value })
                    }
                    disabled={modalMode === 'view'}
                    className={NGO_INPUT_CLASS}
                    placeholder="Function 1, Function 2"
                  />
                </NGOFormField>

                {modalMode === 'view' &&
                Array.isArray(selectedDept?.functions) &&
                selectedDept.functions.length > 0 ? (
                  <NGOFormField label="Functions list" colSpan={2}>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {selectedDept.functions.map((fn, i) => (
                        <li key={i}>{fn}</li>
                      ))}
                    </ul>
                  </NGOFormField>
                ) : null}
              </NGOFormGrid>
            </section>
          ) : null}
        </div>
      </NGOModal>
    </div>
  );
}
