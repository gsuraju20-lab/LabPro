import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Save,
  CheckCircle2,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Clock,
  Coins,
  FileText,
  X,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { Laboratory, Department } from '../types/lis';

export const SettingsView: React.FC = () => {
  const {
    currentLab,
    updateLaboratorySettings,
    departments,
    addDepartment,
    updateDepartment,
    laboratories,
    setCurrentLabId,
    createLaboratory,
  } = useLIS();

  // General Lab Profile Form State
  const [labName, setLabName] = useState(currentLab.name);
  const [labCode, setLabCode] = useState(currentLab.code);
  const [licenseNumber, setLicenseNumber] = useState(currentLab.licenseNumber);
  const [phone, setPhone] = useState(currentLab.phone);
  const [email, setEmail] = useState(currentLab.email);
  const [address, setAddress] = useState(currentLab.address);
  const [currency, setCurrency] = useState(currentLab.currency);
  const [currencySymbol, setCurrencySymbol] = useState(currentLab.currencySymbol);
  const [accreditation, setAccreditation] = useState(currentLab.accreditation || '');
  const [headerNote, setHeaderNote] = useState(currentLab.headerNote || '');
  const [footerNote, setFooterNote] = useState(currentLab.footerNote || '');
  const [operatingHours, setOperatingHours] = useState(currentLab.operatingHours || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Department Modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // New Tenant Modal
  const [isNewLabModalOpen, setIsNewLabModalOpen] = useState(false);
  const [newLabName, setNewLabName] = useState('');
  const [newLabCode, setNewLabCode] = useState('');
  const [newLabLicense, setNewLabLicense] = useState('');
  const [newLabEmail, setNewLabEmail] = useState('');
  const [newLabPhone, setNewLabPhone] = useState('');
  const [newLabAddress, setNewLabAddress] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateLaboratorySettings({
      name: labName,
      code: labCode,
      licenseNumber,
      phone,
      email,
      address,
      currency,
      currencySymbol,
      accreditation,
      headerNote,
      footerNote,
      operatingHours,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;

    addDepartment({
      name: deptName.trim(),
      code: deptCode.trim().toUpperCase(),
      description: deptDesc.trim(),
      isActive: true,
    });

    setIsDeptModalOpen(false);
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
  };

  const handleCreateNewTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName.trim() || !newLabCode.trim()) return;

    createLaboratory({
      name: newLabName.trim(),
      code: newLabCode.trim().toUpperCase(),
      licenseNumber: newLabLicense.trim() || 'MLSCN/PENDING',
      email: newLabEmail.trim(),
      phone: newLabPhone.trim(),
      address: newLabAddress.trim(),
      currency: 'NGN',
      currencySymbol: '₦',
      headerNote: 'Accredited Clinical Reference Laboratory',
      footerNote: 'Results authenticated by registered Laboratory Scientists and Pathologists.',
      operatingHours: '08:00 - 18:00 Daily',
    });

    setIsNewLabModalOpen(false);
    setNewLabName('');
    setNewLabCode('');
    setNewLabEmail('');
    setNewLabPhone('');
    setNewLabAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-700" />
            Laboratory Configuration & Multi-Tenant Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional profile, regulatory accreditation, departments, clinical currency, and independent tenant workspaces.
          </p>
        </div>

        <button
          onClick={() => setIsNewLabModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Building2 className="w-4 h-4 text-teal-400" />
          Provision New Laboratory Workspace
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Laboratory profile and reporting parameters successfully updated!</span>
        </div>
      )}

      {/* Workspace / Tenant Summary Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
              Tenant ID: {currentLab.id}
            </span>
            <span className="text-xs text-slate-400 font-mono">Code: {currentLab.code}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">{currentLab.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentLab.accreditation || 'Standard Clinical Pathology Registration'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">Switch Workspace:</span>
          <select
            value={currentLab.id}
            onChange={(e) => setCurrentLabId(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded text-xs outline-hidden font-medium"
          >
            {laboratories.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Institutional Profile & Report Settings */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            Institutional Profile & Report Letterhead
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Laboratory Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tenant Prefix Code
                </label>
                <input
                  type="text"
                  required
                  value={labCode}
                  onChange={(e) => setLabCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono uppercase outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MLSCN / Medical License #
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accreditation Body
                </label>
                <input
                  type="text"
                  value={accreditation}
                  onChange={(e) => setAccreditation(e.target.value)}
                  placeholder="e.g. ISO 15189:2022 Accredited"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Contact Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Inquiries Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Laboratory Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
              />
            </div>

            {/* Currency Configuration */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Currency Code
                </label>
                <select
                  value={currency}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCurrency(c);
                    if (c === 'NGN') setCurrencySymbol('₦');
                    else if (c === 'USD') setCurrencySymbol('$');
                    else if (c === 'GBP') setCurrencySymbol('£');
                    else if (c === 'EUR') setCurrencySymbol('€');
                  }}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden font-mono"
                >
                  <option value="NGN">NGN (Nigerian Naira - ₦)</option>
                  <option value="USD">USD (US Dollar - $)</option>
                  <option value="GBP">GBP (British Pound - £)</option>
                  <option value="EUR">EUR (Euro - €)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono outline-hidden"
                />
              </div>
            </div>

            {/* Report Letterhead & Disclaimers */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Header Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={headerNote}
                  onChange={(e) => setHeaderNote(e.target.value)}
                  placeholder="e.g. Center for Molecular & Advanced Diagnostic Medicine"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Footer Signatory Note & Disclaimer
                </label>
                <textarea
                  rows={2}
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Institutional Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Department Governance */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-700" />
                Laboratory Departments ({departments.length})
              </h2>
              <button
                onClick={() => setIsDeptModalOpen(true)}
                className="text-xs text-teal-700 font-semibold hover:text-teal-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Department
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Configure specialized diagnostic disciplines. Departments can be enabled, renamed, or disabled.
            </p>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {departments.map((dep) => (
                <div
                  key={dep.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{dep.name}</span>
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                        {dep.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{dep.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                      onClick={() => updateDepartment(dep.id, { isActive: !dep.isActive })}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                        dep.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {dep.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tenant Isolation Info */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal-700" />
              Tenant Data Isolation Assurance
            </h3>
            <p className="text-[11px] leading-relaxed">
              Every patient dossier, specimen tube barcode, entered result, and billing invoice is strictly partitioned by the active workspace tenant key. Cross-tenant leakage is prevented via Cloud Firestore security rules.
            </p>
          </div>
        </div>
      </div>

      {/* Add Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold">Add Clinical Department</h2>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Molecular Cytogenetics"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Code / Short Abbreviation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="e.g. CYTO"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono uppercase focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scope of Testing / Description
                </label>
                <textarea
                  rows={2}
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  placeholder="Clinical tests and sample procedures performed in this section."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provision New Laboratory Tenant Modal */}
      {isNewLabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-400" />
                <h2 className="text-sm font-bold">Provision Independent Laboratory Workspace</h2>
              </div>
              <button onClick={() => setIsNewLabModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTenant} className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Create a completely independent workspace with isolated patients, test requests, results, reports, and staff.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Laboratory / Diagnostic Center Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  placeholder="e.g. PrimePath Reference Laboratories"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unique Lab Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newLabCode}
                    onChange={(e) => setNewLabCode(e.target.value)}
                    placeholder="e.g. PPL-PH"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono uppercase outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={newLabLicense}
                    onChange={(e) => setNewLabLicense(e.target.value)}
                    placeholder="e.g. MLSCN/REG/2026/0199"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newLabPhone}
                    onChange={(e) => setNewLabPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newLabEmail}
                    onChange={(e) => setNewLabEmail(e.target.value)}
                    placeholder="contact@primepath.ng"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={newLabAddress}
                  onChange={(e) => setNewLabAddress(e.target.value)}
                  placeholder="City, State"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewLabModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs"
                >
                  Provision & Switch to Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
