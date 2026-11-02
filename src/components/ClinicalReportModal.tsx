import React from 'react';
import { Printer, Download, X, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { useLIS } from '../context/LISContext';

export const ClinicalReportModal: React.FC = () => {
  const {
    currentLab,
    isPrintReportOpen,
    closeReportModal,
    selectedReportRequestId,
    requests,
    patients,
    results,
    samples,
    tests,
  } = useLIS();

  if (!isPrintReportOpen || !selectedReportRequestId) return null;

  const request = requests.find((r) => r.id === selectedReportRequestId);
  if (!request) return null;

  const patient = patients.find((p) => p.id === request.patientId);
  const relatedResults = results.filter((r) => r.requestId === request.id);
  const relatedSamples = samples.filter((s) => s.requestId === request.id);

  // Check verification release status
  const verifiedCount = relatedResults.filter((r) => r.status === 'verified').length;
  const isFullyVerified = relatedResults.length > 0 && verifiedCount === relatedResults.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:w-full">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide">
              Official Diagnostic Laboratory Report Preview
            </span>
            {isFullyVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                <CheckCircle className="w-3 h-3" />
                Authorized & Released
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3" />
                Interim Report / Pending Verification
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={closeReportModal}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 font-sans text-slate-800 print:p-6 print:overflow-visible" id="clinical-report-content">
          {/* Laboratory Letterhead */}
          <div className="border-b-2 border-teal-800 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-600 inline-block"></span>
                  {currentLab.name}
                </h1>
                <p className="text-xs text-teal-800 font-semibold tracking-wide mt-0.5">
                  {currentLab.headerNote || 'Clinical Pathology & Diagnostic Reference Laboratory'}
                </p>
                <p className="text-[11px] text-slate-600 mt-1 max-w-xl leading-relaxed">
                  {currentLab.address} • Tel: {currentLab.phone} • Email: {currentLab.email}
                </p>
                {currentLab.accreditation && (
                  <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
                    {currentLab.accreditation} • License: {currentLab.licenseNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="border-2 border-teal-700 rounded p-2 text-center bg-teal-50/50">
                  <span className="block text-[10px] font-bold text-teal-900 uppercase tracking-widest">
                    DIAGNOSTIC REPORT
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {request.requestNumber}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Report Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Demographics & Specimen Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs mb-6">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-600 block">Patient Name</span>
              <p className="font-bold text-slate-900 truncate">{request.patientName}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-600 block">Patient ID / MRN</span>
              <p className="font-mono font-semibold text-slate-800">
                {patient ? patient.patientIdNumber : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-600 block">Age / Gender</span>
              <p className="font-medium text-slate-800 capitalize">
                {request.patientAge ? `${request.patientAge} Yrs` : 'Adult'} / {request.patientGender || 'Unspecified'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-600 block">Blood Group</span>
              <p className="font-medium text-slate-800">{patient?.bloodGroup || 'Not Tested'}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase text-slate-600 block">Referring Doctor / Facility</span>
              <p className="font-medium text-slate-800 truncate">{request.referringDoctor}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-600 block">Specimen Barcode(s)</span>
              <p className="font-mono font-semibold text-teal-700">
                {relatedSamples.map((s) => s.sampleBarcode).join(', ') || 'SMP-2026-PENDING'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-600 block">Order Date / Time</span>
              <p className="font-medium text-slate-700">
                {new Date(request.createdAt).toLocaleDateString('en-GB')} {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Clinical Indication Banner */}
          {request.clinicalIndication && (
            <div className="mb-6 px-3 py-1.5 bg-blue-50/70 border-l-4 border-teal-600 text-[11px] text-slate-700 rounded-r">
              <span className="font-semibold text-teal-950">Clinical Notes / Indication: </span>
              {request.clinicalIndication}
            </div>
          )}

          {/* Test Results Sections */}
          <div className="space-y-6">
            {relatedResults.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
                No verified test results entered yet for this diagnostic request.
              </div>
            ) : (
              relatedResults.map((result) => {
                const testDef = tests.find((t) => t.id === result.testId);
                const parameters = testDef?.parameters || [];

                return (
                  <div key={result.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <h2 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                          {result.testName}
                        </h2>
                        <p className="text-[10px] text-slate-500">
                          Department: {result.department} • Method: {testDef?.method || 'Standard Analytical'}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-white border border-slate-200 text-slate-700">
                        Specimen: {testDef?.specimenType || 'Venous Blood'}
                      </span>
                    </div>

                    {/* Parameter Values Table */}
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-4">Test Parameter</th>
                          <th className="py-2 px-4 text-center">Result</th>
                          <th className="py-2 px-3 text-center">Flag</th>
                          <th className="py-2 px-3">Units</th>
                          <th className="py-2 px-4">Biological Reference Interval</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {parameters.map((param) => {
                          const val = result.parameterValues[param.code];
                          const flag = result.flags[param.code];
                          const isHigh = flag === 'HIGH' || flag === 'CRITICAL_HIGH';
                          const isLow = flag === 'LOW' || flag === 'CRITICAL_LOW';
                          const isCrit = flag === 'CRITICAL_HIGH' || flag === 'CRITICAL_LOW';
                          const isAbnormal = flag === 'ABNORMAL';

                          return (
                            <tr
                              key={param.id}
                              className={`hover:bg-slate-50/50 ${isCrit ? 'bg-rose-50/40' : ''}`}
                            >
                              <td className="py-2 px-4 font-medium text-slate-800">
                                {param.name}
                              </td>
                              <td
                                className={`py-2 px-4 text-center font-mono font-bold ${
                                  isCrit
                                    ? 'text-rose-700'
                                    : isHigh
                                    ? 'text-rose-600'
                                    : isLow
                                    ? 'text-sky-700'
                                    : isAbnormal
                                    ? 'text-amber-700'
                                    : 'text-slate-900'
                                }`}
                              >
                                {val !== undefined && val !== '' ? String(val) : '—'}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {isCrit && (
                                  <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">
                                    CRITICAL
                                  </span>
                                )}
                                {!isCrit && isHigh && (
                                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-semibold">
                                    HIGH ▲
                                  </span>
                                )}
                                {!isCrit && isLow && (
                                  <span className="px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded text-[10px] font-semibold">
                                    LOW ▼
                                  </span>
                                )}
                                {isAbnormal && !isHigh && !isLow && (
                                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-semibold">
                                    ABNORMAL
                                  </span>
                                )}
                                {!isCrit && !isHigh && !isLow && !isAbnormal && (
                                  <span className="text-[10px] text-slate-400">Normal</span>
                                )}
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                                {param.unit}
                              </td>
                              <td className="py-2 px-4 text-[11px] text-slate-600 font-mono">
                                {param.referenceRangeText ||
                                  (param.normalMin !== undefined && param.normalMax !== undefined
                                    ? `${param.normalMin} - ${param.normalMax}`
                                    : param.normalQualitative || 'N/A')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Laboratory Technical & Consultant Comments */}
                    {(result.technicianComments || result.verificationComments) && (
                      <div className="bg-slate-50/70 p-3 border-t border-slate-200 text-xs space-y-1">
                        {result.technicianComments && (
                          <p className="text-slate-700 text-[11px]">
                            <span className="font-bold text-slate-900">Technical Note: </span>
                            {result.technicianComments}
                          </p>
                        )}
                        {result.verificationComments && (
                          <p className="text-teal-900 text-[11px]">
                            <span className="font-bold text-teal-950">Pathologist Interpretation: </span>
                            {result.verificationComments}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Signatory & Authorization Stamp Block */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Performing Scientist
              </p>
              <div className="border-b border-slate-300 pb-1 mb-1">
                <p className="font-serif italic text-sm text-slate-800">K. Nwosu, B.MLS</p>
              </div>
              <p className="text-[10px] font-semibold text-slate-700">MLS Kelechi Nwosu</p>
              <p className="text-[9px] text-slate-500">Medical Laboratory Scientist (MLSCN #8422)</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Authorized Signatory / Verification
              </p>
              <div className="border-b border-slate-300 pb-1 mb-1 flex items-center justify-between">
                <p className="font-serif italic text-sm text-teal-800 font-bold">Dr. O. Eze, FMCPath</p>
                <div className="w-6 h-6 rounded-full border border-teal-600 flex items-center justify-center text-teal-700 text-[8px] font-bold">
                  SEAL
                </div>
              </div>
              <p className="text-[10px] font-semibold text-slate-700">Dr. Obinna Eze, MBBS, FMCPath</p>
              <p className="text-[9px] text-slate-500">Consultant Clinical Pathologist (MDCN #68902)</p>
            </div>

            <div className="text-right">
              {/* Simulated QR Code Authentication Seal */}
              <div className="inline-flex flex-col items-center p-2 bg-slate-50 border border-slate-200 rounded">
                <div className="w-14 h-14 bg-slate-900 flex items-center justify-center text-white p-1">
                  <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={i % 3 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-transparent'}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[8px] font-mono text-slate-500 mt-1">SECURE VERIFIED</span>
              </div>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 leading-relaxed">
            <p className="font-medium text-slate-500">{currentLab.footerNote}</p>
            <p className="mt-0.5">
              This report is electronically verified under MLSCN regulations. Results relate specifically to the specimen submitted. Diagnostic interpretations must be evaluated in conjunction with full clinical history by a licensed physician.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
