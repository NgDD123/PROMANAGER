import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  GitBranch,
} from 'lucide-react';
import {
  useGetNgoRolesQuery,
  useGetNgoOrganizationsQuery,
  useGetNgoBranchesQuery,
  useCreateNgoRoleMutation,
  useUpdateNgoRoleMutation,
  useDeleteNgoRoleMutation,
  getNgoErrorMessage,
} from '../../store/actions/ngo.js';
import NGOModal, { NGOFormGrid, NGOFormField, NGO_INPUT_CLASS, ngoModalCopy } from '../../components/ngo/NGOModal';
import {
  NGO_SUBROLE_NAV_SCOPES,
  formatNavigationScopeLabels,
} from '../../config/ngoNavigationScopes.js';
import { resolveNgoTenantOrganization, ngoEntityModalCopy } from '../../utils/ngoTenant.js';

const EMPTY_FORM = {
  organizationId: '',
  branchId: '',
  name: '',
  description: '',
  navigationScopes: [],
  isSubRole: true,
};

function normalizeRole(role) {
  if (!role) return EMPTY_FORM;
  return {
    organizationId: role.organizationId || '',
    branchId: role.branchId || '',
    name: role.name || '',
    description: role.description || '',
    navigationScopes: Array.isArray(role.navigationScopes) ? [...role.navigationScopes] : [],
    isSubRole: role.isSubRole === true,
  };
}

function rolePayload(formData) {
  return {
    organizationId: formData.organizationId,
    branchId: formData.branchId,
    name: formData.name?.trim(),
    description: formData.description?.trim() || '',
    navigationScopes: formData.navigationScopes,
    isSubRole: true,
  };
}

function NavigationScopeSelector({ value = [], onChange, disabled }) {
  const selected = new Set(value);

  const toggle = (scopeId) => {
    if (disabled) return;
    if (selected.has(scopeId)) {
      onChange(value.filter((id) => id !== scopeId));
    } else {
      onChange([...value, scopeId]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {NGO_SUBROLE_NAV_SCOPES.map((option) => {
        const Icon = option.icon;
        const isSelected = selected.has(option.id);
        return (
          <label
            key={option.id}
            className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all ${
              disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-blue-300'
            } ${
              isSelected
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-gray-200 bg-white'
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggle(option.id)}
              disabled={disabled}
              className="sr-only"
            />
            <div className="flex gap-3 w-full">
              <div
                className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{option.label}</div>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                  Users with this sub-role will see this in the sidebar
                </p>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

export default function Roles() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterBranch, setFilterBranch] = useState('');

  const listParams = useMemo(() => {
    const filters = {};
    if (filterOrg) filters.organizationId = filterOrg;
    return filters;
  }, [filterOrg]);

  const { data: organizations = [] } = useGetNgoOrganizationsQuery();
  const { tenantOrganizationId, tenantOrganizationName } = resolveNgoTenantOrganization(organizations);
  const activeOrganizationId = formData.organizationId || tenantOrganizationId;

  const branchListParams = useMemo(() => {
    const filters = {};
    if (activeOrganizationId) filters.organizationId = activeOrganizationId;
    return filters;
  }, [activeOrganizationId]);
  const { data: allBranches = [] } = useGetNgoBranchesQuery(listParams);
  const { data: formBranches = [] } = useGetNgoBranchesQuery(branchListParams, {
    skip: !activeOrganizationId,
  });
  const {
    data: rawRoles = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetNgoRolesQuery(listParams);

  const [createRole, { isLoading: creating }] = useCreateNgoRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateNgoRoleMutation();
  const [deleteRole] = useDeleteNgoRoleMutation();

  const saving = creating || updating;
  const roles = useMemo(() => {
    const list = [...(rawRoles || [])].filter((role) => role.isSubRole === true);
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [rawRoles]);

  const errorMessage = error
    ? getNgoErrorMessage(error, 'Failed to fetch roles')
    : null;

  const orgById = useMemo(
    () => Object.fromEntries(organizations.map((o) => [o.id, o])),
    [organizations]
  );

  const branchById = useMemo(
    () => Object.fromEntries(allBranches.map((b) => [b.id, b])),
    [allBranches]
  );

  const handleAdd = () => {
    setModalMode('add');
    setSelectedRole(null);
    setFormData({
      ...EMPTY_FORM,
      organizationId: tenantOrganizationId,
      branchId: filterBranch || '',
    });
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setModalMode('edit');
    setSelectedRole(role);
    setFormData({ ...normalizeRole(role), organizationId: tenantOrganizationId });
    setShowModal(true);
  };

  const handleView = (role) => {
    setModalMode('view');
    setSelectedRole(role);
    setFormData({ ...normalizeRole(role), organizationId: tenantOrganizationId });
    setShowModal(true);
  };

  const handleDelete = async (role) => {
    if (role.isSystemRole) {
      alert('System roles cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete sub-role "${role.name}"?`)) return;
    try {
      await deleteRole(role.id).unwrap();
    } catch (err) {
      alert('Failed to delete role: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const handleSave = async () => {
    if (!formData.branchId) {
      alert('Please select a branch for this sub-role.');
      return;
    }
    if (!formData.name?.trim()) {
      alert('Role name is required.');
      return;
    }
    if (!formData.navigationScopes?.length) {
      alert('Select at least one navigation scope.');
      return;
    }

    try {
      const payload = rolePayload(formData);
      if (modalMode === 'add') {
        await createRole(payload).unwrap();
      } else {
        await updateRole({ id: selectedRole.id, ...payload }).unwrap();
      }
      setShowModal(false);
    } catch (err) {
      alert('Failed to save role: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const modalCopy =
    ngoEntityModalCopy('Sub-Role', modalMode, tenantOrganizationName) ||
    ngoModalCopy('Sub-Role', modalMode);

  const filteredRoles = roles.filter((role) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      role.name?.toLowerCase().includes(term) ||
      role.description?.toLowerCase().includes(term) ||
      formatNavigationScopeLabels(role.navigationScopes).toLowerCase().includes(term) ||
      branchById[role.branchId]?.name?.toLowerCase().includes(term);
    const matchesBranch = !filterBranch || role.branchId === filterBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Roles</h1>
          <p className="text-gray-600 mt-1">
            Create branch sub-roles and choose which sidebar modules assigned users can access
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Add Role</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search sub-roles..."
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Branches</option>
            {allBranches
              .filter((b) => !filterOrg || b.organizationId === filterOrg)
              .map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
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
            <span className="text-gray-600">Loading sub-roles...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub-Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Navigation Scopes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                          <ShieldCheck className="text-violet-600" size={20} />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {orgById[role.organizationId]?.name || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-800">
                        <GitBranch size={12} />
                        {branchById[role.branchId]?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      {formatNavigationScopeLabels(role.navigationScopes)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {role.description || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(role)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(role)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(role)}
                          disabled={role.isSystemRole}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                          title={role.isSystemRole ? 'System roles cannot be deleted' : 'Delete'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRoles.length === 0 && !loading && (
              <div className="text-center py-12">
                <ShieldCheck className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No sub-roles found</p>
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
        saveLabel="Save Role"
        maxWidth="3xl"
      >
        <div className="space-y-6">
          <NGOFormGrid>
            <NGOFormField label="Branch" required colSpan={2}>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                disabled={modalMode === 'view' || !activeOrganizationId}
                className={NGO_INPUT_CLASS}
              >
                <option value="">Select branch</option>
                {formBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </NGOFormField>

            <NGOFormField label="Role Name" required colSpan={2}>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={modalMode === 'view'}
                className={NGO_INPUT_CLASS}
                placeholder="e.g. Branch Finance Officer, Field Programs Lead"
              />
            </NGOFormField>

            <NGOFormField label="Description" colSpan={2}>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={modalMode === 'view'}
                rows={3}
                className={NGO_INPUT_CLASS}
                placeholder="What this sub-role is responsible for"
              />
            </NGOFormField>
          </NGOFormGrid>

          <NGOFormField
            label="Navigation Scopes"
            required
            hint="Select one or more sidebar modules. Users assigned this sub-role will only see these items when they sign in."
          >
            <NavigationScopeSelector
              value={formData.navigationScopes}
              onChange={(navigationScopes) => setFormData({ ...formData, navigationScopes })}
              disabled={modalMode === 'view'}
            />
          </NGOFormField>
        </div>
      </NGOModal>
    </div>
  );
}
