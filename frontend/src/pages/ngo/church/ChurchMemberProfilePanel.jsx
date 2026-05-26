import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Edit, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import NGOModal, { NGOFormField, NGOFormGrid, NGO_INPUT_CLASS } from '../../../components/ngo/NGOModal.jsx';
import {
  useCreateNgoChurchRecordMutation,
  useDeleteNgoChurchRecordMutation,
  useGetNgoChurchRecordsQuery,
  useUpdateNgoChurchRecordMutation,
  useUploadNgoChurchMemberPhotoMutation,
  getNgoErrorMessage,
} from '../../../store/actions/ngo.js';
import { usePopup } from '../../../context/PopupContext.jsx';
import ChurchMemberSummaryCard from './ChurchMemberSummaryCard.jsx';
import { formatChurchMemberName, formatChurchMemberOption } from './churchMemberUtils.js';

const EMPTY_FORM = {
  linkedMemberId: '',
  ministryId: '',
  occupation: '',
  emergencyContact: '',
  notes: '',
  photoUrl: '',
};

export default function ChurchMemberProfilePanel({ domain, workspace }) {
  const { toast } = usePopup();
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');

  const clearPendingPhoto = () => {
    if (photoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl('');
    setPendingPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => () => {
    if (photoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
  }, [photoPreviewUrl]);

  const { data: profiles = [], isLoading, isFetching, refetch } = useGetNgoChurchRecordsQuery({
    domain,
    recordType: 'member_profile',
  });
  const { data: registeredMembers = [] } = useGetNgoChurchRecordsQuery({
    domain: 'members',
    recordType: 'member',
  });
  const { data: ministries = [] } = useGetNgoChurchRecordsQuery({
    domain: 'members',
    recordType: 'ministry',
  });

  const [createRecord, { isLoading: creating }] = useCreateNgoChurchRecordMutation();
  const [updateRecord, { isLoading: updating }] = useUpdateNgoChurchRecordMutation();
  const [deleteRecord] = useDeleteNgoChurchRecordMutation();
  const [uploadPhoto, { isLoading: uploadingPhoto }] = useUploadNgoChurchMemberPhotoMutation();

  const sortedMembers = useMemo(
    () =>
      [...registeredMembers].sort((a, b) =>
        formatChurchMemberName(a).localeCompare(formatChurchMemberName(b))
      ),
    [registeredMembers]
  );

  const sortedMinistries = useMemo(
    () => [...ministries].sort((a, b) => (a.title || '').localeCompare(b.title || '')),
    [ministries]
  );

  const selectedMember = useMemo(
    () => sortedMembers.find((m) => m.id === form.linkedMemberId),
    [sortedMembers, form.linkedMemberId]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => JSON.stringify(p).toLowerCase().includes(q));
  }, [profiles, search]);

  const openAdd = () => {
    clearPendingPhoto();
    setForm(EMPTY_FORM);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (profile) => {
    clearPendingPhoto();
    setForm({
      linkedMemberId: profile.linkedMemberId || '',
      ministryId: profile.ministryId || '',
      occupation: profile.occupation || '',
      emergencyContact: profile.emergencyContact || '',
      notes: profile.notes || '',
      photoUrl: profile.photoUrl || '',
    });
    setEditing(profile);
    setModalOpen(true);
  };

  const handlePhotoPick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller');
      return;
    }

    if (photoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPendingPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.linkedMemberId) {
      toast.error('Select a member');
      return;
    }

    const member = sortedMembers.find((m) => m.id === form.linkedMemberId);
    if (!member) {
      toast.error('Selected member not found');
      return;
    }

    const duplicate = profiles.find(
      (p) => p.linkedMemberId === form.linkedMemberId && p.id !== editing?.id
    );
    if (duplicate) {
      toast.error('A profile already exists for this member');
      return;
    }

    const ministry = sortedMinistries.find((m) => m.id === form.ministryId);

    let photoUrl = form.photoUrl || undefined;
    if (pendingPhotoFile) {
      try {
        const result = await uploadPhoto(pendingPhotoFile).unwrap();
        photoUrl = result.url;
      } catch (err) {
        toast.error(getNgoErrorMessage(err, 'Failed to upload photo'));
        return;
      }
    }

    const payload = {
      domain,
      recordType: 'member_profile',
      linkedMemberId: form.linkedMemberId,
      memberId: member.memberId || '',
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      name: formatChurchMemberName(member),
      email: member.email,
      phone: member.phone,
      membershipStatus: member.membershipStatus,
      ministryId: form.ministryId || undefined,
      ministry: ministry?.title || undefined,
      occupation: form.occupation.trim(),
      emergencyContact: form.emergencyContact.trim(),
      notes: form.notes.trim(),
      photoUrl,
    };

    try {
      if (editing?.id) {
        await updateRecord({ id: editing.id, ...payload }).unwrap();
        toast.success('Profile updated');
      } else {
        await createRecord(payload).unwrap();
        toast.success('Profile created');
      }
      clearPendingPhoto();
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getNgoErrorMessage(err, 'Failed to save profile'));
    }
  };

  const handleDelete = async (profile) => {
    const name = formatChurchMemberName(profile) || profile.memberId;
    if (!window.confirm(`Delete profile for ${name}?`)) return;
    try {
      await deleteRecord(profile.id).unwrap();
      toast.success('Profile deleted');
    } catch (err) {
      toast.error(getNgoErrorMessage(err, 'Failed to delete profile'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{workspace.label}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{workspace.description}</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={!sortedMembers.length}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <Plus size={16} />
          Add profile
        </button>
      </div>

      {!sortedMembers.length ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Register members under <strong>Member registration</strong> before creating profiles.
        </p>
      ) : null}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="search"
          placeholder="Search profiles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${NGO_INPUT_CLASS} pl-9`}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {(isLoading || isFetching) && !profiles.length ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            No member profiles yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 w-14">
                    Photo
                  </th>
                  {workspace.columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {profile.photoUrl ? (
                        <img
                          src={profile.photoUrl}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={18} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    {workspace.columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-gray-800">
                        {col.render ? col.render(profile) : profile[col.key] ?? '—'}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(profile)}
                        className="p-1.5 text-gray-500 hover:text-emerald-700 rounded"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(profile)}
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
        onClose={() => {
          clearPendingPhoto();
          setModalOpen(false);
        }}
        title={editing ? 'Edit member profile' : 'Add member profile'}
        subtitle="Select a registered member, then complete profile details"
        onSave={handleSave}
        saving={creating || updating || uploadingPhoto}
        maxWidth="4xl"
      >
        <div className="space-y-6">
          <NGOFormGrid>
            <NGOFormField label="Member" required colSpan={2}>
              <select
                className={NGO_INPUT_CLASS}
                value={form.linkedMemberId}
                onChange={(e) => setForm((prev) => ({ ...prev, linkedMemberId: e.target.value }))}
                disabled={Boolean(editing)}
              >
                <option value="">Select member…</option>
                {sortedMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {formatChurchMemberOption(member)}
                  </option>
                ))}
              </select>
            </NGOFormField>
          </NGOFormGrid>

          {selectedMember ? (
            <ChurchMemberSummaryCard member={selectedMember} title="Registration details" />
          ) : null}

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0">
              <p className="text-sm font-semibold text-gray-700 mb-2">Profile picture</p>
              <div className="relative">
                {photoPreviewUrl || form.photoUrl ? (
                  <img
                    src={photoPreviewUrl || form.photoUrl}
                    alt="Profile"
                    className="w-28 h-28 rounded-xl object-cover border-2 border-emerald-200 shadow-sm"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                    <Camera size={28} />
                    <span className="text-xs mt-1">No photo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handlePhotoPick}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {photoPreviewUrl || form.photoUrl ? 'Change photo' : 'Choose photo'}
              </button>
            </div>

            <div className="flex-1 w-full space-y-5">
              <NGOFormGrid>
                <NGOFormField label="Ministry / role">
                  <select
                    className={NGO_INPUT_CLASS}
                    value={form.ministryId}
                    onChange={(e) => setForm((prev) => ({ ...prev, ministryId: e.target.value }))}
                  >
                    <option value="">
                      {sortedMinistries.length ? 'Select ministry…' : 'No ministries yet'}
                    </option>
                    {sortedMinistries.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </NGOFormField>
                <NGOFormField label="Occupation">
                  <input
                    type="text"
                    className={NGO_INPUT_CLASS}
                    value={form.occupation}
                    onChange={(e) => setForm((prev) => ({ ...prev, occupation: e.target.value }))}
                    placeholder="e.g. Teacher, Engineer"
                  />
                </NGOFormField>
                <NGOFormField label="Emergency contact" hint="Phone number">
                  <input
                    type="tel"
                    className={NGO_INPUT_CLASS}
                    value={form.emergencyContact}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, emergencyContact: e.target.value }))
                    }
                    placeholder="+250 7XX XXX XXX"
                  />
                </NGOFormField>
                <NGOFormField label="Profile notes" colSpan={2}>
                  <textarea
                    className={NGO_INPUT_CLASS}
                    rows={4}
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this member…"
                  />
                </NGOFormField>
              </NGOFormGrid>
            </div>
          </div>
        </div>
      </NGOModal>
    </div>
  );
}
