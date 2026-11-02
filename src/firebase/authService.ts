import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { UserRole } from '../types/lis';

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
}

const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(labId: string, role: UserRole = 'lab_scientist'): Promise<AppUserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, 'users', user.uid);
    let profile: AppUserProfile;

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const existing = snap.data() as AppUserProfile;
        profile = {
          ...existing,
          lastLoginAt: new Date().toISOString(),
          labId: existing.labId || labId,
        };
        await setDoc(userRef, profile, { merge: true });
      } else {
        profile = {
          uid: user.uid,
          email: user.email || 'user@example.com',
          displayName: user.displayName || 'Authorized Clinician',
          role: role,
          labId: labId,
          laboratoryName: 'Apex Clinical Diagnostics',
          avatarUrl: user.photoURL || undefined,
          lastLoginAt: new Date().toISOString(),
        };
        await setDoc(userRef, profile);
      }
    } catch (dbErr) {
      handleFirestoreError(dbErr, OperationType.WRITE, `users/${user.uid}`);
    }

    return profile;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Direct medical staff authentication for testing and role-based workflows
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
  const profile: AppUserProfile = {
    uid,
    email: staffInfo.email,
    displayName: staffInfo.name,
    role: staffInfo.role,
    labId: staffInfo.labId,
    laboratoryName: 'Apex Clinical Diagnostics & Path Lab',
    licenseNumber: staffInfo.licenseNumber,
    lastLoginAt: new Date().toISOString(),
    isDemoAccount: true,
  };

  if (firebaseUser) {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, profile, { merge: true });
    } catch (dbErr) {
      // Non-fatal if offline/rules
      console.warn('Profile sync note:', dbErr);
    }
  }

  return profile;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function fetchUserProfile(uid: string): Promise<AppUserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as AppUserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
}
