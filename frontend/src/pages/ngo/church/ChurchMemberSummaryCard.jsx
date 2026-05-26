import React from 'react';
import { Mail, MapPin, Phone, User } from 'lucide-react';
import { formatChurchMemberName } from './churchMemberUtils.js';

export default function ChurchMemberSummaryCard({ member, title = 'Member details' }) {
  if (!member) return null;

  const name = formatChurchMemberName(member);
  const rows = [
    { icon: User, label: 'Member ID', value: member.memberId },
    { icon: Mail, label: 'Email', value: member.email },
    { icon: Phone, label: 'Phone', value: member.phone },
    { icon: MapPin, label: 'Address', value: member.address },
    { label: 'Date of birth', value: member.dateOfBirth },
    { label: 'Gender', value: member.gender },
    { label: 'Membership status', value: member.membershipStatus },
    { label: 'Join date', value: member.joinDate },
    { label: 'Ministry / role', value: member.ministry },
  ].filter((row) => row.value);

  return (
    <div className="rounded-xl border border-emerald-100 bg-linear-to-br from-emerald-50/80 to-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 mb-3">{title}</p>
      <h4 className="text-lg font-bold text-gray-900 mb-4">{name || 'Selected member'}</h4>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No contact details on file for this member.</p>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="flex gap-2">
              {row.icon ? (
                <row.icon size={16} className="shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <span className="w-4 shrink-0" />
              )}
              <div>
                <dt className="text-xs font-medium text-gray-500">{row.label}</dt>
                <dd className="text-sm font-medium text-gray-900 wrap-break-word">{row.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
