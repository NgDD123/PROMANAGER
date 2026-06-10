import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import {
  useGetNgoContractsQuery,
  useGetNgoDiamondFormsQuery,
  useGetNgoDiamondOptionsQuery,
  useGetNgoDiamondSectionsQuery,
  useGetNgoMeModuleAssignmentsQuery,
  useUpsertNgoMeModuleAssignmentsMutation,
  usePatchNgoContractMutation,
  useGetNgoOrganizationsQuery,
  useGetNgoUsersQuery,
  getNgoErrorMessage,
} from '../../store/actions/ngo.js';
import {
  EvaluationModulePanel,
  EvaluationModuleSidebar,
  normalizeMeModuleAssignments,
  getEvaluationModulesForUser,
  ME_DIAMOND_MODULE_CONFIG,
} from '../../components/ngo/MeEvaluationModules.jsx';
import { isNgoAdminUser } from '../../config/ngoNavigationScopes.js';
import { getServiceUser } from '../../utils/authCookies.js';
import { resolveNgoTenantOrganization } from '../../utils/ngoTenant.js';
import { usePopup } from '../../context/PopupContext.jsx';

export default function Evaluations() {
  const popup = usePopup();
  const [activeModuleId, setActiveModuleId] = useState('outcomes');
  const [savingRecordId, setSavingRecordId] = useState('');
  const user = getServiceUser('ngo');
  const isAdmin = isNgoAdminUser(user);

  const { data: organizations = [] } = useGetNgoOrganizationsQuery();
  const { tenantOrganizationId } = resolveNgoTenantOrganization(organizations);
  const listParams = useMemo(
    () => (tenantOrganizationId ? { organizationId: tenantOrganizationId } : {}),
    [tenantOrganizationId]
  );

  const { data: records = [], isLoading: loadingRecords, error, refetch } = useGetNgoContractsQuery(listParams);
  const { data: assignmentRecord, isLoading: loadingAssignments } = useGetNgoMeModuleAssignmentsQuery(
    tenantOrganizationId ? { organizationId: tenantOrganizationId } : undefined,
    { skip: !tenantOrganizationId }
  );
  const { data: staffMembers = [] } = useGetNgoUsersQuery(
    tenantOrganizationId ? { organizationId: tenantOrganizationId } : undefined,
    { skip: !tenantOrganizationId || !isAdmin }
  );
  const [upsertAssignments] = useUpsertNgoMeModuleAssignmentsMutation();
  const [patchRecord] = usePatchNgoContractMutation();
  const moduleAssignments = assignmentRecord?.assignments || null;
  const visibleModules = useMemo(
    () => getEvaluationModulesForUser(moduleAssignments, user, isAdmin),
    [moduleAssignments, user, isAdmin]
  );

  useEffect(() => {
    if (isAdmin || visibleModules.length === 0) return;
    if (!visibleModules.some((module) => module.id === activeModuleId)) {
      setActiveModuleId(visibleModules[0].id);
    }
  }, [visibleModules, activeModuleId, isAdmin]);
  const diamondListParams = useMemo(
    () => (tenantOrganizationId ? { organizationId: tenantOrganizationId } : {}),
    [tenantOrganizationId]
  );
  const diamondOrgId = diamondListParams.organizationId;

  const { data: diamondForms = [], isLoading: loadingForms } = useGetNgoDiamondFormsQuery(diamondListParams, {
    skip: !diamondOrgId,
  });
  const { data: diamondOptions = [] } = useGetNgoDiamondOptionsQuery(diamondListParams, {
    skip: !diamondOrgId,
  });
  const { data: diamondSections = [] } = useGetNgoDiamondSectionsQuery(diamondListParams, {
    skip: !diamondOrgId,
  });

  const errorMessage = error ? getNgoErrorMessage(error, 'Failed to fetch evaluation data') : null;
  const isLoading = loadingRecords || loadingForms || loadingAssignments;

  const handleAssignTemplate = async (formId, evaluatorId = '') => {
    if (!isAdmin || !tenantOrganizationId || !formId) return;
    const current = normalizeMeModuleAssignments(assignmentRecord?.assignments);
    try {
      await upsertAssignments({
        organizationId: tenantOrganizationId,
        assignments: {
          ...current,
          [activeModuleId]: {
            formId,
            evaluatorId: evaluatorId || current[activeModuleId]?.evaluatorId || '',
          },
        },
      }).unwrap();
    } catch (err) {
      popup.toast.error(getNgoErrorMessage(err, 'Failed to assign form template'));
    }
  };

  const handleAssignEvaluator = async (evaluatorId, formId = '') => {
    if (!isAdmin || !tenantOrganizationId) return;
    const current = normalizeMeModuleAssignments(assignmentRecord?.assignments);
    try {
      await upsertAssignments({
        organizationId: tenantOrganizationId,
        assignments: {
          ...current,
          [activeModuleId]: {
            formId: formId || current[activeModuleId]?.formId || '',
            evaluatorId: evaluatorId || '',
          },
        },
      }).unwrap();
    } catch (err) {
      popup.toast.error(getNgoErrorMessage(err, 'Failed to assign evaluator'));
    }
  };

  const handleSaveEvaluatorResponses = async (recordId, moduleId, responses) => {
    const config = ME_DIAMOND_MODULE_CONFIG[moduleId];
    if (!config || !recordId) return;
    setSavingRecordId(recordId);
    try {
      await patchRecord({
        id: recordId,
        [config.evaluatorSubmissionKey]: {
          responses,
          submittedAt: new Date().toISOString(),
          submittedBy: user?.id || user?.uid || '',
        },
      }).unwrap();
      popup.toast.success('Evaluation saved');
    } catch (err) {
      popup.toast.error(getNgoErrorMessage(err, 'Failed to save evaluation'));
    } finally {
      setSavingRecordId('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <ClipboardCheck size={18} />
          <span>Monitoring & Evaluation</span>
        </div>
        <h1 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">Evaluations</h1>
        <p className="mt-1 text-slate-600">
          {isAdmin
            ? 'Select a module, pick a form template to assign it, then review saved evaluation data.'
            : 'Review the modules assigned to you and the evaluation data submitted for each project.'}
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          {errorMessage}
          <button type="button" onClick={refetch} className="ml-3 underline">Try again</button>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-lg flex items-center justify-center py-16 text-slate-600">
          <Loader2 className="animate-spin mr-2" size={22} />
          Loading evaluation forms...
        </div>
      ) : !isAdmin && visibleModules.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg px-6 py-14 text-center">
          <p className="text-slate-700 font-medium">No evaluation modules assigned yet</p>
          <p className="mt-2 text-sm text-slate-500">
            An administrator needs to assign you as an evaluator on at least one module.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4">
          <EvaluationModuleSidebar
            activeModuleId={activeModuleId}
            onSelectModuleId={setActiveModuleId}
            modules={visibleModules}
            description={
              isAdmin
                ? 'Select a module to view its form.'
                : 'These modules are assigned to you for review.'
            }
          />
          <EvaluationModulePanel
            moduleId={activeModuleId}
            records={records}
            diamondForms={diamondForms}
            diamondSections={diamondSections}
            diamondOptions={diamondOptions}
            moduleAssignments={moduleAssignments}
            staffMembers={staffMembers}
            currentUser={user}
            canAssignTemplate={isAdmin}
            onAssignTemplate={handleAssignTemplate}
            onAssignEvaluator={isAdmin ? handleAssignEvaluator : undefined}
            onSaveEvaluatorResponses={!isAdmin ? handleSaveEvaluatorResponses : undefined}
            savingRecordId={savingRecordId}
          />
        </div>
      )}
    </div>
  );
}
