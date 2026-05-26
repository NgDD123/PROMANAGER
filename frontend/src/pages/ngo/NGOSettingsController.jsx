import React, { useEffect, useMemo, useState } from 'react';
import { Settings, Lock, Unlock, Trash2, Edit3, Save, CheckCircle2, AlertTriangle, Users, ShieldCheck, RefreshCw } from 'lucide-react';

import {
  useGetNgoUsersQuery,
  useCreateNgoUserMutation,
  useUpdateNgoUserMutation,
  useDeleteNgoUserMutation,
  useActivateNgoUserMutation,
  useSuspendNgoUserMutation,
  getNgoErrorMessage,
} from '../../store/actions/ngo.js';
import { BASE_API_URL } from '../../utils/config/keys.js';

const permissionOptions = ['organization', 'projects', 'donors', 'beneficiaries', 'volunteers', 'church', 'finance', 'grants', 'gis', 'reports', 'users'];

const blankUser = {
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
  mfaRequired: true,
  invitedBy: '',
  approvedBy: '',
  notes: ''
};

const createSettingId = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function NGOSettingsController({ workspace, updateWorkspace, currentOrganization }) {
  const [settingsSection, setSettingsSection] = useState('users');
  const [userForm, setUserForm] = useState({ ...blankUser, organizationId: currentOrganization?.id || '' });
  const [apiStatus, setApiStatus] = useState('Backend sync not started');

  const {
    data: backendUsers,
    isFetching,
    isError,
    error: usersError,
    refetch: syncUsersFromBackend,
  } = useGetNgoUsersQuery(
    { organizationId: currentOrganization?.id },
    { skip: !currentOrganization?.id }
  );

  const [createUser] = useCreateNgoUserMutation();
  const [updateUser] = useUpdateNgoUserMutation();
  const [deleteUser] = useDeleteNgoUserMutation();
  const [activateUser] = useActivateNgoUserMutation();
  const [suspendUser] = useSuspendNgoUserMutation();

  const scopedUsers = useMemo(
    () => (workspace.users || []).filter(user => !user.organizationId || user.organizationId === currentOrganization?.id),
    [currentOrganization?.id, workspace.users]
  );

  const scopedStaff = useMemo(
    () => (workspace.staff || []).filter(member => {
      const branch = (workspace.branches || []).find(item => item.id === member.branchId);
      return !member.organizationId || member.organizationId === currentOrganization?.id || branch?.organizationId === currentOrganization?.id;
    }),
    [currentOrganization?.id, workspace.branches, workspace.staff]
  );

  const scopedRoles = useMemo(
    () => (workspace.roles || []).filter(role => !role.organizationId || role.organizationId === currentOrganization?.id),
    [currentOrganization?.id, workspace.roles]
  );

  const branchById = useMemo(
    () => Object.fromEntries((workspace.branches || []).map(branch => [branch.id, branch])),
    [workspace.branches]
  );

  const departmentById = useMemo(
    () => Object.fromEntries((workspace.departments || []).map(department => [department.id, department])),
    [workspace.departments]
  );

  const roleById = useMemo(
    () => Object.fromEntries(scopedRoles.map(role => [role.id, role])),
    [scopedRoles]
  );

  const features = [
    { id: 'users', label: 'Users', description: 'System users, access status, MFA, and backend account permissions', count: scopedUsers.length, restricted: false },
    { id: 'organizations', label: 'Organizations', description: 'Multi-NGO/Church management', count: workspace.organizations?.length || 0, restricted: false },
    { id: 'branches', label: 'Branches', description: 'Headquarters, regional offices, church branches', count: workspace.branches?.length || 0, restricted: false },
    { id: 'departments', label: 'Departments', description: 'Department structure and budgets', count: workspace.departments?.length || 0, restricted: false },
    { id: 'staff', label: 'Staff', description: 'Staff organizational chart', count: workspace.staff?.length || 0, restricted: false },
    { id: 'roles', label: 'Roles', description: 'User roles and permissions', count: workspace.roles?.length || 0, restricted: false },
    { id: 'grants', label: 'Grants', description: 'Grant management and compliance', count: workspace.grants?.length || 0, restricted: false },
    { id: 'payrollRuns', label: 'Payroll', description: 'Payroll processing and approvals', count: workspace.payrollRuns?.length || 0, restricted: false },
    { id: 'donorReports', label: 'Donor Reports', description: 'Financial donor reporting', count: workspace.donorReports?.length || 0, restricted: false },
    { id: 'chartOfAccounts', label: 'Chart of Accounts', description: 'GL account structure', count: workspace.chartOfAccounts?.length || 0, restricted: false },
    { id: 'bankAccounts', label: 'Bank Accounts', description: 'Bank and cash accounts', count: workspace.bankAccounts?.length || 0, restricted: false },
    { id: 'payments', label: 'Payments', description: 'Payment vouchers', count: workspace.payments?.length || 0, restricted: false },
    { id: 'journalEntries', label: 'Journal Entries', description: 'Double-entry accounting', count: workspace.journalEntries?.length || 0, restricted: false },
    { id: 'beneficialOwners', label: 'Beneficial Owners', description: 'KYC, governance control, and transparency register', count: workspace.beneficialOwners?.length || 0, restricted: false },
    { id: 'projects', label: 'Projects', description: 'Program and project portfolio models', count: workspace.projects?.length || 0, restricted: false },
    { id: 'tenders', label: 'Tenders', description: 'Procurement tenders and evaluation methods', count: workspace.tenders?.length || 0, restricted: false },
    { id: 'contracts', label: 'Contracts', description: 'Professional contract register', count: workspace.contracts?.length || 0, restricted: false },
    { id: 'storages', label: 'Storages', description: 'Physical and digital document repositories', count: workspace.storages?.length || 0, restricted: false },
    { id: 'impacts', label: 'Impacts', description: 'Outcome indicators and verified results', count: workspace.impacts?.length || 0, restricted: false },
    { id: 'evaluations', label: 'Evaluations', description: 'Baseline, midline, final, and learning reviews', count: workspace.evaluations?.length || 0, restricted: false },
    { id: 'fieldSites', label: 'Field Sites', description: 'GIS project locations', count: workspace.fieldSites?.length || 0, restricted: false },
    { id: 'fieldVisits', label: 'Field Visits', description: 'Field visit tracking', count: workspace.fieldVisits?.length || 0, restricted: false },
    { id: 'serviceControls', label: 'Service Controls', description: 'Multi-service management', count: workspace.serviceControls?.length || 0, restricted: false },
    { id: 'languages', label: 'Languages', description: 'Multi-language support', count: workspace.languages?.length || 0, restricted: false },
    { id: 'currencies', label: 'Currencies', description: 'Multi-currency support', count: workspace.currencies?.length || 0, restricted: false }
  ];

  const settingsSections = [
    { id: 'users', label: 'Users & Access', icon: Users },
    { id: 'features', label: 'Feature Controls', icon: Settings },
    { id: 'security', label: 'Security Summary', icon: ShieldCheck }
  ];

  useEffect(() => {
    setUserForm(form => ({ ...form, organizationId: currentOrganization?.id || '' }));
  }, [currentOrganization?.id]);

  useEffect(() => {
    if (!currentOrganization?.id) return;
    if (isFetching) {
      setApiStatus('Syncing users from backend...');
    }
  }, [currentOrganization?.id, isFetching]);

  useEffect(() => {
    if (!currentOrganization?.id || backendUsers === undefined) return;
    updateWorkspace(
      current => ({
        ...current,
        users: [
          ...(current.users || []).filter(user => user.organizationId && user.organizationId !== currentOrganization.id),
          ...backendUsers
        ]
      }),
      'NGO users synced from backend'
    );
    setApiStatus(`Backend synced: ${backendUsers.length} users`);
  }, [backendUsers, currentOrganization?.id, updateWorkspace]);

  useEffect(() => {
    if (isError) {
      setApiStatus(`Backend offline: ${getNgoErrorMessage(usersError, 'Unable to load NGO users')}`);
    }
  }, [isError, usersError]);

  const persistUser = async (record) => {
    const isBackendId = record.id && !record.id.startsWith('user-');
    if (isBackendId) {
      return updateUser({ id: record.id, ...record }).unwrap();
    }
    return createUser(record).unwrap();
  };

  const saveUser = async (event) => {
    event.preventDefault();
    if (!userForm.fullName.trim() || !userForm.email.trim()) return;

    const role = roleById[userForm.roleId];
    const record = {
      ...userForm,
      organizationId: currentOrganization?.id || userForm.organizationId,
      roleName: role?.name || userForm.roleName,
      permissions: userForm.permissions?.length ? userForm.permissions : role?.permissions || []
    };

    let saved = { ...record, id: record.id || createSettingId('user') };
    try {
      saved = await persistUser(saved);
      setApiStatus(`Backend saved user: ${saved.email}`);
    } catch (error) {
      setApiStatus(`Saved locally only: ${error.message}`);
    }

    updateWorkspace(
      current => {
        const exists = (current.users || []).some(user => user.id === saved.id || user.email === saved.email);
        return {
          ...current,
          users: exists
            ? (current.users || []).map(user => user.id === saved.id || user.email === saved.email ? saved : user)
            : [...(current.users || []), saved]
        };
      },
      `User ${record.id ? 'updated' : 'created'}: ${record.email}`
    );
    setUserForm({ ...blankUser, organizationId: currentOrganization?.id || '' });
  };

  const editUser = (user) => {
    setUserForm({ ...blankUser, ...user });
    setSettingsSection('users');
  };

  const updateUserStatus = async (user, accountStatus) => {
    let updated = { ...user, accountStatus };
    try {
      if (accountStatus === 'Active') {
        updated = await activateUser({
          id: user.id,
          approvedBy: currentOrganization?.primaryContact?.name || 'System Admin',
        }).unwrap();
      } else {
        updated = await suspendUser({
          id: user.id,
          approvedBy: currentOrganization?.primaryContact?.name || 'System Admin',
          suspendedBy: currentOrganization?.primaryContact?.name || 'System Admin',
        }).unwrap();
      }
      setApiStatus(`Backend status updated: ${updated.email}`);
    } catch (error) {
      setApiStatus(`Status updated locally only: ${getNgoErrorMessage(error, 'Unable to update user status')}`);
    }

    updateWorkspace(
      current => ({ ...current, users: (current.users || []).map(item => item.id === user.id ? updated : item) }),
      `User ${accountStatus.toLowerCase()}: ${user.email}`
    );
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Remove user ${user.email}?`)) return;
    try {
      if (user.id && !user.id.startsWith('user-')) {
        await deleteUser(user.id).unwrap();
      }
      setApiStatus(`Backend removed user: ${user.email}`);
    } catch (error) {
      setApiStatus(`Removed locally only: ${getNgoErrorMessage(error, 'Unable to remove user')}`);
    }
    updateWorkspace(
      current => ({ ...current, users: (current.users || []).filter(item => item.id !== user.id) }),
      `User removed: ${user.email}`
    );
  };

  const chooseStaff = (staffId) => {
    const staff = scopedStaff.find(member => member.id === staffId);
    setUserForm({
      ...userForm,
      staffId,
      fullName: staff?.name || userForm.fullName,
      email: staff?.email || userForm.email,
      phone: staff?.phone || userForm.phone,
      jobTitle: staff?.role || userForm.jobTitle,
      departmentId: staff?.departmentId || userForm.departmentId,
      branchId: staff?.branchId || userForm.branchId
    });
  };

  const chooseRole = (roleId) => {
    const role = roleById[roleId];
    setUserForm({
      ...userForm,
      roleId,
      roleName: role?.name || '',
      permissions: role?.permissions || userForm.permissions
    });
  };

  const toggleUserPermission = (permission) => {
    const permissions = userForm.permissions || [];
    setUserForm({
      ...userForm,
      permissions: permissions.includes(permission)
        ? permissions.filter(item => item !== permission)
        : [...permissions, permission]
    });
  };

  const toggleRestriction = (featureId) => {
    updateWorkspace(
      current => ({
        ...current,
        featureRestrictions: {
          ...(current.featureRestrictions || {}),
          [featureId]: !(current.featureRestrictions?.[featureId] || false)
        }
      }),
      `Feature ${featureId} restriction toggled`
    );
  };

  const clearFeature = (featureId) => {
    if (!window.confirm(`Clear all ${featureId} data? This cannot be undone.`)) return;
    updateWorkspace(
      current => ({ ...current, [featureId]: [] }),
      `Feature ${featureId} cleared`
    );
  };

  const resetFeature = (featureId) => {
    if (!window.confirm(`Reset ${featureId} to default? This cannot be undone.`)) return;
    const defaults = {
      users: [],
      organizations: [],
      branches: [],
      departments: [],
      staff: [],
      roles: [],
      grants: [],
      payrollRuns: [],
      donorReports: [],
      chartOfAccounts: [],
      bankAccounts: [],
      payments: [],
      journalEntries: [],
      beneficialOwners: [],
      projects: [],
      tenders: [],
      contracts: [],
      storages: [],
      impacts: [],
      evaluations: [],
      fieldSites: [],
      fieldVisits: [],
      serviceControls: [],
      languages: ['English'],
      currencies: ['USD']
    };
    updateWorkspace(
      current => ({ ...current, [featureId]: defaults[featureId] || [] }),
      `Feature ${featureId} reset to default`
    );
  };

  const isRestricted = (featureId) => workspace.featureRestrictions?.[featureId] || false;
  const activeUsers = scopedUsers.filter(user => user.accountStatus === 'Active').length;
  const invitedUsers = scopedUsers.filter(user => user.accountStatus === 'Invited').length;
  const mfaUsers = scopedUsers.filter(user => user.mfaRequired).length;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900">Settings Controller</h4>
            <p className="text-sm text-amber-800 mt-1">
              Control NGO users, roles, permissions, backend access, and module restrictions from one professional settings workspace.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
        <aside className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="space-y-2">
            {settingsSections.map(section => {
              const Icon = section.icon;
              const active = settingsSection === section.id;
              return (
                <button key={section.id} type="button" onClick={() => setSettingsSection(section.id)} className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold ${active ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          {settingsSection === 'users' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <UserMetric label="Total Users" value={scopedUsers.length} />
                <UserMetric label="Active" value={activeUsers} />
                <UserMetric label="Invited" value={invitedUsers} />
                <UserMetric label="MFA Required" value={mfaUsers} />
              </div>

              <form onSubmit={saveUser} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-bold">Create / Update User</h4>
                    <p className="text-sm text-gray-600">{apiStatus}</p>
                  </div>
                  <button type="button" onClick={syncUsersFromBackend} disabled={isFetching} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Sync Backend
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FieldSelect label="Staff Link" value={userForm.staffId} onChange={chooseStaff} options={[{ value: '', label: 'Manual user' }, ...scopedStaff.map(member => ({ value: member.id, label: `${member.name} - ${member.role || 'Staff'}` }))]} />
                  <FieldSelect label="Role" value={userForm.roleId} onChange={chooseRole} options={[{ value: '', label: 'Select role' }, ...scopedRoles.map(role => ({ value: role.id, label: role.name }))]} />
                  <FieldInput label="Full Name" value={userForm.fullName} onChange={value => setUserForm({ ...userForm, fullName: value })} required />
                  <FieldInput label="Email" type="email" value={userForm.email} onChange={value => setUserForm({ ...userForm, email: value })} required />
                  <FieldInput label="Phone" value={userForm.phone} onChange={value => setUserForm({ ...userForm, phone: value })} />
                  <FieldInput label="Job Title" value={userForm.jobTitle} onChange={value => setUserForm({ ...userForm, jobTitle: value })} />
                  <FieldSelect label="Branch" value={userForm.branchId} onChange={value => setUserForm({ ...userForm, branchId: value })} options={[{ value: '', label: 'All branches' }, ...(workspace.branches || []).map(branch => ({ value: branch.id, label: branch.name }))]} />
                  <FieldSelect label="Department" value={userForm.departmentId} onChange={value => setUserForm({ ...userForm, departmentId: value })} options={[{ value: '', label: 'All departments' }, ...(workspace.departments || []).map(department => ({ value: department.id, label: department.name }))]} />
                  <FieldSelect label="Access Scope" value={userForm.accessScope} onChange={value => setUserForm({ ...userForm, accessScope: value })} options={['Organization', 'Branch', 'Department', 'Finance', 'Project', 'Read Only']} />
                  <FieldSelect label="Status" value={userForm.accountStatus} onChange={value => setUserForm({ ...userForm, accountStatus: value })} options={['Invited', 'Active', 'Suspended', 'Locked']} />
                  <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
                    <input type="checkbox" checked={userForm.mfaRequired} onChange={event => setUserForm({ ...userForm, mfaRequired: event.target.checked })} />
                    MFA required
                  </label>
                  <FieldInput label="Notes" value={userForm.notes} onChange={value => setUserForm({ ...userForm, notes: value })} />
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold text-gray-700">Permissions</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {permissionOptions.map(permission => (
                      <label key={permission} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                        <input type="checkbox" checked={(userForm.permissions || []).includes(permission)} onChange={() => toggleUserPermission(permission)} />
                        {permission}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    <Save className="w-4 h-4" />
                    {userForm.id ? 'Update User' : 'Create User'}
                  </button>
                  <button type="button" onClick={() => setUserForm({ ...blankUser, organizationId: currentOrganization?.id || '' })} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    Clear Form
                  </button>
                </div>
              </form>

              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 font-bold">User Access Register</div>
                <div className="max-h-96 overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="sticky top-0 bg-white shadow-sm">
                      <tr>
                        {['User', 'Role', 'Scope', 'Status', 'Actions'].map(column => (
                          <th key={column} className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {scopedUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <div className="font-semibold text-gray-900">{user.fullName}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-3 py-2 text-gray-700">{user.roleName || roleById[user.roleId]?.name || 'Unassigned'}</td>
                          <td className="px-3 py-2 text-gray-700">
                            {user.accessScope}
                            <div className="text-xs text-gray-500">{branchById[user.branchId]?.name || 'All branches'} / {departmentById[user.departmentId]?.name || 'All departments'}</div>
                          </td>
                          <td className="px-3 py-2 text-gray-700">{user.accountStatus}{user.mfaRequired ? ' / MFA' : ''}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-2">
                              <ActionButton label="Edit" onClick={() => editUser(user)} />
                              <ActionButton label="Activate" onClick={() => updateUserStatus(user, 'Active')} disabled={user.accountStatus === 'Active'} positive />
                              <ActionButton label="Suspend" onClick={() => updateUserStatus(user, 'Suspended')} disabled={user.accountStatus === 'Suspended'} />
                              <ActionButton label="Remove" onClick={() => removeUser(user)} danger />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {scopedUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No users for this organization.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {settingsSection === 'features' && (
            <FeatureControls
              features={features}
              isRestricted={isRestricted}
              toggleRestriction={toggleRestriction}
              clearFeature={clearFeature}
              resetFeature={resetFeature}
              updateWorkspace={updateWorkspace}
            />
          )}

          {settingsSection === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SecurityCard title="Access Governance" items={[`${scopedUsers.length} users`, `${scopedRoles.length} roles`, `${features.filter(f => isRestricted(f.id)).length} restricted features`]} />
              <SecurityCard title="Authentication Controls" items={[`${mfaUsers} MFA required`, `${activeUsers} active accounts`, `${invitedUsers} invitations pending`]} />
              <SecurityCard title="Backend Connection" items={[apiStatus, `${BASE_API_URL}/ngo/users`, currentOrganization?.name || 'No organization selected']} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureControls({ features, isRestricted, toggleRestriction, clearFeature, resetFeature, updateWorkspace }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        {features.map(feature => {
          const restricted = isRestricted(feature.id);
          return (
            <div key={feature.id} className={`rounded-lg border p-4 ${restricted ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{feature.label}</h4>
                    {restricted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                        <Lock className="w-3 h-3" />
                        Restricted
                      </span>
                    )}
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                      {feature.count} records
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => toggleRestriction(feature.id)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${restricted ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'}`}>
                    {restricted ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {restricted ? 'Allow' : 'Restrict'}
                  </button>
                  <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <Edit3 className="w-4 h-4" />
                    Modify
                  </button>
                  <button type="button" onClick={() => clearFeature(feature.id)} className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100">
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                  <button type="button" onClick={() => resetFeature(feature.id)} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                    <Settings className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SecurityCard title="System Controls" items={[`${features.length} total features`, `${features.filter(f => isRestricted(f.id)).length} restricted`, `${features.filter(f => !isRestricted(f.id)).length} allowed`, `${features.reduce((sum, f) => sum + f.count, 0)} total records`]} />
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="font-bold mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button type="button" onClick={() => updateWorkspace(current => ({ ...current, featureRestrictions: {} }), 'All features allowed')} className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
              Allow All Features
            </button>
            <button type="button" onClick={() => {
              const restrictions = {};
              features.forEach(feature => { restrictions[feature.id] = true; });
              updateWorkspace(current => ({ ...current, featureRestrictions: restrictions }), 'All features restricted');
            }} className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
              Restrict All Features
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h4 className="font-bold text-emerald-900 mb-3">Professional Controls</h4>
          <div className="space-y-2 text-sm text-emerald-800">
            {['Allow or restrict any feature', 'Manage users and permissions', 'Clear feature data', 'Reset controlled defaults'].map(item => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function FieldInput({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-semibold text-gray-700">{label}</span>
      <input type={type} required={required} value={value || ''} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
    </label>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  const normalized = options.map(option => typeof option === 'string' ? { value: option, label: option } : option);
  return (
    <label className="text-sm">
      <span className="mb-1 block font-semibold text-gray-700">{label}</span>
      <select value={value || ''} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100">
        {normalized.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function UserMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase text-gray-500">{label}</div>
      <div className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function ActionButton({ label, onClick, disabled = false, positive = false, danger = false }) {
  const color = danger
    ? 'border-red-200 text-red-600 hover:bg-red-50'
    : positive
      ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
      : 'border-gray-200 text-gray-700 hover:bg-gray-100';
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`rounded-md border px-2 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${color}`}>
      {label}
    </button>
  );
}

function SecurityCard({ title, items }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="font-bold mb-3">{title}</h4>
      <div className="space-y-2 text-sm text-gray-700">
        {items.map(item => (
          <div key={item} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700 mt-0.5" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
