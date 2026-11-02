import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Eye,
  FileText,
  UserCheck,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { TestResult } from '../types/lis';
import { StatusBadge } from '../components/StatusBadge';

export const VerificationView: React.FC = () => {
  const { results, tests, verifyResult, amendResult, currentRole, currentStaff, openReportModal } = useLIS();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  // Review Decision State
  const [reviewComments, setReviewComments] = useState('');
  const [decisionModal, setDecisionModal] = useState<{
    result: TestResult;
    decision: 'approve' | 'reject' | 'return';
  } | null>(null);

  // Amendment Workflow Modal
  const [amendingResult, setAmendingResult] = useState<TestResult | null>(null);
  const [amendmentReason, setAmendmentReason] = useState('');
  const [amendedValues, setAmendedValues] = useState<Record<string, string | number>>({});

  const canVerify =
    currentRole === 'pathologist' ||
    currentRole === 'lab_supervisor' ||
    currentRole === 'lab_admin' ||
    currentRole === 'super_admin';

  const pendingVerificationList = results.filter((r) => r.status === 'submitted');
  const verifiedList = results.filter((r) => r.status === 'verified');

  const filteredPending = pendingVerificationList.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.patientName.toLowerCase().includes(term) ||
      r.requestNumber.toLowerCase().includes(term) ||
      r.testName.toLowerCase().includes(term)
    );
  });

  const handleExecuteDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionModal) return;

    verifyResult(decisionModal.result.id, decisionModal.decision, reviewComments.trim());
    setDecisionModal(null);
    setReviewComments('');
    setSelectedResult(null);
  };

  const handleSaveAmendment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendingResult || !amendmentReason.trim()) return;

    amendResult(amendingResult.id, amendedValues, amendmentReason.trim());
    setAmendingResult(null);
    setAmendmentReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            Pathologist & Supervisor Result Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorized clinical audit gate. Inspect test results against biological intervals, authorize release, or mandate technical corrections.
          </p>
        </div>

        {/* RBAC Privilege Warning */}
        {!canVerify ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Read-Only mode: Switch to Pathologist or Supervisor in header to approve.</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authorized Reviewer: {currentStaff.fullName}</span>
          </div>
        )}
      </div>

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Review Queue */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col h-[75vh]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pending Queue ({pendingVerificationList.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Awaiting Sign-off</span>
          </div>

          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by patient, order, or test..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs outline-hidden focus:border-teal-600"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredPending.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No diagnostic results currently awaiting verification.
              </div>
            ) : (
              filteredPending.map((res) => {
                const isSelected = selectedResult?.id === res.id;
                const hasAbnormal = Object.values(res.flags).some((f) => f !== 'NORMAL');

                return (
                  <div
                    key={res.id}
                    onClick={() => setSelectedResult(res)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-slate-900">{res.requestNumber}</span>
                      {hasAbnormal ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Flags Detected
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          Within Limits
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-800">{res.patientName}</p>
                    <p className="text-[11px] text-teal-800 font-medium mt-0.5">{res.testName}</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                      <span>By: {res.enteredBy || 'Lab Scientist'}</span>
                      <StatusBadge type="resultStatus" value={res.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Result Inspection and Verification Actions */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col h-[75vh] overflow-y-auto">
          {selectedResult ? (
            <div className="space-y-6">
              {/* Inspection Header */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">{selectedResult.patientName}</h2>
                  <p className="text-slate-500 text-[11px]">
                    Order: <strong className="font-mono text-teal-800">{selectedResult.requestNumber}</strong> • Barcode: {selectedResult.sampleBarcode}
                  </p>
                </div>
                <StatusBadge type="resultStatus" value={selectedResult.status} />
              </div>

              {/* Test and Method Details */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1">
                  {selectedResult.testName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Department: {selectedResult.department} • Entered: {new Date(selectedResult.enteredAt || selectedResult.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Comparative Values Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Parameter</th>
                      <th className="py-2.5 px-4 text-center">Entered Value</th>
                      <th className="py-2.5 px-3 text-center">Alert Flag</th>
                      <th className="py-2.5 px-4">Biological Reference Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {(() => {
                      const testDef = tests.find((t) => t.id === selectedResult.testId);
                      const params = testDef?.parameters || [];

                      return params.map((param) => {
                        const val = selectedResult.parameterValues[param.code];
                        const flag = selectedResult.flags[param.code];
                        const isAbnormal = flag && flag !== 'NORMAL';

                        return (
                          <tr
                            key={param.id}
                            className={`hover:bg-slate-50/50 ${isAbnormal ? 'bg-amber-50/30' : ''}`}
                          >
                            <td className="py-2.5 px-4 font-medium text-slate-900">
                              {param.name}
                            </td>
                            <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900">
                              {val !== undefined ? String(val) : '—'} {param.unit}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {flag && <StatusBadge type="flag" value={flag} />}
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-slate-600 font-mono">
                              {param.referenceRangeText || 'Standard'}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Technician Notes */}
              {selectedResult.technicianComments && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Bench Technician Notes:</span>
                  <p className="text-slate-600 italic">{selectedResult.technicianComments}</p>
                </div>
              )}

              {/* Action Buttons for Authorized Verifier */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openReportModal(selectedResult.requestId)}
                  className="px-3 py-2 border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Preview Full Report
                </button>

                {canVerify && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDecisionModal({ result: selectedResult, decision: 'return' })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-xs font-semibold border border-amber-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Return for Correction
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionModal({ result: selectedResult, decision: 'reject' })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded text-xs font-semibold border border-rose-200 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionModal({ result: selectedResult, decision: 'approve' })}
                      className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      Approve & Release
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <ShieldCheck className="w-12 h-12 stroke-[1.2] text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">Select an item from the pending queue</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Verify analytical findings, validate out-of-range clinical flags, and apply digital sign-off.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decision Confirmation Modal */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div
              className={`px-6 py-4 text-white flex items-center justify-between ${
                decisionModal.decision === 'approve'
                  ? 'bg-emerald-700'
                  : decisionModal.decision === 'reject'
                  ? 'bg-rose-700'
                  : 'bg-amber-600'
              }`}
            >
              <h2 className="text-sm font-bold capitalize">
                {decisionModal.decision === 'approve'
                  ? 'Approve & Release Diagnostic Report'
                  : decisionModal.decision === 'reject'
                  ? 'Reject Diagnostic Results'
                  : 'Return to Bench for Technical Recalibration'}
              </h2>
              <button
                onClick={() => setDecisionModal(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteDecision} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <p className="font-semibold text-slate-800">
                  {decisionModal.result.testName}
                </p>
                <p className="text-slate-500">
                  Patient: {decisionModal.result.patientName} ({decisionModal.result.requestNumber})
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pathologist / Verifier Clinical Interpretation / Directive{' '}
                  {decisionModal.decision !== 'approve' && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  required={decisionModal.decision !== 'approve'}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder={
                    decisionModal.decision === 'approve'
                      ? 'e.g. Findings correlate with clinical presentation. No acute cellular abnormalities detected.'
                      : 'e.g. Please verify repeat run on calibrator. Discrepancy noted between Hb and RBC indices.'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionModal(null)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-md text-xs font-semibold shadow-xs ${
                    decisionModal.decision === 'approve'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : decisionModal.decision === 'reject'
                      ? 'bg-rose-700 hover:bg-rose-800'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  Confirm & Apply Digital Stamp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
