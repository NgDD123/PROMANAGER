import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Building2,
  KeyRound,
  Edit3,
  Loader2,
} from 'lucide-react';
import NGOModal, { NGOFormGrid, NGOFormField, NGO_INPUT_CLASS } from '../../components/ngo/NGOModal';
import {
  useGetNgoAccountProfileQuery,
  useUpdateNgoAccountProfileMutation,
  useChangeNgoAccountPasswordMutation,
  getNgoErrorMessage,
} from '../../store/actions/ngo.js';
import { getServiceOrganization, getServiceUser, setServiceAuth, getServiceToken } from '../../utils/authCookies.js';
import { usePopup } from '../../context/PopupContext.jsx';
import { formatNavigationScopeLabels } from '../../config/ngoNavigationScopes.js';

const TABS = [
  { id: 'personal', label: 'Personal info' },
  { id: 'account', label: 'Account' },
];

const EMPTY_PROFILE_FORM = {
  fullName: '',
  phone: '',
  jobTitle: '',
};

const EMPTY_PASSWORD_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
        {Icon ? <Icon size={16} className="shrink-0 text-emerald-600" /> : null}
        <span className="break-all">{value || '—'}</span>
      </div>
    </div>
  );
}

export default function Settings() {
  const { toast } = usePopup();
  const organization = getServiceOrganization('ngo');
  const sessionUser = getServiceUser('ngo');

  const [activeTab, setActiveTab] = useState('personal');
  const [editOpen, setEditOpen] = useState(false);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE_FORM);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetNgoAccountProfileQuery();

  const [updateProfile, { isLoading: savingProfile }] = useUpdateNgoAccountProfileMutation();
  const [changePassword, { isLoading: savingPassword }] = useChangeNgoAccountPasswordMutation();

  const displayProfile = profile || sessionUser;

  const scopeLabel = useMemo(() => {
    if (!displayProfile) return '—';
    if (displayProfile.navigationScopes?.length) {
      return formatNavigationScopeLabels(displayProfile.navigationScopes);
    }
    return displayProfile.accessScope || 'Organization';
  }, [displayProfile]);

  useEffect(() => {
    if (!displayProfile) return;
    setProfileForm({
      fullName: displayProfile.fullName || displayProfile.name || '',
      phone: displayProfile.phone || '',
      jobTitle: displayProfile.jobTitle || '',
    });
  }, [displayProfile]);

  const persistSessionUser = (updated) => {
    const token = getServiceToken('ngo');
    if (!token || !updated) return;
    setServiceAuth('ngo', {
      token,
      user: { ...sessionUser, ...updated },
      organization,
    });
  };

  const openEditModal = () => {
    setProfileForm({
      fullName: displayProfile?.fullName || displayProfile?.name || '',
      phone: displayProfile?.phone || '',
      jobTitle: displayProfile?.jobTitle || '',
    });
    setEditOpen(true);
  };

  const handleProfileSave = async () => {
    if (!profileForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    try {
      const updated = await updateProfile({
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        jobTitle: profileForm.jobTitle.trim(),
      }).unwrap();
      persistSessionUser(updated);
      toast.success('Profile updated successfully');
      setEditOpen(false);
    } catch (err) {
      toast.error(getNgoErrorMessage(err, 'Failed to update profile'));
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Enter your current and new password');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      toast.success('Password changed successfully');
      setPasswordForm(EMPTY_PASSWORD_FORM);
    } catch (err) {
      toast.error(getNgoErrorMessage(err, 'Failed to change password'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User settings</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and account security</p>
      </div>

      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading && !displayProfile ? (
        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading profile…
        </div>
      ) : null}

      {isError && !displayProfile ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {getNgoErrorMessage(error, 'Unable to load your profile')}
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-3 font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      ) : null}

      {activeTab === 'personal' && displayProfile ? (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Personal information</h2>
              <p className="text-sm text-gray-500">Your profile details for this organization</p>
            </div>
            <button
              type="button"
              onClick={openEditModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <Edit3 size={16} />
              Edit
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow icon={User} label="Full name" value={displayProfile.fullName || displayProfile.name} />
            <InfoRow icon={Mail} label="Email" value={displayProfile.email} />
            <InfoRow icon={Phone} label="Phone" value={displayProfile.phone} />
            <InfoRow icon={Briefcase} label="Job title" value={displayProfile.jobTitle} />
            <InfoRow icon={Shield} label="Role" value={displayProfile.roleName || displayProfile.role} />
            <InfoRow icon={Shield} label="Access" value={scopeLabel} />
            <InfoRow
              icon={Shield}
              label="Account status"
              value={displayProfile.accountStatus || 'Active'}
            />
            <InfoRow icon={Building2} label="Organization" value={organization?.name} />
          </div>
        </div>
      ) : null}

      {activeTab === 'account' ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-lg">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <KeyRound size={20} className="text-emerald-600" />
              Change password
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Use a strong password you do not use elsewhere
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">Current password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                className={NGO_INPUT_CLASS}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">New password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                className={NGO_INPUT_CLASS}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">Confirm new password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                className={NGO_INPUT_CLASS}
              />
            </label>

            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              {savingPassword ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      ) : null}

      <NGOModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        title="Edit personal information"
        subtitle="Update your contact details"
        onSave={handleProfileSave}
        saving={savingProfile}
        saveLabel="Save changes"
        maxWidth="2xl"
      >
        <NGOFormGrid>
          <NGOFormField label="Full name" required colSpan={2}>
            <input
              type="text"
              required
              value={profileForm.fullName}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, fullName: event.target.value }))
              }
              className={NGO_INPUT_CLASS}
            />
          </NGOFormField>
          <NGOFormField label="Phone">
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, phone: event.target.value }))
              }
              className={NGO_INPUT_CLASS}
            />
          </NGOFormField>
          <NGOFormField label="Job title">
            <input
              type="text"
              value={profileForm.jobTitle}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, jobTitle: event.target.value }))
              }
              className={NGO_INPUT_CLASS}
            />
          </NGOFormField>
          <NGOFormField label="Email" colSpan={2} hint="Email cannot be changed here. Contact your administrator.">
            <input
              type="email"
              value={displayProfile?.email || ''}
              disabled
              className={NGO_INPUT_CLASS}
            />
          </NGOFormField>
        </NGOFormGrid>
      </NGOModal>
    </div>
  );
}
