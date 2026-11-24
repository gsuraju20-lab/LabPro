import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onIdTokenChanged,
  User as FirebaseUser,
  signInAnonymously,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { UserRole } from '../types/lis';
import { ENABLE_DEV_BYPASS_TOOLS } from '../config/env';
import {
  findPendingInvitationByEmail,
  markInvitationAcceptedInFirestore,
} from './firestoreService';

import {
  PLATFORM_ADMIN_EMAILS,
  AppUserProfile,
  isTrustedPlatformAdminEmail,
  sanitizeUserProfileForClient,
} from '../utils/authPolicy';

export {
  PLATFORM_ADMIN_EMAILS,
  isTrustedPlatformAdminEmail,
  sanitizeUserProfileForClient,
};
export type { AppUserProfile };

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function formatAuthError(error: any): Error {
  const code = error?.code || '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return new Error('Sign-in was cancelled before authentication completed. Please try again.');
  }
  if (code === 'auth/popup-blocked') {
    return new Error(
      'Sign-in popup was blocked by your browser. Please allow popups for this site in your browser address bar and try again.'
    );
  }
  if (code === 'auth/user-disabled') {
    return new Error('This account has been disabled or suspended. Contact your administrator.');
  }
  if (code === 'auth/network-request-failed') {
    return new Error('Network error while contacting Firebase Authentication. Check your connection and retry.');
  }
  if (code === 'auth/user-token-expired' || code === 'auth/id-token-revoked') {
    return new Error('Your authentication session has expired. Please sign in again.');
  }
  return error instanceof Error ? error : new Error('Authentication failed. Please try again.');
}

async function syncGoogleUserProfile(user: FirebaseUser): Promise<AppUserProfile> {
  const normalizedEmail = (user.email || '').trim().toLowerCase();
  const userRef = doc(db, 'users', user.uid);
  let profile: AppUserProfile;

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const existing = snap.data() as AppUserProfile;
      profile = sanitizeUserProfileForClient(
        {
          ...existing,
          email: normalizedEmail || existing.email,
          displayName: user.displayName || existing.displayName,
          avatarUrl: user.photoURL || existing.avatarUrl,
          lastLoginAt: new Date().toISOString(),
        },
        user.emailVerified
      );

      if (isTrustedPlatformAdminEmail(normalizedEmail, user.emailVerified)) {
        profile = {
          ...profile,
          role: 'super_admin',
          labId: existing.labId && existing.labId !== 'unassigned' ? existing.labId : 'lab-apex',
          laboratoryName:
            existing.laboratoryName && existing.labId !== 'unassigned'
              ? existing.laboratoryName
              : 'Apex Clinical Diagnostics & Path Lab',
          isPlatformSuperAdmin: true,
        };
        await setDoc(userRef, profile, { merge: true });
      } else if (profile.labId === 'unassigned' && normalizedEmail && user.emailVerified) {
        const invite = await findPendingInvitationByEmail(normalizedEmail);
        if (invite && invite.role !== 'super_admin') {
          profile = {
            ...profile,
            role: invite.role,
            labId: invite.labId,
            laboratoryName: invite.laboratoryName,
            licenseNumber: invite.licenseNumber || profile.licenseNumber,
            invitationId: invite.id,
            isPlatformSuperAdmin: false,
          };
          await setDoc(userRef, profile, { merge: true });
          await markInvitationAcceptedInFirestore(invite.id, user.uid);
        } else {
          await setDoc(
            userRef,
            {
              displayName: profile.displayName,
              avatarUrl: profile.avatarUrl,
              lastLoginAt: profile.lastLoginAt,
            },
            { merge: true }
          );
        }
      } else {
        await setDoc(
          userRef,
          {
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            lastLoginAt: profile.lastLoginAt,
          },
          { merge: true }
        );
      }
    } else if (isTrustedPlatformAdminEmail(normalizedEmail, user.emailVerified)) {
      profile = {
        uid: user.uid,
        email: normalizedEmail,
        displayName: user.displayName || 'Platform Super Administrator',
        role: 'super_admin',
        labId: 'lab-apex',
        laboratoryName: 'Apex Clinical Diagnostics & Path Lab',
        avatarUrl: user.photoURL || undefined,
        lastLoginAt: new Date().toISOString(),
        isPlatformSuperAdmin: true,
        isActive: true,
      };
      await setDoc(userRef, profile);
    } else {
      const invite =
        normalizedEmail && user.emailVerified
          ? await findPendingInvitationByEmail(normalizedEmail)
          : null;

      if (invite && invite.role !== 'super_admin') {
        profile = {
          uid: user.uid,
          email: normalizedEmail,
          displayName: user.displayName || invite.fullName || 'Laboratory Personnel',
          role: invite.role,
          labId: invite.labId,
          laboratoryName: invite.laboratoryName,
          licenseNumber: invite.licenseNumber,
          avatarUrl: user.photoURL || undefined,
          lastLoginAt: new Date().toISOString(),
          invitationId: invite.id,
          isPlatformSuperAdmin: false,
          isActive: true,
        };
        await setDoc(userRef, profile);
        await markInvitationAcceptedInFirestore(invite.id, user.uid);
      } else {
        profile = {
          uid: user.uid,
          email: normalizedEmail || 'user@example.com',
          displayName: user.displayName || 'Registered User',
          role: 'receptionist',
          labId: 'unassigned',
          laboratoryName: 'Pending Lab Assignment',
          avatarUrl: user.photoURL || undefined,
          lastLoginAt: new Date().toISOString(),
          isPlatformSuperAdmin: false,
          isActive: true,
        };
        await setDoc(userRef, profile);
      }
    }
  } catch (dbErr) {
    handleFirestoreError(dbErr, OperationType.WRITE, `users/${user.uid}`);
  }

  return profile;
}

let redirectResultPromise: Promise<AppUserProfile | null> | null = null;

export function completeRedirectSignIn(): Promise<AppUserProfile | null> {
  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return null;
        return await syncGoogleUserProfile(result.user);
      })
      .catch((err) => {
        console.warn('Redirect sign-in note:', err?.code || err?.message);
        return null;
      });
  }
  return redirectResultPromise;
}

export async function loginWithGoogle(): Promise<AppUserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await syncGoogleUserProfile(result.user);
  } catch (error: any) {
    const code = error?.code || '';
    const isEmbeddedFrame = typeof window !== 'undefined' && window.self !== window.top;

    // On standalone top-level tabs, transparently fall back to redirect sign-in when popups are blocked
    if (code === 'auth/popup-blocked' && !isEmbeddedFrame) {
      await signInWithRedirect(auth, googleProvider);
      return new Promise<AppUserProfile>(() => {
        // Page navigates to Google OAuth redirect flow
      });
    }

    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request'
    ) {
      console.warn('Google Sign-In interrupted:', code);
    } else {
      console.error('Google Sign-In Error:', error);
    }
    throw formatAuthError(error);
  }
}

export async function assignLabOwnerProfile(params: {
  uid: string;
  email: string;
  displayName: string;
  labId: string;
  laboratoryName: string;
  licenseNumber?: string;
}): Promise<AppUserProfile> {
  const userRef = doc(db, 'users', params.uid);
  const profile: AppUserProfile = {
    uid: params.uid,
    email: params.email.trim().toLowerCase(),
    displayName: params.displayName,
    role: 'lab_admin',
    labId: params.labId,
    laboratoryName: params.laboratoryName,
    licenseNumber: params.licenseNumber,
    lastLoginAt: new Date().toISOString(),
    isPlatformSuperAdmin: false,
    isActive: true,
  };
  await setDoc(userRef, profile, { merge: true });
  return profile;
}

/**
 * Explicit opt-in testing-only staff role credential sign-in.
 * Strictly blocked in production and whenever VITE_ENABLE_DEV_AUTH !== 'true'.
 */
export async function loginAsStaffMember(
  staffInfo: {
    name: string;
    email: string;
    role: UserRole;
    labId: string;
    licenseNumber?: string;
  }
): Promise<AppUserProfile> {
  if (!ENABLE_DEV_BYPASS_TOOLS) {
    throw new Error('Development staff quick-login is disabled.');
  }

  let firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    try {
      const anonResult = await signInAnonymously(auth);
      firebaseUser = anonResult.user;
    } catch (e) {
      console.warn('Anonymous auth note:', e);
    }
  }

  const uid = firebaseUser ? firebaseUser.uid : `staff-${staffInfo.role}-${staffInfo.labId}`;
  const safeRole: UserRole = staffInfo.role === 'super_admin' ? 'lab_admin' : staffInfo.role;
  const profile: AppUserProfile = {
    uid,
    email: staffInfo.email,
    displayName: staffInfo.name,
    role: safeRole,
    labId: staffInfo.labId,
    laboratoryName: 'Apex Clinical Diagnostics & Path Lab',
    licenseNumber: staffInfo.licenseNumber,
    lastLoginAt: new Date().toISOString(),
    isDemoAccount: true,
    isPlatformSuperAdmin: false,
    isActive: true,
  };

  return profile;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onIdTokenChanged(auth, callback);
}

export async function verifySessionValidity(user: FirebaseUser): Promise<boolean> {
  try {
    const tokenResult = await user.getIdTokenResult(true);
    const expMs = new Date(tokenResult.expirationTime).getTime();
    return Number.isFinite(expMs) ? expMs > Date.now() : true;
  } catch (error: any) {
    const code = error?.code || '';
    if (
      code === 'auth/user-token-expired' ||
      code === 'auth/id-token-revoked' ||
      code === 'auth/user-disabled' ||
      code === 'auth/invalid-user-token'
    ) {
      return false;
    }
    return true;
  }
}

export async function fetchUserProfile(
  uid: string,
  emailVerified = true
): Promise<AppUserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return sanitizeUserProfileForClient(snap.data() as AppUserProfile, emailVerified);
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
}
