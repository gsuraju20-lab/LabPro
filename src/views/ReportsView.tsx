import React, { useState } from 'react';
import {
  FileText,
  Search,
  Printer,
  Download,
  CheckCircle,
  Eye,
  Filter,
  Calendar,
  Lock,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { StatusBadge } from '../components/StatusBadge';

export const ReportsView: React.FC = () => {
  const { requests, patients, results, openReportModal, currentLab } = useLIS();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Requests that have verified results or are marked completed
  const eligibleRequests = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.requestNumber.toLowerCase().includes(term) ||
      r.patientName.toLowerCase().includes(term) ||
      r.referringDoctor.toLowerCase().includes(term);

    const isVerifiedOrCompleted = r.status === 'verified' || r.status === 'completed';
    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'verified'
        ? isVerifiedOrCompleted
        : !isVerifiedOrCompleted;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-700" />
            Clinical Diagnostic Reports Archive
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Electronically released, authenticated laboratory reports ready for physician delivery and high-resolution PDF printing.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search report by patient name, order #, or referring doctor..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Release Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-hidden font-medium"
          >
            <option value="all">All Diagnostic Orders</option>
            <option value="verified">Verified & Released Only</option>
            <option value="pending">Pending Pathologist Sign-off</option>
          </select>
        </div>
      </div>

      {/* Reports Directory */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Order / Report #</th>
                <th className="py-3 px-4">Patient Details</th>
                <th className="py-3 px-4">Referring Clinician</th>
                <th className="py-3 px-3">Date Ordered</th>
                <th className="py-3 px-3">Verification State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {eligibleRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No clinical reports match your filters.
                  </td>
                </tr>
              ) : (
                eligibleRequests.map((req) => {
                  const isReleased = req.status === 'verified' || req.status === 'completed';
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-teal-800">
                        {req.requestNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{req.patientName}</p>
                        <p className="text-[10px] text-slate-400">
                          {req.patientAge ? `${req.patientAge} Yrs • ` : ''}
                          <span className="capitalize">{req.patientGender || 'Adult'}</span>
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {req.referringDoctor}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {new Date(req.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge type="requestStatus" value={req.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openReportModal(req.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold shadow-xs transition-colors ${
                              isReleased
                                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            {isReleased ? 'Print Official PDF' : 'Preview Interim'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
