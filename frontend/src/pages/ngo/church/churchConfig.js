import {
  UserCog,
  Users,
  Heart,
  Droplets,
  BookOpen,
  Gem,
  IdCard,
  Image,
  DollarSign,
  HandCoins,
  Gift,
  ClipboardList,
  Receipt,
  PiggyBank,
  BarChart3,
  Landmark,
  FileText,
  Calculator,
  CalendarDays,
  Mic2,
  Tent,
  Church as ChurchIcon,
  HeartHandshake,
  Waves,
  Ticket,
  Building2,
  Wrench,
  Music,
  Truck,
  Package,
  CalendarClock,
} from 'lucide-react';

export const CHURCH_MAIN_TABS = [
  { id: 'members', label: 'Member Management', icon: Users },
  { id: 'finance', label: 'Church Finance', icon: DollarSign },
  { id: 'events', label: 'Events Management', icon: CalendarDays },
  { id: 'assets', label: 'Assets Management', icon: Building2 },
];

/** Shown only to church managers (NGO admin or role with church scope). */
export const CHURCH_USERS_TAB = {
  id: 'users',
  label: 'User Management',
  icon: UserCog,
  managerOnly: true,
};

export const MEMBER_WORKSPACES = [
  
  {
    id: 'registration',
    label: 'Member registration',
    recordType: 'member',
    icon: Users,
    description: 'Register new church members with contact and branch details.',
    fields: [
      { key: 'firstName', label: 'First name', type: 'text', required: true },
      { key: 'lastName', label: 'Last name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'dateOfBirth', label: 'Date of birth', type: 'date' },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
      { key: 'address', label: 'Address', type: 'text', colSpan: 2 },
      { key: 'membershipStatus', label: 'Membership status', type: 'select', options: ['Active', 'Inactive', 'Visitor', 'Transferred', 'Deceased'] },
      { key: 'joinDate', label: 'Join date', type: 'date' },
    ],
    columns: [
      { key: 'memberId', label: 'Member ID' },
      { key: 'name', label: 'Name', render: (r) => [r.firstName, r.lastName].filter(Boolean).join(' ') || r.name },
      { key: 'phone', label: 'Phone' },
      { key: 'membershipStatus', label: 'Status' },
    ],
    generateMemberId: true,
  },
  {
    id: 'ministries',
    label: 'Ministries',
    recordType: 'ministry',
    icon: Music,
    description: 'Manage church ministries, service groups, and departmental teams.',
    fields: [
      { key: 'title', label: 'Ministry name', type: 'text', required: true },
      { key: 'leaderMemberId', label: 'Ministry leader', type: 'memberSelect' },
      { key: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    ],
    columns: [
      { key: 'title', label: 'Ministry' },
      { key: 'leader', label: 'Leader' },
      {
        key: 'description',
        label: 'Description',
        render: (r) => (r.description ? String(r.description).slice(0, 80) : '—'),
      },
    ],
  },
  {
    id: 'profiles',
    label: 'Member profiles',
    recordType: 'member_profile',
    icon: IdCard,
    customPanel: 'memberProfile',
    description: 'Extended profiles for registered members — photo, ministry, occupation, and notes.',
    columns: [
      { key: 'memberId', label: 'Member ID' },
      { key: 'name', label: 'Name', render: (r) => [r.firstName, r.lastName].filter(Boolean).join(' ') || r.name },
      { key: 'ministry', label: 'Ministry' },
      { key: 'occupation', label: 'Occupation' },
    ],
  },
  {
    id: 'families',
    label: 'Family grouping',
    recordType: 'family',
    icon: Heart,
    description: 'Group members into households and family units.',
    fields: [
      { key: 'familyName', label: 'Family name', type: 'text', required: true },
      { key: 'headOfHousehold', label: 'Head of household', type: 'text' },
      { key: 'memberCount', label: 'Member count', type: 'number' },
      { key: 'address', label: 'Address', type: 'text', colSpan: 2 },
      { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
    columns: [
      { key: 'familyName', label: 'Family' },
      { key: 'headOfHousehold', label: 'Head' },
      { key: 'memberCount', label: 'Members' },
      { key: 'status', label: 'Status' },
    ],
  },
  {
    id: 'status',
    label: 'Membership status',
    recordType: 'membership_status',
    icon: ClipboardList,
    description: 'Track membership changes, transfers, and status history.',
    fields: [
      { key: 'memberId', label: 'Member ID', type: 'text', required: true },
      { key: 'name', label: 'Member name', type: 'text' },
      { key: 'membershipStatus', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Visitor', 'Transferred', 'Deceased'] },
      { key: 'effectiveDate', label: 'Effective date', type: 'date' },
      { key: 'reason', label: 'Reason', type: 'text', colSpan: 2 },
    ],
    columns: [
      { key: 'memberId', label: 'Member ID' },
      { key: 'name', label: 'Name' },
      { key: 'membershipStatus', label: 'Status' },
      { key: 'effectiveDate', label: 'Effective' },
    ],
  },
  {
    id: 'baptism',
    label: 'Baptism records',
    recordType: 'baptism',
    icon: Droplets,
    description: 'Record baptism dates, officiants, and certificates.',
    fields: [
      { key: 'memberId', label: 'Member ID', type: 'text' },
      { key: 'name', label: 'Member name', type: 'text', required: true },
      { key: 'baptismDate', label: 'Baptism date', type: 'date', required: true },
      { key: 'baptismPlace', label: 'Place', type: 'text' },
      { key: 'officiant', label: 'Officiant', type: 'text' },
      { key: 'certificateRef', label: 'Certificate ref', type: 'text' },
    ],
    columns: [
      { key: 'name', label: 'Member' },
      { key: 'baptismDate', label: 'Date' },
      { key: 'baptismPlace', label: 'Place' },
      { key: 'officiant', label: 'Officiant' },
    ],
  },
  {
    id: 'confirmation',
    label: 'Confirmation records',
    recordType: 'confirmation',
    icon: BookOpen,
    description: 'Confirmation classes, dates, and sacramental records.',
    fields: [
      { key: 'memberId', label: 'Member ID', type: 'text' },
      { key: 'name', label: 'Member name', type: 'text', required: true },
      { key: 'confirmationDate', label: 'Confirmation date', type: 'date', required: true },
      { key: 'sponsor', label: 'Sponsor', type: 'text' },
      { key: 'className', label: 'Class / cohort', type: 'text' },
    ],
    columns: [
      { key: 'name', label: 'Member' },
      { key: 'confirmationDate', label: 'Date' },
      { key: 'sponsor', label: 'Sponsor' },
      { key: 'className', label: 'Class' },
    ],
  },
  {
    id: 'marriage',
    label: 'Marriage records',
    recordType: 'marriage',
    icon: Gem,
    description: 'Marriage ceremonies, licenses, and couple records.',
    fields: [
      { key: 'spouseOne', label: 'Spouse one', type: 'text', required: true },
      { key: 'spouseTwo', label: 'Spouse two', type: 'text', required: true },
      { key: 'marriageDate', label: 'Marriage date', type: 'date', required: true },
      { key: 'marriagePlace', label: 'Place', type: 'text' },
      { key: 'officiant', label: 'Officiant', type: 'text' },
      { key: 'licenseNumber', label: 'License number', type: 'text' },
    ],
    columns: [
      { key: 'spouseOne', label: 'Spouse one' },
      { key: 'spouseTwo', label: 'Spouse two' },
      { key: 'marriageDate', label: 'Date' },
      { key: 'marriagePlace', label: 'Place' },
    ],
  },
  {
    id: 'member_ids',
    label: 'Membership ID generation',
    recordType: 'member_id_batch',
    icon: IdCard,
    description: 'Issue and track membership ID cards and batches.',
    fields: [
      { key: 'memberId', label: 'Member ID', type: 'text', required: true },
      { key: 'name', label: 'Member name', type: 'text' },
      { key: 'issueDate', label: 'Issue date', type: 'date' },
      { key: 'cardStatus', label: 'Card status', type: 'select', options: ['Issued', 'Pending', 'Replaced', 'Revoked'] },
    ],
    columns: [
      { key: 'memberId', label: 'Member ID' },
      { key: 'name', label: 'Name' },
      { key: 'issueDate', label: 'Issued' },
      { key: 'cardStatus', label: 'Card' },
    ],
    generateMemberId: true,
  },
  {
    id: 'documents',
    label: 'Member photos/documents',
    recordType: 'member_document',
    icon: Image,
    description: 'Store photo URLs and document references for members.',
    fields: [
      { key: 'memberId', label: 'Member ID', type: 'text' },
      { key: 'name', label: 'Member name', type: 'text', required: true },
      { key: 'photoUrl', label: 'Photo URL', type: 'text', colSpan: 2 },
      { key: 'documentType', label: 'Document type', type: 'select', options: ['Photo', 'ID copy', 'Baptism certificate', 'Marriage certificate', 'Other'] },
      { key: 'documentUrl', label: 'Document URL', type: 'text', colSpan: 2 },
    ],
    columns: [
      { key: 'name', label: 'Member' },
      { key: 'documentType', label: 'Type' },
      { key: 'photoUrl', label: 'Photo', render: (r) => (r.photoUrl ? 'Yes' : '—') },
    ],
  },
];

export const FINANCE_WORKSPACES = [
  { id: 'tithes', label: 'Tithes', recordType: 'tithe', icon: HandCoins, amount: true, fields: financeFields('Tithe') },
  { id: 'offerings', label: 'Offerings', recordType: 'offering', icon: DollarSign, amount: true, fields: financeFields('Offering') },
  { id: 'donations', label: 'Donations', recordType: 'donation', icon: Gift, amount: true, fields: financeFields('Donation') },
  { id: 'pledges', label: 'Pledges & commitments', recordType: 'pledge', icon: ClipboardList, amount: true, fields: financeFields('Pledge', true) },
  { id: 'expenses', label: 'Expense management', recordType: 'expense', icon: Receipt, amount: true, fields: financeFields('Expense', false, true) },
  { id: 'budgets', label: 'Budget management', recordType: 'budget', icon: PiggyBank, amount: true, fields: budgetFields() },
  { id: 'reports', label: 'Financial reports', recordType: 'financial_report', icon: BarChart3, fields: reportFields() },
  { id: 'bank', label: 'Bank accounts', recordType: 'bank_account', icon: Landmark, fields: bankFields() },
  { id: 'receipts', label: 'Receipt generation', recordType: 'receipt', icon: FileText, amount: true, fields: financeFields('Receipt') },
  { id: 'ledger', label: 'Accounting & GL', recordType: 'ledger_entry', icon: Calculator, fields: ledgerFields() },
];

export const EVENT_WORKSPACES = [
  { id: 'events', label: 'Church events', recordType: 'church_event', icon: CalendarDays, fields: eventFields('General') },
  { id: 'conferences', label: 'Conferences', recordType: 'conference', icon: Mic2, fields: eventFields('Conference') },
  { id: 'crusades', label: 'Crusades', recordType: 'crusade', icon: ChurchIcon, fields: eventFields('Crusade') },
  { id: 'camps', label: 'Camps', recordType: 'camp', icon: Tent, fields: eventFields('Camp') },
  { id: 'weddings', label: 'Weddings', recordType: 'wedding_event', icon: HeartHandshake, fields: eventFields('Wedding') },
  { id: 'funerals', label: 'Funerals', recordType: 'funeral', icon: Heart, fields: eventFields('Funeral') },
  { id: 'baptism_events', label: 'Baptism events', recordType: 'baptism_event', icon: Waves, fields: eventFields('Baptism') },
  { id: 'registration', label: 'Event registration', recordType: 'event_registration', icon: ClipboardList, fields: registrationFields() },
  { id: 'tickets', label: 'Tickets & passes', recordType: 'event_ticket', icon: Ticket, fields: ticketFields() },
];

export const ASSET_WORKSPACES = [
  { id: 'property', label: 'Church property', recordType: 'property', icon: Building2, fields: assetFields('Property') },
  { id: 'equipment', label: 'Equipment', recordType: 'equipment', icon: Wrench, fields: assetFields('Equipment') },
  { id: 'instruments', label: 'Musical instruments', recordType: 'instrument', icon: Music, fields: assetFields('Instrument') },
  { id: 'vehicles', label: 'Vehicles', recordType: 'vehicle', icon: Truck, fields: assetFields('Vehicle') },
  { id: 'inventory', label: 'Inventory', recordType: 'inventory', icon: Package, fields: assetFields('Inventory') },
  { id: 'maintenance', label: 'Maintenance schedules', recordType: 'maintenance', icon: CalendarClock, fields: maintenanceFields() },
];

function financeFields(category, pledge = false, expense = false) {
  return [
    { key: 'title', label: 'Title', type: 'text', required: true, defaultValue: category },
    { key: 'payerName', label: expense ? 'Payee' : 'Contributor', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'number', required: true },
    { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'RWF', 'KES', 'UGX', 'TZS'] },
    { key: 'date', label: 'Date', type: 'date', required: true },
    ...(pledge ? [{ key: 'dueDate', label: 'Due date', type: 'date' }] : []),
    { key: 'paymentMethod', label: 'Payment method', type: 'select', options: ['Cash', 'Bank transfer', 'Mobile money', 'Cheque', 'Card'] },
    { key: 'reference', label: 'Reference', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ];
}

function budgetFields() {
  return [
    { key: 'title', label: 'Budget line', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'amount', label: 'Allocated amount', type: 'number', required: true },
    { key: 'period', label: 'Period', type: 'select', options: ['Monthly', 'Quarterly', 'Annual'] },
    { key: 'fiscalYear', label: 'Fiscal year', type: 'text' },
  ];
}

function reportFields() {
  return [
    { key: 'title', label: 'Report name', type: 'text', required: true },
    { key: 'reportType', label: 'Report type', type: 'select', options: ['Income statement', 'Balance sheet', 'Cash flow', 'Tithes summary', 'Custom'] },
    { key: 'periodStart', label: 'Period start', type: 'date' },
    { key: 'periodEnd', label: 'Period end', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ];
}

function bankFields() {
  return [
    { key: 'title', label: 'Account name', type: 'text', required: true },
    { key: 'bankName', label: 'Bank', type: 'text', required: true },
    { key: 'accountNumber', label: 'Account number', type: 'text' },
    { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'RWF', 'KES'] },
    { key: 'balance', label: 'Opening balance', type: 'number' },
  ];
}

function ledgerFields() {
  return [
    { key: 'title', label: 'Entry description', type: 'text', required: true },
    { key: 'accountCode', label: 'Account code', type: 'text', required: true },
    { key: 'debit', label: 'Debit', type: 'number' },
    { key: 'credit', label: 'Credit', type: 'number' },
    { key: 'date', label: 'Date', type: 'date', required: true },
    { key: 'reference', label: 'Reference', type: 'text' },
  ];
}

function eventFields(typeLabel) {
  return [
    { key: 'title', label: 'Event name', type: 'text', required: true, defaultValue: '' },
    { key: 'eventType', label: 'Type', type: 'text', defaultValue: typeLabel },
    { key: 'startDate', label: 'Start date', type: 'date', required: true },
    { key: 'endDate', label: 'End date', type: 'date' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'capacity', label: 'Capacity', type: 'number' },
    { key: 'organizer', label: 'Organizer', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ];
}

function registrationFields() {
  return [
    { key: 'title', label: 'Event', type: 'text', required: true },
    { key: 'registrantName', label: 'Registrant', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'registrationDate', label: 'Registration date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['Confirmed', 'Pending', 'Cancelled', 'Waitlist'] },
  ];
}

function ticketFields() {
  return [
    { key: 'title', label: 'Event', type: 'text', required: true },
    { key: 'ticketCode', label: 'Ticket / pass code', type: 'text' },
    { key: 'holderName', label: 'Holder name', type: 'text', required: true },
    { key: 'ticketType', label: 'Ticket type', type: 'select', options: ['General', 'VIP', 'Staff', 'Child'] },
    { key: 'issueDate', label: 'Issue date', type: 'date' },
  ];
}

function assetFields(typeLabel) {
  return [
    { key: 'title', label: 'Asset name', type: 'text', required: true },
    { key: 'assetType', label: 'Type', type: 'text', defaultValue: typeLabel },
    { key: 'serialNumber', label: 'Serial / tag', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'value', label: 'Value', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'In use', 'In storage', 'Under repair', 'Disposed'] },
    { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ];
}

function maintenanceFields() {
  return [
    { key: 'title', label: 'Asset / item', type: 'text', required: true },
    { key: 'scheduledDate', label: 'Scheduled date', type: 'date', required: true },
    { key: 'maintenanceType', label: 'Type', type: 'select', options: ['Routine', 'Repair', 'Inspection', 'Upgrade'] },
    { key: 'assignedTo', label: 'Assigned to', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In progress', 'Completed', 'Overdue'] },
    { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ];
}

// Attach shared columns for finance workspaces
FINANCE_WORKSPACES.forEach((ws) => {
  if (!ws.columns) {
    ws.columns = [
      { key: 'title', label: 'Title' },
      { key: 'amount', label: 'Amount', render: (r) => (r.amount != null ? Number(r.amount).toLocaleString() : '—') },
      { key: 'date', label: 'Date' },
      { key: 'paymentMethod', label: 'Method' },
    ];
  }
  if (!ws.description) ws.description = `Manage ${ws.label.toLowerCase()} for your church.`;
});

EVENT_WORKSPACES.forEach((ws) => {
  if (!ws.columns) {
    ws.columns = [
      { key: 'title', label: 'Event' },
      { key: 'startDate', label: 'Start' },
      { key: 'location', label: 'Location' },
      { key: 'capacity', label: 'Capacity' },
    ];
  }
  if (!ws.description) ws.description = `Plan and track ${ws.label.toLowerCase()}.`;
});

ASSET_WORKSPACES.forEach((ws) => {
  if (!ws.columns) {
    ws.columns = [
      { key: 'title', label: 'Asset' },
      { key: 'assetType', label: 'Type' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status' },
    ];
  }
  if (!ws.description) ws.description = `Track ${ws.label.toLowerCase()} across church locations.`;
});

export function getWorkspacesForTab(tabId) {
  if (tabId === 'members') return MEMBER_WORKSPACES;
  if (tabId === 'finance') return FINANCE_WORKSPACES;
  if (tabId === 'events') return EVENT_WORKSPACES;
  if (tabId === 'assets') return ASSET_WORKSPACES;
  return [];
}
