import React, { useMemo, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  UserCheck,
  UserX,
  Shield,
  Building2,
  GitBranch,
  Briefcase
} from 'lucide-react';
import {
  useGetNgoUsersQuery,
  useGetNgoOrganizationsQuery,
  useGetNgoBranchesQuery,
  useGetNgoDepartmentsQuery,
  useGetNgoRolesQuery,
  useCreateNgoUserMutation,
  useUpdateNgoUserMutation,
  useDeleteNgoUserMutation,
  useActivateNgoUserMutation,
  useSuspendNgoUserMutation,
  getNgoErrorMessage,
} from '../../store/actions/ngo.js';
import NGOModal, { NGOFormGrid, NGOFormField, NGO_INPUT_CLASS, ngoModalCopy } from '../../components/ngo/NGOModal';
import { resolveNgoTenantOrganization, ngoEntityModalCopy } from '../../utils/ngoTenant.js';

const ACCOUNT_STATUSES = ['Invited', 'Active', 'Suspended', 'Locked'];

const EMPTY_FORM = {
  organizationId: '',
  staffId: '',
  fullName: '',
  email: '',
  phone: '',
  jobTitle: '',
  departmentId: '',
  branchId: '',
  roleId: '',
  roleName: '',
  permissions: ['organization'],
  accessScope: 'Organization',
  accountStatus: 'Invited',
  mfaRequired: false,
  invitedBy: '',
  approvedBy: '',
  notes: ''
};

function normalizeStaff(user) {
  if (!user) return EMPTY_FORM;
  return {
    organizationId: user.organizationId || '',
    staffId: user.staffId || '',
    fullName: user.fullName || user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    jobTitle: user.jobTitle || '',
    departmentId: user.departmentId || '',
    branchId: user.branchId || '',
    roleId: user.roleId || '',
    roleName: user.roleName || '',
    permissions: Array.isArray(user.permissions) ? user.permissions : ['organization'],
    accessScope: user.accessScope || 'Organization',
    accountStatus: user.accountStatus || user.status || 'Invited',
    mfaRequired: Boolean(user.mfaRequired),
    invitedBy: user.invitedBy || '',
    approvedBy: user.approvedBy || '',
    notes: user.notes || ''
  };
}

function staffPayload(formData) {
  return {
    organizationId: formData.organizationId,
    staffId: formData.staffId?.trim() || '',
    fullName: formData.fullName?.trim(),
    email: formData.email?.trim(),
    phone: formData.phone?.trim() || '',
    jobTitle: formData.jobTitle?.trim() || '',
    departmentId: formData.departmentId || '',
    branchId: formData.branchId || '',
    roleId: formData.roleId || '',
    roleName: formData.roleName?.trim() || '',
    permissions: formData.permissions || [],
    accessScope: formData.accessScope || 'Organization',
    accountStatus: formData.accountStatus || 'Invited',
    mfaRequired: Boolean(formData.mfaRequired),
    invitedBy: formData.invitedBy?.trim() || '',
    approvedBy: formData.approvedBy?.trim() || '',
    notes: formData.notes?.trim() || ''
  };
}

function statusBadgeClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return 'bg-green-100 text-green-700';
  if (s === 'invited') return 'bg-blue-100 text-blue-700';
  if (s === 'suspended' || s === 'locked') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
}

export default function Staff() {
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState('');

  const [filterOrg, setFilterOrg] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const listParams = useMemo(() => {
    const filters = {};
    if (filterOrg) filters.organizationId = filterOrg;
    if (filterBranch) filters.branchId = filterBranch;
    if (filterDept) filters.departmentId = filterDept;
    if (filterStatus) filters.accountStatus = filterStatus;
    return filters;
  }, [filterOrg, filterBranch, filterDept, filterStatus]);

  const filterDeptParams = useMemo(() => {
    const filters = {};
    if (filterOrg) filters.organizationId = filterOrg;
    if (filterBranch) filters.branchId = filterBranch;
    return filters;
  }, [filterOrg, filterBranch]);

  const { data: organizations = [] } = useGetNgoOrganizationsQuery();
  const { tenantOrganizationId, tenantOrganizationName } = resolveNgoTenantOrganization(organizations);
  const activeOrganizationId = formData.organizationId || tenantOrganizationId;

  const formDeptParams = useMemo(() => {
    const filters = {};
    if (activeOrganizationId) filters.organizationId = activeOrganizationId;
    if (formData.branchId) filters.branchId = formData.branchId;
    return filters;
  }, [activeOrganizationId, formData.branchId]);
  const { data: allBranches = [] } = useGetNgoBranchesQuery();
  const { data: allDepartments = [] } = useGetNgoDepartmentsQuery();
  const {
    data: staffList = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetNgoUsersQuery(listParams);

  const { data: filterBranches = [] } = useGetNgoBranchesQuery(
    { organizationId: filterOrg },
    { skip: !filterOrg }
  );

  const { data: filterDepartments = [] } = useGetNgoDepartmentsQuery(
    filterDeptParams,
    { skip: !filterOrg }
  );

  const { data: formBranches = [] } = useGetNgoBranchesQuery(
    { organizationId: activeOrganizationId },
    { skip: !showStaffModal || !activeOrganizationId }
  );

  const { data: formRoles = [] } = useGetNgoRolesQuery(
    { organizationId: activeOrganizationId },
    { skip: !showStaffModal || !activeOrganizationId }
  );

  const { data: formDepartments = [] } = useGetNgoDepartmentsQuery(
    formDeptParams,
    { skip: !showStaffModal || !activeOrganizationId }
  );

  const [createUser, { isLoading: creating }] = useCreateNgoUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateNgoUserMutation();
  const [deleteUser] = useDeleteNgoUserMutation();
  const [activateUser] = useActivateNgoUserMutation();
  const [suspendUser] = useSuspendNgoUserMutation();

  const saving = creating || updating;
  const errorMessage = error
    ? getNgoErrorMessage(error, 'Failed to fetch staff')
    : null;

  const orgById = useMemo(
    () => Object.fromEntries(organizations.map((o) => [o.id, o])),
    [organizations]
  );

  const branchById = useMemo(() => {
    const merged = [...allBranches, ...filterBranches, ...formBranches];
    return Object.fromEntries(merged.map((b) => [b.id, b]));
  }, [allBranches, filterBranches, formBranches]);

  const deptById = useMemo(() => {
    const merged = [...allDepartments, ...filterDepartments, ...formDepartments];
    return Object.fromEntries(merged.map((d) => [d.id, d]));
  }, [allDepartments, filterDepartments, formDepartments]);

  const assignableRoles = useMemo(
    () =>
      formRoles.filter(
        (role) =>
          role.isSubRole === true &&
          (!formData.branchId || role.branchId === formData.branchId)
      ),
    [formRoles, formData.branchId]
  );

  const roleById = useMemo(
    () => Object.fromEntries(formRoles.map((r) => [r.id, r])),
    [formRoles]
  );

  const handleFormBranchChange = (branchId) => {
    setFormData({
      ...formData,
      branchId,
      departmentId: ''
    });
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedStaff(null);
    setFormData({
      ...EMPTY_FORM,
      organizationId: tenantOrganizationId,
      branchId: filterBranch || '',
      departmentId: filterDept || ''
    });
    setShowStaffModal(true);
  };

  const handleEdit = (member) => {
    setModalMode('edit');
    setSelectedStaff(member);
    setFormData({ ...normalizeStaff(member), organizationId: tenantOrganizationId });
    setShowStaffModal(true);
  };

  const handleView = (member) => {
    setModalMode('view');
    setSelectedStaff(member);
    setFormData({ ...normalizeStaff(member), organizationId: tenantOrganizationId });
    setShowStaffModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this staff member from the system?')) return;
    try {
      await deleteUser(id).unwrap();
    } catch (err) {
      alert('Failed to delete: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const handleActivate = async (member) => {
    try {
      await activateUser({ id: member.id }).unwrap();
    } catch (err) {
      alert('Failed to activate: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const handleSuspend = async (member) => {
    const reason = window.prompt('Suspension reason (optional):') || '';
    try {
      await suspendUser({ id: member.id, reason }).unwrap();
    } catch (err) {
      alert('Failed to suspend: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const handleSave = async () => {
    if (!formData.fullName?.trim() || !formData.email?.trim()) {
      alert('Full name and email are required.');
      return;
    }

    if (modalMode === 'add') {
      if (!formData.branchId || !formData.departmentId) {
        alert('Branch and department are required when adding staff.');
        return;
      }
    }

    try {
      const payload = staffPayload({
        ...formData,
        organizationId: formData.organizationId || tenantOrganizationId,
      });
      if (modalMode === 'add') {
        const result = await createUser(payload).unwrap();
        const emailWasSent = result.emailSent === true || result.invitationEmailSent === true;
        if (emailWasSent) {
          alert('Staff member created. Login credentials were sent to their email.');
        } else {
          alert(
            result.emailError
              ? `Staff member created, but the credentials email was not sent: ${result.emailError}`
              : 'Staff member created, but the credentials email was not sent. Restart the backend server and confirm MAILTRAP_TOKEN and MAILTRAP_FROM_EMAIL are set in backend/.env.'
          );
        }
      } else {
        await updateUser({ id: selectedStaff.id, ...payload }).unwrap();
      }
      setShowStaffModal(false);
    } catch (err) {
      alert('Failed to save: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const handleRoleChange = (roleId) => {
    const role = assignableRoles.find((r) => r.id === roleId) || formRoles.find((r) => r.id === roleId);
    setFormData({
      ...formData,
      roleId,
      roleName: role?.name || '',
      permissions: role?.permissions?.length ? [...role.permissions] : formData.permissions
    });
  };

  const modalCopy =
    ngoEntityModalCopy('Staff Member', modalMode, tenantOrganizationName) ||
    ngoModalCopy('Staff Member', modalMode);

  const filteredStaff = staffList.filter((member) => {
    const term = searchTerm.toLowerCase();
    return (
      member.fullName?.toLowerCase().includes(term) ||
      member.email?.toLowerCase().includes(term) ||
      member.jobTitle?.toLowerCase().includes(term) ||
      member.roleName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Staff</h1>
          <p className="text-gray-600 mt-1">
            View all staff members — optionally filter by organization, branch, or department
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap"
        >
          <Plus size={20} />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, role..."
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
              setFilterDept('');
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
            onChange={(e) => {
              setFilterBranch(e.target.value);
              setFilterDept('');
            }}
            disabled={!filterOrg}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          >
            <option value="">All Branches</option>
            {filterBranches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            disabled={!filterOrg}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          >
            <option value="">All Departments</option>
            {filterDepartments
              .filter((d) => !filterBranch || d.branchId === filterBranch)
              .map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {ACCOUNT_STATUSES.map((s) => (
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
            <span className="text-gray-600">Loading staff...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {member.fullName || '—'}
                          </div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                          {member.jobTitle && (
                            <div className="text-xs text-gray-400">{member.jobTitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {orgById[member.organizationId]?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {member.roleName || roleById[member.roleId]?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {deptById[member.departmentId]?.name || '—'}
                      {member.branchId && branchById[member.branchId]?.name && (
                        <div className="text-xs text-gray-500">
                          {branchById[member.branchId].name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {member.accessScope || '—'}
                      {member.mfaRequired && (
                        <div className="text-xs text-indigo-600 flex items-center gap-1 mt-1">
                          <Shield size={12} /> MFA
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadgeClass(
                          member.accountStatus
                        )}`}
                      >
                        {member.accountStatus || 'Invited'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleView(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(member)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        {member.accountStatus !== 'Active' && (
                          <button
                            type="button"
                            onClick={() => handleActivate(member)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Activate"
                          >
                            <UserCheck size={18} />
                          </button>
                        )}
                        {member.accountStatus !== 'Suspended' && (
                          <button
                            type="button"
                            onClick={() => handleSuspend(member)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Suspend"
                          >
                            <UserX size={18} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(member.id)}
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

            {filteredStaff.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No staff found</p>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add first staff member
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <NGOModal
        open={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        mode={modalMode}
        title={modalCopy.title}
        subtitle={modalCopy.subtitle}
        onSave={handleSave}
        saving={saving}
        saveLabel="Save Staff Member"
        maxWidth="4xl"
      >
        <NGOFormGrid>
          {(modalMode === 'add' || modalMode === 'edit') && (
            <>
              <NGOFormField label="Branch" required>
                <select
                  value={formData.branchId}
                  onChange={(e) => handleFormBranchChange(e.target.value)}
                  disabled={modalMode === 'view' || !activeOrganizationId}
                  className={NGO_INPUT_CLASS}
                >
                  <option value="">Select branch</option>
                  {formBranches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </NGOFormField>
              <NGOFormField label="Department" required>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  disabled={modalMode === 'view' || !formData.branchId}
                  className={NGO_INPUT_CLASS}
                >
                  <option value="">Select department</option>
                  {formDepartments
                    .filter((d) => d.branchId === formData.branchId)
                    .map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
              </NGOFormField>
            </>
          )}

          {modalMode === 'view' && (
            <div className="md:col-span-2 rounded-lg bg-blue-50 border border-blue-100 p-4">
              <p className="text-xs font-semibold text-blue-800 uppercase mb-2">Placement</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-800">
                <span className="flex items-center gap-1.5">
                  <Building2 size={16} className="text-blue-600" />
                  {orgById[formData.organizationId]?.name || '—'}
                </span>
                <span className="flex items-center gap-1.5">
                  <GitBranch size={16} className="text-green-600" />
                  {branchById[formData.branchId]?.name || '—'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase size={16} className="text-indigo-600" />
                  {deptById[formData.departmentId]?.name || '—'}
                </span>
              </div>
            </div>
          )}

          <NGOFormField label="Full Name" required>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
              placeholder="Full legal name"
            />
          </NGOFormField>

          <NGOFormField label="Email" required>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
              placeholder="user@organization.org"
            />
          </NGOFormField>

          <NGOFormField label="Phone">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
            />
          </NGOFormField>

          <NGOFormField label="Job Title">
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
              placeholder="e.g. Program Manager"
            />
          </NGOFormField>

          <NGOFormField label="Staff ID" hint="Optional internal staff reference">
            <input
              type="text"
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
            />
          </NGOFormField>

          <NGOFormField label="Role">
            <select
              value={formData.roleId}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
            >
              <option value="">Select role</option>
              {assignableRoles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </NGOFormField>

          <NGOFormField label="Notes" colSpan={2}>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={modalMode === 'view'}
              rows={2}
              className={NGO_INPUT_CLASS}
              placeholder="Internal notes about this user"
            />
          </NGOFormField>
        </NGOFormGrid>
      </NGOModal>
    </div>
  );
}
