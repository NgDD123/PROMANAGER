import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  GitBranch,
  Users,
  FolderKanban,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useGetNgoDashboardQuery, getNgoErrorMessage } from '../../store/actions/ngo.js';
import { getServiceOrganization } from '../../utils/authCookies.js';
import { getWorkspaceOrganization } from '../../config/serviceContext.js';

function formatCurrency(amount) {
  const value = Number(amount) || 0;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatStatusLabel(status) {
  if (!status) return 'Unknown';
  const normalized = String(status).replace(/_/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function isActiveProjectStatus(status) {
  const s = String(status || '').toLowerCase();
  return s === 'active' || s === 'in progress' || s === 'ongoing';
}

export default function Dashboard() {
  const organizationFromSession = getWorkspaceOrganization('ngo') || getServiceOrganization('ngo');
  const {
    data: overview,
    isLoading: loading,
    isFetching,
    error,
    refetch,
  } = useGetNgoDashboardQuery();

  const errorMessage = error
    ? getNgoErrorMessage(error, 'Failed to load dashboard')
    : null;

  const organizationName = overview?.organization?.name || organizationFromSession?.name;

  const stats = overview
    ? [
        {
          title: 'Your Organization',
          value: organizationName || '—',
          change: overview.stats.activeOrganizations > 0 ? 'Active' : 'Pending',
          changeType: overview.stats.activeOrganizations > 0 ? 'increase' : 'neutral',
          icon: Building2,
          color: 'blue'
        },
        {
          title: 'Active Branches',
          value: String(overview.stats.activeBranches),
          change: overview.stats.branchesThisMonth > 0
            ? `+${overview.stats.branchesThisMonth}`
            : '0',
          changeType: overview.stats.branchesThisMonth > 0 ? 'increase' : 'neutral',
          icon: GitBranch,
          color: 'green'
        },
        {
          title: 'Total Staff',
          value: String(overview.stats.totalStaff),
          change: overview.stats.staffThisMonth > 0
            ? `+${overview.stats.staffThisMonth}`
            : '0',
          changeType: overview.stats.staffThisMonth > 0 ? 'increase' : 'neutral',
          icon: Users,
          color: 'purple'
        },
        {
          title: 'Active Projects',
          value: String(overview.stats.activeProjects),
          change: `${overview.stats.totalProjects} total`,
          changeType: 'neutral',
          icon: FolderKanban,
          color: 'orange'
        },
        {
          title: 'Total Project Budget',
          value: formatCurrency(overview.stats.totalBudget),
          change: `${overview.stats.totalProjects} projects`,
          changeType: 'neutral',
          icon: DollarSign,
          color: 'indigo'
        },
        {
          title: 'Funds Raised',
          value: formatCurrency(overview.stats.fundsRaised),
          change: overview.stats.fundsRaised > 0 ? 'Grants & income' : 'No records yet',
          changeType: overview.stats.fundsRaised > 0 ? 'increase' : 'neutral',
          icon: TrendingUp,
          color: 'teal'
        }
      ]
    : [];

  const recentActivities = overview?.recentActivities ?? [];
  const projectsOverview = overview?.projectsOverview ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {organizationName ? `${organizationName} Dashboard` : 'Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">Live overview for your organization</p>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={loading || isFetching}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading || isFetching ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-start gap-4">
          <p className="text-red-800 text-sm">{errorMessage}</p>
          <button
            type="button"
            onClick={refetch}
            className="text-sm text-red-600 hover:text-red-800 underline shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      {loading && !overview ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
          <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600',
                indigo: 'bg-indigo-100 text-indigo-600',
                teal: 'bg-teal-100 text-teal-600'
              };

              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stat.value}</h3>
                      <div className="flex items-center mt-2 gap-1 flex-wrap">
                        {stat.changeType === 'increase' && (
                          <TrendingUp size={16} className="text-green-600" />
                        )}
                        {stat.changeType === 'decrease' && (
                          <TrendingDown size={16} className="text-red-600" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            stat.changeType === 'increase'
                              ? 'text-green-600'
                              : stat.changeType === 'decrease'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {stat.change}
                        </span>
                        {stat.changeType !== 'neutral' && (
                          <span className="text-sm text-gray-500">last 30 days</span>
                        )}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
              {recentActivities.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">
                  No recent activity yet. Add an organization or branch to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={`${activity.type}-${activity.timestamp}-${index}`}
                      className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                        <p className="text-sm text-gray-600 truncate">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Projects Overview</h2>
                <Link to="/ngo/projects" className="text-sm text-blue-600 hover:text-blue-800">
                  View all
                </Link>
              </div>
              {projectsOverview.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">
                  No projects yet.{' '}
                  <Link to="/ngo/projects" className="text-blue-600 hover:underline">
                    Create a project
                  </Link>
                </p>
              ) : (
                <div className="space-y-4">
                  {projectsOverview.map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {project.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatCurrency(project.budget)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full shrink-0 ${
                            isActiveProjectStatus(project.status)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {formatStatusLabel(project.status)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.completion}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{project.completion}% complete</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
