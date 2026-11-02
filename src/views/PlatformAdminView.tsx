import React, { useState } from 'react';
import {
  Shield,
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  CreditCard,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Eye,
  Sliders,
  Calendar,
  Activity,
  FileText,
  UserX,
  UserCheck
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { SubscriptionPlanId } from '../types/saas';

interface PlatformAdminViewProps {
  onBackToWorkspace: () => void;
  onGoToLanding: () => void;
}

export const PlatformAdminView: React.FC<PlatformAdminViewProps> = ({
  onBackToWorkspace,
  onGoToLanding,
}) => {
  const {
    laboratories,
    plans,
    transactions,
    setCurrentLabId,
    toggleLaboratorySuspension,
    updateSubscription,
    updatePlanPricing,
  } = useLIS();

  const [activeTab, setActiveTab] = useState<'laboratories' | 'plans' | 'transactions'>('laboratories');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [suspensionModalLabId, setSuspensionModalLabId] = useState<string | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  // Editing plan prices modal state
  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  // Compute platform metrics
  const totalLabs = laboratories.length;
  const activeSubs = laboratories.filter((l) => l.subscription?.status === 'active').length;
  const trialLabs = laboratories.filter((l) => l.subscription?.status === 'trial').length;
  const suspendedLabs = laboratories.filter((l) => l.status === 'suspended').length;

  const mrr = laboratories.reduce((sum, lab) => {
    if (!lab.subscription || lab.subscription.status !== 'active') return sum;
    const plan = plans.find((p) => p.id === lab.subscription?.planId);
    if (!plan) return sum;
    return sum + (lab.subscription.billingCycle === 'annual' ? plan.annualPrice / 12 : plan.monthlyPrice);
  }, 0);

  const totalRevenue = transactions
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filter laboratories
  const filteredLabs = laboratories.filter((lab) => {
    const matchesSearch =
      lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'suspended'
        ? lab.status === 'suspended'
        : lab.subscription?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleSuspension = (labId: string) => {
    toggleLaboratorySuspension(labId, suspensionReason || undefined);
    setSuspensionModalLabId(null);
    setSuspensionReason('');
  };

  const handleSwitchToWorkspace = (labId: string) => {
    setCurrentLabId(labId);
    onBackToWorkspace();
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">LabPro Platform Super Admin</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                HQ Control Center
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-Tenant Governance, Subscriptions & Health</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGoToLanding}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            Public SaaS Portal
          </button>
          <button
            onClick={onBackToWorkspace}
            className="text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Open Clinical LIS</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Medical Privacy Boundary Warning */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Tenant Clinical Privacy Boundary Active</span>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded">
                HIPAA / NDPR Compliant Scope
              </span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Platform Super Administrators manage tenant licensing, billing, suspension, and quotas. In strict compliance with healthcare confidentiality regulations, patient diagnostic records, test results, and clinical notes are cryptographically scoped and inaccessible from platform admin dashboards.
            </p>
          </div>
        </div>

        {/* Platform KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Total Laboratories</span>
              <Building2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalLabs}</div>
            <div className="text-[11px] text-slate-400 mt-1">Multi-tenant registered</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Active Subscriptions</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{activeSubs}</div>
            <div className="text-[11px] text-emerald-400 mt-1">Paying tenants</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Trial Facilities</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{trialLabs}</div>
            <div className="text-[11px] text-amber-400 mt-1">14-day evaluation</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Platform MRR</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">{formatCurrency(mrr)}</div>
            <div className="text-[11px] text-cyan-400 mt-1">Monthly Recurring</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{formatCurrency(totalRevenue)}</div>
            <div className="text-[11px] text-indigo-400 mt-1">Paystack / Flutterwave</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('laboratories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'laboratories'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Laboratories Directory ({laboratories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Plan Tiers & Quotas ({plans.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Gateway Transactions ({transactions.length})</span>
          </button>
        </div>

        {/* TAB 1: LABORATORIES DIRECTORY */}
        {activeTab === 'laboratories' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search lab name, code, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Subscriptions</option>
                  <option value="trial">Trial Facilities</option>
                  <option value="suspended">Suspended Workspaces</option>
                </select>
              </div>
            </div>

            {/* Labs Table */}
            <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Laboratory Tenant</th>
                      <th className="py-3.5 px-4">Plan Tier</th>
                      <th className="py-3.5 px-4">Cycle</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Period End / Trial</th>
                      <th className="py-3.5 px-4">Owner / Contact</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredLabs.map((lab) => {
                      const sub = lab.subscription;
                      const isSuspended = lab.status === 'suspended';

                      return (
                        <tr key={lab.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-bold text-white text-sm">{lab.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-teal-400 font-semibold">{lab.code}</span>
                              <span>•</span>
                              <span>{lab.licenseNumber}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-200">
                            {sub?.planName || 'Unassigned'}
                          </td>
                          <td className="py-4 px-4 capitalize text-slate-400">
                            {sub?.billingCycle || 'N/A'}
                          </td>
                          <td className="py-4 px-4">
                            {isSuspended ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Suspended
                              </span>
                            ) : sub?.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Active License
                              </span>
                            ) : sub?.status === 'trial' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Trial
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400">
                                {sub?.status || 'Inactive'}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-slate-300">
                            {sub?.currentPeriodEnd
                              ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="py-4 px-4 text-slate-400">
                            <div>{lab.email}</div>
                            <div className="text-[11px] text-slate-500">{lab.phone}</div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleSwitchToWorkspace(lab.id)}
                                title="Open this lab's workspace"
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold transition-colors flex items-center gap-1"
                              >
                                <span>Switch</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>

                              {isSuspended ? (
                                <button
                                  onClick={() => handleToggleSuspension(lab.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                                >
                                  Reactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSuspensionModalLabId(lab.id);
                                    setSuspensionReason('Payment overdue or compliance audit hold');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBSCRIPTION PLANS & QUOTAS */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">SaaS Pricing Tiers & Quota Governance</h3>
                <p className="text-xs text-slate-400">Manage monthly rates, annual discounts, and resource quotas.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div key={p.id} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-lg">{p.name}</h4>
                    <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded">
                      ID: {p.id}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 min-h-[32px]">{p.tagline}</p>

                  <div className="space-y-2 border-t border-slate-700/80 pt-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Monthly Price:</span>
                      <strong className="text-white text-sm">{formatCurrency(p.monthlyPrice)}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Annual Price:</span>
                      <strong className="text-white text-sm">{formatCurrency(p.annualPrice)}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Staff Account Limit:</span>
                      <strong className="text-teal-300">
                        {p.limits.maxStaff === -1 ? 'Unlimited' : `${p.limits.maxStaff} staff`}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Department Limit:</span>
                      <strong className="text-teal-300">
                        {p.limits.maxDepartments === 50 ? 'Unlimited' : `${p.limits.maxDepartments} departments`}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setEditingPlan(p)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Adjust Pricing / Limits</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GATEWAY TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Payment Gateway Settlement Ledger</h3>
                <p className="text-xs text-slate-400">Audit trail of all Paystack and Flutterwave subscription payments.</p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Invoice / Ref</th>
                    <th className="py-3.5 px-4">Laboratory</th>
                    <th className="py-3.5 px-4">Tier / Cycle</th>
                    <th className="py-3.5 px-4">Gateway</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-mono">
                        <div className="text-white font-semibold">{tx.invoiceNumber}</div>
                        <div className="text-[11px] text-teal-400">{tx.reference}</div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-200">
                        {tx.laboratoryName}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {tx.planName}
                      </td>
                      <td className="py-4 px-4 uppercase text-slate-400 font-mono text-[11px]">
                        {tx.provider}
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {tx.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Suspension Modal */}
      {suspensionModalLabId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Suspend Laboratory Workspace</h3>
            </div>
            <p className="text-xs text-slate-300">
              Suspended laboratories are restricted to read-only access. Diagnostic accessioning and report sign-off will be blocked.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Suspension</label>
              <textarea
                rows={3}
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="e.g. Subscription invoice 45 days overdue, failure to renew licensing..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSuspensionModalLabId(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleSuspension(suspensionModalLabId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Pricing Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-base text-white">Adjust {editingPlan.name} Plan Pricing</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Price (NGN)</label>
              <input
                type="number"
                value={editingPlan.monthlyPrice}
                onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Annual Price (NGN)</label>
              <input
                type="number"
                value={editingPlan.annualPrice}
                onChange={(e) => setEditingPlan({ ...editingPlan, annualPrice: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updatePlanPricing(editingPlan.id, editingPlan.monthlyPrice, editingPlan.annualPrice);
                  setEditingPlan(null);
                }}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
