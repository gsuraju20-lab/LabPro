import React from 'react';
import { RequestPriority, RequestStatus, SampleStatus, ResultStatus, ResultFlag, PaymentStatus } from '../types/lis';

interface StatusBadgeProps {
  type: 'priority' | 'requestStatus' | 'sampleStatus' | 'resultStatus' | 'flag' | 'payment';
  value: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (type === 'priority') {
    const val = value as RequestPriority;
    if (val === 'stat') {
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
          STAT / EMERGENCY
        </span>
      );
    }
    if (val === 'urgent') {
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          URGENT
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-50 text-slate-700 border border-slate-200 ${pad}`}>
        Routine
      </span>
    );
  }

  if (type === 'requestStatus') {
    const val = value as RequestStatus;
    switch (val) {
      case 'completed':
        return <span className={`inline-flex items-center font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${pad}`}>Released & Completed</span>;
      case 'verified':
        return <span className={`inline-flex items-center font-medium rounded-md bg-teal-50 text-teal-700 border border-teal-200 ${pad}`}>Verified</span>;
      case 'results_entered':
        return <span className={`inline-flex items-center font-medium rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 ${pad}`}>Results Entered</span>;
      case 'processing':
        return <span className={`inline-flex items-center font-medium rounded-md bg-sky-50 text-sky-700 border border-sky-200 ${pad}`}>In Processing</span>;
      case 'sample_collected':
        return <span className={`inline-flex items-center font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${pad}`}>Sample Collected</span>;
      default:
        return <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${pad}`}>Registered</span>;
    }
  }

  if (type === 'sampleStatus') {
    const val = value as SampleStatus;
    switch (val) {
      case 'received':
        return <span className={`inline-flex items-center font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${pad}`}>Received at Lab</span>;
      case 'processing':
        return <span className={`inline-flex items-center font-medium rounded-md bg-sky-50 text-sky-700 border border-sky-200 ${pad}`}>Processing</span>;
      case 'collected':
        return <span className={`inline-flex items-center font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${pad}`}>Collected</span>;
      case 'rejected':
        return <span className={`inline-flex items-center font-medium rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${pad}`}>Rejected</span>;
      default:
        return <span className={`inline-flex items-center font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${pad}`}>Awaiting Collection</span>;
    }
  }

  if (type === 'resultStatus') {
    const val = value as ResultStatus;
    switch (val) {
      case 'verified':
        return <span className={`inline-flex items-center font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${pad}`}>Verified ✓</span>;
      case 'submitted':
        return <span className={`inline-flex items-center font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${pad}`}>Awaiting Review</span>;
      case 'amended':
        return <span className={`inline-flex items-center font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-200 ${pad}`}>Amended</span>;
      case 'rejected':
        return <span className={`inline-flex items-center font-medium rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${pad}`}>Returned</span>;
      default:
        return <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200 ${pad}`}>Draft</span>;
    }
  }

  if (type === 'flag') {
    const val = value as ResultFlag;
    switch (val) {
      case 'CRITICAL_HIGH':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white animate-pulse">▲ CRIT HIGH</span>;
      case 'CRITICAL_LOW':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white animate-pulse">▼ CRIT LOW</span>;
      case 'HIGH':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">▲ HIGH</span>;
      case 'LOW':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800">▼ LOW</span>;
      case 'ABNORMAL':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">ABNORMAL</span>;
      default:
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">NORMAL</span>;
    }
  }

  if (type === 'payment') {
    const val = value as PaymentStatus;
    switch (val) {
      case 'paid':
        return <span className={`inline-flex items-center font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${pad}`}>Paid</span>;
      case 'partial':
        return <span className={`inline-flex items-center font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${pad}`}>Partial</span>;
      default:
        return <span className={`inline-flex items-center font-medium rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${pad}`}>Unpaid</span>;
    }
  }

  return <span className={`inline-flex rounded bg-slate-100 text-slate-600 ${pad}`}>{value}</span>;
};
