import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  MapPinned,
  Plus,
  Search,
  ShieldAlert,
  Save,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import {
  useCreateNgoContractMutation,
  useDeleteNgoContractMutation,
  useGetNgoContractsQuery,
  useGetNgoMonitoringSummaryQuery,
  useGetNgoOrganizationsQuery,
  useGetNgoProjectsQuery,
  useUpdateNgoContractMutation,
  getNgoErrorMessage
} from '../../store/actions/ngo.js';
import { NGOFormField, NGOFormGrid, NGO_INPUT_CLASS } from '../../components/ngo/NGOModal.jsx';

const STATUS_OPTIONS = ['Planning', 'Ongoing', 'Active', 'Completed', 'On Hold', 'Closed'];
const FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
const INDICATOR_TYPES = ['Input', 'Output', 'Outcome', 'Impact'];
const UNIT_OPTIONS = ['Number', 'Percentage', 'Currency', 'Quantity'];
const SEVERITY_OPTIONS = ['Low', 'Medium', 'High'];
const REPORT_TYPES = ['Monthly report', 'Quarterly report', 'Annual report', 'Donor report', 'Impact report'];
const EXPORT_TYPES = ['PDF', 'Excel', 'Word'];

const MODULES = [
  { id: 'project', label: 'Project Information', icon: ClipboardList },
  { id: 'outcomes', label: 'Objectives & Outcomes', icon: Target },
  { id: 'indicators', label: 'Indicators Management', icon: BarChart3 },
  { id: 'activities', label: 'Activity Tracking', icon: Activity },
  { id: 'beneficiaries', label: 'Beneficiary Tracking', icon: Users },
  { id: 'data', label: 'Data Collection', icon: FileText },
  { id: 'visits', label: 'Field Visits', icon: CalendarDays },
  { id: 'risks', label: 'Risk & Issue Tracking', icon: ShieldAlert },
  { id: 'kpi', label: 'KPI Dashboard', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'gis', label: 'GIS / Map Tracking', icon: MapPinned },
  { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 }
];

const blankIndicator = {
  indicatorId: 'IND-001',
  name: '',
  type: 'Outcome',
  description: '',
  unit: 'Number',
  baseline: 0,
  target: 0,
  current: 0,
  frequency: 'Monthly'
};

const blankActivity = {
  name: '',
  description: '',
  assignedStaff: '',
  startDate: '',
  endDate: '',
  status: 'Pending',
  budgetUsed: 0,
  progress: 0
};

const blankBeneficiary = {
  beneficiaryId: 'BEN-001',
  name: '',
  category: '',
  location: '',
  servicesReceived: '',
  numberReached: 0,
  gender: '',
  ageGroup: ''
};

const blankRisk = {
  riskId: 'RSK-001',
  description: '',
  severity: 'Medium',
  mitigationPlan: '',
  responsiblePerson: '',
  status: 'Open'
};

const blankFieldVisit = {
  visitDate: '',
  fieldOfficer: '',
  location: '',
  purpose: '',
  findings: '',
  recommendations: '',
  photos: '',
  signatures: ''
};

const EMPTY_FORM = {
  organizationId: '',
  projectId: '',
  projectCode: '',
  projectName: '',
  program: '',
  projectManager: '',
  startDate: '',
  endDate: '',
  status: 'Planning',
  budget: 0,
  donor: '',
  targetArea: '',
  branchRegion: '',
  goal: '',
  objectives: '',
  expectedOutcomes: '',
  expectedOutputs: '',
  successCriteria: '',
  assumptions: '',
  risks: '',
  indicators: [{ ...blankIndicator }],
  activities: [{ ...blankActivity }],
  beneficiaries: [{ ...blankBeneficiary }],
  dataCollection: [
    'Survey Forms',
    'Questionnaires',
    'Field Reports',
    'Mobile Data Collection',
    'GPS Location',
    'Photos',
    'Supporting Documents'
  ],
  fieldVisits: [{ ...blankFieldVisit }],
  riskIssues: [{ ...blankRisk }],
  reports: REPORT_TYPES.map((type) => ({ type, status: 'Scheduled', exportFormats: EXPORT_TYPES })),
  gisLocations: [{
    region: '',
    district: '',
    sector: '',
    village: '',
    coordinates: '',
    activityMap: ''
  }],
  expense: 0,
  performance: 0,
  completion: 0,
  notes: ''
};

const EMPTY_MODULE_FORMS = {
  outcomes: {
    goal: '',
    objectives: '',
    expectedOutcomes: '',
    expectedOutputs: '',
    successCriteria: '',
    assumptions: '',
    risks: ''
  },
  indicators: { ...blankIndicator },
  activities: { ...blankActivity },
  beneficiaries: { ...blankBeneficiary },
  data: {
    dataCollection: ['Survey Forms'],
    notes: ''
  },
  visits: { ...blankFieldVisit },
  risks: { ...blankRisk },
  kpi: {
    expense: 0,
    performance: 0,
    completion: 0
  },
  reports: {
    type: 'Monthly report',
    status: 'Draft',
    period: '',
    preparedBy: '',
    exportFormats: ['PDF']
  },
  gis: {
    region: '',
    district: '',
    sector: '',
    village: '',
    coordinates: '',
    activityMap: ''
  }
};

function splitLines(value) {
  if (Array.isArray(value)) return value;
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function lines(value) {
  return Array.isArray(value) ? value.join('\n') : value || '';
}

function currency(value) {
  return (Number(value) || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });
}

function pct(value) {
  return `${Math.max(0, Math.min(100, Math.round(Number(value) || 0)))}%`;
}

function normalizeRecord(record) {
  if (!record) return EMPTY_FORM;
  return {
    ...EMPTY_FORM,
    ...record,
    objectives: lines(record.objectives),
    expectedOutcomes: lines(record.expectedOutcomes),
    expectedOutputs: lines(record.expectedOutputs),
    successCriteria: lines(record.successCriteria),
    assumptions: lines(record.assumptions),
    risks: lines(record.risks),
    indicators: record.indicators?.length ? record.indicators : [{ ...blankIndicator }],
    activities: record.activities?.length ? record.activities : [{ ...blankActivity }],
    beneficiaries: record.beneficiaries?.length ? record.beneficiaries : [{ ...blankBeneficiary }],
    fieldVisits: record.fieldVisits?.length ? record.fieldVisits : [{ ...blankFieldVisit }],
    riskIssues: record.riskIssues?.length ? record.riskIssues : [{ ...blankRisk }]
  };
}

function buildPayload(form) {
  return {
    ...form,
    budget: Number(form.budget) || 0,
    expense: Number(form.expense) || 0,
    performance: Number(form.performance) || 0,
    completion: Number(form.completion) || 0,
    objectives: splitLines(form.objectives),
    expectedOutcomes: splitLines(form.expectedOutcomes),
    expectedOutputs: splitLines(form.expectedOutputs),
    successCriteria: splitLines(form.successCriteria),
    assumptions: splitLines(form.assumptions),
    risks: splitLines(form.risks),
    indicators: form.indicators.map((item) => ({
      ...item,
      baseline: Number(item.baseline) || 0,
      target: Number(item.target) || 0,
      current: Number(item.current) || 0
    })),
    activities: form.activities.map((item) => ({
      ...item,
      budgetUsed: Number(item.budgetUsed) || 0,
      progress: Number(item.progress) || 0
    })),
    beneficiaries: form.beneficiaries.map((item) => ({
      ...item,
      numberReached: Number(item.numberReached) || 0
    }))
  };
}

function statusClass(status) {
  const value = String(status || '').toLowerCase();
  if (['completed', 'closed'].includes(value)) return 'bg-emerald-100 text-emerald-700';
  if (['ongoing', 'active'].includes(value)) return 'bg-blue-100 text-blue-700';
  if (value === 'on hold') return 'bg-amber-100 text-amber-800';
  return 'bg-slate-100 text-slate-700';
}

function sumBeneficiaries(record) {
  const beneficiaryRows = Array.isArray(record.beneficiaries) ? record.beneficiaries : [];
  const reached = beneficiaryRows.reduce((sum, item) => sum + (Number(item.numberReached) || 0), 0);
  return reached || Number(record.beneficiaryTotal) || 0;
}

function recordExpense(record) {
  const activityRows = Array.isArray(record.activities) ? record.activities : [];
  const activitySpend = activityRows.reduce((sum, item) => sum + (Number(item.budgetUsed) || 0), 0);
  return Number(record.expense) || activitySpend || 0;
}

function calculateTotals(records) {
  const totals = records.reduce((acc, record) => {
    const activities = Array.isArray(record.activities) ? record.activities : [];
    const indicators = Array.isArray(record.indicators) ? record.indicators : [];
    const completedActivities = activities.filter((activity) =>
      String(activity.status || '').toLowerCase() === 'completed'
    ).length;
    const target = indicators.reduce((sum, item) => sum + (Number(item.target) || 0), 0);
    const current = indicators.reduce((sum, item) => sum + (Number(item.current) || 0), 0);

    acc.projects += 1;
    acc.budget += Number(record.budget) || 0;
    acc.expense += recordExpense(record);
    acc.activities += activities.length;
    acc.activitiesCompleted += completedActivities;
    acc.beneficiariesReached += sumBeneficiaries(record);
    acc.performance += Number(record.performance) || 0;
    acc.completion += Number(record.completion) || 0;
    acc.target += target;
    acc.actual += current;
    return acc;
  }, {
    projects: 0,
    budget: 0,
    expense: 0,
    activities: 0,
    activitiesCompleted: 0,
    beneficiariesReached: 0,
    performance: 0,
    completion: 0,
    target: 0,
    actual: 0
  });

  const averageDenominator = totals.projects || 1;
  return {
    ...totals,
    budgetUtilization: totals.budget ? Math.round((totals.expense / totals.budget) * 100) : 0,
    activityCompletion: totals.activities ? Math.round((totals.activitiesCompleted / totals.activities) * 100) : 0,
    performance: totals.performance ? Math.round(totals.performance / averageDenominator) : totals.target ? Math.round((totals.actual / totals.target) * 100) : 0,
    projectCompletion: Math.round(totals.completion / averageDenominator),
    targetVsActual: totals.target ? Math.round((totals.actual / totals.target) * 100) : 0
  };
}

function MiniBar({ label, value, tone = 'emerald' }) {
  const toneClass = tone === 'blue' ? 'bg-blue-600' : tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-600';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-semibold">{pct(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${toneClass}`} style={{ width: pct(value) }} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, caption }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{caption}</p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Icon size={20} className="text-emerald-700" />
        </div>
      </div>
    </div>
  );
}

function ArrayEditor({ id, title, items, onChange, template, children }) {
  return (
    <div id={id} className="scroll-mt-6 md:col-span-2 border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <button
          type="button"
          onClick={() => onChange([...items, { ...template }])}
          className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800"
        >
          Add
        </button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
          <div className="flex justify-end">
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
          {children(item, index, (patch) => onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row))))}
        </div>
      ))}
    </div>
  );
}

function DrawerShell({ open, mode, title, saving, onClose, onSave, activeSection, setActiveSection, children }) {
  if (!open) return null;

  const isView = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-6xl bg-white shadow-2xl flex flex-col">
        <div className="shrink-0 border-b border-slate-200 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Monitoring & Evaluation</p>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100" title="Close">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
            <p className="text-xs font-semibold uppercase text-slate-500 mb-3">M&E form sections</p>
            <div className="space-y-1">
              {MODULES.map((module) => {
                const Icon = module.icon;
                const active = activeSection === module.id;
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(module.id);
                      document.getElementById(`me-section-${module.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                      active ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700 hover:bg-white hover:text-slate-950'
                    }`}
                  >
                    <Icon size={17} />
                    <span className="font-medium">{module.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto p-5 lg:p-6">
            {children}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
            {isView ? 'Close' : 'Cancel'}
          </button>
          {!isView && (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save M&E Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [activeModule, setActiveModule] = useState('analytics');
  const [activeFormSection, setActiveFormSection] = useState('project');
  const [selectedWorkspaceRecordId, setSelectedWorkspaceRecordId] = useState('');
  const [moduleForms, setModuleForms] = useState(EMPTY_MODULE_FORMS);

  const listParams = useMemo(() => {
    const params = {};
    if (filterOrg) params.organizationId = filterOrg;
    if (filterStatus) params.status = filterStatus;
    return params;
  }, [filterOrg, filterStatus]);

  const { data: organizations = [] } = useGetNgoOrganizationsQuery();
  const { data: projects = [] } = useGetNgoProjectsQuery(filterOrg ? { organizationId: filterOrg } : undefined);
  const { data: records = [], isLoading, error, refetch } = useGetNgoContractsQuery(listParams);
  const { data: summary } = useGetNgoMonitoringSummaryQuery(listParams);
  const [createRecord, { isLoading: creating }] = useCreateNgoContractMutation();
  const [updateRecord, { isLoading: updating }] = useUpdateNgoContractMutation();
  const [deleteRecord] = useDeleteNgoContractMutation();

  const projectById = useMemo(() => Object.fromEntries(projects.map((project) => [project.id, project])), [projects]);
  const orgById = useMemo(() => Object.fromEntries(organizations.map((org) => [org.id, org])), [organizations]);
  const saving = creating || updating;

  const localTotals = useMemo(() => calculateTotals(records), [records]);
  const totals = useMemo(() => {
    if (!summary) return localTotals;
    return {
      ...localTotals,
      budget: Number(summary.budget) || localTotals.budget,
      expense: Number(summary.expense) || localTotals.expense,
      activities: Number(summary.activities) || localTotals.activities,
      activitiesCompleted: Number(summary.activitiesCompleted) || localTotals.activitiesCompleted,
      beneficiariesReached: Number(summary.beneficiariesReached) || localTotals.beneficiariesReached,
      budgetUtilization: Number(summary.budgetUtilization) || localTotals.budgetUtilization,
      activityCompletion: Number(summary.activityCompletion) || localTotals.activityCompletion,
      performance: Number(summary.performance) || localTotals.performance,
      projectCompletion: Number(summary.projectCompletion) || localTotals.projectCompletion
    };
  }, [localTotals, summary]);

  const filteredRecords = records.filter((record) => {
    const term = searchTerm.toLowerCase();
    return [record.projectCode, record.projectName, record.program, record.projectManager, record.donor, record.targetArea]
      .some((value) => String(value || '').toLowerCase().includes(term));
  });

  const selectedWorkspaceRecord =
    records.find((record) => record.id === selectedWorkspaceRecordId) ||
    filteredRecords[0] ||
    records[0] ||
    null;

  const patchModuleForm = (module, patch) => {
    setModuleForms((current) => ({
      ...current,
      [module]: {
        ...current[module],
        ...patch
      }
    }));
  };

  const openAdd = () => {
    const firstProject = projects[0];
    setModalMode('add');
    setActiveFormSection('project');
    setSelectedRecord(null);
    setFormData({
      ...EMPTY_FORM,
      organizationId: filterOrg || organizations[0]?.id || '',
      projectId: firstProject?.id || '',
      projectCode: firstProject?.code || '',
      projectName: firstProject?.name || '',
      program: firstProject?.programArea || '',
      donor: firstProject?.donor || '',
      projectManager: firstProject?.manager || '',
      budget: firstProject?.budget || 0
    });
    setShowModal(true);
  };

  const openRecord = (record, mode) => {
    setModalMode(mode);
    setActiveFormSection('project');
    setSelectedRecord(record);
    setFormData(normalizeRecord(record));
    setShowModal(true);
  };

  const handleProjectChange = (projectId) => {
    const project = projectById[projectId];
    setFormData({
      ...formData,
      projectId,
      organizationId: project?.organizationId || formData.organizationId,
      projectCode: project?.code || formData.projectCode,
      projectName: project?.name || formData.projectName,
      program: project?.programArea || formData.program,
      donor: project?.donor || formData.donor,
      projectManager: project?.manager || formData.projectManager,
      startDate: project?.startDate || formData.startDate,
      endDate: project?.endDate || formData.endDate,
      budget: project?.budget ?? formData.budget
    });
  };

  const handleSave = async () => {
    if (!formData.organizationId || !formData.projectName.trim()) {
      alert('Organization and Project Name are required.');
      return;
    }
    try {
      const payload = buildPayload(formData);
      if (modalMode === 'add') {
        await createRecord(payload).unwrap();
      } else {
        await updateRecord({ id: selectedRecord.id, ...payload }).unwrap();
      }
      setShowModal(false);
    } catch (err) {
      alert('Failed to save M&E record: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete M&E record for "${record.projectName}"?`)) return;
    try {
      await deleteRecord(record.id).unwrap();
    } catch (err) {
      alert('Failed to delete M&E record: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const handleExport = (format) => {
    alert(`${format} export is prepared from the reports module.`);
  };

  const saveModuleEntry = async (module) => {
    if (module === 'analytics') {
      refetch();
      return;
    }

    if (module === 'project') {
      openAdd();
      return;
    }

    if (!selectedWorkspaceRecord) {
      alert('Create or select an M&E project record first.');
      return;
    }

    const current = selectedWorkspaceRecord;
    const form = moduleForms[module];
    let patch = {};

    if (module === 'outcomes') {
      patch = {
        goal: form.goal || current.goal || '',
        objectives: splitLines(form.objectives),
        expectedOutcomes: splitLines(form.expectedOutcomes),
        expectedOutputs: splitLines(form.expectedOutputs),
        successCriteria: splitLines(form.successCriteria),
        assumptions: splitLines(form.assumptions),
        risks: splitLines(form.risks)
      };
    }

    if (module === 'indicators') {
      patch = {
        indicators: [
          ...(Array.isArray(current.indicators) ? current.indicators : []),
          {
            ...form,
            baseline: Number(form.baseline) || 0,
            target: Number(form.target) || 0,
            current: Number(form.current) || 0
          }
        ]
      };
    }

    if (module === 'activities') {
      patch = {
        activities: [
          ...(Array.isArray(current.activities) ? current.activities : []),
          {
            ...form,
            budgetUsed: Number(form.budgetUsed) || 0,
            progress: Number(form.progress) || 0
          }
        ]
      };
    }

    if (module === 'beneficiaries') {
      patch = {
        beneficiaries: [
          ...(Array.isArray(current.beneficiaries) ? current.beneficiaries : []),
          {
            ...form,
            numberReached: Number(form.numberReached) || 0
          }
        ]
      };
    }

    if (module === 'data') {
      patch = {
        dataCollection: form.dataCollection,
        notes: form.notes || current.notes || ''
      };
    }

    if (module === 'visits') {
      patch = {
        fieldVisits: [
          ...(Array.isArray(current.fieldVisits) ? current.fieldVisits : []),
          form
        ]
      };
    }

    if (module === 'risks') {
      patch = {
        riskIssues: [
          ...(Array.isArray(current.riskIssues) ? current.riskIssues : []),
          form
        ]
      };
    }

    if (module === 'kpi') {
      patch = {
        expense: Number(form.expense) || 0,
        performance: Number(form.performance) || 0,
        completion: Number(form.completion) || 0
      };
    }

    if (module === 'reports') {
      patch = {
        reports: [
          ...(Array.isArray(current.reports) ? current.reports : []),
          form
        ]
      };
    }

    if (module === 'gis') {
      patch = {
        gisLocations: [
          ...(Array.isArray(current.gisLocations) ? current.gisLocations : []),
          form
        ],
        branchRegion: form.region || current.branchRegion,
        targetArea: form.district || current.targetArea
      };
    }

    try {
      await updateRecord({ id: current.id, ...current, ...patch }).unwrap();
      setModuleForms((currentForms) => ({ ...currentForms, [module]: EMPTY_MODULE_FORMS[module] }));
    } catch (err) {
      alert('Failed to save module form: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const errorMessage = error ? getNgoErrorMessage(error, 'Failed to fetch monitoring records') : null;
  const isView = modalMode === 'view';
  const activeModuleConfig = MODULES.find((module) => module.id === activeModule) || MODULES[0];
  const ActiveModuleIcon = activeModuleConfig.icon;
  const highRisks = records.reduce((sum, record) => {
    const risks = Array.isArray(record.riskIssues) ? record.riskIssues : [];
    return sum + risks.filter((risk) => String(risk.severity || '').toLowerCase() === 'high').length;
  }, 0);
  const moduleSaveLabel = activeModule === 'project'
    ? 'Create Project Record'
    : activeModule === 'analytics'
      ? 'Refresh Analytics'
      : `Save ${activeModuleConfig.label}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <BarChart3 size={18} />
            <span>Monitoring & Evaluation</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Professional M&E Workspace</h1>
          <p className="mt-1 text-slate-600">
            Manage project information, outcomes, indicators, activities, beneficiaries, field evidence, risks, reports, GIS, and analytics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {EXPORT_TYPES.map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => handleExport(format)}
              className="px-3 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              {format}
            </button>
          ))}
          <button
            type="button"
            onClick={openAdd}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
          >
            <Plus size={18} />
            New Project Record
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Beneficiaries reached" value={(totals.beneficiariesReached || 0).toLocaleString()} caption="Across selected records" />
        <StatCard icon={FileSpreadsheet} label="Budget utilization" value={pct(totals.budgetUtilization)} caption={`${currency(totals.expense)} of ${currency(totals.budget)}`} />
        <StatCard icon={CheckCircle2} label="Activities completed" value={pct(totals.activityCompletion)} caption={`${totals.activitiesCompleted || 0} of ${totals.activities || 0} activities`} />
        <StatCard icon={TrendingUp} label="Project performance" value={pct(totals.performance)} caption={`${pct(totals.projectCompletion)} average completion`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4">
        <aside className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="text-lg font-bold text-slate-900">M&E Modules</h2>
          <p className="mt-1 text-sm text-slate-500">Open each feature area from this workspace sidebar.</p>
          <div className="mt-4 space-y-1">
            {MODULES.map((module) => {
              const Icon = module.icon;
              const active = activeModule === module.id;
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                    active ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={17} />
                  <span className="font-medium">{module.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                <ActiveModuleIcon size={18} />
                <span>{activeModuleConfig.label}</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {activeModule === 'analytics' ? 'Professional Analytics Dashboard' : `Create ${activeModuleConfig.label}`}
              </h2>
              <p className="text-sm text-slate-500">
                {activeModule === 'analytics'
                  ? 'Target vs actual, budget vs expense, beneficiary growth, activity trend, gender distribution, and geographic impact.'
                  : 'This module has its own form and saves only this feature into the selected M&E project record.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => saveModuleEntry(activeModule)}
              disabled={updating && activeModule !== 'project'}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2 text-sm font-semibold"
            >
              {updating && activeModule !== 'project' ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
              {moduleSaveLabel}
            </button>
          </div>

          {activeModule !== 'analytics' && activeModule !== 'project' && (
            <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Save this module under</label>
              <select
                value={selectedWorkspaceRecord?.id || ''}
                onChange={(e) => setSelectedWorkspaceRecordId(e.target.value)}
                className={NGO_INPUT_CLASS}
              >
                {records.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.projectName || 'Untitled project'} ({record.projectCode || record.projectId || record.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeModule === 'analytics' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <MiniBar label="Target vs Actual Results" value={totals.targetVsActual || totals.performance} />
                <MiniBar label="Budget vs Expense" value={totals.budgetUtilization} tone="blue" />
                <MiniBar label="Beneficiary Growth" value={Math.min(100, (totals.beneficiariesReached || 0) / 100)} />
                <MiniBar label="Activity Completion Trend" value={totals.activityCompletion} tone="amber" />
                <MiniBar label="Project Performance" value={totals.performance} />
                <MiniBar label="Geographic Impact Coverage" value={totals.projectCompletion} tone="blue" />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Records</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{totals.projects}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Indicators</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{records.reduce((sum, record) => sum + (record.indicators?.length || 0), 0)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Open risks</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{highRisks}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Mapped areas</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{records.filter((record) => record.branchRegion || record.targetArea).length}</p>
                </div>
              </div>
            </>
          )}

          {activeModule === 'project' && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
              <h3 className="text-base font-bold text-emerald-950">Project Information Form</h3>
              <p className="mt-1 text-sm text-emerald-800">Create the core M&E project record first. Other module forms save into that selected project record.</p>
              <button type="button" onClick={openAdd} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center gap-2">
                <Plus size={17} />
                Create Project Information
              </button>
            </div>
          )}

          {activeModule === 'outcomes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NGOFormField label="Project Goal" colSpan={2}><textarea rows={2} value={moduleForms.outcomes.goal} onChange={(e) => patchModuleForm('outcomes', { goal: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              {[
                ['Objectives', 'objectives'],
                ['Expected Outcomes', 'expectedOutcomes'],
                ['Expected Outputs', 'expectedOutputs'],
                ['Success Criteria', 'successCriteria'],
                ['Assumptions', 'assumptions'],
                ['Risks', 'risks']
              ].map(([label, key]) => (
                <NGOFormField key={key} label={label} colSpan={2} hint="One item per line">
                  <textarea rows={3} value={moduleForms.outcomes[key]} onChange={(e) => patchModuleForm('outcomes', { [key]: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
              ))}
            </div>
          )}

          {activeModule === 'indicators' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <NGOFormField label="Indicator ID"><input value={moduleForms.indicators.indicatorId} onChange={(e) => patchModuleForm('indicators', { indicatorId: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Indicator Name"><input value={moduleForms.indicators.name} onChange={(e) => patchModuleForm('indicators', { name: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Indicator Type"><select value={moduleForms.indicators.type} onChange={(e) => patchModuleForm('indicators', { type: e.target.value })} className={NGO_INPUT_CLASS}>{INDICATOR_TYPES.map((x) => <option key={x}>{x}</option>)}</select></NGOFormField>
              <NGOFormField label="Unit of Measure"><select value={moduleForms.indicators.unit} onChange={(e) => patchModuleForm('indicators', { unit: e.target.value })} className={NGO_INPUT_CLASS}>{UNIT_OPTIONS.map((x) => <option key={x}>{x}</option>)}</select></NGOFormField>
              <NGOFormField label="Description" colSpan={2}><input value={moduleForms.indicators.description} onChange={(e) => patchModuleForm('indicators', { description: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Baseline Value"><input type="number" value={moduleForms.indicators.baseline} onChange={(e) => patchModuleForm('indicators', { baseline: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Target Value"><input type="number" value={moduleForms.indicators.target} onChange={(e) => patchModuleForm('indicators', { target: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Current Value"><input type="number" value={moduleForms.indicators.current} onChange={(e) => patchModuleForm('indicators', { current: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Data Collection Frequency"><select value={moduleForms.indicators.frequency} onChange={(e) => patchModuleForm('indicators', { frequency: e.target.value })} className={NGO_INPUT_CLASS}>{FREQUENCY_OPTIONS.map((x) => <option key={x}>{x}</option>)}</select></NGOFormField>
            </div>
          )}

          {activeModule === 'activities' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <NGOFormField label="Activity Name"><input value={moduleForms.activities.name} onChange={(e) => patchModuleForm('activities', { name: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Assigned Staff"><input value={moduleForms.activities.assignedStaff} onChange={(e) => patchModuleForm('activities', { assignedStaff: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Status"><select value={moduleForms.activities.status} onChange={(e) => patchModuleForm('activities', { status: e.target.value })} className={NGO_INPUT_CLASS}>{['Pending', 'Ongoing', 'Completed'].map((x) => <option key={x}>{x}</option>)}</select></NGOFormField>
              <NGOFormField label="Progress %"><input type="number" value={moduleForms.activities.progress} onChange={(e) => patchModuleForm('activities', { progress: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Activity Description" colSpan={2}><input value={moduleForms.activities.description} onChange={(e) => patchModuleForm('activities', { description: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Start Date"><input type="date" value={moduleForms.activities.startDate} onChange={(e) => patchModuleForm('activities', { startDate: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="End Date"><input type="date" value={moduleForms.activities.endDate} onChange={(e) => patchModuleForm('activities', { endDate: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Budget Used"><input type="number" value={moduleForms.activities.budgetUsed} onChange={(e) => patchModuleForm('activities', { budgetUsed: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
            </div>
          )}

          {activeModule === 'beneficiaries' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                ['Beneficiary ID', 'beneficiaryId'],
                ['Beneficiary Name', 'name'],
                ['Category', 'category'],
                ['Location', 'location'],
                ['Services Received', 'servicesReceived'],
                ['Gender', 'gender'],
                ['Age Group', 'ageGroup']
              ].map(([label, key]) => (
                <NGOFormField key={key} label={label}><input value={moduleForms.beneficiaries[key]} onChange={(e) => patchModuleForm('beneficiaries', { [key]: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              ))}
              <NGOFormField label="Number Reached"><input type="number" value={moduleForms.beneficiaries.numberReached} onChange={(e) => patchModuleForm('beneficiaries', { numberReached: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
            </div>
          )}

          {activeModule === 'data' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {['Survey Forms', 'Questionnaires', 'Field Reports', 'Mobile Data Collection', 'GPS Location', 'Photos', 'Video Uploads', 'Supporting Documents'].map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2">
                    <input
                      type="checkbox"
                      checked={moduleForms.data.dataCollection.includes(item)}
                      onChange={(e) => patchModuleForm('data', {
                        dataCollection: e.target.checked
                          ? [...moduleForms.data.dataCollection, item]
                          : moduleForms.data.dataCollection.filter((value) => value !== item)
                      })}
                    />
                    {item}
                  </label>
                ))}
              </div>
              <NGOFormField label="Supporting Notes"><textarea rows={3} value={moduleForms.data.notes} onChange={(e) => patchModuleForm('data', { notes: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
            </div>
          )}

          {activeModule === 'visits' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                ['Visit Date', 'visitDate', 'date'],
                ['Field Officer', 'fieldOfficer'],
                ['Location', 'location'],
                ['Purpose', 'purpose'],
                ['Findings', 'findings'],
                ['Recommendations', 'recommendations'],
                ['Photos', 'photos'],
                ['Signatures', 'signatures']
              ].map(([label, key, type]) => (
                <NGOFormField key={key} label={label}><input type={type || 'text'} value={moduleForms.visits[key]} onChange={(e) => patchModuleForm('visits', { [key]: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              ))}
            </div>
          )}

          {activeModule === 'risks' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NGOFormField label="Risk ID"><input value={moduleForms.risks.riskId} onChange={(e) => patchModuleForm('risks', { riskId: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Severity"><select value={moduleForms.risks.severity} onChange={(e) => patchModuleForm('risks', { severity: e.target.value })} className={NGO_INPUT_CLASS}>{SEVERITY_OPTIONS.map((x) => <option key={x}>{x}</option>)}</select></NGOFormField>
              <NGOFormField label="Status"><input value={moduleForms.risks.status} onChange={(e) => patchModuleForm('risks', { status: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Risk Description"><input value={moduleForms.risks.description} onChange={(e) => patchModuleForm('risks', { description: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Mitigation Plan"><input value={moduleForms.risks.mitigationPlan} onChange={(e) => patchModuleForm('risks', { mitigationPlan: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Responsible Person"><input value={moduleForms.risks.responsiblePerson} onChange={(e) => patchModuleForm('risks', { responsiblePerson: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
            </div>
          )}

          {activeModule === 'kpi' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NGOFormField label="Budget Expense"><input type="number" value={moduleForms.kpi.expense} onChange={(e) => patchModuleForm('kpi', { expense: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Performance %"><input type="number" value={moduleForms.kpi.performance} onChange={(e) => patchModuleForm('kpi', { performance: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Project Completion %"><input type="number" value={moduleForms.kpi.completion} onChange={(e) => patchModuleForm('kpi', { completion: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
            </div>
          )}

          {activeModule === 'reports' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <NGOFormField label="Report Type"><select value={moduleForms.reports.type} onChange={(e) => patchModuleForm('reports', { type: e.target.value })} className={NGO_INPUT_CLASS}>{REPORT_TYPES.map((x) => <option key={x}>{x}</option>)}</select></NGOFormField>
              <NGOFormField label="Period"><input value={moduleForms.reports.period} onChange={(e) => patchModuleForm('reports', { period: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Prepared By"><input value={moduleForms.reports.preparedBy} onChange={(e) => patchModuleForm('reports', { preparedBy: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Status"><input value={moduleForms.reports.status} onChange={(e) => patchModuleForm('reports', { status: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              <NGOFormField label="Export" colSpan={2}>
                <div className="grid grid-cols-3 gap-2">
                  {EXPORT_TYPES.map((item) => (
                    <label key={item} className="flex items-center gap-2 text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2">
                      <input
                        type="checkbox"
                        checked={moduleForms.reports.exportFormats.includes(item)}
                        onChange={(e) => patchModuleForm('reports', {
                          exportFormats: e.target.checked
                            ? [...moduleForms.reports.exportFormats, item]
                            : moduleForms.reports.exportFormats.filter((value) => value !== item)
                        })}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </NGOFormField>
            </div>
          )}

          {activeModule === 'gis' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                ['Region', 'region'],
                ['District', 'district'],
                ['Sector', 'sector'],
                ['Village', 'village'],
                ['GPS Coordinates', 'coordinates'],
                ['Project Activity Map', 'activityMap']
              ].map(([label, key]) => (
                <NGOFormField key={key} label={label}><input value={moduleForms.gis[key]} onChange={(e) => patchModuleForm('gis', { [key]: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project, program, manager, donor, or target area"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <Filter size={18} className="text-slate-400" />
          <select value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg">
            <option value="">All Organizations</option>
            {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          {errorMessage}
          <button type="button" onClick={refetch} className="ml-3 underline">Try again</button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-14 text-slate-600">
            <Loader2 className="animate-spin mr-2" size={22} />
            Loading monitoring records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Project', 'Program / Donor', 'KPI Progress', 'Budget', 'Beneficiaries', 'GIS Area', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{record.projectName || 'Untitled project'}</div>
                      <div className="text-xs text-slate-500">{record.projectCode || record.projectId || 'No ID'} - {orgById[record.organizationId]?.name || 'Organization not set'}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      <div>{record.program || 'Not specified'}</div>
                      <div className="text-xs text-slate-500">{record.donor || 'No donor/funder'}</div>
                    </td>
                    <td className="px-5 py-4 min-w-[180px]">
                      <MiniBar label="Performance" value={record.performance || 0} />
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      <div>{currency(record.budget)}</div>
                      <div className="text-xs text-slate-500">Expense {currency(record.expense)}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {sumBeneficiaries(record).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {record.branchRegion || record.targetArea || 'Not mapped'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(record.status)}`}>{record.status || 'Planning'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => openRecord(record, 'view')} title="View" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={17} /></button>
                        <button type="button" onClick={() => openRecord(record, 'edit')} title="Edit" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit size={17} /></button>
                        <button type="button" onClick={() => handleDelete(record)} title="Delete" className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <div className="text-center py-14">
                <BarChart3 className="mx-auto text-slate-400 mb-3" size={44} />
                <p className="text-slate-600 font-medium">No M&E records found</p>
                <button type="button" onClick={openAdd} className="mt-3 text-emerald-700 font-semibold">Create the first record</button>
              </div>
            )}
          </div>
        )}
      </div>

      <DrawerShell
        open={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        title={modalMode === 'add' ? 'Create Monitoring & Evaluation Record' : modalMode === 'edit' ? 'Edit Monitoring & Evaluation Record' : 'Monitoring & Evaluation Record'}
        onSave={handleSave}
        saving={saving}
        activeSection={activeFormSection}
        setActiveSection={setActiveFormSection}
      >
        <NGOFormGrid>
          <div id="me-section-project" className="scroll-mt-6 md:col-span-2 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-900">Project Information</h3>
            <p className="text-sm text-slate-500">Project ID, name, program, manager, timeline, budget, donor, target area, and branch region.</p>
          </div>
          <NGOFormField label="Organization" required>
            <select disabled={isView} value={formData.organizationId} onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })} className={NGO_INPUT_CLASS}>
              <option value="">Select organization</option>
              {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
            </select>
          </NGOFormField>
          <NGOFormField label="Linked Project">
            <select disabled={isView} value={formData.projectId} onChange={(e) => handleProjectChange(e.target.value)} className={NGO_INPUT_CLASS}>
              <option value="">Select project</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </NGOFormField>
          {[
            ['Project ID', 'projectCode'],
            ['Project Name', 'projectName'],
            ['Program', 'program'],
            ['Project Manager', 'projectManager'],
            ['Donor / Funder', 'donor'],
            ['Target Area', 'targetArea'],
            ['Branch / Region', 'branchRegion']
          ].map(([label, key]) => (
            <NGOFormField key={key} label={label} required={key === 'projectName'}>
              <input disabled={isView} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className={NGO_INPUT_CLASS} />
            </NGOFormField>
          ))}
          <NGOFormField label="Project Start Date"><input disabled={isView} type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
          <NGOFormField label="Project End Date"><input disabled={isView} type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
          <NGOFormField label="Project Status">
            <select disabled={isView} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={NGO_INPUT_CLASS}>
              {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </NGOFormField>
          <NGOFormField label="Budget"><input disabled={isView} type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>

          <div id="me-section-outcomes" className="scroll-mt-6 md:col-span-2 border-b border-slate-200 pb-3 pt-2">
            <h3 className="text-lg font-bold text-slate-900">Objectives & Outcomes</h3>
            <p className="text-sm text-slate-500">Define the project goal, objectives, outputs, outcomes, success criteria, assumptions, and risks.</p>
          </div>
          <NGOFormField label="Project Goal" colSpan={2}><textarea disabled={isView} rows={2} value={formData.goal} onChange={(e) => setFormData({ ...formData, goal: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
          {[
            ['Objectives', 'objectives'],
            ['Expected Outcomes', 'expectedOutcomes'],
            ['Expected Outputs', 'expectedOutputs'],
            ['Success Criteria', 'successCriteria'],
            ['Assumptions', 'assumptions'],
            ['Risks', 'risks']
          ].map(([label, key]) => (
            <NGOFormField key={key} label={label} colSpan={2} hint="One item per line">
              <textarea disabled={isView} rows={3} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className={NGO_INPUT_CLASS} />
            </NGOFormField>
          ))}

          <ArrayEditor id="me-section-indicators" title="Indicators Management" items={formData.indicators} onChange={(items) => setFormData({ ...formData, indicators: items })} template={blankIndicator}>
            {(item, _index, update) => (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input disabled={isView} placeholder="Indicator ID" value={item.indicatorId} onChange={(e) => update({ indicatorId: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} placeholder="Indicator Name" value={item.name} onChange={(e) => update({ name: e.target.value })} className={NGO_INPUT_CLASS} />
                <select disabled={isView} value={item.type} onChange={(e) => update({ type: e.target.value })} className={NGO_INPUT_CLASS}>{INDICATOR_TYPES.map((x) => <option key={x}>{x}</option>)}</select>
                <select disabled={isView} value={item.unit} onChange={(e) => update({ unit: e.target.value })} className={NGO_INPUT_CLASS}>{UNIT_OPTIONS.map((x) => <option key={x}>{x}</option>)}</select>
                <input disabled={isView} placeholder="Description" value={item.description} onChange={(e) => update({ description: e.target.value })} className={`${NGO_INPUT_CLASS} md:col-span-4`} />
                <input disabled={isView} type="number" placeholder="Baseline" value={item.baseline} onChange={(e) => update({ baseline: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} type="number" placeholder="Target" value={item.target} onChange={(e) => update({ target: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} type="number" placeholder="Current" value={item.current} onChange={(e) => update({ current: e.target.value })} className={NGO_INPUT_CLASS} />
                <select disabled={isView} value={item.frequency} onChange={(e) => update({ frequency: e.target.value })} className={NGO_INPUT_CLASS}>{FREQUENCY_OPTIONS.map((x) => <option key={x}>{x}</option>)}</select>
              </div>
            )}
          </ArrayEditor>

          <ArrayEditor id="me-section-activities" title="Activity Tracking" items={formData.activities} onChange={(items) => setFormData({ ...formData, activities: items })} template={blankActivity}>
            {(item, _index, update) => (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input disabled={isView} placeholder="Activity Name" value={item.name} onChange={(e) => update({ name: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} placeholder="Assigned Staff" value={item.assignedStaff} onChange={(e) => update({ assignedStaff: e.target.value })} className={NGO_INPUT_CLASS} />
                <select disabled={isView} value={item.status} onChange={(e) => update({ status: e.target.value })} className={NGO_INPUT_CLASS}>{['Pending', 'Ongoing', 'Completed'].map((x) => <option key={x}>{x}</option>)}</select>
                <input disabled={isView} type="number" placeholder="Progress %" value={item.progress} onChange={(e) => update({ progress: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} placeholder="Description" value={item.description} onChange={(e) => update({ description: e.target.value })} className={`${NGO_INPUT_CLASS} md:col-span-2`} />
                <input disabled={isView} type="date" value={item.startDate} onChange={(e) => update({ startDate: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} type="date" value={item.endDate} onChange={(e) => update({ endDate: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} type="number" placeholder="Budget Used" value={item.budgetUsed} onChange={(e) => update({ budgetUsed: e.target.value })} className={NGO_INPUT_CLASS} />
              </div>
            )}
          </ArrayEditor>

          <ArrayEditor id="me-section-beneficiaries" title="Beneficiary Tracking" items={formData.beneficiaries} onChange={(items) => setFormData({ ...formData, beneficiaries: items })} template={blankBeneficiary}>
            {(item, _index, update) => (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {['beneficiaryId', 'name', 'category', 'location', 'servicesReceived', 'gender', 'ageGroup'].map((key) => (
                  <input key={key} disabled={isView} placeholder={key} value={item[key]} onChange={(e) => update({ [key]: e.target.value })} className={NGO_INPUT_CLASS} />
                ))}
                <input disabled={isView} type="number" placeholder="Number Reached" value={item.numberReached} onChange={(e) => update({ numberReached: e.target.value })} className={NGO_INPUT_CLASS} />
              </div>
            )}
          </ArrayEditor>

          <NGOFormField label="Data Collection" colSpan={2}>
            <div id="me-section-data" className="scroll-mt-6 grid grid-cols-1 md:grid-cols-3 gap-2">
              {['Survey Forms', 'Questionnaires', 'Field Reports', 'Mobile Data Collection', 'GPS Location', 'Photos', 'Video Uploads', 'Supporting Documents'].map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2">
                  <input
                    type="checkbox"
                    disabled={isView}
                    checked={formData.dataCollection.includes(item)}
                    onChange={(e) => setFormData({
                      ...formData,
                      dataCollection: e.target.checked
                        ? [...formData.dataCollection, item]
                        : formData.dataCollection.filter((value) => value !== item)
                    })}
                  />
                  {item}
                </label>
              ))}
            </div>
          </NGOFormField>

          <ArrayEditor id="me-section-visits" title="Field Visits" items={formData.fieldVisits} onChange={(items) => setFormData({ ...formData, fieldVisits: items })} template={blankFieldVisit}>
            {(item, _index, update) => (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input disabled={isView} type="date" value={item.visitDate} onChange={(e) => update({ visitDate: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} placeholder="Field Officer" value={item.fieldOfficer} onChange={(e) => update({ fieldOfficer: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} placeholder="Location" value={item.location} onChange={(e) => update({ location: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} placeholder="Purpose" value={item.purpose} onChange={(e) => update({ purpose: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} placeholder="Findings" value={item.findings} onChange={(e) => update({ findings: e.target.value })} className={`${NGO_INPUT_CLASS} md:col-span-2`} />
                <input disabled={isView} placeholder="Recommendations" value={item.recommendations} onChange={(e) => update({ recommendations: e.target.value })} className={`${NGO_INPUT_CLASS} md:col-span-2`} />
                <input disabled={isView} placeholder="Photos" value={item.photos} onChange={(e) => update({ photos: e.target.value })} className={`${NGO_INPUT_CLASS} md:col-span-2`} />
                <input disabled={isView} placeholder="Signatures" value={item.signatures} onChange={(e) => update({ signatures: e.target.value })} className={`${NGO_INPUT_CLASS} md:col-span-2`} />
              </div>
            )}
          </ArrayEditor>

          <ArrayEditor id="me-section-risks" title="Risk & Issue Tracking" items={formData.riskIssues} onChange={(items) => setFormData({ ...formData, riskIssues: items })} template={blankRisk}>
            {(item, _index, update) => (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input disabled={isView} placeholder="Risk ID" value={item.riskId} onChange={(e) => update({ riskId: e.target.value })} className={NGO_INPUT_CLASS} />
                <select disabled={isView} value={item.severity} onChange={(e) => update({ severity: e.target.value })} className={NGO_INPUT_CLASS}>{SEVERITY_OPTIONS.map((x) => <option key={x}>{x}</option>)}</select>
                <input disabled={isView} placeholder="Status" value={item.status} onChange={(e) => update({ status: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} placeholder="Risk Description" value={item.description} onChange={(e) => update({ description: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} placeholder="Mitigation Plan" value={item.mitigationPlan} onChange={(e) => update({ mitigationPlan: e.target.value })} className={NGO_INPUT_CLASS} />
                <input disabled={isView} placeholder="Responsible Person" value={item.responsiblePerson} onChange={(e) => update({ responsiblePerson: e.target.value })} className={NGO_INPUT_CLASS} />
              </div>
            )}
          </ArrayEditor>

          <div id="me-section-kpi" className="scroll-mt-6 md:col-span-2 border-b border-slate-200 pb-3 pt-2">
            <h3 className="text-lg font-bold text-slate-900">KPI Dashboard</h3>
            <p className="text-sm text-slate-500">Budget utilization, project performance, completion, target vs actual, and beneficiary metrics.</p>
          </div>
          <NGOFormField label="KPI Dashboard Inputs"><input disabled={isView} type="number" value={formData.expense} onChange={(e) => setFormData({ ...formData, expense: e.target.value })} className={NGO_INPUT_CLASS} placeholder="Budget expense" /></NGOFormField>
          <NGOFormField label="Performance %"><input disabled={isView} type="number" value={formData.performance} onChange={(e) => setFormData({ ...formData, performance: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
          <NGOFormField label="Project Completion %"><input disabled={isView} type="number" value={formData.completion} onChange={(e) => setFormData({ ...formData, completion: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
          <NGOFormField label="Reports & Exports">
            <div id="me-section-reports" className="scroll-mt-6 text-sm text-slate-700 border border-slate-200 rounded-lg p-3">
              {REPORT_TYPES.join(', ')} - Export: {EXPORT_TYPES.join(', ')}
            </div>
          </NGOFormField>
          <NGOFormField label="GIS / Map Tracking" colSpan={2}>
            <div id="me-section-gis" className="scroll-mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              {['region', 'district', 'sector', 'village', 'coordinates', 'activityMap'].map((key) => (
                <input key={key} disabled={isView} placeholder={key} value={formData.gisLocations[0]?.[key] || ''} onChange={(e) => setFormData({ ...formData, gisLocations: [{ ...formData.gisLocations[0], [key]: e.target.value }] })} className={NGO_INPUT_CLASS} />
              ))}
            </div>
          </NGOFormField>
          <div id="me-section-analytics" className="scroll-mt-6 md:col-span-2 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <h3 className="text-lg font-bold text-emerald-950">Analytics Dashboard</h3>
            <p className="mt-1 text-sm text-emerald-800">Saved values feed the KPI cards, target vs actual bars, budget vs expense, activity completion, and geographic impact widgets on the main page.</p>
          </div>
          <NGOFormField label="Notes" colSpan={2}><textarea disabled={isView} rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={NGO_INPUT_CLASS} /></NGOFormField>
        </NGOFormGrid>
      </DrawerShell>
    </div>
  );
}
