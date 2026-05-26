import React, { useMemo, useState } from 'react';
import { Edit, Eye, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import NGOModal, { NGOFormField, NGOFormGrid, NGO_INPUT_CLASS } from '../../../components/ngo/NGOModal.jsx';
import {
  useCreateNgoChurchRecordMutation,
  useDeleteNgoChurchRecordMutation,
  useGetNgoChurchRecordsQuery,
  useLazyGenerateNgoChurchMemberIdQuery,
  useUpdateNgoChurchRecordMutation,
  getNgoErrorMessage,
} from '../../../store/actions/ngo.js';
import { usePopup } from '../../../context/PopupContext.jsx';
import ChurchMemberDetail from './ChurchMemberDetail.jsx';
import {
  formatChurchMemberName,
  formatChurchMemberOption,
  isMemberRecord,
} from './churchMemberUtils.js';

function emptyForm(fields = []) {
  return fields.reduce((acc, field) => {
    acc[field.key] = field.defaultValue ?? '';
    return acc;
  }, {});
}

function recordToForm(record, fields) {
  const form = emptyForm(fields);
  fields.forEach((field) => {
    if (record[field.key] != null && record[field.key] !== '') {
      form[field.key] = record[field.key];
    }
  });
  return form;
}

function displayTitle(record, workspace) {
  if (workspace.columns?.[0]?.render) {
    const col = workspace.columns[0];
    return col.render(record) || record.title || record.name || 'Record';
  }
  return (
    record.title ||
    record.name ||
    record.familyName ||
    [record.firstName, record.lastName].filter(Boolean).join(' ') ||
    record.memberId ||
    'Record'
  );
}

export default function ChurchRecordPanel({ domain, workspace }) {
  const { toast } = usePopup();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMember, setViewMember] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(() => emptyForm(workspace.fields));

  const queryParams = useMemo(
    () => ({ domain, recordType: workspace.recordType }),
    [domain, workspace.recordType]
  );

  const needsMemberList = useMemo(
    () => workspace.fields.some((field) => field.type === 'memberSelect'),
    [workspace.fields]
  );

  const { data: records = [], isLoading, isFetching, refetch } = useGetNgoChurchRecordsQuery(queryParams);
  const { data: churchMembers = [] } = useGetNgoChurchRecordsQuery(
    { domain: 'members', recordType: 'member' },
    { skip: !needsMemberList }
  );

  const [createRecord, { isLoading: creating }] = useCreateNgoChurchRecordMutation();
  const [updateRecord, { isLoading: updating }] = useUpdateNgoChurchRecordMutation();
  const [deleteRecord] = useDeleteNgoChurchRecordMutation();
  const [fetchMemberId] = useLazyGenerateNgoChurchMemberIdQuery();

  const sortedMembers = useMemo(
    () =>
      [...churchMembers].sort((a, b) =>
        formatChurchMemberName(a).localeCompare(formatChurchMemberName(b))
      ),
    [churchMembers]
  );

  const showMemberView = workspace.supportsMemberView || isMemberRecord(workspace);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((record) =>
      JSON.stringify(record).toLowerCase().includes(q)
    );
  }, [records, search]);

  const openAdd = async () => {
    const next = emptyForm(workspace.fields);
    if (workspace.generateMemberId) {
      try {
        const result = await fetchMemberId().unwrap();
        if (result?.memberId) next.memberId = result.memberId;
      } catch {
        /* optional */
      }
    }
    setForm(next);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setForm(recordToForm(record, workspace.fields));
    setEditing(record);
    setModalOpen(true);
  };

  const openViewMember = (record) => {
    setViewMember(record);
  };

  const handleSave = async () => {
    const required = workspace.fields.filter((f) => f.required);
    for (const field of required) {
      if (!String(form[field.key] ?? '').trim()) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    const selectedLeader = sortedMembers.find((m) => m.id === form.leaderMemberId);

    const name =
      [form.firstName, form.lastName].filter(Boolean).join(' ') ||
      form.name ||
      form.familyName ||
      form.title;

    const payload = {
      ...form,
      domain,
      recordType: workspace.recordType,
      name: name || form.title,
      leader: selectedLeader ? formatChurchMemberName(selectedLeader) : undefined,
      leaderMemberId: form.leaderMemberId || undefined,
      amount: form.amount !== '' && form.amount != null ? Number(form.amount) : undefined,
      memberCount: form.memberCount !== '' ? Number(form.memberCount) : undefined,
      capacity: form.capacity !== '' ? Number(form.capacity) : undefined,
      value: form.value !== '' ? Number(form.value) : undefined,
      debit: form.debit !== '' ? Number(form.debit) : undefined,
      credit: form.credit !== '' ? Number(form.credit) : undefined,
      balance: form.balance !== '' ? Number(form.balance) : undefined,
    };

    try {
      if (editing?.id) {
        await updateRecord({ id: editing.id, ...payload }).unwrap();
        toast.success('Record updated');
      } else {
        await createRecord(payload).unwrap();
        toast.success('Record created');
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getNgoErrorMessage(err, 'Failed to save record'));
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete "${displayTitle(record, workspace)}"?`)) return;
    try {
      await deleteRecord(record.id).unwrap();
      toast.success('Record deleted');
    } catch (err) {
      toast.error(getNgoErrorMessage(err, 'Failed to delete'));
    }
  };

  const renderField = (field) => {
    const value = form[field.key] ?? '';
    const onChange = (e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }));

    if (field.type === 'memberSelect') {
      return (
        <select className={NGO_INPUT_CLASS} value={value} onChange={onChange}>
          <option value="">
            {sortedMembers.length ? 'Select a member…' : 'No members registered yet'}
          </option>
          {sortedMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {formatChurchMemberOption(member)}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'select') {
      return (
        <select className={NGO_INPUT_CLASS} value={value} onChange={onChange}>
          <option value="">Select…</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          className={NGO_INPUT_CLASS}
          rows={3}
          value={value}
          onChange={onChange}
        />
      );
    }

    return (
      <input
        type={field.type || 'text'}
        className={NGO_INPUT_CLASS}
        value={value}
        onChange={onChange}
      />
    );
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
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={16} />
          Add record
        </button>
      </div>

      {needsMemberList && !sortedMembers.length ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Register members under <strong>Member registration</strong> before assigning a ministry leader.
        </p>
      ) : null}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="search"
          placeholder="Search records…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${NGO_INPUT_CLASS} pl-9`}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {(isLoading || isFetching) && !records.length ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            No records yet. Click &quot;Add record&quot; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
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
                {filtered.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    {workspace.columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-gray-800">
                        {col.key === 'name' && showMemberView ? (
                          <button
                            type="button"
                            onClick={() => openViewMember(record)}
                            className="font-medium text-emerald-700 hover:text-emerald-900 hover:underline text-left"
                          >
                            {col.render ? col.render(record) : record[col.key] ?? '—'}
                          </button>
                        ) : (
                          col.render ? col.render(record) : record[col.key] ?? '—'
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {showMemberView ? (
                        <button
                          type="button"
                          onClick={() => openViewMember(record)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded"
                          title="View member"
                        >
                          <Eye size={16} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => openEdit(record)}
                        className="p-1.5 text-gray-500 hover:text-emerald-700 rounded"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(record)}
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
        title={editing ? `Edit — ${workspace.label}` : `Add — ${workspace.label}`}
        subtitle={workspace.description}
        onSave={handleSave}
        saving={creating || updating}
        maxWidth="4xl"
      >
        <NGOFormGrid>
          {workspace.fields.map((field) => (
            <NGOFormField
              key={field.key}
              label={field.label}
              required={field.required}
              colSpan={field.colSpan}
              hint={field.hint}
            >
              {renderField(field)}
            </NGOFormField>
          ))}
        </NGOFormGrid>
      </NGOModal>

      <ChurchMemberDetail
        open={Boolean(viewMember)}
        member={viewMember}
        onClose={() => setViewMember(null)}
        onEdit={(member) => openEdit(member)}
      />
    </div>
  );
}
