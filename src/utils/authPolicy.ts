import { UserRole } from '../types/lis';

export const PLATFORM_ADMIN_EMAILS = ['surajugabriel499@gmail.com'];

export interface AppUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  labId: string;
  laboratoryName: string;
  licenseNumber?: string;
  avatarUrl?: string;
  lastLoginAt: string;
  isDemoAccount?: boolean;
  isPlatformSuperAdmin?: boolean;
  invitationId?: string;
  isActive?: boolean;
}

export function isTrustedPlatformAdminEmail(email?: string | null, emailVerified = false): boolean {
  if (!email || !emailVerified) return false;
  return PLATFORM_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function sanitizeUserProfileForClient(
  profile: AppUserProfile,
  emailVerified: boolean
): AppUserProfile {
  const isVerifiedPlatformAdmin = isTrustedPlatformAdminEmail(profile.email, emailVerified);
  if (isVerifiedPlatformAdmin) {
    return {
      ...profile,
      role: 'super_admin',
      isPlatformSuperAdmin: true,
    };
  }
  const safeRole: UserRole = profile.role === 'super_admin' ? 'receptionist' : profile.role;
  return {
    ...profile,
    role: safeRole,
    isPlatformSuperAdmin: false,
  };
}
