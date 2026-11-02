import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Shield,
  Layers,
  FileCheck,
  Barcode,
  CreditCard,
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  Lock,
  Clock,
  ChevronRight,
  Database,
  Award,
  Stethoscope,
  ChevronDown
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { SubscriptionPlanId, SubscriptionBillingCycle } from '../types/saas';

interface LandingPageViewProps {
  onStartOnboarding: (preselectedPlan?: SubscriptionPlanId, billingCycle?: SubscriptionBillingCycle) => void;
  onEnterWorkspace: () => void;
  onEnterPlatformAdmin: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onStartOnboarding,
  onEnterWorkspace,
  onEnterPlatformAdmin,
}) => {
  const { plans, currentLab } = useLIS();
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>('monthly');

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* SaaS Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white">LabPro</span>
                <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30 uppercase tracking-wider">
                  Cloud LIS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Medical Laboratory Information System</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-teal-400 transition-colors">Clinical Architecture</a>
            <a href="#workflow" className="hover:text-teal-400 transition-colors">Diagnostic Workflow</a>
            <a href="#pricing" className="hover:text-teal-400 transition-colors">Pricing & Plans</a>
            <a href="#compliance" className="hover:text-teal-400 transition-colors">Security & Isolation</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterWorkspace}
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Demo Workspace ({currentLab.code})
            </button>
            <button
              onClick={() => onStartOnboarding('professional', billingCycle)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <span>Register Laboratory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.18),rgba(255,255,255,0))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Regulatory Alignment Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-teal-300 text-xs font-medium mb-8 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>ISO 15189:2022 & MLSCN Standard Clinical Architecture</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-slate-400">Multi-Tenant SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Universal Medical Laboratory Information System
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            A comprehensive, cloud-native LIS built for clinical diagnostic laboratories, hospital pathology departments, and multi-branch laboratory chains. Streamline patient registration, barcode accessioning, result verification, and automated medical billing.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onStartOnboarding('professional', billingCycle)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base shadow-lg shadow-teal-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <span>Start 14-Day Free Laboratory Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onEnterWorkspace}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-base transition-colors"
            >
              <span>Open Clinical Workspace Demo</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Instant Workspace Provisioning</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Zero Credit Card Required for Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Paystack & Flutterwave NGN Billing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Strict Firestore Tenant Isolation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tenancy & Feature Architecture Section */}
      <section id="features" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">Multi-Tenant Engineering</h2>
            <p className="text-3xl font-extrabold text-white">Engineered for Diagnostics, Built for Scale</p>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Every laboratory operates inside a segregated, auditable workspace with distinct role-based access, test catalogues, and pricing models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-6 hover:border-teal-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-5">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cryptographic Tenant Isolation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Patient records, test results, and audit trails are scoped under dedicated laboratory document paths. Lab A can never access or query Lab B data.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-6 hover:border-teal-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                <Barcode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Thermal Barcode Accessioning</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generate and print standard 50×25mm specimen tube labels with Code-128 barcodes, patient IDs, and container preservation types.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-6 hover:border-teal-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Two-Tier Pathologist Sign-Off</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Medical laboratory scientists enter dynamic parameter values; certified consultant pathologists review, approve, reject, or digitally amend reports.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-6 hover:border-teal-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Configurable Test Catalogues</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Define specialized tests across Haematology, Chemistry, Microbiology, and Histopathology with custom normal/critical reference ranges.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-6 hover:border-teal-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Currency SaaS & Billing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Complete patient billing ledgers with split deposit tracking, discount authorization, and integrated Paystack / Flutterwave subscription gateway.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-6 hover:border-teal-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Tamper-Proof Clinical Audit Log</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automatic audit records of every patient entry, sample collection, verification decision, and amended parameter with timestamp and practitioner credentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostic Workflow Section */}
      <section id="workflow" className="py-20 bg-slate-950/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">Laboratory Pipeline</h2>
            <p className="text-3xl font-extrabold text-white">Full Lifecycle Medical Diagnostics</p>
            <p className="mt-3 text-slate-400 text-sm">
              Standardized eight-phase diagnostic workflow designed for clinical precision and turnaround efficiency.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { step: '01', title: 'Registration', desc: 'Patient dossier & clinical history' },
              { step: '02', title: 'Accessioning', desc: 'Test ordering & price calculation' },
              { step: '03', title: 'Phlebotomy', desc: 'Barcode tube labeling & collection' },
              { step: '04', title: 'Benchwork', desc: 'Analyzer & manual bench processing' },
              { step: '05', title: 'Result Entry', desc: 'Parameter values & panic flags' },
              { step: '06', title: 'Verification', desc: 'Pathologist digital review & sign' },
              { step: '07', title: 'PDF Release', desc: 'Official stamped laboratory report' },
              { step: '08', title: 'Audit Trail', desc: 'Traceable custody & compliance' },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center flex flex-col justify-between">
                <span className="text-xs font-mono font-bold text-teal-400 mb-2">{item.step}</span>
                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Matrix Section */}
      <section id="pricing" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">Transparent Subscription Pricing</h2>
            <p className="text-3xl font-extrabold text-white">Choose the Right Tier for Your Laboratory</p>
            <p className="mt-3 text-slate-400 text-sm">
              All plans include 14 days free trial. No credit card required to start. Localized for Nigerian & African healthcare facilities.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="mt-8 inline-flex items-center p-1 bg-slate-800 border border-slate-700 rounded-xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  2 Months Free
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
              const period = billingCycle === 'monthly' ? '/ month' : '/ year';

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl p-8 transition-all ${
                    plan.isPopular
                      ? 'bg-slate-800/90 border-2 border-teal-500 shadow-xl shadow-teal-500/10'
                      : 'bg-slate-800/50 border border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      Most Popular for Diagnostic Centers
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="mt-2 text-xs text-slate-400 min-h-[32px]">{plan.tagline}</p>

                    <div className="mt-6 mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-white">
                          {formatPrice(price)}
                        </span>
                        <span className="text-xs text-slate-400">{period}</span>
                      </div>
                      <p className="text-[11px] text-teal-400 mt-1">
                        {plan.trialDays}-day full feature trial included
                      </p>
                    </div>

                    <div className="space-y-3 border-t border-slate-700/60 pt-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Operational Limits</p>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Staff Accounts</span>
                        <strong className="text-white">
                          {plan.limits.maxStaff === -1 ? 'Unlimited' : `Up to ${plan.limits.maxStaff}`}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Clinical Departments</span>
                        <strong className="text-white">
                          {plan.limits.maxDepartments === 50 ? 'Unlimited' : `Up to ${plan.limits.maxDepartments}`}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Monthly Patient Capacity</span>
                        <strong className="text-white">
                          {plan.limits.maxPatientsPerMonth.toLocaleString()} patients
                        </strong>
                      </div>
                    </div>

                    <div className="space-y-2.5 border-t border-slate-700/60 pt-6 mt-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Key Features</p>
                      {plan.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4">
                    <button
                      onClick={() => onStartOnboarding(plan.id, billingCycle)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                        plan.isPopular
                          ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      <span>Get Started with {plan.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tenant Privacy & Compliance Banner */}
      <section id="compliance" className="py-16 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Lock className="w-4 h-4" />
                <span>Strict Medical Data Governance</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Patient Dossiers Are Never Shared Across Tenants
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                In strict compliance with healthcare confidentiality regulations and Firestore security rules, platform administrators have zero access to clinical patient health records. Every diagnostic report belongs exclusively to the issuing laboratory.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <button
                onClick={onEnterPlatformAdmin}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-teal-400" />
                <span>Platform Admin Portal</span>
              </button>
              <button
                onClick={() => onStartOnboarding('starter', 'monthly')}
                className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Create Tenant Laboratory
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-400 font-semibold">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>LabPro Medical Laboratory Information System &copy; 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span>ISO 15189 Aligned</span>
            <span>MLSCN Certified Architecture</span>
            <span>Multi-Tenant Cloud</span>
            <button onClick={onEnterPlatformAdmin} className="text-teal-400 hover:underline">
              Platform Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
