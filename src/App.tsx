import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  Lock,
  ShieldAlert,
  Building2,
  LogOut,
  ArrowLeft,
  Globe,
} from 'lucide-react';
import { LISProvider, useLIS } from './context/LISContext';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { PatientsView } from './views/PatientsView';
import { RequestsView } from './views/RequestsView';
import { SamplesView } from './views/SamplesView';
import { ResultEntryView } from './views/ResultEntryView';
import { VerificationView } from './views/VerificationView';
import { ReportsView } from './views/ReportsView';
import { BillingView } from './views/BillingView';
import { CatalogueView } from './views/CatalogueView';
import { StaffView } from './views/StaffView';
import { SettingsView } from './views/SettingsView';
import { SubscriptionManagementView } from './views/SubscriptionManagementView';
import { LandingPageView } from './views/LandingPageView';
import { OnboardingView } from './views/OnboardingView';
import { PlatformAdminView } from './views/PlatformAdminView';
import { LoginView } from './views/LoginView';
import { SubscriptionBanner } from './components/SubscriptionBanner';
import { ClinicalReportModal } from './components/ClinicalReportModal';
import { NewRequestModal } from './components/NewRequestModal';
import { PatientModal } from './components/PatientModal';
import { AuthModal } from './components/AuthModal';
import { SubscriptionPlanId, SubscriptionBillingCycle } from './types/saas';
import { canAccessTab, canPerformAction } from './utils/rbac';
import {
  ParsedAppRoute,
  parseAppRoute,
  buildLoginUrl,
  buildRegisterUrl,
  sanitizeInternalRedirect,
} from './utils/routes';

function LISApp() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUserProfile,
    currentRole,
    currentLab,
    laboratories,
    setCurrentLabId,
    isPlatformSuperAdmin,
    isAuthReady,
    isAuthenticated,
    isStaffSuspended,
    sessionExpiredNotice,
    logout,
  } = useLIS();

  const [route, setRoute] = useState<ParsedAppRoute>(() =>
    parseAppRoute(window.location.pathname, window.location.search)
  );
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);

  // Onboarding pre-selected plan
  const [onboardingPlan, setOnboardingPlan] = useState<SubscriptionPlanId>(
    route.planId || 'professional'
  );
  const [onboardingCycle, setOnboardingCycle] = useState<SubscriptionBillingCycle>(
    route.billingCycle || 'monthly'
  );

  const wasAuthenticatedRef = useRef<boolean>(false);

  const navigateTo = useCallback((path: string, replace = false) => {
    const parsedUrl = new URL(path, window.location.origin);
    const nextUrl = `${parsedUrl.pathname}${parsedUrl.search}`;
    if (replace) {
      window.history.replaceState(null, '', nextUrl);
    } else {
      window.history.pushState(null, '', nextUrl);
    }
    setRoute(parseAppRoute(parsedUrl.pathname, parsedUrl.search));
    setIsMobileNavOpen(false);
  }, []);

  // Keep route synchronized with browser Back / Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseAppRoute(window.location.pathname, window.location.search));
      setIsMobileNavOpen(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redirect unauthenticated or expired sessions away from protected routes immediately
  useEffect(() => {
    if (!isAuthReady) return;

    if (route.isProtected && !isAuthenticated) {
      const requestedFullPath = `${window.location.pathname}${window.location.search}` || route.canonicalPath;
      const loginUrl = buildLoginUrl({
        redirectTo: requestedFullPath,
        reason: sessionExpiredNotice ? 'session_expired' : 'auth_required',
      });
      // Push on logout transition so Browser Back re-triggers protection; replace on direct unauthenticated hit
      const shouldReplace = !wasAuthenticatedRef.current;
      wasAuthenticatedRef.current = false;
      if (`${window.location.pathname}${window.location.search}` !== loginUrl) {
        navigateTo(loginUrl, shouldReplace);
      }
      return;
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthReady, isAuthenticated, route.isProtected, route.canonicalPath, sessionExpiredNotice, navigateTo]);

  // If user is on /login and already authenticated & assigned, redirect cleanly to saved route or /dashboard
  useEffect(() => {
    if (!isAuthReady || route.portalMode !== 'login' || !isAuthenticated) return;
    if (isStaffSuspended) return;
    if (currentUserProfile?.labId === 'unassigned' && !isPlatformSuperAdmin) return;

    const target = sanitizeInternalRedirect(route.redirectTo) || '/dashboard';
    navigateTo(target, true);
  }, [
    isAuthReady,
    route.portalMode,
    route.redirectTo,
    isAuthenticated,
    isStaffSuspended,
    currentUserProfile?.labId,
    isPlatformSuperAdmin,
    navigateTo,
  ]);

  // Allow Platform Super Admin deep-links to switch active lab when valid
  useEffect(() => {
    if (
      isAuthReady &&
      isAuthenticated &&
      route.isProtected &&
      route.requestedLabId &&
      isPlatformSuperAdmin &&
      route.requestedLabId !== currentLab.id &&
      laboratories.some((l) => l.id === route.requestedLabId)
    ) {
      setCurrentLabId(route.requestedLabId);
    }
  }, [
    isAuthReady,
    isAuthenticated,
    route.isProtected,
    route.requestedLabId,
    isPlatformSuperAdmin,
    currentLab.id,
    laboratories,
    setCurrentLabId,
  ]);

  const handleSelectTab = (tab: NavTab) => {
    if (!canAccessTab(tab, currentRole, isPlatformSuperAdmin)) {
      return;
    }
    navigateTo(`/${tab}`);
  };

  const handleOpenNewRequest = () => {
    if (canPerformAction('create_request', currentRole, isPlatformSuperAdmin)) {
      setIsNewRequestOpen(true);
    }
  };

  const handleOpenNewPatient = () => {
    if (canPerformAction('manage_patients', currentRole, isPlatformSuperAdmin)) {
      setIsNewPatientOpen(true);
    }
  };

  const handleStartOnboarding = (plan?: SubscriptionPlanId, cycle?: SubscriptionBillingCycle) => {
    const nextPlan = plan || onboardingPlan;
    const nextCycle = cycle || onboardingCycle;
    setOnboardingPlan(nextPlan);
    setOnboardingCycle(nextCycle);
    navigateTo(buildRegisterUrl(nextPlan, nextCycle));
  };

  const handleCompleteLogin = (redirectTarget?: string) => {
    const safeTarget = sanitizeInternalRedirect(redirectTarget);
    navigateTo(safeTarget || '/dashboard', true);
  };

  const handleLogoutAndRedirect = async () => {
    await logout();
    navigateTo(buildLoginUrl({ reason: 'auth_required' }), false);
  };

  // =========================================================================
  // 1. PUBLIC ROUTES (No clinical or tenant data rendered)
  // =========================================================================
  if (route.portalMode === 'landing') {
    return (
      <LandingPageView
        onStartOnboarding={handleStartOnboarding}
        onEnterLogin={() => navigateTo(buildLoginUrl())}
        onEnterWorkspace={() => navigateTo('/dashboard')}
        onEnterPlatformAdmin={() => navigateTo('/platform-admin')}
      />
    );
  }

  if (route.portalMode === 'login') {
    return (
      <LoginView
        redirectTo={route.redirectTo}
        reason={route.reason}
        onSuccess={handleCompleteLogin}
        onRegister={() => handleStartOnboarding()}
        onOpenLanding={() => navigateTo('/')}
      />
    );
  }

  if (route.portalMode === 'onboarding') {
    return (
      <OnboardingView
        initialPlanId={route.planId || onboardingPlan}
        initialBillingCycle={route.billingCycle || onboardingCycle}
        onCancel={() => navigateTo('/')}
        onSuccess={() => navigateTo('/dashboard', true)}
      />
    );
  }

  // =========================================================================
  // 2. PROTECTED ROUTE GATES (Never render clinical UI until fully verified)
  // =========================================================================
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-bold text-white">Verifying Clinical Session</h1>
            <p className="text-xs text-slate-400">Checking Firebase Authentication &amp; tenant permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const requestedFullPath = `${window.location.pathname}${window.location.search}` || route.canonicalPath;
    return (
      <LoginView
        redirectTo={sanitizeInternalRedirect(requestedFullPath)}
        reason={sessionExpiredNotice ? 'session_expired' : 'auth_required'}
        onSuccess={handleCompleteLogin}
        onRegister={() => handleStartOnboarding()}
        onOpenLanding={() => navigateTo('/')}
      />
    );
  }

  if (isStaffSuspended) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-800/90 border border-rose-500/40 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Access Suspended
            </span>
            <h2 className="text-xl font-bold text-white pt-1">Staff Account Deactivated</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your account (<strong>{currentUserProfile?.email}</strong>) is currently suspended and cannot access laboratory workspaces or patient records.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleLogoutAndRedirect}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={() => navigateTo('/')}
              className="w-full py-2 px-4 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Public SaaS Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUserProfile?.labId === 'unassigned' && !isPlatformSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-800/90 border border-amber-500/40 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Pending Laboratory Authorization
            </span>
            <h2 className="text-xl font-bold text-white pt-1">No Laboratory Tenant Assigned</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are signed in as <strong>{currentUserProfile.email}</strong>, but your account has not been assigned to any diagnostic laboratory yet. Ask your Laboratory Administrator to add your email under Staff Management, or register a new laboratory facility.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => handleStartOnboarding()}
              className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
            >
              Register New Laboratory Workspace
            </button>
            <button
              onClick={handleLogoutAndRedirect}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={() => navigateTo('/')}
              className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public SaaS Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Block cross-tenant URL manipulation (/lab/:labId/... or ?labId=...)
  if (
    route.requestedLabId &&
    route.requestedLabId !== currentUserProfile?.labId &&
    !isPlatformSuperAdmin
  ) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-800/90 border border-rose-500/40 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              403 Cross-Tenant Access Denied
            </span>
            <h2 className="text-xl font-bold text-white pt-1">Unauthorized Laboratory Workspace</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your account is restricted to <strong>{currentLab.name}</strong> (<span className="font-mono">{currentUserProfile?.labId}</span>). You are not permitted to access tenant <span className="font-mono">{route.requestedLabId}</span>.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => navigateTo('/dashboard', true)}
              className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to My Laboratory</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (route.portalMode === 'platform_admin') {
    return (
      <PlatformAdminView
        onBackToWorkspace={() => navigateTo('/dashboard')}
        onGoToLanding={() => navigateTo('/')}
      />
    );
  }

  const isTabAuthorized = canAccessTab(route.tab, currentRole, isPlatformSuperAdmin);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 font-sans text-slate-900 select-none">
      {/* Desktop Persistent Sidebar Navigation (lg+) */}
      <div className="hidden lg:flex print:hidden h-full shrink-0">
        <Sidebar
          currentTab={route.tab}
          onSelectTab={handleSelectTab}
          onOpenLanding={() => navigateTo('/')}
          onOpenPlatformAdmin={() => navigateTo('/platform-admin')}
        />
      </div>

      {/* Mobile & Tablet Collapsible Slide-Over Navigation Drawer (<lg) */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden print:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Laboratory Navigation"
        >
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative z-10 flex h-full max-w-[85vw] shadow-2xl">
            <Sidebar
              currentTab={route.tab}
              onSelectTab={handleSelectTab}
              onOpenLanding={() => navigateTo('/')}
              onOpenPlatformAdmin={() => navigateTo('/platform-admin')}
              onCloseMobile={() => setIsMobileNavOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Workspace Alert Banner */}
        <SubscriptionBanner onOpenSubscription={() => handleSelectTab('subscription')} />

        {/* Top Navigation Bar */}
        <div className="print:hidden">
          <Header
            onNavigate={handleSelectTab}
            onOpenNewRequest={handleOpenNewRequest}
            onOpenNewPatient={handleOpenNewPatient}
            onOpenLanding={() => navigateTo('/')}
            onOpenPlatformAdmin={() => navigateTo('/platform-admin')}
            onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          />
        </div>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto">
            {!isTabAuthorized ? (
              <div className="max-w-lg mx-auto mt-10 bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    403 Forbidden
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">Unauthorized Module Access</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your current role (<span className="font-mono font-semibold">{currentRole}</span>) does not have permission to access <span className="font-mono">/{route.tab}</span>.
                  </p>
                </div>
                <button
                  onClick={() => navigateTo('/dashboard', true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Permitted Dashboard</span>
                </button>
              </div>
            ) : (
              <>
                {route.tab === 'dashboard' && (
                  <DashboardView
                    onNavigate={handleSelectTab}
                    onOpenNewRequest={handleOpenNewRequest}
                    onOpenNewPatient={handleOpenNewPatient}
                  />
                )}
                {route.tab === 'patients' && (
                  <PatientsView
                    onOpenNewPatient={handleOpenNewPatient}
                    onOpenNewRequest={handleOpenNewRequest}
                  />
                )}
                {route.tab === 'requests' && (
                  <RequestsView
                    onOpenNewRequest={handleOpenNewRequest}
                    onNavigate={handleSelectTab}
                  />
                )}
                {route.tab === 'samples' && <SamplesView />}
                {route.tab === 'results' && <ResultEntryView />}
                {route.tab === 'verification' && <VerificationView />}
                {route.tab === 'reports' && <ReportsView />}
                {route.tab === 'billing' && <BillingView />}
                {route.tab === 'catalogue' && <CatalogueView />}
                {route.tab === 'staff' && <StaffView />}
                {route.tab === 'settings' && <SettingsView />}
                {route.tab === 'subscription' && <SubscriptionManagementView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <ClinicalReportModal />
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onOpenNewPatient={handleOpenNewPatient}
      />
      <PatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        isBlocking={false}
        onClose={() => setIsAuthModalOpen(false)}
        onStartOnboarding={() => {
          setIsAuthModalOpen(false);
          handleStartOnboarding();
        }}
        onOpenLanding={() => {
          setIsAuthModalOpen(false);
          navigateTo('/');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LISProvider>
      <LISApp />
    </LISProvider>
  );
}
