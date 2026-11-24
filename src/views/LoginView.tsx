import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
  Building2,
  UserCheck,
  LogOut,
  Clock,
  Globe,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { UserRole } from '../types/lis';
import { ENABLE_DEV_BYPASS_TOOLS } from '../config/env';
import { AuthRedirectReason } from '../utils/routes';

interface LoginViewProps {
  redirectTo?: string;
  reason?: AuthRedirectReason;
  onSuccess: (redirectTarget?: string) => void;
  onRegister: () => void;
  onOpenLanding: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  redirectTo,
  reason,
  onSuccess,
  onRegister,
  onOpenLanding,
}) => {
  const {
    currentUserProfile,
    isAuthenticated,
    isStaffSuspended,
    sessionExpiredNotice,
    clearSessionExpiredNotice,
    loginGoogle,
    loginStaff,
    logout,
    currentLab,
    staffList,
    isAuthLoading,
  } = useLIS();

  const [selectedStaffRole, setSelectedStaffRole] = useState<UserRole>('pathologist');
  const [error, setError] = useState<string | null>(null);

  const isUnassigned = currentUserProfile?.labId === 'unassigned';
  const showSessionExpired = reason === 'session_expired' || sessionExpiredNotice;

  const handleGoogleLogin = async () => {
    setError(null);
    clearSessionExpiredNotice();
    try {
      const profile = await loginGoogle();
      if (profile.isActive === false) {
        setError('Your laboratory staff account has been deactivated. Contact your Laboratory Administrator.');
        return;
      }
      if (profile.labId !== 'unassigned' || profile.isPlatformSuperAdmin) {
        onSuccess(redirectTo);
      }
    } catch (err: any) {
      setError(
        err?.message ||
          'Authentication failed. Please check your Google account and try again.'
      );
    }
  };

  const handleDevStaffLogin = async () => {
    if (!ENABLE_DEV_BYPASS_TOOLS) return;
    setError(null);
    clearSessionExpiredNotice();
    try {
      const staffMember = staffList.find((s) => s.role === selectedStaffRole) || staffList[0];
      await loginStaff({
        name: staffMember?.fullName || 'Development Staff',
        email: staffMember?.email || `dev-${selectedStaffRole}@labpro.local`,
        role: selectedStaffRole,
        labId: currentLab.id && currentLab.id !== 'unassigned' ? currentLab.id : 'lab-apex',
        licenseNumber: staffMember?.licenseNumber,
      });
      onSuccess(redirectTo);
    } catch (err: any) {
      setError(err?.message || 'Development login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <button
          onClick={onOpenLanding}
          className="flex items-center gap-2.5 sm:gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white group-hover:text-teal-300 transition-colors">
                LabPro
              </span>
              <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded-full border border-teal-500/30 uppercase tracking-wider">
                Cloud LIS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Protected Clinical Workspace Access</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLanding}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Public SaaS Portal</span>
            <span className="sm:hidden">Home</span>
          </button>
          <button
            onClick={onRegister}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 px-3.5 py-2 rounded-lg transition-colors"
          >
            <span>Register Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-slate-950/70 px-6 py-6 border-b border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white">Sign In to LabPro LIS</h1>
            <p className="text-xs text-slate-400">
              Authenticate with your authorized Google account to access your laboratory tenant.
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Contextual notices */}
            {showSessionExpired && (
              <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-700/60 text-amber-200 text-xs flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">Authentication Session Expired</p>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    Your clinical session timed out or was signed out. Please sign in again to resume work.
                  </p>
                </div>
              </div>
            )}

            {!showSessionExpired && reason === 'auth_required' && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-teal-700/50 text-slate-200 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-teal-300">Authentication Required</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Sign in to access{' '}
                    <span className="font-mono text-teal-300">{redirectTo || 'the laboratory workspace'}</span>.
                  </p>
                </div>
              </div>
            )}

            {reason === 'unauthorized' && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-300">Access Restricted</p>
                  <p className="text-[11px] text-rose-200/90 mt-0.5">
                    You do not have authorization for the requested resource.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p>{error}</p>
                  {error.toLowerCase().includes('popup') &&
                    typeof window !== 'undefined' &&
                    window.self !== window.top && (
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-300 hover:text-teal-200 underline"
                      >
                        <span>Open login page in a new tab</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                </div>
              </div>
            )}

            {/* Authenticated but Suspended or Unassigned States */}
            {isAuthenticated && isStaffSuspended && (
              <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-700/70 text-xs space-y-3">
                <p className="font-bold text-rose-300 text-sm">Account Deactivated</p>
                <p className="text-rose-200 leading-relaxed">
                  The account <strong>{currentUserProfile?.email}</strong> has been suspended by a Laboratory Administrator and cannot open clinical records.
                </p>
                <button
                  onClick={() => logout()}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {isAuthenticated && !isStaffSuspended && isUnassigned && (
              <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-700/60 text-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>Pending Laboratory Assignment</span>
                </div>
                <p className="text-amber-100/90 leading-relaxed">
                  Signed in as <strong>{currentUserProfile?.email}</strong>. Your account is not assigned to an active laboratory yet. Ask your Laboratory Administrator to invite your email under Staff Management, or register a new laboratory facility.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={onRegister}
                    className="flex-1 py-2 px-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-colors"
                  >
                    Register New Laboratory
                  </button>
                  <button
                    onClick={() => logout()}
                    className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Primary Google Authentication CTA */}
            {(!isAuthenticated || isStaffSuspended || isUnassigned) && (
              <button
                onClick={handleGoogleLogin}
                disabled={isAuthLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isAuthLoading ? 'Verifying Credentials...' : 'Sign in with Google Workspace'}</span>
              </button>
            )}

            {/* Explicit opt-in local dev testing helper only (never enabled in prod or default dev) */}
            {ENABLE_DEV_BYPASS_TOOLS && (
              <div className="pt-4 border-t border-slate-700/80 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Explicit Dev Mode Auth Bypass
                </p>
                <select
                  value={selectedStaffRole}
                  onChange={(e) => setSelectedStaffRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="pathologist">Consultant Pathologist</option>
                  <option value="lab_supervisor">Laboratory Supervisor</option>
                  <option value="lab_scientist">Medical Lab Scientist</option>
                  <option value="receptionist">Medical Receptionist</option>
                  <option value="accountant">Billing Accountant</option>
                  <option value="lab_admin">Laboratory Administrator</option>
                </select>
                <button
                  onClick={handleDevStaffLogin}
                  disabled={isAuthLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Dev Sign-In</span>
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span>New diagnostic facility?</span>
              <button
                onClick={onRegister}
                className="text-teal-400 hover:text-teal-300 font-semibold hover:underline"
              >
                Register Laboratory &rarr;
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
