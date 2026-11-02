import React, { useState } from 'react';
import {
  TestTube2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  AlertTriangle,
  FlaskConical,
  X,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { StatusBadge } from '../components/StatusBadge';
import { BarcodeBadge } from '../components/BarcodeBadge';
import { Sample } from '../types/lis';

export const SamplesView: React.FC = () => {
  const { samples, collectSample, receiveSample, rejectSample, currentStaff } = useLIS();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Rejection Modal State
  const [rejectingSample, setRejectingSample] = useState<Sample | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Gross Hemolysis');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const filteredSamples = samples.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.sampleBarcode.toLowerCase().includes(term) ||
      s.patientName.toLowerCase().includes(term) ||
      s.requestNumber.toLowerCase().includes(term) ||
      s.specimenType.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSample) return;
    rejectSample(rejectingSample.id, rejectionReason, rejectionNotes);
    setRejectingSample(null);
    setRejectionNotes('');
  };

  const REJECTION_REASONS = [
    'Gross Hemolysis (Interferes with spectrophotometry & ISE)',
    'Clotted Specimen (EDTA / Sodium Citrate tube clotted)',
    'Insufficient Specimen Volume (QNS - Quantity Not Sufficient)',
    'Lipemic Specimen (Turbid serum/plasma)',
    'Incorrect Anticoagulant / Container Used',
    'Unlabeled or Mislabeled Specimen Tube',
    'Leaking Container / Compromised Sterility',
    'Sample Stability Exceeded / Delayed Transit',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TestTube2 className="w-5 h-5 text-teal-700" />
            Biological Specimen & Sample Accessioning
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phlebotomy collection orders, laboratory bench reception, rejection documentation, and thermal barcode tube labeling.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by barcode, patient, order #, or specimen type..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-hidden font-medium"
          >
            <option value="all">All Specimen States</option>
            <option value="pending_collection">Pending Collection</option>
            <option value="collected">Collected (Transit)</option>
            <option value="received">Received at Lab Bench</option>
            <option value="processing">In Processing</option>
            <option value="rejected">Rejected Specimen</option>
          </select>
        </div>
      </div>

      {/* Samples Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Sample Barcode</th>
                <th className="py-3 px-4">Patient / Order #</th>
                <th className="py-3 px-3">Specimen & Tube</th>
                <th className="py-3 px-4">Target Tests</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Collection / Reception</th>
                <th className="py-3 px-4 text-right">Accessioning Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No biological specimens match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredSamples.map((sample) => (
                  <tr key={sample.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <BarcodeBadge
                        barcode={sample.sampleBarcode}
                        patientName={sample.patientName}
                        patientId={sample.patientId}
                        specimenType={sample.specimenType}
                        testNames={sample.testNames}
                        date={sample.createdAt.split('T')[0]}
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{sample.patientName}</p>
                      <span className="font-mono text-[10px] text-teal-700 block">
                        {sample.requestNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-slate-800">{sample.specimenType}</p>
                      <span className="text-[10px] text-slate-500 block">{sample.container}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {sample.testNames.map((name, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge type="sampleStatus" value={sample.status} />
                      {sample.status === 'rejected' && sample.rejectionReason && (
                        <p className="text-[10px] text-rose-600 mt-1 max-w-[140px] truncate" title={sample.rejectionReason}>
                          Reason: {sample.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-[11px] text-slate-600">
                      {sample.collectedAt ? (
                        <div>
                          <span className="text-slate-900 font-medium block">
                            Collected: {new Date(sample.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                            By: {sample.collectedBy || 'Phlebotomist'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending collection</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sample.status === 'pending_collection' && (
                          <button
                            onClick={() => collectSample(sample.id, currentStaff.fullName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-semibold text-xs border border-amber-200 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark Collected
                          </button>
                        )}

                        {sample.status === 'collected' && (
                          <button
                            onClick={() => receiveSample(sample.id, currentStaff.fullName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-semibold text-xs shadow-xs transition-colors"
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                            Receive in Lab
                          </button>
                        )}

                        {sample.status !== 'rejected' && (
                          <button
                            onClick={() => setRejectingSample(sample)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Reject Specimen (Non-conformance)"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal with Mandatory Clinical Justification */}
      {rejectingSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-rose-700 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-white" />
                <h2 className="text-base font-bold">Document Specimen Rejection</h2>
              </div>
              <button
                onClick={() => setRejectingSample(null)}
                className="text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRejection} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <p className="font-semibold text-slate-800">
                  Patient: {rejectingSample.patientName}
                </p>
                <p className="font-mono text-slate-600">
                  Barcode: {rejectingSample.sampleBarcode} • {rejectingSample.specimenType}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Non-Conformance Reason <span className="text-rose-600">*</span>
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-hidden font-medium"
                >
                  {REJECTION_REASONS.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corrective Action Notes / Communication with Clinic
                </label>
                <textarea
                  rows={3}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="e.g. Inadequate volume for serum separation. Clinic contacted via phone; new collection ordered."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingSample(null)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold shadow-xs"
                >
                  Confirm Rejection & Notify Clinic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
