import React, { useState } from 'react';
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
import { SubscriptionBanner } from './components/SubscriptionBanner';
import { ClinicalReportModal } from './components/ClinicalReportModal';
import { NewRequestModal } from './components/NewRequestModal';
import { PatientModal } from './components/PatientModal';
import { AuthModal } from './components/AuthModal';
import { SubscriptionPlanId, SubscriptionBillingCycle } from './types/saas';

export type AppPortalMode = 'lis' | 'landing' | 'onboarding' | 'platform_admin';

function LISApp() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useLIS();
  const [portalMode, setPortalMode] = useState<AppPortalMode>('lis');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);

  // Onboarding pre-selected plan
  const [onboardingPlan, setOnboardingPlan] = useState<SubscriptionPlanId>('professional');
  const [onboardingCycle, setOnboardingCycle] = useState<SubscriptionBillingCycle>('monthly');

  const handleStartOnboarding = (plan?: SubscriptionPlanId, cycle?: SubscriptionBillingCycle) => {
    if (plan) setOnboardingPlan(plan);
    if (cycle) setOnboardingCycle(cycle);
    setPortalMode('onboarding');
  };

  if (portalMode === 'landing') {
    return (
      <LandingPageView
        onStartOnboarding={handleStartOnboarding}
        onEnterWorkspace={() => setPortalMode('lis')}
        onEnterPlatformAdmin={() => setPortalMode('platform_admin')}
      />
    );
  }

  if (portalMode === 'onboarding') {
    return (
      <OnboardingView
        initialPlanId={onboardingPlan}
        initialBillingCycle={onboardingCycle}
        onCancel={() => setPortalMode('landing')}
        onSuccess={() => {
          setPortalMode('lis');
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  if (portalMode === 'platform_admin') {
    return (
      <PlatformAdminView
        onBackToWorkspace={() => setPortalMode('lis')}
        onGoToLanding={() => setPortalMode('landing')}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 select-none">
      {/* Persistent Sidebar Navigation */}
      <div className="print:hidden h-full flex">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenLanding={() => setPortalMode('landing')}
          onOpenPlatformAdmin={() => setPortalMode('platform_admin')}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Workspace Alert Banner (Trial countdown, Grace period, Suspended notice) */}
        <SubscriptionBanner onOpenSubscription={() => setCurrentTab('subscription')} />

        {/* Top Navigation Bar */}
        <div className="print:hidden">
          <Header
            onNavigate={setCurrentTab}
            onOpenNewRequest={() => setIsNewRequestOpen(true)}
            onOpenNewPatient={() => setIsNewPatientOpen(true)}
            onOpenLanding={() => setPortalMode('landing')}
            onOpenPlatformAdmin={() => setPortalMode('platform_admin')}
          />
        </div>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                onNavigate={setCurrentTab}
                onOpenNewRequest={() => setIsNewRequestOpen(true)}
                onOpenNewPatient={() => setIsNewPatientOpen(true)}
              />
            )}
            {currentTab === 'patients' && (
              <PatientsView
                onOpenNewPatient={() => setIsNewPatientOpen(true)}
                onOpenNewRequest={() => setIsNewRequestOpen(true)}
              />
            )}
            {currentTab === 'requests' && (
              <RequestsView
                onOpenNewRequest={() => setIsNewRequestOpen(true)}
                onNavigate={setCurrentTab}
              />
            )}
            {currentTab === 'samples' && <SamplesView />}
            {currentTab === 'results' && <ResultEntryView />}
            {currentTab === 'verification' && <VerificationView />}
            {currentTab === 'reports' && <ReportsView />}
            {currentTab === 'billing' && <BillingView />}
            {currentTab === 'catalogue' && <CatalogueView />}
            {currentTab === 'staff' && <StaffView />}
            {currentTab === 'settings' && <SettingsView />}
            {currentTab === 'subscription' && <SubscriptionManagementView />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <ClinicalReportModal />
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onOpenNewPatient={() => setIsNewPatientOpen(true)}
      />
      <PatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
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
