import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  ClipboardList,
  Save,
  ShieldAlert,
  Target,
  Users,
} from 'lucide-react';
import { DiamondFormRenderer, DiamondFormResponseView } from './DiamondFormRenderer.jsx';
import { NGO_INPUT_CLASS } from './NGOModal.jsx';
import { normalizeDiamondResponses } from '../../utils/diamondForm.js';

export const EVALUATION_MODULES = [
  { id: 'outcomes', label: 'Objectives & Outcomes', icon: Target },
  { id: 'indicators', label: 'Indicators', icon: BarChart3 },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
  { id: 'risks', label: 'Risks & Notes', icon: ShieldAlert },
];

export const ME_DIAMOND_MODULE_CONFIG = {
  outcomes: {
    title: 'Objectives & Outcomes',
    description: 'Choose a Diamond Form template and fill in the dynamic fields defined for this module.',
    usage: 'outcomes',
    formIdKey: 'outcomesFormId',
    responsesKey: 'outcomesResponses',
    evaluatorResponsesKey: 'outcomesEvaluatorResponses',
    evaluatorSubmissionKey: 'outcomesEvaluatorSubmission',
  },
  indicators: {
    title: 'Indicators',
    description: 'Choose a Diamond Form template and capture indicator fields for this M&E record.',
    usage: 'indicators',
    formIdKey: 'indicatorsFormId',
    responsesKey: 'indicatorsResponses',
    evaluatorResponsesKey: 'indicatorsEvaluatorResponses',
    evaluatorSubmissionKey: 'indicatorsEvaluatorSubmission',
  },
  activities: {
    title: 'Activities',
    description: 'Choose a Diamond Form template and track activity details for this project.',
    usage: 'activities',
    formIdKey: 'activitiesFormId',
    responsesKey: 'activitiesResponses',
    evaluatorResponsesKey: 'activitiesEvaluatorResponses',
    evaluatorSubmissionKey: 'activitiesEvaluatorSubmission',
  },
  beneficiaries: {
    title: 'Beneficiaries',
    description: 'Choose a Diamond Form template and record beneficiary information.',
    usage: 'beneficiaries',
    formIdKey: 'beneficiariesFormId',
    responsesKey: 'beneficiariesResponses',
    evaluatorResponsesKey: 'beneficiariesEvaluatorResponses',
    evaluatorSubmissionKey: 'beneficiariesEvaluatorSubmission',
  },
  risks: {
    title: 'Risks & Notes',
    description: 'Choose a Diamond Form template and document risks, issues, and observations.',
    usage: 'risks',
    formIdKey: 'risksFormId',
    responsesKey: 'risksResponses',
    evaluatorResponsesKey: 'risksEvaluatorResponses',
    evaluatorSubmissionKey: 'risksEvaluatorSubmission',
  },
};

function currency(value) {
  return (Number(value) || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

function pct(value) {
  return `${Math.max(0, Math.min(100, Math.round(Number(value) || 0)))}%`;
}

function formatListValue(value) {
  if (Array.isArray(value)) return value.filter((item) => String(item || '').trim());
  if (typeof value === 'string' && value.trim()) {
    return value.split('\n').map((item) => item.trim()).filter(Boolean);
  }
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

function hasPopulatedDiamondResponses(responses = {}) {
  if (!responses || typeof responses !== 'object') return false;
  return Object.values(responses).some((value) => {
    if (Array.isArray(value)) return value.some((entry) => String(entry || '').trim());
    return String(value || '').trim().length > 0;
  });
}

export function recordUsesDiamondModule(record, config) {
  return Boolean(record[config.formIdKey]) || hasPopulatedDiamondResponses(record[config.responsesKey]);
}

export function emptyMeModuleAssignments() {
  return Object.fromEntries(
    EVALUATION_MODULES.map((module) => [module.id, { formId: '', evaluatorId: '' }])
  );
}

export function normalizeMeModuleAssignments(assignments) {
  const base = emptyMeModuleAssignments();
  if (!assignments || typeof assignments !== 'object') return base;
  EVALUATION_MODULES.forEach((module) => {
    const entry = assignments[module.id];
    if (!entry || typeof entry !== 'object') return;
    base[module.id] = {
      formId: entry.formId || '',
      evaluatorId: entry.evaluatorId || '',
    };
  });
  return base;
}

export function buildStaffEvaluatorOptions(staff = []) {
  return staff
    .filter((member) => {
      const status = String(member.accountStatus || member.status || 'Active').trim();
      return status === 'Active';
    })
    .map((member) => ({
      value: member.id,
      label: [member.fullName || member.name, member.jobTitle].filter(Boolean).join(' · ') || member.email || member.id,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function resolveStaffEvaluatorLabel(staff = [], evaluatorId = '', currentUser = null) {
  if (!evaluatorId) return '';
  const currentUserId = currentUser?.id || currentUser?.uid || '';
  if (currentUserId && currentUserId === evaluatorId) {
    return [currentUser.fullName || currentUser.name, currentUser.jobTitle]
      .filter(Boolean)
      .join(' · ') || currentUser.email || 'You';
  }
  const member = staff.find((entry) => entry.id === evaluatorId);
  if (!member) return '';
  return [member.fullName || member.name, member.jobTitle].filter(Boolean).join(' · ') || member.email || '';
}

export function getEvaluationModulesForUser(moduleAssignments, user, isAdmin = false) {
  if (isAdmin) return EVALUATION_MODULES;
  const userId = user?.id || user?.uid || '';
  if (!userId || !moduleAssignments) return [];
  return EVALUATION_MODULES.filter(
    (module) => moduleAssignments[module.id]?.evaluatorId === userId
  );
}

export function isCurrentUserModuleEvaluator(moduleAssignments, moduleId, user) {
  const userId = user?.id || user?.uid || '';
  if (!userId || !moduleId) return false;
  return moduleAssignments?.[moduleId]?.evaluatorId === userId;
}

export function resolveEvaluatorSubmission(record, config) {
  if (!record || !config) return null;
  const submission = record[config.evaluatorSubmissionKey];
  if (submission && typeof submission === 'object' && !Array.isArray(submission)) {
    return {
      responses: submission.responses || {},
      submittedAt: submission.submittedAt || '',
      submittedBy: submission.submittedBy || '',
    };
  }
  const legacyResponses = record[config.evaluatorResponsesKey];
  if (legacyResponses && typeof legacyResponses === 'object' && !Array.isArray(legacyResponses)) {
    return {
      responses: legacyResponses,
      submittedAt: '',
      submittedBy: '',
    };
  }
  return null;
}

export function hasEvaluatorSubmission(record, config) {
  const submission = resolveEvaluatorSubmission(record, config);
  return Boolean(submission && hasPopulatedDiamondResponses(submission.responses));
}

export function formatEvaluatorSubmittedAt(value) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function collectEvaluatorSubmissionRows({
  records = [],
  moduleId,
  moduleAssignments = null,
  staffMembers = [],
  diamondForms = [],
  filterRecordId = '',
}) {
  const config = ME_DIAMOND_MODULE_CONFIG[moduleId];
  if (!config) return [];

  const sourceRecords = filterRecordId
    ? records.filter((record) => record.id === filterRecordId)
    : records;

  return sourceRecords
    .map((record) => {
      const submission = resolveEvaluatorSubmission(record, config);
      if (!submission || !hasPopulatedDiamondResponses(submission.responses)) return null;

      const assignedEvaluatorId = moduleAssignments?.[moduleId]?.evaluatorId || '';
      const evaluatorId = submission.submittedBy || assignedEvaluatorId;
      const form =
        resolveAssignedFormForModule(moduleId, diamondForms, records, moduleAssignments)
        || resolveDiamondFormForRecord(record, config, diamondForms);

      return {
        id: `${record.id}-${moduleId}`,
        recordId: record.id,
        projectName: record.projectName || 'Untitled project',
        projectCode: record.projectCode || '',
        moduleLabel: EVALUATION_MODULES.find((module) => module.id === moduleId)?.label || moduleId,
        evaluatorLabel: resolveStaffEvaluatorLabel(staffMembers, evaluatorId) || 'Evaluator',
        submittedAt: submission.submittedAt,
        submittedAtLabel: formatEvaluatorSubmittedAt(submission.submittedAt),
        responses: submission.responses,
        form,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      const leftTime = new Date(left.submittedAt || 0).getTime();
      const rightTime = new Date(right.submittedAt || 0).getTime();
      return rightTime - leftTime;
    });
}

function EvaluatorSubmissionsTable({
  rows = [],
  diamondSections = [],
  diamondOptions = [],
  title = 'Evaluator submissions',
  emptyMessage = 'No evaluator submissions yet for this module.',
}) {
  const [expandedRowId, setExpandedRowId] = useState('');

  if (!rows.length) {
    return (
      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-6 text-center">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">Review what evaluators submitted and when.</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[720px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Project', 'Evaluator', 'Submitted', 'Actions'].map((heading) => (
                <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((row) => {
              const expanded = expandedRowId === row.id;
              const sections = diamondSections.filter((section) =>
                (row.form?.sectionIds || []).includes(section.id)
              );
              return (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <div className="font-medium">{row.projectName}</div>
                      {row.projectCode ? (
                        <div className="text-xs text-slate-500">{row.projectCode}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.evaluatorLabel}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.submittedAtLabel}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedRowId(expanded ? '' : row.id)}
                        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        {expanded ? 'Hide details' : 'View submission'}
                      </button>
                    </td>
                  </tr>
                  {expanded && row.form ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 bg-slate-50/80">
                        <DiamondFormResponseView
                          form={row.form}
                          sections={sections}
                          options={diamondOptions}
                          responses={row.responses}
                        />
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EvaluatorRecordForm({
  record,
  config,
  form,
  sections = [],
  options = [],
  onSave,
  saving = false,
}) {
  const submittedResponses = record[config.responsesKey] || {};
  const savedSubmission = resolveEvaluatorSubmission(record, config);
  const savedEvaluatorResponses = savedSubmission?.responses || {};
  const [responses, setResponses] = useState(() =>
    normalizeDiamondResponses(form, savedEvaluatorResponses)
  );

  useEffect(() => {
    const submission = resolveEvaluatorSubmission(record, config);
    setResponses(normalizeDiamondResponses(form, submission?.responses || {}));
  }, [record.id, record[config.evaluatorSubmissionKey], record[config.evaluatorResponsesKey], form, config]);

  const hasSubmittedData = recordUsesDiamondModule(record, config);
  const lastSubmittedLabel = savedSubmission?.submittedAt
    ? formatEvaluatorSubmittedAt(savedSubmission.submittedAt)
    : '';

  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {record.projectName || 'Untitled project'}
          {record.projectCode ? ` · ${record.projectCode}` : ''}
        </p>
        <p className="mt-1 text-xs text-slate-500">Complete your evaluation for this project.</p>
        {lastSubmittedLabel ? (
          <p className="mt-1 text-xs text-emerald-700">Last submitted: {lastSubmittedLabel}</p>
        ) : null}
      </div>

      {hasSubmittedData ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted data</p>
          <DiamondFormResponseView
            form={form}
            sections={sections}
            options={options}
            responses={submittedResponses}
          />
        </div>
      ) : null}

      <div className="rounded-lg border border-emerald-200 bg-white p-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Your evaluation</p>
        <DiamondFormRenderer
          form={form}
          sections={sections}
          options={options}
          responses={responses}
          onChange={setResponses}
          showHeader={false}
        />
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => onSave?.(record.id, responses)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save evaluation'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function resolveAssignedFormForModule(
  moduleId,
  diamondForms = [],
  records = [],
  moduleAssignments = null
) {
  const config = ME_DIAMOND_MODULE_CONFIG[moduleId];
  if (!config) return null;

  const assignedFormId = moduleAssignments?.[moduleId]?.formId;
  if (assignedFormId) {
    return diamondForms.find((form) => form.id === assignedFormId) || null;
  }

  const usageForms = diamondForms.filter((form) => form.usage === config.usage);
  if (!usageForms.length) return null;

  const linkedFormIds = records
    .map((record) => record[config.formIdKey])
    .filter(Boolean);
  const linkedForm = usageForms.find((form) => linkedFormIds.includes(form.id));
  return linkedForm || usageForms[0] || null;
}

function resolveDiamondFormForRecord(record, config, diamondForms = []) {
  const formId = record[config.formIdKey];
  if (formId) {
    return diamondForms.find((entry) => entry.id === formId) || null;
  }

  const responses = record[config.responsesKey] || {};
  const responseKeys = Object.keys(responses).filter((key) => {
    const value = responses[key];
    if (Array.isArray(value)) return value.some((entry) => String(entry || '').trim());
    return String(value || '').trim().length > 0;
  });
  if (!responseKeys.length) return null;

  const usageForms = diamondForms.filter((form) => form.usage === config.usage);
  return usageForms.find((form) =>
    responseKeys.every((key) => (form.fields || []).some((field) => field.id === key))
  ) || usageForms[0] || null;
}

function hasLegacyOutcomesData(record) {
  return Boolean(record.goal)
    || formatListValue(record.objectives).length > 0
    || formatListValue(record.expectedOutcomes).length > 0
    || formatListValue(record.expectedOutputs).length > 0
    || formatListValue(record.successCriteria).length > 0
    || formatListValue(record.assumptions).length > 0
    || formatListValue(record.risks).length > 0;
}

function MeDiamondModuleView({
  record,
  config,
  diamondForms = [],
  diamondSections = [],
  diamondOptions = [],
  emptyMessage,
  children = null,
}) {
  if (!recordUsesDiamondModule(record, config)) {
    return children || <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  const form = resolveDiamondFormForRecord(record, config, diamondForms);
  if (!form) {
    return <p className="text-sm text-slate-500">Form not available.</p>;
  }

  const sections = diamondSections.filter((section) =>
    (form.sectionIds || []).includes(section.id)
  );

  return (
    <DiamondFormResponseView
      form={form}
      sections={sections}
      options={diamondOptions}
      responses={record[config.responsesKey] || {}}
    />
  );
}

export function MeRecordModuleView({
  record,
  moduleId,
  orgById = {},
  diamondForms = [],
  diamondSections = [],
  diamondOptions = [],
}) {
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
      <MeDiamondModuleView
        record={record}
        config={ME_DIAMOND_MODULE_CONFIG.outcomes}
        diamondForms={diamondForms}
        diamondSections={diamondSections}
        diamondOptions={diamondOptions}
        emptyMessage="No objectives & outcomes were saved for this record."
      >
        {hasLegacyOutcomesData(record) ? (
          <dl className="space-y-4">
            <DetailField label="Project Goal" value={record.goal} />
            <DetailList label="Objectives" items={record.objectives} />
            <DetailList label="Expected Outcomes" items={record.expectedOutcomes} />
            <DetailList label="Expected Outputs" items={record.expectedOutputs} />
            <DetailList label="Success Criteria" items={record.successCriteria} />
            <DetailList label="Assumptions" items={record.assumptions} />
            <DetailList label="Risks (planning)" items={record.risks} />
          </dl>
        ) : null}
      </MeDiamondModuleView>
    );
  }

  if (moduleId === 'indicators') {
    const legacyRows = (record.indicators || []).filter((item) => isPopulatedRow(item));
    return (
      <MeDiamondModuleView
        record={record}
        config={ME_DIAMOND_MODULE_CONFIG.indicators}
        diamondForms={diamondForms}
        diamondSections={diamondSections}
        diamondOptions={diamondOptions}
        emptyMessage="No indicators were saved for this record."
      >
        {legacyRows.length ? (
          <div className="space-y-3">
            {legacyRows.map((item, index) => (
              <DetailCard key={index} title={item.name || `Indicator ${index + 1}`}>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <DetailField label="Indicator Type" value={item.type} />
                  <DetailField label="Unit of Measure" value={item.unit} />
                  <DetailField label="Data Collection Frequency" value={item.frequency} />
                  <DetailField label="Description" value={item.description} />
                </dl>
              </DetailCard>
            ))}
          </div>
        ) : null}
      </MeDiamondModuleView>
    );
  }

  if (moduleId === 'activities') {
    const legacyRows = (record.activities || []).filter((item) => isPopulatedRow(item));
    return (
      <MeDiamondModuleView
        record={record}
        config={ME_DIAMOND_MODULE_CONFIG.activities}
        diamondForms={diamondForms}
        diamondSections={diamondSections}
        diamondOptions={diamondOptions}
        emptyMessage="No activities were saved for this record."
      >
        {legacyRows.length ? (
          <div className="space-y-3">
            {legacyRows.map((item, index) => (
              <DetailCard key={index} title={item.name || `Activity ${index + 1}`}>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <DetailField label="Activity Name" value={item.name} />
                  <DetailField label="Assigned Staff" value={item.assignedStaff} />
                  <DetailField label="Status" value={item.status} />
                  <DetailField label="Progress %" value={item.progress != null && item.progress !== '' ? pct(item.progress) : '—'} />
                  <DetailField label="Start Date" value={item.startDate} />
                  <DetailField label="End Date" value={item.endDate} />
                  <DetailField label="Description" value={item.description} />
                </dl>
              </DetailCard>
            ))}
          </div>
        ) : null}
      </MeDiamondModuleView>
    );
  }

  if (moduleId === 'beneficiaries') {
    const legacyRows = (record.beneficiaries || []).filter((item) => isPopulatedRow(item));
    return (
      <MeDiamondModuleView
        record={record}
        config={ME_DIAMOND_MODULE_CONFIG.beneficiaries}
        diamondForms={diamondForms}
        diamondSections={diamondSections}
        diamondOptions={diamondOptions}
        emptyMessage="No beneficiaries were saved for this record."
      >
        {legacyRows.length ? (
          <div className="space-y-3">
            {legacyRows.map((item, index) => (
              <DetailCard key={index} title={item.name || `Beneficiary ${index + 1}`}>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <DetailField label="Beneficiary Name" value={item.name} />
                  <DetailField label="Category" value={item.category} />
                  <DetailField label="Services Received" value={item.servicesReceived} />
                  <DetailField label="Gender" value={item.gender} />
                  <DetailField label="Age Group" value={item.ageGroup} />
                  <DetailField label="Number Reached" value={item.numberReached} />
                </dl>
              </DetailCard>
            ))}
          </div>
        ) : null}
      </MeDiamondModuleView>
    );
  }

  if (moduleId === 'risks') {
    const legacyRows = (record.riskIssues || []).filter((item) => isPopulatedRow(item));
    return (
      <div className="space-y-4">
        <MeDiamondModuleView
          record={record}
          config={ME_DIAMOND_MODULE_CONFIG.risks}
          diamondForms={diamondForms}
          diamondSections={diamondSections}
          diamondOptions={diamondOptions}
          emptyMessage="No risks & notes were saved for this record."
        >
          {legacyRows.length ? (
            <div className="space-y-3">
              {legacyRows.map((item, index) => (
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
          ) : null}
        </MeDiamondModuleView>
        {recordUsesDiamondModule(record, ME_DIAMOND_MODULE_CONFIG.risks) || legacyRows.length
          ? <DetailField label="Notes" value={record.notes} />
          : null}
      </div>
    );
  }

  return null;
}

export function MeEvaluationWorkspace({
  records = [],
  orgById = {},
  diamondForms = [],
  diamondSections = [],
  diamondOptions = [],
  moduleAssignments = null,
  staffMembers = [],
  selectedRecordId = '',
  onSelectRecordId,
  activeModuleId = 'outcomes',
  onSelectModuleId,
  onEditModule,
  getEditButtonLabel,
  sidebarTitle = 'Evaluation Modules',
  sidebarDescription = 'Select a project record, then open each section to review saved form data.',
  emptyRecordsMessage = 'Create M&E records in the Professional M&E Workspace to review evaluation forms here.',
  emptyRecordsAction = null,
}) {
  const selectedRecord = records.find((record) => record.id === selectedRecordId) || null;
  const activeModule = EVALUATION_MODULES.find((module) => module.id === activeModuleId) || EVALUATION_MODULES[0];
  const ActiveModuleIcon = activeModule.icon;
  const submissionRows = useMemo(
    () => collectEvaluatorSubmissionRows({
      records,
      moduleId: activeModuleId,
      moduleAssignments,
      staffMembers,
      diamondForms,
      filterRecordId: selectedRecordId,
    }),
    [records, activeModuleId, moduleAssignments, staffMembers, diamondForms, selectedRecordId]
  );

  const recordsWithModuleData = useMemo(() => {
    return records.filter((record) =>
      EVALUATION_MODULES.some((module) => {
        const config = ME_DIAMOND_MODULE_CONFIG[module.id];
        return recordUsesDiamondModule(record, config);
      })
    );
  }, [records]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4">
      <aside className="bg-white border border-slate-200 rounded-lg p-4">
        <h2 className="text-lg font-bold text-slate-900">{sidebarTitle}</h2>
        <p className="mt-1 text-sm text-slate-500">{sidebarDescription}</p>
        <div className="mt-4 space-y-1">
          {EVALUATION_MODULES.map((module) => {
            const Icon = module.icon;
            const active = activeModuleId === module.id;
            const disabled = !selectedRecord;
            return (
              <button
                key={module.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectModuleId?.(module.id)}
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
          <label className="block text-sm font-semibold text-emerald-950 mb-2">Project record</label>
          <select
            value={selectedRecordId}
            onChange={(e) => onSelectRecordId?.(e.target.value)}
            className={NGO_INPUT_CLASS}
          >
            <option value="">Select a record to view…</option>
            {records.map((record) => (
              <option key={record.id} value={record.id}>
                {record.projectName || 'Untitled project'} ({record.projectCode || record.projectId || record.id})
              </option>
            ))}
          </select>
          {selectedRecord && (
            <p className="mt-2 text-xs text-emerald-800">
              {orgById[selectedRecord.organizationId]?.name || 'Organization'} · {selectedRecord.status || 'Planning'}
              {selectedRecord.program ? ` · ${selectedRecord.program}` : ''}
            </p>
          )}
        </div>

        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <ActiveModuleIcon size={18} />
              <span>{activeModule.label}</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {selectedRecord ? activeModule.label : 'Select a record'}
            </h2>
            <p className="text-sm text-slate-500">
              {selectedRecord
                ? `Review evaluator submissions for ${selectedRecord.projectName || 'this project'}.`
                : 'Choose a project record above to review evaluator submissions.'}
            </p>
          </div>
          {selectedRecord && onEditModule ? (
            <button
              type="button"
              onClick={() => onEditModule(selectedRecord, activeModule.id)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold shrink-0"
            >
              {getEditButtonLabel ? getEditButtonLabel(activeModule) : 'Edit in M&E Workspace'}
            </button>
          ) : null}
        </div>

        {!selectedRecord && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-14 px-6 text-center">
            <ClipboardList className="mx-auto text-slate-400 mb-3" size={40} />
            <p className="text-slate-700 font-medium">No record selected</p>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              {records.length ? emptyRecordsMessage : emptyRecordsMessage}
            </p>
            {emptyRecordsAction}
          </div>
        )}

        {selectedRecord && (
          <EvaluatorSubmissionsTable
            rows={submissionRows}
            diamondSections={diamondSections}
            diamondOptions={diamondOptions}
            title={`${activeModule.label} evaluator submissions`}
            emptyMessage={`No evaluator submissions yet for ${activeModule.label.toLowerCase()} on this project.`}
          />
        )}

        {records.length > 0 && recordsWithModuleData.length === 0 && selectedRecord && submissionRows.length === 0 && (
          <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            No evaluator submissions yet for this module. Assign an evaluator and form template, then wait for them to submit.
          </p>
        )}
      </div>
    </div>
  );
}

export function EvaluationModulePanel({
  moduleId = 'outcomes',
  records = [],
  diamondForms = [],
  diamondSections = [],
  diamondOptions = [],
  moduleAssignments = null,
  staffMembers = [],
  currentUser = null,
  canAssignTemplate = false,
  onAssignTemplate,
  onAssignEvaluator,
  onSaveEvaluatorResponses,
  savingRecordId = '',
}) {
  const activeModule = EVALUATION_MODULES.find((module) => module.id === moduleId) || EVALUATION_MODULES[0];
  const ActiveModuleIcon = activeModule.icon;
  const config = ME_DIAMOND_MODULE_CONFIG[moduleId];
  const moduleForms = useMemo(
    () => diamondForms.filter((form) => form.usage === config?.usage),
    [diamondForms, config?.usage]
  );
  const assignedFormId = moduleAssignments?.[moduleId]?.formId || '';
  const assignedEvaluatorId = moduleAssignments?.[moduleId]?.evaluatorId || '';
  const staffOptions = useMemo(
    () => buildStaffEvaluatorOptions(staffMembers),
    [staffMembers]
  );
  const assignedEvaluatorLabel = useMemo(
    () => resolveStaffEvaluatorLabel(staffMembers, assignedEvaluatorId, currentUser),
    [staffMembers, assignedEvaluatorId, currentUser]
  );
  const isAssignedEvaluator = isCurrentUserModuleEvaluator(moduleAssignments, moduleId, currentUser);
  const [pendingFormId, setPendingFormId] = useState(assignedFormId);
  const [pendingEvaluatorId, setPendingEvaluatorId] = useState(assignedEvaluatorId);

  useEffect(() => {
    setPendingFormId(assignedFormId);
  }, [assignedFormId, moduleId]);

  useEffect(() => {
    setPendingEvaluatorId(assignedEvaluatorId);
  }, [assignedEvaluatorId, moduleId]);

  const assignedForm = useMemo(
    () => resolveAssignedFormForModule(moduleId, diamondForms, records, moduleAssignments),
    [moduleId, diamondForms, records, moduleAssignments]
  );
  const selectedForm = assignedForm;
  const selectedSections = useMemo(
    () => diamondSections.filter((section) =>
      (selectedForm?.sectionIds || []).includes(section.id)
    ),
    [diamondSections, selectedForm]
  );
  const submissionRows = useMemo(
    () => collectEvaluatorSubmissionRows({
      records,
      moduleId,
      moduleAssignments,
      staffMembers,
      diamondForms,
    }),
    [records, moduleId, moduleAssignments, staffMembers, diamondForms]
  );

  if (!config) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="mb-5">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
          <ActiveModuleIcon size={18} />
          <span>{activeModule.label}</span>
        </div>
        <h2 className="mt-1 text-lg font-bold text-slate-900">{activeModule.label}</h2>
      </div>

      {canAssignTemplate ? (
        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Form template</label>
          <select
            value={pendingFormId}
            onChange={(e) => {
              const nextFormId = e.target.value;
              setPendingFormId(nextFormId);
              onAssignTemplate?.(nextFormId, pendingEvaluatorId);
            }}
            className={NGO_INPUT_CLASS}
          >
            <option value="">Select form template</option>
            {moduleForms.map((form) => (
              <option key={form.id} value={form.id}>{form.title}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Selecting a template assigns it for this module across evaluation records.
          </p>
        </div>
      ) : null}

      {canAssignTemplate ? (
        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Evaluator</label>
          <select
            value={pendingEvaluatorId}
            onChange={(e) => {
              const nextEvaluatorId = e.target.value;
              setPendingEvaluatorId(nextEvaluatorId);
              onAssignEvaluator?.(nextEvaluatorId, pendingFormId);
            }}
            className={NGO_INPUT_CLASS}
            disabled={!pendingFormId}
          >
            <option value="">Select evaluator</option>
            {staffOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            {pendingFormId
              ? 'Choose the staff member responsible for reviewing this module.'
              : 'Select a form template first, then assign an evaluator.'}
          </p>
        </div>
      ) : isAssignedEvaluator ? (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Your assignment</p>
          <p className="mt-1 text-sm font-medium text-emerald-900">
            You are assigned to review {activeModule.label.toLowerCase()} for this organization.
          </p>
        </div>
      ) : assignedEvaluatorLabel ? (
        <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evaluator</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{assignedEvaluatorLabel}</p>
        </div>
      ) : null}

      {!selectedForm ? (
        <div className="py-8 text-center space-y-2">
          <p className="text-sm text-slate-500">
            {assignedFormId
              ? 'The assigned form template could not be loaded.'
              : isAssignedEvaluator
                ? 'Waiting for an administrator to assign a form template for this module.'
                : 'No form yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {isAssignedEvaluator ? (
            records.length > 0 ? (
              records.map((record) => (
                <EvaluatorRecordForm
                  key={record.id}
                  record={record}
                  config={config}
                  form={selectedForm}
                  sections={selectedSections}
                  options={diamondOptions}
                  onSave={(recordId, responses) => onSaveEvaluatorResponses?.(recordId, moduleId, responses)}
                  saving={savingRecordId === record.id}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 py-8 text-center">
                No M&E project records are available to evaluate yet.
              </p>
            )
          ) : (
            canAssignTemplate ? (
              <EvaluatorSubmissionsTable
                rows={submissionRows}
                diamondSections={diamondSections}
                diamondOptions={diamondOptions}
                title={`${activeModule.label} evaluator submissions`}
                emptyMessage={`No evaluator submissions yet for ${activeModule.label.toLowerCase()}.`}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

export function EvaluationModuleSidebar({
  activeModuleId = 'outcomes',
  onSelectModuleId,
  modules = EVALUATION_MODULES,
  title = 'Evaluation Modules',
  description = 'Select a module to view its form.',
}) {
  return (
    <aside className="bg-white border border-slate-200 rounded-lg p-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-4 space-y-1">
        {modules.map((module) => {
          const Icon = module.icon;
          const active = activeModuleId === module.id;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onSelectModuleId?.(module.id)}
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
  );
}
