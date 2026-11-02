import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Building2,
  UserCheck,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Clock,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { SubscriptionPlanId, SubscriptionBillingCycle } from '../types/saas';

interface OnboardingViewProps {
  initialPlanId?: SubscriptionPlanId;
  initialBillingCycle?: SubscriptionBillingCycle;
  onCancel: () => void;
  onSuccess: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  initialPlanId = 'professional',
  initialBillingCycle = 'monthly',
  onCancel,
  onSuccess,
}) => {
  const { plans, registerLaboratoryTenant } = useLIS();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Laboratory Details
  const [labName, setLabName] = useState('');
  const [labCode, setLabCode] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [labEmail, setLabEmail] = useState('');
  const [labPhone, setLabPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [currencySymbol, setCurrencySymbol] = useState('₦');
  const [accreditation, setAccreditation] = useState('MLSCN Registered Medical Testing Facility');

  // Step 2: Administrator Credentials
  const [adminName, setAdminName] = useState('');
  const [adminLicense, setAdminLicense] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Step 3: Subscription Selection
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(initialPlanId);
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>(initialBillingCycle);

  // Step 4: Checkout Simulation
  const [paymentMethod, setPaymentMethod] = useState<'trial' | 'paystack' | 'flutterwave'>('trial');
  const [testCardNumber, setTestCardNumber] = useState('4084 0840 8408 4084');
  const [testCardExpiry, setTestCardExpiry] = useState('12/28');
  const [testCardCvv, setTestCardCvv] = useState('408');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const payableAmount = billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice;

  // Auto-generate code from lab name
  const handleLabNameChange = (name: string) => {
    setLabName(name);
    if (!labCode || labCode === name.slice(0, 4).toUpperCase()) {
      const generated = name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);
      if (generated) setLabCode(generated);
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labName || !labCode || !labEmail || !address) {
      setErrorMsg('Please complete all required laboratory fields.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail) {
      setErrorMsg('Please specify the administrator name and email.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleNextStep3 = () => {
    setErrorMsg('');
    setStep(4);
  };

  const handleFinalActivation = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Simulate gateway authorization latency if paid
      if (paymentMethod !== 'trial') {
        await new Promise((resolve) => setTimeout(resolve, 1400));
      }

      await registerLaboratoryTenant({
        name: labName,
        code: labCode.toUpperCase(),
        licenseNumber: licenseNumber || `MLSCN/TEMP/${Date.now().toString().slice(-4)}`,
        email: labEmail,
        phone: labPhone || '+234 800 000 0000',
        address,
        currency,
        currencySymbol,
        accreditation,
        adminName,
        adminEmail,
        adminLicense,
        planId: selectedPlanId,
        billingCycle,
        paymentProvider: paymentMethod === 'flutterwave' ? 'flutterwave' : 'paystack',
        isTrial: paymentMethod === 'trial',
      });

      setIsProcessing(false);
      onSuccess();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Failed to complete laboratory registration.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-white">LabPro SaaS Provisioning</span>
            <p className="text-[11px] text-slate-400">Diagnostic Laboratory Onboarding Wizard</p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
        >
          Cancel Setup
        </button>
      </header>

      {/* Stepper Progress */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-8 pb-4">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className={`p-2.5 rounded-lg border ${step >= 1 ? 'border-teal-500 bg-teal-950/40 text-teal-300 font-semibold' : 'border-slate-800 text-slate-500'}`}>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Step 1</span>
            <span>1. Laboratory Identity</span>
          </div>
          <div className={`p-2.5 rounded-lg border ${step >= 2 ? 'border-teal-500 bg-teal-950/40 text-teal-300 font-semibold' : 'border-slate-800 text-slate-500'}`}>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Step 2</span>
            <span>2. Admin Account</span>
          </div>
          <div className={`p-2.5 rounded-lg border ${step >= 3 ? 'border-teal-500 bg-teal-950/40 text-teal-300 font-semibold' : 'border-slate-800 text-slate-500'}`}>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Step 3</span>
            <span>3. Subscription Tier</span>
          </div>
          <div className={`p-2.5 rounded-lg border ${step >= 4 ? 'border-teal-500 bg-teal-950/40 text-teal-300 font-semibold' : 'border-slate-800 text-slate-500'}`}>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Step 4</span>
            <span>4. Activation</span>
          </div>
        </div>
      </div>

      {/* Wizard Card Body */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col justify-center">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl">
          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: LABORATORY IDENTITY */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-5">
              <div className="border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Building2 className="w-4 h-4" />
                  <span>Facility Credentials</span>
                </div>
                <h2 className="text-xl font-bold text-white">Register Your Diagnostic Facility</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your clinical laboratory's legal registration details and primary contact channels.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Laboratory Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={labName}
                    onChange={(e) => handleLabNameChange(e.target.value)}
                    placeholder="e.g. Cedar Crest Specialist Pathology & Diagnostic Labs"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unique Lab Code / Acronym <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={labCode}
                    onChange={(e) => setLabCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CCDL"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-teal-400 uppercase focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Regulatory License Number (MLSCN / MOH)
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. MLSCN/REG/2026/0411"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Laboratory Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={labEmail}
                    onChange={(e) => setLabEmail(e.target.value)}
                    placeholder="lab@facility.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Telephone Number
                  </label>
                  <input
                    type="tel"
                    value={labPhone}
                    onChange={(e) => setLabPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Physical Facility Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Plot 12 Hospital Road, Victoria Island, Lagos"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operating Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      const cur = e.target.value;
                      setCurrency(cur);
                      if (cur === 'NGN') setCurrencySymbol('₦');
                      if (cur === 'USD') setCurrencySymbol('$');
                      if (cur === 'GHS') setCurrencySymbol('₵');
                      if (cur === 'KES') setCurrencySymbol('KSh');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="NGN">Nigerian Naira (₦ NGN)</option>
                    <option value="USD">US Dollar ($ USD)</option>
                    <option value="GHS">Ghanaian Cedi (₵ GHS)</option>
                    <option value="KES">Kenyan Shilling (KSh KES)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Accreditation & Quality Stamp
                  </label>
                  <input
                    type="text"
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value)}
                    placeholder="e.g. ISO 15189:2022 Certified"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                >
                  <span>Continue to Administrator Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ADMINISTRATOR ACCOUNT */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-5">
              <div className="border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span>Executive Governance</span>
                </div>
                <h2 className="text-xl font-bold text-white">Create Laboratory Administrator Account</h2>
                <p className="text-xs text-slate-400 mt-1">
                  This user will hold super administrator privileges over staff accounts, test pricing, and clinical departments for this workspace.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrator Full Name & Clinical Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Dr. Folashade Adeyemi, MBBS, FMCPath"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Medical / Practitioner Council License Number
                  </label>
                  <input
                    type="text"
                    value={adminLicense}
                    onChange={(e) => setAdminLicense(e.target.value)}
                    placeholder="e.g. MDCN/R/64102 or MLSCN/P/1908"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrator Login Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@yourfacility.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    You can also log in directly using Google Single Sign-On matching this email address.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Lab Details</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                >
                  <span>Select Subscription Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SELECT PLAN */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Service Tier</span>
                </div>
                <h2 className="text-xl font-bold text-white">Select Subscription Tier</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Every plan begins with an unrestricted 14-day free clinical trial.
                </p>

                {/* Billing cycle toggle */}
                <div className="mt-4 inline-flex items-center p-1 bg-slate-900 border border-slate-700 rounded-lg text-xs">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                      billingCycle === 'monthly' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                      billingCycle === 'annual' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Annual</span>
                    <span className="bg-amber-400 text-slate-950 text-[9px] px-1 rounded-sm font-bold">Save 2 Mo</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((p) => {
                  const price = billingCycle === 'monthly' ? p.monthlyPrice : p.annualPrice;
                  const isSelected = selectedPlanId === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-500 bg-teal-950/30 shadow-md ring-2 ring-teal-500/30'
                          : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm text-white">{p.name}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                        </div>
                        <p className="text-xs text-slate-400 mb-3">{p.tagline}</p>

                        <div className="text-lg font-extrabold text-white mb-2">
                          {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price)}
                          <span className="text-[10px] text-slate-400 font-normal"> / {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>

                        <div className="text-[11px] text-slate-300 space-y-1.5 border-t border-slate-700/80 pt-3">
                          <div>Staff: <strong>{p.limits.maxStaff === -1 ? 'Unlimited' : p.limits.maxStaff}</strong></div>
                          <div>Departments: <strong>{p.limits.maxDepartments === 50 ? 'Unlimited' : p.limits.maxDepartments}</strong></div>
                          <div>Barcode Labels: <strong>Included</strong></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Admin Setup</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep3}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                >
                  <span>Proceed to Final Activation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CHECKOUT & ACTIVATION */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activation & Gateway</span>
                </div>
                <h2 className="text-xl font-bold text-white">Instant Laboratory Provisioning</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ready to bootstrap <strong className="text-white">{labName}</strong> on the <strong>{selectedPlan.name}</strong> tier.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Laboratory Workspace:</span>
                  <strong className="text-white">{labName} ({labCode})</strong>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Selected Tier:</span>
                  <strong className="text-teal-300">{selectedPlan.name} ({billingCycle})</strong>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Administrator Account:</span>
                  <span className="text-white">{adminEmail}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-sm">
                  <span className="font-semibold text-slate-200">Subscription Dues:</span>
                  <span className="font-bold text-white">
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(payableAmount)}
                  </span>
                </div>
              </div>

              {/* Gateway Choice */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Choose Provisioning Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setPaymentMethod('trial')}
                    className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'trial'
                        ? 'border-teal-500 bg-teal-950/40 text-white'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between mb-1">
                      <span>14-Day Free Trial</span>
                      {paymentMethod === 'trial' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">Activate instantly without credit card</p>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('paystack')}
                    className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'paystack'
                        ? 'border-teal-500 bg-teal-950/40 text-white'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between mb-1">
                      <span>Paystack Gateway</span>
                      {paymentMethod === 'paystack' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">Card, Transfer & USSD (Sandbox Test)</p>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('flutterwave')}
                    className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'flutterwave'
                        ? 'border-teal-500 bg-teal-950/40 text-white'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between mb-1">
                      <span>Flutterwave</span>
                      {paymentMethod === 'flutterwave' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">Pan-African Gateway (Sandbox Test)</p>
                  </div>
                </div>
              </div>

              {/* Sandbox Card Inputs if payment selected */}
              {paymentMethod !== 'trial' && (
                <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-amber-400">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      {paymentMethod.toUpperCase()} SECURE TEST SANDBOX
                    </span>
                    <span>Test Credentials Pre-Filled</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Test Card Number</label>
                    <input
                      type="text"
                      value={testCardNumber}
                      onChange={(e) => setTestCardNumber(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Expiry</label>
                      <input
                        type="text"
                        value={testCardExpiry}
                        onChange={(e) => setTestCardExpiry(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">CVV</label>
                      <input
                        type="text"
                        value={testCardCvv}
                        onChange={(e) => setTestCardCvv(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Plans</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinalActivation}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Provisioning Diagnostic Tenant...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {paymentMethod === 'trial' ? 'Launch 14-Day Free Workspace' : 'Authorize & Launch Workspace'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
