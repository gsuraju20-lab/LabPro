import React, { useState } from 'react';
import { X, ClipboardList, Check, AlertCircle, Plus, Search } from 'lucide-react';
import { useLIS } from '../context/LISContext';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewPatient: () => void;
  onSuccess?: (requestId: string) => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onOpenNewPatient,
  onSuccess,
}) => {
  const { currentLab, patients, tests, createTestRequest } = useLIS();

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [referringDoctor, setReferringDoctor] = useState('');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [initialPayment, setInitialPayment] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('POS Card Terminal');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const filteredPatients = patientSearch.trim()
    ? patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.patientIdNumber.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.phone.includes(patientSearch)
      )
    : patients;

  const activeTests = tests.filter((t) => t.isActive);

  const grossTotal = selectedTestIds.reduce((sum, tid) => {
    const t = tests.find((x) => x.id === tid);
    return sum + (t ? t.price : 0);
  }, 0);

  const netTotal = Math.max(0, grossTotal - discount);

  const toggleTest = (testId: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('Please select a registered patient.');
      return;
    }
    if (selectedTestIds.length === 0) {
      setError('Please select at least one laboratory test.');
      return;
    }

    try {
      const created = createTestRequest({
        patientId: selectedPatientId,
        referringDoctor: referringDoctor.trim() || 'Self-Referred / Walk-in',
        clinicalIndication: clinicalIndication.trim() || 'General Diagnostic Workup',
        priority,
        testIds: selectedTestIds,
        discount: Number(discount) || 0,
        initialPayment: Number(initialPayment) || 0,
        paymentMethod,
      });

      if (onSuccess) {
        onSuccess(created.id);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold tracking-tight">Create Test Request Order</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {error}
            </div>
          )}

          {/* Patient Selection Block */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Select Patient <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewPatient();
                }}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Register New Patient
              </button>
            </div>

            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter patient by name, MRN, or phone..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs outline-hidden focus:border-teal-600"
              />
            </div>

            <select
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden font-medium"
            >
              <option value="">-- Choose Patient --</option>
              {filteredPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientIdNumber}) • {p.gender.toUpperCase()} • {p.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Clinical Order Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Referring Clinician / Doctor
              </label>
              <input
                type="text"
                value={referringDoctor}
                onChange={(e) => setReferringDoctor(e.target.value)}
                placeholder="e.g. Dr. K. Ene (Lagoon Hospital)"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Priority <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['routine', 'urgent', 'stat'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 text-xs font-semibold uppercase rounded border text-center transition-colors ${
                      priority === p
                        ? p === 'stat'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : p === 'urgent'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Indication / Symptoms / Provisional Diagnosis
            </label>
            <input
              type="text"
              value={clinicalIndication}
              onChange={(e) => setClinicalIndication(e.target.value)}
              placeholder="e.g. Pyrexia of unknown origin, persistent fatigue"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
            />
          </div>

          {/* Test Catalogue Multi-Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Select Diagnostic Tests ({selectedTestIds.length} chosen)
              </label>
              <span className="text-[11px] font-semibold text-teal-800">
                Subtotal: {currentLab.currencySymbol}{grossTotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50/50">
              {activeTests.map((t) => {
                const isSelected = selectedTestIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTest(t.id)}
                    className={`p-2.5 rounded-md border text-xs cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 text-teal-950 font-medium shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{t.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {t.department} • {t.specimenType}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-bold text-teal-800">
                        {currentLab.currencySymbol}{t.price.toLocaleString()}
                      </span>
                      {isSelected && (
                        <span className="block text-[10px] text-teal-700 font-bold">Selected ✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financials & Billing Settlement */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Billing Settlement
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Discount ({currentLab.currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  max={grossTotal}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Initial Payment Received ({currentLab.currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialPayment}
                  onChange={(e) => setInitialPayment(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                >
                  <option value="POS Card Terminal">POS Card Terminal</option>
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Health Insurance / HMO">Health Insurance / HMO</option>
                  <option value="Unpaid / Credit">Unpaid / Bill Later</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <span className="text-slate-600 font-medium">Net Total Payable:</span>
              <span className="font-bold text-base text-slate-900">
                {currentLab.currencySymbol}{netTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold shadow-xs"
            >
              Generate Order & Specimen Labels
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
