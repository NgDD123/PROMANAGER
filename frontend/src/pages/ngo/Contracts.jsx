import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Edit,
  FileSpreadsheet,
  Filter,
  Loader2,
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
  usePatchNgoContractMutation,
  useGetNgoProjectsQuery,
  useGetNgoUsersQuery,
  getNgoErrorMessage
} from '../../store/actions/ngo.js';
import { NGOFormField, NGOFormGrid, NGO_INPUT_CLASS } from '../../components/ngo/NGOModal.jsx';
import {
  aggregateMeMetrics,
  deriveMeMetrics,
  formatPercentDisplay,
  formatUtilizationPercent
} from '../../utils/meMetrics.js';
import { usePopup } from '../../context/PopupContext.jsx';

const STATUS_OPTIONS = ['Planning', 'Ongoing', 'Active', 'Completed', 'On Hold', 'Closed'];
const FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
const INDICATOR_TYPES = ['Input', 'Output', 'Outcome', 'Impact'];
const UNIT_OPTIONS = ['Number', 'Percentage', 'Currency', 'Quantity'];
const ACTIVITY_STATUS_OPTIONS = ['Pending', 'Ongoing', 'Completed'];
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
const SEVERITY_OPTIONS = ['Low', 'Medium', 'High'];
const REPORT_TYPES = ['Monthly report', 'Quarterly report', 'Annual report', 'Donor report', 'Impact report'];
const EXPORT_TYPES = ['PDF', 'Excel', 'Word'];

const ME_RECORD_EXISTS_NOTICE =
  'You have already added a Monitoring & Evaluation record for this project.';

const FORM_STEPS = [
  { id: 'project', label: 'Project Information', icon: ClipboardList },
  { id: 'outcomes', label: 'Objectives & Outcomes', icon: Target },
  { id: 'indicators', label: 'Indicators', icon: BarChart3 },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
  { id: 'visits', label: 'Field Visits', icon: CalendarDays },
  { id: 'risks', label: 'Risks & Notes', icon: ShieldAlert }
];

const WORKSPACE_MODULES = FORM_STEPS.filter((step) => step.id !== 'project');

const blankIndicator = {
  name: '',
  type: '',
  description: '',
  unit: '',
  baseline: '',
  target: '',
  current: '',
  frequency: ''
};

const blankActivity = {
  name: '',
  description: '',
  assignedStaff: '',
  startDate: '',
  endDate: '',
  status: '',
  budgetUsed: '',
  progress: ''
};

function staffDisplayName(member) {
  return member?.fullName || member?.name || '';
}

function staffOptionLabel(member) {
  const name = staffDisplayName(member);
  const detail = member?.jobTitle || member?.roleName || '';
  return detail ? `${name} — ${detail}` : name;
}

const blankBeneficiary = {
  name: '',
  category: '',
  location: '',
  servicesReceived: '',
  numberReached: '',
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

function toDateInputValue(value) {
  if (!value) return '';
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function projectToFormFields(project) {
  if (!project) return {};
  return {
    projectId: project.id || '',
    organizationId: project.organizationId || '',
    projectCode: project.code || '',
    projectName: project.name || '',
    program: project.programArea || '',
    donor: project.donor || '',
    projectManager: project.manager || '',
    startDate: toDateInputValue(project.startDate),
    endDate: toDateInputValue(project.endDate),
    budget: project.budget ?? 0
  };
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

const STEP_PAYLOAD_FIELDS = {
  project: [
    'organizationId',
    'projectId',
    'projectCode',
    'projectName',
    'program',
    'projectManager',
    'donor',
    'startDate',
    'endDate',
    'status',
    'budget'
  ],
  outcomes: ['goal', 'objectives', 'expectedOutcomes', 'expectedOutputs', 'successCriteria', 'assumptions', 'risks'],
  indicators: ['indicators'],
  activities: ['activities'],
  beneficiaries: ['beneficiaries'],
  visits: ['fieldVisits'],
  risks: ['riskIssues', 'notes']
};

function buildPayload(form) {
  const metrics = deriveMeMetrics(form);
  return {
    ...form,
    budget: Number(form.budget) || 0,
    expense: metrics.expense,
    performance: metrics.performance,
    completion: metrics.completion,
    beneficiaryTotal: metrics.beneficiariesReached,
    objectives: splitLines(form.objectives),
    expectedOutcomes: splitLines(form.expectedOutcomes),
    expectedOutputs: splitLines(form.expectedOutputs),
    successCriteria: splitLines(form.successCriteria),
    assumptions: splitLines(form.assumptions),
    risks: splitLines(form.risks),
    indicators: form.indicators.map(({ indicatorId: _indicatorId, ...item }) => ({
      ...item,
      baseline: Number(item.baseline) || 0,
      target: Number(item.target) || 0,
      current: Number(item.current) || 0
    })),
    activities: form.activities.map((item) => ({
      ...item,
      budgetUsed: Number(item.budgetUsed) || 0,
      progress:
        item.progress === '' || item.progress == null || item.progress === undefined
          ? ''
          : Number(item.progress)
    })),
    beneficiaries: form.beneficiaries.map(({ beneficiaryId: _beneficiaryId, ...item }) => ({
      ...item,
      numberReached: Number(item.numberReached) || 0
    }))
  };
}

function buildStepPayload(form, stepId) {
  const full = buildPayload(form);
  const keys = STEP_PAYLOAD_FIELDS[stepId] || [];
  return Object.fromEntries(keys.map((key) => [key, full[key]]));
}

function statusClass(status) {
  const value = String(status || '').toLowerCase();
  if (['completed', 'closed'].includes(value)) return 'bg-emerald-100 text-emerald-700';
  if (['ongoing', 'active'].includes(value)) return 'bg-blue-100 text-blue-700';
  if (value === 'on hold') return 'bg-amber-100 text-amber-800';
  return 'bg-slate-100 text-slate-700';
}

function formatDashboardTotals(records) {
  const aggregated = aggregateMeMetrics(records);
  return {
    ...aggregated,
    budgetUtilization: formatUtilizationPercent(aggregated.budgetUtilization),
    activityCompletion: formatUtilizationPercent(aggregated.activityCompletion),
    performance: formatUtilizationPercent(aggregated.performance),
    projectCompletion: formatUtilizationPercent(aggregated.projectCompletion)
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
          <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{caption}</p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Icon size={20} className="text-emerald-700" />
        </div>
      </div>
    </div>
  );
}

function formatListValue(value) {
  if (Array.isArray(value)) return value.filter((item) => String(item || '').trim());
  if (typeof value === 'string' && value.trim()) return value.split('\n').map((item) => item.trim()).filter(Boolean);
  return [];
}

function isPopulatedRow(item, keys = ['name', 'description', 'indicatorId', 'beneficiaryId', 'riskId', 'fieldOfficer', 'location']) {
  if (!item || typeof item !== 'object') return false;
  return keys.some((key) => {
    const value = item[key];
    if (value === 0) return true;
    return String(value || '').trim().length > 0;
  });
}

function DetailField({ label, value }) {
  const display = value === 0 || value === '0' ? '0' : (value || '—');
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{display}</dd>
    </div>
  );
}

function DetailList({ label, items }) {
  const rows = formatListValue(items);
  if (!rows.length) return <DetailField label={label} value="—" />;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1">
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-900">
          {rows.map((item, index) => (
            <li key={`${label}-${index}`}>{item}</li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

function DetailCard({ title, children }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
      {title ? <h4 className="text-sm font-bold text-slate-800">{title}</h4> : null}
      {children}
    </div>
  );
}

function MeRecordModuleView({ record, moduleId, orgById }) {
  if (!record) return null;

  if (moduleId === 'project') {
    return (
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="Organization" value={orgById[record.organizationId]?.name} />
        <DetailField label="Project ID" value={record.projectCode} />
        <DetailField label="Project Name" value={record.projectName} />
        <DetailField label="Program Area" value={record.program} />
        <DetailField label="Project Manager" value={record.projectManager} />
        <DetailField label="Donor / Funder" value={record.donor} />
        <DetailField label="Project Start Date" value={record.startDate} />
        <DetailField label="Project End Date" value={record.endDate} />
        <DetailField label="Status" value={record.status} />
        <DetailField label="Budget" value={currency(record.budget)} />
      </dl>
    );
  }

  if (moduleId === 'outcomes') {
    return (
      <dl className="space-y-4">
        <DetailField label="Project Goal" value={record.goal} />
        <DetailList label="Objectives" items={record.objectives} />
        <DetailList label="Expected Outcomes" items={record.expectedOutcomes} />
        <DetailList label="Expected Outputs" items={record.expectedOutputs} />
        <DetailList label="Success Criteria" items={record.successCriteria} />
        <DetailList label="Assumptions" items={record.assumptions} />
        <DetailList label="Risks (planning)" items={record.risks} />
      </dl>
    );
  }

  if (moduleId === 'indicators') {
    const rows = (record.indicators || []).filter((item) => isPopulatedRow(item));
    if (!rows.length) return <p className="text-sm text-slate-500">No indicators were saved for this record.</p>;
    return (
      <div className="space-y-3">
        {rows.map((item, index) => (
          <DetailCard key={index} title={item.name || `Indicator ${index + 1}`}>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DetailField label="Indicator Type" value={item.type} />
              <DetailField label="Unit of Measure" value={item.unit} />
              <DetailField label="Data Collection Frequency" value={item.frequency} />
              <DetailField label="Baseline Value" value={item.baseline} />
              <DetailField label="Target Value" value={item.target} />
              <DetailField label="Current Value" value={item.current} />
              <DetailField label="Description" value={item.description} />
            </dl>
          </DetailCard>
        ))}
      </div>
    );
  }

  if (moduleId === 'activities') {
    const rows = (record.activities || []).filter((item) => isPopulatedRow(item));
    if (!rows.length) return <p className="text-sm text-slate-500">No activities were saved for this record.</p>;
    return (
      <div className="space-y-3">
        {rows.map((item, index) => (
          <DetailCard key={index} title={item.name || `Activity ${index + 1}`}>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DetailField label="Activity Name" value={item.name} />
              <DetailField label="Assigned Staff" value={item.assignedStaff} />
              <DetailField label="Status" value={item.status} />
              <DetailField label="Progress %" value={item.progress != null && item.progress !== '' ? pct(item.progress) : '—'} />
              <DetailField label="Start Date" value={item.startDate} />
              <DetailField label="End Date" value={item.endDate} />
              <DetailField label="Budget Used" value={currency(item.budgetUsed)} />
              <DetailField label="Description" value={item.description} />
            </dl>
          </DetailCard>
        ))}
      </div>
    );
  }

  if (moduleId === 'beneficiaries') {
    const rows = (record.beneficiaries || []).filter((item) => isPopulatedRow(item));
    if (!rows.length) return <p className="text-sm text-slate-500">No beneficiaries were saved for this record.</p>;
    return (
      <div className="space-y-3">
        {rows.map((item, index) => (
          <DetailCard key={index} title={item.name || `Beneficiary ${index + 1}`}>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DetailField label="Beneficiary Name" value={item.name} />
              <DetailField label="Category" value={item.category} />
              <DetailField label="Location" value={item.location} />
              <DetailField label="Services Received" value={item.servicesReceived} />
              <DetailField label="Gender" value={item.gender} />
              <DetailField label="Age Group" value={item.ageGroup} />
              <DetailField label="Number Reached" value={item.numberReached} />
            </dl>
          </DetailCard>
        ))}
      </div>
    );
  }

  if (moduleId === 'visits') {
    const rows = (record.fieldVisits || []).filter((item) => isPopulatedRow(item, ['visitDate', 'fieldOfficer', 'location', 'purpose', 'findings']));
    if (!rows.length) return <p className="text-sm text-slate-500">No field visits were saved for this record.</p>;
    return (
      <div className="space-y-3">
        {rows.map((item, index) => (
          <DetailCard key={index} title={item.purpose || item.location || `Visit ${index + 1}`}>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DetailField label="Visit Date" value={item.visitDate} />
              <DetailField label="Field Officer" value={item.fieldOfficer} />
              <DetailField label="Location" value={item.location} />
              <DetailField label="Purpose" value={item.purpose} />
              <DetailField label="Findings" value={item.findings} />
              <DetailField label="Recommendations" value={item.recommendations} />
              <DetailField label="Photos" value={item.photos} />
              <DetailField label="Signatures" value={item.signatures} />
            </dl>
          </DetailCard>
        ))}
      </div>
    );
  }

  if (moduleId === 'risks') {
    const rows = (record.riskIssues || []).filter((item) => isPopulatedRow(item));
    return (
      <div className="space-y-4">
        {rows.length ? (
          <div className="space-y-3">
            {rows.map((item, index) => (
              <DetailCard key={index} title={item.description || item.riskId || `Risk ${index + 1}`}>
                <dl className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <DetailField label="Risk ID" value={item.riskId} />
                  <DetailField label="Severity" value={item.severity} />
                  <DetailField label="Status" value={item.status} />
                  <DetailField label="Mitigation Plan" value={item.mitigationPlan} />
                  <DetailField label="Responsible Person" value={item.responsiblePerson} />
                </dl>
              </DetailCard>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No risk issues were saved for this record.</p>
        )}
        <DetailField label="Notes" value={record.notes} />
      </div>
    );
  }

  return null;
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

function MeFormStepIndicator({ steps, currentIndex }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((step, index) => {
          const complete = index < currentIndex;
          const active = index === currentIndex;
          const Icon = step.icon;
          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-2 shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active ? 'bg-emerald-600 text-white shadow-sm' : complete ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    active ? 'bg-white text-emerald-700' : complete ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {complete ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-3 sm:w-6 shrink-0 rounded ${complete ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Step {currentIndex + 1} of {steps.length}:{' '}
        <span className="font-semibold text-slate-900">{steps[currentIndex].label}</span>
      </p>
    </div>
  );
}

function DrawerShell({
  open,
  mode,
  title,
  saving,
  onClose,
  onSaveAndContinue,
  stepIndex,
  onBack,
  onNext,
  children
}) {
  if (!open) return null;

  const isView = mode === 'view';
  const isLastStep = stepIndex >= FORM_STEPS.length - 1;
  const isFirstStep = stepIndex === 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl flex flex-col">
        <div className="shrink-0 border-b border-slate-200 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Monitoring & Evaluation</p>
            <h2 className="text-base sm:text-xl font-bold text-slate-900">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100" title="Close">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 lg:p-6">
          <MeFormStepIndicator steps={FORM_STEPS} currentIndex={stepIndex} />
          {children}
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 flex items-center justify-between gap-3">
          <div>
            {!isFirstStep && (
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
              {isView ? 'Close' : 'Cancel'}
            </button>
            {isView && !isLastStep && (
              <button
                type="button"
                onClick={onNext}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-2"
              >
                Next
                <ChevronRight size={18} />
              </button>
            )}
            {!isView && (
              <button
                type="button"
                onClick={onSaveAndContinue}
                disabled={saving}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2 font-semibold"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : isLastStep ? <Save size={18} /> : <ChevronRight size={18} />}
                {isLastStep ? 'Save M&E Record' : 'Save & Continue'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Contracts() {
  const popup = usePopup();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [activeModule, setActiveModule] = useState('outcomes');
  const [formStepIndex, setFormStepIndex] = useState(0);
  const [selectedWorkspaceRecordId, setSelectedWorkspaceRecordId] = useState('');

  const listParams = useMemo(() => {
    const params = {};
    if (filterOrg) params.organizationId = filterOrg;
    if (filterStatus) params.status = filterStatus;
    return params;
  }, [filterOrg, filterStatus]);

  const { data: organizations = [] } = useGetNgoOrganizationsQuery();
  const { data: projects = [] } = useGetNgoProjectsQuery(filterOrg ? { organizationId: filterOrg } : undefined);
  const staffOrgId = formData.organizationId || filterOrg;
  const { data: staffMembers = [] } = useGetNgoUsersQuery(
    staffOrgId ? { organizationId: staffOrgId } : undefined,
    { skip: !staffOrgId }
  );
  const activeStaff = useMemo(
    () =>
      staffMembers.filter((member) => {
        const status = String(member.accountStatus || member.status || 'Active').toLowerCase();
        return !['suspended', 'locked'].includes(status);
      }),
    [staffMembers]
  );
  const { data: records = [], isLoading, error, refetch } = useGetNgoContractsQuery(listParams);
  const { data: summary } = useGetNgoMonitoringSummaryQuery(listParams);
  const [createRecord, { isLoading: creating }] = useCreateNgoContractMutation();
  const [patchRecord, { isLoading: updating }] = usePatchNgoContractMutation();
  const [deleteRecord] = useDeleteNgoContractMutation();

  const projectById = useMemo(() => Object.fromEntries(projects.map((project) => [project.id, project])), [projects]);
  const orgById = useMemo(() => Object.fromEntries(organizations.map((org) => [org.id, org])), [organizations]);
  const recordByProjectId = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      if (record.projectId) map[record.projectId] = record;
    });
    return map;
  }, [records]);

  const getExistingRecordForProject = (projectId, excludeRecordId) => {
    if (!projectId) return null;
    const existing = recordByProjectId[projectId];
    if (!existing) return null;
    if (excludeRecordId && String(existing.id) === String(excludeRecordId)) return null;
    return existing;
  };

  const isProjectLinkChanged = (nextProjectId, baselineProjectId) =>
    Boolean(nextProjectId) && String(nextProjectId) !== String(baselineProjectId || '');

  const notifyExistingMeRecord = () => {
    popup.alert({ title: 'M&E record exists', message: ME_RECORD_EXISTS_NOTICE });
  };
  const saving = creating || updating;

  const localTotals = useMemo(() => formatDashboardTotals(records), [records]);
  const totals = useMemo(() => {
    if (!summary) return localTotals;
    return {
      ...localTotals,
      budget: summary.budget ?? localTotals.budget,
      expense: summary.expense ?? localTotals.expense,
      activities: summary.activities ?? localTotals.activities,
      activitiesCompleted: summary.activitiesCompleted ?? localTotals.activitiesCompleted,
      beneficiariesReached: summary.beneficiariesReached ?? localTotals.beneficiariesReached,
      budgetUtilization: formatUtilizationPercent(summary.budgetUtilization ?? localTotals.budgetUtilization),
      activityCompletion: formatUtilizationPercent(summary.activityCompletion ?? localTotals.activityCompletion),
      performance: formatUtilizationPercent(summary.performance ?? localTotals.performance),
      projectCompletion: formatUtilizationPercent(summary.projectCompletion ?? localTotals.projectCompletion)
    };
  }, [localTotals, summary]);

  const filteredRecords = records.filter((record) => {
    const term = searchTerm.toLowerCase();
    return [record.projectCode, record.projectName, record.program, record.projectManager, record.donor, record.targetArea]
      .some((value) => String(value || '').toLowerCase().includes(term));
  });

  const selectedWorkspaceRecord = records.find((record) => record.id === selectedWorkspaceRecordId) || null;

  const selectWorkspaceRecord = (record) => {
    if (record?.id) setSelectedWorkspaceRecordId(record.id);
  };

  const openAdd = () => {
    const availableProject = projects.find((project) => !recordByProjectId[project.id]);
    setModalMode('add');
    setFormStepIndex(0);
    setSelectedRecord(null);
    setFormData({
      ...EMPTY_FORM,
      organizationId: filterOrg || organizations[0]?.id || availableProject?.organizationId || '',
      ...(availableProject ? projectToFormFields(availableProject) : {})
    });
    setShowModal(true);
  };

  const formStepIndexForModule = (moduleId) => {
    const index = FORM_STEPS.findIndex((step) => step.id === moduleId);
    return index >= 0 ? index : 0;
  };

  const openRecord = (record, mode, moduleId = 'project') => {
    setModalMode(mode);
    setFormStepIndex(formStepIndexForModule(moduleId));
    setSelectedRecord(record);
    setFormData(normalizeRecord(record));
    setShowModal(true);
  };

  const handleProjectChange = (projectId) => {
    if (!projectId) {
      setFormData({
        ...formData,
        projectId: '',
        projectCode: '',
        projectName: '',
        program: '',
        projectManager: '',
        donor: '',
        startDate: '',
        endDate: '',
        status: 'Planning',
        budget: 0
      });
      return;
    }
    const excludeId = selectedRecord?.id;
    if (
      projectId !== formData.projectId &&
      getExistingRecordForProject(projectId, excludeId)
    ) {
      notifyExistingMeRecord();
      return;
    }
    const project = projectById[projectId];
    setFormData({
      ...formData,
      projectId,
      ...(project ? projectToFormFields(project) : {})
    });
  };

  const validateFormStep = (stepId) => {
    if (stepId === 'project') {
      if (!formData.organizationId) {
        popup.alert('Organization is required.');
        return false;
      }
      if (!formData.projectId) {
        popup.alert('Please select a linked project.');
        return false;
      }
    }
    return true;
  };

  const persistFormRecord = async (closeOnSuccess) => {
    const stepId = FORM_STEPS[formStepIndex].id;
    if (!validateFormStep(stepId)) return false;

    const stepPayload = buildStepPayload(formData, stepId);
    let recordId = selectedRecord?.id;

    if (modalMode === 'add' && !recordId) {
      if (getExistingRecordForProject(stepPayload.projectId)) {
        notifyExistingMeRecord();
        return false;
      }
      const created = await createRecord(stepPayload).unwrap();
      setSelectedRecord(created);
      setModalMode('edit');
      recordId = created.id;
    } else {
      if (!recordId) {
        popup.alert('Save project information first.');
        return false;
      }
      const baselineProjectId = selectedRecord?.projectId;
      if (
        stepId === 'project' &&
        isProjectLinkChanged(stepPayload.projectId, baselineProjectId) &&
        getExistingRecordForProject(stepPayload.projectId, recordId)
      ) {
        notifyExistingMeRecord();
        return false;
      }
      const updated = await patchRecord({ id: recordId, ...stepPayload }).unwrap();
      setSelectedRecord((current) => ({ ...current, ...updated }));
    }

    if (closeOnSuccess) {
      if (recordId) setSelectedWorkspaceRecordId(recordId);
      setShowModal(false);
    }
    return true;
  };

  const handleSaveAndContinue = async () => {
    const isLastStep = formStepIndex >= FORM_STEPS.length - 1;
    try {
      const saved = await persistFormRecord(isLastStep);
      if (!saved) return;
      if (!isLastStep) {
        setFormStepIndex((index) => index + 1);
      }
    } catch (err) {
      popup.toast.error('Failed to save M&E record: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const handleFormBack = () => {
    setFormStepIndex((index) => Math.max(0, index - 1));
  };

  const handleFormNext = () => {
    setFormStepIndex((index) => Math.min(FORM_STEPS.length - 1, index + 1));
  };

  const handleDelete = async (record) => {
    const confirmed = await popup.confirm({
      title: 'Delete M&E record',
      message: `Delete M&E record for "${record.projectName}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;
    try {
      await deleteRecord(record.id).unwrap();
      popup.toast.success('M&E record deleted.');
    } catch (err) {
      popup.toast.error('Failed to delete M&E record: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const handleExport = (format) => {
    popup.toast.info(`${format} export is prepared from the reports module.`);
  };

  const errorMessage = error ? getNgoErrorMessage(error, 'Failed to fetch monitoring records') : null;
  const isView = modalMode === 'view';
  const activeFormStep = FORM_STEPS[formStepIndex];
  const activeWorkspaceModule =
    WORKSPACE_MODULES.find((module) => module.id === activeModule) || WORKSPACE_MODULES[0];
  const ActiveModuleIcon = activeWorkspaceModule.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <BarChart3 size={18} />
            <span>Monitoring & Evaluation</span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">Professional M&E Workspace</h1>
          <p className="mt-1 text-slate-600">
            Create records with New Project Record, then select a record and browse M&E modules to review what was saved.
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
        <StatCard icon={FileSpreadsheet} label="Budget utilization" value={formatPercentDisplay(totals.budgetUtilization)} caption={`${currency(totals.expense)} of ${currency(totals.budget)}`} />
        <StatCard icon={CheckCircle2} label="Activities completed" value={formatPercentDisplay(totals.activityCompletion)} caption={`Average progress across ${totals.activities || 0} ${totals.activities === 1 ? 'activity' : 'activities'}`} />
        <StatCard icon={TrendingUp} label="Project performance" value={formatPercentDisplay(totals.performance)} caption={`${formatPercentDisplay(totals.projectCompletion)} average completion`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4">
        <aside className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="text-lg font-bold text-slate-900">M&E Modules</h2>
          <p className="mt-1 text-sm text-slate-500">Select a record, then open each section to review saved details.</p>
          <div className="mt-4 space-y-1">
            {WORKSPACE_MODULES.map((module) => {
              const Icon = module.icon;
              const active = activeModule === module.id;
              const disabled = !selectedWorkspaceRecord;
              return (
                <button
                  key={module.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${
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
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50/80 p-4">
            <label className="block text-sm font-semibold text-emerald-950 mb-2">M&E record</label>
            <select
              value={selectedWorkspaceRecordId}
              onChange={(e) => setSelectedWorkspaceRecordId(e.target.value)}
              className={NGO_INPUT_CLASS}
            >
              <option value="">Select a record to view…</option>
              {records.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.projectName || 'Untitled project'} ({record.projectCode || record.projectId || record.id})
                </option>
              ))}
            </select>
            {selectedWorkspaceRecord && (
              <p className="mt-2 text-xs text-emerald-800">
                {orgById[selectedWorkspaceRecord.organizationId]?.name || 'Organization'} · {selectedWorkspaceRecord.status || 'Planning'}
                {selectedWorkspaceRecord.program ? ` · ${selectedWorkspaceRecord.program}` : ''}
              </p>
            )}
          </div>

          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                <ActiveModuleIcon size={18} />
                <span>{activeWorkspaceModule.label}</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {selectedWorkspaceRecord ? activeWorkspaceModule.label : 'Select a record'}
              </h2>
              <p className="text-sm text-slate-500">
                {selectedWorkspaceRecord
                  ? `Saved data from New Project Record for ${selectedWorkspaceRecord.projectName || 'this project'}.`
                  : 'Choose an M&E record above, or pick one from the table below, then browse modules on the left.'}
              </p>
            </div>
            {selectedWorkspaceRecord && (
              <button
                type="button"
                onClick={() => openRecord(selectedWorkspaceRecord, 'edit', activeWorkspaceModule.id)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-semibold shrink-0"
              >
                <Edit size={17} />
                Edit {activeWorkspaceModule.label}
              </button>
            )}
          </div>

          {!selectedWorkspaceRecord && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-14 px-6 text-center">
              <ClipboardList className="mx-auto text-slate-400 mb-3" size={40} />
              <p className="text-slate-700 font-medium">No record selected</p>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                {records.length
                  ? 'Select a record from the dropdown, or click a row in the table below to load its M&E details.'
                  : 'Create your first M&E record with New Project Record, then return here to review it by module.'}
              </p>
              {!records.length && (
                <button type="button" onClick={openAdd} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center gap-2 text-sm font-semibold">
                  <Plus size={17} />
                  New Project Record
                </button>
              )}
            </div>
          )}

          {selectedWorkspaceRecord && (
            <MeRecordModuleView
              record={selectedWorkspaceRecord}
              moduleId={activeWorkspaceModule.id}
              orgById={orgById}
            />
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
                {filteredRecords.map((record) => {
                  const metrics = deriveMeMetrics(record);
                  return (
                  <tr
                    key={record.id}
                    onClick={() => selectWorkspaceRecord(record)}
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                      selectedWorkspaceRecordId === record.id ? 'bg-emerald-50 ring-1 ring-inset ring-emerald-200' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{record.projectName || 'Untitled project'}</div>
                      <div className="text-xs text-slate-500">{record.projectCode || record.projectId || 'No ID'} - {orgById[record.organizationId]?.name || 'Organization not set'}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      <div>{record.program || 'Not specified'}</div>
                      <div className="text-xs text-slate-500">{record.donor || 'No donor/funder'}</div>
                    </td>
                    <td className="px-5 py-4 min-w-[180px]">
                      <MiniBar label="Performance" value={metrics.performance} />
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      <div>{currency(record.budget)}</div>
                      <div className="text-xs text-slate-500">Expense {currency(metrics.expense)}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {metrics.beneficiariesReached.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {record.branchRegion || record.targetArea || 'Not mapped'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(record.status)}`}>{record.status || 'Planning'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectWorkspaceRecord(record);
                            const moduleId = selectedWorkspaceRecordId === record.id ? activeWorkspaceModule.id : 'outcomes';
                            openRecord(record, 'edit', moduleId);
                          }}
                          title="Edit"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <Edit size={17} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(record); }} title="Delete" className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
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
        onSaveAndContinue={handleSaveAndContinue}
        saving={saving}
        stepIndex={formStepIndex}
        onBack={handleFormBack}
        onNext={handleFormNext}
      >
        <NGOFormGrid>
          {activeFormStep.id === 'project' && (
            <>
          <div className="md:col-span-2 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-900">Project Information</h3>
            <p className="text-sm text-slate-500">
              {formData.projectId
                ? 'Review project details loaded from the linked project.'
                : 'Select an organization and linked project to continue.'}
            </p>
          </div>
          <NGOFormField label="Organization" required>
            <select disabled={isView} value={formData.organizationId} onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })} className={NGO_INPUT_CLASS}>
              <option value="">Select organization</option>
              {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
            </select>
          </NGOFormField>
          <NGOFormField label="Linked Project" required>
            <select disabled={isView} value={formData.projectId} onChange={(e) => handleProjectChange(e.target.value)} className={NGO_INPUT_CLASS}>
              <option value="">Select project</option>
              {projects.map((project) => {
                const taken = getExistingRecordForProject(
                  project.id,
                  modalMode === 'edit' ? selectedRecord?.id : undefined
                );
                return (
                  <option key={project.id} value={project.id} disabled={Boolean(taken)}>
                    {project.name}{taken ? ' (M&E record exists)' : ''}
                  </option>
                );
              })}
            </select>
          </NGOFormField>
          {!formData.projectId && !isView && (
            <p className="md:col-span-2 text-sm text-slate-500 text-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
              Choose a linked project to show project details.
            </p>
          )}
          {formData.projectId && (
            <>
          {[
            ['Project ID', 'projectCode'],
            ['Project Name', 'projectName'],
            ['Program Area', 'program'],
            ['Project Manager', 'projectManager'],
            ['Donor / Funder', 'donor']
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
            </>
          )}
            </>
          )}

          {activeFormStep.id === 'outcomes' && (
            <>
          <div className="md:col-span-2 border-b border-slate-200 pb-3">
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
            </>
          )}

          {activeFormStep.id === 'indicators' && (
          <ArrayEditor title="Indicators Management" items={formData.indicators} onChange={(items) => setFormData({ ...formData, indicators: items })} template={blankIndicator}>
            {(item, _index, update) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NGOFormField label="Indicator Name">
                  <input disabled={isView} value={item.name || ''} onChange={(e) => update({ name: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Indicator Type">
                  <select disabled={isView} value={item.type || ''} onChange={(e) => update({ type: e.target.value })} className={NGO_INPUT_CLASS}>
                    <option value="">Select type</option>
                    {INDICATOR_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </NGOFormField>
                <NGOFormField label="Unit of Measure">
                  <select disabled={isView} value={item.unit || ''} onChange={(e) => update({ unit: e.target.value })} className={NGO_INPUT_CLASS}>
                    <option value="">Select unit</option>
                    {UNIT_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </NGOFormField>
                <NGOFormField label="Data Collection Frequency">
                  <select disabled={isView} value={item.frequency || ''} onChange={(e) => update({ frequency: e.target.value })} className={NGO_INPUT_CLASS}>
                    <option value="">Select frequency</option>
                    {FREQUENCY_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </NGOFormField>
                <NGOFormField label="Description" colSpan={2}>
                  <textarea disabled={isView} rows={2} value={item.description || ''} onChange={(e) => update({ description: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Baseline Value">
                  <input disabled={isView} type="number" value={item.baseline ?? ''} onChange={(e) => update({ baseline: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Target Value">
                  <input disabled={isView} type="number" value={item.target ?? ''} onChange={(e) => update({ target: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Current Value">
                  <input disabled={isView} type="number" value={item.current ?? ''} onChange={(e) => update({ current: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
              </div>
            )}
          </ArrayEditor>
          )}

          {activeFormStep.id === 'activities' && (
          <ArrayEditor title="Activity Tracking" items={formData.activities} onChange={(items) => setFormData({ ...formData, activities: items })} template={blankActivity}>
            {(item, _index, update) => {
              const assignedValue = item.assignedStaff || '';
              const staffNames = activeStaff.map((member) => staffDisplayName(member)).filter(Boolean);
              const hasLegacyStaff = assignedValue && !staffNames.includes(assignedValue);
              return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NGOFormField label="Activity Name">
                  <input disabled={isView} value={item.name || ''} onChange={(e) => update({ name: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Assigned Staff" hint={!staffOrgId ? 'Select an organization on Project Information to load staff.' : undefined}>
                  <select
                    disabled={isView || !staffOrgId}
                    value={assignedValue}
                    onChange={(e) => update({ assignedStaff: e.target.value })}
                    className={NGO_INPUT_CLASS}
                  >
                    <option value="">{staffOrgId ? 'Select staff member' : 'Select organization first'}</option>
                    {hasLegacyStaff ? <option value={assignedValue}>{assignedValue}</option> : null}
                    {activeStaff.map((member) => {
                      const name = staffDisplayName(member);
                      if (!name) return null;
                      return (
                        <option key={member.id} value={name}>
                          {staffOptionLabel(member)}
                        </option>
                      );
                    })}
                  </select>
                </NGOFormField>
                <NGOFormField label="Status">
                  <select disabled={isView} value={item.status || ''} onChange={(e) => update({ status: e.target.value })} className={NGO_INPUT_CLASS}>
                    <option value="">Select status</option>
                    {ACTIVITY_STATUS_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </NGOFormField>
                <NGOFormField label="Progress %">
                  <input disabled={isView} type="number" min={0} max={100} value={item.progress ?? ''} onChange={(e) => update({ progress: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Description" colSpan={2}>
                  <textarea disabled={isView} rows={2} value={item.description || ''} onChange={(e) => update({ description: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Start Date">
                  <input disabled={isView} type="date" value={item.startDate || ''} onChange={(e) => update({ startDate: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="End Date">
                  <input disabled={isView} type="date" value={item.endDate || ''} onChange={(e) => update({ endDate: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Budget Used">
                  <input disabled={isView} type="number" value={item.budgetUsed ?? ''} onChange={(e) => update({ budgetUsed: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
              </div>
              );
            }}
          </ArrayEditor>
          )}

          {activeFormStep.id === 'beneficiaries' && (
          <ArrayEditor title="Beneficiary Tracking" items={formData.beneficiaries} onChange={(items) => setFormData({ ...formData, beneficiaries: items })} template={blankBeneficiary}>
            {(item, _index, update) => {
              const genderValue = item.gender || '';
              const hasLegacyGender = genderValue && !GENDER_OPTIONS.includes(genderValue);
              return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NGOFormField label="Beneficiary Name">
                  <input disabled={isView} value={item.name || ''} onChange={(e) => update({ name: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Category">
                  <input disabled={isView} value={item.category || ''} onChange={(e) => update({ category: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Location">
                  <input disabled={isView} value={item.location || ''} onChange={(e) => update({ location: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Gender">
                  <select disabled={isView} value={genderValue} onChange={(e) => update({ gender: e.target.value })} className={NGO_INPUT_CLASS}>
                    <option value="">Select gender</option>
                    {hasLegacyGender ? <option value={genderValue}>{genderValue}</option> : null}
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </NGOFormField>
                <NGOFormField label="Age Group">
                  <input disabled={isView} value={item.ageGroup || ''} onChange={(e) => update({ ageGroup: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Number Reached">
                  <input disabled={isView} type="number" min={0} value={item.numberReached ?? ''} onChange={(e) => update({ numberReached: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
              
              </div>
              );
            }}
          </ArrayEditor>
          )}

          {activeFormStep.id === 'visits' && (
          <ArrayEditor title="Field Visits" items={formData.fieldVisits} onChange={(items) => setFormData({ ...formData, fieldVisits: items })} template={blankFieldVisit}>
            {(item, _index, update) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NGOFormField label="Visit Date">
                  <input disabled={isView} type="date" value={item.visitDate || ''} onChange={(e) => update({ visitDate: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Field Officer">
                  <input disabled={isView} value={item.fieldOfficer || ''} onChange={(e) => update({ fieldOfficer: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Location">
                  <input disabled={isView} value={item.location || ''} onChange={(e) => update({ location: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Purpose">
                  <input disabled={isView} value={item.purpose || ''} onChange={(e) => update({ purpose: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Findings" colSpan={2}>
                  <textarea disabled={isView} rows={2} value={item.findings || ''} onChange={(e) => update({ findings: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Recommendations" colSpan={2}>
                  <textarea disabled={isView} rows={2} value={item.recommendations || ''} onChange={(e) => update({ recommendations: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Photos" colSpan={2}>
                  <input disabled={isView} value={item.photos || ''} onChange={(e) => update({ photos: e.target.value })} className={NGO_INPUT_CLASS} placeholder="URLs or file references" />
                </NGOFormField>
                <NGOFormField label="Signatures" colSpan={2}>
                  <input disabled={isView} value={item.signatures || ''} onChange={(e) => update({ signatures: e.target.value })} className={NGO_INPUT_CLASS} placeholder="Officer or beneficiary signatures" />
                </NGOFormField>
              </div>
            )}
          </ArrayEditor>
          )}

          {activeFormStep.id === 'risks' && (
            <>
          <ArrayEditor title="Risk & Issue Tracking" items={formData.riskIssues} onChange={(items) => setFormData({ ...formData, riskIssues: items })} template={blankRisk}>
            {(item, _index, update) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <NGOFormField label="Severity">
                  <select disabled={isView} value={item.severity || ''} onChange={(e) => update({ severity: e.target.value })} className={NGO_INPUT_CLASS}>
                    <option value="">Select severity</option>
                    {SEVERITY_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </NGOFormField>
                <NGOFormField label="Status">
                  <input disabled={isView} value={item.status || ''} onChange={(e) => update({ status: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Responsible Person">
                  <input disabled={isView} value={item.responsiblePerson || ''} onChange={(e) => update({ responsiblePerson: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Risk Description" colSpan={2}>
                  <textarea disabled={isView} rows={2} value={item.description || ''} onChange={(e) => update({ description: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
                <NGOFormField label="Mitigation Plan" colSpan={2}>
                  <textarea disabled={isView} rows={2} value={item.mitigationPlan || ''} onChange={(e) => update({ mitigationPlan: e.target.value })} className={NGO_INPUT_CLASS} />
                </NGOFormField>
              </div>
            )}
          </ArrayEditor>
          <NGOFormField label="Notes" colSpan={2}><textarea disabled={isView} rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={NGO_INPUT_CLASS} placeholder="Additional M&E notes or observations" /></NGOFormField>
            </>
          )}
        </NGOFormGrid>
      </DrawerShell>
    </div>
  );
}
