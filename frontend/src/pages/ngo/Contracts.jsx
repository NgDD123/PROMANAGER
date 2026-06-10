import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
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
  useGetNgoDiamondFormsQuery,
  useGetNgoDiamondOptionsQuery,
  useGetNgoDiamondSectionsQuery,
  useGetNgoMeModuleAssignmentsQuery,
  useUpsertNgoMeModuleAssignmentsMutation,
  useGetNgoUsersQuery,
  getNgoErrorMessage
} from '../../store/actions/ngo.js';
import { NGOFormField, NGOFormGrid, NGO_INPUT_CLASS } from '../../components/ngo/NGOModal.jsx';
import { DiamondFormRenderer } from '../../components/ngo/DiamondFormRenderer.jsx';
import {
  EVALUATION_MODULES,
  ME_DIAMOND_MODULE_CONFIG,
  MeEvaluationWorkspace,
  normalizeMeModuleAssignments,
  buildStaffEvaluatorOptions,
  resolveStaffEvaluatorLabel,
} from '../../components/ngo/MeEvaluationModules.jsx';
import { isNgoAdminUser } from '../../config/ngoNavigationScopes.js';
import { getServiceUser } from '../../utils/authCookies.js';
import { resolveNgoTenantOrganization } from '../../utils/ngoTenant.js';
import {
  normalizeDiamondResponses,
  usageLabel,
} from '../../utils/diamondForm.js';
import {
  aggregateMeMetrics,
  deriveMeMetrics,
  formatPercentDisplay,
  formatUtilizationPercent
} from '../../utils/meMetrics.js';
import { usePopup } from '../../context/PopupContext.jsx';

const STATUS_OPTIONS = ['Planning', 'Ongoing', 'Active', 'Completed', 'On Hold', 'Closed'];
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
  { id: 'risks', label: 'Risks & Notes', icon: ShieldAlert }
];

const WORKSPACE_MODULES = EVALUATION_MODULES;

const blankIndicator = {
  name: '',
  type: '',
  description: '',
  unit: '',
  frequency: ''
};

const blankActivity = {
  name: '',
  description: '',
  assignedStaff: '',
  startDate: '',
  endDate: '',
  status: '',
  progress: ''
};

const blankBeneficiary = {
  name: '',
  category: '',
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
  outcomesFormId: '',
  outcomesResponses: {},
  indicatorsFormId: '',
  indicatorsResponses: {},
  activitiesFormId: '',
  activitiesResponses: {},
  beneficiariesFormId: '',
  beneficiariesResponses: {},
  risksFormId: '',
  risksResponses: {},
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
    riskIssues: record.riskIssues?.length ? record.riskIssues : [{ ...blankRisk }],
    outcomesFormId: record.outcomesFormId || '',
    outcomesResponses: record.outcomesResponses && typeof record.outcomesResponses === 'object'
      ? record.outcomesResponses
      : {},
    indicatorsFormId: record.indicatorsFormId || '',
    indicatorsResponses: record.indicatorsResponses && typeof record.indicatorsResponses === 'object'
      ? record.indicatorsResponses
      : {},
    activitiesFormId: record.activitiesFormId || '',
    activitiesResponses: record.activitiesResponses && typeof record.activitiesResponses === 'object'
      ? record.activitiesResponses
      : {},
    beneficiariesFormId: record.beneficiariesFormId || '',
    beneficiariesResponses: record.beneficiariesResponses && typeof record.beneficiariesResponses === 'object'
      ? record.beneficiariesResponses
      : {},
    risksFormId: record.risksFormId || '',
    risksResponses: record.risksResponses && typeof record.risksResponses === 'object'
      ? record.risksResponses
      : {},
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
  outcomes: ['outcomesFormId', 'outcomesResponses'],
  indicators: ['indicatorsFormId', 'indicatorsResponses'],
  activities: ['activitiesFormId', 'activitiesResponses'],
  beneficiaries: ['beneficiariesFormId', 'beneficiariesResponses'],
  risks: ['risksFormId', 'risksResponses', 'notes'],
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
    indicators: form.indicators.map(({ indicatorId: _indicatorId, baseline: _baseline, target: _target, current: _current, ...item }) => item),
    activities: form.activities.map(({ budgetUsed: _budgetUsed, ...item }) => ({
      ...item,
      progress:
        item.progress === '' || item.progress == null || item.progress === undefined
          ? ''
          : Number(item.progress)
    })),
    beneficiaries: form.beneficiaries.map(({ beneficiaryId: _beneficiaryId, location: _location, ...item }) => ({
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

function MeDiamondFormModuleFields({
  config,
  moduleId,
  formData,
  setFormData,
  diamondForms = [],
  diamondSections = [],
  diamondOptions = [],
  isView = false,
  onCreateForm,
  onAssignTemplate,
  assignedEvaluatorId = '',
  staffMembers = [],
  onAssignEvaluator,
}) {
  const moduleForms = useMemo(
    () => diamondForms.filter((form) => form.usage === config.usage),
    [diamondForms, config.usage]
  );
  const staffOptions = useMemo(
    () => buildStaffEvaluatorOptions(staffMembers),
    [staffMembers]
  );
  const assignedEvaluatorLabel = useMemo(
    () => resolveStaffEvaluatorLabel(staffMembers, assignedEvaluatorId),
    [staffMembers, assignedEvaluatorId]
  );
  const [pendingEvaluatorId, setPendingEvaluatorId] = useState(assignedEvaluatorId);

  useEffect(() => {
    setPendingEvaluatorId(assignedEvaluatorId);
  }, [assignedEvaluatorId, moduleId]);

  const selectedFormId = formData[config.formIdKey] || '';
  const selectedForm = useMemo(
    () => diamondForms.find((form) => form.id === selectedFormId) || null,
    [diamondForms, selectedFormId]
  );
  const selectedSections = useMemo(
    () => diamondSections.filter((section) =>
      (selectedForm?.sectionIds || []).includes(section.id)
    ),
    [diamondSections, selectedForm]
  );
  const usageName = usageLabel(config.usage);

  return (
    <>
      <div className="md:col-span-2 border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-900">{config.title}</h3>
        <p className="text-sm text-slate-500">{config.description}</p>
      </div>
      <NGOFormField
        label="Form template"
        colSpan={2}
        required
        hint={
          onAssignTemplate
            ? `Selecting a template assigns it for ${usageName} evaluations across M&E records.`
            : `Create templates under Diamond Forms with usage set to ${usageName}.`
        }
      >
        <select
          disabled={isView}
          value={selectedFormId}
          onChange={(e) => {
            const nextFormId = e.target.value;
            const nextForm = diamondForms.find((form) => form.id === nextFormId);
            setFormData({
              ...formData,
              [config.formIdKey]: nextFormId,
              [config.responsesKey]: nextForm
                ? normalizeDiamondResponses(nextForm, {})
                : {},
            });
            if (nextFormId && moduleId) {
              onAssignTemplate?.(moduleId, nextFormId, pendingEvaluatorId);
            }
          }}
          className={NGO_INPUT_CLASS}
        >
          <option value="">Select a diamond form</option>
          {moduleForms.map((form) => (
            <option key={form.id} value={form.id}>{form.title}</option>
          ))}
        </select>
      </NGOFormField>
      {onAssignEvaluator ? (
        <NGOFormField
          label="Evaluator"
          colSpan={2}
          hint={
            selectedFormId
              ? 'Choose the staff member responsible for reviewing this module.'
              : 'Select a form template first, then assign an evaluator.'
          }
        >
          <select
            disabled={isView || !selectedFormId}
            value={pendingEvaluatorId}
            onChange={(e) => {
              const nextEvaluatorId = e.target.value;
              setPendingEvaluatorId(nextEvaluatorId);
              onAssignEvaluator?.(moduleId, nextEvaluatorId, selectedFormId);
            }}
            className={NGO_INPUT_CLASS}
          >
            <option value="">Select evaluator</option>
            {staffOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </NGOFormField>
      ) : assignedEvaluatorLabel ? (
        <NGOFormField label="Evaluator" colSpan={2}>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
            {assignedEvaluatorLabel}
          </p>
        </NGOFormField>
      ) : null}
      {!selectedFormId && !isView ? (
        <div className="md:col-span-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 space-y-3">
          <p className="text-sm text-slate-600">
            {moduleForms.length
              ? `No form selected yet. Pick an existing ${usageName} template, or create a new one.`
              : `No ${usageName} form templates yet. Create one in Diamond Forms to capture this module.`}
          </p>
          <button
            type="button"
            onClick={() => onCreateForm?.(config.usage)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            <Plus size={16} />
            Create form template
          </button>
        </div>
      ) : null}
      {selectedForm ? (
        <div className="md:col-span-2">
          <DiamondFormRenderer
            form={selectedForm}
            sections={selectedSections}
            options={diamondOptions}
            responses={normalizeDiamondResponses(selectedForm, formData[config.responsesKey])}
            onChange={(responses) => setFormData({ ...formData, [config.responsesKey]: responses })}
            disabled={isView}
          />
        </div>
      ) : null}
    </>
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

function meDrawerCopy(mode, projectName) {
  if (mode === 'add') {
    return {
      badge: 'Adding',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'New Project Record',
      subtitle: 'Create a monitoring record for a linked project',
    };
  }
  if (mode === 'edit') {
    return {
      badge: 'Editing',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      title: 'Edit Project Record',
      subtitle: projectName ? `Updating ${projectName}` : 'Update saved record details',
    };
  }
  return {
    badge: 'Viewing',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    title: 'Project Record Details',
    subtitle: projectName || 'Review saved record information',
  };
}

function DrawerShell({
  open,
  mode,
  projectName,
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
  const isAdd = mode === 'add';
  const isLastStep = stepIndex >= FORM_STEPS.length - 1;
  const isFirstStep = stepIndex === 0;
  const copy = meDrawerCopy(mode, projectName);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl flex flex-col">
        <div className="shrink-0 border-b border-slate-200 px-5 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${copy.badgeClass}`}>
                {copy.badge}
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900">{copy.title}</h2>
            {copy.subtitle ? <p className="text-sm text-slate-500 mt-1">{copy.subtitle}</p> : null}
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
                {isLastStep ? (isAdd ? 'Create Record' : 'Save Changes') : 'Save & Continue'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Contracts() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const user = getServiceUser('ngo');
  const isAdmin = isNgoAdminUser(user);

  const listParams = useMemo(() => {
    const params = {};
    if (filterOrg) params.organizationId = filterOrg;
    if (filterStatus) params.status = filterStatus;
    return params;
  }, [filterOrg, filterStatus]);

  const { data: organizations = [] } = useGetNgoOrganizationsQuery();
  const { tenantOrganizationId, tenantOrganizationName } = resolveNgoTenantOrganization(organizations);
  const { data: projects = [] } = useGetNgoProjectsQuery(
    (filterOrg || tenantOrganizationId) ? { organizationId: filterOrg || tenantOrganizationId } : undefined
  );
  const { data: records = [], isLoading, error, refetch } = useGetNgoContractsQuery(listParams);
  const { data: summary } = useGetNgoMonitoringSummaryQuery(listParams);
  const assignmentOrgId = filterOrg || tenantOrganizationId;
  const { data: assignmentRecord } = useGetNgoMeModuleAssignmentsQuery(
    assignmentOrgId ? { organizationId: assignmentOrgId } : undefined,
    { skip: !assignmentOrgId }
  );
  const [upsertAssignments] = useUpsertNgoMeModuleAssignmentsMutation();
  const moduleAssignments = useMemo(
    () => normalizeMeModuleAssignments(assignmentRecord?.assignments),
    [assignmentRecord?.assignments]
  );
  const { data: staffMembers = [] } = useGetNgoUsersQuery(
    assignmentOrgId ? { organizationId: assignmentOrgId } : undefined,
    { skip: !assignmentOrgId }
  );
  const selectedWorkspaceRecord = records.find((record) => record.id === selectedWorkspaceRecordId) || null;
  const diamondListParams = useMemo(() => {
    const organizationId =
      selectedWorkspaceRecord?.organizationId || filterOrg || tenantOrganizationId;
    return organizationId ? { organizationId } : {};
  }, [selectedWorkspaceRecord?.organizationId, filterOrg, tenantOrganizationId]);
  const diamondOrgId = diamondListParams.organizationId;
  const { data: diamondForms = [] } = useGetNgoDiamondFormsQuery(diamondListParams, {
    skip: !diamondOrgId,
  });
  const { data: diamondOptions = [] } = useGetNgoDiamondOptionsQuery(diamondListParams, {
    skip: !diamondOrgId,
  });
  const { data: diamondSections = [] } = useGetNgoDiamondSectionsQuery(diamondListParams, {
    skip: !diamondOrgId,
  });
  const openDiamondFormCreator = (usage) => {
    navigate(`/ngo/diamond-forms?usage=${encodeURIComponent(usage)}&action=create`);
  };
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

  const selectWorkspaceRecord = (record) => {
    if (record?.id) setSelectedWorkspaceRecordId(record.id);
  };

  const handleAssignTemplate = async (moduleId, formId, evaluatorId = '') => {
    if (!isAdmin || !assignmentOrgId || !formId) return;
    const current = normalizeMeModuleAssignments(assignmentRecord?.assignments);
    try {
      await upsertAssignments({
        organizationId: assignmentOrgId,
        assignments: {
          ...current,
          [moduleId]: {
            formId,
            evaluatorId: evaluatorId || current[moduleId]?.evaluatorId || '',
          },
        },
      }).unwrap();
    } catch (err) {
      popup.toast.error(getNgoErrorMessage(err, 'Failed to assign form template'));
    }
  };

  const handleAssignEvaluator = async (moduleId, evaluatorId, formId = '') => {
    if (!isAdmin || !assignmentOrgId || !moduleId) return;
    const current = normalizeMeModuleAssignments(assignmentRecord?.assignments);
    try {
      await upsertAssignments({
        organizationId: assignmentOrgId,
        assignments: {
          ...current,
          [moduleId]: {
            formId: formId || current[moduleId]?.formId || '',
            evaluatorId: evaluatorId || '',
          },
        },
      }).unwrap();
    } catch (err) {
      popup.toast.error(getNgoErrorMessage(err, 'Failed to assign evaluator'));
    }
  };

  const openAdd = () => {
    const availableProject = projects.find((project) => !recordByProjectId[project.id]);
    setModalMode('add');
    setFormStepIndex(0);
    setSelectedRecord(null);
    setFormData({
      ...EMPTY_FORM,
      organizationId: tenantOrganizationId || availableProject?.organizationId || '',
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

  useEffect(() => {
    const { recordId, moduleId } = location.state || {};
    if (!recordId || !records.length) return;
    const record = records.find((entry) => entry.id === recordId);
    if (!record) return;
    setSelectedWorkspaceRecordId(recordId);
    if (moduleId) setActiveModule(moduleId);
    openRecord(record, 'edit', moduleId || 'outcomes');
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, records, location.pathname, navigate]);

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

    const stepPayload = buildStepPayload(
      { ...formData, organizationId: formData.organizationId || tenantOrganizationId },
      stepId
    );
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

      <MeEvaluationWorkspace
        records={records}
        orgById={orgById}
        diamondForms={diamondForms}
        diamondSections={diamondSections}
        diamondOptions={diamondOptions}
        moduleAssignments={moduleAssignments}
        staffMembers={staffMembers}
        selectedRecordId={selectedWorkspaceRecordId}
        onSelectRecordId={setSelectedWorkspaceRecordId}
        activeModuleId={activeModule}
        onSelectModuleId={setActiveModule}
        onEditModule={(record, moduleId) => openRecord(record, 'edit', moduleId)}
        getEditButtonLabel={(module) => `Edit ${module.label}`}
        sidebarTitle="M&E Modules"
        sidebarDescription="Select a record, then open each section to review saved details."
        emptyRecordsMessage={
          records.length
            ? 'Select a record from the dropdown, or click a row in the table below to load its M&E details.'
            : 'Create your first M&E record with New Project Record, then return here to review it by module.'
        }
        emptyRecordsAction={
          !records.length ? (
            <button type="button" onClick={openAdd} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center gap-2 text-sm font-semibold">
              <Plus size={17} />
              New Project Record
            </button>
          ) : null
        }
      />

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
        projectName={formData.projectName}
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
                : `Select a linked project for ${tenantOrganizationName} to continue.`}
            </p>
          </div>
          <NGOFormField label="Linked Project" required colSpan={2}>
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

          {ME_DIAMOND_MODULE_CONFIG[activeFormStep.id] ? (
            <MeDiamondFormModuleFields
              config={ME_DIAMOND_MODULE_CONFIG[activeFormStep.id]}
              moduleId={activeFormStep.id}
              formData={formData}
              setFormData={setFormData}
              diamondForms={diamondForms}
              diamondSections={diamondSections}
              diamondOptions={diamondOptions}
              isView={isView}
              onCreateForm={openDiamondFormCreator}
              onAssignTemplate={isAdmin ? handleAssignTemplate : undefined}
              assignedEvaluatorId={moduleAssignments[activeFormStep.id]?.evaluatorId || ''}
              staffMembers={staffMembers}
              onAssignEvaluator={isAdmin ? handleAssignEvaluator : undefined}
            />
          ) : null}

          {activeFormStep.id === 'risks' ? (
            <NGOFormField label="Notes" colSpan={2}>
              <textarea
                disabled={isView}
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={NGO_INPUT_CLASS}
                placeholder="Additional M&E notes or observations"
              />
            </NGOFormField>
          ) : null}
        </NGOFormGrid>
      </DrawerShell>
    </div>
  );
}
