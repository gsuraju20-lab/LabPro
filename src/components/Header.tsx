import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Building2,
  UserCheck,
  Plus,
  Cloud,
  CheckCircle2,
  ChevronDown,
  User,
  FlaskConical,
  ClipboardList,
  TestTube2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { UserRole } from '../types/lis';
import { NavTab } from './Sidebar';

interface HeaderProps {
  onNavigate: (tab: NavTab) => void;
  onOpenNewRequest: () => void;
  onOpenNewPatient: () => void;
  onOpenLanding?: () => void;
  onOpenPlatformAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onOpenNewRequest,
  onOpenNewPatient,
  onOpenLanding,
  onOpenPlatformAdmin,
}) => {
  const {
    currentLab,
    laboratories,
    setCurrentLabId,
    currentRole,
    setCurrentRole,
    currentStaff,
    isFirestoreOnline,
    auditLogs,
    patients,
    requests,
    samples,
    tests,
    currentUserProfile,
    setIsAuthModalOpen,
    openReportModal,
  } = useLIS();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLabMenuOpen, setIsLabMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const labRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (labRef.current && !labRef.current.contains(event.target as Node)) {
        setIsLabMenuOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) {
        setIsQuickActionOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Global Search Results
  const trimmed = searchQuery.trim().toLowerCase();
  const matchedPatients = trimmed
    ? patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(trimmed) ||
          p.patientIdNumber.toLowerCase().includes(trimmed) ||
          p.phone.includes(trimmed)
      ).slice(0, 3)
    : [];

  const matchedRequests = trimmed
    ? requests.filter(
        (r) =>
          r.requestNumber.toLowerCase().includes(trimmed) ||
          r.patientName.toLowerCase().includes(trimmed)
      ).slice(0, 3)
    : [];

  const matchedSamples = trimmed
    ? samples.filter(
        (s) =>
          s.sampleBarcode.toLowerCase().includes(trimmed) ||
          s.patientName.toLowerCase().includes(trimmed)
      ).slice(0, 3)
    : [];

  const matchedTests = trimmed
    ? tests.filter(
        (t) =>
          t.name.toLowerCase().includes(trimmed) ||
          t.code.toLowerCase().includes(trimmed)
      ).slice(0, 3)
    : [];

  const totalResultsCount =
    matchedPatients.length + matchedRequests.length + matchedSamples.length + matchedTests.length;

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'super_admin', label: 'Super Administrator', desc: 'Full system privileges & tenancy' },
    { role: 'lab_admin', label: 'Laboratory Administrator', desc: 'Department & operations management' },
    { role: 'pathologist', label: 'Consultant Pathologist', desc: 'Result verification & release' },
    { role: 'lab_supervisor', label: 'Laboratory Supervisor', desc: 'Technical oversight & review' },
    { role: 'lab_scientist', label: 'Medical Lab Scientist (MLS)', desc: 'Sample processing & result entry' },
    { role: 'receptionist', label: 'Medical Receptionist', desc: 'Patient intake & test orders' },
    { role: 'accountant', label: 'Billing / Accountant', desc: 'Invoices, payments & receipts' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Global Search Bar */}
      <div className="relative w-96" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search patient, request #, sample barcode, or test..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && trimmed && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 max-h-96 overflow-y-auto p-2 z-50">
            {totalResultsCount === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No clinical records matching "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-3">
                {matchedPatients.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      Patients
                    </span>
                    {matchedPatients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigate('patients');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{p.fullName}</p>
                          <p className="text-[11px] text-slate-500">{p.patientIdNumber} • {p.phone}</p>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {p.gender}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedRequests.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      Test Requests
                    </span>
                    {matchedRequests.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          onNavigate('requests');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{r.requestNumber}</p>
                          <p className="text-[11px] text-slate-500">{r.patientName}</p>
                        </div>
                        <span className="text-[10px] font-mono capitalize bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded">
                          {r.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedSamples.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      Specimens / Samples
                    </span>
                    {matchedSamples.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigate('samples');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        <div>
                          <p className="font-mono font-semibold text-slate-900">{s.sampleBarcode}</p>
                          <p className="text-[11px] text-slate-500">{s.patientName} • {s.specimenType}</p>
                        </div>
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded capitalize">
                          {s.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedTests.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      Test Catalogue
                    </span>
                    {matchedTests.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onNavigate('catalogue');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{t.name}</p>
                          <p className="text-[11px] text-slate-500">{t.department} • Code: {t.code}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-teal-700">
                          {currentLab.currencySymbol}{t.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Tools & Profile */}
      <div className="flex items-center gap-3">
        {/* Firestore Online Indicator */}
        <div
          title={isFirestoreOnline ? 'Connected to Cloud Firestore' : 'Running in local fail-safe mode'}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-600"
        >
          <span className={`w-2 h-2 rounded-full ${isFirestoreOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <Cloud className="w-3.5 h-3.5 text-slate-500" />
          <span>{isFirestoreOnline ? 'Firestore Sync' : 'Local Sandbox'}</span>
        </div>

        {/* Quick Action Menu */}
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Action</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isQuickActionOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  onOpenNewRequest();
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4 text-teal-600" />
                <span>New Test Request</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  onOpenNewPatient();
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-blue-600" />
                <span>Register Patient</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  onNavigate('samples');
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <TestTube2 className="w-4 h-4 text-amber-600" />
                <span>Receive Samples</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  onNavigate('results');
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <FlaskConical className="w-4 h-4 text-sky-600" />
                <span>Enter Test Results</span>
              </button>
            </div>
          )}
        </div>

        {/* Multi-Tenant Laboratory Switcher */}
        <div className="relative" ref={labRef}>
          <button
            onClick={() => setIsLabMenuOpen(!isLabMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs hover:bg-slate-100 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                {currentLab.name}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isLabMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Laboratory Tenant
                </p>
                <p className="text-[11px] text-slate-500">
                  Strict tenant isolation. Data is isolated per workspace.
                </p>
              </div>
              <div className="space-y-1">
                {laboratories.map((lab) => (
                  <button
                    key={lab.id}
                    onClick={() => {
                      setCurrentLabId(lab.id);
                      setIsLabMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded text-xs transition-colors flex items-center justify-between ${
                      lab.id === currentLab.id ? 'bg-teal-50 text-teal-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="truncate max-w-[190px]">{lab.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{lab.code} • {lab.id}</span>
                    </div>
                    {lab.id === currentLab.id && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="pt-2 mt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    onNavigate('subscription');
                    setIsLabMenuOpen(false);
                  }}
                  className="w-full text-center py-1.5 px-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded text-xs font-semibold transition-colors"
                >
                  Manage Subscription & Quotas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs hover:bg-slate-100 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-slate-800 leading-tight capitalize">
                {currentRole.replace('_', ' ')}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-2 py-1 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Simulate LIS Role (RBAC)
                </p>
                <p className="text-[11px] text-slate-500">
                  Test verification, entry, and administrative privileges.
                </p>
              </div>
              <div className="space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setCurrentRole(r.role);
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded text-xs transition-colors flex items-center justify-between ${
                      r.role === currentRole ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p>{r.label}</p>
                      <p className="text-[10px] text-slate-400">{r.desc}</p>
                    </div>
                    {r.role === currentRole && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Auth Gate */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs hover:bg-slate-100 transition-colors"
          title="Clinical Personnel Account & Authorization"
        >
          <div className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] font-bold">
            {currentUserProfile ? currentUserProfile.displayName[0] : 'U'}
          </div>
          <div className="text-left hidden lg:block">
            <p className="font-semibold text-slate-800 text-[11px] leading-tight truncate max-w-[110px]">
              {currentUserProfile ? currentUserProfile.displayName : 'Staff Login'}
            </p>
          </div>
        </button>

        {/* Audit Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            title="Activity Audit Log"
          >
            <Bell className="w-4 h-4" />
            {auditLogs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Laboratory Audit Trail
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {auditLogs.length} events
                </span>
              </div>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {auditLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="text-xs border-b border-slate-50 pb-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-teal-800 text-[11px]">{log.action}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-snug">{log.details}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{log.performedBy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
