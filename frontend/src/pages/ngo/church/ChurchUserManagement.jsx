import React, { useMemo, useState } from 'react';
import {
  Edit,
  Loader2,
  Mail,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
} from 'lucide-react';
import NGOModal, { NGOFormField, NGOFormGrid, NGO_INPUT_CLASS } from '../../../components/ngo/NGOModal.jsx';
import {
  CHURCH_TAB_SCOPES,
  formatChurchScopeLabels,
} from '../../../config/churchNavigationScopes.js';
import {
  useCreateNgoChurchUserMutation,
  useDeleteNgoChurchUserMutation,
  useGetNgoChurchRecordsQuery,
  useGetNgoChurchUsersQuery,
  useResendNgoChurchUserCredentialsMutation,
  useUpdateNgoChurchUserMutation,
  getNgoErrorMessage,
} from '../../../store/actions/ngo.js';
import { usePopup } from '../../../context/PopupContext.jsx';
import ChurchMemberSummaryCard from './ChurchMemberSummaryCard.jsx';
import { formatChurchMemberName, formatChurchMemberOption } from './churchMemberUtils.js';

const EMPTY_FORM = {
  churchMemberId: '',
  jobTitle: 'Church Staff',
  churchNavigationScopes: [],
  notes: '',
};

function ChurchScopeSelector({ value = [], onChange, disabled }) {
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
      {CHURCH_TAB_SCOPES.map((option) => {
        const Icon = option.icon;
        const isSelected = selected.has(option.id);
        return (
          <label
            key={option.id}
            className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all ${
              disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-emerald-300'
            } ${
              isSelected
                ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
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
                  isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{option.label}</div>
                <p className="text-xs text-gray-500 mt-0.5">
                  User can open this tab in Church Management
                </p>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

function ChurchUserAccountCard({ user, member }) {
  if (!user) return null;

  const rows = [
    { label: 'Name', value: user.fullName },
    { label: 'Email', value: user.email },
    { label: 'Phone', value: user.phone },
    { label: 'Job title', value: user.jobTitle },
    { label: 'Status', value: user.accountStatus || 'Invited' },
  ].filter((row) => row.value);

  return (
    <div className="space-y-4">
      {member ? <ChurchMemberSummaryCard member={member} title="Linked member" /> : null}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-3">
          Account
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-medium text-gray-500">{row.label}</dt>
              <dd className="text-sm font-medium text-gray-900 wrap-break-word">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default function ChurchUserManagement() {
  const { toast } = usePopup();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: users = [], isLoading, refetch } = useGetNgoChurchUsersQuery();
  const { data: churchMembers = [], isLoading: loadingMembers } = useGetNgoChurchRecordsQuery({
    domain: 'members',
    recordType: 'member',
  });
  const [createUser, { isLoading: creating }] = useCreateNgoChurchUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateNgoChurchUserMutation();
  const [deleteUser] = useDeleteNgoChurchUserMutation();
  const [resendCredentials, { isLoading: resending }] = useResendNgoChurchUserCredentialsMutation();

  const memberById = useMemo(
    () => Object.fromEntries(churchMembers.map((m) => [m.id, m])),
    [churchMembers]
  );

  const linkedMemberIds = useMemo(
    () => new Set(users.map((u) => u.churchMemberId).filter(Boolean)),
    [users]
  );

  const linkedEmails = useMemo(
    () => new Set(users.map((u) => (u.email || '').toLowerCase()).filter(Boolean)),
    [users]
  );

  const availableMembers = useMemo(() => {
    return [...churchMembers]
      .filter((member) => {
        if (!(member.email || '').trim()) return false;
        if (linkedMemberIds.has(member.id)) return false;
        const email = member.email.trim().toLowerCase();
        if (linkedEmails.has(email)) return false;
        return true;
      })
      .sort((a, b) => formatChurchMemberName(a).localeCompare(formatChurchMemberName(b)));
  }, [churchMembers, linkedMemberIds, linkedEmails]);

  const selectedMember = form.churchMemberId ? memberById[form.churchMemberId] : null;
  const editingMember = editing?.churchMemberId ? memberById[editing.churchMemberId] : null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setForm({
      churchMemberId: user.churchMemberId || '',
      jobTitle: user.jobTitle || 'Church Staff',
      churchNavigationScopes: [...(user.churchNavigationScopes || [])],
      notes: user.notes || '',
    });
    setEditing(user);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.churchNavigationScopes.length) {
      toast.error('Select at least one church module');
      return;
    }

    if (!editing?.id) {
      if (!form.churchMemberId) {
        toast.error('Select a church member');
        return;
      }
      const member = memberById[form.churchMemberId];
      if (!member?.email?.trim()) {
        toast.error('Selected member must have an email on their registration');
        return;
      }
    }

    try {
      if (editing?.id) {
        await updateUser({
          id: editing.id,
          jobTitle: form.jobTitle.trim(),
          churchNavigationScopes: form.churchNavigationScopes,
          notes: form.notes.trim(),
        }).unwrap();
        toast.success('Church user updated');
      } else {
        const result = await createUser({
          churchMemberId: form.churchMemberId,
          jobTitle: form.jobTitle.trim(),
          churchNavigationScopes: form.churchNavigationScopes,
          notes: form.notes.trim(),
        }).unwrap();
        if (result.emailSent === false && result.emailError) {
          toast.error(`User created but email failed: ${result.emailError}`);
        } else {
          toast.success('Church user created — login credentials sent by email');
        }
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getNgoErrorMessage(err, 'Failed to save church user'));
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Remove church user ${user.fullName}?`)) return;
    try {
      await deleteUser(user.id).unwrap();
      toast.success('Church user removed');
    } catch (err) {
      toast.error(getNgoErrorMessage(err, 'Failed to remove user'));
    }
  };

  const handleResend = async (user) => {
    try {
      const result = await resendCredentials(user.id).unwrap();
      if (result.emailSent === false) {
        toast.error(result.emailError || 'Failed to send credentials');
      } else {
        toast.success('Credentials email sent');
      }
    } catch (err) {
      toast.error(getNgoErrorMessage(err, 'Failed to resend credentials'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">User Management</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Grant church staff access by choosing a registered member, assigning modules, and
            sending login credentials to their email.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={16} />
          Add church user
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${NGO_INPUT_CLASS} pl-9`}
        />
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            No church users yet. Add a user to delegate access to specific church modules.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Modules
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px]">
                      {formatChurchScopeLabels(user.churchNavigationScopes)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {user.accountStatus || 'Invited'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleResend(user)}
                        disabled={resending}
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded"
                        title="Resend credentials"
                      >
                        <Mail size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="p-1.5 text-gray-500 hover:text-emerald-700 rounded ml-1"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        className="p-1.5 text-gray-500 hover:text-red-600 rounded ml-1"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NGOModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit church user' : 'Add church user'}
        subtitle={
          editing
            ? 'Update module access and job details'
            : 'Choose a registered member — credentials will be emailed after save'
        }
        onSave={handleSave}
        saving={creating || updating}
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {editing ? (
            <ChurchUserAccountCard user={editing} member={editingMember} />
          ) : (
            <>
              <NGOFormGrid>
                <NGOFormField label="Church member" required colSpan={2}>
                  <select
                    className={NGO_INPUT_CLASS}
                    value={form.churchMemberId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, churchMemberId: e.target.value }))
                    }
                    disabled={loadingMembers}
                  >
                    <option value="">
                      {loadingMembers
                        ? 'Loading members…'
                        : availableMembers.length
                          ? 'Select a member…'
                          : 'No eligible members — register members with email first'}
                    </option>
                    {availableMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {formatChurchMemberOption(member)}
                      </option>
                    ))}
                  </select>
                </NGOFormField>
              </NGOFormGrid>

              {selectedMember ? (
                <ChurchMemberSummaryCard member={selectedMember} title="Member details" />
              ) : (
                <p className="text-sm text-gray-500 rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center">
                  Select a member to preview their registration details. The member must have an
                  email on file to receive login credentials.
                </p>
              )}
            </>
          )}

          <NGOFormGrid>
            <NGOFormField label="Job title">
              <input
                className={NGO_INPUT_CLASS}
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              />
            </NGOFormField>
            <NGOFormField label="Notes" colSpan={2}>
              <textarea
                className={NGO_INPUT_CLASS}
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </NGOFormField>
          </NGOFormGrid>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Shield size={16} className="text-emerald-600" />
              Church module access *
            </p>
            <ChurchScopeSelector
              value={form.churchNavigationScopes}
              onChange={(churchNavigationScopes) => setForm({ ...form, churchNavigationScopes })}
            />
          </div>

          {!editing ? (
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <UserCheck size={14} />
              A temporary password will be emailed to the member&apos;s registration email after you
              save.
            </p>
          ) : null}
        </div>
      </NGOModal>
    </div>
  );
}
