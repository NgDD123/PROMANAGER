import React from 'react';
import NGOModal from '../../../components/ngo/NGOModal.jsx';
import {
  formatChurchMemberName,
  MEMBER_DETAIL_SECTIONS,
} from './churchMemberUtils.js';

function DetailItem({ label, value, colSpan }) {
  return (
    <div className={colSpan === 2 ? 'md:col-span-2' : undefined}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900 wrap-break-word whitespace-pre-wrap">
        {value != null && String(value).trim() !== '' ? value : '—'}
      </p>
    </div>
  );
}

export default function ChurchMemberDetail({ open, member, onClose, onEdit }) {
  if (!member) return null;

  const displayName = formatChurchMemberName(member) || member.memberId || 'Member';

  return (
    <NGOModal
      open={open}
      onClose={onClose}
      mode="view"
      title={displayName}
      subtitle={member.memberId ? `Member ID: ${member.memberId}` : 'Church member profile'}
      maxWidth="4xl"
    >
      <div className="space-y-8">
        {MEMBER_DETAIL_SECTIONS.map((section) => (
          <section key={section.title}>
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <DetailItem
                  key={field.key}
                  label={field.label}
                  value={member[field.key]}
                  colSpan={field.colSpan}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {onEdit ? (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(member);
            }}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Edit member
          </button>
        </div>
      ) : null}
    </NGOModal>
  );
}
