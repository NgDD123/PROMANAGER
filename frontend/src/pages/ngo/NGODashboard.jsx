import React, { useEffect, useMemo, useState } from 'react';
import ServiceControlCenter from './ServiceControlCenter.jsx';
import NGOSettingsController from './NGOSettingsController.jsx';
import {
  Building2,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Church,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Globe2,
  HeartHandshake,
  Image,
  Landmark,
  MapPinned,
  Network,
  PackageCheck,
  Pencil,
  Plus,
  RadioTower,
  Route,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  Users
} from 'lucide-react';

const STORAGE_KEY = 'promanager_ngo_workspace_v1';
const MAX_PERSISTED_DOCUMENT_BYTES = 750 * 1024;
const MAX_PERSISTED_IMAGE_BYTES = 900 * 1024;
const IMAGE_MAX_DIMENSION = 1200;
const IMAGE_QUALITY = 0.82;

const professionalNgoChartOfAccounts = [
  { code: '1000', name: 'Cash on Hand', type: 'Asset', fund: 'Unrestricted', restricted: false, category: 'Current Assets' },
  { code: '1010', name: 'Operating Bank Account', type: 'Asset', fund: 'Unrestricted', restricted: false, category: 'Current Assets' },
  { code: '1020', name: 'Restricted Grant Bank Account', type: 'Asset', fund: 'Restricted', restricted: true, category: 'Current Assets' },
  { code: '1030', name: 'Savings and Short-Term Deposits', type: 'Asset', fund: 'Unrestricted', restricted: false, category: 'Current Assets' },
  { code: '1100', name: 'Accounts Receivable', type: 'Asset', fund: 'Unrestricted', restricted: false, category: 'Current Assets' },
  { code: '1110', name: 'Grants Receivable', type: 'Asset', fund: 'Restricted', restricted: true, category: 'Current Assets' },
  { code: '1120', name: 'Pledges Receivable', type: 'Asset', fund: 'Restricted', restricted: true, category: 'Current Assets' },
  { code: '1130', name: 'Staff Advances', type: 'Asset', fund: 'Unrestricted', restricted: false, category: 'Current Assets' },
  { code: '1140', name: 'Prepaid Expenses', type: 'Asset', fund: 'Unrestricted', restricted: false, category: 'Current Assets' },
  { code: '1200', name: 'Inventory - Relief Supplies', type: 'Asset', fund: 'Restricted', restricted: true, category: 'Inventory' },
  { code: '1210', name: 'Inventory - Medical and Program Supplies', type: 'Asset', fund: 'Restricted', restricted: true, category: 'Inventory' },
  { code: '1300', name: 'Property, Plant and Equipment', type: 'Asset', fund: 'Unrestricted', restricted: false, category: 'Non-current Assets' },
  { code: '1310', name: 'Vehicles', type: 'Asset', fund: 'Unrestricted', restricted: false, category: 'Non-current Assets' },
  { code: '1320', name: 'Furniture and Equipment', type: 'Asset', fund: 'Unrestricted', restricted: false, category: 'Non-current Assets' },
  { code: '1330', name: 'Computer and ICT Equipment', type: 'Asset', fund: 'Unrestricted', restricted: false, category: 'Non-current Assets' },
  { code: '1390', name: 'Accumulated Depreciation', type: 'Asset', fund: 'Unrestricted', restricted: false, category: 'Contra Assets' },
  { code: '2000', name: 'Accounts Payable', type: 'Liability', fund: 'Unrestricted', restricted: false, category: 'Current Liabilities' },
  { code: '2010', name: 'Accrued Expenses', type: 'Liability', fund: 'Unrestricted', restricted: false, category: 'Current Liabilities' },
  { code: '2020', name: 'Payroll Payable', type: 'Liability', fund: 'Unrestricted', restricted: false, category: 'Current Liabilities' },
  { code: '2030', name: 'Statutory Taxes Payable', type: 'Liability', fund: 'Unrestricted', restricted: false, category: 'Current Liabilities' },
  { code: '2040', name: 'Social Security and Benefits Payable', type: 'Liability', fund: 'Unrestricted', restricted: false, category: 'Current Liabilities' },
  { code: '2050', name: 'Deferred Grant Revenue', type: 'Liability', fund: 'Restricted', restricted: true, category: 'Deferred Income' },
  { code: '2060', name: 'Donor Refunds Payable', type: 'Liability', fund: 'Restricted', restricted: true, category: 'Current Liabilities' },
  { code: '2100', name: 'Lease Liabilities', type: 'Liability', fund: 'Unrestricted', restricted: false, category: 'Non-current Liabilities' },
  { code: '3000', name: 'Net Assets Without Donor Restrictions', type: 'Net Assets', fund: 'Unrestricted', restricted: false, category: 'Net Assets' },
  { code: '3100', name: 'Net Assets With Donor Restrictions', type: 'Net Assets', fund: 'Restricted', restricted: true, category: 'Net Assets' },
  { code: '3200', name: 'Board Designated Reserves', type: 'Net Assets', fund: 'Board Designated', restricted: false, category: 'Net Assets' },
  { code: '3300', name: 'Revaluation Reserve', type: 'Net Assets', fund: 'Unrestricted', restricted: false, category: 'Net Assets' },
  { code: '4000', name: 'Unrestricted Contributions', type: 'Revenue', fund: 'Unrestricted', restricted: false, category: 'Revenue' },
  { code: '4010', name: 'Restricted Donor Contributions', type: 'Revenue', fund: 'Restricted', restricted: true, category: 'Revenue' },
  { code: '4020', name: 'Government Grants', type: 'Revenue', fund: 'Restricted', restricted: true, category: 'Revenue' },
  { code: '4030', name: 'Foundation Grants', type: 'Revenue', fund: 'Restricted', restricted: true, category: 'Revenue' },
  { code: '4040', name: 'Corporate Donations', type: 'Revenue', fund: 'Unrestricted', restricted: false, category: 'Revenue' },
  { code: '4050', name: 'Membership and Church Offerings', type: 'Revenue', fund: 'Unrestricted', restricted: false, category: 'Revenue' },
  { code: '4060', name: 'In-Kind Contributions', type: 'Revenue', fund: 'Restricted', restricted: true, category: 'Revenue' },
  { code: '4070', name: 'Program Service Income', type: 'Revenue', fund: 'Unrestricted', restricted: false, category: 'Revenue' },
  { code: '4080', name: 'Interest Income', type: 'Revenue', fund: 'Unrestricted', restricted: false, category: 'Revenue' },
  { code: '4090', name: 'Foreign Exchange Gain', type: 'Revenue', fund: 'Unrestricted', restricted: false, category: 'Revenue' },
  { code: '5000', name: 'Program Supplies and Materials', type: 'Expense', fund: 'Restricted', restricted: true, category: 'Program Expenses' },
  { code: '5010', name: 'Beneficiary Cash Assistance', type: 'Expense', fund: 'Restricted', restricted: true, category: 'Program Expenses' },
  { code: '5020', name: 'Food and Non-Food Item Distribution', type: 'Expense', fund: 'Restricted', restricted: true, category: 'Program Expenses' },
  { code: '5030', name: 'Medical Outreach Expense', type: 'Expense', fund: 'Restricted', restricted: true, category: 'Program Expenses' },
  { code: '5040', name: 'Education and Training Expense', type: 'Expense', fund: 'Restricted', restricted: true, category: 'Program Expenses' },
  { code: '5050', name: 'Monitoring, Evaluation, Accountability and Learning', type: 'Expense', fund: 'Restricted', restricted: true, category: 'Program Expenses' },
  { code: '5100', name: 'Salaries and Wages', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Personnel Expenses' },
  { code: '5110', name: 'Employee Benefits', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Personnel Expenses' },
  { code: '5120', name: 'Consultants and Professional Fees', type: 'Expense', fund: 'Restricted', restricted: true, category: 'Personnel Expenses' },
  { code: '5200', name: 'Travel and Per Diem', type: 'Expense', fund: 'Restricted', restricted: true, category: 'Operating Expenses' },
  { code: '5210', name: 'Vehicle Fuel and Maintenance', type: 'Expense', fund: 'Restricted', restricted: true, category: 'Operating Expenses' },
  { code: '5220', name: 'Office Rent and Utilities', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Operating Expenses' },
  { code: '5230', name: 'Communication and Internet', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Operating Expenses' },
  { code: '5240', name: 'Printing, Stationery and Office Supplies', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Operating Expenses' },
  { code: '5250', name: 'Insurance Expense', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Operating Expenses' },
  { code: '5260', name: 'Bank Charges', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Finance Costs' },
  { code: '5270', name: 'Audit and Assurance Fees', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Governance Expenses' },
  { code: '5280', name: 'Board and Governance Meetings', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Governance Expenses' },
  { code: '5290', name: 'Depreciation Expense', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Non-cash Expenses' },
  { code: '5300', name: 'Foreign Exchange Loss', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Finance Costs' },
  { code: '5400', name: 'Fundraising Expense', type: 'Expense', fund: 'Unrestricted', restricted: false, category: 'Fundraising Expenses' }
].map(account => ({ ...account, id: `coa-${account.code}` }));

function stripDocumentDataUrl(document) {
  if (!document?.dataUrl || Number(document.size || 0) <= MAX_PERSISTED_DOCUMENT_BYTES) {
    return document;
  }

  return {
    ...document,
    dataUrl: '',
    storedInBrowser: false
  };
}

function stripLargeImageDataUrl(image) {
  if (!image?.dataUrl || Number(image.size || 0) <= MAX_PERSISTED_IMAGE_BYTES) {
    return image || null;
  }

  return {
    ...image,
    dataUrl: '',
    storedInBrowser: false
  };
}

function sanitizeWorkspaceForStorage(workspace) {
  const sanitizeDocuments = documents => (documents || []).map(stripDocumentDataUrl);
  const sanitizeImage = image => stripLargeImageDataUrl(image);
  const organizations = (workspace.organizations || []).map(organization => ({
    ...organization,
    logo: sanitizeImage(organization.logo),
    images: (organization.images || []).map(sanitizeImage).filter(Boolean),
    documents: sanitizeDocuments(organization.documents)
  }));
  const activeOrganization =
    organizations.find(organization => organization.id === workspace.activeOrganizationId) ||
    organizations[0] ||
    workspace.organization;

  return {
    ...workspace,
    organizations,
    organization: {
      ...(workspace.organization || {}),
      ...(activeOrganization || {}),
      logo: sanitizeImage(activeOrganization?.logo || workspace.organization?.logo),
      images: ((activeOrganization?.images || workspace.organization?.images) || []).map(sanitizeImage).filter(Boolean),
      documents: sanitizeDocuments(activeOrganization?.documents || workspace.organization?.documents)
    },
    branches: (workspace.branches || []).map(branch => ({
      ...branch,
      image: sanitizeImage(branch.image),
      images: (branch.images || []).map(sanitizeImage).filter(Boolean),
      documents: sanitizeDocuments(branch.documents)
    })),
    departments: (workspace.departments || []).map(department => ({
      ...department,
      image: sanitizeImage(department.image),
      images: (department.images || []).map(sanitizeImage).filter(Boolean),
      documents: sanitizeDocuments(department.documents)
    })),
    staff: (workspace.staff || []).map(member => ({
      ...member,
      photo: sanitizeImage(member.photo),
      photos: (member.photos || []).map(sanitizeImage).filter(Boolean),
      documents: sanitizeDocuments(member.documents)
    }))
  };
}

function saveWorkspace(workspace) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  } catch (error) {
    try {
      const safeWorkspace = sanitizeWorkspaceForStorage(workspace);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeWorkspace));
    } catch (fallbackError) {
      console.warn('Unable to persist NGO workspace uploads locally.', fallbackError);
    }
  }
}

const defaultWorkspace = {
  activeOrganizationId: 'org-main',
  organizations: [
    {
      id: 'org-main',
      name: 'Global Hope Foundation',
      legalName: 'Global Hope Foundation International',
      acronym: 'GHF',
      type: 'Faith-Based NGO',
      registrationNo: 'NGO-001-2026',
      taxId: 'TIN-908-445-221',
      foundingDate: '2014-03-12',
      headquarters: 'Addis Ababa HQ',
      address: {
        street: 'Bole Road, House 24',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia',
        postalCode: '1000'
      },
      contact: {
        phone: '+251 900 100 200',
        email: 'admin@globalhope.org',
        website: 'https://globalhope.org'
      },
      primaryContact: {
        name: 'Martha Tesfaye',
        title: 'Country Director',
        email: 'martha@hope.org',
        phone: '+251 900 100 200'
      },
      governance: {
        boardChair: 'Dr. Eleni Bekele',
        executiveDirector: 'Martha Tesfaye',
        fiscalYearStart: 'January',
        complianceStatus: 'Compliant'
      },
      logo: null,
      images: [],
      documents: [
        { id: 'doc-main-registration', name: 'Registration Certificate.pdf', category: 'Registration Certificate', type: 'application/pdf', size: 240000, uploadedAt: '2026-05-01T08:00:00.000Z', dataUrl: '' }
      ],
      defaultLanguage: 'English',
      defaultCurrency: 'USD',
      status: 'Active'
    },
    {
      id: 'org-church',
      name: 'NYARUGENGE CHURCH',
      legalName: 'Nyarugenge Community Church',
      acronym: 'NCC',
      type: 'Faith-Based NGO',
      registrationNo: 'CH-078-2026',
      taxId: 'TIN-RW-442-771',
      foundingDate: '2008-09-21',
      headquarters: 'Kigali Regional Church Office',
      address: {
        street: 'KN 2 Avenue, Nyarugenge Sector',
        city: 'Kigali',
        state: 'Kigali City',
        country: 'Rwanda',
        postalCode: '00000'
      },
      contact: {
        phone: '+250 788 300 900',
        email: 'office@nyarugengechurch.org',
        website: 'https://nyarugengechurch.org'
      },
      primaryContact: {
        name: 'Pastor Grace Mwangi',
        title: 'Senior Pastor',
        email: 'pastor@nyarugengechurch.org',
        phone: '+250 788 300 901'
      },
      governance: {
        boardChair: 'Jean Claude Habimana',
        executiveDirector: 'Pastor Grace Mwangi',
        fiscalYearStart: 'January',
        complianceStatus: 'Compliant'
      },
      logo: null,
      images: [],
      documents: [],
      defaultLanguage: 'English',
      defaultCurrency: 'USD',
      status: 'Active'
    }
  ],
  organization: {
    name: 'Global Hope Foundation',
    legalName: 'Global Hope Foundation International',
    acronym: 'GHF',
    type: 'Faith-Based NGO',
    registrationNo: 'NGO-001-2026',
    taxId: 'TIN-908-445-221',
    foundingDate: '2014-03-12',
    headquarters: 'Addis Ababa HQ',
    address: {
      street: 'Bole Road, House 24',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      country: 'Ethiopia',
      postalCode: '1000'
    },
    contact: {
      phone: '+251 900 100 200',
      email: 'admin@globalhope.org',
      website: 'https://globalhope.org'
    },
    primaryContact: {
      name: 'Martha Tesfaye',
      title: 'Country Director',
      email: 'martha@hope.org',
      phone: '+251 900 100 200'
    },
    governance: {
      boardChair: 'Dr. Eleni Bekele',
      executiveDirector: 'Martha Tesfaye',
      fiscalYearStart: 'January',
      complianceStatus: 'Compliant'
    },
    logo: null,
    images: [],
    documents: [],
    defaultLanguage: 'English',
    defaultCurrency: 'USD'
  },
  branches: [
    { id: 'br-hq', organizationId: 'org-main', name: 'Headquarters', type: 'Headquarters', region: 'Central', country: 'Ethiopia', manager: 'Martha Tesfaye', phone: '+251 900 100 200', gps: '9.0300, 38.7400', status: 'Active' },
    { id: 'br-east', organizationId: 'org-main', name: 'Eastern Regional Office', type: 'Regional Office', region: 'East', country: 'Ethiopia', manager: 'Daniel Bekele', phone: '+251 900 500 700', gps: '9.5940, 41.8661', status: 'Active' },
    { id: 'br-church', organizationId: 'org-church', name: 'Hope Community Church', type: 'Church Branch', region: 'South', country: 'Kenya', manager: 'Pastor Grace Mwangi', phone: '+254 700 300 900', gps: '-1.2921, 36.8219', status: 'Active' }
  ],
  departments: [
    { id: 'dep-programs', name: 'Programs', branchId: 'br-hq', head: 'Samuel Okoro', budget: 250000, status: 'Active' },
    { id: 'dep-finance', name: 'Finance & Grants', branchId: 'br-hq', head: 'Amina Hassan', budget: 90000, status: 'Active' },
    { id: 'dep-field', name: 'Field Operations', branchId: 'br-east', head: 'Joseph Ndirangu', budget: 140000, status: 'Active' }
  ],
  staff: [
    { id: 'st-1', name: 'Martha Tesfaye', role: 'Country Director', departmentId: 'dep-programs', branchId: 'br-hq', reportsTo: '', email: 'martha@hope.org', status: 'Active' },
    { id: 'st-2', name: 'Amina Hassan', role: 'Finance Manager', departmentId: 'dep-finance', branchId: 'br-hq', reportsTo: 'st-1', email: 'amina@hope.org', status: 'Active' },
    { id: 'st-3', name: 'Joseph Ndirangu', role: 'Field Coordinator', departmentId: 'dep-field', branchId: 'br-east', reportsTo: 'st-1', email: 'joseph@hope.org', status: 'Active' }
  ],
  users: [
    { id: 'user-1', organizationId: 'org-main', staffId: 'st-1', fullName: 'Martha Tesfaye', email: 'martha@hope.org', phone: '+251 900 100 200', jobTitle: 'Country Director', departmentId: 'dep-programs', branchId: 'br-hq', roleId: 'role-admin', roleName: 'NGO Administrator', permissions: ['organization', 'finance', 'reports', 'users'], accessScope: 'Organization', accountStatus: 'Active', mfaRequired: true, invitedBy: 'System', approvedBy: 'Board Chair', notes: 'Primary administrative user for the NGO workspace.' },
    { id: 'user-2', organizationId: 'org-main', staffId: 'st-2', fullName: 'Amina Hassan', email: 'amina@hope.org', phone: '', jobTitle: 'Finance Manager', departmentId: 'dep-finance', branchId: 'br-hq', roleId: 'role-finance', roleName: 'Finance Officer', permissions: ['finance', 'grants', 'reports'], accessScope: 'Finance', accountStatus: 'Invited', mfaRequired: true, invitedBy: 'Martha Tesfaye', approvedBy: '', notes: 'Finance workflow user pending activation.' }
  ],
  roles: [
    { id: 'role-admin', name: 'NGO Administrator', permissions: ['organization', 'finance', 'reports', 'users'] },
    { id: 'role-finance', name: 'Finance Officer', permissions: ['finance', 'grants', 'reports'] },
    { id: 'role-field', name: 'Field Officer', permissions: ['beneficiaries', 'gis', 'projects'] }
  ],
  grants: [
    { id: 'grant-1', name: 'Child Sponsorship Grant', donor: 'Global Children Fund', budget: 180000, spent: 72000, deadline: '2026-09-30', compliance: 'On Track', reportStatus: 'Submitted' },
    { id: 'grant-2', name: 'Rural Health Outreach', donor: 'International Health Partners', budget: 260000, spent: 114000, deadline: '2026-11-15', compliance: 'On Track', reportStatus: 'Draft' }
  ],
  payrollRuns: [
    { id: 'pay-1', period: 'May 2026', staffCount: 32, grossPay: 52000, approvals: 'Approved', status: 'Paid' }
  ],
  donorReports: [
    { id: 'report-1', title: 'Q1 Donor Financial Report', donor: 'Global Children Fund', period: 'Q1 2026', income: 90000, expenses: 53000, status: 'Published' }
  ],
  chartOfAccounts: professionalNgoChartOfAccounts,
  bankAccounts: [
    { id: 'bank-1', name: 'Main Operating Bank', bankName: 'Equity Bank', accountNumber: '**** 2041', currency: 'USD', openingBalance: 120000, reconciledBalance: 118500, status: 'Active' }
  ],
  payments: [
    { id: 'pay-v-1', voucherNo: 'PV-2026-001', payee: 'Relief Supplier Ltd', date: '2026-05-12', amount: 18500, accountCode: '5000', bankAccountId: 'bank-1', method: 'Bank Transfer', approvalStatus: 'Approved', paymentStatus: 'Paid', restriction: 'Restricted Grant' }
  ],
  journalEntries: [
    { id: 'je-1', date: '2026-05-01', reference: 'DON-001', description: 'Donor funds received', debitAccount: '1000', creditAccount: '4000', amount: 90000, fund: 'Restricted', posted: true },
    { id: 'je-2', date: '2026-05-12', reference: 'PV-2026-001', description: 'Relief supplies paid', debitAccount: '5000', creditAccount: '1000', amount: 18500, fund: 'Restricted', posted: true }
  ],
  beneficialOwners: [
    { id: 'bo-1', fullName: 'Dr. Eleni Bekele', role: 'Board Chair', ownershipType: 'Governance Control', controlPercent: 0, nationality: 'Ethiopian', idNumber: 'ETH-BOARD-001', pepStatus: 'No', kycStatus: 'Verified', appointmentDate: '2024-01-15', notes: 'Senior governing officer recorded for transparency reporting.' }
  ],
  contracts: [
    { id: 'contract-1', contractNo: 'CON-2026-001', title: 'Community Health Outreach Service Agreement', counterparty: 'International Health Partners', contractType: 'Donor Agreement', projectId: 'project-1', startDate: '2026-01-01', endDate: '2026-12-31', value: 260000, currency: 'USD', storageId: 'storage-1', status: 'Active', riskRating: 'Medium', owner: 'Programs Director' }
  ],
  storages: [
    { id: 'storage-1', name: 'Central Contract Repository', location: 'Headquarters Records Room', storageType: 'Physical + Digital', custodian: 'Compliance Officer', retentionPolicy: '7 years after grant close', accessLevel: 'Restricted', status: 'Active' }
  ],
  tenders: [
    { id: 'tender-1', tenderNo: 'TND-2026-001', title: 'Relief Supplies Framework Procurement', projectId: 'project-1', procurementMethod: 'Open Tender', publishDate: '2026-05-01', closingDate: '2026-06-01', estimatedValue: 85000, currency: 'USD', evaluationMethod: 'Quality and Cost Based', status: 'Open', committee: 'Procurement Committee' }
  ],
  projects: [
    { id: 'project-1', code: 'PRJ-HEALTH-2026', name: 'Rural Health Outreach', programArea: 'Health', donor: 'International Health Partners', manager: 'Samuel Okoro', startDate: '2026-01-01', endDate: '2026-12-31', budget: 260000, spent: 114000, beneficiariesTarget: 5000, beneficiariesReached: 2140, status: 'Active', outcome: 'Improved primary health access' }
  ],
  impacts: [
    { id: 'impact-1', projectId: 'project-1', indicator: 'Patients reached through mobile clinics', baseline: 0, target: 5000, actual: 2140, unit: 'People', reportingPeriod: 'Q2 2026', dataSource: 'Clinic register', verificationStatus: 'Verified', narrative: 'Mobile clinic visits increased access for remote communities.' }
  ],
  evaluations: [
    { id: 'evaluation-1', projectId: 'project-1', title: 'Midline Quality Review', evaluationType: 'Midline', evaluator: 'MEAL Manager', plannedDate: '2026-07-15', completedDate: '', score: 82, recommendation: 'Increase outreach frequency in low-coverage sites.', status: 'Planned' }
  ],
  fieldSites: [
    { id: 'site-1', name: 'Kombolcha Village Program', branchId: 'br-east', officer: 'Joseph Ndirangu', gps: '11.0840, 39.7430', beneficiaries: 820, status: 'Active' },
    { id: 'site-2', name: 'Nairobi Youth Center', branchId: 'br-church', officer: 'Pastor Grace Mwangi', gps: '-1.2864, 36.8172', beneficiaries: 430, status: 'Active' }
  ],
  fieldVisits: [
    { id: 'visit-1', siteId: 'site-1', date: '2026-05-18', officer: 'Joseph Ndirangu', purpose: 'Food distribution verification', outcome: 'Completed' }
  ],
  serviceControls: [
    { id: 'svc-1', service: 'Finance', owner: 'Finance Officer', linkedModule: 'Budgets, grants, payroll, donor reports', status: 'Enabled' },
    { id: 'svc-2', service: 'GIS Field Operations', owner: 'Field Officer', linkedModule: 'Branches, field sites, visits, beneficiaries', status: 'Enabled' },
    { id: 'svc-3', service: 'Procurement & Stock', owner: 'NGO Administrator', linkedModule: 'Relief stock, purchase requests, distribution tracking', status: 'Enabled' },
    { id: 'svc-4', service: 'Church Operations', owner: 'NGO Administrator', linkedModule: 'Church branches, offerings, pastoral visits, attendance', status: 'Enabled' }
  ],
  languages: ['English', 'Amharic', 'Arabic', 'French'],
  currencies: ['USD', 'ETB', 'KES', 'EUR'],
  auditEvents: [
    { id: 'audit-1', message: 'Workspace initialized with NGO operating controls', at: new Date().toISOString() }
  ]
};

const branchTypes = ['Headquarters', 'Regional Office', 'Country Office', 'Field Office', 'Church Branch'];
const statusOptions = ['Active', 'Planning', 'Suspended'];
const permissionOptions = ['organization', 'projects', 'donors', 'beneficiaries', 'volunteers', 'church', 'finance', 'grants', 'gis', 'reports', 'users'];

const blankBranch = {
  organizationId: '',
  organization: null,
  name: '',
  type: 'Regional Office',
  region: '',
  country: '',
  city: '',
  district: '',
  street: '',
  postalCode: '',
  manager: '',
  email: '',
  phone: '',
  gps: '',
  openingDate: '',
  capacity: 0,
  services: [],
  church: {
    pastor: '',
    congregationSize: 0,
    serviceTimes: ''
  },
  image: null,
  images: [],
  documents: [],
  status: 'Active'
};

const blankDepartment = {
  organizationId: '',
  organization: null,
  branch: null,
  name: '',
  branchId: '',
  head: '',
  email: '',
  phone: '',
  costCenter: '',
  accountCode: '',
  objective: '',
  kpi: '',
  services: [],
  image: null,
  images: [],
  documents: [],
  budget: 0,
  status: 'Active'
};

const blankStaff = {
  organizationId: '',
  organization: null,
  branch: null,
  department: null,
  name: '',
  role: '',
  employeeId: '',
  employmentType: 'Full-time',
  startDate: '',
  departmentId: '',
  branchId: '',
  reportsTo: '',
  email: '',
  phone: '',
  skills: '',
  permissions: [],
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  photo: null,
  photos: [],
  documents: [],
  status: 'Active'
};

const blankRole = {
  organizationId: '',
  organization: null,
  name: '',
  description: '',
  scope: 'Organization',
  branchIds: [],
  departmentIds: [],
  staffIds: [],
  permissions: ['organization'],
  approvalLimit: 0,
  status: 'Active'
};

const blankOrganization = {
  name: '',
  legalName: '',
  acronym: '',
  type: 'Faith-Based NGO',
  registrationNo: '',
  taxId: '',
  foundingDate: '',
  headquarters: '',
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  },
  contact: {
    phone: '',
    email: '',
    website: ''
  },
  primaryContact: {
    name: '',
    title: '',
    email: '',
    phone: ''
  },
  governance: {
    boardChair: '',
    executiveDirector: '',
    fiscalYearStart: 'January',
    complianceStatus: 'Compliant'
  },
  logo: null,
  images: [],
  documents: [],
  defaultLanguage: 'English',
  defaultCurrency: 'USD',
  status: 'Active'
};

const blankGrant = {
  id: '',
  projectId: '',
  name: '',
  donor: '',
  budget: 0,
  spent: 0,
  deadline: '',
  compliance: 'On Track',
  reportStatus: 'Draft',
  approvalStatus: 'Pending',
  approvedBy: '',
  approvedAt: ''
};

const blankPayroll = {
  id: '',
  projectId: '',
  period: '',
  staffCount: 0,
  grossPay: 0,
  approvals: 'Pending',
  status: 'Draft',
  preparedBy: '',
  reviewedBy: '',
  approvedBy: '',
  approvedAt: ''
};

const blankDonorReport = {
  id: '',
  projectId: '',
  grantId: '',
  title: '',
  donor: '',
  period: '',
  income: 0,
  expenses: 0,
  revenueAccount: '4010',
  expenseAccount: '5000',
  recognitionBasis: 'Accrual',
  status: 'Draft',
  reviewedBy: '',
  approvedBy: '',
  approvedAt: ''
};

const blankAccount = {
  code: '',
  name: '',
  type: 'Asset',
  fund: 'Unrestricted',
  restricted: false,
  category: ''
};

const blankBeneficialOwner = {
  fullName: '',
  role: '',
  ownershipType: 'Governance Control',
  controlPercent: 0,
  nationality: '',
  idNumber: '',
  pepStatus: 'No',
  kycStatus: 'Pending',
  appointmentDate: '',
  notes: ''
};

const blankContract = {
  contractNo: '',
  title: '',
  counterparty: '',
  contractType: 'Service Agreement',
  projectId: '',
  startDate: '',
  endDate: '',
  value: 0,
  currency: 'USD',
  storageId: '',
  status: 'Draft',
  riskRating: 'Low',
  owner: ''
};

const blankStorage = {
  name: '',
  location: '',
  storageType: 'Digital Repository',
  custodian: '',
  retentionPolicy: '7 years',
  accessLevel: 'Restricted',
  status: 'Active'
};

const blankTender = {
  tenderNo: '',
  title: '',
  projectId: '',
  procurementMethod: 'Open Tender',
  publishDate: '',
  closingDate: '',
  estimatedValue: 0,
  currency: 'USD',
  evaluationMethod: 'Quality and Cost Based',
  status: 'Draft',
  committee: ''
};

const blankProject = {
  code: '',
  name: '',
  programArea: '',
  donor: '',
  manager: '',
  startDate: '',
  endDate: '',
  budget: 0,
  spent: 0,
  beneficiariesTarget: 0,
  beneficiariesReached: 0,
  status: 'Planning',
  outcome: ''
};

const blankImpact = {
  projectId: '',
  indicator: '',
  baseline: 0,
  target: 0,
  actual: 0,
  unit: '',
  reportingPeriod: '',
  dataSource: '',
  verificationStatus: 'Pending',
  narrative: ''
};

const blankEvaluation = {
  projectId: '',
  title: '',
  evaluationType: 'Baseline',
  evaluator: '',
  plannedDate: '',
  completedDate: '',
  score: 0,
  recommendation: '',
  status: 'Planned'
};

const blankBankAccount = {
  id: '',
  accountCode: '',
  name: '',
  bankName: '',
  accountNumber: '',
  currency: 'USD',
  openingBalance: 0,
  reconciledBalance: 0,
  status: 'Active'
};

const blankPayment = {
  id: '',
  projectId: '',
  grantId: '',
  voucherNo: '',
  payee: '',
  date: '',
  amount: 0,
  accountCode: '',
  bankAccountId: '',
  method: 'Bank Transfer',
  approvalStatus: 'Pending',
  paymentStatus: 'Draft',
  restriction: 'Unrestricted',
  documentationStatus: 'Pending',
  preparedBy: '',
  reviewedBy: '',
  approvedBy: '',
  approvedAt: '',
  notes: ''
};

const blankJournalEntry = {
  id: '',
  projectId: '',
  grantId: '',
  date: '',
  reference: '',
  description: '',
  debitAccount: '',
  creditAccount: '',
  amount: 0,
  fund: 'Unrestricted',
  posted: false,
  approvalStatus: 'Pending',
  preparedBy: '',
  approvedBy: '',
  approvedAt: ''
};

const blankFieldSite = {
  name: '',
  branchId: '',
  officer: '',
  gps: '',
  beneficiaries: 0,
  status: 'Active'
};

const blankFieldVisit = {
  siteId: '',
  date: '',
  officer: '',
  purpose: '',
  outcome: 'Scheduled'
};

const blankServiceControl = {
  service: '',
  owner: '',
  linkedModule: '',
  status: 'Enabled'
};

const documentCategories = [
  'Registration Certificate',
  'Tax Certificate',
  'Constitution / Bylaws',
  'Board Resolution',
  'Annual Report',
  'Donor Agreement',
  'Church License',
  'Other'
];

const branchDocumentCategories = [
  'Lease / Ownership',
  'Branch License',
  'Church Registration',
  'Safety Certificate',
  'Field Office Agreement',
  'Photo Evidence',
  'Other'
];

const branchServiceOptions = ['Programs', 'Donor Services', 'Beneficiary Support', 'Church Services', 'Finance', 'Procurement', 'Stock Distribution', 'Field Operations', 'Communication', 'Reports'];

const departmentDocumentCategories = [
  'Department Policy',
  'Budget Approval',
  'Work Plan',
  'KPI Report',
  'Audit Evidence',
  'Staff Assignment',
  'Other'
];

const departmentServiceOptions = ['Projects', 'Donors', 'Beneficiaries', 'Volunteers', 'Church', 'Finance', 'Grants', 'HR', 'Payroll', 'Procurement', 'Inventory', 'Communication', 'GIS', 'Reports'];

const staffDocumentCategories = [
  'Contract',
  'ID / Passport',
  'Certificate',
  'Training Record',
  'Performance Review',
  'Payroll Document',
  'Other'
];

const staffPermissionOptions = ['organization', 'projects', 'donors', 'beneficiaries', 'volunteers', 'church', 'finance', 'grants', 'gis', 'reports', 'hr', 'payroll', 'procurement', 'inventory'];

const permissionCatalog = [
  { id: 'organization', label: 'Organization', group: 'Administration' },
  { id: 'users', label: 'Users', group: 'Administration' },
  { id: 'hr', label: 'HR', group: 'Administration' },
  { id: 'payroll', label: 'Payroll', group: 'Finance' },
  { id: 'finance', label: 'Finance', group: 'Finance' },
  { id: 'grants', label: 'Grants', group: 'Finance' },
  { id: 'projects', label: 'Projects', group: 'Programs' },
  { id: 'donors', label: 'Donors', group: 'Programs' },
  { id: 'beneficiaries', label: 'Beneficiaries', group: 'Programs' },
  { id: 'volunteers', label: 'Volunteers', group: 'Programs' },
  { id: 'church', label: 'Church', group: 'Church' },
  { id: 'gis', label: 'GIS', group: 'Field' },
  { id: 'procurement', label: 'Procurement', group: 'Operations' },
  { id: 'inventory', label: 'Inventory', group: 'Operations' },
  { id: 'reports', label: 'Reports', group: 'Analytics' }
];

const roleScopes = ['Organization', 'Branches', 'Departments', 'Staff', 'Custom'];
const accountTypes = ['Asset', 'Liability', 'Net Assets', 'Revenue', 'Expense'];
const fundTypes = ['Unrestricted', 'Temporarily Restricted', 'Restricted', 'Board Designated'];

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function mergeProfessionalAccounts(accounts = [], organizationId = 'org-main') {
  const existing = new Map(accounts.map(account => [String(account.code), account]));
  professionalNgoChartOfAccounts.forEach(account => {
    if (!existing.has(account.code)) {
      existing.set(account.code, { ...account, organizationId });
      return;
    }

    const current = existing.get(account.code);
    existing.set(account.code, {
      ...current,
      ...account,
      id: current.id || account.id,
      organizationId: current.organizationId || organizationId
    });
  });
  return Array.from(existing.values()).sort((first, second) => String(first.code).localeCompare(String(second.code)));
}

function stampOrganization(records = [], organizationId = 'org-main') {
  return records.map(record => ({
    ...record,
    organizationId: record.organizationId || organizationId
  }));
}

function money(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function readWorkspace() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        ...defaultWorkspace,
      chartOfAccounts: mergeProfessionalAccounts(defaultWorkspace.chartOfAccounts, defaultWorkspace.activeOrganizationId),
        suppressedChartAccounts: {},
        bankAccounts: stampOrganization(defaultWorkspace.bankAccounts, defaultWorkspace.activeOrganizationId),
        payments: stampOrganization(defaultWorkspace.payments, defaultWorkspace.activeOrganizationId),
        journalEntries: stampOrganization(defaultWorkspace.journalEntries, defaultWorkspace.activeOrganizationId),
        grants: stampOrganization(defaultWorkspace.grants, defaultWorkspace.activeOrganizationId),
        payrollRuns: stampOrganization(defaultWorkspace.payrollRuns, defaultWorkspace.activeOrganizationId),
        donorReports: stampOrganization(defaultWorkspace.donorReports, defaultWorkspace.activeOrganizationId),
        users: stampOrganization(defaultWorkspace.users, defaultWorkspace.activeOrganizationId)
      };
    }
    const parsed = JSON.parse(stored);
    const organizations = (parsed.organizations || [
      {
        id: 'org-main',
        registrationNo: '',
        status: 'Active',
        ...(parsed.organization || defaultWorkspace.organization)
      }
    ]).map(organization => ({
      ...organization,
      images: organization.images || (organization.logo ? [organization.logo] : [])
    }));
    const activeOrganizationId = parsed.activeOrganizationId || organizations[0]?.id || 'org-main';
    const activeOrganization = organizations.find(organization => organization.id === activeOrganizationId) || organizations[0] || defaultWorkspace.organization;
    return {
      ...defaultWorkspace,
      ...parsed,
      activeOrganizationId,
      organizations,
        organization: {
          ...defaultWorkspace.organization,
          ...(activeOrganization || {}),
          address: { ...defaultWorkspace.organization.address, ...((activeOrganization || {}).address || {}) },
          contact: { ...defaultWorkspace.organization.contact, ...((activeOrganization || {}).contact || {}) },
          primaryContact: { ...defaultWorkspace.organization.primaryContact, ...((activeOrganization || {}).primaryContact || {}) },
          governance: { ...defaultWorkspace.organization.governance, ...((activeOrganization || {}).governance || {}) },
          logo: (activeOrganization || {}).logo || null,
          images: (activeOrganization || {}).images || ((activeOrganization || {}).logo ? [(activeOrganization || {}).logo] : []),
          documents: (activeOrganization || {}).documents || []
        },
      branches: (parsed.branches || defaultWorkspace.branches).map(branch => ({
        organizationId: activeOrganizationId,
        ...branch,
        images: branch.images || (branch.image ? [branch.image] : [])
      })),
      departments: (parsed.departments || defaultWorkspace.departments).map(department => ({
        ...department,
        images: department.images || (department.image ? [department.image] : [])
      })),
      staff: (parsed.staff || defaultWorkspace.staff).map(member => ({
        ...member,
        photos: member.photos || (member.photo ? [member.photo] : [])
      })),
      users: stampOrganization(parsed.users || defaultWorkspace.users, activeOrganizationId),
      roles: parsed.roles || defaultWorkspace.roles,
      grants: stampOrganization(parsed.grants || defaultWorkspace.grants, activeOrganizationId),
      payrollRuns: stampOrganization(parsed.payrollRuns || defaultWorkspace.payrollRuns, activeOrganizationId),
      donorReports: stampOrganization(parsed.donorReports || defaultWorkspace.donorReports, activeOrganizationId),
      chartOfAccounts: mergeProfessionalAccounts(stampOrganization(parsed.chartOfAccounts || defaultWorkspace.chartOfAccounts, activeOrganizationId), activeOrganizationId),
      suppressedChartAccounts: parsed.suppressedChartAccounts || {},
      bankAccounts: stampOrganization(parsed.bankAccounts || defaultWorkspace.bankAccounts, activeOrganizationId),
      payments: stampOrganization(parsed.payments || defaultWorkspace.payments, activeOrganizationId),
      journalEntries: stampOrganization(parsed.journalEntries || defaultWorkspace.journalEntries, activeOrganizationId),
      beneficialOwners: parsed.beneficialOwners || defaultWorkspace.beneficialOwners,
      contracts: parsed.contracts || defaultWorkspace.contracts,
      storages: parsed.storages || defaultWorkspace.storages,
      tenders: parsed.tenders || defaultWorkspace.tenders,
      projects: parsed.projects || defaultWorkspace.projects,
      impacts: parsed.impacts || defaultWorkspace.impacts,
      evaluations: parsed.evaluations || defaultWorkspace.evaluations,
      fieldSites: parsed.fieldSites || defaultWorkspace.fieldSites,
      fieldVisits: parsed.fieldVisits || defaultWorkspace.fieldVisits,
      serviceControls: parsed.serviceControls || defaultWorkspace.serviceControls,
      languages: parsed.languages || defaultWorkspace.languages,
      currencies: parsed.currencies || defaultWorkspace.currencies,
      auditEvents: parsed.auditEvents || defaultWorkspace.auditEvents
    };
  } catch {
    return defaultWorkspace;
  }
}

function addAudit(workspace, message) {
  return {
    ...workspace,
    auditEvents: [
      { id: createId('audit'), message, at: new Date().toISOString() },
      ...(workspace.auditEvents || [])
    ].slice(0, 12)
  };
}

function setDeepValue(target, path, value) {
  const keys = path.split('.');
  const copy = { ...target };
  let cursor = copy;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    cursor[key] = { ...(cursor[key] || {}) };
    cursor = cursor[key];
  });

  return copy;
}

function getFullAddress(organization) {
  const address = organization.address || {};
  return [address.street, address.city, address.state, address.country, address.postalCode]
    .filter(Boolean)
    .join(', ') || organization.headquarters || 'Address not set';
}

function getBranchAddress(branch = {}) {
  return [branch.street, branch.city, branch.district, branch.region, branch.country, branch.postalCode]
    .filter(Boolean)
    .join(', ') || `${branch.region || ''}${branch.country ? `, ${branch.country}` : ''}` || 'Address not set';
}

function getOrganizationSnapshot(organization = {}) {
  return {
    id: organization.id,
    name: organization.name || '',
    legalName: organization.legalName || '',
    acronym: organization.acronym || '',
    type: organization.type || '',
    registrationNo: organization.registrationNo || '',
    taxId: organization.taxId || '',
    headquarters: organization.headquarters || '',
    address: organization.address || {},
    contact: organization.contact || {},
    primaryContact: organization.primaryContact || {},
    defaultLanguage: organization.defaultLanguage || '',
    defaultCurrency: organization.defaultCurrency || '',
    complianceStatus: organization.governance?.complianceStatus || ''
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readImageAsDataUrl(file) {
  const originalDataUrl = await readFileAsDataUrl(file);

  if (file.size <= MAX_PERSISTED_IMAGE_BYTES) {
    return { dataUrl: originalDataUrl, size: file.size };
  }

  return new Promise(resolve => {
    const image = new window.Image();
    image.onload = () => {
      const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      if (!context) {
        resolve({ dataUrl: originalDataUrl, size: file.size });
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(type, type === 'image/jpeg' ? IMAGE_QUALITY : undefined);
      resolve({
        dataUrl,
        size: Math.round((dataUrl.length * 3) / 4),
        optimized: true
      });
    };
    image.onerror = () => resolve({ dataUrl: originalDataUrl, size: file.size });
    image.src = originalDataUrl;
  });
}

function formatFileSize(size = 0) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NGODashboard() {
  const [workspace, setWorkspace] = useState(readWorkspace);
  const [activeTab, setActiveTab] = useState('organization');
  const [financeSection, setFinanceSection] = useState('income');
  const [projectSection, setProjectSection] = useState('projects');
  const [contractSection, setContractSection] = useState('contracts');
  const [impactSection, setImpactSection] = useState('indicators');
  const [branchForm, setBranchForm] = useState(blankBranch);
  const [departmentForm, setDepartmentForm] = useState(blankDepartment);
  const [staffForm, setStaffForm] = useState(blankStaff);
  const [roleForm, setRoleForm] = useState(blankRole);
  const [organizationForm, setOrganizationForm] = useState(blankOrganization);
  const [grantForm, setGrantForm] = useState(blankGrant);
  const [payrollForm, setPayrollForm] = useState(blankPayroll);
  const [donorReportForm, setDonorReportForm] = useState(blankDonorReport);
  const [accountForm, setAccountForm] = useState(blankAccount);
  const [bankForm, setBankForm] = useState(blankBankAccount);
  const [paymentForm, setPaymentForm] = useState(blankPayment);
  const [journalForm, setJournalForm] = useState(blankJournalEntry);
  const [beneficialOwnerForm, setBeneficialOwnerForm] = useState(blankBeneficialOwner);
  const [contractForm, setContractForm] = useState(blankContract);
  const [storageForm, setStorageForm] = useState(blankStorage);
  const [tenderForm, setTenderForm] = useState(blankTender);
  const [projectForm, setProjectForm] = useState(blankProject);
  const [impactForm, setImpactForm] = useState(blankImpact);
  const [evaluationForm, setEvaluationForm] = useState(blankEvaluation);
  const [fieldSiteForm, setFieldSiteForm] = useState(blankFieldSite);
  const [fieldVisitForm, setFieldVisitForm] = useState(blankFieldVisit);
  const [serviceForm, setServiceForm] = useState(blankServiceControl);
  const [newLanguage, setNewLanguage] = useState('');
  const [newCurrency, setNewCurrency] = useState('');
  const [documentCategory, setDocumentCategory] = useState(documentCategories[0]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [branchDocumentCategory, setBranchDocumentCategory] = useState(branchDocumentCategories[0]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [departmentDocumentCategory, setDepartmentDocumentCategory] = useState(departmentDocumentCategories[0]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [staffDocumentCategory, setStaffDocumentCategory] = useState(staffDocumentCategories[0]);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);

  const currentOrganization = useMemo(
    () => workspace.organizations.find(organization => organization.id === workspace.activeOrganizationId) || workspace.organizations[0] || workspace.organization,
    [workspace.activeOrganizationId, workspace.organization, workspace.organizations]
  );

  const organizationImages = useMemo(
    () => currentOrganization.images?.length ? currentOrganization.images : (currentOrganization.logo ? [currentOrganization.logo] : []),
    [currentOrganization]
  );

  const organizationById = useMemo(
    () => Object.fromEntries(workspace.organizations.map(organization => [organization.id, organization])),
    [workspace.organizations]
  );

  const scopedBranches = useMemo(
    () => workspace.branches.filter(branch => !branch.organizationId || branch.organizationId === currentOrganization.id),
    [currentOrganization.id, workspace.branches]
  );

  const departmentFormOrganization = useMemo(
    () => organizationById[departmentForm.organizationId] || currentOrganization,
    [currentOrganization, departmentForm.organizationId, organizationById]
  );

  const departmentFormBranches = useMemo(
    () => workspace.branches.filter(branch => !branch.organizationId || branch.organizationId === departmentFormOrganization.id),
    [departmentFormOrganization.id, workspace.branches]
  );

  const selectedBranch = useMemo(
    () => scopedBranches.find(branch => branch.id === selectedBranchId) || scopedBranches[0] || null,
    [scopedBranches, selectedBranchId]
  );

  const selectedBranchImages = useMemo(
    () => selectedBranch?.images?.length ? selectedBranch.images : (selectedBranch?.image ? [selectedBranch.image] : []),
    [selectedBranch]
  );

  const scopedDepartments = useMemo(
    () => workspace.departments.filter(department => scopedBranches.some(branch => branch.id === department.branchId)),
    [scopedBranches, workspace.departments]
  );

  const selectedDepartment = useMemo(
    () => scopedDepartments.find(department => department.id === selectedDepartmentId) || scopedDepartments[0] || null,
    [scopedDepartments, selectedDepartmentId]
  );

  const selectedDepartmentImages = useMemo(
    () => selectedDepartment?.images?.length ? selectedDepartment.images : (selectedDepartment?.image ? [selectedDepartment.image] : []),
    [selectedDepartment]
  );

  const scopedStaff = useMemo(
    () => workspace.staff.filter(member => scopedBranches.some(branch => branch.id === member.branchId)),
    [scopedBranches, workspace.staff]
  );

  const staffFormOrganization = useMemo(
    () => organizationById[staffForm.organizationId] || currentOrganization,
    [currentOrganization, organizationById, staffForm.organizationId]
  );

  const staffFormBranches = useMemo(
    () => workspace.branches.filter(branch => !branch.organizationId || branch.organizationId === staffFormOrganization.id),
    [staffFormOrganization.id, workspace.branches]
  );

  const staffFormDepartments = useMemo(
    () => workspace.departments.filter(department => staffFormBranches.some(branch => branch.id === department.branchId)),
    [staffFormBranches, workspace.departments]
  );

  const staffFormReportsTo = useMemo(
    () => workspace.staff.filter(member => {
      if (member.id === staffForm.id) return false;
      if (member.organizationId) return member.organizationId === staffFormOrganization.id;
      return staffFormBranches.some(branch => branch.id === member.branchId);
    }),
    [staffForm.id, staffFormBranches, staffFormOrganization.id, workspace.staff]
  );

  const selectedStaff = useMemo(
    () => scopedStaff.find(member => member.id === selectedStaffId) || scopedStaff[0] || null,
    [scopedStaff, selectedStaffId]
  );

  const selectedStaffPhotos = useMemo(
    () => selectedStaff?.photos?.length ? selectedStaff.photos : (selectedStaff?.photo ? [selectedStaff.photo] : []),
    [selectedStaff]
  );

  const roleFormOrganization = useMemo(
    () => organizationById[roleForm.organizationId] || currentOrganization,
    [currentOrganization, organizationById, roleForm.organizationId]
  );

  const scopedRoles = useMemo(
    () => workspace.roles.filter(role => !role.organizationId || role.organizationId === currentOrganization.id),
    [currentOrganization.id, workspace.roles]
  );

  const scopedGrants = useMemo(
    () => workspace.grants.filter(grant => grant.organizationId === currentOrganization.id),
    [currentOrganization.id, workspace.grants]
  );

  const scopedPayrollRuns = useMemo(
    () => workspace.payrollRuns.filter(payroll => payroll.organizationId === currentOrganization.id),
    [currentOrganization.id, workspace.payrollRuns]
  );

  const scopedDonorReports = useMemo(
    () => workspace.donorReports.filter(report => report.organizationId === currentOrganization.id),
    [currentOrganization.id, workspace.donorReports]
  );

  const scopedSuppressedChartAccounts = workspace.suppressedChartAccounts?.[currentOrganization.id] || [];

  const scopedChartOfAccounts = useMemo(
    () => mergeProfessionalAccounts(
      workspace.chartOfAccounts.filter(account => account.organizationId === currentOrganization.id),
      currentOrganization.id
    ).filter(account => !scopedSuppressedChartAccounts.includes(account.code)),
    [currentOrganization.id, scopedSuppressedChartAccounts, workspace.chartOfAccounts]
  );

  const scopedBankAccounts = useMemo(
    () => workspace.bankAccounts.filter(bank => bank.organizationId === currentOrganization.id),
    [currentOrganization.id, workspace.bankAccounts]
  );

  const scopedPayments = useMemo(
    () => workspace.payments.filter(payment => payment.organizationId === currentOrganization.id),
    [currentOrganization.id, workspace.payments]
  );

  const scopedJournalEntries = useMemo(
    () => workspace.journalEntries.filter(entry => entry.organizationId === currentOrganization.id),
    [currentOrganization.id, workspace.journalEntries]
  );

  const selectedRole = useMemo(
    () => scopedRoles.find(role => role.id === selectedRoleId) || scopedRoles[0] || null,
    [scopedRoles, selectedRoleId]
  );

  const selectedRoleOrganization = useMemo(
    () => organizationById[selectedRole?.organizationId] || currentOrganization,
    [currentOrganization, organizationById, selectedRole?.organizationId]
  );

  const roleScopedBranches = useMemo(
    () => workspace.branches.filter(branch => !branch.organizationId || branch.organizationId === selectedRoleOrganization.id),
    [selectedRoleOrganization.id, workspace.branches]
  );

  const roleScopedDepartments = useMemo(
    () => workspace.departments.filter(department => roleScopedBranches.some(branch => branch.id === department.branchId)),
    [roleScopedBranches, workspace.departments]
  );

  const roleScopedStaff = useMemo(
    () => workspace.staff.filter(member => {
      if (member.organizationId) return member.organizationId === selectedRoleOrganization.id;
      return roleScopedBranches.some(branch => branch.id === member.branchId);
    }),
    [roleScopedBranches, selectedRoleOrganization.id, workspace.staff]
  );

  useEffect(() => {
    if (!scopedBranches.length) {
      if (selectedBranchId) setSelectedBranchId('');
      return;
    }
    if (!scopedBranches.some(branch => branch.id === selectedBranchId)) {
      setSelectedBranchId(scopedBranches[0].id);
    }
  }, [scopedBranches, selectedBranchId]);

  useEffect(() => {
    if (!scopedDepartments.length) {
      if (selectedDepartmentId) setSelectedDepartmentId('');
      return;
    }
    if (!scopedDepartments.some(department => department.id === selectedDepartmentId)) {
      setSelectedDepartmentId(scopedDepartments[0].id);
    }
  }, [scopedDepartments, selectedDepartmentId]);

  useEffect(() => {
    if (!scopedStaff.length) {
      if (selectedStaffId) setSelectedStaffId('');
      return;
    }
    if (!scopedStaff.some(member => member.id === selectedStaffId)) {
      setSelectedStaffId(scopedStaff[0].id);
    }
  }, [scopedStaff, selectedStaffId]);

  useEffect(() => {
    if (!scopedRoles.length) {
      if (selectedRoleId) setSelectedRoleId('');
      return;
    }
    if (!scopedRoles.some(role => role.id === selectedRoleId)) {
      setSelectedRoleId(scopedRoles[0].id);
    }
  }, [scopedRoles, selectedRoleId]);

  useEffect(() => {
    setBranchForm(current => ({
      ...current,
      organizationId: workspace.activeOrganizationId,
      country: current.country || currentOrganization.address?.country || '',
      city: current.city || currentOrganization.address?.city || '',
      street: current.street || currentOrganization.address?.street || '',
      postalCode: current.postalCode || currentOrganization.address?.postalCode || '',
      email: current.email || currentOrganization.contact?.email || '',
      phone: current.phone || currentOrganization.contact?.phone || '',
      manager: current.manager || currentOrganization.primaryContact?.name || ''
    }));
  }, [currentOrganization, workspace.activeOrganizationId]);

  useEffect(() => {
    setDepartmentForm(current => {
      const organizationId = current.organizationId || currentOrganization.id;
      const branches = workspace.branches.filter(branch => !branch.organizationId || branch.organizationId === organizationId);
      const branchStillAvailable = branches.some(branch => branch.id === current.branchId);
      return {
        ...current,
        organizationId,
        branchId: branchStillAvailable ? current.branchId : branches[0]?.id || ''
      };
    });
  }, [currentOrganization.id, workspace.branches]);

  useEffect(() => {
    setStaffForm(current => {
      const organizationId = current.organizationId || currentOrganization.id;
      const branches = workspace.branches.filter(branch => !branch.organizationId || branch.organizationId === organizationId);
      const branchStillAvailable = branches.some(branch => branch.id === current.branchId);
      const branchId = branchStillAvailable ? current.branchId : branches[0]?.id || '';
      const departments = workspace.departments.filter(department => branches.some(branch => branch.id === department.branchId));
      const departmentStillAvailable = departments.some(department => department.id === current.departmentId);

      return {
        ...current,
        organizationId,
        branchId,
        departmentId: departmentStillAvailable ? current.departmentId : departments[0]?.id || '',
        reportsTo: current.reportsTo && workspace.staff.some(member => member.id === current.reportsTo && (!member.organizationId || member.organizationId === organizationId))
          ? current.reportsTo
          : ''
      };
    });
  }, [currentOrganization.id, workspace.branches, workspace.departments, workspace.staff]);

  const branchById = useMemo(
    () => Object.fromEntries(workspace.branches.map(branch => [branch.id, branch])),
    [workspace.branches]
  );

  const departmentById = useMemo(
    () => Object.fromEntries(workspace.departments.map(department => [department.id, department])),
    [workspace.departments]
  );

  const projectById = useMemo(
    () => Object.fromEntries(workspace.projects.map(project => [project.id, project])),
    [workspace.projects]
  );

  const fieldSiteById = useMemo(
    () => Object.fromEntries(workspace.fieldSites.map(site => [site.id, site])),
    [workspace.fieldSites]
  );

  const summary = useMemo(() => {
    const activeBranches = scopedBranches.filter(branch => branch.status === 'Active').length;
    const activeStaff = scopedStaff.filter(member => member.status === 'Active').length;
    const totalBudget = scopedDepartments.reduce((sum, department) => sum + Number(department.budget || 0), 0);
    const grantBudget = scopedGrants.reduce((sum, grant) => sum + Number(grant.budget || 0), 0);
    const grantSpent = scopedGrants.reduce((sum, grant) => sum + Number(grant.spent || 0), 0);
    const payrollTotal = scopedPayrollRuns.reduce((sum, payroll) => sum + Number(payroll.grossPay || 0), 0);
    const donorIncome = scopedDonorReports.reduce((sum, report) => sum + Number(report.income || 0), 0);
    const donorExpenses = scopedDonorReports.reduce((sum, report) => sum + Number(report.expenses || 0), 0);
    const paymentTotal = scopedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const bankBalance = scopedBankAccounts.reduce((sum, bank) => sum + Number(bank.reconciledBalance || 0), 0);
    const projectBudget = workspace.projects.reduce((sum, project) => sum + Number(project.budget || 0), 0);
    const projectSpent = workspace.projects.reduce((sum, project) => sum + Number(project.spent || 0), 0);
    const impactTarget = workspace.impacts.reduce((sum, impact) => sum + Number(impact.target || 0), 0);
    const impactActual = workspace.impacts.reduce((sum, impact) => sum + Number(impact.actual || 0), 0);
    const tenderValue = workspace.tenders.reduce((sum, tender) => sum + Number(tender.estimatedValue || 0), 0);
    const contractValue = workspace.contracts.reduce((sum, contract) => sum + Number(contract.value || 0), 0);
    const postedDebits = scopedJournalEntries.filter(entry => entry.posted).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const postedCredits = scopedJournalEntries.filter(entry => entry.posted).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const mappedLocations = [
      ...scopedBranches.filter(branch => branch.gps?.trim()),
      ...workspace.fieldSites.filter(site => site.gps?.trim())
    ].length;
    const beneficiariesMapped = workspace.fieldSites.reduce((sum, site) => sum + Number(site.beneficiaries || 0), 0);

    return {
      activeBranches,
      activeStaff,
      totalBudget,
      grantBudget,
      grantSpent,
      payrollTotal,
      donorIncome,
      donorExpenses,
      paymentTotal,
      bankBalance,
      projectBudget,
      projectSpent,
      impactTarget,
      impactActual,
      tenderValue,
      contractValue,
      postedDebits,
      postedCredits,
      mappedLocations,
      beneficiariesMapped
    };
  }, [scopedBankAccounts, scopedBranches, scopedDepartments, scopedDonorReports, scopedGrants, scopedJournalEntries, scopedPayrollRuns, scopedPayments, scopedStaff, workspace]);

  const readiness = useMemo(() => {
    const hasFinanceDepartment = workspace.departments.some(department => department.name.toLowerCase().includes('finance'));
    const hasApprovedPayroll = scopedPayrollRuns.some(payroll => payroll.approvals === 'Approved');
    const hasCompliantGrant = scopedGrants.some(grant => grant.compliance === 'On Track');
    const hasPublishedReport = scopedDonorReports.some(report => report.status === 'Published');
    const financeReady = hasFinanceDepartment && summary.totalBudget > 0 && hasApprovedPayroll && hasCompliantGrant && hasPublishedReport;

    const hasMappedSites = workspace.fieldSites.filter(site => site.gps?.trim()).length > 0;
    const hasFieldOfficer = workspace.staff.some(member => member.role.toLowerCase().includes('field'));
    const hasFieldVisit = workspace.fieldVisits.some(visit => visit.outcome === 'Completed');
    const fieldReady = summary.mappedLocations >= 3 && hasMappedSites && hasFieldOfficer && hasFieldVisit;

    const requiredServicePermissions = ['finance', 'gis', 'reports', 'projects'];
    const enabledServiceControls = workspace.serviceControls.filter(service => service.status === 'Enabled').length;
    const hasRequiredPermissions = requiredServicePermissions.every(permission => workspace.roles.some(role => role.permissions.includes(permission)));
    const serviceReady = enabledServiceControls >= 4 && hasRequiredPermissions;

    return {
      finance: financeReady ? 'Audit-ready' : 'Needs finance department',
      field: fieldReady ? 'GIS-enabled' : 'Needs mapped field team',
      service: serviceReady ? 'Multi-service' : 'Needs cross-service roles'
    };
  }, [scopedDonorReports, scopedGrants, scopedPayrollRuns, summary.mappedLocations, summary.totalBudget, workspace.departments, workspace.fieldSites, workspace.fieldVisits, workspace.roles, workspace.serviceControls, workspace.staff]);

  const updateWorkspace = (updater, auditMessage) => {
    setWorkspace(current => addAudit(updater(current), auditMessage));
  };

  const applyAccountSetting = (code) => {
    const setting = professionalNgoChartOfAccounts.find(account => account.code === code);
    if (!setting) return;
    setAccountForm({
      code: setting.code,
      name: setting.name,
      type: setting.type,
      fund: setting.fund,
      restricted: setting.restricted,
      category: setting.category
    });
  };

  const applyBankAccountSetting = (code) => {
    const account = scopedChartOfAccounts.find(item => item.code === code);
    if (!account) return;
    setBankForm(current => ({
      ...current,
      accountCode: account.code,
      name: account.name,
      currency: current.currency || currentOrganization.defaultCurrency || 'USD'
    }));
  };

  const editChartAccount = (account) => {
    setAccountForm({
      code: account.code,
      name: account.name,
      type: account.type,
      fund: account.fund,
      restricted: Boolean(account.restricted),
      category: account.category || ''
    });
  };

  const removeChartAccount = (account) => {
    updateWorkspace(
      current => {
        const suppressed = new Set(current.suppressedChartAccounts?.[currentOrganization.id] || []);
        suppressed.add(account.code);
        return {
          ...current,
          chartOfAccounts: current.chartOfAccounts.filter(item => !(item.organizationId === currentOrganization.id && item.code === account.code)),
          suppressedChartAccounts: {
            ...(current.suppressedChartAccounts || {}),
            [currentOrganization.id]: Array.from(suppressed)
          }
        };
      },
      `GL account removed: ${account.code}`
    );
    if (accountForm.code === account.code) {
      setAccountForm(blankAccount);
    }
  };

  const handleOrgSave = (field, value) => {
    updateWorkspace(
      current => {
        const organizations = current.organizations.map(organization =>
          organization.id === current.activeOrganizationId ? setDeepValue(organization, field, value) : organization
        );
        const activeOrganization = organizations.find(organization => organization.id === current.activeOrganizationId) || current.organization;
        return { ...current, organizations, organization: { ...current.organization, ...activeOrganization } };
      },
      `Organization ${field} updated`
    );
  };

  const switchOrganization = (organizationId) => {
    updateWorkspace(
      current => {
        const activeOrganization = current.organizations.find(organization => organization.id === organizationId) || current.organization;
        return { ...current, activeOrganizationId: organizationId, organization: { ...current.organization, ...activeOrganization } };
      },
      `Active organization switched`
    );
  };

  const createOrganization = (event) => {
    event.preventDefault();
    if (!organizationForm.name.trim()) return;
    const organization = { ...organizationForm, id: createId('org') };
    updateWorkspace(
      current => ({
        ...current,
        organizations: [...current.organizations, organization],
        activeOrganizationId: organization.id,
        organization: { ...current.organization, ...organization }
      }),
      `Organization created: ${organization.name}`
    );
    setOrganizationForm(blankOrganization);
  };

  const removeOrganization = (organizationId) => {
    if (workspace.organizations.length <= 1) {
      window.alert('At least one NGO/church organization is required.');
      return;
    }

    const organization = workspace.organizations.find(item => item.id === organizationId);
    if (!window.confirm(`Remove ${organization?.name || 'this organization'} and its branch links?`)) return;

    updateWorkspace(
      current => {
        const organizations = current.organizations.filter(item => item.id !== organizationId);
        const nextActive = current.activeOrganizationId === organizationId ? organizations[0] : current.organizations.find(item => item.id === current.activeOrganizationId);
        const removedBranchIds = current.branches.filter(branch => branch.organizationId === organizationId).map(branch => branch.id);
        const branches = current.branches.filter(branch => branch.organizationId !== organizationId);
        const departments = current.departments.filter(department => !removedBranchIds.includes(department.branchId));
        const staff = current.staff.filter(member => !removedBranchIds.includes(member.branchId));
        const fieldSites = current.fieldSites.filter(site => !removedBranchIds.includes(site.branchId));
        const activeOrganization = nextActive || organizations[0];

        return {
          ...current,
          organizations,
          activeOrganizationId: activeOrganization.id,
          organization: { ...current.organization, ...activeOrganization },
          branches,
          departments,
          staff,
          fieldSites
        };
      },
      `Organization removed: ${organization?.name || organizationId}`
    );
  };

  const uploadOrganizationLogo = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      window.alert('Please upload an image file for the organization logo/photo.');
    }

    const uploads = await Promise.all(imageFiles.map(async file => {
      const imageUpload = await readImageAsDataUrl(file);
      return {
        id: createId('org-img'),
        name: file.name,
        type: file.type,
        size: imageUpload.size,
        originalSize: file.size,
        dataUrl: imageUpload.dataUrl,
        uploadedAt: new Date().toISOString(),
        optimized: imageUpload.optimized || false,
        storedInBrowser: true
      };
    }));

    if (!uploads.length) return;

    updateWorkspace(
      current => {
        const organizations = current.organizations.map(organization => {
          if (organization.id !== current.activeOrganizationId) return organization;
          const images = [...(organization.images || (organization.logo ? [organization.logo] : [])), ...uploads];
          return { ...organization, images, logo: images[0] || null };
        });
        const activeOrganization = organizations.find(organization => organization.id === current.activeOrganizationId) || current.organization;
        return { ...current, organizations, organization: { ...current.organization, ...activeOrganization } };
      },
      `${uploads.length} organization image${uploads.length === 1 ? '' : 's'} uploaded`
    );
  };

  const uploadOrganizationDocument = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const documents = await Promise.all(files.map(async file => {
      const canPersistData = file.size <= MAX_PERSISTED_DOCUMENT_BYTES;
      const dataUrl = canPersistData ? await readFileAsDataUrl(file) : '';
      return {
        id: createId('doc'),
        name: file.name,
        category: documentCategory,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        uploadedAt: new Date().toISOString(),
        storedInBrowser: canPersistData
      };
    }));

    updateWorkspace(
      current => {
        const organizations = current.organizations.map(organization =>
          organization.id === current.activeOrganizationId
            ? { ...organization, documents: [...(organization.documents || []), ...documents] }
            : organization
        );
        const activeOrganization = organizations.find(organization => organization.id === current.activeOrganizationId) || current.organization;
        return { ...current, organizations, organization: { ...current.organization, ...activeOrganization } };
      },
      `${documents.length} organization document${documents.length === 1 ? '' : 's'} uploaded`
    );
  };

  const removeOrganizationDocument = (documentId) => {
    updateWorkspace(
      current => {
        const organizations = current.organizations.map(organization =>
          organization.id === current.activeOrganizationId
            ? { ...organization, documents: (organization.documents || []).filter(document => document.id !== documentId) }
            : organization
        );
        const activeOrganization = organizations.find(organization => organization.id === current.activeOrganizationId) || current.organization;
        return { ...current, organizations, organization: { ...current.organization, ...activeOrganization } };
      },
      'Organization document removed'
    );
  };

  const removeOrganizationImage = (imageId) => {
    updateWorkspace(
      current => {
        const organizations = current.organizations.map(organization => {
          if (organization.id !== current.activeOrganizationId) return organization;
          const images = (organization.images || (organization.logo ? [organization.logo] : []))
            .filter((image, index) => (image.id || `legacy-logo-${index}`) !== imageId);
          return { ...organization, images, logo: images[0] || null };
        });
        const activeOrganization = organizations.find(organization => organization.id === current.activeOrganizationId) || current.organization;
        return { ...current, organizations, organization: { ...current.organization, ...activeOrganization } };
      },
      'Organization image removed'
    );
  };

  const createBranch = (event) => {
    event.preventDefault();
    if (!branchForm.name.trim()) return;
    const organizationSnapshot = getOrganizationSnapshot(currentOrganization);
    updateWorkspace(
      current => ({
        ...current,
        branches: [
          ...current.branches,
          {
            ...branchForm,
            id: createId('br'),
            organizationId: current.activeOrganizationId,
            organization: organizationSnapshot,
            country: branchForm.country || organizationSnapshot.address?.country || '',
            city: branchForm.city || organizationSnapshot.address?.city || '',
            street: branchForm.street || organizationSnapshot.address?.street || '',
            postalCode: branchForm.postalCode || organizationSnapshot.address?.postalCode || '',
            email: branchForm.email || organizationSnapshot.contact?.email || '',
            phone: branchForm.phone || organizationSnapshot.contact?.phone || '',
            manager: branchForm.manager || organizationSnapshot.primaryContact?.name || ''
          }
        ]
      }),
      `Branch created: ${branchForm.name}`
    );
    setBranchForm({
      ...blankBranch,
      organizationId: currentOrganization.id,
      country: currentOrganization.address?.country || '',
      city: currentOrganization.address?.city || '',
      street: currentOrganization.address?.street || '',
      postalCode: currentOrganization.address?.postalCode || '',
      email: currentOrganization.contact?.email || '',
      phone: currentOrganization.contact?.phone || '',
      manager: currentOrganization.primaryContact?.name || ''
    });
  };

  const updateBranch = (branchId, field, value) => {
    updateWorkspace(
      current => ({
        ...current,
        branches: current.branches.map(branch =>
          branch.id === branchId ? setDeepValue(branch, field, value) : branch
        )
      }),
      `Branch ${field} updated`
    );
  };

  const toggleBranchService = (branchId, service) => {
    updateWorkspace(
      current => ({
        ...current,
        branches: current.branches.map(branch => {
          if (branch.id !== branchId) return branch;
          const services = branch.services || [];
          return {
            ...branch,
            services: services.includes(service)
              ? services.filter(item => item !== service)
              : [...services, service]
          };
        })
      }),
      `Branch service changed: ${service}`
    );
  };

  const uploadBranchImage = async (event, branchId) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      window.alert('Please upload an image file for the branch photo.');
    }

    const uploads = await Promise.all(imageFiles.map(async file => {
      const imageUpload = await readImageAsDataUrl(file);
      return {
        id: createId('branch-img'),
        name: file.name,
        type: file.type,
        size: imageUpload.size,
        originalSize: file.size,
        dataUrl: imageUpload.dataUrl,
        uploadedAt: new Date().toISOString(),
        optimized: imageUpload.optimized || false,
        storedInBrowser: true
      };
    }));

    if (!uploads.length) return;

    updateWorkspace(
      current => ({
        ...current,
        branches: current.branches.map(branch => {
          if (branch.id !== branchId) return branch;
          const images = [...(branch.images || (branch.image ? [branch.image] : [])), ...uploads];
          return { ...branch, images, image: images[0] || null };
        })
      }),
      `${uploads.length} branch image${uploads.length === 1 ? '' : 's'} uploaded`
    );
  };

  const uploadBranchDocument = async (event, branchId) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const documents = await Promise.all(files.map(async file => {
      const canPersistData = file.size <= MAX_PERSISTED_DOCUMENT_BYTES;
      const dataUrl = canPersistData ? await readFileAsDataUrl(file) : '';
      return {
        id: createId('branch-doc'),
        name: file.name,
        category: branchDocumentCategory,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        uploadedAt: new Date().toISOString(),
        storedInBrowser: canPersistData
      };
    }));

    updateWorkspace(
      current => ({
        ...current,
        branches: current.branches.map(branch =>
          branch.id === branchId
            ? { ...branch, documents: [...(branch.documents || []), ...documents] }
            : branch
        )
      }),
      `${documents.length} branch document${documents.length === 1 ? '' : 's'} uploaded`
    );
  };

  const removeBranchImage = (branchId, imageId) => {
    updateWorkspace(
      current => ({
        ...current,
        branches: current.branches.map(branch => {
          if (branch.id !== branchId) return branch;
          const images = (branch.images || (branch.image ? [branch.image] : []))
            .filter((image, index) => (image.id || `legacy-branch-image-${index}`) !== imageId);
          return { ...branch, images, image: images[0] || null };
        })
      }),
      'Branch image removed'
    );
  };

  const removeBranchDocument = (branchId, documentId) => {
    updateWorkspace(
      current => ({
        ...current,
        branches: current.branches.map(branch =>
          branch.id === branchId
            ? { ...branch, documents: (branch.documents || []).filter(document => document.id !== documentId) }
            : branch
        )
      }),
      'Branch document removed'
    );
  };

  const createDepartment = (event) => {
    event.preventDefault();
    if (!departmentForm.name.trim() || !departmentForm.branchId) return;
    const branch = branchById[departmentForm.branchId];
    const linkedOrganization = organizationById[departmentForm.organizationId] || organizationById[branch?.organizationId] || currentOrganization;
    updateWorkspace(
      current => ({
        ...current,
        departments: [
          ...current.departments,
          {
            ...departmentForm,
            id: createId('dep'),
            organizationId: linkedOrganization.id,
            organization: getOrganizationSnapshot(linkedOrganization),
            branch: branch ? { id: branch.id, name: branch.name, type: branch.type, region: branch.region, country: branch.country } : null,
            budget: Number(departmentForm.budget || 0)
          }
        ]
      }),
      `Department created: ${departmentForm.name}`
    );
    setDepartmentForm({
      ...blankDepartment,
      organizationId: linkedOrganization.id,
      branchId: workspace.branches.find(branch => branch.organizationId === linkedOrganization.id)?.id || ''
    });
  };

  const updateDepartment = (departmentId, field, value) => {
    updateWorkspace(
      current => ({
        ...current,
        departments: current.departments.map(department =>
          department.id === departmentId ? setDeepValue(department, field, value) : department
        )
      }),
      `Department ${field} updated`
    );
  };

  const toggleDepartmentService = (departmentId, service) => {
    updateWorkspace(
      current => ({
        ...current,
        departments: current.departments.map(department => {
          if (department.id !== departmentId) return department;
          const services = department.services || [];
          return {
            ...department,
            services: services.includes(service)
              ? services.filter(item => item !== service)
              : [...services, service]
          };
        })
      }),
      `Department service changed: ${service}`
    );
  };

  const uploadDepartmentImage = async (event, departmentId) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      window.alert('Please upload an image file for the department photo.');
    }

    const uploads = await Promise.all(imageFiles.map(async file => {
      const imageUpload = await readImageAsDataUrl(file);
      return {
        id: createId('department-img'),
        name: file.name,
        type: file.type,
        size: imageUpload.size,
        originalSize: file.size,
        dataUrl: imageUpload.dataUrl,
        uploadedAt: new Date().toISOString(),
        optimized: imageUpload.optimized || false,
        storedInBrowser: true
      };
    }));

    if (!uploads.length) return;

    updateWorkspace(
      current => ({
        ...current,
        departments: current.departments.map(department => {
          if (department.id !== departmentId) return department;
          const images = [...(department.images || (department.image ? [department.image] : [])), ...uploads];
          return { ...department, images, image: images[0] || null };
        })
      }),
      `${uploads.length} department image${uploads.length === 1 ? '' : 's'} uploaded`
    );
  };

  const uploadDepartmentDocument = async (event, departmentId) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const documents = await Promise.all(files.map(async file => {
      const canPersistData = file.size <= MAX_PERSISTED_DOCUMENT_BYTES;
      const dataUrl = canPersistData ? await readFileAsDataUrl(file) : '';
      return {
        id: createId('department-doc'),
        name: file.name,
        category: departmentDocumentCategory,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        uploadedAt: new Date().toISOString(),
        storedInBrowser: canPersistData
      };
    }));

    updateWorkspace(
      current => ({
        ...current,
        departments: current.departments.map(department =>
          department.id === departmentId
            ? { ...department, documents: [...(department.documents || []), ...documents] }
            : department
        )
      }),
      `${documents.length} department document${documents.length === 1 ? '' : 's'} uploaded`
    );
  };

  const removeDepartmentImage = (departmentId, imageId) => {
    updateWorkspace(
      current => ({
        ...current,
        departments: current.departments.map(department => {
          if (department.id !== departmentId) return department;
          const images = (department.images || (department.image ? [department.image] : []))
            .filter((image, index) => (image.id || `legacy-department-image-${index}`) !== imageId);
          return { ...department, images, image: images[0] || null };
        })
      }),
      'Department image removed'
    );
  };

  const removeDepartmentDocument = (departmentId, documentId) => {
    updateWorkspace(
      current => ({
        ...current,
        departments: current.departments.map(department =>
          department.id === departmentId
            ? { ...department, documents: (department.documents || []).filter(document => document.id !== documentId) }
            : department
        )
      }),
      'Department document removed'
    );
  };

  const createStaff = (event) => {
    event.preventDefault();
    if (!staffForm.name.trim() || !staffForm.role.trim() || !staffForm.branchId) return;
    const branch = branchById[staffForm.branchId];
    const department = departmentById[staffForm.departmentId];
    const linkedOrganization = organizationById[staffForm.organizationId] || organizationById[branch?.organizationId] || currentOrganization;
    updateWorkspace(
      current => ({
        ...current,
        staff: [
          ...current.staff,
          {
            ...staffForm,
            id: createId('st'),
            organizationId: linkedOrganization.id,
            organization: getOrganizationSnapshot(linkedOrganization),
            branch: branch ? { id: branch.id, name: branch.name, type: branch.type, region: branch.region, country: branch.country } : null,
            department: department ? { id: department.id, name: department.name, branchId: department.branchId, costCenter: department.costCenter } : null
          }
        ]
      }),
      `Staff member added: ${staffForm.name}`
    );
    setStaffForm({
      ...blankStaff,
      organizationId: linkedOrganization.id,
      branchId: workspace.branches.find(branch => branch.organizationId === linkedOrganization.id)?.id || '',
      departmentId: workspace.departments.find(department => {
        const branch = workspace.branches.find(item => item.id === department.branchId);
        return branch?.organizationId === linkedOrganization.id;
      })?.id || ''
    });
  };

  const updateStaff = (staffId, field, value) => {
    updateWorkspace(
      current => ({
        ...current,
        staff: current.staff.map(member =>
          member.id === staffId ? setDeepValue(member, field, value) : member
        )
      }),
      `Staff ${field} updated`
    );
  };

  const toggleStaffPermission = (staffId, permission) => {
    updateWorkspace(
      current => ({
        ...current,
        staff: current.staff.map(member => {
          if (member.id !== staffId) return member;
          const permissions = member.permissions || [];
          return {
            ...member,
            permissions: permissions.includes(permission)
              ? permissions.filter(item => item !== permission)
              : [...permissions, permission]
          };
        })
      }),
      `Staff permission changed: ${permission}`
    );
  };

  const uploadStaffPhoto = async (event, staffId) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      window.alert('Please upload an image file for the staff photo.');
    }

    const uploads = await Promise.all(imageFiles.map(async file => {
      const imageUpload = await readImageAsDataUrl(file);
      return {
        id: createId('staff-photo'),
        name: file.name,
        type: file.type,
        size: imageUpload.size,
        originalSize: file.size,
        dataUrl: imageUpload.dataUrl,
        uploadedAt: new Date().toISOString(),
        optimized: imageUpload.optimized || false,
        storedInBrowser: true
      };
    }));

    if (!uploads.length) return;

    updateWorkspace(
      current => ({
        ...current,
        staff: current.staff.map(member => {
          if (member.id !== staffId) return member;
          const photos = [...(member.photos || (member.photo ? [member.photo] : [])), ...uploads];
          return { ...member, photos, photo: photos[0] || null };
        })
      }),
      `${uploads.length} staff photo${uploads.length === 1 ? '' : 's'} uploaded`
    );
  };

  const uploadStaffDocument = async (event, staffId) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const documents = await Promise.all(files.map(async file => {
      const canPersistData = file.size <= MAX_PERSISTED_DOCUMENT_BYTES;
      const dataUrl = canPersistData ? await readFileAsDataUrl(file) : '';
      return {
        id: createId('staff-doc'),
        name: file.name,
        category: staffDocumentCategory,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        uploadedAt: new Date().toISOString(),
        storedInBrowser: canPersistData
      };
    }));

    updateWorkspace(
      current => ({
        ...current,
        staff: current.staff.map(member =>
          member.id === staffId
            ? { ...member, documents: [...(member.documents || []), ...documents] }
            : member
        )
      }),
      `${documents.length} staff document${documents.length === 1 ? '' : 's'} uploaded`
    );
  };

  const removeStaffPhoto = (staffId, photoId) => {
    updateWorkspace(
      current => ({
        ...current,
        staff: current.staff.map(member => {
          if (member.id !== staffId) return member;
          const photos = (member.photos || (member.photo ? [member.photo] : []))
            .filter((photo, index) => (photo.id || `legacy-staff-photo-${index}`) !== photoId);
          return { ...member, photos, photo: photos[0] || null };
        })
      }),
      'Staff photo removed'
    );
  };

  const removeStaffDocument = (staffId, documentId) => {
    updateWorkspace(
      current => ({
        ...current,
        staff: current.staff.map(member =>
          member.id === staffId
            ? { ...member, documents: (member.documents || []).filter(document => document.id !== documentId) }
            : member
        )
      }),
      'Staff document removed'
    );
  };

  const createRole = (event) => {
    event.preventDefault();
    if (!roleForm.name.trim()) return;
    const linkedOrganization = organizationById[roleForm.organizationId] || currentOrganization;
    updateWorkspace(
      current => ({
        ...current,
        roles: [
          ...current.roles,
          {
            ...roleForm,
            id: createId('role'),
            organizationId: linkedOrganization.id,
            organization: getOrganizationSnapshot(linkedOrganization)
          }
        ]
      }),
      `Role created: ${roleForm.name}`
    );
    setRoleForm({ ...blankRole, organizationId: linkedOrganization.id });
  };

  const updateRole = (roleId, field, value) => {
    updateWorkspace(
      current => ({
        ...current,
        roles: current.roles.map(role =>
          role.id === roleId ? setDeepValue(role, field, value) : role
        )
      }),
      `Role ${field} updated`
    );
  };

  const toggleRolePermission = (roleId, permission) => {
    updateWorkspace(
      current => ({
        ...current,
        roles: current.roles.map(role => {
          if (role.id !== roleId) return role;
          const permissions = role.permissions || [];
          return {
            ...role,
            permissions: permissions.includes(permission)
              ? permissions.filter(item => item !== permission)
              : [...permissions, permission]
          };
        })
      }),
      `Role permission changed: ${permission}`
    );
  };

  const toggleRoleAssignment = (roleId, field, id) => {
    updateWorkspace(
      current => ({
        ...current,
        roles: current.roles.map(role => {
          if (role.id !== roleId) return role;
          const values = role[field] || [];
          return {
            ...role,
            [field]: values.includes(id)
              ? values.filter(item => item !== id)
              : [...values, id]
          };
        })
      }),
      `Role assignment changed`
    );
  };

  const upsertFinanceRecord = (collection, record, idPrefix, numericFields, label) => {
    const id = record.id || createId(idPrefix);
    const normalized = {
      ...record,
      id,
      organizationId: currentOrganization.id
    };

    numericFields.forEach(field => {
      normalized[field] = Number(normalized[field] || 0);
    });

    updateWorkspace(
      current => {
        const exists = current[collection].some(item => item.id === id);
        return {
          ...current,
          [collection]: exists
            ? current[collection].map(item => item.id === id ? normalized : item)
            : [...current[collection], normalized]
        };
      },
      `${label} ${record.id ? 'updated' : 'created'}`
    );
  };

  const updateFinanceStatus = (collection, id, updates, label) => {
    updateWorkspace(
      current => ({
        ...current,
        [collection]: current[collection].map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      }),
      label
    );
  };

  const createGrant = (event) => {
    event.preventDefault();
    if (!grantForm.name.trim() || !grantForm.donor.trim()) return;
    upsertFinanceRecord('grants', grantForm, 'grant', ['budget', 'spent'], `Grant ${grantForm.name}`);
    setGrantForm(blankGrant);
  };

  const createPayroll = (event) => {
    event.preventDefault();
    if (!payrollForm.period.trim()) return;
    upsertFinanceRecord('payrollRuns', payrollForm, 'pay', ['staffCount', 'grossPay'], `Payroll ${payrollForm.period}`);
    setPayrollForm(blankPayroll);
  };

  const createDonorReport = (event) => {
    event.preventDefault();
    if (!donorReportForm.title.trim() || !donorReportForm.donor.trim()) return;
    upsertFinanceRecord('donorReports', donorReportForm, 'report', ['income', 'expenses'], `Donor report ${donorReportForm.title}`);
    setDonorReportForm(blankDonorReport);
  };

  const createAccount = (event) => {
    event.preventDefault();
    if (!accountForm.code.trim() || !accountForm.name.trim()) return;
    updateWorkspace(
      current => {
        const suppressed = (current.suppressedChartAccounts?.[currentOrganization.id] || []).filter(code => code !== accountForm.code);
        const suppressedChartAccounts = {
          ...(current.suppressedChartAccounts || {}),
          [currentOrganization.id]: suppressed
        };
        const exists = current.chartOfAccounts.some(account => account.organizationId === currentOrganization.id && account.code === accountForm.code);
        if (exists) {
          return {
            ...current,
            suppressedChartAccounts,
            chartOfAccounts: current.chartOfAccounts.map(account =>
              account.organizationId === currentOrganization.id && account.code === accountForm.code
                ? { ...account, ...accountForm, organizationId: currentOrganization.id }
                : account
            )
          };
        }
        return {
          ...current,
          suppressedChartAccounts,
          chartOfAccounts: [...current.chartOfAccounts, { ...accountForm, organizationId: currentOrganization.id, id: createId('coa') }]
        };
      },
      `GL account created: ${accountForm.code}`
    );
    setAccountForm(blankAccount);
  };

  const createBankAccount = (event) => {
    event.preventDefault();
    if (!bankForm.name.trim()) return;
    upsertFinanceRecord('bankAccounts', bankForm, 'bank', ['openingBalance', 'reconciledBalance'], `Bank account ${bankForm.name}`);
    setBankForm(blankBankAccount);
  };

  const createPayment = (event) => {
    event.preventDefault();
    if (!paymentForm.voucherNo.trim() || !paymentForm.payee.trim()) return;
    upsertFinanceRecord('payments', paymentForm, 'payment', ['amount'], `Payment voucher ${paymentForm.voucherNo}`);
    setPaymentForm(blankPayment);
  };

  const createJournalEntry = (event) => {
    event.preventDefault();
    if (!journalForm.debitAccount || !journalForm.creditAccount || !journalForm.amount) return;
    upsertFinanceRecord('journalEntries', journalForm, 'je', ['amount'], `Journal entry ${journalForm.reference || journalForm.description}`);
    setJournalForm(blankJournalEntry);
  };

  const approvePayment = (payment) => {
    updateFinanceStatus(
      'payments',
      payment.id,
      {
        approvalStatus: 'Approved',
        paymentStatus: payment.paymentStatus === 'Draft' ? 'Ready' : payment.paymentStatus,
        approvedBy: currentOrganization.primaryContact?.name || currentOrganization.governance?.executiveDirector || 'Finance Approver',
        approvedAt: new Date().toISOString()
      },
      `Payment voucher approved: ${payment.voucherNo}`
    );
  };

  const approveBudget = (grant) => {
    updateFinanceStatus(
      'grants',
      grant.id,
      {
        approvalStatus: 'Approved',
        reportStatus: grant.reportStatus === 'Draft' ? 'Submitted' : grant.reportStatus,
        approvedBy: currentOrganization.primaryContact?.name || currentOrganization.governance?.executiveDirector || 'Finance Approver',
        approvedAt: new Date().toISOString()
      },
      `Budget approved: ${grant.name}`
    );
  };

  const approvePayroll = (payroll) => {
    updateFinanceStatus(
      'payrollRuns',
      payroll.id,
      {
        approvals: 'Approved',
        status: payroll.status === 'Draft' ? 'Ready' : payroll.status,
        approvedBy: currentOrganization.primaryContact?.name || currentOrganization.governance?.executiveDirector || 'Finance Approver',
        approvedAt: new Date().toISOString()
      },
      `Payroll approved: ${payroll.period}`
    );
  };

  const publishDonorReport = (report) => {
    updateFinanceStatus(
      'donorReports',
      report.id,
      {
        status: 'Published',
        approvedBy: currentOrganization.primaryContact?.name || currentOrganization.governance?.executiveDirector || 'Finance Approver',
        approvedAt: new Date().toISOString()
      },
      `Donor report published: ${report.title}`
    );
  };

  const postJournalEntry = (entry) => {
    updateFinanceStatus(
      'journalEntries',
      entry.id,
      {
        posted: true,
        approvalStatus: 'Approved',
        approvedBy: currentOrganization.primaryContact?.name || currentOrganization.governance?.executiveDirector || 'Finance Approver',
        approvedAt: new Date().toISOString()
      },
      `Journal entry posted: ${entry.reference || entry.description}`
    );
  };

  const createBeneficialOwner = (event) => {
    event.preventDefault();
    if (!beneficialOwnerForm.fullName.trim() || !beneficialOwnerForm.role.trim()) return;
    updateWorkspace(
      current => ({ ...current, beneficialOwners: [...current.beneficialOwners, { ...beneficialOwnerForm, id: createId('bo'), controlPercent: Number(beneficialOwnerForm.controlPercent || 0) }] }),
      `Beneficial owner recorded: ${beneficialOwnerForm.fullName}`
    );
    setBeneficialOwnerForm(blankBeneficialOwner);
  };

  const createStorage = (event) => {
    event.preventDefault();
    if (!storageForm.name.trim() || !storageForm.custodian.trim()) return;
    updateWorkspace(
      current => {
        const id = storageForm.id || createId('storage');
        const record = { ...storageForm, id };
        const exists = current.storages.some(storage => storage.id === id);
        return {
          ...current,
          storages: exists ? current.storages.map(storage => storage.id === id ? record : storage) : [...current.storages, record]
        };
      },
      `Storage repository ${storageForm.id ? 'updated' : 'created'}: ${storageForm.name}`
    );
    setStorageForm(blankStorage);
  };

  const createContract = (event) => {
    event.preventDefault();
    if (!contractForm.contractNo.trim() || !contractForm.title.trim()) return;
    updateWorkspace(
      current => {
        const id = contractForm.id || createId('contract');
        const record = { ...contractForm, id, value: Number(contractForm.value || 0) };
        const exists = current.contracts.some(contract => contract.id === id);
        return {
          ...current,
          contracts: exists ? current.contracts.map(contract => contract.id === id ? record : contract) : [...current.contracts, record]
        };
      },
      `Contract ${contractForm.id ? 'updated' : 'created'}: ${contractForm.contractNo}`
    );
    setContractForm(blankContract);
  };

  const approveContract = (contract) => {
    updateWorkspace(
      current => ({
        ...current,
        contracts: current.contracts.map(item =>
          item.id === contract.id ? { ...item, status: 'Active', approvedBy: currentOrganization.primaryContact?.name || 'Contract Approver', approvedAt: new Date().toISOString() } : item
        )
      }),
      `Contract approved: ${contract.contractNo}`
    );
  };

  const archiveStorage = (storage) => {
    updateWorkspace(
      current => ({
        ...current,
        storages: current.storages.map(item =>
          item.id === storage.id ? { ...item, status: 'Archived', archivedBy: currentOrganization.primaryContact?.name || 'Records Officer', archivedAt: new Date().toISOString() } : item
        )
      }),
      `Storage archived: ${storage.name}`
    );
  };

  const createTender = (event) => {
    event.preventDefault();
    if (!tenderForm.tenderNo.trim() || !tenderForm.title.trim()) return;
    updateWorkspace(
      current => {
        const id = tenderForm.id || createId('tender');
        const record = { ...tenderForm, id, estimatedValue: Number(tenderForm.estimatedValue || 0) };
        const exists = current.tenders.some(tender => tender.id === id);
        return {
          ...current,
          tenders: exists ? current.tenders.map(tender => tender.id === id ? record : tender) : [...current.tenders, record]
        };
      },
      `Tender ${tenderForm.id ? 'updated' : 'created'}: ${tenderForm.tenderNo}`
    );
    setTenderForm(blankTender);
  };

  const createProject = (event) => {
    event.preventDefault();
    if (!projectForm.code.trim() || !projectForm.name.trim()) return;
    updateWorkspace(
      current => {
        const id = projectForm.id || createId('project');
        const record = {
          ...projectForm,
          id,
          budget: Number(projectForm.budget || 0),
          spent: Number(projectForm.spent || 0),
          beneficiariesTarget: Number(projectForm.beneficiariesTarget || 0),
          beneficiariesReached: Number(projectForm.beneficiariesReached || 0)
        };
        const exists = current.projects.some(project => project.id === id);
        return {
          ...current,
          projects: exists ? current.projects.map(project => project.id === id ? record : project) : [...current.projects, record]
        };
      },
      `Project ${projectForm.id ? 'updated' : 'created'}: ${projectForm.code}`
    );
    setProjectForm(blankProject);
  };

  const approveProject = (project) => {
    updateWorkspace(
      current => ({
        ...current,
        projects: current.projects.map(item =>
          item.id === project.id ? { ...item, status: 'Active', approvedBy: currentOrganization.primaryContact?.name || 'Program Approver', approvedAt: new Date().toISOString() } : item
        )
      }),
      `Project approved: ${project.code}`
    );
  };

  const approveTender = (tender) => {
    updateWorkspace(
      current => ({
        ...current,
        tenders: current.tenders.map(item =>
          item.id === tender.id ? { ...item, status: 'Evaluation', approvedBy: currentOrganization.primaryContact?.name || 'Procurement Approver', approvedAt: new Date().toISOString() } : item
        )
      }),
      `Tender approved for evaluation: ${tender.tenderNo}`
    );
  };

  const awardTender = (tender) => {
    updateWorkspace(
      current => ({
        ...current,
        tenders: current.tenders.map(item =>
          item.id === tender.id ? { ...item, status: 'Awarded', awardedBy: currentOrganization.primaryContact?.name || 'Procurement Approver', awardedAt: new Date().toISOString() } : item
        )
      }),
      `Tender awarded: ${tender.tenderNo}`
    );
  };

  const createImpact = (event) => {
    event.preventDefault();
    if (!impactForm.projectId || !impactForm.indicator.trim()) return;
    updateWorkspace(
      current => {
        const id = impactForm.id || createId('impact');
        const record = {
          ...impactForm,
          id,
          baseline: Number(impactForm.baseline || 0),
          target: Number(impactForm.target || 0),
          actual: Number(impactForm.actual || 0)
        };
        const exists = current.impacts.some(impact => impact.id === id);
        return {
          ...current,
          impacts: exists ? current.impacts.map(impact => impact.id === id ? record : impact) : [...current.impacts, record]
        };
      },
      `Impact indicator ${impactForm.id ? 'updated' : 'recorded'}: ${impactForm.indicator}`
    );
    setImpactForm(blankImpact);
  };

  const createEvaluation = (event) => {
    event.preventDefault();
    if (!evaluationForm.projectId || !evaluationForm.title.trim()) return;
    updateWorkspace(
      current => {
        const id = evaluationForm.id || createId('evaluation');
        const record = { ...evaluationForm, id, score: Number(evaluationForm.score || 0) };
        const exists = current.evaluations.some(evaluation => evaluation.id === id);
        return {
          ...current,
          evaluations: exists ? current.evaluations.map(evaluation => evaluation.id === id ? record : evaluation) : [...current.evaluations, record]
        };
      },
      `Evaluation ${evaluationForm.id ? 'updated' : 'created'}: ${evaluationForm.title}`
    );
    setEvaluationForm(blankEvaluation);
  };

  const verifyImpact = (impact) => {
    updateWorkspace(
      current => ({
        ...current,
        impacts: current.impacts.map(item =>
          item.id === impact.id ? { ...item, verificationStatus: 'Verified', verifiedBy: currentOrganization.primaryContact?.name || 'MEAL Approver', verifiedAt: new Date().toISOString() } : item
        )
      }),
      `Impact verified: ${impact.indicator}`
    );
  };

  const approveEvaluation = (evaluation) => {
    updateWorkspace(
      current => ({
        ...current,
        evaluations: current.evaluations.map(item =>
          item.id === evaluation.id ? { ...item, status: 'Management Response', approvedBy: currentOrganization.primaryContact?.name || 'MEAL Approver', approvedAt: new Date().toISOString() } : item
        )
      }),
      `Evaluation reviewed: ${evaluation.title}`
    );
  };

  const createFieldSite = (event) => {
    event.preventDefault();
    if (!fieldSiteForm.name.trim() || !fieldSiteForm.branchId) return;
    updateWorkspace(
      current => ({ ...current, fieldSites: [...current.fieldSites, { ...fieldSiteForm, id: createId('site'), beneficiaries: Number(fieldSiteForm.beneficiaries || 0) }] }),
      `Field site mapped: ${fieldSiteForm.name}`
    );
    setFieldSiteForm(blankFieldSite);
  };

  const createFieldVisit = (event) => {
    event.preventDefault();
    if (!fieldVisitForm.siteId || !fieldVisitForm.date) return;
    updateWorkspace(
      current => ({ ...current, fieldVisits: [...current.fieldVisits, { ...fieldVisitForm, id: createId('visit') }] }),
      `Field visit recorded: ${fieldSiteById[fieldVisitForm.siteId]?.name || 'Site'}`
    );
    setFieldVisitForm(blankFieldVisit);
  };

  const createServiceControl = (event) => {
    event.preventDefault();
    if (!serviceForm.service.trim() || !serviceForm.owner.trim()) return;
    updateWorkspace(
      current => ({ ...current, serviceControls: [...current.serviceControls, { ...serviceForm, id: createId('svc') }] }),
      `Service control enabled: ${serviceForm.service}`
    );
    setServiceForm(blankServiceControl);
  };

  const removeItem = (collection, id, label) => {
    updateWorkspace(
      current => ({ ...current, [collection]: current[collection].filter(item => item.id !== id) }),
      `${label} removed`
    );
  };

  const financeSections = [
    { id: 'income', label: 'Income & Grants', icon: DollarSign },
    { id: 'expenses', label: 'Expenses & Banking', icon: CreditCard },
    { id: 'payroll', label: 'Payroll & Reports', icon: Users },
    { id: 'accounting', label: 'Accounting & Audit', icon: BarChart3 }
  ];

  const projectSections = [
    { id: 'projects', label: 'Create / Update Projects', icon: BriefcaseBusiness },
    { id: 'projectApprovals', label: 'Approve Projects', icon: CheckCircle2 },
    { id: 'tenders', label: 'Create / Update Tenders', icon: PackageCheck },
    { id: 'tenderApprovals', label: 'Approve / Award Tenders', icon: ClipboardCheck }
  ];

  const contractSections = [
    { id: 'contracts', label: 'Create / Update Contracts', icon: FileText },
    { id: 'contractApprovals', label: 'Approve Contracts', icon: CheckCircle2 },
    { id: 'storages', label: 'Create / Update Storage', icon: PackageCheck },
    { id: 'storageControls', label: 'Storage Controls', icon: ShieldCheck }
  ];

  const impactSections = [
    { id: 'indicators', label: 'Create / Update Indicators', icon: BarChart3 },
    { id: 'indicatorVerification', label: 'Verify Indicators', icon: CheckCircle2 },
    { id: 'evaluations', label: 'Create / Update Evaluations', icon: ClipboardCheck },
    { id: 'evaluationReviews', label: 'Review Evaluations', icon: ShieldCheck }
  ];

  const exportWorkspace = () => {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentOrganization.name.replace(/\s+/g, '-').toLowerCase()}-ngo-workspace.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'branches', label: 'Branches', icon: Globe2 },
    { id: 'departments', label: 'Departments', icon: Network },
    { id: 'staff', label: 'Org Chart', icon: Users },
    { id: 'roles', label: 'Roles', icon: ShieldCheck },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'audit', label: 'Audit', icon: Landmark },
    { id: 'owners', label: 'Beneficial Owners', icon: ShieldCheck },
    { id: 'projects', label: 'Projects & Tenders', icon: BriefcaseBusiness },
    { id: 'contracts', label: 'Contracts & Storage', icon: FileText },
    { id: 'impact', label: 'Impact Evaluation', icon: BarChart3 },
    { id: 'field', label: 'Field GIS', icon: MapPinned },
    { id: 'services', label: 'Service Control', icon: PackageCheck },
    { id: 'users', label: 'Users & Access', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">NGO Management</h1>
              <p className="text-xs text-gray-500">Organization, branches, departments, roles, finance readiness, and GIS field readiness</p>
            </div>
          </div>
          <button onClick={exportWorkspace} className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-700 mb-2">Professional NGO operations console</p>
                <h2 className="text-xl sm:text-3xl font-bold tracking-tight">{currentOrganization.name}</h2>
                <p className="text-gray-600 mt-2">
                  {currentOrganization.type} â€¢ {currentOrganization.headquarters} â€¢ {currentOrganization.defaultLanguage} â€¢ {currentOrganization.defaultCurrency}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                Data saves automatically
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <Metric icon={Building2} label="Active Branches" value={summary.activeBranches} />
              <Metric icon={Network} label="Departments" value={scopedDepartments.length} />
              <Metric icon={Users} label="Active Staff" value={summary.activeStaff} />
              <Metric icon={DollarSign} label="Budget" value={money(summary.totalBudget, currentOrganization.defaultCurrency)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <ReadinessCard icon={Landmark} title="Finance readiness" status={readiness.finance} detail="Budgets, finance departments, grants, payroll, and donor reports can be audited together." onClick={() => setActiveTab('finance')} />
            <ReadinessCard icon={MapPinned} title="Field readiness" status={readiness.field} detail={`${summary.mappedLocations} mapped location${summary.mappedLocations === 1 ? '' : 's'} with GPS coverage for branches and field teams.`} onClick={() => setActiveTab('field')} />
            <ReadinessCard icon={Church} title="Service readiness" status={readiness.service} detail="NGO, church, HR, stock, procurement, communication, finance, and reporting roles are controlled together." onClick={() => setActiveTab('services')} />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm h-fit lg:sticky lg:top-24">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-left transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </aside>

          <div className="space-y-6">
            {activeTab === 'organization' && (
              <Panel title="Organization & Headquarters" subtitle="Edit the main NGO/church identity, headquarters, default language, and default currency.">
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6 mb-6">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3">Multi-NGO Registry</h4>
                    <div className="space-y-2">
                      {workspace.organizations.map(organization => (
                        <button
                          key={organization.id}
                          type="button"
                          onClick={() => switchOrganization(organization.id)}
                          className={`w-full rounded-lg border p-3 text-left transition-colors ${
                            organization.id === currentOrganization.id ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold">{organization.name}</span>
                            <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-600">{organization.status}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{organization.type} â€¢ {organization.headquarters}</p>
                          <p className="mt-1 text-xs text-gray-500">{getFullAddress(organization)}</p>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeOrganization(currentOrganization.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Active
                      </button>
                    </div>
                  </div>

                  <form onSubmit={createOrganization} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3">Create NGO / Church</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Organization Name" value={organizationForm.name} onChange={value => setOrganizationForm({ ...organizationForm, name: value })} required />
                      <Input label="Legal Name" value={organizationForm.legalName} onChange={value => setOrganizationForm({ ...organizationForm, legalName: value })} />
                      <Input label="Acronym" value={organizationForm.acronym} onChange={value => setOrganizationForm({ ...organizationForm, acronym: value })} />
                      <SelectInput label="Type" value={organizationForm.type} options={['NGO', 'Church', 'Faith-Based NGO', 'Humanitarian Organization', 'Foundation']} onChange={value => setOrganizationForm({ ...organizationForm, type: value })} />
                      <Input label="Registration No." value={organizationForm.registrationNo} onChange={value => setOrganizationForm({ ...organizationForm, registrationNo: value })} />
                      <Input label="Tax ID / TIN" value={organizationForm.taxId} onChange={value => setOrganizationForm({ ...organizationForm, taxId: value })} />
                      <Input label="Founding Date" type="date" value={organizationForm.foundingDate} onChange={value => setOrganizationForm({ ...organizationForm, foundingDate: value })} />
                      <Input label="Headquarters" value={organizationForm.headquarters} onChange={value => setOrganizationForm({ ...organizationForm, headquarters: value })} />
                      <Input label="Street Address" value={organizationForm.address.street} onChange={value => setOrganizationForm({ ...organizationForm, address: { ...organizationForm.address, street: value } })} />
                      <Input label="City" value={organizationForm.address.city} onChange={value => setOrganizationForm({ ...organizationForm, address: { ...organizationForm.address, city: value } })} />
                      <Input label="State / Province" value={organizationForm.address.state} onChange={value => setOrganizationForm({ ...organizationForm, address: { ...organizationForm.address, state: value } })} />
                      <Input label="Country" value={organizationForm.address.country} onChange={value => setOrganizationForm({ ...organizationForm, address: { ...organizationForm.address, country: value } })} />
                      <Input label="Postal Code" value={organizationForm.address.postalCode} onChange={value => setOrganizationForm({ ...organizationForm, address: { ...organizationForm.address, postalCode: value } })} />
                      <Input label="Office Phone" value={organizationForm.contact.phone} onChange={value => setOrganizationForm({ ...organizationForm, contact: { ...organizationForm.contact, phone: value } })} />
                      <Input label="Office Email" type="email" value={organizationForm.contact.email} onChange={value => setOrganizationForm({ ...organizationForm, contact: { ...organizationForm.contact, email: value } })} />
                      <Input label="Website" value={organizationForm.contact.website} onChange={value => setOrganizationForm({ ...organizationForm, contact: { ...organizationForm.contact, website: value } })} />
                      <SelectInput label="Default Language" value={organizationForm.defaultLanguage} options={workspace.languages} onChange={value => setOrganizationForm({ ...organizationForm, defaultLanguage: value })} />
                      <SelectInput label="Default Currency" value={organizationForm.defaultCurrency} options={workspace.currencies} onChange={value => setOrganizationForm({ ...organizationForm, defaultCurrency: value })} />
                      <SubmitButton label="Create Organization" />
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField label="Organization Name" value={currentOrganization.name} onSave={value => handleOrgSave('name', value)} />
                  <EditableField label="Legal Name" value={currentOrganization.legalName || ''} onSave={value => handleOrgSave('legalName', value)} />
                  <EditableField label="Acronym" value={currentOrganization.acronym || ''} onSave={value => handleOrgSave('acronym', value)} />
                  <EditableField label="Organization Type" value={currentOrganization.type} onSave={value => handleOrgSave('type', value)} />
                  <EditableField label="Registration No." value={currentOrganization.registrationNo || ''} onSave={value => handleOrgSave('registrationNo', value)} />
                  <EditableField label="Tax ID / TIN" value={currentOrganization.taxId || ''} onSave={value => handleOrgSave('taxId', value)} />
                  <EditableField label="Founding Date" value={currentOrganization.foundingDate || ''} onSave={value => handleOrgSave('foundingDate', value)} />
                  <EditableField label="Headquarters" value={currentOrganization.headquarters} onSave={value => handleOrgSave('headquarters', value)} />
                  <SelectField label="Default Language" value={currentOrganization.defaultLanguage} options={workspace.languages} onChange={value => handleOrgSave('defaultLanguage', value)} />
                  <SelectField label="Default Currency" value={currentOrganization.defaultCurrency} options={workspace.currencies} onChange={value => handleOrgSave('defaultCurrency', value)} />
                </div>

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3">Full Address</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <EditableField label="Street Address" value={currentOrganization.address?.street || ''} onSave={value => handleOrgSave('address.street', value)} />
                      <EditableField label="City" value={currentOrganization.address?.city || ''} onSave={value => handleOrgSave('address.city', value)} />
                      <EditableField label="State / Province" value={currentOrganization.address?.state || ''} onSave={value => handleOrgSave('address.state', value)} />
                      <EditableField label="Country" value={currentOrganization.address?.country || ''} onSave={value => handleOrgSave('address.country', value)} />
                      <EditableField label="Postal Code" value={currentOrganization.address?.postalCode || ''} onSave={value => handleOrgSave('address.postalCode', value)} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3">Contact Information</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <EditableField label="Office Phone" value={currentOrganization.contact?.phone || ''} onSave={value => handleOrgSave('contact.phone', value)} />
                      <EditableField label="Office Email" value={currentOrganization.contact?.email || ''} onSave={value => handleOrgSave('contact.email', value)} />
                      <EditableField label="Website" value={currentOrganization.contact?.website || ''} onSave={value => handleOrgSave('contact.website', value)} />
                      <EditableField label="Primary Contact Name" value={currentOrganization.primaryContact?.name || ''} onSave={value => handleOrgSave('primaryContact.name', value)} />
                      <EditableField label="Primary Contact Title" value={currentOrganization.primaryContact?.title || ''} onSave={value => handleOrgSave('primaryContact.title', value)} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3">Governance & Compliance</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <EditableField label="Board Chair" value={currentOrganization.governance?.boardChair || ''} onSave={value => handleOrgSave('governance.boardChair', value)} />
                      <EditableField label="Executive Director" value={currentOrganization.governance?.executiveDirector || ''} onSave={value => handleOrgSave('governance.executiveDirector', value)} />
                      <EditableField label="Fiscal Year Start" value={currentOrganization.governance?.fiscalYearStart || ''} onSave={value => handleOrgSave('governance.fiscalYearStart', value)} />
                      <SelectField label="Compliance Status" value={currentOrganization.governance?.complianceStatus || 'Compliant'} options={['Compliant', 'Pending Review', 'At Risk', 'Suspended']} onChange={value => handleOrgSave('governance.complianceStatus', value)} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="font-bold mb-2">Professional Organization Profile</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
                    <ProfileItem label="Legal Name" value={currentOrganization.legalName || currentOrganization.name} />
                    <ProfileItem label="Registration" value={currentOrganization.registrationNo || 'Not set'} />
                    <ProfileItem label="Tax ID / TIN" value={currentOrganization.taxId || 'Not set'} />
                    <ProfileItem label="Full Address" value={getFullAddress(currentOrganization)} />
                    <ProfileItem label="Office Email" value={currentOrganization.contact?.email || 'Not set'} />
                    <ProfileItem label="Office Phone" value={currentOrganization.contact?.phone || 'Not set'} />
                    <ProfileItem label="Primary Contact" value={`${currentOrganization.primaryContact?.name || 'Not set'}${currentOrganization.primaryContact?.title ? `, ${currentOrganization.primaryContact.title}` : ''}`} />
                    <ProfileItem label="Compliance" value={currentOrganization.governance?.complianceStatus || 'Not set'} />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Image className="w-4 h-4 text-emerald-700" />
                      Organization Image
                    </h4>
                    <div className="aspect-video rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {organizationImages[0]?.dataUrl ? (
                        <img src={organizationImages[0].dataUrl} alt={`${currentOrganization.name} logo`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-500">
                          <Image className="w-10 h-10 mx-auto mb-2" />
                          <p className="text-sm font-semibold">No image uploaded</p>
                        </div>
                      )}
                    </div>
                    {organizationImages.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {organizationImages.map((image, index) => {
                          const imageId = image.id || `legacy-logo-${index}`;
                          return (
                            <div key={imageId} className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm">
                              <div className="min-w-0">
                                <span className="block truncate font-semibold">{image.name || `Organization image ${index + 1}`}</span>
                                <span className="text-xs text-gray-500">{formatFileSize(image.originalSize || image.size)}{index === 0 ? ' â€¢ Primary' : ''}</span>
                              </div>
                              <button type="button" onClick={() => removeOrganizationImage(imageId)} className="text-red-600 font-semibold">Remove</button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                      <Upload className="w-4 h-4" />
                      Upload Images
                      <input type="file" accept="image/*" multiple onChange={uploadOrganizationLogo} className="hidden" />
                    </label>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
                      <div>
                        <h4 className="font-bold flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-700" />
                          Organization Documents
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">Upload registration, tax, governance, donor, church, and compliance documents.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={documentCategory}
                          onChange={event => setDocumentCategory(event.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        >
                          {documentCategories.map(category => <option key={category} value={category}>{category}</option>)}
                        </select>
                        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                          <Upload className="w-4 h-4" />
                          Upload Documents
                          <input type="file" multiple onChange={uploadOrganizationDocument} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(currentOrganization.documents || []).length === 0 && (
                        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                          No documents uploaded yet.
                        </div>
                      )}
                      {(currentOrganization.documents || []).map(document => (
                        <div key={document.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3">
                          <div>
                            <p className="font-semibold text-gray-800">{document.name}</p>
                            <p className="text-xs text-gray-500">
                              {document.category} â€¢ {formatFileSize(document.size)} â€¢ {document.uploadedAt ? new Date(document.uploadedAt).toLocaleString() : 'Uploaded'}
                            </p>
                            {!document.dataUrl && (
                              <p className="mt-1 text-xs font-medium text-amber-700">Large file saved as metadata to keep the page stable.</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {document.dataUrl && (
                              <a href={document.dataUrl} download={document.name} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50">
                                Download
                              </a>
                            )}
                            <button type="button" onClick={() => removeOrganizationDocument(document.id)} className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Capability text="Multi-NGO management" done={workspace.organizations.length > 1} />
                  <Capability text="Headquarters + regional offices" done={scopedBranches.some(branch => branch.type === 'Headquarters') && scopedBranches.some(branch => branch.type.includes('Regional'))} />
                  <Capability text="Multi-language support" done={workspace.languages.length > 1} />
                  <Capability text="Multi-currency support" done={workspace.currencies.length > 1} />
                  <Capability text="Organization hierarchy" done={workspace.staff.some(member => member.reportsTo)} />
                  <Capability text="User roles and permissions" done={workspace.roles.length > 0} />
                </div>

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <MiniTable
                    title="Headquarters + Regional Offices"
                    columns={['Office', 'Type', 'Region', 'Manager']}
                    rows={scopedBranches.map(branch => [branch.name, branch.type, `${branch.region}, ${branch.country}`, branch.manager])}
                  />
                  <MiniTable
                    title="Organization Hierarchy"
                    columns={['Staff', 'Role', 'Reports To', 'Branch']}
                    rows={workspace.staff.map(member => [
                      member.name,
                      member.role,
                      workspace.staff.find(person => person.id === member.reportsTo)?.name || 'Top level',
                      branchById[member.branchId]?.name || 'Unassigned'
                    ])}
                  />
                </div>

                <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <h4 className="font-bold text-emerald-900">Controlled Together</h4>
                  <p className="mt-1 text-sm text-emerald-800">
                    Organization identity, branches, headquarters, regional offices, languages, currencies, staff hierarchy, and role permissions are connected to the active NGO/church record.
                  </p>
                </div>
              </Panel>
            )}

            {activeTab === 'branches' && (
              <Panel title="Branch & Church Management" subtitle="Create headquarters, regional offices, field offices, and church branches with GPS locations.">
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Branches will be linked to</p>
                      <h4 className="mt-1 text-base sm:text-xl font-bold text-emerald-950">{currentOrganization.name}</h4>
                      <p className="mt-1 text-sm text-emerald-800">
                        {currentOrganization.type} â€¢ {currentOrganization.registrationNo || 'No registration'} â€¢ {currentOrganization.headquarters || 'No headquarters'}
                      </p>
                    </div>
                    <div className="w-full lg:w-72">
                      <SelectInput
                        label="Active Organization"
                        value={currentOrganization.id}
                        options={workspace.organizations.map(organization => ({ label: organization.name, value: organization.id }))}
                        onChange={switchOrganization}
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    <ProfileItem label="Legal Name" value={currentOrganization.legalName || currentOrganization.name} />
                    <ProfileItem label="Tax ID / TIN" value={currentOrganization.taxId || 'Not set'} />
                    <ProfileItem label="Address" value={getFullAddress(currentOrganization)} />
                    <ProfileItem label="Office Email" value={currentOrganization.contact?.email || 'Not set'} />
                    <ProfileItem label="Office Phone" value={currentOrganization.contact?.phone || 'Not set'} />
                    <ProfileItem label="Primary Contact" value={currentOrganization.primaryContact?.name || 'Not set'} />
                  </div>
                </div>

                <form onSubmit={createBranch} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                  <SelectInput
                    label="Organization"
                    value={currentOrganization.id}
                    options={workspace.organizations.map(organization => ({ label: organization.name, value: organization.id }))}
                    onChange={switchOrganization}
                  />
                  <Input label="Branch Name" value={branchForm.name} onChange={value => setBranchForm({ ...branchForm, name: value })} required />
                  <SelectInput label="Type" value={branchForm.type} options={branchTypes} onChange={value => setBranchForm({ ...branchForm, type: value })} />
                  <Input label="Region" value={branchForm.region} onChange={value => setBranchForm({ ...branchForm, region: value })} />
                  <Input label="Country" value={branchForm.country} onChange={value => setBranchForm({ ...branchForm, country: value })} />
                  <Input label="City" value={branchForm.city} onChange={value => setBranchForm({ ...branchForm, city: value })} />
                  <Input label="District / Sector" value={branchForm.district} onChange={value => setBranchForm({ ...branchForm, district: value })} />
                  <Input label="Street Address" value={branchForm.street} onChange={value => setBranchForm({ ...branchForm, street: value })} />
                  <Input label="Postal Code" value={branchForm.postalCode} onChange={value => setBranchForm({ ...branchForm, postalCode: value })} />
                  <Input label="Manager" value={branchForm.manager} onChange={value => setBranchForm({ ...branchForm, manager: value })} />
                  <Input label="Email" type="email" value={branchForm.email} onChange={value => setBranchForm({ ...branchForm, email: value })} />
                  <Input label="Phone" value={branchForm.phone} onChange={value => setBranchForm({ ...branchForm, phone: value })} />
                  <Input label="GPS" value={branchForm.gps} onChange={value => setBranchForm({ ...branchForm, gps: value })} placeholder="9.0300, 38.7400" />
                  <Input label="Opening Date" type="date" value={branchForm.openingDate} onChange={value => setBranchForm({ ...branchForm, openingDate: value })} />
                  <Input label="Capacity / Members" type="number" value={branchForm.capacity} onChange={value => setBranchForm({ ...branchForm, capacity: value })} />
                  <button className="self-end inline-flex justify-center items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    <Plus className="w-4 h-4" />
                    Add Branch
                  </button>
                </form>

                <DataTable
                  columns={['Name', 'Organization', 'Type', 'Address', 'Manager', 'GPS', 'Status', '']}
                  rows={scopedBranches.map(branch => [
                    branch.name,
                    organizationById[branch.organizationId]?.name || branch.organization?.name || currentOrganization.name,
                    branch.type,
                    getBranchAddress(branch),
                    branch.manager,
                    branch.gps ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.gps)}`} target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 hover:underline">{branch.gps}</a> : 'Not mapped',
                    branch.status,
                    <div key={branch.id} className="flex gap-2">
                      <button type="button" onClick={() => setSelectedBranchId(branch.id)} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50">Edit</button>
                      <DeleteButton onClick={() => removeItem('branches', branch.id, `Branch ${branch.name}`)} />
                    </div>
                  ])}
                />

                {selectedBranch && (
                  <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div>
                          <h4 className="text-base sm:text-xl font-bold">{selectedBranch.name}</h4>
                          <p className="text-sm text-gray-600">{selectedBranch.type} â€¢ {getBranchAddress(selectedBranch)}</p>
                        </div>
                        <SelectInput label="Select Branch" value={selectedBranch.id} options={scopedBranches.map(branch => ({ label: branch.name, value: branch.id }))} onChange={setSelectedBranchId} />
                      </div>

                      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Linked Organization</p>
                            <h5 className="mt-1 font-bold text-emerald-950">
                              {organizationById[selectedBranch.organizationId]?.name || selectedBranch.organization?.name || currentOrganization.name}
                            </h5>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                            {organizationById[selectedBranch.organizationId]?.type || selectedBranch.organization?.type || currentOrganization.type}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <ProfileItem label="Registration" value={organizationById[selectedBranch.organizationId]?.registrationNo || selectedBranch.organization?.registrationNo || currentOrganization.registrationNo || 'Not set'} />
                          <ProfileItem label="Tax ID / TIN" value={organizationById[selectedBranch.organizationId]?.taxId || selectedBranch.organization?.taxId || currentOrganization.taxId || 'Not set'} />
                          <ProfileItem label="Headquarters" value={organizationById[selectedBranch.organizationId]?.headquarters || selectedBranch.organization?.headquarters || currentOrganization.headquarters || 'Not set'} />
                          <ProfileItem label="Organization Address" value={getFullAddress(organizationById[selectedBranch.organizationId] || selectedBranch.organization || currentOrganization)} />
                          <ProfileItem label="Organization Email" value={organizationById[selectedBranch.organizationId]?.contact?.email || selectedBranch.organization?.contact?.email || currentOrganization.contact?.email || 'Not set'} />
                          <ProfileItem label="Organization Phone" value={organizationById[selectedBranch.organizationId]?.contact?.phone || selectedBranch.organization?.contact?.phone || currentOrganization.contact?.phone || 'Not set'} />
                        </div>
                      </div>

                      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Connected Organization</p>
                            <h5 className="mt-1 font-bold text-emerald-950">
                              {organizationById[selectedStaff.organizationId || branchById[selectedStaff.branchId]?.organizationId]?.name || selectedStaff.organization?.name || currentOrganization.name}
                            </h5>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                            {branchById[selectedStaff.branchId]?.name || selectedStaff.branch?.name || 'No branch'}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <ProfileItem label="Registration" value={organizationById[selectedStaff.organizationId || branchById[selectedStaff.branchId]?.organizationId]?.registrationNo || selectedStaff.organization?.registrationNo || currentOrganization.registrationNo || 'Not set'} />
                          <ProfileItem label="Tax ID / TIN" value={organizationById[selectedStaff.organizationId || branchById[selectedStaff.branchId]?.organizationId]?.taxId || selectedStaff.organization?.taxId || currentOrganization.taxId || 'Not set'} />
                          <ProfileItem label="Organization Address" value={getFullAddress(organizationById[selectedStaff.organizationId || branchById[selectedStaff.branchId]?.organizationId] || selectedStaff.organization || currentOrganization)} />
                          <ProfileItem label="Branch" value={branchById[selectedStaff.branchId]?.name || selectedStaff.branch?.name || 'Not set'} />
                          <ProfileItem label="Department" value={departmentById[selectedStaff.departmentId]?.name || selectedStaff.department?.name || 'Not set'} />
                          <ProfileItem label="Office Phone" value={organizationById[selectedStaff.organizationId || branchById[selectedStaff.branchId]?.organizationId]?.contact?.phone || selectedStaff.organization?.contact?.phone || currentOrganization.contact?.phone || 'Not set'} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                          label="Linked Organization"
                          value={selectedBranch.organizationId || currentOrganization.id}
                          options={workspace.organizations.map(organization => ({ label: organization.name, value: organization.id }))}
                          onChange={value => {
                            const linkedOrganization = organizationById[value] || currentOrganization;
                            updateBranch(selectedBranch.id, 'organizationId', value);
                            updateBranch(selectedBranch.id, 'organization', getOrganizationSnapshot(linkedOrganization));
                          }}
                        />
                        <EditableField label="Branch Name" value={selectedBranch.name || ''} onSave={value => updateBranch(selectedBranch.id, 'name', value)} />
                        <SelectField label="Type" value={selectedBranch.type || 'Regional Office'} options={branchTypes} onChange={value => updateBranch(selectedBranch.id, 'type', value)} />
                        <EditableField label="Region" value={selectedBranch.region || ''} onSave={value => updateBranch(selectedBranch.id, 'region', value)} />
                        <EditableField label="Country" value={selectedBranch.country || ''} onSave={value => updateBranch(selectedBranch.id, 'country', value)} />
                        <EditableField label="City" value={selectedBranch.city || ''} onSave={value => updateBranch(selectedBranch.id, 'city', value)} />
                        <EditableField label="District / Sector" value={selectedBranch.district || ''} onSave={value => updateBranch(selectedBranch.id, 'district', value)} />
                        <EditableField label="Street Address" value={selectedBranch.street || ''} onSave={value => updateBranch(selectedBranch.id, 'street', value)} />
                        <EditableField label="Postal Code" value={selectedBranch.postalCode || ''} onSave={value => updateBranch(selectedBranch.id, 'postalCode', value)} />
                        <EditableField label="Manager" value={selectedBranch.manager || ''} onSave={value => updateBranch(selectedBranch.id, 'manager', value)} />
                        <EditableField label="Email" value={selectedBranch.email || ''} onSave={value => updateBranch(selectedBranch.id, 'email', value)} />
                        <EditableField label="Phone" value={selectedBranch.phone || ''} onSave={value => updateBranch(selectedBranch.id, 'phone', value)} />
                        <EditableField label="GPS" value={selectedBranch.gps || ''} onSave={value => updateBranch(selectedBranch.id, 'gps', value)} />
                        <EditableField label="Opening Date" value={selectedBranch.openingDate || ''} onSave={value => updateBranch(selectedBranch.id, 'openingDate', value)} />
                        <EditableField label="Capacity / Members" value={String(selectedBranch.capacity || '')} onSave={value => updateBranch(selectedBranch.id, 'capacity', Number(value || 0))} />
                        <SelectField label="Status" value={selectedBranch.status || 'Active'} options={statusOptions} onChange={value => updateBranch(selectedBranch.id, 'status', value)} />
                      </div>

                      {selectedBranch.type === 'Church Branch' && (
                        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                          <h4 className="font-bold mb-3">Church Branch Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <EditableField label="Pastor" value={selectedBranch.church?.pastor || ''} onSave={value => updateBranch(selectedBranch.id, 'church.pastor', value)} />
                            <EditableField label="Congregation Size" value={String(selectedBranch.church?.congregationSize || '')} onSave={value => updateBranch(selectedBranch.id, 'church.congregationSize', Number(value || 0))} />
                            <EditableField label="Service Times" value={selectedBranch.church?.serviceTimes || ''} onSave={value => updateBranch(selectedBranch.id, 'church.serviceTimes', value)} />
                          </div>
                        </div>
                      )}

                      <div className="mt-6 rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold mb-3">Connected Services</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {branchServiceOptions.map(service => (
                            <label key={service} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                              <input
                                type="checkbox"
                                checked={(selectedBranch.services || []).includes(service)}
                                onChange={() => toggleBranchService(selectedBranch.id, service)}
                              />
                              {service}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <Image className="w-4 h-4 text-emerald-700" />
                          Branch Image
                        </h4>
                        <div className="aspect-video rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {selectedBranchImages[0]?.dataUrl ? (
                            <img src={selectedBranchImages[0].dataUrl} alt={`${selectedBranch.name} branch`} className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-center text-gray-500">
                              <Image className="w-10 h-10 mx-auto mb-2" />
                              <p className="text-sm font-semibold">No branch image</p>
                            </div>
                          )}
                        </div>
                        {selectedBranchImages.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {selectedBranchImages.map((image, index) => {
                              const imageId = image.id || `legacy-branch-image-${index}`;
                              return (
                                <div key={imageId} className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm">
                                  <div className="min-w-0">
                                    <span className="block truncate font-semibold">{image.name || `Branch image ${index + 1}`}</span>
                                    <span className="text-xs text-gray-500">{formatFileSize(image.originalSize || image.size)}{index === 0 ? ' â€¢ Primary' : ''}</span>
                                  </div>
                                  <button type="button" onClick={() => removeBranchImage(selectedBranch.id, imageId)} className="text-red-600 font-semibold">Remove</button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                          <Upload className="w-4 h-4" />
                          Upload Branch Images
                          <input type="file" accept="image/*" multiple onChange={event => uploadBranchImage(event, selectedBranch.id)} className="hidden" />
                        </label>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-700" />
                          Branch Documents
                        </h4>
                        <div className="flex gap-2 mb-3">
                          <select value={branchDocumentCategory} onChange={event => setBranchDocumentCategory(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            {branchDocumentCategories.map(category => <option key={category} value={category}>{category}</option>)}
                          </select>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                            <Upload className="w-4 h-4" />
                            Upload
                            <input type="file" multiple onChange={event => uploadBranchDocument(event, selectedBranch.id)} className="hidden" />
                          </label>
                        </div>
                        <div className="space-y-2">
                          {(selectedBranch.documents || []).length === 0 && <p className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">No branch documents uploaded.</p>}
                          {(selectedBranch.documents || []).map(document => (
                            <div key={document.id} className="rounded-md border border-gray-200 p-3">
                              <p className="font-semibold">{document.name}</p>
                              <p className="text-xs text-gray-500">{document.category} â€¢ {formatFileSize(document.size)}</p>
                              <div className="mt-2 flex gap-2">
                                {document.dataUrl && <a href={document.dataUrl} download={document.name} className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold hover:bg-gray-50">Download</a>}
                                <button type="button" onClick={() => removeBranchDocument(selectedBranch.id, document.id)} className="rounded-md border border-red-200 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-50">Remove</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Panel>
            )}

            {activeTab === 'departments' && (
              <Panel title="Department Management" subtitle="Create departments and allocate budgets across headquarters and branches.">
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Departments will be created under</p>
                      <h4 className="mt-1 text-base sm:text-xl font-bold text-emerald-950">{currentOrganization.name}</h4>
                      <p className="mt-1 text-sm text-emerald-800">
                        {currentOrganization.type} â€¢ {currentOrganization.registrationNo || 'No registration'} â€¢ {scopedBranches.length} linked branch{scopedBranches.length === 1 ? '' : 'es'}
                      </p>
                    </div>
                    <div className="w-full lg:w-72">
                      <SelectInput
                        label="Active Organization"
                        value={currentOrganization.id}
                        options={workspace.organizations.map(organization => ({ label: organization.name, value: organization.id }))}
                        onChange={switchOrganization}
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    <ProfileItem label="Legal Name" value={currentOrganization.legalName || currentOrganization.name} />
                    <ProfileItem label="Tax ID / TIN" value={currentOrganization.taxId || 'Not set'} />
                    <ProfileItem label="Address" value={getFullAddress(currentOrganization)} />
                    <ProfileItem label="Office Email" value={currentOrganization.contact?.email || 'Not set'} />
                    <ProfileItem label="Office Phone" value={currentOrganization.contact?.phone || 'Not set'} />
                    <ProfileItem label="Currency" value={currentOrganization.defaultCurrency || 'Not set'} />
                  </div>
                </div>

                <form onSubmit={createDepartment} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                  <SelectInput
                    label="Organization"
                    value={departmentFormOrganization.id}
                    options={workspace.organizations.map(organization => ({ label: organization.name, value: organization.id }))}
                    onChange={value => {
                      const branches = workspace.branches.filter(branch => !branch.organizationId || branch.organizationId === value);
                      setDepartmentForm({
                        ...departmentForm,
                        organizationId: value,
                        branchId: branches[0]?.id || ''
                      });
                      switchOrganization(value);
                    }}
                  />
                  <Input label="Department" value={departmentForm.name} onChange={value => setDepartmentForm({ ...departmentForm, name: value })} required />
                  <SelectInput
                    label="Branch"
                    value={departmentForm.branchId}
                    options={departmentFormBranches.map(branch => ({ label: `${branch.name} (${branch.type})`, value: branch.id }))}
                    onChange={value => setDepartmentForm({ ...departmentForm, branchId: value })}
                    required
                  />
                  <Input label="Head" value={departmentForm.head} onChange={value => setDepartmentForm({ ...departmentForm, head: value })} />
                  <Input label="Email" type="email" value={departmentForm.email} onChange={value => setDepartmentForm({ ...departmentForm, email: value })} />
                  <Input label="Phone" value={departmentForm.phone} onChange={value => setDepartmentForm({ ...departmentForm, phone: value })} />
                  <Input label="Cost Center" value={departmentForm.costCenter} onChange={value => setDepartmentForm({ ...departmentForm, costCenter: value })} />
                  <Input label="Account Code" value={departmentForm.accountCode} onChange={value => setDepartmentForm({ ...departmentForm, accountCode: value })} />
                  <Input label="Budget" type="number" value={departmentForm.budget} onChange={value => setDepartmentForm({ ...departmentForm, budget: value })} />
                  <button className="self-end inline-flex justify-center items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    <Plus className="w-4 h-4" />
                    Add Department
                  </button>
                </form>
                {departmentFormBranches.length === 0 && (
                  <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                    Create or link a branch for {departmentFormOrganization.name} before adding a department.
                  </div>
                )}

                <DataTable
                  columns={['Department', 'Organization', 'Branch', 'Head', 'Cost Center', 'Budget', 'Status', '']}
                  rows={scopedDepartments.map(department => [
                    department.name,
                    organizationById[department.organizationId || branchById[department.branchId]?.organizationId]?.name || department.organization?.name || currentOrganization.name,
                    branchById[department.branchId]?.name || 'Unassigned',
                    department.head,
                    department.costCenter || 'Not set',
                    money(department.budget, currentOrganization.defaultCurrency),
                    department.status,
                    <div key={department.id} className="flex gap-2">
                      <button type="button" onClick={() => setSelectedDepartmentId(department.id)} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50">Edit</button>
                      <DeleteButton onClick={() => removeItem('departments', department.id, `Department ${department.name}`)} />
                    </div>
                  ])}
                />

                {selectedDepartment && (
                  <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div>
                          <h4 className="text-base sm:text-xl font-bold">{selectedDepartment.name}</h4>
                          <p className="text-sm text-gray-600">{branchById[selectedDepartment.branchId]?.name || 'Unassigned'} â€¢ {money(selectedDepartment.budget, currentOrganization.defaultCurrency)}</p>
                        </div>
                        <SelectInput label="Select Department" value={selectedDepartment.id} options={scopedDepartments.map(department => ({ label: department.name, value: department.id }))} onChange={setSelectedDepartmentId} />
                      </div>

                      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Connected Organization</p>
                            <h5 className="mt-1 font-bold text-emerald-950">
                              {organizationById[selectedDepartment.organizationId || branchById[selectedDepartment.branchId]?.organizationId]?.name || selectedDepartment.organization?.name || currentOrganization.name}
                            </h5>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                            {branchById[selectedDepartment.branchId]?.name || selectedDepartment.branch?.name || 'No branch'}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <ProfileItem label="Registration" value={organizationById[selectedDepartment.organizationId || branchById[selectedDepartment.branchId]?.organizationId]?.registrationNo || selectedDepartment.organization?.registrationNo || currentOrganization.registrationNo || 'Not set'} />
                          <ProfileItem label="Tax ID / TIN" value={organizationById[selectedDepartment.organizationId || branchById[selectedDepartment.branchId]?.organizationId]?.taxId || selectedDepartment.organization?.taxId || currentOrganization.taxId || 'Not set'} />
                          <ProfileItem label="Headquarters" value={organizationById[selectedDepartment.organizationId || branchById[selectedDepartment.branchId]?.organizationId]?.headquarters || selectedDepartment.organization?.headquarters || currentOrganization.headquarters || 'Not set'} />
                          <ProfileItem label="Organization Address" value={getFullAddress(organizationById[selectedDepartment.organizationId || branchById[selectedDepartment.branchId]?.organizationId] || selectedDepartment.organization || currentOrganization)} />
                          <ProfileItem label="Organization Email" value={organizationById[selectedDepartment.organizationId || branchById[selectedDepartment.branchId]?.organizationId]?.contact?.email || selectedDepartment.organization?.contact?.email || currentOrganization.contact?.email || 'Not set'} />
                          <ProfileItem label="Organization Phone" value={organizationById[selectedDepartment.organizationId || branchById[selectedDepartment.branchId]?.organizationId]?.contact?.phone || selectedDepartment.organization?.contact?.phone || currentOrganization.contact?.phone || 'Not set'} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableField label="Department Name" value={selectedDepartment.name || ''} onSave={value => updateDepartment(selectedDepartment.id, 'name', value)} />
                        <SelectField
                          label="Branch"
                          value={selectedDepartment.branchId || ''}
                          options={scopedBranches.map(branch => ({ label: branch.name, value: branch.id }))}
                          onChange={value => {
                            const branch = branchById[value];
                            const linkedOrganization = organizationById[branch?.organizationId] || currentOrganization;
                            updateDepartment(selectedDepartment.id, 'branchId', value);
                            updateDepartment(selectedDepartment.id, 'branch', branch ? { id: branch.id, name: branch.name, type: branch.type, region: branch.region, country: branch.country } : null);
                            updateDepartment(selectedDepartment.id, 'organizationId', linkedOrganization.id);
                            updateDepartment(selectedDepartment.id, 'organization', getOrganizationSnapshot(linkedOrganization));
                          }}
                        />
                        <EditableField label="Department Head" value={selectedDepartment.head || ''} onSave={value => updateDepartment(selectedDepartment.id, 'head', value)} />
                        <EditableField label="Email" value={selectedDepartment.email || ''} onSave={value => updateDepartment(selectedDepartment.id, 'email', value)} />
                        <EditableField label="Phone" value={selectedDepartment.phone || ''} onSave={value => updateDepartment(selectedDepartment.id, 'phone', value)} />
                        <EditableField label="Cost Center" value={selectedDepartment.costCenter || ''} onSave={value => updateDepartment(selectedDepartment.id, 'costCenter', value)} />
                        <EditableField label="Account Code" value={selectedDepartment.accountCode || ''} onSave={value => updateDepartment(selectedDepartment.id, 'accountCode', value)} />
                        <EditableField label="Budget" value={String(selectedDepartment.budget || '')} onSave={value => updateDepartment(selectedDepartment.id, 'budget', Number(value || 0))} />
                        <EditableField label="Objective" value={selectedDepartment.objective || ''} onSave={value => updateDepartment(selectedDepartment.id, 'objective', value)} />
                        <EditableField label="KPI / Target" value={selectedDepartment.kpi || ''} onSave={value => updateDepartment(selectedDepartment.id, 'kpi', value)} />
                        <SelectField label="Status" value={selectedDepartment.status || 'Active'} options={statusOptions} onChange={value => updateDepartment(selectedDepartment.id, 'status', value)} />
                      </div>

                      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h4 className="font-bold mb-3">Professional Department Profile</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <ProfileItem label="Organization" value={organizationById[selectedDepartment.organizationId || branchById[selectedDepartment.branchId]?.organizationId]?.name || selectedDepartment.organization?.name || currentOrganization.name} />
                          <ProfileItem label="Branch" value={branchById[selectedDepartment.branchId]?.name || 'Unassigned'} />
                          <ProfileItem label="Head" value={selectedDepartment.head || 'Not set'} />
                          <ProfileItem label="Cost Center" value={selectedDepartment.costCenter || 'Not set'} />
                          <ProfileItem label="Account Code" value={selectedDepartment.accountCode || 'Not set'} />
                          <ProfileItem label="Budget" value={money(selectedDepartment.budget, currentOrganization.defaultCurrency)} />
                          <ProfileItem label="KPI" value={selectedDepartment.kpi || 'Not set'} />
                        </div>
                      </div>

                      <div className="mt-6 rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold mb-3">Connected Department Services</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {departmentServiceOptions.map(service => (
                            <label key={service} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                              <input
                                type="checkbox"
                                checked={(selectedDepartment.services || []).includes(service)}
                                onChange={() => toggleDepartmentService(selectedDepartment.id, service)}
                              />
                              {service}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MiniTable
                          title="Assigned Staff"
                          columns={['Staff', 'Role', 'Email']}
                          rows={workspace.staff.filter(member => member.departmentId === selectedDepartment.id).map(member => [member.name, member.role, member.email || 'Not set'])}
                        />
                        <MiniTable
                          title="Department Controls"
                          columns={['Control', 'Status']}
                          rows={[
                            ['Budget allocated', Number(selectedDepartment.budget || 0) > 0 ? 'Ready' : 'Missing'],
                            ['Head assigned', selectedDepartment.head ? 'Ready' : 'Missing'],
                            ['Services connected', (selectedDepartment.services || []).length > 0 ? `${selectedDepartment.services.length} services` : 'Missing'],
                            ['Documents uploaded', (selectedDepartment.documents || []).length > 0 ? `${selectedDepartment.documents.length} documents` : 'Missing']
                          ]}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <Image className="w-4 h-4 text-emerald-700" />
                          Department Image
                        </h4>
                        <div className="aspect-video rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {selectedDepartmentImages[0]?.dataUrl ? (
                            <img src={selectedDepartmentImages[0].dataUrl} alt={`${selectedDepartment.name} department`} className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-center text-gray-500">
                              <Image className="w-10 h-10 mx-auto mb-2" />
                              <p className="text-sm font-semibold">No department image</p>
                            </div>
                          )}
                        </div>
                        {selectedDepartmentImages.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {selectedDepartmentImages.map((image, index) => {
                              const imageId = image.id || `legacy-department-image-${index}`;
                              return (
                                <div key={imageId} className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm">
                                  <div className="min-w-0">
                                    <span className="block truncate font-semibold">{image.name || `Department image ${index + 1}`}</span>
                                    <span className="text-xs text-gray-500">{formatFileSize(image.originalSize || image.size)}{index === 0 ? ' â€¢ Primary' : ''}</span>
                                  </div>
                                  <button type="button" onClick={() => removeDepartmentImage(selectedDepartment.id, imageId)} className="text-red-600 font-semibold">Remove</button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                          <Upload className="w-4 h-4" />
                          Upload Department Images
                          <input type="file" accept="image/*" multiple onChange={event => uploadDepartmentImage(event, selectedDepartment.id)} className="hidden" />
                        </label>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-700" />
                          Department Documents
                        </h4>
                        <div className="flex gap-2 mb-3">
                          <select value={departmentDocumentCategory} onChange={event => setDepartmentDocumentCategory(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            {departmentDocumentCategories.map(category => <option key={category} value={category}>{category}</option>)}
                          </select>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                            <Upload className="w-4 h-4" />
                            Upload
                            <input type="file" multiple onChange={event => uploadDepartmentDocument(event, selectedDepartment.id)} className="hidden" />
                          </label>
                        </div>
                        <div className="space-y-2">
                          {(selectedDepartment.documents || []).length === 0 && <p className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">No department documents uploaded.</p>}
                          {(selectedDepartment.documents || []).map(document => (
                            <div key={document.id} className="rounded-md border border-gray-200 p-3">
                              <p className="font-semibold">{document.name}</p>
                              <p className="text-xs text-gray-500">{document.category} â€¢ {formatFileSize(document.size)}</p>
                              <div className="mt-2 flex gap-2">
                                {document.dataUrl && <a href={document.dataUrl} download={document.name} className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold hover:bg-gray-50">Download</a>}
                                <button type="button" onClick={() => removeDepartmentDocument(selectedDepartment.id, document.id)} className="rounded-md border border-red-200 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-50">Remove</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Panel>
            )}

            {activeTab === 'staff' && (
              <Panel title="Staff Organizational Chart" subtitle="Add staff, assign them to branches/departments, and connect reporting lines.">
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Staff will be assigned under</p>
                      <h4 className="mt-1 text-base sm:text-xl font-bold text-emerald-950">{staffFormOrganization.name}</h4>
                      <p className="mt-1 text-sm text-emerald-800">
                        {staffFormOrganization.type} â€¢ {staffFormOrganization.registrationNo || 'No registration'} â€¢ {staffFormBranches.length} branch{staffFormBranches.length === 1 ? '' : 'es'} available
                      </p>
                    </div>
                    <div className="w-full lg:w-72">
                      <SelectInput
                        label="Active Organization"
                        value={staffFormOrganization.id}
                        options={workspace.organizations.map(organization => ({ label: organization.name, value: organization.id }))}
                        onChange={value => {
                          const branches = workspace.branches.filter(branch => !branch.organizationId || branch.organizationId === value);
                          const departments = workspace.departments.filter(department => branches.some(branch => branch.id === department.branchId));
                          setStaffForm({
                            ...staffForm,
                            organizationId: value,
                            branchId: branches[0]?.id || '',
                            departmentId: departments[0]?.id || '',
                            reportsTo: ''
                          });
                          switchOrganization(value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    <ProfileItem label="Legal Name" value={staffFormOrganization.legalName || staffFormOrganization.name} />
                    <ProfileItem label="Tax ID / TIN" value={staffFormOrganization.taxId || 'Not set'} />
                    <ProfileItem label="Address" value={getFullAddress(staffFormOrganization)} />
                    <ProfileItem label="Office Email" value={staffFormOrganization.contact?.email || 'Not set'} />
                    <ProfileItem label="Office Phone" value={staffFormOrganization.contact?.phone || 'Not set'} />
                    <ProfileItem label="Currency" value={staffFormOrganization.defaultCurrency || 'Not set'} />
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                  <Metric icon={Users} label="Active Staff" value={summary.activeStaff} />
                  <Metric icon={Network} label="Departments Covered" value={[...new Set(scopedStaff.map(member => member.departmentId).filter(Boolean))].length} />
                  <Metric icon={Building2} label="Branches Covered" value={[...new Set(scopedStaff.map(member => member.branchId).filter(Boolean))].length} />
                  <Metric icon={ShieldCheck} label="Staff Permissions" value={[...new Set(scopedStaff.flatMap(member => member.permissions || []))].length} />
                  <Metric icon={FileText} label="Staff Documents" value={scopedStaff.reduce((sum, member) => sum + (member.documents || []).length, 0)} />
                </div>

                <form onSubmit={createStaff} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                  <SelectInput
                    label="Organization"
                    value={staffFormOrganization.id}
                    options={workspace.organizations.map(organization => ({ label: organization.name, value: organization.id }))}
                    onChange={value => {
                      const branches = workspace.branches.filter(branch => !branch.organizationId || branch.organizationId === value);
                      const departments = workspace.departments.filter(department => branches.some(branch => branch.id === department.branchId));
                      setStaffForm({
                        ...staffForm,
                        organizationId: value,
                        branchId: branches[0]?.id || '',
                        departmentId: departments[0]?.id || '',
                        reportsTo: ''
                      });
                      switchOrganization(value);
                    }}
                  />
                  <Input label="Full Name" value={staffForm.name} onChange={value => setStaffForm({ ...staffForm, name: value })} required />
                  <Input label="Employee ID" value={staffForm.employeeId} onChange={value => setStaffForm({ ...staffForm, employeeId: value })} />
                  <Input label="Role / Position" value={staffForm.role} onChange={value => setStaffForm({ ...staffForm, role: value })} required />
                  <SelectInput label="Employment Type" value={staffForm.employmentType} options={['Full-time', 'Part-time', 'Contract', 'Volunteer', 'Pastor / Church Leader']} onChange={value => setStaffForm({ ...staffForm, employmentType: value })} />
                  <Input label="Start Date" type="date" value={staffForm.startDate} onChange={value => setStaffForm({ ...staffForm, startDate: value })} />
                  <SelectInput
                    label="Branch"
                    value={staffForm.branchId}
                    options={staffFormBranches.map(branch => ({ label: `${branch.name} (${branch.type})`, value: branch.id }))}
                    onChange={value => {
                      const departments = staffFormDepartments.filter(department => department.branchId === value);
                      setStaffForm({ ...staffForm, branchId: value, departmentId: departments[0]?.id || '' });
                    }}
                    required
                  />
                  <SelectInput
                    label="Department"
                    value={staffForm.departmentId}
                    options={staffFormDepartments.map(department => ({ label: department.name, value: department.id }))}
                    onChange={value => setStaffForm({ ...staffForm, departmentId: value })}
                  />
                  <SelectInput
                    label="Reports To"
                    value={staffForm.reportsTo}
                    options={[{ label: 'Top level', value: '' }, ...staffFormReportsTo.map(member => ({ label: `${member.name} (${member.role})`, value: member.id }))]}
                    onChange={value => setStaffForm({ ...staffForm, reportsTo: value })}
                  />
                  <Input label="Email" type="email" value={staffForm.email} onChange={value => setStaffForm({ ...staffForm, email: value })} />
                  <Input label="Phone" value={staffForm.phone} onChange={value => setStaffForm({ ...staffForm, phone: value })} />
                  <Input label="Skills" value={staffForm.skills} onChange={value => setStaffForm({ ...staffForm, skills: value })} placeholder="M&E, Finance, Pastoral care" />
                  <button className="self-end inline-flex justify-center items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    <Plus className="w-4 h-4" />
                    Add Staff
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scopedStaff.map(member => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <button type="button" onClick={() => setSelectedStaffId(member.id)} className="text-left">
                          <p className="font-bold">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </button>
                        <DeleteButton onClick={() => removeItem('staff', member.id, `Staff ${member.name}`)} />
                      </div>
                      <div className="mt-3 text-sm text-gray-600 space-y-1">
                        <p>Organization: {organizationById[member.organizationId || branchById[member.branchId]?.organizationId]?.name || member.organization?.name || currentOrganization.name}</p>
                        <p>Branch: {branchById[member.branchId]?.name || 'Unassigned'}</p>
                        <p>Department: {departmentById[member.departmentId]?.name || 'Unassigned'}</p>
                        <p>Reports to: {workspace.staff.find(person => person.id === member.reportsTo)?.name || 'Top level'}</p>
                        <p>Email: {member.email || 'Not set'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedStaff && (
                  <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div>
                          <h4 className="text-base sm:text-xl font-bold">{selectedStaff.name}</h4>
                          <p className="text-sm text-gray-600">{selectedStaff.role} â€¢ {branchById[selectedStaff.branchId]?.name || 'Unassigned'} â€¢ {departmentById[selectedStaff.departmentId]?.name || 'Unassigned'}</p>
                        </div>
                        <SelectInput label="Select Staff" value={selectedStaff.id} options={scopedStaff.map(member => ({ label: member.name, value: member.id }))} onChange={setSelectedStaffId} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                          label="Organization"
                          value={selectedStaff.organizationId || branchById[selectedStaff.branchId]?.organizationId || currentOrganization.id}
                          options={workspace.organizations.map(organization => ({ label: organization.name, value: organization.id }))}
                          onChange={value => {
                            const linkedOrganization = organizationById[value] || currentOrganization;
                            const branches = workspace.branches.filter(branch => !branch.organizationId || branch.organizationId === value);
                            const branch = branches[0] || null;
                            const departments = workspace.departments.filter(department => branches.some(branch => branch.id === department.branchId));
                            const department = departments[0] || null;
                            updateStaff(selectedStaff.id, 'organizationId', linkedOrganization.id);
                            updateStaff(selectedStaff.id, 'organization', getOrganizationSnapshot(linkedOrganization));
                            updateStaff(selectedStaff.id, 'branchId', branch?.id || '');
                            updateStaff(selectedStaff.id, 'branch', branch ? { id: branch.id, name: branch.name, type: branch.type, region: branch.region, country: branch.country } : null);
                            updateStaff(selectedStaff.id, 'departmentId', department?.id || '');
                            updateStaff(selectedStaff.id, 'department', department ? { id: department.id, name: department.name, branchId: department.branchId, costCenter: department.costCenter } : null);
                            updateStaff(selectedStaff.id, 'reportsTo', '');
                            switchOrganization(value);
                          }}
                        />
                        <EditableField label="Full Name" value={selectedStaff.name || ''} onSave={value => updateStaff(selectedStaff.id, 'name', value)} />
                        <EditableField label="Employee ID" value={selectedStaff.employeeId || ''} onSave={value => updateStaff(selectedStaff.id, 'employeeId', value)} />
                        <EditableField label="Role / Position" value={selectedStaff.role || ''} onSave={value => updateStaff(selectedStaff.id, 'role', value)} />
                        <SelectField label="Employment Type" value={selectedStaff.employmentType || 'Full-time'} options={['Full-time', 'Part-time', 'Contract', 'Volunteer', 'Pastor / Church Leader']} onChange={value => updateStaff(selectedStaff.id, 'employmentType', value)} />
                        <EditableField label="Start Date" value={selectedStaff.startDate || ''} onSave={value => updateStaff(selectedStaff.id, 'startDate', value)} />
                        <SelectField
                          label="Branch"
                          value={selectedStaff.branchId || ''}
                          options={scopedBranches.map(branch => ({ label: branch.name, value: branch.id }))}
                          onChange={value => {
                            const branch = branchById[value];
                            const linkedOrganization = organizationById[branch?.organizationId] || currentOrganization;
                            const departments = scopedDepartments.filter(department => department.branchId === value);
                            const department = departments[0] || null;
                            updateStaff(selectedStaff.id, 'branchId', value);
                            updateStaff(selectedStaff.id, 'branch', branch ? { id: branch.id, name: branch.name, type: branch.type, region: branch.region, country: branch.country } : null);
                            updateStaff(selectedStaff.id, 'organizationId', linkedOrganization.id);
                            updateStaff(selectedStaff.id, 'organization', getOrganizationSnapshot(linkedOrganization));
                            updateStaff(selectedStaff.id, 'departmentId', department?.id || '');
                            updateStaff(selectedStaff.id, 'department', department ? { id: department.id, name: department.name, branchId: department.branchId, costCenter: department.costCenter } : null);
                          }}
                        />
                        <SelectField
                          label="Department"
                          value={selectedStaff.departmentId || ''}
                          options={scopedDepartments.map(department => ({ label: department.name, value: department.id }))}
                          onChange={value => {
                            const department = departmentById[value];
                            updateStaff(selectedStaff.id, 'departmentId', value);
                            updateStaff(selectedStaff.id, 'department', department ? { id: department.id, name: department.name, branchId: department.branchId, costCenter: department.costCenter } : null);
                          }}
                        />
                        <SelectField
                          label="Reports To"
                          value={selectedStaff.reportsTo || ''}
                          options={[{ label: 'Top level', value: '' }, ...scopedStaff.filter(member => member.id !== selectedStaff.id).map(member => ({ label: member.name, value: member.id }))]}
                          onChange={value => updateStaff(selectedStaff.id, 'reportsTo', value)}
                        />
                        <EditableField label="Email" value={selectedStaff.email || ''} onSave={value => updateStaff(selectedStaff.id, 'email', value)} />
                        <EditableField label="Phone" value={selectedStaff.phone || ''} onSave={value => updateStaff(selectedStaff.id, 'phone', value)} />
                        <EditableField label="Skills" value={selectedStaff.skills || ''} onSave={value => updateStaff(selectedStaff.id, 'skills', value)} />
                        <SelectField label="Status" value={selectedStaff.status || 'Active'} options={statusOptions} onChange={value => updateStaff(selectedStaff.id, 'status', value)} />
                      </div>

                      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h4 className="font-bold mb-3">Professional Staff Profile</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <ProfileItem label="Organization" value={organizationById[selectedStaff.organizationId || branchById[selectedStaff.branchId]?.organizationId]?.name || selectedStaff.organization?.name || currentOrganization.name} />
                          <ProfileItem label="Branch" value={branchById[selectedStaff.branchId]?.name || 'Unassigned'} />
                          <ProfileItem label="Department" value={departmentById[selectedStaff.departmentId]?.name || 'Unassigned'} />
                          <ProfileItem label="Reports To" value={scopedStaff.find(member => member.id === selectedStaff.reportsTo)?.name || 'Top level'} />
                          <ProfileItem label="Employment" value={selectedStaff.employmentType || 'Not set'} />
                          <ProfileItem label="Skills" value={selectedStaff.skills || 'Not set'} />
                          <ProfileItem label="Documents" value={`${(selectedStaff.documents || []).length} uploaded`} />
                        </div>
                      </div>

                      <div className="mt-6 rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold mb-3">Staff Permissions</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {staffPermissionOptions.map(permission => (
                            <label key={permission} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                              <input
                                type="checkbox"
                                checked={(selectedStaff.permissions || []).includes(permission)}
                                onChange={() => toggleStaffPermission(selectedStaff.id, permission)}
                              />
                              {permission}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold mb-3">Emergency Contact</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <EditableField label="Name" value={selectedStaff.emergencyContact?.name || ''} onSave={value => updateStaff(selectedStaff.id, 'emergencyContact.name', value)} />
                          <EditableField label="Relationship" value={selectedStaff.emergencyContact?.relationship || ''} onSave={value => updateStaff(selectedStaff.id, 'emergencyContact.relationship', value)} />
                          <EditableField label="Phone" value={selectedStaff.emergencyContact?.phone || ''} onSave={value => updateStaff(selectedStaff.id, 'emergencyContact.phone', value)} />
                        </div>
                      </div>

                      <div className="mt-6">
                        <MiniTable
                          title="Direct Reports"
                          columns={['Staff', 'Role', 'Department']}
                          rows={scopedStaff.filter(member => member.reportsTo === selectedStaff.id).map(member => [member.name, member.role, departmentById[member.departmentId]?.name || 'Unassigned'])}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <Image className="w-4 h-4 text-emerald-700" />
                          Staff Photo
                        </h4>
                        <div className="aspect-square rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {selectedStaffPhotos[0]?.dataUrl ? (
                            <img src={selectedStaffPhotos[0].dataUrl} alt={selectedStaff.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-center text-gray-500">
                              <Image className="w-10 h-10 mx-auto mb-2" />
                              <p className="text-sm font-semibold">No staff photo</p>
                            </div>
                          )}
                        </div>
                        {selectedStaffPhotos.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {selectedStaffPhotos.map((photo, index) => {
                              const photoId = photo.id || `legacy-staff-photo-${index}`;
                              return (
                                <div key={photoId} className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm">
                                  <div className="min-w-0">
                                    <span className="block truncate font-semibold">{photo.name || `Staff photo ${index + 1}`}</span>
                                    <span className="text-xs text-gray-500">{formatFileSize(photo.originalSize || photo.size)}{index === 0 ? ' â€¢ Primary' : ''}</span>
                                  </div>
                                  <button type="button" onClick={() => removeStaffPhoto(selectedStaff.id, photoId)} className="text-red-600 font-semibold">Remove</button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                          <Upload className="w-4 h-4" />
                          Upload Staff Photos
                          <input type="file" accept="image/*" multiple onChange={event => uploadStaffPhoto(event, selectedStaff.id)} className="hidden" />
                        </label>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-700" />
                          Staff Documents
                        </h4>
                        <div className="flex gap-2 mb-3">
                          <select value={staffDocumentCategory} onChange={event => setStaffDocumentCategory(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            {staffDocumentCategories.map(category => <option key={category} value={category}>{category}</option>)}
                          </select>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                            <Upload className="w-4 h-4" />
                            Upload
                            <input type="file" multiple onChange={event => uploadStaffDocument(event, selectedStaff.id)} className="hidden" />
                          </label>
                        </div>
                        <div className="space-y-2">
                          {(selectedStaff.documents || []).length === 0 && <p className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">No staff documents uploaded.</p>}
                          {(selectedStaff.documents || []).map(document => (
                            <div key={document.id} className="rounded-md border border-gray-200 p-3">
                              <p className="font-semibold">{document.name}</p>
                              <p className="text-xs text-gray-500">{document.category} â€¢ {formatFileSize(document.size)}</p>
                              <div className="mt-2 flex gap-2">
                                {document.dataUrl && <a href={document.dataUrl} download={document.name} className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold hover:bg-gray-50">Download</a>}
                                <button type="button" onClick={() => removeStaffDocument(selectedStaff.id, document.id)} className="rounded-md border border-red-200 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-50">Remove</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Panel>
            )}

            {activeTab === 'roles' && (
              <Panel title="User Roles & Permissions" subtitle="Create permission bundles for administrators, finance teams, field officers, church leaders, and report viewers.">
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Roles will be configured for</p>
                      <h4 className="mt-1 text-base sm:text-xl font-bold text-emerald-950">{roleFormOrganization.name}</h4>
                      <p className="mt-1 text-sm text-emerald-800">
                        {roleFormOrganization.type} â€¢ {roleFormOrganization.registrationNo || 'No registration'} â€¢ {scopedStaff.length} staff available
                      </p>
                    </div>
                    <div className="w-full lg:w-72">
                      <SelectInput
                        label="Active Organization"
                        value={roleFormOrganization.id}
                        options={workspace.organizations.map(organization => ({ label: organization.name, value: organization.id }))}
                        onChange={value => {
                          setRoleForm({ ...roleForm, organizationId: value, branchIds: [], departmentIds: [], staffIds: [] });
                          switchOrganization(value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    <ProfileItem label="Legal Name" value={roleFormOrganization.legalName || roleFormOrganization.name} />
                    <ProfileItem label="Tax ID / TIN" value={roleFormOrganization.taxId || 'Not set'} />
                    <ProfileItem label="Address" value={getFullAddress(roleFormOrganization)} />
                    <ProfileItem label="Office Email" value={roleFormOrganization.contact?.email || 'Not set'} />
                    <ProfileItem label="Branches" value={`${scopedBranches.length}`} />
                    <ProfileItem label="Departments" value={`${scopedDepartments.length}`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                  <Metric icon={ShieldCheck} label="Roles" value={scopedRoles.length} />
                  <Metric icon={Users} label="Assigned Staff" value={[...new Set(scopedRoles.flatMap(role => role.staffIds || []))].length} />
                  <Metric icon={Building2} label="Branch Scopes" value={[...new Set(scopedRoles.flatMap(role => role.branchIds || []))].length} />
                  <Metric icon={Network} label="Department Scopes" value={[...new Set(scopedRoles.flatMap(role => role.departmentIds || []))].length} />
                  <Metric icon={ClipboardCheck} label="Permissions" value={[...new Set(scopedRoles.flatMap(role => role.permissions || []))].length} />
                </div>

                <form onSubmit={createRole} className="space-y-4 mb-6 rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <SelectInput
                      label="Organization"
                      value={roleFormOrganization.id}
                      options={workspace.organizations.map(organization => ({ label: organization.name, value: organization.id }))}
                      onChange={value => {
                        setRoleForm({ ...roleForm, organizationId: value, branchIds: [], departmentIds: [], staffIds: [] });
                        switchOrganization(value);
                      }}
                    />
                    <Input label="Role Name" value={roleForm.name} onChange={value => setRoleForm({ ...roleForm, name: value })} required />
                    <Input label="Description" value={roleForm.description} onChange={value => setRoleForm({ ...roleForm, description: value })} />
                    <SelectInput label="Scope" value={roleForm.scope} options={roleScopes} onChange={value => setRoleForm({ ...roleForm, scope: value })} />
                    <Input label="Approval Limit" type="number" value={roleForm.approvalLimit} onChange={value => setRoleForm({ ...roleForm, approvalLimit: Number(value || 0) })} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {[...new Set(permissionCatalog.map(item => item.group))].map(group => (
                      <div key={group} className="rounded-lg border border-gray-200 p-3">
                        <h4 className="font-bold text-sm mb-2">{group}</h4>
                        <div className="space-y-2">
                          {permissionCatalog.filter(item => item.group === group).map(permission => (
                            <label key={permission.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={roleForm.permissions.includes(permission.id)}
                                onChange={(event) => {
                                  const permissions = event.target.checked
                                    ? [...roleForm.permissions, permission.id]
                                    : roleForm.permissions.filter(item => item !== permission.id);
                                  setRoleForm({ ...roleForm, permissions });
                                }}
                              />
                              {permission.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    <Plus className="w-4 h-4" />
                    Add Role
                  </button>
                </form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scopedRoles.map(role => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <button type="button" onClick={() => setSelectedRoleId(role.id)} className="text-left">
                          <p className="font-bold">{role.name}</p>
                          <p className="text-sm text-gray-600">{organizationById[role.organizationId]?.name || role.organization?.name || currentOrganization.name} - {role.scope || 'Organization'} scope - {role.description || 'No description'}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(role.permissions || []).map(permission => (
                              <span key={permission} className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{permission}</span>
                            ))}
                          </div>
                        </button>
                        <DeleteButton onClick={() => removeItem('roles', role.id, `Role ${role.name}`)} />
                      </div>
                    </div>
                  ))}
                </div>

                {selectedRole && (
                  <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div>
                          <h4 className="text-base sm:text-xl font-bold">{selectedRole.name}</h4>
                          <p className="text-sm text-gray-600">{selectedRole.scope || 'Organization'} scope â€¢ {(selectedRole.permissions || []).length} permissions</p>
                        </div>
                        <SelectInput label="Select Role" value={selectedRole.id} options={scopedRoles.map(role => ({ label: role.name, value: role.id }))} onChange={setSelectedRoleId} />
                      </div>

                      <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Connected Organization</p>
                            <h5 className="mt-1 font-bold text-emerald-950">
                              {selectedRoleOrganization.name}
                            </h5>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                            {(selectedRole.permissions || []).length} permissions
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <ProfileItem label="Registration" value={selectedRoleOrganization.registrationNo || 'Not set'} />
                          <ProfileItem label="Tax ID / TIN" value={selectedRoleOrganization.taxId || 'Not set'} />
                          <ProfileItem label="Organization Address" value={getFullAddress(selectedRoleOrganization)} />
                          <ProfileItem label="Branch Options" value={`${roleScopedBranches.length}`} />
                          <ProfileItem label="Department Options" value={`${roleScopedDepartments.length}`} />
                          <ProfileItem label="Staff Options" value={`${roleScopedStaff.length}`} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                          label="Organization"
                          value={selectedRole.organizationId || currentOrganization.id}
                          options={workspace.organizations.map(organization => ({ label: organization.name, value: organization.id }))}
                          onChange={value => {
                            const linkedOrganization = organizationById[value] || currentOrganization;
                            updateRole(selectedRole.id, 'organizationId', linkedOrganization.id);
                            updateRole(selectedRole.id, 'organization', getOrganizationSnapshot(linkedOrganization));
                            updateRole(selectedRole.id, 'branchIds', []);
                            updateRole(selectedRole.id, 'departmentIds', []);
                            updateRole(selectedRole.id, 'staffIds', []);
                            switchOrganization(value);
                          }}
                        />
                        <EditableField label="Role Name" value={selectedRole.name || ''} onSave={value => updateRole(selectedRole.id, 'name', value)} />
                        <EditableField label="Description" value={selectedRole.description || ''} onSave={value => updateRole(selectedRole.id, 'description', value)} />
                        <SelectField label="Scope" value={selectedRole.scope || 'Organization'} options={roleScopes} onChange={value => updateRole(selectedRole.id, 'scope', value)} />
                        <EditableField label="Approval Limit" value={String(selectedRole.approvalLimit || '')} onSave={value => updateRole(selectedRole.id, 'approvalLimit', Number(value || 0))} />
                        <SelectField label="Status" value={selectedRole.status || 'Active'} options={statusOptions} onChange={value => updateRole(selectedRole.id, 'status', value)} />
                      </div>

                      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h4 className="font-bold mb-3">Professional Access Profile</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <ProfileItem label="Organization" value={selectedRoleOrganization.name} />
                          <ProfileItem label="Scope" value={selectedRole.scope || 'Organization'} />
                          <ProfileItem label="Approval Limit" value={money(selectedRole.approvalLimit || 0, selectedRoleOrganization.defaultCurrency || currentOrganization.defaultCurrency)} />
                          <ProfileItem label="Assigned Staff" value={`${(selectedRole.staffIds || []).length}`} />
                          <ProfileItem label="Branches" value={`${(selectedRole.branchIds || []).length || 'All'}`} />
                          <ProfileItem label="Departments" value={`${(selectedRole.departmentIds || []).length || 'All'}`} />
                          <ProfileItem label="Status" value={selectedRole.status || 'Active'} />
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-lg border border-gray-200 p-4">
                          <h4 className="font-bold mb-3">Permission Matrix</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[...new Set(permissionCatalog.map(item => item.group))].map(group => (
                              <div key={group} className="rounded-lg border border-gray-200 p-3">
                                <h5 className="font-bold text-sm mb-2">{group}</h5>
                                <div className="space-y-2">
                                  {permissionCatalog.filter(item => item.group === group).map(permission => (
                                    <label key={permission.id} className="flex items-center gap-2 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={(selectedRole.permissions || []).includes(permission.id)}
                                        onChange={() => toggleRolePermission(selectedRole.id, permission.id)}
                                      />
                                      {permission.label}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4">
                          <h4 className="font-bold mb-3">Scope Assignments</h4>
                          <AssignmentGroup title="Branches" items={roleScopedBranches} selected={selectedRole.branchIds || []} onToggle={id => toggleRoleAssignment(selectedRole.id, 'branchIds', id)} />
                          <AssignmentGroup title="Departments" items={roleScopedDepartments} selected={selectedRole.departmentIds || []} onToggle={id => toggleRoleAssignment(selectedRole.id, 'departmentIds', id)} />
                          <AssignmentGroup title="Staff" items={roleScopedStaff} selected={selectedRole.staffIds || []} onToggle={id => toggleRoleAssignment(selectedRole.id, 'staffIds', id)} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <MiniTable
                        title="Assigned Staff"
                        columns={['Staff', 'Role', 'Branch']}
                        rows={roleScopedStaff.filter(member => (selectedRole.staffIds || []).includes(member.id)).map(member => [member.name, member.role, branchById[member.branchId]?.name || 'Unassigned'])}
                      />
                      <MiniTable
                        title="Access Controls"
                        columns={['Control', 'Status']}
                        rows={[
                          ['Finance access', (selectedRole.permissions || []).includes('finance') ? 'Enabled' : 'Disabled'],
                          ['GIS access', (selectedRole.permissions || []).includes('gis') ? 'Enabled' : 'Disabled'],
                          ['Reports access', (selectedRole.permissions || []).includes('reports') ? 'Enabled' : 'Disabled'],
                          ['User administration', (selectedRole.permissions || []).includes('users') ? 'Enabled' : 'Disabled']
                        ]}
                      />
                    </div>
                  </div>
                )}
              </Panel>
            )}

            {activeTab === 'finance' && (
              <Panel title="Finance Audit Workspace" subtitle="Operate budgets, grants, payroll approvals, and donor financial reports from one audit-ready finance area.">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                  <Metric icon={Landmark} label="Department Budgets" value={money(summary.totalBudget, currentOrganization.defaultCurrency)} />
                  <Metric icon={BriefcaseBusiness} label="Grant Budget" value={money(summary.grantBudget, currentOrganization.defaultCurrency)} />
                  <Metric icon={CreditCard} label="Grant Spent" value={money(summary.grantSpent, currentOrganization.defaultCurrency)} />
                  <Metric icon={Users} label="Payroll" value={money(summary.payrollTotal, currentOrganization.defaultCurrency)} />
                  <Metric icon={FileText} label="Donor Net" value={money(summary.donorIncome - summary.donorExpenses, currentOrganization.defaultCurrency)} />
                  <Metric icon={DollarSign} label="Bank Balance" value={money(summary.bankBalance, currentOrganization.defaultCurrency)} />
                  <Metric icon={CreditCard} label="Payments" value={money(summary.paymentTotal, currentOrganization.defaultCurrency)} />
                  <Metric icon={BarChart3} label="Trial Balance" value={summary.postedDebits === summary.postedCredits ? 'Balanced' : 'Review'} />
                </div>

                <FinanceChecklist workspace={{ ...workspace, grants: scopedGrants, payrollRuns: scopedPayrollRuns, donorReports: scopedDonorReports }} summary={summary} />

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-6">
                  <aside className="rounded-lg border border-gray-200 bg-white p-2 h-fit xl:sticky xl:top-24">
                  {financeSections.map(section => {
                    const Icon = section.icon;
                    const selected = financeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setFinanceSection(section.id)}
                        className={`w-full inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                          selected ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {section.label}
                      </button>
                    );
                  })}
                  </aside>
                  <div className="space-y-6">

                {financeSection === 'accounting' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <form onSubmit={createAccount} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3">Chart of Accounts</h4>
                    <div className="space-y-3">
                      <SelectInput
                        label="Account Code"
                        value={accountForm.code}
                        options={professionalNgoChartOfAccounts.map(account => ({ label: `${account.code} - ${account.name}`, value: account.code }))}
                        onChange={applyAccountSetting}
                        required
                      />
                      <SelectInput
                        label="Account Name"
                        value={accountForm.code}
                        options={professionalNgoChartOfAccounts.map(account => ({ label: account.name, value: account.code }))}
                        onChange={applyAccountSetting}
                        required
                      />
                      <SelectInput label="Type" value={accountForm.type} options={accountTypes} onChange={value => setAccountForm({ ...accountForm, type: value })} />
                      <SelectInput label="Fund" value={accountForm.fund} options={fundTypes} onChange={value => setAccountForm({ ...accountForm, fund: value })} />
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={accountForm.restricted} onChange={e => setAccountForm({ ...accountForm, restricted: e.target.checked })} /> Restricted fund</label>
                      <SubmitButton label="Add Account" />
                    </div>
                  </form>
                  <ChartAccountManager
                    accounts={scopedChartOfAccounts}
                    onEdit={editChartAccount}
                    onRemove={removeChartAccount}
                  />
                </div>
                )}

                {financeSection === 'expenses' && (
                <div className="space-y-6">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <h4 className="font-bold text-emerald-900">Payment workflow is separated</h4>
                    <p className="mt-1 text-sm text-emerald-800">Use Create Payment Voucher to prepare expenses. Use Approve Payment Vouchers to approve only after documentation and review are complete.</p>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <form onSubmit={createPayment} className="rounded-lg border border-gray-200 bg-white p-4">
                    <h4 className="font-bold mb-1">Create Payment Voucher</h4>
                    <p className="mb-4 text-sm text-gray-600">Prepare NGO project expenses with account, grant, bank, documentation, and review fields before approval.</p>
                    <div className="space-y-3">
                      <SelectInput label="Project" value={paymentForm.projectId} options={workspace.projects.map(project => ({ label: `${project.code} - ${project.name}`, value: project.id }))} onChange={value => setPaymentForm({ ...paymentForm, projectId: value })} />
                      <SelectInput label="Grant" value={paymentForm.grantId} options={scopedGrants.map(grant => ({ label: grant.name, value: grant.id }))} onChange={value => setPaymentForm({ ...paymentForm, grantId: value })} />
                      <Input label="Voucher No." value={paymentForm.voucherNo} onChange={value => setPaymentForm({ ...paymentForm, voucherNo: value })} required />
                      <Input label="Payee" value={paymentForm.payee} onChange={value => setPaymentForm({ ...paymentForm, payee: value })} required />
                      <Input label="Date" type="date" value={paymentForm.date} onChange={value => setPaymentForm({ ...paymentForm, date: value })} />
                      <Input label="Amount" type="number" value={paymentForm.amount} onChange={value => setPaymentForm({ ...paymentForm, amount: value })} />
                      <SelectInput label="Expense Account" value={paymentForm.accountCode} options={scopedChartOfAccounts.filter(a => a.type === 'Expense').map(a => ({ label: `${a.code} - ${a.name}`, value: a.code }))} onChange={value => setPaymentForm({ ...paymentForm, accountCode: value })} />
                      <SelectInput label="Bank" value={paymentForm.bankAccountId} options={scopedBankAccounts.map(bank => ({ label: bank.name, value: bank.id }))} onChange={value => setPaymentForm({ ...paymentForm, bankAccountId: value })} />
                      <SelectInput label="Status" value={paymentForm.paymentStatus} options={['Draft', 'Ready', 'Paid']} onChange={value => setPaymentForm({ ...paymentForm, paymentStatus: value })} />
                      <SelectInput label="Documentation" value={paymentForm.documentationStatus} options={['Pending', 'Complete', 'Exception Approved']} onChange={value => setPaymentForm({ ...paymentForm, documentationStatus: value })} />
                      <Input label="Prepared By" value={paymentForm.preparedBy} onChange={value => setPaymentForm({ ...paymentForm, preparedBy: value })} />
                      <Input label="Reviewed By" value={paymentForm.reviewedBy} onChange={value => setPaymentForm({ ...paymentForm, reviewedBy: value })} />
                      <Input label="Notes" value={paymentForm.notes} onChange={value => setPaymentForm({ ...paymentForm, notes: value })} />
                      <SubmitButton label={paymentForm.id ? 'Update Payment' : 'Create Payment'} />
                    </div>
                  </form>
                  <FinanceActionTable
                    title="Approve Payment Vouchers"
                    columns={['Voucher', 'Project', 'Payee', 'Amount', 'Approval', 'Actions']}
                    rows={scopedPayments.map(payment => [
                      payment.voucherNo,
                      workspace.projects.find(project => project.id === payment.projectId)?.code || 'Unassigned',
                      payment.payee,
                      money(payment.amount, currentOrganization.defaultCurrency),
                      `${payment.approvalStatus} / ${payment.documentationStatus || 'Pending'}`,
                      <RowActions
                        onEdit={() => setPaymentForm({ ...blankPayment, ...payment })}
                        onApprove={() => approvePayment(payment)}
                        onRemove={() => removeItem('payments', payment.id, `Payment voucher ${payment.voucherNo}`)}
                        approveDisabled={payment.approvalStatus === 'Approved'}
                        approveLabel="Approve Payment"
                      />
                    ])}
                  />
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <form onSubmit={createBankAccount} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3">Bank & Cash Account</h4>
                    <div className="space-y-3">
                      <SelectInput
                        label="Account Name"
                        value={bankForm.accountCode}
                        options={scopedChartOfAccounts.filter(account => account.type === 'Asset' && /cash|bank/i.test(account.name)).map(account => ({ label: `${account.code} - ${account.name}`, value: account.code }))}
                        onChange={applyBankAccountSetting}
                        required
                      />
                      <Input label="Bank Name" value={bankForm.bankName} onChange={value => setBankForm({ ...bankForm, bankName: value })} />
                      <Input label="Account Number" value={bankForm.accountNumber} onChange={value => setBankForm({ ...bankForm, accountNumber: value })} />
                      <SelectInput label="Currency" value={bankForm.currency} options={workspace.currencies} onChange={value => setBankForm({ ...bankForm, currency: value })} />
                      <Input label="Opening Balance" type="number" value={bankForm.openingBalance} onChange={value => setBankForm({ ...bankForm, openingBalance: value })} />
                      <Input label="Reconciled Balance" type="number" value={bankForm.reconciledBalance} onChange={value => setBankForm({ ...bankForm, reconciledBalance: value })} />
                      <SubmitButton label="Add Bank" />
                    </div>
                  </form>
                  <FinanceActionTable
                    title="Bank Reconciliation"
                    columns={['Account', 'Bank', 'Currency', 'Reconciled', 'Actions']}
                    rows={scopedBankAccounts.map(bank => [
                      bank.name,
                      bank.bankName,
                      bank.currency,
                      money(bank.reconciledBalance, bank.currency),
                      <RowActions
                        onEdit={() => setBankForm(bank)}
                        onRemove={() => removeItem('bankAccounts', bank.id, `Bank account ${bank.name}`)}
                      />
                    ])}
                  />
                  </div>
                </div>
                )}

                {false && financeSection === 'expenses' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <form onSubmit={createPayment} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-1">Create Payment Voucher</h4>
                    <p className="mb-4 text-sm text-gray-600">Prepare NGO project expenses with account, grant, bank, documentation, and review fields before approval.</p>
                    <div className="space-y-3">
                      <SelectInput label="Project" value={paymentForm.projectId} options={workspace.projects.map(project => ({ label: `${project.code} - ${project.name}`, value: project.id }))} onChange={value => setPaymentForm({ ...paymentForm, projectId: value })} />
                      <SelectInput label="Grant" value={paymentForm.grantId} options={scopedGrants.map(grant => ({ label: grant.name, value: grant.id }))} onChange={value => setPaymentForm({ ...paymentForm, grantId: value })} />
                      <Input label="Voucher No." value={paymentForm.voucherNo} onChange={value => setPaymentForm({ ...paymentForm, voucherNo: value })} required />
                      <Input label="Payee" value={paymentForm.payee} onChange={value => setPaymentForm({ ...paymentForm, payee: value })} required />
                      <Input label="Date" type="date" value={paymentForm.date} onChange={value => setPaymentForm({ ...paymentForm, date: value })} />
                      <Input label="Amount" type="number" value={paymentForm.amount} onChange={value => setPaymentForm({ ...paymentForm, amount: value })} />
                      <SelectInput label="Expense Account" value={paymentForm.accountCode} options={scopedChartOfAccounts.filter(a => a.type === 'Expense').map(a => ({ label: `${a.code} - ${a.name}`, value: a.code }))} onChange={value => setPaymentForm({ ...paymentForm, accountCode: value })} />
                      <SelectInput label="Bank" value={paymentForm.bankAccountId} options={scopedBankAccounts.map(bank => ({ label: bank.name, value: bank.id }))} onChange={value => setPaymentForm({ ...paymentForm, bankAccountId: value })} />
                      <SelectInput label="Approval" value={paymentForm.approvalStatus} options={['Pending', 'Approved', 'Rejected']} onChange={value => setPaymentForm({ ...paymentForm, approvalStatus: value })} />
                      <SelectInput label="Status" value={paymentForm.paymentStatus} options={['Draft', 'Ready', 'Paid']} onChange={value => setPaymentForm({ ...paymentForm, paymentStatus: value })} />
                      <SelectInput label="Documentation" value={paymentForm.documentationStatus} options={['Pending', 'Complete', 'Exception Approved']} onChange={value => setPaymentForm({ ...paymentForm, documentationStatus: value })} />
                      <Input label="Prepared By" value={paymentForm.preparedBy} onChange={value => setPaymentForm({ ...paymentForm, preparedBy: value })} />
                      <Input label="Reviewed By" value={paymentForm.reviewedBy} onChange={value => setPaymentForm({ ...paymentForm, reviewedBy: value })} />
                      <Input label="Notes" value={paymentForm.notes} onChange={value => setPaymentForm({ ...paymentForm, notes: value })} />
                      <SubmitButton label={paymentForm.id ? 'Update Payment' : 'Create Payment'} />
                    </div>
                  </form>
                  <FinanceActionTable
                    title="Approve Payment Vouchers"
                    columns={['Voucher', 'Project', 'Payee', 'Amount', 'Approval', 'Actions']}
                    rows={scopedPayments.map(payment => [
                      payment.voucherNo,
                      workspace.projects.find(project => project.id === payment.projectId)?.code || 'Unassigned',
                      payment.payee,
                      money(payment.amount, currentOrganization.defaultCurrency),
                      `${payment.approvalStatus} / ${payment.documentationStatus || 'Pending'}`,
                      <RowActions
                        onEdit={() => setPaymentForm({ ...blankPayment, ...payment })}
                        onApprove={() => approvePayment(payment)}
                        onRemove={() => removeItem('payments', payment.id, `Payment voucher ${payment.voucherNo}`)}
                        approveDisabled={payment.approvalStatus === 'Approved'}
                        approveLabel="Approve Payment"
                      />
                    ])}
                  />
                </div>
                )}

                {financeSection === 'accounting' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <form onSubmit={createJournalEntry} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3">Double-Entry Journal</h4>
                    <div className="space-y-3">
                      <SelectInput label="Project" value={journalForm.projectId} options={workspace.projects.map(project => ({ label: `${project.code} - ${project.name}`, value: project.id }))} onChange={value => setJournalForm({ ...journalForm, projectId: value })} />
                      <SelectInput label="Grant" value={journalForm.grantId} options={scopedGrants.map(grant => ({ label: grant.name, value: grant.id }))} onChange={value => setJournalForm({ ...journalForm, grantId: value })} />
                      <Input label="Date" type="date" value={journalForm.date} onChange={value => setJournalForm({ ...journalForm, date: value })} />
                      <Input label="Reference" value={journalForm.reference} onChange={value => setJournalForm({ ...journalForm, reference: value })} />
                      <Input label="Description" value={journalForm.description} onChange={value => setJournalForm({ ...journalForm, description: value })} />
                      <SelectInput label="Debit Account" value={journalForm.debitAccount} options={scopedChartOfAccounts.map(a => ({ label: `${a.code} - ${a.name}`, value: a.code }))} onChange={value => setJournalForm({ ...journalForm, debitAccount: value })} />
                      <SelectInput label="Credit Account" value={journalForm.creditAccount} options={scopedChartOfAccounts.map(a => ({ label: `${a.code} - ${a.name}`, value: a.code }))} onChange={value => setJournalForm({ ...journalForm, creditAccount: value })} />
                      <Input label="Amount" type="number" value={journalForm.amount} onChange={value => setJournalForm({ ...journalForm, amount: value })} />
                      <SelectInput label="Fund" value={journalForm.fund} options={fundTypes} onChange={value => setJournalForm({ ...journalForm, fund: value })} />
                      <SelectInput label="Approval" value={journalForm.approvalStatus} options={['Pending', 'Approved', 'Rejected']} onChange={value => setJournalForm({ ...journalForm, approvalStatus: value })} />
                      <Input label="Prepared By" value={journalForm.preparedBy} onChange={value => setJournalForm({ ...journalForm, preparedBy: value })} />
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={journalForm.posted} onChange={e => setJournalForm({ ...journalForm, posted: e.target.checked })} /> Posted</label>
                      <SubmitButton label={journalForm.id ? 'Update Journal' : 'Add Journal'} />
                    </div>
                  </form>
                  <FinanceActionTable
                    title="Journal Entries"
                    columns={['Reference', 'Debit', 'Credit', 'Amount', 'Actions']}
                    rows={scopedJournalEntries.map(entry => [
                      entry.reference,
                      entry.debitAccount,
                      entry.creditAccount,
                      `${money(entry.amount, currentOrganization.defaultCurrency)}${entry.posted ? ' posted' : ' draft'}`,
                      <RowActions
                        onEdit={() => setJournalForm({ ...blankJournalEntry, ...entry })}
                        onApprove={() => postJournalEntry(entry)}
                        onRemove={() => removeItem('journalEntries', entry.id, `Journal entry ${entry.reference || entry.description}`)}
                        approveDisabled={entry.posted}
                        approveLabel="Post"
                      />
                    ])}
                  />
                </div>
                )}

                {financeSection === 'income' && (
                <div className="space-y-6">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <h4 className="font-bold text-emerald-900">Budget workflow is separated</h4>
                    <p className="mt-1 text-sm text-emerald-800">Create or update grants and budgets first. Approve NGO budgets from the Budget Approval Queue after donor, project, and compliance review.</p>
                  </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <form onSubmit={createGrant} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2"><BriefcaseBusiness className="w-4 h-4 text-emerald-700" /> Grant Management</h4>
                    <div className="space-y-3">
                      <SelectInput label="Project" value={grantForm.projectId} options={workspace.projects.map(project => ({ label: `${project.code} - ${project.name}`, value: project.id }))} onChange={value => setGrantForm({ ...grantForm, projectId: value })} />
                      <Input label="Grant Name" value={grantForm.name} onChange={value => setGrantForm({ ...grantForm, name: value })} required />
                      <Input label="Donor" value={grantForm.donor} onChange={value => setGrantForm({ ...grantForm, donor: value })} required />
                      <Input label="Budget" type="number" value={grantForm.budget} onChange={value => setGrantForm({ ...grantForm, budget: value })} />
                      <Input label="Spent" type="number" value={grantForm.spent} onChange={value => setGrantForm({ ...grantForm, spent: value })} />
                      <Input label="Deadline" type="date" value={grantForm.deadline} onChange={value => setGrantForm({ ...grantForm, deadline: value })} />
                      <SelectInput label="Compliance" value={grantForm.compliance} options={['On Track', 'Needs Review', 'At Risk']} onChange={value => setGrantForm({ ...grantForm, compliance: value })} />
                      <SelectInput label="Approval" value={grantForm.approvalStatus} options={['Pending', 'Approved', 'Rejected']} onChange={value => setGrantForm({ ...grantForm, approvalStatus: value })} />
                      <SelectInput label="Report Status" value={grantForm.reportStatus} options={['Draft', 'Submitted', 'Approved']} onChange={value => setGrantForm({ ...grantForm, reportStatus: value })} />
                      <SubmitButton label={grantForm.id ? 'Update Grant' : 'Add Grant'} />
                    </div>
                  </form>
                  <form onSubmit={createDonorReport} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-700" /> Project Income Report</h4>
                    <div className="space-y-3">
                      <SelectInput label="Project" value={donorReportForm.projectId} options={workspace.projects.map(project => ({ label: `${project.code} - ${project.name}`, value: project.id }))} onChange={value => setDonorReportForm({ ...donorReportForm, projectId: value })} />
                      <SelectInput label="Grant" value={donorReportForm.grantId} options={scopedGrants.map(grant => ({ label: grant.name, value: grant.id }))} onChange={value => setDonorReportForm({ ...donorReportForm, grantId: value })} />
                      <Input label="Report Title" value={donorReportForm.title} onChange={value => setDonorReportForm({ ...donorReportForm, title: value })} required />
                      <Input label="Donor" value={donorReportForm.donor} onChange={value => setDonorReportForm({ ...donorReportForm, donor: value })} required />
                      <Input label="Period" value={donorReportForm.period} onChange={value => setDonorReportForm({ ...donorReportForm, period: value })} placeholder="Q2 2026" />
                      <Input label="Income" type="number" value={donorReportForm.income} onChange={value => setDonorReportForm({ ...donorReportForm, income: value })} />
                      <Input label="Expenses" type="number" value={donorReportForm.expenses} onChange={value => setDonorReportForm({ ...donorReportForm, expenses: value })} />
                      <SelectInput label="Revenue Account" value={donorReportForm.revenueAccount} options={scopedChartOfAccounts.filter(a => a.type === 'Revenue').map(a => ({ label: `${a.code} - ${a.name}`, value: a.code }))} onChange={value => setDonorReportForm({ ...donorReportForm, revenueAccount: value })} />
                      <SelectInput label="Expense Account" value={donorReportForm.expenseAccount} options={scopedChartOfAccounts.filter(a => a.type === 'Expense').map(a => ({ label: `${a.code} - ${a.name}`, value: a.code }))} onChange={value => setDonorReportForm({ ...donorReportForm, expenseAccount: value })} />
                      <SelectInput label="Recognition Basis" value={donorReportForm.recognitionBasis} options={['Accrual', 'Cash', 'Modified Cash']} onChange={value => setDonorReportForm({ ...donorReportForm, recognitionBasis: value })} />
                      <SelectInput label="Status" value={donorReportForm.status} options={['Draft', 'Reviewed', 'Published']} onChange={value => setDonorReportForm({ ...donorReportForm, status: value })} />
                      <SubmitButton label={donorReportForm.id ? 'Update Report' : 'Add Report'} />
                    </div>
                  </form>
                </div>
                </div>
                )}

                {financeSection === 'payroll' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <form onSubmit={createPayroll} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-700" /> Payroll Approval</h4>
                    <div className="space-y-3">
                      <SelectInput label="Project" value={payrollForm.projectId} options={workspace.projects.map(project => ({ label: `${project.code} - ${project.name}`, value: project.id }))} onChange={value => setPayrollForm({ ...payrollForm, projectId: value })} />
                      <Input label="Period" value={payrollForm.period} onChange={value => setPayrollForm({ ...payrollForm, period: value })} placeholder="June 2026" required />
                      <Input label="Staff Count" type="number" value={payrollForm.staffCount} onChange={value => setPayrollForm({ ...payrollForm, staffCount: value })} />
                      <Input label="Gross Pay" type="number" value={payrollForm.grossPay} onChange={value => setPayrollForm({ ...payrollForm, grossPay: value })} />
                      <SelectInput label="Approvals" value={payrollForm.approvals} options={['Pending', 'Approved', 'Rejected']} onChange={value => setPayrollForm({ ...payrollForm, approvals: value })} />
                      <SelectInput label="Status" value={payrollForm.status} options={['Draft', 'Ready', 'Paid']} onChange={value => setPayrollForm({ ...payrollForm, status: value })} />
                      <Input label="Prepared By" value={payrollForm.preparedBy} onChange={value => setPayrollForm({ ...payrollForm, preparedBy: value })} />
                      <Input label="Reviewed By" value={payrollForm.reviewedBy} onChange={value => setPayrollForm({ ...payrollForm, reviewedBy: value })} />
                      <SubmitButton label={payrollForm.id ? 'Update Payroll' : 'Add Payroll'} />
                    </div>
                  </form>
                  <FinanceActionTable title="Payroll Runs" columns={['Period', 'Staff', 'Gross', 'Status', 'Actions']} rows={scopedPayrollRuns.map(payroll => [
                    payroll.period,
                    payroll.staffCount,
                    money(payroll.grossPay, currentOrganization.defaultCurrency),
                    `${payroll.approvals} / ${payroll.status}`,
                    <RowActions
                      onEdit={() => {
                        setPayrollForm({ ...blankPayroll, ...payroll });
                        setFinanceSection('payroll');
                      }}
                      onApprove={() => approvePayroll(payroll)}
                      onRemove={() => removeItem('payrollRuns', payroll.id, `Payroll ${payroll.period}`)}
                      approveDisabled={payroll.approvals === 'Approved'}
                    />
                  ])} />
                </div>
                )}

                {financeSection === 'income' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <FinanceActionTable title="Grants" columns={['Grant', 'Donor', 'Utilization', 'Compliance', 'Actions']} rows={scopedGrants.map(grant => [
                    grant.name,
                    grant.donor,
                    `${Math.round((Number(grant.spent || 0) / Math.max(Number(grant.budget || 1), 1)) * 100)}%`,
                    `${grant.compliance} / ${grant.approvalStatus || 'Pending'}`,
                    <RowActions
                      onEdit={() => {
                        setGrantForm({ ...blankGrant, ...grant });
                        setFinanceSection('income');
                      }}
                      onApprove={() => approveBudget(grant)}
                      onRemove={() => removeItem('grants', grant.id, `Grant ${grant.name}`)}
                      approveDisabled={grant.approvalStatus === 'Approved'}
                      approveLabel="Approve Budget"
                    />
                  ])} />
                  <FinanceActionTable title="Budget Approval Queue" columns={['Project', 'Budget', 'Spent', 'Approval', 'Actions']} rows={scopedGrants.map(grant => [
                    workspace.projects.find(project => project.id === grant.projectId)?.code || 'Unassigned',
                    money(grant.budget, currentOrganization.defaultCurrency),
                    money(grant.spent, currentOrganization.defaultCurrency),
                    grant.approvalStatus || 'Pending',
                    <RowActions
                      onEdit={() => {
                        setGrantForm({ ...blankGrant, ...grant });
                        setFinanceSection('income');
                      }}
                      onApprove={() => approveBudget(grant)}
                      onRemove={() => removeItem('grants', grant.id, `Grant ${grant.name}`)}
                      approveDisabled={grant.approvalStatus === 'Approved'}
                      approveLabel="Approve Budget"
                    />
                  ])} />
                  <FinanceActionTable title="Donor Reports" columns={['Report', 'Donor', 'Net', 'Status', 'Actions']} rows={scopedDonorReports.map(report => [
                    report.title,
                    report.donor,
                    money(Number(report.income || 0) - Number(report.expenses || 0), currentOrganization.defaultCurrency),
                    report.status,
                    <RowActions
                      onEdit={() => {
                        setDonorReportForm({ ...blankDonorReport, ...report });
                        setFinanceSection('income');
                      }}
                      onApprove={() => publishDonorReport(report)}
                      onRemove={() => removeItem('donorReports', report.id, `Donor report ${report.title}`)}
                      approveDisabled={report.status === 'Published'}
                      approveLabel="Publish"
                    />
                  ])} />
                </div>
                )}

                {financeSection === 'accounting' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <MiniTable title="Statement of Activities" columns={['Line', 'Amount']} rows={[
                    ['Donor income', money(summary.donorIncome, currentOrganization.defaultCurrency)],
                    ['Grant spending', money(summary.grantSpent, currentOrganization.defaultCurrency)],
                    ['Payroll expense', money(summary.payrollTotal, currentOrganization.defaultCurrency)],
                    ['Payment vouchers', money(summary.paymentTotal, currentOrganization.defaultCurrency)],
                    ['Net surplus / deficit', money(summary.donorIncome - summary.grantSpent - summary.payrollTotal - summary.paymentTotal, currentOrganization.defaultCurrency)]
                  ]} />
                  <MiniTable title="Audit Controls" columns={['Control', 'Status']} rows={[
                    ['Double-entry journal', summary.postedDebits === summary.postedCredits ? 'Balanced' : 'Review required'],
                    ['Bank reconciliation', scopedBankAccounts.length ? 'Available' : 'Missing'],
                    ['Restricted funds', scopedChartOfAccounts.some(account => account.restricted) ? 'Tracked' : 'Missing'],
                    ['Payment approvals', scopedPayments.length && scopedPayments.every(payment => payment.approvalStatus === 'Approved') ? 'Approved' : 'Pending approvals'],
                    ['Donor reporting', scopedDonorReports.some(report => report.status === 'Published') ? 'Published' : 'Draft only']
                  ]} />
                </div>
                )}
                  </div>
                </div>
              </Panel>
            )}

            {activeTab === 'audit' && (
              <Panel title="Audit & Compliance Workspace" subtitle="Chart of accounts, journal entries, trial balance, and audit controls for financial transparency.">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <Metric icon={FileText} label="Chart of Accounts" value={`${scopedChartOfAccounts.length} accounts`} />
                  <Metric icon={BarChart3} label="Trial Balance" value={summary.postedDebits === summary.postedCredits ? 'Balanced' : 'Review'} />
                  <Metric icon={CreditCard} label="Payment Vouchers" value={scopedPayments.length} />
                  <Metric icon={Landmark} label="Journal Entries" value={scopedJournalEntries.length} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartAccountManager
                    accounts={scopedChartOfAccounts}
                    onEdit={editChartAccount}
                    onRemove={removeChartAccount}
                  />
                  <MiniTable title="Journal Entries" columns={['Reference', 'Debit', 'Credit', 'Amount']} rows={scopedJournalEntries.map(entry => [
                    entry.reference,
                    entry.debitAccount,
                    entry.creditAccount,
                    `${money(entry.amount, currentOrganization.defaultCurrency)}${entry.posted ? ' posted' : ' draft'}`
                  ])} />
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MiniTable title="Statement of Activities" columns={['Line', 'Amount']} rows={[
                    ['Donor income', money(summary.donorIncome, currentOrganization.defaultCurrency)],
                    ['Grant spending', money(summary.grantSpent, currentOrganization.defaultCurrency)],
                    ['Payroll expense', money(summary.payrollTotal, currentOrganization.defaultCurrency)],
                    ['Payment vouchers', money(summary.paymentTotal, currentOrganization.defaultCurrency)],
                    ['Net surplus / deficit', money(summary.donorIncome - summary.grantSpent - summary.payrollTotal - summary.paymentTotal, currentOrganization.defaultCurrency)]
                  ]} />
                  <MiniTable title="Audit Controls" columns={['Control', 'Status']} rows={[
                    ['Double-entry journal', summary.postedDebits === summary.postedCredits ? 'Balanced' : 'Review required'],
                    ['Bank reconciliation', scopedBankAccounts.length ? 'Available' : 'Not configured'],
                    ['Restricted funds', scopedChartOfAccounts.filter(a => a.restricted).length ? 'Tracked' : 'Not tracked'],
                    ['Payment approvals', scopedPayments.length && scopedPayments.every(payment => payment.approvalStatus === 'Approved') ? 'Approved' : 'Pending approvals'],
                    ['Donor reporting', scopedDonorReports.some(report => report.status === 'Published') ? 'Published' : 'Draft only']
                  ]} />
                </div>
              </Panel>
            )}

            {activeTab === 'owners' && (
              <Panel title="Beneficial Ownership & Governance" subtitle="Maintain KYC, politically exposed person checks, and governance control records for transparency reviews.">
                <form onSubmit={createBeneficialOwner} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 rounded-lg border border-gray-200 p-4">
                  <Input label="Full Name" value={beneficialOwnerForm.fullName} onChange={value => setBeneficialOwnerForm({ ...beneficialOwnerForm, fullName: value })} required />
                  <Input label="Role / Relationship" value={beneficialOwnerForm.role} onChange={value => setBeneficialOwnerForm({ ...beneficialOwnerForm, role: value })} required />
                  <SelectInput label="Control Type" value={beneficialOwnerForm.ownershipType} options={['Governance Control', 'Founder', 'Trustee', 'Signatory', 'Senior Management', 'Other Significant Influence']} onChange={value => setBeneficialOwnerForm({ ...beneficialOwnerForm, ownershipType: value })} />
                  <Input label="Control %" type="number" value={beneficialOwnerForm.controlPercent} onChange={value => setBeneficialOwnerForm({ ...beneficialOwnerForm, controlPercent: value })} />
                  <Input label="Nationality" value={beneficialOwnerForm.nationality} onChange={value => setBeneficialOwnerForm({ ...beneficialOwnerForm, nationality: value })} />
                  <Input label="ID / Passport No." value={beneficialOwnerForm.idNumber} onChange={value => setBeneficialOwnerForm({ ...beneficialOwnerForm, idNumber: value })} />
                  <SelectInput label="PEP Status" value={beneficialOwnerForm.pepStatus} options={['No', 'Yes', 'Screening Required']} onChange={value => setBeneficialOwnerForm({ ...beneficialOwnerForm, pepStatus: value })} />
                  <SelectInput label="KYC Status" value={beneficialOwnerForm.kycStatus} options={['Pending', 'Verified', 'Rejected', 'Expired']} onChange={value => setBeneficialOwnerForm({ ...beneficialOwnerForm, kycStatus: value })} />
                  <Input label="Appointment Date" type="date" value={beneficialOwnerForm.appointmentDate} onChange={value => setBeneficialOwnerForm({ ...beneficialOwnerForm, appointmentDate: value })} />
                  <Input label="Notes" value={beneficialOwnerForm.notes} onChange={value => setBeneficialOwnerForm({ ...beneficialOwnerForm, notes: value })} />
                  <SubmitButton label="Add Owner" />
                </form>
                <MiniTable title="Beneficial Owner Register" columns={['Name', 'Role', 'Control', 'KYC', 'PEP']} rows={workspace.beneficialOwners.map(owner => [
                  owner.fullName,
                  owner.role,
                  `${owner.ownershipType}${Number(owner.controlPercent || 0) ? ` / ${owner.controlPercent}%` : ''}`,
                  owner.kycStatus,
                  owner.pepStatus
                ])} />
              </Panel>
            )}

            {activeTab === 'projects' && (
              <Panel title="Projects, Programs & Tenders" subtitle="Plan projects, track donor budgets, and run transparent procurement tenders with evaluation methods and committees.">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <Metric icon={BriefcaseBusiness} label="Project Budget" value={money(summary.projectBudget, currentOrganization.defaultCurrency)} />
                  <Metric icon={CreditCard} label="Project Spent" value={money(summary.projectSpent, currentOrganization.defaultCurrency)} />
                  <Metric icon={PackageCheck} label="Tender Value" value={money(summary.tenderValue, currentOrganization.defaultCurrency)} />
                  <Metric icon={Users} label="Reached" value={workspace.projects.reduce((sum, project) => sum + Number(project.beneficiariesReached || 0), 0).toLocaleString()} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-6">
                  <aside className="rounded-lg border border-gray-200 bg-white p-2 h-fit xl:sticky xl:top-24">
                    {projectSections.map(section => {
                      const Icon = section.icon;
                      const selected = projectSection === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => setProjectSection(section.id)}
                          className={`w-full inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                            selected ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {section.label}
                        </button>
                      );
                    })}
                  </aside>

                  <div className="space-y-6">
                    {projectSection === 'projects' && (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <form onSubmit={createProject} className="rounded-lg border border-gray-200 p-4">
                          <h4 className="font-bold mb-1">Create / Update Project</h4>
                          <p className="mb-4 text-sm text-gray-600">Define the program model, budget, outcomes, manager, timeline, and beneficiary targets before approval.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input label="Project Code" value={projectForm.code} onChange={value => setProjectForm({ ...projectForm, code: value })} required />
                            <Input label="Project Name" value={projectForm.name} onChange={value => setProjectForm({ ...projectForm, name: value })} required />
                            <Input label="Program Area" value={projectForm.programArea} onChange={value => setProjectForm({ ...projectForm, programArea: value })} />
                            <Input label="Donor" value={projectForm.donor} onChange={value => setProjectForm({ ...projectForm, donor: value })} />
                            <Input label="Manager" value={projectForm.manager} onChange={value => setProjectForm({ ...projectForm, manager: value })} />
                            <Input label="Start Date" type="date" value={projectForm.startDate} onChange={value => setProjectForm({ ...projectForm, startDate: value })} />
                            <Input label="End Date" type="date" value={projectForm.endDate} onChange={value => setProjectForm({ ...projectForm, endDate: value })} />
                            <Input label="Budget" type="number" value={projectForm.budget} onChange={value => setProjectForm({ ...projectForm, budget: value })} />
                            <Input label="Spent" type="number" value={projectForm.spent} onChange={value => setProjectForm({ ...projectForm, spent: value })} />
                            <Input label="Target Beneficiaries" type="number" value={projectForm.beneficiariesTarget} onChange={value => setProjectForm({ ...projectForm, beneficiariesTarget: value })} />
                            <Input label="Reached Beneficiaries" type="number" value={projectForm.beneficiariesReached} onChange={value => setProjectForm({ ...projectForm, beneficiariesReached: value })} />
                            <SelectInput label="Status" value={projectForm.status} options={['Planning', 'Active', 'On Hold', 'Closed']} onChange={value => setProjectForm({ ...projectForm, status: value })} />
                            <Input label="Expected Outcome" value={projectForm.outcome} onChange={value => setProjectForm({ ...projectForm, outcome: value })} />
                            <SubmitButton label={projectForm.id ? 'Update Project' : 'Create Project'} />
                          </div>
                        </form>
                        <FinanceActionTable title="Project Portfolio" columns={['Code', 'Project', 'Budget', 'Progress', 'Actions']} rows={workspace.projects.map(project => [
                          project.code,
                          project.name,
                          money(project.budget, currentOrganization.defaultCurrency),
                          `${Number(project.beneficiariesReached || 0).toLocaleString()} / ${Number(project.beneficiariesTarget || 0).toLocaleString()}`,
                          <RowActions
                            onEdit={() => {
                              setProjectForm({ ...blankProject, ...project });
                              setProjectSection('projects');
                            }}
                            onRemove={() => removeItem('projects', project.id, `Project ${project.code}`)}
                          />
                        ])} />
                      </div>
                    )}

                    {projectSection === 'projectApprovals' && (
                      <div className="space-y-6">
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                          <h4 className="font-bold text-emerald-900">Project approval workflow is separated</h4>
                          <p className="mt-1 text-sm text-emerald-800">Create or update projects first, then approve projects here after budget, donor, outcome, and manager review.</p>
                        </div>
                        <FinanceActionTable title="Approve Projects" columns={['Code', 'Project', 'Budget', 'Status', 'Actions']} rows={workspace.projects.map(project => [
                          project.code,
                          project.name,
                          money(project.budget, currentOrganization.defaultCurrency),
                          project.status,
                          <RowActions
                            onEdit={() => {
                              setProjectForm({ ...blankProject, ...project });
                              setProjectSection('projects');
                            }}
                            onApprove={() => approveProject(project)}
                            onRemove={() => removeItem('projects', project.id, `Project ${project.code}`)}
                            approveDisabled={project.status === 'Active'}
                            approveLabel="Approve Project"
                          />
                        ])} />
                      </div>
                    )}

                    {projectSection === 'tenders' && (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <form onSubmit={createTender} className="rounded-lg border border-gray-200 p-4">
                          <h4 className="font-bold mb-1">Create / Update Tender</h4>
                          <p className="mb-4 text-sm text-gray-600">Prepare procurement with method, value, dates, evaluation basis, committee, and project linkage.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input label="Tender No." value={tenderForm.tenderNo} onChange={value => setTenderForm({ ...tenderForm, tenderNo: value })} required />
                            <Input label="Tender Title" value={tenderForm.title} onChange={value => setTenderForm({ ...tenderForm, title: value })} required />
                            <SelectInput label="Project" value={tenderForm.projectId} options={workspace.projects.map(project => ({ label: `${project.code} - ${project.name}`, value: project.id }))} onChange={value => setTenderForm({ ...tenderForm, projectId: value })} />
                            <SelectInput label="Procurement Method" value={tenderForm.procurementMethod} options={['Open Tender', 'Restricted Tender', 'Request for Quotations', 'Direct Procurement', 'Framework Agreement']} onChange={value => setTenderForm({ ...tenderForm, procurementMethod: value })} />
                            <Input label="Publish Date" type="date" value={tenderForm.publishDate} onChange={value => setTenderForm({ ...tenderForm, publishDate: value })} />
                            <Input label="Closing Date" type="date" value={tenderForm.closingDate} onChange={value => setTenderForm({ ...tenderForm, closingDate: value })} />
                            <Input label="Estimated Value" type="number" value={tenderForm.estimatedValue} onChange={value => setTenderForm({ ...tenderForm, estimatedValue: value })} />
                            <SelectInput label="Currency" value={tenderForm.currency} options={workspace.currencies} onChange={value => setTenderForm({ ...tenderForm, currency: value })} />
                            <SelectInput label="Evaluation Method" value={tenderForm.evaluationMethod} options={['Lowest Responsive Bid', 'Quality and Cost Based', 'Technical Compliance', 'Best Value']} onChange={value => setTenderForm({ ...tenderForm, evaluationMethod: value })} />
                            <Input label="Committee" value={tenderForm.committee} onChange={value => setTenderForm({ ...tenderForm, committee: value })} />
                            <SelectInput label="Status" value={tenderForm.status} options={['Draft', 'Open', 'Evaluation', 'Awarded', 'Cancelled']} onChange={value => setTenderForm({ ...tenderForm, status: value })} />
                            <SubmitButton label={tenderForm.id ? 'Update Tender' : 'Create Tender'} />
                          </div>
                        </form>
                        <FinanceActionTable title="Tender Register" columns={['Tender', 'Method', 'Value', 'Status', 'Actions']} rows={workspace.tenders.map(tender => [
                          tender.tenderNo,
                          tender.procurementMethod,
                          money(tender.estimatedValue, tender.currency),
                          tender.status,
                          <RowActions
                            onEdit={() => {
                              setTenderForm({ ...blankTender, ...tender });
                              setProjectSection('tenders');
                            }}
                            onRemove={() => removeItem('tenders', tender.id, `Tender ${tender.tenderNo}`)}
                          />
                        ])} />
                      </div>
                    )}

                    {projectSection === 'tenderApprovals' && (
                      <div className="space-y-6">
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                          <h4 className="font-bold text-emerald-900">Tender approval and award are separated</h4>
                          <p className="mt-1 text-sm text-emerald-800">Approve tenders for evaluation first, then award only after procurement committee review.</p>
                        </div>
                        <FinanceActionTable title="Approve / Award Tenders" columns={['Tender', 'Project', 'Value', 'Status', 'Actions']} rows={workspace.tenders.map(tender => [
                          tender.tenderNo,
                          workspace.projects.find(project => project.id === tender.projectId)?.code || 'Unassigned',
                          money(tender.estimatedValue, tender.currency),
                          tender.status,
                          <RowActions
                            onEdit={() => {
                              setTenderForm({ ...blankTender, ...tender });
                              setProjectSection('tenders');
                            }}
                            onApprove={() => approveTender(tender)}
                            onSecondaryApprove={() => awardTender(tender)}
                            onRemove={() => removeItem('tenders', tender.id, `Tender ${tender.tenderNo}`)}
                            approveDisabled={tender.status === 'Evaluation' || tender.status === 'Awarded'}
                            secondaryApproveDisabled={tender.status === 'Awarded'}
                            approveLabel="Approve"
                            secondaryApproveLabel="Award"
                          />
                        ])} />
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            )}

            {activeTab === 'contracts' && (
              <Panel title="Professional Contracts & Storage" subtitle="Register contracts, link them to projects and repositories, and manage retention, access, and risk.">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <Metric icon={FileText} label="Contracts" value={workspace.contracts.length} />
                  <Metric icon={DollarSign} label="Contract Value" value={money(summary.contractValue, currentOrganization.defaultCurrency)} />
                  <Metric icon={PackageCheck} label="Repositories" value={workspace.storages.length} />
                  <Metric icon={ShieldCheck} label="Restricted Stores" value={workspace.storages.filter(storage => storage.accessLevel === 'Restricted').length} />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
                  <aside className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="space-y-2">
                      {contractSections.map(section => {
                        const Icon = section.icon;
                        const active = contractSection === section.id;
                        return (
                          <button key={section.id} type="button" onClick={() => setContractSection(section.id)} className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold ${active ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <Icon className="w-4 h-4" />
                            {section.label}
                          </button>
                        );
                      })}
                    </div>
                  </aside>

                  <div className="space-y-6">
                    {contractSection === 'contracts' && (
                      <>
                        <form onSubmit={createContract} className="rounded-lg border border-gray-200 p-4">
                          <h4 className="font-bold mb-3">Create / Update Contract</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input label="Contract No." value={contractForm.contractNo} onChange={value => setContractForm({ ...contractForm, contractNo: value })} required />
                            <Input label="Title" value={contractForm.title} onChange={value => setContractForm({ ...contractForm, title: value })} required />
                            <Input label="Counterparty" value={contractForm.counterparty} onChange={value => setContractForm({ ...contractForm, counterparty: value })} />
                            <SelectInput label="Contract Type" value={contractForm.contractType} options={['Service Agreement', 'Donor Agreement', 'Employment Contract', 'Lease', 'Grant Agreement', 'MOU', 'Supplier Contract']} onChange={value => setContractForm({ ...contractForm, contractType: value })} />
                            <SelectInput label="Project" value={contractForm.projectId} options={workspace.projects.map(project => ({ label: `${project.code} - ${project.name}`, value: project.id }))} onChange={value => setContractForm({ ...contractForm, projectId: value })} />
                            <Input label="Start Date" type="date" value={contractForm.startDate} onChange={value => setContractForm({ ...contractForm, startDate: value })} />
                            <Input label="End Date" type="date" value={contractForm.endDate} onChange={value => setContractForm({ ...contractForm, endDate: value })} />
                            <Input label="Value" type="number" value={contractForm.value} onChange={value => setContractForm({ ...contractForm, value })} />
                            <SelectInput label="Currency" value={contractForm.currency} options={workspace.currencies} onChange={value => setContractForm({ ...contractForm, currency: value })} />
                            <SelectInput label="Storage" value={contractForm.storageId} options={workspace.storages.map(storage => ({ label: storage.name, value: storage.id }))} onChange={value => setContractForm({ ...contractForm, storageId: value })} />
                            <SelectInput label="Risk" value={contractForm.riskRating} options={['Low', 'Medium', 'High']} onChange={value => setContractForm({ ...contractForm, riskRating: value })} />
                            <SelectInput label="Status" value={contractForm.status} options={['Draft', 'Active', 'Expired', 'Terminated', 'Renewal Due']} onChange={value => setContractForm({ ...contractForm, status: value })} />
                            <Input label="Owner" value={contractForm.owner} onChange={value => setContractForm({ ...contractForm, owner: value })} />
                            <SubmitButton label={contractForm.id ? 'Update Contract' : 'Create Contract'} />
                          </div>
                        </form>
                        <FinanceActionTable title="Contract Register" columns={['No.', 'Title', 'Value', 'Status', 'Actions']} rows={workspace.contracts.map(contract => [
                          contract.contractNo,
                          contract.title,
                          money(contract.value, contract.currency),
                          `${contract.status} / ${contract.riskRating}`,
                          <RowActions
                            onEdit={() => { setContractForm(contract); setContractSection('contracts'); }}
                            onApprove={() => approveContract(contract)}
                            approveDisabled={contract.status === 'Active'}
                            onRemove={() => removeItem('contracts', contract.id, `Contract ${contract.contractNo}`)}
                          />
                        ])} />
                      </>
                    )}

                    {contractSection === 'contractApprovals' && (
                      <FinanceActionTable title="Contract Approval Queue" columns={['No.', 'Counterparty', 'Project', 'Risk', 'Actions']} rows={workspace.contracts.map(contract => [
                        contract.contractNo,
                        contract.counterparty,
                        projectById[contract.projectId]?.name || 'Unassigned',
                        `${contract.status} / ${contract.riskRating}`,
                        <RowActions
                          onEdit={() => { setContractForm(contract); setContractSection('contracts'); }}
                          onApprove={() => approveContract(contract)}
                          approveDisabled={contract.status === 'Active'}
                          approveLabel="Approve Contract"
                          onRemove={() => removeItem('contracts', contract.id, `Contract ${contract.contractNo}`)}
                        />
                      ])} />
                    )}

                    {contractSection === 'storages' && (
                      <>
                        <form onSubmit={createStorage} className="rounded-lg border border-gray-200 p-4">
                          <h4 className="font-bold mb-3">Create / Update Storage Repository</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input label="Repository Name" value={storageForm.name} onChange={value => setStorageForm({ ...storageForm, name: value })} required />
                            <Input label="Location" value={storageForm.location} onChange={value => setStorageForm({ ...storageForm, location: value })} />
                            <SelectInput label="Storage Type" value={storageForm.storageType} options={['Digital Repository', 'Physical Archive', 'Physical + Digital', 'Cloud DMS']} onChange={value => setStorageForm({ ...storageForm, storageType: value })} />
                            <Input label="Custodian" value={storageForm.custodian} onChange={value => setStorageForm({ ...storageForm, custodian: value })} required />
                            <Input label="Retention Policy" value={storageForm.retentionPolicy} onChange={value => setStorageForm({ ...storageForm, retentionPolicy: value })} />
                            <SelectInput label="Access Level" value={storageForm.accessLevel} options={['Public', 'Internal', 'Restricted', 'Confidential']} onChange={value => setStorageForm({ ...storageForm, accessLevel: value })} />
                            <SelectInput label="Status" value={storageForm.status} options={['Active', 'Closed', 'Archived']} onChange={value => setStorageForm({ ...storageForm, status: value })} />
                            <SubmitButton label={storageForm.id ? 'Update Storage' : 'Create Storage'} />
                          </div>
                        </form>
                        <FinanceActionTable title="Storage Register" columns={['Repository', 'Custodian', 'Retention', 'Access', 'Actions']} rows={workspace.storages.map(storage => [
                          storage.name,
                          storage.custodian,
                          storage.retentionPolicy,
                          `${storage.accessLevel} / ${storage.status}`,
                          <RowActions
                            onEdit={() => { setStorageForm(storage); setContractSection('storages'); }}
                            onApprove={() => archiveStorage(storage)}
                            approveDisabled={storage.status === 'Archived'}
                            approveLabel="Archive"
                            onRemove={() => removeItem('storages', storage.id, `Storage ${storage.name}`)}
                          />
                        ])} />
                      </>
                    )}

                    {contractSection === 'storageControls' && (
                      <FinanceActionTable title="Storage Controls" columns={['Repository', 'Location', 'Access', 'Status', 'Actions']} rows={workspace.storages.map(storage => [
                        storage.name,
                        storage.location,
                        storage.accessLevel,
                        storage.status,
                        <RowActions
                          onEdit={() => { setStorageForm(storage); setContractSection('storages'); }}
                          onApprove={() => archiveStorage(storage)}
                          approveDisabled={storage.status === 'Archived'}
                          approveLabel="Archive Storage"
                          onRemove={() => removeItem('storages', storage.id, `Storage ${storage.name}`)}
                        />
                      ])} />
                    )}
                  </div>
                </div>
              </Panel>
            )}

            {activeTab === 'impact' && (
              <Panel title="Impact, Monitoring & Evaluation" subtitle="Track indicators, results, verification, evaluation scores, and recommendations for donor-ready accountability.">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <Metric icon={BarChart3} label="Indicators" value={workspace.impacts.length} />
                  <Metric icon={Users} label="Target" value={summary.impactTarget.toLocaleString()} />
                  <Metric icon={CheckCircle2} label="Actual" value={summary.impactActual.toLocaleString()} />
                  <Metric icon={ClipboardCheck} label="Evaluations" value={workspace.evaluations.length} />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
                  <aside className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="space-y-2">
                      {impactSections.map(section => {
                        const Icon = section.icon;
                        const active = impactSection === section.id;
                        return (
                          <button key={section.id} type="button" onClick={() => setImpactSection(section.id)} className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold ${active ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <Icon className="w-4 h-4" />
                            {section.label}
                          </button>
                        );
                      })}
                    </div>
                  </aside>

                  <div className="space-y-6">
                    {impactSection === 'indicators' && (
                      <>
                        <form onSubmit={createImpact} className="rounded-lg border border-gray-200 p-4">
                          <h4 className="font-bold mb-3">Create / Update Impact Indicator</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <SelectInput label="Project" value={impactForm.projectId} options={workspace.projects.map(project => ({ label: `${project.code} - ${project.name}`, value: project.id }))} onChange={value => setImpactForm({ ...impactForm, projectId: value })} required />
                            <Input label="Indicator" value={impactForm.indicator} onChange={value => setImpactForm({ ...impactForm, indicator: value })} required />
                            <Input label="Baseline" type="number" value={impactForm.baseline} onChange={value => setImpactForm({ ...impactForm, baseline: value })} />
                            <Input label="Target" type="number" value={impactForm.target} onChange={value => setImpactForm({ ...impactForm, target: value })} />
                            <Input label="Actual" type="number" value={impactForm.actual} onChange={value => setImpactForm({ ...impactForm, actual: value })} />
                            <Input label="Unit" value={impactForm.unit} onChange={value => setImpactForm({ ...impactForm, unit: value })} />
                            <Input label="Reporting Period" value={impactForm.reportingPeriod} onChange={value => setImpactForm({ ...impactForm, reportingPeriod: value })} />
                            <Input label="Data Source" value={impactForm.dataSource} onChange={value => setImpactForm({ ...impactForm, dataSource: value })} />
                            <SelectInput label="Verification" value={impactForm.verificationStatus} options={['Pending', 'Verified', 'Rejected', 'Needs Evidence']} onChange={value => setImpactForm({ ...impactForm, verificationStatus: value })} />
                            <Input label="Narrative" value={impactForm.narrative} onChange={value => setImpactForm({ ...impactForm, narrative: value })} />
                            <SubmitButton label={impactForm.id ? 'Update Indicator' : 'Create Indicator'} />
                          </div>
                        </form>
                        <FinanceActionTable title="Impact Results" columns={['Indicator', 'Target', 'Actual', 'Actions']} rows={workspace.impacts.map(impact => [
                          impact.indicator,
                          `${Number(impact.target || 0).toLocaleString()} ${impact.unit || ''}`,
                          `${Number(impact.actual || 0).toLocaleString()} ${impact.unit || ''}`,
                          <RowActions
                            onEdit={() => { setImpactForm(impact); setImpactSection('indicators'); }}
                            onApprove={() => verifyImpact(impact)}
                            approveDisabled={impact.verificationStatus === 'Verified'}
                            approveLabel="Verify"
                            onRemove={() => removeItem('impacts', impact.id, `Impact indicator ${impact.indicator}`)}
                          />
                        ])} />
                      </>
                    )}

                    {impactSection === 'indicatorVerification' && (
                      <FinanceActionTable title="Indicator Verification Queue" columns={['Project', 'Indicator', 'Source', 'Verification', 'Actions']} rows={workspace.impacts.map(impact => [
                        projectById[impact.projectId]?.name || 'Unassigned',
                        impact.indicator,
                        impact.dataSource,
                        impact.verificationStatus,
                        <RowActions
                          onEdit={() => { setImpactForm(impact); setImpactSection('indicators'); }}
                          onApprove={() => verifyImpact(impact)}
                          approveDisabled={impact.verificationStatus === 'Verified'}
                          approveLabel="Verify Indicator"
                          onRemove={() => removeItem('impacts', impact.id, `Impact indicator ${impact.indicator}`)}
                        />
                      ])} />
                    )}

                    {impactSection === 'evaluations' && (
                      <>
                        <form onSubmit={createEvaluation} className="rounded-lg border border-gray-200 p-4">
                          <h4 className="font-bold mb-3">Create / Update Evaluation</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <SelectInput label="Project" value={evaluationForm.projectId} options={workspace.projects.map(project => ({ label: `${project.code} - ${project.name}`, value: project.id }))} onChange={value => setEvaluationForm({ ...evaluationForm, projectId: value })} required />
                            <Input label="Title" value={evaluationForm.title} onChange={value => setEvaluationForm({ ...evaluationForm, title: value })} required />
                            <SelectInput label="Type" value={evaluationForm.evaluationType} options={['Baseline', 'Midline', 'Endline', 'Final', 'Learning Review', 'Audit Review']} onChange={value => setEvaluationForm({ ...evaluationForm, evaluationType: value })} />
                            <Input label="Evaluator" value={evaluationForm.evaluator} onChange={value => setEvaluationForm({ ...evaluationForm, evaluator: value })} />
                            <Input label="Planned Date" type="date" value={evaluationForm.plannedDate} onChange={value => setEvaluationForm({ ...evaluationForm, plannedDate: value })} />
                            <Input label="Completed Date" type="date" value={evaluationForm.completedDate} onChange={value => setEvaluationForm({ ...evaluationForm, completedDate: value })} />
                            <Input label="Score" type="number" value={evaluationForm.score} onChange={value => setEvaluationForm({ ...evaluationForm, score: value })} />
                            <SelectInput label="Status" value={evaluationForm.status} options={['Planned', 'In Progress', 'Completed', 'Management Response']} onChange={value => setEvaluationForm({ ...evaluationForm, status: value })} />
                            <Input label="Recommendation" value={evaluationForm.recommendation} onChange={value => setEvaluationForm({ ...evaluationForm, recommendation: value })} />
                            <SubmitButton label={evaluationForm.id ? 'Update Evaluation' : 'Create Evaluation'} />
                          </div>
                        </form>
                        <FinanceActionTable title="Evaluation Register" columns={['Evaluation', 'Type', 'Score', 'Actions']} rows={workspace.evaluations.map(evaluation => [
                          evaluation.title,
                          evaluation.evaluationType,
                          `${evaluation.score || 0}% / ${evaluation.status}`,
                          <RowActions
                            onEdit={() => { setEvaluationForm(evaluation); setImpactSection('evaluations'); }}
                            onApprove={() => approveEvaluation(evaluation)}
                            approveDisabled={evaluation.status === 'Management Response'}
                            approveLabel="Review"
                            onRemove={() => removeItem('evaluations', evaluation.id, `Evaluation ${evaluation.title}`)}
                          />
                        ])} />
                      </>
                    )}

                    {impactSection === 'evaluationReviews' && (
                      <FinanceActionTable title="Evaluation Review Queue" columns={['Project', 'Evaluation', 'Evaluator', 'Status', 'Actions']} rows={workspace.evaluations.map(evaluation => [
                        projectById[evaluation.projectId]?.name || 'Unassigned',
                        evaluation.title,
                        evaluation.evaluator,
                        `${evaluation.status} / ${evaluation.score || 0}%`,
                        <RowActions
                          onEdit={() => { setEvaluationForm(evaluation); setImpactSection('evaluations'); }}
                          onApprove={() => approveEvaluation(evaluation)}
                          approveDisabled={evaluation.status === 'Management Response'}
                          approveLabel="Approve Review"
                          onRemove={() => removeItem('evaluations', evaluation.id, `Evaluation ${evaluation.title}`)}
                        />
                      ])} />
                    )}
                  </div>
                </div>
              </Panel>
            )}

            {activeTab === 'field' && (
              <Panel title="GIS & Field Operations" subtitle="Map villages, project sites, field officers, beneficiaries, and field visits by GPS location.">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <Metric icon={MapPinned} label="Mapped Locations" value={summary.mappedLocations} />
                  <Metric icon={Users} label="Beneficiaries Mapped" value={summary.beneficiariesMapped.toLocaleString()} />
                  <Metric icon={Route} label="Field Visits" value={workspace.fieldVisits.length} />
                  <Metric icon={RadioTower} label="Active Sites" value={workspace.fieldSites.filter(site => site.status === 'Active').length} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <form onSubmit={createFieldSite} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2"><MapPinned className="w-4 h-4 text-emerald-700" /> Project Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="Site / Village Name" value={fieldSiteForm.name} onChange={value => setFieldSiteForm({ ...fieldSiteForm, name: value })} required />
                      <SelectInput label="Branch" value={fieldSiteForm.branchId} options={scopedBranches.map(branch => ({ label: branch.name, value: branch.id }))} onChange={value => setFieldSiteForm({ ...fieldSiteForm, branchId: value })} required />
                      <Input label="Field Officer" value={fieldSiteForm.officer} onChange={value => setFieldSiteForm({ ...fieldSiteForm, officer: value })} />
                      <Input label="GPS" value={fieldSiteForm.gps} onChange={value => setFieldSiteForm({ ...fieldSiteForm, gps: value })} placeholder="11.0840, 39.7430" />
                      <Input label="Beneficiaries" type="number" value={fieldSiteForm.beneficiaries} onChange={value => setFieldSiteForm({ ...fieldSiteForm, beneficiaries: value })} />
                      <SelectInput label="Status" value={fieldSiteForm.status} options={statusOptions} onChange={value => setFieldSiteForm({ ...fieldSiteForm, status: value })} />
                      <SubmitButton label="Map Site" />
                    </div>
                  </form>

                  <form onSubmit={createFieldVisit} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2"><Route className="w-4 h-4 text-emerald-700" /> Field Visit</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <SelectInput label="Site" value={fieldVisitForm.siteId} options={workspace.fieldSites.map(site => ({ label: site.name, value: site.id }))} onChange={value => setFieldVisitForm({ ...fieldVisitForm, siteId: value })} required />
                      <Input label="Date" type="date" value={fieldVisitForm.date} onChange={value => setFieldVisitForm({ ...fieldVisitForm, date: value })} required />
                      <Input label="Officer" value={fieldVisitForm.officer} onChange={value => setFieldVisitForm({ ...fieldVisitForm, officer: value })} />
                      <Input label="Purpose" value={fieldVisitForm.purpose} onChange={value => setFieldVisitForm({ ...fieldVisitForm, purpose: value })} />
                      <SelectInput label="Outcome" value={fieldVisitForm.outcome} options={['Scheduled', 'Completed', 'Follow-up Required']} onChange={value => setFieldVisitForm({ ...fieldVisitForm, outcome: value })} />
                      <SubmitButton label="Record Visit" />
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                  <MiniTable title="GIS Project Locations" columns={['Site', 'Branch', 'GPS', 'Beneficiaries']} rows={workspace.fieldSites.map(site => [
                    site.name,
                    branchById[site.branchId]?.name || 'Unassigned',
                    site.gps || 'Not mapped',
                    Number(site.beneficiaries || 0).toLocaleString()
                  ])} />
                  <MiniTable title="Field Visit Log" columns={['Site', 'Date', 'Officer', 'Outcome']} rows={workspace.fieldVisits.map(visit => [
                    fieldSiteById[visit.siteId]?.name || 'Unknown site',
                    visit.date,
                    visit.officer,
                    visit.outcome
                  ])} />
                </div>
              </Panel>
            )}

            {activeTab === 'services' && (
              <Panel title="Multi-Service Control Center" subtitle="Control how NGO, church, HR, stock, procurement, communication, finance, and reporting services are owned and connected.">
                <ServiceControlCenter
                  workspace={workspace}
                  serviceForm={serviceForm}
                  setServiceForm={setServiceForm}
                  createServiceControl={createServiceControl}
                  removeItem={removeItem}
                />
              </Panel>
            )}

            {activeTab === 'users' && (
              <Panel title="Users & Access Settings" subtitle="Create users, connect staff to backend accounts, manage roles, MFA, activation, suspension, and permissions.">
                <NGOSettingsController workspace={workspace} updateWorkspace={updateWorkspace} currentOrganization={currentOrganization} />
              </Panel>
            )}

            {activeTab === 'settings' && (
              <Panel title="Professional Settings" subtitle="Configure all NGO features including languages, currencies, audit controls, and system preferences.">
                <NGOSettingsController workspace={workspace} updateWorkspace={updateWorkspace} currentOrganization={currentOrganization} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 mt-6">
                  <SettingsList
                    title="Languages"
                    icon={Globe2}
                    values={workspace.languages}
                    value={newLanguage}
                    onValueChange={setNewLanguage}
                    onAdd={() => {
                      if (!newLanguage.trim()) return;
                      updateWorkspace(current => ({ ...current, languages: [...new Set([...current.languages, newLanguage.trim()])] }), `Language added: ${newLanguage}`);
                      setNewLanguage('');
                    }}
                    onRemove={language => updateWorkspace(current => ({ ...current, languages: current.languages.filter(item => item !== language) }), `Language removed: ${language}`)}
                  />
                  <SettingsList
                    title="Currencies"
                    icon={DollarSign}
                    values={workspace.currencies}
                    value={newCurrency}
                    onValueChange={setNewCurrency}
                    onAdd={() => {
                      if (!newCurrency.trim()) return;
                      updateWorkspace(current => ({ ...current, currencies: [...new Set([...current.currencies, newCurrency.trim().toUpperCase()])] }), `Currency added: ${newCurrency.toUpperCase()}`);
                      setNewCurrency('');
                    }}
                    onRemove={currency => updateWorkspace(current => ({ ...current, currencies: current.currencies.filter(item => item !== currency) }), `Currency removed: ${currency}`)}
                  />
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 font-bold mb-3">
                      <Settings className="w-5 h-5 text-emerald-700" />
                      System Status
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Organizations:</span>
                        <span className="font-semibold">{workspace.organizations.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Branches:</span>
                        <span className="font-semibold">{scopedBranches.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Staff:</span>
                        <span className="font-semibold">{scopedStaff.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Roles:</span>
                        <span className="font-semibold">{workspace.roles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Audit Events:</span>
                        <span className="font-semibold">{workspace.auditEvents.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                      Organization Settings
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Organization:</span>
                        <span className="font-semibold">{currentOrganization.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Default Language:</span>
                        <span className="font-semibold">{currentOrganization.defaultLanguage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Default Currency:</span>
                        <span className="font-semibold">{currentOrganization.defaultCurrency}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Compliance Status:</span>
                        <span className="font-semibold text-emerald-700">{currentOrganization.governance?.complianceStatus || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Fiscal Year Start:</span>
                        <span className="font-semibold">{currentOrganization.governance?.fiscalYearStart || 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-emerald-700" />
                      Branch & Field Settings
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Branches:</span>
                        <span className="font-semibold">{scopedBranches.filter(b => b.status === 'Active').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Mapped Locations:</span>
                        <span className="font-semibold">{summary.mappedLocations}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Field Sites:</span>
                        <span className="font-semibold">{workspace.fieldSites.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Field Visits:</span>
                        <span className="font-semibold">{workspace.fieldVisits.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Beneficiaries Tracked:</span>
                        <span className="font-semibold">{summary.beneficiariesMapped.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-700" />
                      Staff & Roles Settings
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Staff:</span>
                        <span className="font-semibold">{summary.activeStaff}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Departments:</span>
                        <span className="font-semibold">{scopedDepartments.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">User Roles:</span>
                        <span className="font-semibold">{workspace.roles.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Permissions Defined:</span>
                        <span className="font-semibold">{[...new Set(workspace.roles.flatMap(r => r.permissions || []))].length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Staff Documents:</span>
                        <span className="font-semibold">{scopedStaff.reduce((sum, s) => sum + (s.documents || []).length, 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-emerald-700" />
                      Finance Settings
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Budget:</span>
                        <span className="font-semibold">{money(summary.totalBudget, currentOrganization.defaultCurrency)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Grants:</span>
                        <span className="font-semibold">{scopedGrants.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Bank Accounts:</span>
                        <span className="font-semibold">{scopedBankAccounts.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">GL Accounts:</span>
                        <span className="font-semibold">{scopedChartOfAccounts.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Payroll Runs:</span>
                        <span className="font-semibold">{scopedPayrollRuns.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      Reporting Settings
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Donor Reports:</span>
                        <span className="font-semibold">{scopedDonorReports.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Published Reports:</span>
                        <span className="font-semibold">{scopedDonorReports.filter(r => r.status === 'Published').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Service Controls:</span>
                        <span className="font-semibold">{workspace.serviceControls.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Enabled Services:</span>
                        <span className="font-semibold">{workspace.serviceControls.filter(s => s.status === 'Enabled').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Payment Vouchers:</span>
                        <span className="font-semibold">{scopedPayments.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      System Readiness
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Finance Ready:</span>
                        <span className={`font-semibold ${readiness.finance.includes('Audit') ? 'text-emerald-700' : 'text-amber-700'}`}>{readiness.finance}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Field Ready:</span>
                        <span className={`font-semibold ${readiness.field.includes('GIS') ? 'text-emerald-700' : 'text-amber-700'}`}>{readiness.field}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Service Ready:</span>
                        <span className={`font-semibold ${readiness.service.includes('Multi') ? 'text-emerald-700' : 'text-amber-700'}`}>{readiness.service}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Data Integrity:</span>
                        <span className="font-semibold text-emerald-700">Saved</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-semibold text-sm">{workspace.auditEvents[0] ? new Date(workspace.auditEvents[0].at).toLocaleTimeString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-700" />
                    Feature Capabilities
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Capability text="Multi-NGO Management" done={workspace.organizations.length > 1} />
                    <Capability text="Multi-Language Support" done={workspace.languages.length > 1} />
                    <Capability text="Multi-Currency Support" done={workspace.currencies.length > 1} />
                    <Capability text="Branch Hierarchy" done={scopedBranches.length > 0} />
                    <Capability text="Department Structure" done={scopedDepartments.length > 0} />
                    <Capability text="Staff Organization" done={scopedStaff.length > 0} />
                    <Capability text="Role-Based Access" done={workspace.roles.length > 0} />
                    <Capability text="GIS Field Mapping" done={summary.mappedLocations > 0} />
                    <Capability text="Finance Audit Trail" done={scopedChartOfAccounts.length > 0} />
                    <Capability text="Grant Management" done={scopedGrants.length > 0} />
                    <Capability text="Payroll Processing" done={scopedPayrollRuns.length > 0} />
                    <Capability text="Donor Reporting" done={scopedDonorReports.length > 0} />
                    <Capability text="Service Controls" done={workspace.serviceControls.length > 0} />
                    <Capability text="Document Management" done={(currentOrganization.documents || []).length > 0} />
                    <Capability text="Beneficiary Tracking" done={summary.beneficiariesMapped > 0} />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                    Audit Trail (Recent 12 Events)
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {workspace.auditEvents.length === 0 && (
                      <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                        No audit events recorded yet.
                      </div>
                    )}
                    {workspace.auditEvents.map(event => (
                      <div key={event.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">
                        <span className="text-gray-700">{event.message}</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{new Date(event.at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <Icon className="w-5 h-5 text-emerald-700 mb-3" />
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function ReadinessCard({ icon: Icon, title, status, detail, onClick }) {
  return (
    <button type="button" onClick={onClick} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm text-left hover:border-emerald-300 hover:shadow-md transition-all">
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      <p className="text-xl sm:text-2xl font-bold mt-2">{status}</p>
      <p className="text-sm text-gray-600 mt-2">{detail}</p>
    </button>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-bold">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

function SelectInput({ label, value, options, onChange, required = false }) {
  const normalized = options.map(option => typeof option === 'string' ? { label: option, value: option } : option);
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <select
        value={value}
        required={required}
        onChange={event => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      >
        <option value="">Select...</option>
        {normalized.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function EditableField({ label, value, onSave }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <div className="mt-1 flex gap-2">
        <input
          value={draft}
          onChange={event => setDraft(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <button type="button" onClick={() => onSave(draft)} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50">
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  const normalized = options.map(option => typeof option === 'string' ? { label: option, value: option } : option);
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      >
        {normalized.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Capability({ text, done }) {
  return (
    <div className={`rounded-lg border px-3 py-3 text-sm font-semibold ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
      <CheckCircle2 className="w-4 h-4 inline mr-2" />
      {text}
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="rounded-md bg-white border border-gray-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-800 break-words">{value}</p>
    </div>
  );
}

function AssignmentGroup({ title, items, selected, onToggle }) {
  return (
    <div className="mb-4">
      <h5 className="font-bold text-sm mb-2">{title}</h5>
      <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
        {items.length === 0 && <p className="p-3 text-sm text-gray-500">No records available.</p>}
        {items.map(item => (
          <label key={item.id} className="flex items-center gap-2 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => onToggle(item.id)}
            />
            {item.name}
          </label>
        ))}
      </div>
    </div>
  );
}

function SubmitButton({ label }) {
  return (
    <button className="self-end inline-flex justify-center items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
      <Plus className="w-4 h-4" />
      {label}
    </button>
  );
}

function FinanceChecklist({ workspace, summary }) {
  const checks = [
    {
      label: 'Finance department exists',
      done: workspace.departments.some(department => department.name.toLowerCase().includes('finance'))
    },
    {
      label: 'Budgets allocated',
      done: summary.totalBudget > 0
    },
    {
      label: 'Grant compliance tracked',
      done: workspace.grants.some(grant => grant.compliance === 'On Track')
    },
    {
      label: 'Payroll approved',
      done: workspace.payrollRuns.some(payroll => payroll.approvals === 'Approved')
    },
    {
      label: 'Donor report published',
      done: workspace.donorReports.some(report => report.status === 'Published')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
      {checks.map(check => (
        <Capability key={check.label} text={check.label} done={check.done} />
      ))}
    </div>
  );
}

function MiniTable({ title, columns, rows }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 font-bold">{title}</div>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}

function FinanceActionTable({ title, columns, rows }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <div className="bg-gray-50 px-4 py-3 font-bold">{title}</div>
      <div className="max-h-80 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="sticky top-0 z-10 bg-white shadow-sm">
            <tr>
              {columns.map(column => (
                <th key={column} className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 text-gray-700 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  No records for this organization.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowActions({
  onEdit,
  onApprove,
  onSecondaryApprove,
  onRemove,
  approveDisabled = false,
  secondaryApproveDisabled = false,
  approveLabel = 'Approve',
  secondaryApproveLabel = 'Award'
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {onEdit && (
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100">
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      )}
      {onApprove && (
        <button type="button" disabled={approveDisabled} onClick={onApprove} className="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {approveLabel}
        </button>
      )}
      {onSecondaryApprove && (
        <button type="button" disabled={secondaryApproveDisabled} onClick={onSecondaryApprove} className="inline-flex items-center gap-1 rounded-md border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {secondaryApproveLabel}
        </button>
      )}
      {onRemove && (
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      )}
    </div>
  );
}

function ChartAccountManager({ accounts, onEdit, onRemove }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <div className="bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-bold">Chart of Accounts</h4>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            {accounts.length} accounts
          </span>
        </div>
      </div>
      <div className="max-h-96 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="sticky top-0 z-10 bg-white shadow-sm">
            <tr>
              {['Code', 'Account', 'Type', 'Fund', ''].map(column => (
                <th key={column} className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.map(account => (
              <tr key={`${account.organizationId || 'org'}-${account.code}`} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-gray-900">{account.code}</td>
                <td className="min-w-56 px-3 py-2 text-gray-700">{account.name}</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-700">{account.type}</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                  {account.fund}{account.restricted ? ' / Restricted' : ''}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(account)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
                      title="Edit account"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(account)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                      title="Remove account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                  No accounts are active for this organization.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => <th key={column} className="px-4 py-3 text-left font-semibold text-gray-600">{column}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 text-gray-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeleteButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center justify-center rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function SettingsList({ title, icon: Icon, values, value, onValueChange, onAdd, onRemove }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 font-bold mb-3">
        <Icon className="w-5 h-5 text-emerald-700" />
        {title}
      </div>
      <div className="flex gap-2 mb-3">
        <input
          value={value}
          onChange={event => onValueChange(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder={`Add ${title.toLowerCase().slice(0, -1)}`}
        />
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map(item => (
          <span key={item} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
            {item}
            <button type="button" onClick={() => onRemove(item)} className="text-gray-500 hover:text-red-600">x</button>
          </span>
        ))}
      </div>
    </div>
  );
}




