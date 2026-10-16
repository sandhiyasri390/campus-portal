import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserCircle, Briefcase, FileText, CalendarCheck, FileSearch,
  Target, Map, Bell, Building2, PlusCircle, Users, GraduationCap, BarChart3,
  LogOut, Menu, X, ShieldCheck, Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// Route paths and labels are UNCHANGED from the previous version â€” only an
// `icon` field was added to each entry. Every `to` below matches the routes
// defined in App.jsx exactly.
const NAV = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'Profile', icon: UserCircle },
    { to: '/student/jobs', label: 'Browse Drives', icon: Briefcase },
    { to: '/student/applications', label: 'Applications', icon: FileText },
    { to: '/student/interviews', label: 'Interviews', icon: CalendarCheck },
    { to: '/student/skills', label: 'Resume & Skills', icon: FileSearch },
    { to: '/student/readiness', label: 'Readiness', icon: Target },
    { to: '/student/roadmap', label: 'Roadmap', icon: Map },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
  ],
  recruiter: [
    { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recruiter/company', label: 'Company', icon: Building2 },
    { to: '/recruiter/jobs', label: 'Drives', icon: Briefcase },
    { to: '/recruiter/jobs/create', label: 'Post a Drive', icon: PlusCircle },
    { to: '/recruiter/applicants', label: 'Applicants', icon: Users },
    { to: '/recruiter/interviews', label: 'Interviews', icon: CalendarCheck },
  ],
  officer: [
    { to: '/officer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/officer/companies', label: 'Companies', icon: Building2 },
    { to: '/officer/drives', label: 'Drives', icon: Briefcase },
    { to: '/officer/students', label: 'Students', icon: GraduationCap },
    { to: '/officer/applications', label: 'Applications', icon: FileText },
    { to: '/officer/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/companies', label: 'Companies', icon: Building2 },
    { to: '/admin/jobs', label: 'Drives', icon: Briefcase },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ],
};

const ROLE_LABEL = { student: 'Student', recruiter: 'Recruiter', officer: 'Placement Officer', admin: 'Administrator' };
const ROLE_ICON = { student: GraduationCap, recruiter: Building2, officer: ShieldCheck, admin: Settings };

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = NAV[user?.role] || [];
  const RoleIcon = ROLE_ICON[user?.role] || UserCircle;
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 transform flex-col bg-gradient-sidebar text-slate-200 shadow-xl transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between gap-2 border-b border-white/10 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-sm">
              <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.25} />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-none text-white">Campus Placements</p>
              <p className="mt-1 text-[11px] text-ink-300">Campus Placements</p>
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-ink-300 hover:bg-white/5 hover:text-white lg:hidden focus-ring"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4" aria-label="Primary">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-ring ${
                    isActive
                      ? 'bg-white/10 text-white shadow-inner-top'
                      : 'text-ink-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-brand transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                      aria-hidden="true"
                    />
                    <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-brand-300' : 'text-ink-400 group-hover:text-brand-300'}`} strokeWidth={2} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User / logout */}
        <div className="flex-shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-brand font-display text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-ink-400">{ROLE_LABEL[user?.role]}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink-300 transition-colors hover:bg-danger-500/10 hover:text-danger-300 focus-ring"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
            Log out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-ink-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-ink-800 lg:hidden focus-ring"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate font-display text-lg font-semibold text-ink-900 sm:text-xl">{title}</h1>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 sm:inline-flex">
              <RoleIcon className="h-3.5 w-3.5" />
              {ROLE_LABEL[user?.role]}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand font-display text-sm font-semibold text-white shadow-soft">
              {initials}
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

