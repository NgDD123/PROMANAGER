export function formatChurchMemberName(member) {
  if (!member) return '';
  return (
    [member.firstName, member.lastName].filter(Boolean).join(' ') ||
    member.name ||
    ''
  ).trim();
}

export function formatChurchMemberOption(member) {
  const name = formatChurchMemberName(member) || 'Unnamed member';
  return member.memberId ? `${name} (${member.memberId})` : name;
}

export const MEMBER_DETAIL_SECTIONS = [
  {
    title: 'Personal information',
    fields: [
      { key: 'memberId', label: 'Member ID' },
      { key: 'firstName', label: 'First name' },
      { key: 'lastName', label: 'Last name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'dateOfBirth', label: 'Date of birth' },
      { key: 'gender', label: 'Gender' },
      { key: 'address', label: 'Address', colSpan: 2 },
    ],
  },
  {
    title: 'Membership',
    fields: [
      { key: 'membershipStatus', label: 'Membership status' },
      { key: 'joinDate', label: 'Join date' },
      { key: 'ministry', label: 'Ministry / role' },
    ],
  },
  {
    title: 'Profile',
    fields: [
      { key: 'occupation', label: 'Occupation' },
      { key: 'emergencyContact', label: 'Emergency contact' },
      { key: 'notes', label: 'Notes', colSpan: 2 },
    ],
  },
];

export function isMemberRecord(workspace) {
  return workspace?.recordType === 'member';
}
