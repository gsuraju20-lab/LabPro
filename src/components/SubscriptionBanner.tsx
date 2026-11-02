import React from 'react';
import { useLIS } from '../context/LISContext';
import { AlertTriangle, Clock, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface SubscriptionBannerProps {
  onOpenSubscription: () => void;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ onOpenSubscription }) => {
  const { currentLab } = useLIS();
  const sub = currentLab.subscription;

  if (!sub) return null;

  // If active and normal, show nothing or minimal clean state
  if (sub.status === 'active') {
    return null;
  }

  if (sub.status === 'trial') {
    // Calculate days remaining
    const trialEnd = sub.trialEndsAt ? new Date(sub.trialEndsAt).getTime() : Date.now() + 7 * 86400000;
    const diffDays = Math.max(0, Math.ceil((trialEnd - Date.now()) / (1000 * 60 * 60 * 24)));

    return (
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b border-teal-700/50 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            <strong className="font-semibold text-teal-200">{currentLab.name}</strong> is operating on a 14-day <strong>{sub.planName}</strong> trial.
            {diffDays > 0 ? (
              <span className="ml-1 text-slate-300">({diffDays} days remaining before sample & result limiters activate)</span>
            ) : (
              <span className="ml-1 text-amber-300 font-semibold">(Trial ending today)</span>
            )}
          </span>
        </div>
        <button
          onClick={onOpenSubscription}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded text-xs transition-colors shadow-xs"
        >
          <span>Upgrade to Full License</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (sub.status === 'grace_period') {
    return (
      <div className="bg-amber-900/90 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b border-amber-700 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
          <span>
            <strong>Subscription Grace Period:</strong> Renewal payment for {currentLab.name} is overdue. Access remains active through grace period.
          </span>
        </div>
        <button
          onClick={onOpenSubscription}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded text-xs transition-colors"
        >
          <span>Pay Overdue Invoice</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (currentLab.status === 'suspended' || sub.status === 'expired' || sub.status === 'cancelled') {
    return (
      <div className="bg-rose-950 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b border-rose-800 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Workspace Suspended:</strong> Diagnostic processing and report generation are currently locked for {currentLab.name}.
            {currentLab.suspendedReason && <span className="ml-1 text-rose-200 italic">({currentLab.suspendedReason})</span>}
          </span>
        </div>
        <button
          onClick={onOpenSubscription}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded text-xs transition-colors"
        >
          <span>Reactivate Laboratory</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
};
