import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Plus,
  Filter,
  FileSpreadsheet,
  FileText,
  TestTube2,
  AlertCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { StatusBadge } from '../components/StatusBadge';
import { RequestPriority, RequestStatus, PaymentStatus } from '../types/lis';
import { NavTab } from '../components/Sidebar';

interface RequestsViewProps {
  onOpenNewRequest: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  onOpenNewRequest,
  onNavigate,
}) => {
  const { currentLab, requests, tests, openReportModal, samples } = useLIS();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredRequests = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.requestNumber.toLowerCase().includes(term) ||
      r.patientName.toLowerCase().includes(term) ||
      r.referringDoctor.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-700" />
            Diagnostic Test Requests & Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accessioning orders, referring clinicians, clinical priority triage, and processing status.
          </p>
        </div>

        <button
          onClick={onOpenNewRequest}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create Test Order
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order #, patient name, or referring doctor..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-hidden font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="sample_collected">Sample Collected</option>
              <option value="processing">In Processing</option>
              <option value="results_entered">Results Entered</option>
              <option value="verified">Verified</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-hidden font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT / Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-4">Requested Tests</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Billing</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No diagnostic requests match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const reqTests = tests.filter((t) => req.testIds.includes(t.id));
                  const isVerifiedOrCompleted = req.status === 'verified' || req.status === 'completed';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-teal-800">
                        {req.requestNumber}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {new Date(req.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{req.patientName}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[190px]">
                          Ref: {req.referringDoctor}
                        </p>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge type="priority" value={req.priority} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {reqTests.map((t) => (
                            <span
                              key={t.id}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge type="requestStatus" value={req.status} />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 block">
                            {currentLab.currencySymbol}{req.totalAmount.toLocaleString()}
                          </span>
                          <StatusBadge type="payment" value={req.paymentStatus} />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isVerifiedOrCompleted ? (
                            <button
                              onClick={() => openReportModal(req.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-semibold text-xs border border-teal-200 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Report
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => onNavigate('results')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded font-semibold text-xs border border-sky-200 transition-colors"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                Enter Results
                              </button>
                              <button
                                onClick={() => onNavigate('samples')}
                                className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded border border-transparent hover:border-amber-200 transition-colors"
                                title="View Specimen Samples"
                              >
                                <TestTube2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
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
