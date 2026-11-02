import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  Building2,
  Users,
  Layers,
  Sparkles,
  Receipt,
  Download,
  Check,
  Zap,
  Lock
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { SubscriptionPlanId, SubscriptionBillingCycle } from '../types/saas';

export const SubscriptionManagementView: React.FC = () => {
  const { currentLab, plans, staffList, departments, transactions, updateSubscription } = useLIS();
  const sub = currentLab.subscription;

  const currentPlan = plans.find((p) => p.id === (sub?.planId || currentLab.planId)) || plans[0];

  // Usage calculations
  const labStaffCount = staffList.filter((s) => s.labId === currentLab.id).length;
  const labDepCount = departments.filter((d) => d.labId === currentLab.id).length;

  const maxStaff = currentPlan.limits.maxStaff;
  const maxDeps = currentPlan.limits.maxDepartments;

  const staffUsagePercent = maxStaff === -1 ? 15 : Math.min(100, Math.round((labStaffCount / maxStaff) * 100));
  const depUsagePercent = maxDeps === 50 ? 20 : Math.min(100, Math.round((labDepCount / maxDeps) * 100));

  // Upgrade Modal State
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [targetPlanId, setTargetPlanId] = useState<SubscriptionPlanId>('professional');
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const selectedUpgradePlan = plans.find((p) => p.id === targetPlanId) || plans[1];
  const payableAmount = billingCycle === 'monthly' ? selectedUpgradePlan.monthlyPrice : selectedUpgradePlan.annualPrice;

  // Filter lab's payment transactions
  const labTransactions = transactions.filter((t) => t.labId === currentLab.id);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    updateSubscription(currentLab.id, targetPlanId, billingCycle, 'paystack');

    setIsProcessing(false);
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setIsUpgradeOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Subscription & Licensing</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              Tenant: {currentLab.code}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your medical laboratory's SaaS tier, operational quotas, and Paystack billing settlements.
          </p>
        </div>

        <button
          onClick={() => {
            setTargetPlanId(currentPlan.id === 'starter' ? 'professional' : 'enterprise');
            setIsUpgradeOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>Change / Upgrade Plan</span>
        </button>
      </div>

      {/* Plan Status Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Current Active Plan</span>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-2xl font-extrabold text-slate-900">{currentPlan.name} Tier</h2>
                {sub?.status === 'active' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active License
                  </span>
                )}
                {sub?.status === 'trial' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    14-Day Free Evaluation
                  </span>
                )}
                {currentLab.status === 'suspended' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{currentPlan.tagline}</p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl font-black text-slate-900">
                {formatCurrency(sub?.billingCycle === 'annual' ? currentPlan.annualPrice : currentPlan.monthlyPrice)}
              </div>
              <div className="text-xs text-slate-500 capitalize">
                Billed {sub?.billingCycle || 'monthly'}
              </div>
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Billing Cycle</span>
              <strong className="text-slate-800 capitalize">{sub?.billingCycle || 'Monthly'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Next Renewal Date</span>
              <strong className="text-slate-800">
                {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'Nov 30, 2026'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Payment Provider</span>
              <strong className="text-slate-800 uppercase font-mono">{sub?.paymentProvider || 'Paystack'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Auto-Renew</span>
              <strong className="text-emerald-700 font-semibold">{sub?.autoRenew ? 'Enabled' : 'Manual'}</strong>
            </div>
          </div>
        </div>

        {/* Support & SLA card */}
        <div className="bg-slate-900 rounded-2xl text-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Diagnostic SLA Guaranteed</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">ISO 15189 Ready Infrastructure</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated audit trail persistence, thermal tube barcodes, and digital pathologist report sign-offs are active for {currentLab.name}.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span>Cloud Storage:</span>
              <span className="text-teal-400 font-mono">Encrypted Firestore</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Clinical Backup:</span>
              <span className="text-teal-400">Continuous Point-in-Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Quotas & Usage Meters */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Resource Quotas & Utilization</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Staff Quota */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Staff Accounts</span>
              </span>
              <span className="font-mono text-slate-800">
                {labStaffCount} / {maxStaff === -1 ? '∞' : maxStaff}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  staffUsagePercent > 90 ? 'bg-rose-500' : 'bg-teal-600'
                }`}
                style={{ width: `${staffUsagePercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {maxStaff === -1
                ? 'Unlimited medical staff permitted'
                : `${maxStaff - labStaffCount} additional seats available`}
            </p>
          </div>

          {/* Department Quota */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Clinical Departments</span>
              </span>
              <span className="font-mono text-slate-800">
                {labDepCount} / {maxDeps === 50 ? '∞' : maxDeps}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${depUsagePercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {maxDeps === 50
                ? 'Unlimited departments configured'
                : `${maxDeps - labDepCount} departments remaining`}
            </p>
          </div>

          {/* Monthly Capacity */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Monthly Patient Volume</span>
              </span>
              <span className="font-mono text-slate-800">
                Active / {currentPlan.limits.maxPatientsPerMonth.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: '18%' }} />
            </div>
            <p className="text-[11px] text-slate-500">Patient capacity resets on 1st of month</p>
          </div>
        </div>
      </div>

      {/* Plan Capabilities Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Included Plan Capabilities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {currentPlan.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span className="font-medium text-slate-800">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Laboratory SaaS Invoices History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Subscription Invoices & Receipts</h3>
            <p className="text-xs text-slate-500">Historical billing settlements for {currentLab.name}</p>
          </div>
          <Receipt className="w-5 h-5 text-slate-400" />
        </div>

        {labTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No gateway subscription invoices recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice No.</th>
                  <th className="py-3 px-4">Plan / Cycle</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {tx.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {tx.planName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-teal-700">
                      {tx.reference}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Official VAT Receipt: ${tx.invoiceNumber}\nAmount: ${formatCurrency(tx.amount)}\nGateway: Paystack Nigeria\nStatus: Settled`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPGRADE MODAL */}
      {isUpgradeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Upgrade / Change Subscription</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a new plan tier for {currentLab.name}. Changes take effect immediately.
                </p>
              </div>

              {/* Cycle Toggle */}
              <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                    billingCycle === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <span>Annual</span>
                  <span className="bg-amber-400 text-slate-950 text-[9px] px-1 rounded-sm font-bold">2 Mo Free</span>
                </button>
              </div>
            </div>

            {/* Plan selection grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plans.map((p) => {
                const isSelected = targetPlanId === p.id;
                const price = billingCycle === 'monthly' ? p.monthlyPrice : p.annualPrice;

                return (
                  <div
                    key={p.id}
                    onClick={() => setTargetPlanId(p.id)}
                    className={`cursor-pointer p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                    </div>
                    <div className="text-base font-extrabold text-slate-900 mb-2">
                      {formatCurrency(price)}
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div>Staff: {p.limits.maxStaff === -1 ? 'Unlimited' : p.limits.maxStaff}</div>
                      <div>Departments: {p.limits.maxDepartments === 50 ? 'Unlimited' : p.limits.maxDepartments}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paystack Test Gateway Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-800 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  <span>Paystack Direct Settlement (Sandbox)</span>
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(payableAmount)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Payment simulation: Click Authorize Upgrade to execute instant billing, upgrade your quotas, and record an audited tax invoice.
              </p>
            </div>

            {checkoutSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Subscription successfully updated! Quotas refreshed.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsUpgradeOpen(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing || checkoutSuccess}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing with Paystack...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize Upgrade ({formatCurrency(payableAmount)})</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
