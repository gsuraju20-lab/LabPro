import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FlaskConical,
  HelpCircle,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { TestRequest, TestDefinition, Sample, TestResult } from '../types/lis';
import { StatusBadge } from '../components/StatusBadge';

export const ResultEntryView: React.FC = () => {
  const { requests, tests, samples, results, saveResult, currentStaff } = useLIS();

  // Selected Order & Test
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedTestId, setSelectedTestId] = useState<string>('');

  // Form State
  const [values, setValues] = useState<Record<string, string | number>>({});
  const [technicianComments, setTechnicianComments] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Request
  const currentRequest = requests.find((r) => r.id === selectedRequestId);
  const candidateTests = currentRequest
    ? tests.filter((t) => currentRequest.testIds.includes(t.id))
    : [];

  const currentTest = tests.find((t) => t.id === selectedTestId);
  const currentSample = currentRequest
    ? samples.find((s) => s.requestId === currentRequest.id)
    : undefined;

  // Auto-select first request if none selected
  useEffect(() => {
    if (!selectedRequestId && requests.length > 0) {
      const pendingReq = requests.find((r) => r.status !== 'completed' && r.status !== 'verified') || requests[0];
      setSelectedRequestId(pendingReq.id);
      if (pendingReq.testIds.length > 0) {
        setSelectedTestId(pendingReq.testIds[0]);
      }
    }
  }, [requests, selectedRequestId]);

  // When request or test changes, populate existing draft values if any
  useEffect(() => {
    if (selectedRequestId && selectedTestId) {
      const existing = results.find(
        (r) => r.requestId === selectedRequestId && r.testId === selectedTestId
      );
      if (existing) {
        setValues(existing.parameterValues || {});
        setTechnicianComments(existing.technicianComments || '');
      } else {
        setValues({});
        setTechnicianComments('');
      }
      setFeedbackMessage(null);
    }
  }, [selectedRequestId, selectedTestId, results]);

  const handleInputChange = (code: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [code]: value,
    }));
  };

  const handleSave = (submitForVerification: boolean) => {
    if (!selectedRequestId || !selectedTestId || !currentSample) {
      setFeedbackMessage({ type: 'error', text: 'Please select an active order, test, and biological sample.' });
      return;
    }

    try {
      saveResult({
        requestId: selectedRequestId,
        testId: selectedTestId,
        sampleId: currentSample.id,
        parameterValues: values,
        technicianComments: technicianComments.trim(),
        submitForVerification,
      });

      setFeedbackMessage({
        type: 'success',
        text: submitForVerification
          ? 'Diagnostic results successfully submitted for Pathologist / Supervisor verification!'
          : 'Draft results saved successfully to laboratory bench.',
      });

      // Clear feedback message after 4s
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save diagnostic results',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-700" />
            Clinical Diagnostic Result Entry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic parameter reporting, biological reference range validation, real-time critical flags, and submission for pathologist review.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Main Two-Column Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Orders Queue */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col h-[75vh]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Diagnostic Queue ({requests.length})
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Select order to report</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {requests.map((req) => {
              const isSelected = req.id === selectedRequestId;
              return (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedRequestId(req.id);
                    if (req.testIds.length > 0) {
                      setSelectedTestId(req.testIds[0]);
                    }
                  }}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50 border-teal-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-900">{req.requestNumber}</span>
                    <StatusBadge type="priority" value={req.priority} />
                  </div>
                  <p className="font-semibold text-slate-800 truncate">{req.patientName}</p>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>{req.testIds.length} test(s)</span>
                    <StatusBadge type="requestStatus" value={req.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Form tailored to Selected Test */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col h-[75vh] overflow-y-auto">
          {currentRequest && (
            <div className="space-y-6">
              {/* Patient & Order Header Bar */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-600 uppercase font-semibold block">Patient</span>
                  <p className="font-bold text-slate-900 text-sm">{currentRequest.patientName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 uppercase font-semibold block">Order Number</span>
                  <p className="font-mono font-bold text-teal-800">{currentRequest.requestNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 uppercase font-semibold block">Specimen Barcode</span>
                  <p className="font-mono font-semibold text-slate-800">
                    {currentSample ? currentSample.sampleBarcode : 'Awaiting Accession'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 uppercase font-semibold block">Order Status</span>
                  <StatusBadge type="requestStatus" value={currentRequest.status} />
                </div>
              </div>

              {/* Test Selector Tabs for Multi-test requests */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                  Select Test to Enter Results:
                </label>
                <div className="flex flex-wrap gap-2">
                  {candidateTests.map((t) => {
                    const isTabActive = t.id === selectedTestId;
                    const existingRes = results.find(
                      (r) => r.requestId === currentRequest.id && r.testId === t.id
                    );
                    const isVerified = existingRes?.status === 'verified';
                    const isSubmitted = existingRes?.status === 'submitted';

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTestId(t.id)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-colors ${
                          isTabActive
                            ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{t.name}</span>
                        {isVerified && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Verified ✓
                          </span>
                        )}
                        {isSubmitted && !isVerified && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Submitted
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Parameter Entry Form */}
              {currentTest ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        {currentTest.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Department: {currentTest.department} • Method: {currentTest.method}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                      Specimen: {currentTest.specimenType}
                    </span>
                  </div>

                  {/* Parameter Fields */}
                  <div className="p-4 space-y-4">
                    {currentTest.parameters.map((param) => {
                      const val = values[param.code] !== undefined ? String(values[param.code]) : '';
                      const num = Number(val);
                      const isNumeric = param.dataType === 'numeric' && val !== '' && !isNaN(num);

                      const isCriticalHigh =
                        isNumeric && param.criticalMax !== undefined && num >= param.criticalMax;
                      const isCriticalLow =
                        isNumeric && param.criticalMin !== undefined && num <= param.criticalMin;
                      const isHigh =
                        isNumeric && !isCriticalHigh && param.normalMax !== undefined && num > param.normalMax;
                      const isLow =
                        isNumeric && !isCriticalLow && param.normalMin !== undefined && num < param.normalMin;

                      return (
                        <div
                          key={param.id}
                          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 rounded-lg bg-slate-50/60 border border-slate-100"
                        >
                          {/* Parameter Name & Code */}
                          <div className="md:col-span-4">
                            <span className="font-semibold text-xs text-slate-900 block">
                              {param.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Code: {param.code}
                            </span>
                          </div>

                          {/* Input Field */}
                          <div className="md:col-span-4">
                            {param.dataType === 'qualitative' && param.options && param.options.length > 0 ? (
                              <select
                                value={val}
                                onChange={(e) => handleInputChange(param.code, e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                              >
                                <option value="">-- Select Result --</option>
                                {param.options.map((opt, i) => (
                                  <option key={i} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : param.dataType === 'text' ? (
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => handleInputChange(param.code, e.target.value)}
                                placeholder="Observation / Findings"
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                              />
                            ) : (
                              <div className="relative">
                                <input
                                  type="number"
                                  step="any"
                                  value={val}
                                  onChange={(e) => handleInputChange(param.code, e.target.value)}
                                  placeholder="Enter numeric value"
                                  className={`w-full px-3 py-1.5 bg-white border rounded text-xs font-mono font-bold focus:ring-2 outline-hidden ${
                                    isCriticalHigh || isCriticalLow
                                      ? 'border-rose-500 ring-rose-500/20 text-rose-700'
                                      : isHigh
                                      ? 'border-rose-300 text-rose-600'
                                      : isLow
                                      ? 'border-sky-300 text-sky-700'
                                      : 'border-slate-300 text-slate-900 focus:ring-teal-500/20 focus:border-teal-600'
                                  }`}
                                />
                                {param.unit && (
                                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                                    {param.unit}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Reference Interval & Flag Badge */}
                          <div className="md:col-span-4 flex items-center justify-between text-xs">
                            <div className="text-[11px] text-slate-500 font-mono">
                              <span className="text-[9px] uppercase font-sans text-slate-400 block">Ref Interval</span>
                              {param.referenceRangeText ||
                                (param.normalMin !== undefined && param.normalMax !== undefined
                                  ? `${param.normalMin} - ${param.normalMax} ${param.unit}`
                                  : param.normalQualitative || 'N/A')}
                            </div>

                            <div>
                              {(isCriticalHigh || isCriticalLow) && (
                                <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold animate-pulse">
                                  CRITICAL
                                </span>
                              )}
                              {isHigh && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                                  HIGH ▲
                                </span>
                              )}
                              {isLow && (
                                <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 text-[10px] font-bold">
                                  LOW ▼
                                </span>
                              )}
                              {isNumeric && !isHigh && !isLow && !isCriticalHigh && !isCriticalLow && (
                                <span className="text-[10px] text-slate-400 font-medium">Normal</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Technician Notes */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Medical Scientist / Technician Technical Remarks
                      </label>
                      <textarea
                        rows={2}
                        value={technicianComments}
                        onChange={(e) => setTechnicianComments(e.target.value)}
                        placeholder="e.g. Specimen non-hemolyzed. Run calibrated on Cobas 6000. Normal RBC morphology confirmed by light microscopy."
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Logged Scientist: <strong className="text-slate-800">{currentStaff.fullName}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(false)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(true)}
                        className="inline-flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Submit for Pathologist Verification
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active test selected.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
