import { UserRole } from '../types/lis';
import type { NavTab } from '../components/Sidebar';

export type LISAction =
  | 'view_dashboard'
  | 'manage_patients'
  | 'create_request'
  | 'manage_samples'
  | 'enter_results'
  | 'verify_results'
  | 'view_reports'
  | 'manage_billing'
  | 'view_catalogue'
  | 'manage_catalogue'
  | 'manage_staff'
  | 'manage_settings'
  | 'manage_subscription'
  | 'platform_admin';

const ALL_LIS_TABS: NavTab[] = [
  'dashboard',
  'patients',
  'requests',
  'samples',
  'results',
  'verification',
  'reports',
  'billing',
  'catalogue',
  'staff',
  'settings',
  'subscription',
];

const ROLE_TABS: Record<UserRole, NavTab[]> = {
  super_admin: ALL_LIS_TABS,
  lab_admin: ALL_LIS_TABS,
  pathologist: ['dashboard', 'patients', 'requests', 'samples', 'results', 'verification', 'reports', 'catalogue'],
  lab_supervisor: ['dashboard', 'patients', 'requests', 'samples', 'results', 'verification', 'reports', 'catalogue'],
  lab_scientist: ['dashboard', 'patients', 'requests', 'samples', 'results', 'reports', 'catalogue'],
  receptionist: ['dashboard', 'patients', 'requests', 'samples', 'reports', 'billing'],
  accountant: ['dashboard', 'patients', 'requests', 'reports', 'billing'],
};

const ROLE_ACTIONS: Record<UserRole, LISAction[]> = {
  super_admin: [
    'view_dashboard',
    'manage_patients',
    'create_request',
    'manage_samples',
    'enter_results',
    'verify_results',
    'view_reports',
    'manage_billing',
    'view_catalogue',
    'manage_catalogue',
    'manage_staff',
    'manage_settings',
    'manage_subscription',
    'platform_admin',
  ],
  lab_admin: [
    'view_dashboard',
    'manage_patients',
    'create_request',
    'manage_samples',
    'enter_results',
    'verify_results',
    'view_reports',
    'manage_billing',
    'view_catalogue',
    'manage_catalogue',
    'manage_staff',
    'manage_settings',
    'manage_subscription',
  ],
  pathologist: [
    'view_dashboard',
    'manage_patients',
    'create_request',
    'manage_samples',
    'enter_results',
    'verify_results',
    'view_reports',
    'view_catalogue',
  ],
  lab_supervisor: [
    'view_dashboard',
    'manage_patients',
    'create_request',
    'manage_samples',
    'enter_results',
    'verify_results',
    'view_reports',
    'view_catalogue',
  ],
  lab_scientist: [
    'view_dashboard',
    'manage_patients',
    'create_request',
    'manage_samples',
    'enter_results',
    'view_reports',
    'view_catalogue',
  ],
  receptionist: [
    'view_dashboard',
    'manage_patients',
    'create_request',
    'manage_samples',
    'view_reports',
    'manage_billing',
  ],
  accountant: [
    'view_dashboard',
    'view_reports',
    'manage_billing',
  ],
};

export function getPermittedTabs(role: UserRole | null, isPlatformSuperAdmin: boolean): NavTab[] {
  if (!role) return [];
  if (isPlatformSuperAdmin) return ALL_LIS_TABS;
  return ROLE_TABS[role] || ['dashboard'];
}

export function canAccessTab(tab: NavTab, role: UserRole | null, isPlatformSuperAdmin: boolean): boolean {
  if (!role) return false;
  if (isPlatformSuperAdmin) return true;
  return (ROLE_TABS[role] || []).includes(tab);
}

export function canPerformAction(
  action: LISAction,
  role: UserRole | null,
  isPlatformSuperAdmin: boolean
): boolean {
  if (!role) return false;
  if (action === 'platform_admin') return isPlatformSuperAdmin;
  if (isPlatformSuperAdmin) return true;
  return (ROLE_ACTIONS[role] || []).includes(action);
}
