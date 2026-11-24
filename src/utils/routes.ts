import { NavTab } from '../components/Sidebar';
import { SubscriptionBillingCycle, SubscriptionPlanId } from '../types/saas';

export type AppPortalMode = 'landing' | 'login' | 'onboarding' | 'lis' | 'platform_admin';

export type AuthRedirectReason = 'auth_required' | 'session_expired' | 'unauthorized';

export interface ParsedAppRoute {
  portalMode: AppPortalMode;
  tab: NavTab;
  isProtected: boolean;
  canonicalPath: string;
  redirectTo?: string;
  reason?: AuthRedirectReason;
  requestedLabId?: string;
  planId?: SubscriptionPlanId;
  billingCycle?: SubscriptionBillingCycle;
}

const VALID_TABS: NavTab[] = [
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

const PROTECTED_PATH_TO_TAB: Record<string, NavTab> = {
  '/dashboard': 'dashboard',
  '/patients': 'patients',
  '/requests': 'requests',
  '/samples': 'samples',
  '/results': 'results',
  '/verification': 'verification',
  '/reports': 'reports',
  '/billing': 'billing',
  '/catalogue': 'catalogue',
  '/staff': 'staff',
  '/settings': 'settings',
  '/subscription': 'subscription',
};

export function isValidNavTab(value: string): value is NavTab {
  return (VALID_TABS as string[]).includes(value);
}

/**
 * Prevents open-redirect attacks by allowing only relative internal paths
 * belonging to LabPro routes.
 */
export function sanitizeInternalRedirect(rawRedirect: string | null | undefined): string | undefined {
  if (!rawRedirect) return undefined;
  const trimmed = rawRedirect.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return undefined;
  }
  try {
    const parsed = new URL(trimmed, 'https://labpro.local');
    if (parsed.origin !== 'https://labpro.local') return undefined;
    const cleanPath = parsed.pathname.replace(/\/+$/, '') || '/';
    if (
      cleanPath === '/platform-admin' ||
      Boolean(PROTECTED_PATH_TO_TAB[cleanPath]) ||
      cleanPath.startsWith('/lab/')
    ) {
      return `${cleanPath}${parsed.search}`;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function parseAppRoute(pathname: string, search: string): ParsedAppRoute {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(search);
  const queryLabId = params.get('labId')?.trim() || undefined;

  if (normalizedPath === '/') {
    return {
      portalMode: 'landing',
      tab: 'dashboard',
      isProtected: false,
      canonicalPath: '/',
    };
  }

  if (normalizedPath === '/login') {
    const reasonParam = params.get('reason');
    const reason: AuthRedirectReason | undefined =
      reasonParam === 'session_expired' || reasonParam === 'auth_required' || reasonParam === 'unauthorized'
        ? reasonParam
        : undefined;
    return {
      portalMode: 'login',
      tab: 'dashboard',
      isProtected: false,
      canonicalPath: '/login',
      redirectTo: sanitizeInternalRedirect(params.get('redirect')),
      reason,
    };
  }

  if (normalizedPath === '/register') {
    const planParam = params.get('plan');
    const cycleParam = params.get('cycle');
    const planId: SubscriptionPlanId | undefined =
      planParam === 'starter' || planParam === 'professional' || planParam === 'enterprise'
        ? planParam
        : undefined;
    const billingCycle: SubscriptionBillingCycle | undefined =
      cycleParam === 'monthly' || cycleParam === 'annual' ? cycleParam : undefined;
    return {
      portalMode: 'onboarding',
      tab: 'dashboard',
      isProtected: false,
      canonicalPath: '/register',
      planId,
      billingCycle,
    };
  }

  if (normalizedPath === '/platform-admin') {
    return {
      portalMode: 'platform_admin',
      tab: 'dashboard',
      isProtected: true,
      canonicalPath: '/platform-admin',
      requestedLabId: queryLabId,
    };
  }

  // Handle tenant-prefixed deep links like /lab/:labId/:tab
  const labMatch = normalizedPath.match(/^\/lab\/([a-zA-Z0-9_-]+)(?:\/([a-zA-Z0-9_-]+))?$/);
  if (labMatch) {
    const pathLabId = labMatch[1];
    const pathTab = labMatch[2] || 'dashboard';
    const safeTab = isValidNavTab(pathTab) ? pathTab : 'dashboard';
    return {
      portalMode: 'lis',
      tab: safeTab,
      isProtected: true,
      canonicalPath: `/${safeTab}`,
      requestedLabId: pathLabId,
    };
  }

  const matchedTab = PROTECTED_PATH_TO_TAB[normalizedPath];
  if (matchedTab) {
    return {
      portalMode: 'lis',
      tab: matchedTab,
      isProtected: true,
      canonicalPath: `/${matchedTab}`,
      requestedLabId: queryLabId,
    };
  }

  // Unknown paths fall into protected dashboard routing so unauthenticated users are sent to /login
  return {
    portalMode: 'lis',
    tab: 'dashboard',
    isProtected: true,
    canonicalPath: '/dashboard',
    requestedLabId: queryLabId,
  };
}

export function buildLoginUrl(options?: {
  redirectTo?: string;
  reason?: AuthRedirectReason;
}): string {
  const params = new URLSearchParams();
  if (options?.reason) {
    params.set('reason', options.reason);
  }
  const safeRedirect = sanitizeInternalRedirect(options?.redirectTo);
  if (safeRedirect) {
    params.set('redirect', safeRedirect);
  }
  const qs = params.toString();
  return qs ? `/login?${qs}` : '/login';
}

export function buildRegisterUrl(plan?: SubscriptionPlanId, cycle?: SubscriptionBillingCycle): string {
  const params = new URLSearchParams();
  if (plan) params.set('plan', plan);
  if (cycle) params.set('cycle', cycle);
  const qs = params.toString();
  return qs ? `/register?${qs}` : '/register';
}
