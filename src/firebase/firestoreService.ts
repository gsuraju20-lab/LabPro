import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import {
  Laboratory,
  Department,
  TestDefinition,
  Patient,
  TestRequest,
  Sample,
  TestResult,
  Invoice,
  StaffMember,
  AuditLog,
} from '../types/lis';
import {
  INITIAL_LABORATORIES,
  INITIAL_DEPARTMENTS,
  INITIAL_TESTS,
  INITIAL_PATIENTS,
  INITIAL_REQUESTS,
  INITIAL_SAMPLES,
  INITIAL_RESULTS,
  INITIAL_INVOICES,
  INITIAL_STAFF,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

// Bootstrap & Initial Seed for a Laboratory Tenant
export async function bootstrapTenantData(labId: string): Promise<boolean> {
  // Only bootstrap if the user is authenticated
  if (!auth.currentUser) {
    return false;
  }

  const labPath = `laboratories/${labId}`;
  try {
    const labDocRef = doc(db, 'laboratories', labId);
    const labSnap = await getDoc(labDocRef);

    if (labSnap.exists()) {
      return true; // Already seeded in Firestore
    }

    const templateLab = INITIAL_LABORATORIES.find((l) => l.id === labId) || INITIAL_LABORATORIES[0];
    const initialLabData: Laboratory = {
      ...templateLab,
      id: labId,
    };

    // Create Laboratory Tenant Root
    await setDoc(labDocRef, initialLabData);

    // Seed Departments
    for (const dep of INITIAL_DEPARTMENTS) {
      const depRef = doc(db, 'laboratories', labId, 'departments', dep.id);
      await setDoc(depRef, { ...dep, labId });
    }

    // Seed Test Catalogue
    for (const test of INITIAL_TESTS) {
      const testRef = doc(db, 'laboratories', labId, 'tests', test.id);
      await setDoc(testRef, { ...test, labId });
    }

    // Seed Patients
    for (const patient of INITIAL_PATIENTS) {
      const patRef = doc(db, 'laboratories', labId, 'patients', patient.id);
      await setDoc(patRef, { ...patient, labId });
    }

    // Seed Requests
    for (const req of INITIAL_REQUESTS) {
      const reqRef = doc(db, 'laboratories', labId, 'requests', req.id);
      await setDoc(reqRef, { ...req, labId });
    }

    // Seed Samples
    for (const smp of INITIAL_SAMPLES) {
      const smpRef = doc(db, 'laboratories', labId, 'samples', smp.id);
      await setDoc(smpRef, { ...smp, labId });
    }

    // Seed Results
    for (const res of INITIAL_RESULTS) {
      const resRef = doc(db, 'laboratories', labId, 'results', res.id);
      await setDoc(resRef, { ...res, labId });
    }

    // Seed Invoices
    for (const inv of INITIAL_INVOICES) {
      const invRef = doc(db, 'laboratories', labId, 'invoices', inv.id);
      await setDoc(invRef, { ...inv, labId });
    }

    // Seed Staff
    for (const stf of INITIAL_STAFF) {
      const stfRef = doc(db, 'laboratories', labId, 'staff', stf.id);
      await setDoc(stfRef, { ...stf, labId });
    }

    // Seed Audit Logs
    for (const log of INITIAL_AUDIT_LOGS) {
      const logRef = doc(db, 'laboratories', labId, 'auditLogs', log.id);
      await setDoc(logRef, { ...log, labId });
    }

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, labPath);
    return false;
  }
}

// ==========================================
// REAL-TIME FIRESTORE SUBSCRIPTIONS
// ==========================================

export function subscribeToPatients(
  labId: string,
  onData: (patients: Patient[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }
  const q = collection(db, 'laboratories', labId, 'patients');
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Patient[] = [];
      snapshot.forEach((d) => items.push(d.data() as Patient));
      onData(items);
    },
    (err) => {
      console.warn('Patients snapshot subscription note:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToRequests(
  labId: string,
  onData: (requests: TestRequest[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }
  const q = collection(db, 'laboratories', labId, 'requests');
  return onSnapshot(
    q,
    (snapshot) => {
      const items: TestRequest[] = [];
      snapshot.forEach((d) => items.push(d.data() as TestRequest));
      onData(items);
    },
    (err) => {
      console.warn('Requests snapshot subscription note:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToSamples(
  labId: string,
  onData: (samples: Sample[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }
  const q = collection(db, 'laboratories', labId, 'samples');
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Sample[] = [];
      snapshot.forEach((d) => items.push(d.data() as Sample));
      onData(items);
    },
    (err) => {
      console.warn('Samples snapshot subscription note:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToResults(
  labId: string,
  onData: (results: TestResult[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }
  const q = collection(db, 'laboratories', labId, 'results');
  return onSnapshot(
    q,
    (snapshot) => {
      const items: TestResult[] = [];
      snapshot.forEach((d) => items.push(d.data() as TestResult));
      onData(items);
    },
    (err) => {
      console.warn('Results snapshot subscription note:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToInvoices(
  labId: string,
  onData: (invoices: Invoice[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }
  const q = collection(db, 'laboratories', labId, 'invoices');
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Invoice[] = [];
      snapshot.forEach((d) => items.push(d.data() as Invoice));
      onData(items);
    },
    (err) => {
      console.warn('Invoices snapshot subscription note:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToTests(
  labId: string,
  onData: (tests: TestDefinition[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }
  const q = collection(db, 'laboratories', labId, 'tests');
  return onSnapshot(
    q,
    (snapshot) => {
      const items: TestDefinition[] = [];
      snapshot.forEach((d) => items.push(d.data() as TestDefinition));
      onData(items);
    },
    (err) => {
      console.warn('Tests snapshot subscription note:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToDepartments(
  labId: string,
  onData: (departments: Department[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }
  const q = collection(db, 'laboratories', labId, 'departments');
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Department[] = [];
      snapshot.forEach((d) => items.push(d.data() as Department));
      onData(items);
    },
    (err) => {
      console.warn('Departments snapshot subscription note:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToAuditLogs(
  labId: string,
  onData: (logs: AuditLog[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }
  const q = collection(db, 'laboratories', labId, 'auditLogs');
  return onSnapshot(
    q,
    (snapshot) => {
      const items: AuditLog[] = [];
      snapshot.forEach((d) => items.push(d.data() as AuditLog));
      onData(items);
    },
    (err) => {
      console.warn('Audit logs snapshot subscription note:', err);
      if (onError) onError(err);
    }
  );
}

// ==========================================
// FIRESTORE MUTATIONS WITH AUDIT & IMMUTABILITY
// ==========================================

export async function addPatientToFirestore(labId: string, patient: Patient): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}/patients/${patient.id}`;
  try {
    await setDoc(doc(db, 'laboratories', labId, 'patients', patient.id), patient);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updatePatientInFirestore(labId: string, patientId: string, updates: Partial<Patient>): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}/patients/${patientId}`;
  try {
    await updateDoc(doc(db, 'laboratories', labId, 'patients', patientId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addRequestToFirestore(
  labId: string,
  request: TestRequest,
  samples: Sample[],
  invoice: Invoice
): Promise<void> {
  if (!auth.currentUser) return;
  const reqPath = `laboratories/${labId}/requests/${request.id}`;
  try {
    // Write Request document
    await setDoc(doc(db, 'laboratories', labId, 'requests', request.id), request);

    // Write generated Samples
    for (const smp of samples) {
      await setDoc(doc(db, 'laboratories', labId, 'samples', smp.id), smp);
    }

    // Write generated Invoice
    await setDoc(doc(db, 'laboratories', labId, 'invoices', invoice.id), invoice);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, reqPath);
  }
}

export async function updateRequestStatusInFirestore(
  labId: string,
  requestId: string,
  status: TestRequest['status']
): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}/requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'laboratories', labId, 'requests', requestId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateSampleInFirestore(
  labId: string,
  sampleId: string,
  updates: Partial<Sample>
): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}/samples/${sampleId}`;
  try {
    await updateDoc(doc(db, 'laboratories', labId, 'samples', sampleId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveResultToFirestore(labId: string, result: TestResult): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}/results/${result.id}`;
  try {
    await setDoc(doc(db, 'laboratories', labId, 'results', result.id), result, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function recordPaymentInFirestore(
  labId: string,
  invoiceId: string,
  paidAmount: number,
  balance: number,
  status: Invoice['status'],
  paymentMethod: string
): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}/invoices/${invoiceId}`;
  try {
    await updateDoc(doc(db, 'laboratories', labId, 'invoices', invoiceId), {
      paidAmount,
      balance,
      status,
      paymentMethod,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addTestToFirestore(labId: string, test: TestDefinition): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}/tests/${test.id}`;
  try {
    await setDoc(doc(db, 'laboratories', labId, 'tests', test.id), test);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTestInFirestore(
  labId: string,
  testId: string,
  updates: Partial<TestDefinition>
): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}/tests/${testId}`;
  try {
    await updateDoc(doc(db, 'laboratories', labId, 'tests', testId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addDepartmentToFirestore(labId: string, department: Department): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}/departments/${department.id}`;
  try {
    await setDoc(doc(db, 'laboratories', labId, 'departments', department.id), department);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateDepartmentInFirestore(
  labId: string,
  departmentId: string,
  updates: Partial<Department>
): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}/departments/${departmentId}`;
  try {
    await updateDoc(doc(db, 'laboratories', labId, 'departments', departmentId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addAuditLogToFirestore(labId: string, log: AuditLog): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}/auditLogs/${log.id}`;
  try {
    await setDoc(doc(db, 'laboratories', labId, 'auditLogs', log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveLaboratorySettingsToFirestore(
  labId: string,
  settings: Partial<Laboratory>
): Promise<void> {
  if (!auth.currentUser) return;
  const path = `laboratories/${labId}`;
  try {
    await setDoc(doc(db, 'laboratories', labId), settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
