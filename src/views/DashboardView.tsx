import React from 'react';
import {
  Users,
  ClipboardList,
  TestTube2,
  FileSpreadsheet,
  ShieldCheck,
  FileCheck2,
  Plus,
  ArrowUpRight,
  Clock,
  Activity,
  AlertCircle,
  Building2,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { StatusBadge } from '../components/StatusBadge';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenNewRequest: () => void;
  onOpenNewPatient: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewRequest,
  onOpenNewPatient,
}) => {
  const {
    currentLab,
    patients,
    requests,
    samples,
    results,
    auditLogs,
    tests,
    openReportModal,
  } = useLIS();

  // Metrics
  const totalPatients = patients.length;
  const todaysRequests = requests.length;
  const samplesAwaitingProcessing = samples.filter(
    (s) => s.status === 'collected' || s.status === 'received'
  ).length;
  const resultsAwaitingEntry = requests.filter(
    (r) => r.status === 'processing' || r.status === 'sample_collected'
  ).length;
  const resultsAwaitingVerification = results.filter((r) => r.status === 'submitted').length;
  const completedReports = requests.filter(
    (r) => r.status === 'verified' || r.status === 'completed'
  ).length;

  // Department distribution
  const departmentCounts: Record<string, number> = {};
  tests.forEach((t) => {
    departmentCounts[t.department] = (departmentCounts[t.department] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
                Active Workspace
              </span>
              <span className="text-xs text-slate-400">• {currentLab.code}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {currentLab.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Universal Clinical Laboratory Information System. Real-time patient accessioning, automated specimen routing, result validation, and accredited diagnostic reporting.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenNewRequest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Test Order
            </button>
            <button
              onClick={onOpenNewPatient}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              Register Patient
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Patients */}
        <div
          onClick={() => onNavigate('patients')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Patients</span>
            <Users className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPatients}</div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Registered Dossiers
          </p>
        </div>

        {/* Card 2: Test Requests */}
        <div
          onClick={() => onNavigate('requests')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Orders Today</span>
            <ClipboardList className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{todaysRequests}</div>
          <p className="text-[10px] text-slate-400 mt-1">Diagnostic Requests</p>
        </div>

        {/* Card 3: Samples Awaiting */}
        <div
          onClick={() => onNavigate('samples')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Specimens</span>
            <TestTube2 className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{samplesAwaitingProcessing}</div>
          <p className="text-[10px] text-amber-600 font-medium mt-1">In Processing / Lab</p>
        </div>

        {/* Card 4: Results Awaiting Entry */}
        <div
          onClick={() => onNavigate('results')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-sky-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pending Entry</span>
            <FileSpreadsheet className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-sky-700">{resultsAwaitingEntry}</div>
          <p className="text-[10px] text-sky-600 font-medium mt-1">Awaiting Values</p>
        </div>

        {/* Card 5: Results Awaiting Verification */}
        <div
          onClick={() => onNavigate('verification')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Verification</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{resultsAwaitingVerification}</div>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">Pathologist Queue</p>
        </div>

        {/* Card 6: Completed Reports */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Released</span>
            <FileCheck2 className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{completedReports}</div>
          <p className="text-[10px] text-slate-400 mt-1">Signed Reports</p>
        </div>
      </div>

      {/* Main Clinical Operations & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Test Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-teal-700" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Current Diagnostic Orders & Turnaround
              </h2>
            </div>
            <button
              onClick={() => onNavigate('requests')}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
            >
              View All ({requests.length})
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Order #</th>
                  <th className="py-2.5 px-4">Patient Name</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {requests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-teal-800">
                      {req.requestNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{req.patientName}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        Ref: {req.referringDoctor}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge type="priority" value={req.priority} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge type="requestStatus" value={req.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {req.status === 'verified' || req.status === 'completed' ? (
                        <button
                          onClick={() => openReportModal(req.id)}
                          className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded text-[11px] font-semibold border border-teal-200 transition-colors"
                        >
                          Print Report
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('results')}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-[11px] font-medium transition-colors"
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Department Capacity & Recent Audit Feed */}
        <div className="space-y-6">
          {/* Department Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Department Catalogue</span>
              <span className="text-[10px] font-mono font-normal text-slate-400">
                {tests.length} tests active
              </span>
            </h2>

            <div className="space-y-2.5">
              {Object.entries(departmentCounts).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium truncate max-w-[200px]">{dept}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900">{count}</span>
                    <span className="text-[10px] text-slate-400">tests</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('catalogue')}
              className="w-full mt-4 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
            >
              Manage Test Catalogue
            </button>
          </div>

          {/* Audit Trail Snippet */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                Laboratory Audit Trail
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Live</span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-teal-600 pl-2.5 py-0.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-slate-900 text-[11px]">{log.action}</span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
