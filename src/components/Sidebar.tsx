import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  TestTube2,
  FileSpreadsheet,
  ShieldCheck,
  FileText,
  CreditCard,
  UserCog,
  Settings,
  Building2,
  Activity,
  Layers,
  Sparkles,
  Globe,
  Shield,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';

export type NavTab =
  | 'dashboard'
  | 'patients'
  | 'requests'
  | 'samples'
  | 'results'
  | 'verification'
  | 'reports'
  | 'billing'
  | 'staff'
  | 'settings'
  | 'catalogue'
  | 'subscription';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenLanding?: () => void;
  onOpenPlatformAdmin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenLanding,
  onOpenPlatformAdmin,
}) => {
  const { currentLab, currentRole, samples, results, requests } = useLIS();

  const pendingSamplesCount = samples.filter((s) => s.status === 'collected' || s.status === 'pending_collection').length;
  const pendingResultsCount = requests.filter((r) => r.status === 'processing' || r.status === 'sample_collected').length;
  const pendingVerificationCount = results.filter((r) => r.status === 'submitted').length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'patients' as NavTab,
      label: 'Patients',
      icon: Users,
    },
    {
      id: 'requests' as NavTab,
      label: 'Test Requests',
      icon: ClipboardList,
    },
    {
      id: 'samples' as NavTab,
      label: 'Samples',
      icon: TestTube2,
      badge: pendingSamplesCount > 0 ? pendingSamplesCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'results' as NavTab,
      label: 'Results Entry',
      icon: FileSpreadsheet,
      badge: pendingResultsCount > 0 ? pendingResultsCount : undefined,
      badgeColor: 'bg-sky-500',
    },
    {
      id: 'verification' as NavTab,
      label: 'Verification',
      icon: ShieldCheck,
      badge: pendingVerificationCount > 0 ? pendingVerificationCount : undefined,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports',
      icon: FileText,
    },
    {
      id: 'billing' as NavTab,
      label: 'Billing',
      icon: CreditCard,
    },
    {
      id: 'catalogue' as NavTab,
      label: 'Test Catalogue',
      icon: Layers,
    },
    {
      id: 'staff' as NavTab,
      label: 'Staff Management',
      icon: UserCog,
    },
    {
      id: 'settings' as NavTab,
      label: 'Laboratory Settings',
      icon: Settings,
    },
    {
      id: 'subscription' as NavTab,
      label: 'Subscription & Plan',
      icon: Sparkles,
      badge: currentLab.subscription?.status === 'trial' ? 'Trial' : undefined,
      badgeColor: 'bg-teal-500',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/40">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">LabPro</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                LIS v4.2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Clinical Laboratory System</p>
          </div>
        </div>
      </div>

      {/* Active Tenant Card */}
      <div className="mx-3 my-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          <Building2 className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Current Workspace</span>
        </div>
        <p className="font-semibold text-xs text-white truncate" title={currentLab.name}>
          {currentLab.name}
        </p>
        <div className="flex items-center justify-between mt-1 text-[11px]">
          <span className="font-mono text-teal-300 bg-teal-950/60 px-1 rounded border border-teal-800/40">
            {currentLab.code}
          </span>
          <span className="text-slate-400">ID: {currentLab.id}</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
          Core Laboratory Workflow
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${item.badgeColor || 'bg-slate-700'}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* SaaS Portals Quick Switcher */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-1 text-xs">
        {onOpenLanding && (
          <button
            onClick={onOpenLanding}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-[11px]"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>Public SaaS Portal</span>
          </button>
        )}
        {onOpenPlatformAdmin && (
          <button
            onClick={onOpenPlatformAdmin}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-[11px]"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Platform Admin Control</span>
          </button>
        )}
      </div>

      {/* Role / Current User footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Active Role</span>
          <span className="text-[11px] font-mono capitalize px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
            {currentRole.replace('_', ' ')}
          </span>
        </div>
      </div>
    </aside>
  );
};
