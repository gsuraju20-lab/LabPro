import React, { useState } from 'react';
import {
  Shield,
  Activity,
  LogIn,
  LogOut,
  UserCheck,
  CheckCircle2,
  Lock,
  Building2,
  X,
  Sparkles,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { UserRole } from '../types/lis';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isBlocking?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isBlocking = false,
}) => {
  const {
    currentUserProfile,
    loginGoogle,
    loginStaff,
    logout,
    currentLab,
    staffList,
    isAuthLoading,
  } = useLIS();

  const [selectedStaffRole, setSelectedStaffRole] = useState<UserRole>('pathologist');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginGoogle();
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setError(err?.message || 'Google authentication failed. Please try again or use direct staff sign-in.');
    }
  };

  const handleStaffLogin = async () => {
    setError(null);
    try {
      const staffMember = staffList.find((s) => s.role === selectedStaffRole) || staffList[0];
      await loginStaff({
        name: staffMember.fullName,
        email: staffMember.email,
        role: staffMember.role,
        labId: currentLab.id,
        licenseNumber: staffMember.licenseNumber,
      });
      if (onClose) onClose();
    } catch (err: any) {
      setError(err?.message || 'Staff login failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Brand Banner */}
        <div className="bg-slate-900 px-6 py-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-center mb-2">
            <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/40">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">LabPro Medical LIS</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Institutional Laboratory Information System • Clinical Access Gate
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 text-[11px] font-mono border border-slate-700">
            <Building2 className="w-3 h-3 text-teal-400" />
            <span>Workspace: {currentLab.name}</span>
          </div>

          {!isBlocking && onClose && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Current Session Info if logged in */}
          {currentUserProfile && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Active Personnel</span>
                <span className="font-mono text-[10px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 capitalize">
                  {currentUserProfile.role.replace('_', ' ')}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{currentUserProfile.displayName}</p>
              <p className="text-slate-500">{currentUserProfile.email}</p>
              {currentUserProfile.licenseNumber && (
                <p className="font-mono text-[11px] text-slate-600">
                  License: {currentUserProfile.licenseNumber}
                </p>
              )}
            </div>
          )}

          {/* Primary Action 1: Google OAuth Sign-In */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Federated Identity Sign-In
            </label>
            <button
              onClick={handleGoogleLogin}
              disabled={isAuthLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{isAuthLoading ? 'Connecting...' : 'Sign in with Google Workspace'}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <span className="h-px bg-slate-200 w-full" />
            <span className="px-3 bg-white text-[10px] uppercase font-bold text-slate-400 absolute">
              Or Laboratory Staff Sign-In
            </span>
          </div>

          {/* Primary Action 2: Staff Direct Role Access */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Medical Role Credential
              </label>
              <select
                value={selectedStaffRole}
                onChange={(e) => setSelectedStaffRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden capitalize"
              >
                <option value="pathologist">Consultant Pathologist (MDCN / FMCPath)</option>
                <option value="lab_supervisor">Laboratory Supervisor (MLSCN Senior)</option>
                <option value="lab_scientist">Medical Laboratory Scientist (MLS Bench)</option>
                <option value="receptionist">Medical Receptionist / Phlebotomist</option>
                <option value="accountant">Billing Accountant (ICAN)</option>
                <option value="lab_admin">Laboratory Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <button
              onClick={handleStaffLogin}
              disabled={isAuthLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>Authorize Personnel Login</span>
            </button>
          </div>

          {/* Logout button if currently signed in */}
          {currentUserProfile && (
            <div className="pt-2 border-t border-slate-100 flex justify-center">
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out Current Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
