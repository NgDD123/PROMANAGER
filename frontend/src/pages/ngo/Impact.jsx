import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  FileText,
  Landmark,
  Loader2,
  MapPinned,
  Printer,
  RefreshCw,
  Shield,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  useGetNgoAuditsQuery,
  useGetNgoBeneficialOwnersQuery,
  useGetNgoBranchesQuery,
  useGetNgoContractsQuery,
  useGetNgoDepartmentsQuery,
  useGetNgoFinancesQuery,
  useGetNgoImpactsQuery,
  useGetNgoOrganizationsQuery,
  useGetNgoProjectsQuery,
  useGetNgoUsersQuery,
  getNgoErrorMessage
} from '../../store/actions/ngo.js';

function asNumber(value) {
  return Number(value) || 0;
}

function currency(value) {
  return asNumber(value).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });
}

function pct(value) {
  return `${Math.max(0, Math.min(100, Math.round(asNumber(value))))}%`;
}

function statusClass(status) {
  const value = String(status || '').toLowerCase();
  if (['active', 'ongoing', 'approved', 'completed', 'closed'].includes(value)) return 'bg-emerald-100 text-emerald-700';
  if (['planning', 'draft', 'pending'].includes(value)) return 'bg-blue-100 text-blue-700';
  if (['on hold', 'flagged', 'high'].includes(value)) return 'bg-amber-100 text-amber-800';
  return 'bg-slate-100 text-slate-700';
}

function sumBeneficiaries(record) {
  const beneficiaries = Array.isArray(record?.beneficiaries) ? record.beneficiaries : [];
  return beneficiaries.reduce((sum, item) => sum + asNumber(item.numberReached), 0) || asNumber(record?.beneficiariesReached) || asNumber(record?.beneficiaryTotal);
}

function sumActivitySpend(record) {
  const activities = Array.isArray(record?.activities) ? record.activities : [];
  return activities.reduce((sum, item) => sum + asNumber(item.budgetUsed), 0);
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function Section({ title, icon: Icon, children, action }) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={19} className="text-emerald-700" />
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, detail }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Icon size={20} className="text-emerald-700" />
        </div>
      </div>
    </div>
  );
}

function Bar({ label, value, tone = 'emerald' }) {
  const color = tone === 'blue' ? 'bg-blue-600' : tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-600';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{pct(value)}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: pct(value) }} />
      </div>
    </div>
  );
}

export default function Impact() {
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const organizationsQuery = useGetNgoOrganizationsQuery();
  const branchesQuery = useGetNgoBranchesQuery(organizationFilter ? { organizationId: organizationFilter } : undefined);
  const departmentsQuery = useGetNgoDepartmentsQuery(organizationFilter ? { organizationId: organizationFilter } : undefined);
  const staffQuery = useGetNgoUsersQuery(organizationFilter ? { organizationId: organizationFilter } : undefined);
  const projectsQuery = useGetNgoProjectsQuery({
    ...(organizationFilter ? { organizationId: organizationFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {})
  });
  const contractsQuery = useGetNgoContractsQuery(organizationFilter ? { organizationId: organizationFilter } : undefined);
  const financesQuery = useGetNgoFinancesQuery(organizationFilter ? { organizationId: organizationFilter } : undefined);
  const impactsQuery = useGetNgoImpactsQuery(organizationFilter ? { organizationId: organizationFilter } : undefined);
  const auditsQuery = useGetNgoAuditsQuery(organizationFilter ? { organizationId: organizationFilter } : undefined);
  const ownersQuery = useGetNgoBeneficialOwnersQuery(organizationFilter ? { organizationId: organizationFilter } : undefined);

  const organizations = organizationsQuery.data || [];
  const branches = branchesQuery.data || [];
  const departments = departmentsQuery.data || [];
  const staff = staffQuery.data || [];
  const projects = projectsQuery.data || [];
  const contracts = contractsQuery.data || [];
  const finances = financesQuery.data || [];
  const impacts = impactsQuery.data || [];
  const audits = auditsQuery.data || [];
  const beneficialOwners = ownersQuery.data || [];

  const loading = [
    organizationsQuery,
    branchesQuery,
    departmentsQuery,
    staffQuery,
    projectsQuery,
    contractsQuery,
    financesQuery,
    impactsQuery,
    auditsQuery,
    ownersQuery
  ].some((query) => query.isLoading || query.isFetching);

  const firstError = [
    organizationsQuery,
    branchesQuery,
    departmentsQuery,
    staffQuery,
    projectsQuery,
    contractsQuery,
    financesQuery,
    impactsQuery,
    auditsQuery,
    ownersQuery
  ].find((query) => query.error)?.error;

  const orgById = useMemo(
    () => Object.fromEntries(organizations.map((org) => [org.id, org])),
    [organizations]
  );

  const report = useMemo(() => {
    const projectBudget = projects.reduce((sum, item) => sum + asNumber(item.budget), 0);
    const projectSpent = projects.reduce((sum, item) => sum + asNumber(item.spent), 0);
    const contractBudget = contracts.reduce((sum, item) => sum + asNumber(item.budget), 0);
    const contractExpense = contracts.reduce((sum, item) => sum + (asNumber(item.expense) || sumActivitySpend(item)), 0);
    const financeIncome = finances
      .filter((item) => String(item.type || item.category || '').toLowerCase().includes('income'))
      .reduce((sum, item) => sum + asNumber(item.amount), 0);
    const financeExpense = finances
      .filter((item) => !String(item.type || item.category || '').toLowerCase().includes('income'))
      .reduce((sum, item) => sum + asNumber(item.amount), 0);
    const beneficiariesReached =
      projects.reduce((sum, item) => sum + asNumber(item.beneficiariesReached), 0) +
      contracts.reduce((sum, item) => sum + sumBeneficiaries(item), 0);
    const beneficiariesTarget = projects.reduce((sum, item) => sum + asNumber(item.beneficiariesTarget), 0);
    const activities = contracts.reduce((sum, item) => sum + (Array.isArray(item.activities) ? item.activities.length : 0), 0);
    const activitiesCompleted = contracts.reduce((sum, item) => {
      const rows = Array.isArray(item.activities) ? item.activities : [];
      return sum + rows.filter((activity) => String(activity.status || '').toLowerCase() === 'completed').length;
    }, 0);
    const indicators = contracts.flatMap((item) => (Array.isArray(item.indicators) ? item.indicators : []));
    const indicatorTarget = indicators.reduce((sum, item) => sum + asNumber(item.target), 0);
    const indicatorCurrent = indicators.reduce((sum, item) => sum + asNumber(item.current), 0);
    const highRisks = contracts.reduce((sum, item) => {
      const rows = Array.isArray(item.riskIssues) ? item.riskIssues : [];
      return sum + rows.filter((risk) => String(risk.severity || '').toLowerCase() === 'high').length;
    }, 0);

    return {
      projectBudget,
      projectSpent,
      contractBudget,
      contractExpense,
      totalBudget: projectBudget || contractBudget,
      totalExpense: projectSpent || contractExpense || financeExpense,
      financeIncome,
      financeExpense,
      beneficiariesReached,
      beneficiariesTarget,
      beneficiaryProgress: beneficiariesTarget ? (beneficiariesReached / beneficiariesTarget) * 100 : 0,
      activities,
      activitiesCompleted,
      activityProgress: activities ? (activitiesCompleted / activities) * 100 : 0,
      indicatorTarget,
      indicatorCurrent,
      indicatorProgress: indicatorTarget ? (indicatorCurrent / indicatorTarget) * 100 : 0,
      highRisks,
      budgetUtilization: (projectBudget || contractBudget) ? ((projectSpent || contractExpense || financeExpense) / (projectBudget || contractBudget)) * 100 : 0,
      activeProjects: projects.filter((item) => ['active', 'ongoing'].includes(String(item.status || '').toLowerCase())).length,
      closedProjects: projects.filter((item) => ['closed', 'completed'].includes(String(item.status || '').toLowerCase())).length
    };
  }, [contracts, finances, projects]);

  const projectsWithDetails = useMemo(() => projects.map((project) => {
    const projectContracts = contracts.filter((item) => item.projectId === project.id || item.projectCode === project.code);
    const projectFinances = finances.filter((item) => item.projectId === project.id);
    const reachedFromMe = projectContracts.reduce((sum, item) => sum + sumBeneficiaries(item), 0);
    const expenseFromMe = projectContracts.reduce((sum, item) => sum + (asNumber(item.expense) || sumActivitySpend(item)), 0);
    const activities = projectContracts.reduce((sum, item) => sum + (item.activities?.length || 0), 0);
    const completed = projectContracts.reduce((sum, item) => {
      const rows = Array.isArray(item.activities) ? item.activities : [];
      return sum + rows.filter((activity) => String(activity.status || '').toLowerCase() === 'completed').length;
    }, 0);

    return {
      ...project,
      organizationName: orgById[project.organizationId]?.name || 'Not assigned',
      mAndERecords: projectContracts.length,
      financeRecords: projectFinances.length,
      beneficiariesReachedTotal: asNumber(project.beneficiariesReached) || reachedFromMe,
      spentTotal: asNumber(project.spent) || expenseFromMe,
      activityProgress: activities ? (completed / activities) * 100 : 0
    };
  }), [contracts, finances, orgById, projects]);

  const handleRefresh = () => {
    [
      organizationsQuery,
      branchesQuery,
      departmentsQuery,
      staffQuery,
      projectsQuery,
      contractsQuery,
      financesQuery,
      impactsQuery,
      auditsQuery,
      ownersQuery
    ].forEach((query) => query.refetch?.());
  };

  const handleExportCsv = () => {
    downloadCsv('ngo-full-impact-report.csv', [
      ['Project', 'Organization', 'Program', 'Donor', 'Manager', 'Status', 'Budget', 'Spent', 'Beneficiaries', 'M&E Records', 'Activity Progress'],
      ...projectsWithDetails.map((project) => [
        project.name,
        project.organizationName,
        project.programArea,
        project.donor,
        project.manager,
        project.status,
        project.budget,
        project.spentTotal,
        project.beneficiariesReachedTotal,
        project.mAndERecords,
        pct(project.activityProgress)
      ])
    ]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:bg-white">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Target size={18} />
            <span>Organization Report</span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold text-slate-950">Organization Report</h1>
          <p className="mt-1 text-slate-600">
            Consolidated professional report from NGO organizations, branches, departments, staff, projects, M&E, finance, audits, governance, and impact records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button type="button" onClick={handleRefresh} className="px-3 py-2 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button type="button" onClick={handleExportCsv} className="px-3 py-2 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <Download size={16} />
            Excel/CSV
          </button>
          <button type="button" onClick={handlePrint} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
            <Printer size={16} />
            Print / PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select value={organizationFilter} onChange={(e) => setOrganizationFilter(e.target.value)} className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
            <option value="">All NGOs / Organizations</option>
            {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
            <option value="">All Project Statuses</option>
            {['Planning', 'Active', 'Ongoing', 'On Hold', 'Completed', 'Closed'].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <div className="px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-600">
            Report generated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {firstError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          {getNgoErrorMessage(firstError, 'Some report data could not be loaded.')}
        </div>
      )}

      {loading && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-center justify-center text-slate-600">
          <Loader2 size={22} className="animate-spin mr-2" />
          Building full NGO report...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat icon={Building2} label="NGOs / Branches" value={`${organizations.length} / ${branches.length}`} detail={`${departments.length} departments included`} />
        <Stat icon={Briefcase} label="Projects" value={projects.length.toLocaleString()} detail={`${report.activeProjects} active, ${report.closedProjects} completed/closed`} />
        <Stat icon={Users} label="Beneficiaries reached" value={report.beneficiariesReached.toLocaleString()} detail={`${pct(report.beneficiaryProgress)} against project targets`} />
        <Stat icon={FileSpreadsheet} label="Budget utilization" value={pct(report.budgetUtilization)} detail={`${currency(report.totalExpense)} of ${currency(report.totalBudget)}`} />
      </div>

      <Section title="Executive Summary" icon={BarChart3}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Bar label="Target vs Actual Beneficiaries" value={report.beneficiaryProgress} />
            <Bar label="Indicator Target vs Current" value={report.indicatorProgress} tone="blue" />
            <Bar label="Activity Completion" value={report.activityProgress} tone="amber" />
            <Bar label="Budget vs Expense" value={report.budgetUtilization} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Staff accounts</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{staff.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">M&E records</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{contracts.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Impact records</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{impacts.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">High risks</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{report.highRisks}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Organization Coverage" icon={Building2}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['NGO', 'Type', 'Country', 'Branches', 'Departments', 'Staff', 'Projects', 'Status'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{org.name || org.organizationName || 'Unnamed NGO'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{org.type || 'NGO'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{org.country || org.address?.country || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{branches.filter((item) => item.organizationId === org.id).length}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{departments.filter((item) => item.organizationId === org.id).length}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{staff.filter((item) => item.organizationId === org.id).length}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{projects.filter((item) => item.organizationId === org.id).length}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(org.status)}`}>{org.status || 'Active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Detailed Project Performance" icon={Briefcase}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['Project', 'NGO', 'Program / Donor', 'Manager', 'Timeline', 'Budget / Spent', 'Beneficiaries', 'M&E', 'Status'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projectsWithDetails.map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{project.name || 'Untitled project'}</div>
                    <div className="text-xs text-slate-500">{project.code || project.id}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{project.organizationName}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div>{project.programArea || '-'}</div>
                    <div className="text-xs text-slate-500">{project.donor || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{project.manager || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{project.startDate || '-'} to {project.endDate || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div>{currency(project.budget)}</div>
                    <div className="text-xs text-slate-500">Spent {currency(project.spentTotal)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{project.beneficiariesReachedTotal.toLocaleString()} / {(asNumber(project.beneficiariesTarget) || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div>{project.mAndERecords} records</div>
                    <div className="text-xs text-slate-500">{pct(project.activityProgress)} activities</div>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(project.status)}`}>{project.status || 'Planning'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Section title="Monitoring & Evaluation Evidence" icon={Activity}>
          <div className="space-y-4">
            {contracts.slice(0, 8).map((record) => (
              <div key={record.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{record.projectName || record.projectCode || 'M&E record'}</h3>
                    <p className="text-sm text-slate-500">{record.program || 'Program not specified'} - {record.branchRegion || record.targetArea || 'Location not mapped'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(record.status)}`}>{record.status || 'Planning'}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-slate-500">Indicators</span><p className="font-semibold">{record.indicators?.length || 0}</p></div>
                  <div><span className="text-slate-500">Activities</span><p className="font-semibold">{record.activities?.length || 0}</p></div>
                  <div><span className="text-slate-500">Beneficiaries</span><p className="font-semibold">{sumBeneficiaries(record).toLocaleString()}</p></div>
                  <div><span className="text-slate-500">Performance</span><p className="font-semibold">{pct(record.performance)}</p></div>
                </div>
              </div>
            ))}
            {contracts.length === 0 && <p className="text-sm text-slate-500">No M&E evidence records available yet.</p>}
          </div>
        </Section>

        <Section title="Finance & Resource Utilization" icon={Landmark}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Total Budget</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{currency(report.totalBudget)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Total Expense</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{currency(report.totalExpense)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Finance Income Records</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{currency(report.financeIncome)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Finance Entries</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{finances.length}</p>
            </div>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Section title="Governance & Beneficial Ownership" icon={Shield}>
          <div className="space-y-3">
            <Stat icon={Shield} label="Beneficial Owners" value={beneficialOwners.length} detail="KYC and control records" />
            <p className="text-sm text-slate-600">Ownership transparency data is included to support donor due diligence, governance assurance, and compliance reporting.</p>
          </div>
        </Section>

        <Section title="Audit & Compliance" icon={ClipboardCheck}>
          <div className="space-y-3">
            <Stat icon={ClipboardCheck} label="Audit Records" value={audits.length} detail="Compliance and regulatory checks" />
            <p className="text-sm text-slate-600">Audit records, high-risk issues, and compliance checks are part of the full NGO accountability report.</p>
          </div>
        </Section>

        <Section title="GIS / Geographic Impact" icon={MapPinned}>
          <div className="space-y-3">
            <Stat icon={MapPinned} label="Mapped Activities" value={contracts.filter((item) => item.branchRegion || item.targetArea || item.gisLocations?.length).length} detail="Regions, districts, sectors, villages, GPS" />
            <p className="text-sm text-slate-600">Geographic impact reflects project target areas and M&E GIS tracking captured from the monitoring workspace.</p>
          </div>
        </Section>
      </div>

      <Section title="Professional Report Narrative" icon={FileText}>
        <div className="prose max-w-none text-slate-700">
          <p>
            This report consolidates operational, financial, governance, monitoring, evaluation, and impact information across the selected NGO portfolio.
            It covers {organizations.length} organization(s), {projects.length} project(s), {staff.length} staff account(s), and {contracts.length} M&E record(s).
          </p>
          <p>
            Portfolio implementation has reached {report.beneficiariesReached.toLocaleString()} beneficiaries against a recorded target of {report.beneficiariesTarget.toLocaleString()}.
            Total tracked budget is {currency(report.totalBudget)} with {currency(report.totalExpense)} recorded as spent or utilized.
          </p>
          <p>
            Monitoring evidence includes indicators, activity progress, field visits, risk registers, beneficiary services, report outputs, and GIS tracking.
            Governance and compliance coverage includes audit records and beneficial ownership information where available.
          </p>
        </div>
      </Section>
    </div>
  );
}
