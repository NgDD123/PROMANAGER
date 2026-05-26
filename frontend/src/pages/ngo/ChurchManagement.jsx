import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Church,
  Loader2,
  LogOut,
  Users,
  DollarSign,
  CalendarDays,
  Building2,
  UserCog,
} from 'lucide-react';
import {
  CHURCH_MAIN_TABS,
  CHURCH_USERS_TAB,
  getWorkspacesForTab,
} from './church/churchConfig.js';
import ChurchRecordPanel from './church/ChurchRecordPanel.jsx';
import ChurchMemberProfilePanel from './church/ChurchMemberProfilePanel.jsx';
import ChurchUserManagement from './church/ChurchUserManagement.jsx';
import { useGetNgoChurchSummaryQuery, useGetNgoChurchWorkspaceQuery } from '../../store/actions/ngo.js';
import {
  canManageChurchUsers,
  getChurchPageSubtitle,
  getChurchSummaryCardsForScopes,
  getChurchWorkspaceTitle,
  isChurchOnlyStaff,
  resolveChurchTabScopes,
} from '../../config/churchNavigationScopes.js';
import { shouldUseNgoMinimalLayout } from '../../config/ngoNavigationScopes.js';
import {
  clearServiceAuth,
  getServiceUser,
  CENTRAL_LOGIN_PATH,
} from '../../utils/authCookies.js';

const TAB_ICONS = {
  members: Users,
  finance: DollarSign,
  events: CalendarDays,
  assets: Building2,
  users: UserCog,
};

function SummaryCard({ label, value, detail }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{value}</p>
      {detail ? <p className="mt-0.5 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

export default function ChurchManagement() {
  const navigate = useNavigate();
  const user = getServiceUser('ngo');
  const churchOnlyStaff = isChurchOnlyStaff(user);
  const minimalShell = shouldUseNgoMinimalLayout(user);
  const allowedTabIds = useMemo(() => resolveChurchTabScopes(user), [user]);

  const { data: churchWorkspace } = useGetNgoChurchWorkspaceQuery();

  const workspaceTitle = useMemo(
    () =>
      getChurchWorkspaceTitle(
        user,
        churchWorkspace?.branchName,
        churchWorkspace?.workspaceTitle
      ),
    [user, churchWorkspace]
  );
  const showUserManagement = canManageChurchUsers(user);
  const summaryCards = useMemo(
    () => getChurchSummaryCardsForScopes(allowedTabIds),
    [allowedTabIds]
  );
  const pageSubtitle = useMemo(
    () =>
      minimalShell
        ? getChurchPageSubtitle(allowedTabIds)
        : 'Members, church finance, events, and assets in one place',
    [minimalShell, allowedTabIds]
  );

  const visibleTabs = useMemo(() => {
    const tabs = CHURCH_MAIN_TABS.filter((tab) => allowedTabIds.includes(tab.id));
    if (showUserManagement) tabs.push(CHURCH_USERS_TAB);
    return tabs;
  }, [allowedTabIds, showUserManagement]);

  const [mainTab, setMainTab] = useState(visibleTabs[0]?.id || 'members');
  const workspaces = useMemo(
    () => (mainTab === 'users' ? [] : getWorkspacesForTab(mainTab)),
    [mainTab]
  );
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id);

  const activeWorkspace = workspaces.find((w) => w.id === workspaceId) || workspaces[0];

  useEffect(() => {
    if (!visibleTabs.some((t) => t.id === mainTab)) {
      setMainTab(visibleTabs[0]?.id || 'members');
    }
  }, [visibleTabs, mainTab]);

  const showSummary = mainTab !== 'users' && summaryCards.length > 0;

  const { data: summary, isLoading: summaryLoading } = useGetNgoChurchSummaryQuery(undefined, {
    skip: !showSummary,
  });

  const handleLogout = () => {
    clearServiceAuth('ngo');
    navigate(CENTRAL_LOGIN_PATH, { replace: true });
  };

  const handleMainTab = (tabId) => {
    setMainTab(tabId);
    if (tabId !== 'users') {
      const next = getWorkspacesForTab(tabId);
      setWorkspaceId(next[0]?.id);
    }
  };

  const currency = (n) =>
    Number(n || 0).toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

  if (!visibleTabs.length) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-amber-900 font-medium">No church modules assigned to your account.</p>
        <p className="text-sm text-amber-800 mt-1">Contact your church manager for access.</p>
      </div>
    );
  }

  const summaryGridClass =
    summaryCards.length <= 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : summaryCards.length <= 3
        ? 'grid-cols-2 md:grid-cols-3'
        : 'grid-cols-2 md:grid-cols-4';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Church className="text-emerald-600" size={28} />
            {workspaceTitle}
          </h1>
          <p className="text-gray-600 mt-1">{pageSubtitle}</p>
        </div>
        {minimalShell ? (
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user?.fullName || 'Church staff'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        ) : null}
      </div>

      {showSummary && summaryLoading ? (
        <div className="flex items-center text-gray-500 text-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading summary…
        </div>
      ) : null}

      {showSummary && summary ? (
        <div className={`grid ${summaryGridClass} gap-3`}>
          {summaryCards.map((card) => {
            const raw = summary[card.key] ?? 0;
            const value = card.format === 'currency' ? currency(raw) : raw;
            return <SummaryCard key={card.key} label={card.label} value={value} />;
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const active = mainTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleMainTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {mainTab === 'users' ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <ChurchUserManagement />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <nav className="rounded-xl border border-gray-200 bg-white p-2 space-y-0.5 max-h-[70vh] overflow-y-auto">
              {workspaces.map((ws) => {
                const Icon = ws.icon || TAB_ICONS[mainTab];
                const active = activeWorkspace?.id === ws.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => setWorkspaceId(ws.id)}
                    className={`w-full flex items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} className="shrink-0 mt-0.5" />
                    <span>{ws.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="lg:col-span-9 rounded-xl border border-gray-200 bg-white p-6">
            {activeWorkspace ? (
              activeWorkspace.customPanel === 'memberProfile' ? (
                <ChurchMemberProfilePanel
                  key={`${mainTab}-${activeWorkspace.id}`}
                  domain={mainTab}
                  workspace={activeWorkspace}
                />
              ) : (
                <ChurchRecordPanel
                  key={`${mainTab}-${activeWorkspace.id}`}
                  domain={mainTab}
                  workspace={activeWorkspace}
                />
              )
            ) : null}
          </main>
        </div>
      )}
    </div>
  );
}
