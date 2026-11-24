import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App safely (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore according to standard Firebase specification
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

/**
 * Validate Connection to Firestore per skill specification.
 * Calls getDocFromServer to verify connectivity with the remote backend,
 * with a retry loop to gracefully accommodate cold starts.
 */
export async function testConnection(retries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      return true;
    } catch (error) {
      if (attempt === retries) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration.');
        }
        return false;
      }
      // Wait briefly before retrying in case the remote instance is spinning up
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
  return false;
}

// Initial connection validation trigger on app boot
testConnection();

export const verifyFirestoreConnection = testConnection;
