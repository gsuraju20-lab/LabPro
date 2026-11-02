import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ClipboardList,
  FileText,
  X,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { Patient } from '../types/lis';
import { StatusBadge } from '../components/StatusBadge';

interface PatientsViewProps {
  onOpenNewPatient: () => void;
  onOpenNewRequest: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  onOpenNewPatient,
  onOpenNewRequest,
}) => {
  const { patients, requests, results, openReportModal } = useLIS();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(term) ||
      p.patientIdNumber.toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      p.email.toLowerCase().includes(term)
    );
  });

  // Requests and reports for selected patient
  const patientRequests = selectedPatient
    ? requests.filter((r) => r.patientId === selectedPatient.id)
    : [];

  const patientResults = selectedPatient
    ? results.filter((r) => r.patientId === selectedPatient.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            Patient Management & Medical Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered patient records, demographics, historical lab requests, and released diagnostic reports.
          </p>
        </div>

        <button
          onClick={onOpenNewPatient}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Register Patient
        </button>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, MRN / ID, phone, or email..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredPatients.length} of {patients.length} patients
          </span>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-3">DOB / Age</th>
                <th className="py-3 px-3">Gender</th>
                <th className="py-3 px-3">Blood Group</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No patient records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const birthYear = new Date(p.dateOfBirth).getFullYear();
                  const age = isNaN(birthYear) ? '' : `${new Date().getFullYear() - birthYear} yrs`;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-teal-800">
                        {p.patientIdNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{p.fullName}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{p.address}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{p.dateOfBirth}</span>
                        {age && <span className="text-[10px] text-slate-400 block">({age})</span>}
                      </td>
                      <td className="py-3 px-3 capitalize">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {p.gender}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] text-slate-700">
                          {p.bloodGroup || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{p.phone}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPatient(p)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Dossier Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold">{selectedPatient.fullName}</h2>
                <p className="text-xs text-teal-300 font-mono">
                  MRN: {selectedPatient.patientIdNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Patient Demographics Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date of Birth</span>
                  <p className="font-semibold text-slate-800">{selectedPatient.dateOfBirth}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gender</span>
                  <p className="font-semibold text-slate-800 capitalize">{selectedPatient.gender}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Group</span>
                  <p className="font-semibold text-slate-800">{selectedPatient.bloodGroup || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phone</span>
                  <p className="font-semibold text-slate-800">{selectedPatient.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Email</span>
                  <p className="font-semibold text-slate-800 truncate">{selectedPatient.email || '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered</span>
                  <p className="font-semibold text-slate-800">
                    {new Date(selectedPatient.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Address</span>
                  <p className="text-slate-800">{selectedPatient.address || '—'}</p>
                </div>
                {selectedPatient.emergencyContact && (
                  <div className="col-span-2 sm:col-span-3 pt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Emergency Contact</span>
                    <p className="text-slate-800 font-medium">{selectedPatient.emergencyContact}</p>
                  </div>
                )}
                {selectedPatient.clinicalNotes && (
                  <div className="col-span-2 sm:col-span-3 pt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Medical History / Allergies</span>
                    <p className="text-slate-800 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                      {selectedPatient.clinicalNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* History of Test Requests */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Diagnostic Requests History ({patientRequests.length})</span>
                  <button
                    onClick={() => {
                      setSelectedPatient(null);
                      onOpenNewRequest();
                    }}
                    className="text-xs text-teal-700 hover:text-teal-800 font-semibold"
                  >
                    + New Request
                  </button>
                </h3>

                {patientRequests.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded border border-slate-200 text-center text-xs text-slate-400">
                    No prior test requests recorded for this patient.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patientRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{req.requestNumber}</span>
                            <StatusBadge type="priority" value={req.priority} />
                            <StatusBadge type="requestStatus" value={req.status} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Ref: {req.referringDoctor} • Date: {new Date(req.createdAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div>
                          {req.status === 'verified' || req.status === 'completed' ? (
                            <button
                              onClick={() => {
                                setSelectedPatient(null);
                                openReportModal(req.id);
                              }}
                              className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded font-semibold border border-teal-200 text-xs hover:bg-teal-100"
                            >
                              Print Report
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Processing</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
