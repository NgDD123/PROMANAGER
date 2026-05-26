import React, { useState, useEffect } from 'react';
import ngoIntegrationService from '../../services/ngoIntegration.service.js';
import {
  PackageCheck,
  ShieldCheck,
  ClipboardCheck,
  BarChart3,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Settings,
  Link2,
  Users,
  Building2,
  Landmark,
  MapPinned,
  Church,
  ShoppingCart,
  MessageSquare,
  FileText,
  Briefcase
} from 'lucide-react';

const serviceIcons = {
  'Finance': Landmark,
  'GIS Field Operations': MapPinned,
  'Procurement & Stock': ShoppingCart,
  'Church Operations': Church,
  'Communication Center': MessageSquare,
  'HR & Payroll': Users,
  'Projects & Programs': Briefcase,
  'Donor Management': FileText,
  'Reports & Analytics': BarChart3
};

const statusColors = {
  'Enabled': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Needs Setup': 'bg-amber-100 text-amber-800 border-amber-300',
  'Disabled': 'bg-gray-100 text-gray-700 border-gray-300'
};

export default function ServiceControlCenter({
  workspace,
  serviceForm,
  setServiceForm,
  createServiceControl,
  removeItem
}) {
  const [serviceStatuses, setServiceStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [crossServicePermissions, setCrossServicePermissions] = useState({});
  const [unifiedAudit, setUnifiedAudit] = useState([]);

  useEffect(() => {
    loadServiceData();
  }, [workspace]);

  const loadServiceData = async () => {
    setLoading(true);
    try {
      const statuses = await ngoIntegrationService.getAllServiceStatuses(workspace);
      setServiceStatuses(statuses);
      
      const recs = ngoIntegrationService.getIntegrationRecommendations(workspace);
      setRecommendations(recs);
      
      const permissions = ngoIntegrationService.getCrossServicePermissions(workspace);
      setCrossServicePermissions(permissions);
      
      const audit = ngoIntegrationService.getUnifiedAuditTrail(workspace);
      setUnifiedAudit(audit);
    } catch (error) {
      console.error('Failed to load service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enabledServices = workspace.serviceControls.filter(service => service.status === 'Enabled').length;
  const totalRoles = workspace.roles.length;
  const totalPermissions = [...new Set(workspace.roles.flatMap(role => role.permissions || []))].length;
  const reportControls = workspace.roles.filter(role => role.permissions.includes('reports')).length;

  const controlChecks = [
    { id: 'finance', label: 'Finance controlled', permission: 'finance', icon: Landmark },
    { id: 'gis', label: 'GIS controlled', permission: 'gis', icon: MapPinned },
    { id: 'reports', label: 'Reports controlled', permission: 'reports', icon: BarChart3 },
    { id: 'projects', label: 'Projects controlled', permission: 'projects', icon: Briefcase },
    { id: 'hr', label: 'HR controlled', permission: 'hr', icon: Users },
    { id: 'procurement', label: 'Procurement controlled', permission: 'procurement', icon: ShoppingCart }
  ];

  const serviceIntegrations = [
    {
      service: 'Finance',
      connections: ['Budgets', 'Grants', 'Payroll', 'Donor Reports', 'Bank Accounts'],
      modules: workspace.departments.length + workspace.grants.length + workspace.payrollRuns.length + workspace.chartOfAccounts.length + workspace.bankAccounts.length,
      realTimeCount: serviceStatuses.finance?.moduleCount || 0,
      status: workspace.serviceControls.find(s => s.service === 'Finance')?.status || 'Needs Setup',
      health: serviceStatuses.finance?.health || 'unknown'
    },
    {
      service: 'GIS Field Operations',
      connections: ['Branches', 'Field Sites', 'Visits', 'Beneficiaries', 'GPS Mapping'],
      modules: workspace.branches.length + workspace.fieldSites.length + workspace.fieldVisits.length,
      realTimeCount: serviceStatuses.gis?.moduleCount || 0,
      status: workspace.serviceControls.find(s => s.service === 'GIS Field Operations')?.status || 'Needs Setup',
      health: serviceStatuses.gis?.health || 'unknown'
    },
    {
      service: 'HR & Staff',
      connections: ['Staff', 'Departments', 'Org Chart', 'Permissions', 'Documents'],
      modules: workspace.staff.length + workspace.departments.length + workspace.roles.length,
      realTimeCount: serviceStatuses.hr?.moduleCount || 0,
      status: workspace.serviceControls.find(s => s.service.includes('HR'))?.status || 'Needs Setup',
      health: serviceStatuses.hr?.health || 'unknown'
    },
    {
      service: 'Church Operations',
      connections: ['Church Branches', 'Offerings', 'Pastoral Visits', 'Attendance', 'Members'],
      modules: workspace.branches.filter(b => b.type === 'Church Branch').length,
      realTimeCount: serviceStatuses.church?.moduleCount || 0,
      status: workspace.serviceControls.find(s => s.service === 'Church Operations')?.status || 'Needs Setup',
      health: serviceStatuses.church?.health || 'unknown'
    },
    {
      service: 'Procurement & Stock',
      connections: ['Relief Stock', 'Purchase Requests', 'Distribution Tracking', 'Suppliers', 'Inventory'],
      modules: 0,
      realTimeCount: serviceStatuses.procurement?.moduleCount || 0,
      status: workspace.serviceControls.find(s => s.service.includes('Procurement'))?.status || 'Needs Setup',
      health: serviceStatuses.procurement?.health || 'unknown'
    },
    {
      service: 'Communication Center',
      connections: ['Announcements', 'SMS', 'WhatsApp', 'Email Campaigns', 'Notifications'],
      modules: 0,
      realTimeCount: serviceStatuses.communication?.moduleCount || 0,
      status: workspace.serviceControls.find(s => s.service.includes('Communication'))?.status || 'Needs Setup',
      health: serviceStatuses.communication?.health || 'unknown'
    },
    {
      service: 'Projects & Programs',
      connections: ['Programs', 'Donors', 'Beneficiaries', 'Volunteers', 'Reports'],
      modules: workspace.grants.length,
      realTimeCount: serviceStatuses.projects?.moduleCount || 0,
      status: workspace.serviceControls.find(s => s.service.includes('Project'))?.status || 'Needs Setup',
      health: serviceStatuses.projects?.health || 'unknown'
    }
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={PackageCheck} label="Enabled Services" value={enabledServices} color="emerald" />
        <MetricCard icon={ShieldCheck} label="Roles" value={totalRoles} color="blue" />
        <MetricCard icon={ClipboardCheck} label="Permissions" value={totalPermissions} color="purple" />
        <MetricCard icon={BarChart3} label="Report Controls" value={reportControls} color="indigo" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 mb-6">
        <form onSubmit={createServiceControl} className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900">Add Service Control</h4>
              <p className="text-sm text-gray-600">Connect a new service to your NGO operations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Service Name" 
              value={serviceForm.service} 
              onChange={value => setServiceForm({ ...serviceForm, service: value })} 
              placeholder="Communication Center" 
              required 
            />
            <Input 
              label="Owner Role" 
              value={serviceForm.owner} 
              onChange={value => setServiceForm({ ...serviceForm, owner: value })} 
              placeholder="NGO Administrator" 
              required 
            />
            <div className="md:col-span-2">
              <Input 
                label="Linked Modules" 
                value={serviceForm.linkedModule} 
                onChange={value => setServiceForm({ ...serviceForm, linkedModule: value })} 
                placeholder="Announcements, SMS, WhatsApp, Email campaigns" 
              />
            </div>
            <SelectInput 
              label="Status" 
              value={serviceForm.status} 
              options={['Enabled', 'Needs Setup', 'Disabled']} 
              onChange={value => setServiceForm({ ...serviceForm, status: value })} 
            />
          </div>

          <button className="mt-5 w-full inline-flex justify-center items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-5 h-5 text-blue-700" />
              <h4 className="font-bold text-blue-900">Service Integration Status</h4>
            </div>
            <div className="space-y-2">
              {serviceIntegrations.map(integration => (
                <div key={integration.service} className="flex items-center justify-between p-3 rounded-lg bg-white border border-blue-100">
                  <div className="flex items-center gap-2">
                    {React.createElement(serviceIcons[integration.service] || Settings, { className: "w-4 h-4 text-blue-700" })}
                    <span className="text-sm font-semibold text-gray-900">{integration.service}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-blue-700">{integration.modules} local</span>
                    {!loading && integration.realTimeCount > 0 && (
                      <span className="text-xs text-green-600">+{integration.realTimeCount} connected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              <h4 className="font-bold text-purple-900">Permission Coverage</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {controlChecks.slice(0, 4).map(check => {
                const hasPermission = workspace.roles.some(role => role.permissions.includes(check.permission));
                return (
                  <div key={check.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
                    hasPermission ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {React.createElement(check.icon, { className: "w-3.5 h-3.5" })}
                    <span>{check.label.replace(' controlled', '')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
              <PackageCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-base sm:text-xl font-bold text-gray-900">Service Registry</h4>
              <p className="text-sm text-gray-600">All connected services and their operational status</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
            {workspace.serviceControls.length} services
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Service</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Owner</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Linked Modules</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Status</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {workspace.serviceControls.map(service => {
                const ServiceIcon = serviceIcons[service.service] || Settings;
                return (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <ServiceIcon className="w-5 h-5 text-emerald-700" />
                        <span className="font-bold text-gray-900">{service.service}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{service.owner}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-gray-700 text-sm">{service.linkedModule}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold ${statusColors[service.status]}`}>
                        {service.status === 'Enabled' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {service.status === 'Needs Setup' && <AlertCircle className="w-3.5 h-3.5" />}
                        {service.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => removeItem('serviceControls', service.id, `Service ${service.service}`)}
                        className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 font-bold text-sm hover:underline"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
              {workspace.serviceControls.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-gray-500">
                    <PackageCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-semibold">No services configured yet</p>
                    <p className="text-sm mt-1">Add your first service control above to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {controlChecks.map(check => {
          const hasPermission = workspace.roles.some(role => role.permissions.includes(check.permission));
          const Icon = check.icon;
          return (
            <div
              key={check.id}
              className={`rounded-xl border-2 p-5 transition-all ${
                hasPermission
                  ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md'
                  : 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  hasPermission ? 'bg-emerald-600' : 'bg-amber-600'
                }`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${hasPermission ? 'text-emerald-900' : 'text-amber-900'}`}>
                    {check.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${hasPermission ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {hasPermission ? 'Active permission' : 'Needs role assignment'}
                  </p>
                </div>
                {hasPermission ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-lg text-indigo-900">Service Connections</h4>
          </div>
          <div className="space-y-3">
            {serviceIntegrations.map(integration => (
              <div key={integration.service} className="rounded-lg border-2 border-white bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {React.createElement(serviceIcons[integration.service] || Settings, { className: "w-5 h-5 text-indigo-700" })}
                    <span className="font-bold text-gray-900">{integration.service}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    integration.status === 'Enabled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {integration.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {integration.connections.map(conn => (
                    <span key={conn} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-semibold">
                      {conn}
                    </span>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Connected modules</span>
                    <span className="font-bold text-indigo-700">{integration.modules + (integration.realTimeCount || 0)} active</span>
                  </div>
                  {integration.health && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        integration.health === 'healthy' ? 'bg-green-500' : 
                        integration.health === 'warning' ? 'bg-yellow-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-xs text-gray-500 capitalize">{integration.health}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-lg text-emerald-900">Integration Benefits</h4>
          </div>
          <div className="space-y-4">
            <BenefitItem
              icon={Building2}
              title="Unified Organization Management"
              description="All branches, departments, and staff connected through one control center"
            />
            <BenefitItem
              icon={Landmark}
              title="Financial Transparency"
              description="Budgets, grants, payroll, and donor reports integrated with audit trails"
            />
            <BenefitItem
              icon={MapPinned}
              title="Field Operations Tracking"
              description="GPS-enabled site mapping with beneficiary tracking and visit logs"
            />
            <BenefitItem
              icon={ShieldCheck}
              title="Role-Based Access Control"
              description="Granular permissions across all services with approval workflows"
            />
            <BenefitItem
              icon={BarChart3}
              title="Cross-Service Reporting"
              description="Generate comprehensive reports spanning finance, field, HR, and programs"
            />
            <BenefitItem
              icon={Church}
              title="Multi-Organization Support"
              description="Manage NGOs and church operations from a single platform"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <PackageCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-xl text-gray-900 mb-2">Professional Multi-Service Architecture</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              The Service Control Center connects all NGO operations—finance, field GIS, HR, procurement, church management, and reporting—into one unified system. 
              Each service maintains its own data while sharing permissions, roles, and audit trails. This architecture enables professional NGOs to operate with 
              transparency, accountability, and efficiency across multiple branches, countries, and programs.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge text="Cross-service permissions" />
              <Badge text="Unified audit trail" />
              <Badge text="Multi-organization support" />
              <Badge text="Role-based access" />
              <Badge text="Real-time integration" />
              <Badge text="Donor-ready reporting" />
            </div>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="mt-6 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-amber-900">Integration Recommendations</h4>
              <p className="text-sm text-amber-700">Suggested actions to improve service integration</p>
            </div>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div key={index} className={`rounded-lg border-2 p-3 ${
                rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                rec.priority === 'medium' ? 'border-amber-200 bg-amber-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                    rec.priority === 'medium' ? 'bg-amber-200 text-amber-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {rec.service}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 flex-1">{rec.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(crossServicePermissions).length > 0 && (
        <div className="mt-6 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-purple-900">Cross-Service Permissions Matrix</h4>
              <p className="text-sm text-purple-700">Roles and their access across all services</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(crossServicePermissions).map(([permission, roles]) => (
              <div key={permission} className="rounded-lg border-2 border-purple-100 bg-white p-3">
                <p className="font-bold text-sm text-purple-900 mb-2 capitalize">{permission}</p>
                <div className="space-y-1">
                  {roles.map((role, index) => (
                    <div key={index} className="text-xs text-gray-700">
                      <span className="font-semibold">{role.role}</span>
                      <span className="text-gray-500"> • {role.scope}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unifiedAudit.length > 0 && (
        <div className="mt-6 rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900">Unified Audit Trail</h4>
              <p className="text-sm text-gray-600">Recent activity across all connected services</p>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {unifiedAudit.slice(0, 20).map((event, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {event.service}
                  </span>
                  <span className="text-sm text-gray-700">{event.message}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  const colors = {
    emerald: 'from-emerald-600 to-teal-600 text-emerald-700',
    blue: 'from-blue-600 to-indigo-600 text-blue-700',
    purple: 'from-purple-600 to-pink-600 text-purple-700',
    indigo: 'from-indigo-600 to-blue-600 text-indigo-700'
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 bg-white hover:border-gray-300 transition-all shadow-md">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-xl sm:text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-2 font-semibold uppercase tracking-wide">{label}</p>
    </div>
  );
}

function BenefitItem({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-white border-2 border-emerald-100">
      <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="font-bold text-sm text-gray-900">{title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function Badge({ text }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white border-2 border-blue-200 px-3 py-1 text-xs font-bold text-blue-800">
      <CheckCircle2 className="w-3 h-3" />
      {text}
    </span>
  );
}

function Input({ label, value, onChange, placeholder = '', required = false }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</span>
      <input
        type="text"
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
      />
    </label>
  );
}

function SelectInput({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
      >
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
