import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Globe2,
  Network,
  ShieldCheck,
  DollarSign,
  Briefcase,
  FileText,
  BarChart3,
  ClipboardCheck,
  Church,
  LayoutDashboard,
  Users,
  User,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Gem
} from 'lucide-react';
import { clearServiceAuth, getServiceUser, getServiceOrganization, CENTRAL_LOGIN_PATH } from '../../utils/authCookies.js';
import { getWorkspaceOrganization, getServiceLabel } from '../../config/serviceContext.js';
import {
  filterNgoMenuItems,
  isNgoPathAllowed,
  getDefaultNgoPath,
  shouldUseNgoMinimalLayout,
} from '../../config/ngoNavigationScopes.js';

/** Sidebar order: dashboard → structure → people → delivery → finance → report → settings */
const menuItems = [
  { path: '/ngo/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/ngo/organizations', icon: Building2, label: 'Organization' },
  { path: '/ngo/branches', icon: Globe2, label: 'Branches' },
  { path: '/ngo/roles', icon: ShieldCheck, label: 'Roles' },
  { path: '/ngo/departments', icon: Network, label: 'Departments' },
  { path: '/ngo/staff', icon: Users, label: 'Staff' },
  { path: '/ngo/projects', icon: Briefcase, label: 'Projects & Tenders' },
  { path: '/ngo/contracts', icon: FileText, label: 'Contracts & Storage' },
  { path: '/ngo/evaluations', icon: ClipboardCheck, label: 'Evaluations' },
  { path: '/ngo/finance', icon: DollarSign, label: 'Finance' },
  { path: '/ngo/impact', icon: BarChart3, label: 'Organization Report' },
  { path: '/ngo/church', icon: Church, label: 'Church Management' },
  { path: '/ngo/diamond-forms', icon: Gem, label: 'Diamond Forms' },
  { path: '/ngo/settings', icon: Settings, label: 'Settings' }
];

function getUserInitials(user) {
  const name = user?.fullName || user?.name || user?.email || 'User';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getUserDisplayName(user) {
  return user?.fullName || user?.name || 'NGO Admin';
}

const SIDEBAR_WIDTH = 256; // 16rem / w-64

export default function NGOLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // On desktop the sidebar starts open; on mobile it starts closed
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const user = getServiceUser('ngo');
  const organization = getWorkspaceOrganization('ngo', user) || getServiceOrganization('ngo');
  const serviceLabel = getServiceLabel('ngo', user);
  const visibleMenuItems = useMemo(() => filterNgoMenuItems(menuItems, user), [user]);
  const minimalLayout = shouldUseNgoMinimalLayout(user);

  // Track viewport size
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        // Restore sidebar when returning to desktop
        setSidebarOpen(true);
      } else {
        // Close sidebar when switching to mobile
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isNgoPathAllowed(location.pathname, user)) {
      navigate(getDefaultNgoPath(user), { replace: true });
    }
  }, [location.pathname, user, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    clearServiceAuth('ngo');
    setUserMenuOpen(false);
    navigate(CENTRAL_LOGIN_PATH, { replace: true });
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((o) => !o);

  if (minimalLayout) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    );
  }

  // Sidebar content shared between mobile overlay and desktop fixed panel
  const SidebarContent = () => (
    <nav className="p-3 space-y-0.5">
      {visibleMenuItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={isMobile ? closeSidebar : undefined}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              active
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-slate-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={20} className={active ? 'text-emerald-600' : 'text-slate-600'} />
            <span className="text-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top navigation bar ── */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 shadow-sm">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: menu toggle + brand */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {sidebarOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="block"
                  >
                    <X size={22} className="text-gray-700" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="block"
                  >
                    <Menu size={22} className="text-gray-700" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <div className="flex items-center space-x-3">
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-gray-800 truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[260px] md:max-w-md">
                  {organization?.name || 'NGO Management'}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">{serviceLabel} · Operations &amp; compliance</p>
              </div>
            </div>
          </div>

          {/* Right: notifications + user menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 relative"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="h-8 w-px bg-gray-300 hidden sm:block" />

            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-semibold shadow-md ring-2 ring-white shrink-0">
                  {getUserInitials(user)}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">{getUserDisplayName(user)}</p>
                  <p className="text-xs text-gray-500">{user?.email || '—'}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                      <p className="text-sm font-semibold text-gray-800">{getUserDisplayName(user)}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || '—'}</p>
                    </div>
                    <Link
                      to="/ngo/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} />
                      User settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Body: sidebar + content ── */}
      <div className="flex pt-16">

        {/* ── MOBILE: animated overlay sidebar ── */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={closeSidebar}
              />

              {/* Drawer sliding from left */}
              <motion.aside
                key="mobile-sidebar"
                initial={{ x: -SIDEBAR_WIDTH }}
                animate={{ x: 0 }}
                exit={{ x: -SIDEBAR_WIDTH }}
                transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-50 shadow-2xl"
              >
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── DESKTOP: static sidebar that pushes content ── */}
        {!isMobile && (
          <motion.aside
            initial={false}
            animate={{ width: sidebarOpen ? SIDEBAR_WIDTH : 0 }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden z-20"
          >
            <div style={{ width: SIDEBAR_WIDTH }}>
              <SidebarContent />
            </div>
          </motion.aside>
        )}

        {/* ── Main content ── */}
        <motion.main
          className="flex-1 min-w-0"
          initial={false}
          animate={{ marginLeft: !isMobile && sidebarOpen ? SIDEBAR_WIDTH : 0 }}
          transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
}
