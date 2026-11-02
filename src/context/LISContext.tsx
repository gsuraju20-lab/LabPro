import React, { createContext, useContext, useState, useEffect } from 'react';
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
  UserRole,
  ResultFlag,
} from '../types/lis';
import {
  SubscriptionPlan,
  SubscriptionPlanId,
  SubscriptionBillingCycle,
  PaymentTransaction,
  PlatformAdmin,
  LaboratorySubscription,
  PlanLimits,
} from '../types/saas';
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
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_PAYMENT_TRANSACTIONS,
  INITIAL_PLATFORM_ADMINS,
} from '../data/initialData';
import { verifyFirestoreConnection } from '../firebase/config';
import {
  AppUserProfile,
  loginWithGoogle,
  loginAsStaffMember,
  logoutUser,
  subscribeToAuthState,
  fetchUserProfile,
} from '../firebase/authService';
import {
  bootstrapTenantData,
  subscribeToPatients,
  subscribeToRequests,
  subscribeToSamples,
  subscribeToResults,
  subscribeToInvoices,
  subscribeToTests,
  subscribeToDepartments,
  subscribeToAuditLogs,
  addPatientToFirestore,
  updatePatientInFirestore,
  addRequestToFirestore,
  updateRequestStatusInFirestore,
  updateSampleInFirestore,
  saveResultToFirestore,
  recordPaymentInFirestore,
  addTestToFirestore,
  updateTestInFirestore,
  addDepartmentToFirestore,
  updateDepartmentInFirestore,
  addAuditLogToFirestore,
  saveLaboratorySettingsToFirestore,
} from '../firebase/firestoreService';

interface LISContextType {
  // Tenancy
  currentLab: Laboratory;
  laboratories: Laboratory[];
  setCurrentLabId: (labId: string) => void;
  createLaboratory: (lab: Omit<Laboratory, 'id' | 'createdAt'>) => Laboratory;
  updateLaboratorySettings: (lab: Partial<Laboratory>) => void;

  // Authentication & Session
  currentUserProfile: AppUserProfile | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentStaff: StaffMember;
  staffList: StaffMember[];
  addStaffMember: (member: Omit<StaffMember, 'id' | 'labId' | 'joinedAt'>) => void;
  toggleStaffStatus: (staffId: string) => void;
  loginGoogle: () => Promise<void>;
  loginStaff: (info: { name: string; email: string; role: UserRole; labId: string; licenseNumber?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAuthLoading: boolean;

  // Departments
  departments: Department[];
  addDepartment: (dep: Omit<Department, 'id' | 'labId'>) => void;
  updateDepartment: (id: string, dep: Partial<Department>) => void;

  // Test Catalogue
  tests: TestDefinition[];
  addTestDefinition: (test: Omit<TestDefinition, 'id' | 'labId' | 'createdAt'>) => void;
  updateTestDefinition: (id: string, test: Partial<TestDefinition>) => void;

  // Patients
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'labId' | 'createdAt' | 'patientIdNumber'>) => Patient;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  getPatientById: (id: string) => Patient | undefined;

  // Test Requests
  requests: TestRequest[];
  createTestRequest: (data: {
    patientId: string;
    referringDoctor: string;
    clinicalIndication: string;
    priority: 'routine' | 'urgent' | 'stat';
    testIds: string[];
    discount?: number;
    initialPayment?: number;
    paymentMethod?: string;
  }) => TestRequest;
  updateRequestStatus: (requestId: string, status: TestRequest['status']) => void;

  // Samples
  samples: Sample[];
  collectSample: (sampleId: string, collectedBy: string) => void;
  receiveSample: (sampleId: string, receivedBy: string) => void;
  rejectSample: (sampleId: string, reason: string, notes?: string) => void;

  // Results & Verification
  results: TestResult[];
  saveResult: (data: {
    requestId: string;
    testId: string;
    sampleId: string;
    parameterValues: Record<string, string | number>;
    technicianComments?: string;
    submitForVerification: boolean;
  }) => void;
  verifyResult: (resultId: string, decision: 'approve' | 'reject' | 'return', comments: string) => void;
  amendResult: (resultId: string, updatedValues: Record<string, string | number>, reason: string) => void;

  // Billing
  invoices: Invoice[];
  recordPayment: (invoiceId: string, amount: number, paymentMethod: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, entityType: AuditLog['entityType'], entityId: string, details: string) => void;

  // Global UI & Connectivity State
  isFirestoreOnline: boolean;
  isPrintReportOpen: boolean;
  selectedReportRequestId: string | null;
  openReportModal: (requestId: string) => void;
  closeReportModal: () => void;

  // SaaS Multi-Tenant Subscriptions & Governance
  plans: SubscriptionPlan[];
  transactions: PaymentTransaction[];
  platformAdmins: PlatformAdmin[];
  registerLaboratoryTenant: (data: {
    name: string;
    code: string;
    licenseNumber: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    currencySymbol: string;
    accreditation?: string;
    adminName: string;
    adminEmail: string;
    adminLicense?: string;
    planId: SubscriptionPlanId;
    billingCycle: SubscriptionBillingCycle;
    paymentProvider: 'paystack' | 'flutterwave';
    isTrial?: boolean;
  }) => Promise<Laboratory>;
  updateSubscription: (
    labId: string,
    planId: SubscriptionPlanId,
    billingCycle: SubscriptionBillingCycle,
    paymentProvider?: 'paystack' | 'flutterwave'
  ) => void;
  toggleLaboratorySuspension: (labId: string, reason?: string) => void;
  updatePlanPricing: (planId: SubscriptionPlanId, monthlyPrice: number, annualPrice: number) => void;
  updatePlanLimits: (planId: SubscriptionPlanId, limits: Partial<PlanLimits>) => void;
}

const LISContext = createContext<LISContextType | undefined>(undefined);

export const LISProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [laboratories, setLaboratories] = useState<Laboratory[]>(INITIAL_LABORATORIES);
  const [currentLabId, setCurrentLabId] = useState<string>('lab-apex');

  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_SUBSCRIPTION_PLANS);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_PAYMENT_TRANSACTIONS);
  const [platformAdmins, setPlatformAdmins] = useState<PlatformAdmin[]>(INITIAL_PLATFORM_ADMINS);

  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [tests, setTests] = useState<TestDefinition[]>(INITIAL_TESTS);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [requests, setRequests] = useState<TestRequest[]>(INITIAL_REQUESTS);
  const [samples, setSamples] = useState<Sample[]>(INITIAL_SAMPLES);
  const [results, setResults] = useState<TestResult[]>(INITIAL_RESULTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<AppUserProfile | null>({
    uid: 'staff-pathologist-lab-apex',
    displayName: 'Dr. Obinna Eze, MBBS, FMCPath',
    email: 'dr.eze@apexdiagnostics.ng',
    role: 'pathologist',
    labId: 'lab-apex',
    laboratoryName: 'Apex Clinical Diagnostics & Path Lab',
    licenseNumber: 'MDCN/68902',
    lastLoginAt: new Date().toISOString(),
    isDemoAccount: true,
  });
  const [currentRole, setCurrentRole] = useState<UserRole>('pathologist');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  const [isFirestoreOnline, setIsFirestoreOnline] = useState<boolean>(true);
  const [selectedReportRequestId, setSelectedReportRequestId] = useState<string | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);

  // 1. Initial Firestore Connection & Auth State Listener
  useEffect(() => {
    verifyFirestoreConnection()
      .then((connected) => setIsFirestoreOnline(connected))
      .catch(() => setIsFirestoreOnline(false));

    const unsubscribeAuth = subscribeToAuthState(async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const profile = await fetchUserProfile(user.uid);
          if (profile) {
            setCurrentUserProfile(profile);
            setCurrentRole(profile.role);
            if (profile.labId) setCurrentLabId(profile.labId);
          }
        } catch (e) {
          console.warn('Profile fetch note:', e);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Tenant Bootstrap and Real-time Firestore Subscriptions for Active Laboratory
  useEffect(() => {
    // Only bootstrap and attach listeners when authenticated
    if (!firebaseUser) {
      return;
    }

    // Bootstrap documents in Firestore for active lab
    bootstrapTenantData(currentLabId).catch((err) => {
      console.warn('Tenant bootstrap note:', err);
    });

    // Attach real-time Firestore listeners
    const unsubPatients = subscribeToPatients(currentLabId, (data) => {
      if (data && data.length > 0) setPatients(data);
    });
    const unsubRequests = subscribeToRequests(currentLabId, (data) => {
      if (data && data.length > 0) setRequests(data);
    });
    const unsubSamples = subscribeToSamples(currentLabId, (data) => {
      if (data && data.length > 0) setSamples(data);
    });
    const unsubResults = subscribeToResults(currentLabId, (data) => {
      if (data && data.length > 0) setResults(data);
    });
    const unsubInvoices = subscribeToInvoices(currentLabId, (data) => {
      if (data && data.length > 0) setInvoices(data);
    });
    const unsubTests = subscribeToTests(currentLabId, (data) => {
      if (data && data.length > 0) setTests(data);
    });
    const unsubDepartments = subscribeToDepartments(currentLabId, (data) => {
      if (data && data.length > 0) setDepartments(data);
    });
    const unsubAudit = subscribeToAuditLogs(currentLabId, (data) => {
      if (data && data.length > 0) setAuditLogs(data);
    });

    return () => {
      unsubPatients();
      unsubRequests();
      unsubSamples();
      unsubResults();
      unsubInvoices();
      unsubTests();
      unsubDepartments();
      unsubAudit();
    };
  }, [currentLabId, firebaseUser]);

  const currentLab = laboratories.find((lab) => lab.id === currentLabId) || laboratories[0];

  const currentStaff =
    staffList.find((s) => s.role === currentRole && s.labId === currentLab.id) ||
    staffList.find((s) => s.role === currentRole) ||
    staffList[0];

  // Auth Functions
  const loginGoogle = async () => {
    setIsAuthLoading(true);
    try {
      const profile = await loginWithGoogle(currentLab.id, currentRole);
      setCurrentUserProfile(profile);
      setCurrentRole(profile.role);
      addAuditLog('STAFF_LOGIN', 'staff', profile.uid, `Personnel ${profile.displayName} logged in via Google OAuth.`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginStaff = async (info: {
    name: string;
    email: string;
    role: UserRole;
    labId: string;
    licenseNumber?: string;
  }) => {
    setIsAuthLoading(true);
    try {
      const profile = await loginAsStaffMember(info);
      setCurrentUserProfile(profile);
      setCurrentRole(profile.role);
      addAuditLog('STAFF_LOGIN', 'staff', profile.uid, `Personnel ${profile.displayName} authorized as ${profile.role}.`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUserProfile(null);
    setIsAuthModalOpen(true);
  };

  const addAuditLog = (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string
  ) => {
    const operatorName = currentUserProfile?.displayName || currentStaff.fullName;
    const operatorRole = currentRole;

    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      labId: currentLab.id,
      action,
      entityType,
      entityId,
      performedBy: `${operatorName} (${operatorRole})`,
      userRole: operatorRole,
      details,
      createdAt: new Date().toISOString(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    // Persist to Cloud Firestore
    addAuditLogToFirestore(currentLab.id, newLog).catch((e) =>
      console.warn('Audit firestore write:', e)
    );
  };

  const createLaboratory = (labData: Omit<Laboratory, 'id' | 'createdAt'>): Laboratory => {
    const newLab: Laboratory = {
      ...labData,
      id: `lab-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLaboratories((prev) => [...prev, newLab]);
    setCurrentLabId(newLab.id);

    // Bootstrap in Firestore
    saveLaboratorySettingsToFirestore(newLab.id, newLab).catch((e) =>
      console.warn('Lab create firestore:', e)
    );
    addAuditLog('LAB_REGISTERED', 'setting', newLab.id, `Created workspace for ${newLab.name} (${newLab.code})`);
    return newLab;
  };

  const updateLaboratorySettings = (settingsData: Partial<Laboratory>) => {
    setLaboratories((prev) =>
      prev.map((lab) => (lab.id === currentLab.id ? { ...lab, ...settingsData, updatedAt: new Date().toISOString() } : lab))
    );
    saveLaboratorySettingsToFirestore(currentLab.id, settingsData).catch((e) =>
      console.warn('Lab update firestore:', e)
    );
    addAuditLog('SETTINGS_UPDATED', 'setting', currentLab.id, 'Laboratory configuration updated.');
  };

  const addStaffMember = (member: Omit<StaffMember, 'id' | 'labId' | 'joinedAt'>) => {
    const activePlan = plans.find((p) => p.id === (currentLab.subscription?.planId || currentLab.planId)) || plans[0];
    const currentStaffCount = staffList.filter((s) => s.labId === currentLab.id).length;
    if (activePlan.limits.maxStaff !== -1 && currentStaffCount >= activePlan.limits.maxStaff) {
      alert(`Staff Quota Reached: Your current ${activePlan.name} plan permits up to ${activePlan.limits.maxStaff} staff members. Please upgrade your plan under Subscription & Licensing.`);
      return;
    }

    const newStaff: StaffMember = {
      ...member,
      id: `staff-${Date.now()}`,
      labId: currentLab.id,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setStaffList((prev) => [...prev, newStaff]);
    addAuditLog('STAFF_ADDED', 'staff', newStaff.id, `Added staff member ${newStaff.fullName} as ${newStaff.role}`);
  };

  const registerLaboratoryTenant = async (data: {
    name: string;
    code: string;
    licenseNumber: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    currencySymbol: string;
    accreditation?: string;
    adminName: string;
    adminEmail: string;
    adminLicense?: string;
    planId: SubscriptionPlanId;
    billingCycle: SubscriptionBillingCycle;
    paymentProvider: 'paystack' | 'flutterwave';
    isTrial?: boolean;
  }): Promise<Laboratory> => {
    const newLabId = `lab-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
    const plan = plans.find((p) => p.id === data.planId) || plans[0];
    const now = new Date();
    const periodEnd = new Date(now.getTime() + (data.isTrial ? 14 : data.billingCycle === 'annual' ? 365 : 30) * 86400000);

    const subscription: LaboratorySubscription = {
      id: `sub-${Date.now()}`,
      labId: newLabId,
      planId: plan.id,
      planName: plan.name,
      billingCycle: data.billingCycle,
      status: data.isTrial ? 'trial' : 'active',
      amount: data.isTrial ? 0 : data.billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice,
      currency: data.currency,
      currencySymbol: data.currencySymbol,
      startDate: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      trialEndsAt: data.isTrial ? periodEnd.toISOString() : undefined,
      autoRenew: true,
      paymentProvider: data.paymentProvider,
      updatedAt: now.toISOString(),
    };

    const newLab: Laboratory = {
      id: newLabId,
      name: data.name,
      code: data.code,
      licenseNumber: data.licenseNumber,
      email: data.email,
      ownerEmail: data.adminEmail,
      phone: data.phone,
      address: data.address,
      currency: data.currency,
      currencySymbol: data.currencySymbol,
      accreditation: data.accreditation || 'MLSCN Registered Medical Facility',
      headerNote: 'Excellence in Precision Diagnostic Medicine',
      footerNote: 'Results verified by registered Medical Laboratory Scientists & Pathologists.',
      operatingHours: '08:00 - 18:00 Daily',
      status: data.isTrial ? 'trial' : 'active',
      planId: plan.id,
      subscription,
      createdAt: now.toISOString(),
    };

    const newAdminStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      labId: newLabId,
      fullName: data.adminName,
      email: data.adminEmail,
      role: 'lab_admin',
      department: 'Laboratory Executive',
      licenseNumber: data.adminLicense || 'MDCN/LAB/ADM',
      isActive: true,
      joinedAt: now.toISOString().slice(0, 10),
    };

    const newDeps: Department[] = [
      {
        id: `dep-haem-${Date.now()}`,
        labId: newLabId,
        name: 'Haematology & Coagulation',
        code: 'HAEM',
        description: 'Complete blood counts and blood film cytology.',
        isActive: true,
      },
      {
        id: `dep-chem-${Date.now()}`,
        labId: newLabId,
        name: 'Clinical Chemistry',
        code: 'CHEM',
        description: 'Enzymes, renal markers, liver function, and metabolic panels.',
        isActive: true,
      },
      {
        id: `dep-micro-${Date.now()}`,
        labId: newLabId,
        name: 'Medical Microbiology & Parasitology',
        code: 'MICRO',
        description: 'Microscopy, culture & sensitivity testing.',
        isActive: true,
      },
    ];

    const starterTests = INITIAL_TESTS.slice(0, 5).map((t, idx) => ({
      ...t,
      id: `test-${newLabId}-${idx + 1}`,
      labId: newLabId,
      createdAt: now.toISOString(),
    }));

    if (!data.isTrial) {
      const tx: PaymentTransaction = {
        id: `pay-${Date.now()}`,
        labId: newLabId,
        laboratoryName: data.name,
        planId: plan.id,
        planName: `${plan.name} ${data.billingCycle}`,
        billingCycle: data.billingCycle,
        amount: subscription.amount,
        currency: data.currency,
        status: 'success',
        provider: data.paymentProvider,
        reference: `PSTK_${Date.now()}_${Math.floor(Math.random() * 90000 + 10000)}`,
        customerEmail: data.adminEmail,
        paidAt: now.toISOString(),
        createdAt: now.toISOString(),
        invoiceNumber: `SAAS-INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        paymentMethod: 'Paystack Card / Direct Settlement',
      };
      setTransactions((prev) => [tx, ...prev]);
    }

    setLaboratories((prev) => [newLab, ...prev]);
    setStaffList((prev) => [newAdminStaff, ...prev]);
    setDepartments((prev) => [...prev, ...newDeps]);
    setTests((prev) => [...prev, ...starterTests]);
    setCurrentLabId(newLabId);
    setCurrentRole('lab_admin');

    saveLaboratorySettingsToFirestore(newLabId, newLab).catch(() => {});
    return newLab;
  };

  const updateSubscription = (
    labId: string,
    planId: SubscriptionPlanId,
    billingCycle: SubscriptionBillingCycle,
    paymentProvider: 'paystack' | 'flutterwave' = 'paystack'
  ) => {
    const targetPlan = plans.find((p) => p.id === planId) || plans[0];
    const now = new Date();
    const periodEnd = new Date(now.getTime() + (billingCycle === 'annual' ? 365 : 30) * 86400000);
    const amount = billingCycle === 'annual' ? targetPlan.annualPrice : targetPlan.monthlyPrice;

    setLaboratories((prev) =>
      prev.map((lab) => {
        if (lab.id !== labId) return lab;
        const newSub: LaboratorySubscription = {
          id: lab.subscription?.id || `sub-${Date.now()}`,
          labId,
          planId: targetPlan.id,
          planName: targetPlan.name,
          billingCycle,
          status: 'active',
          amount,
          currency: lab.currency || 'NGN',
          currencySymbol: lab.currencySymbol || '₦',
          startDate: now.toISOString(),
          currentPeriodEnd: periodEnd.toISOString(),
          autoRenew: true,
          paymentProvider,
          updatedAt: now.toISOString(),
        };
        return {
          ...lab,
          status: 'active',
          planId: targetPlan.id,
          subscription: newSub,
          updatedAt: now.toISOString(),
        };
      })
    );

    // Record billing invoice
    const targetLab = laboratories.find((l) => l.id === labId);
    const tx: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      labId,
      laboratoryName: targetLab?.name || 'Diagnostic Laboratory',
      planId: targetPlan.id,
      planName: `${targetPlan.name} (${billingCycle})`,
      billingCycle,
      amount,
      currency: targetLab?.currency || 'NGN',
      status: 'success',
      provider: paymentProvider,
      reference: `PSTK_${Date.now()}_${Math.floor(Math.random() * 90000 + 10000)}`,
      customerEmail: targetLab?.ownerEmail || targetLab?.email || 'billing@labpro.health',
      paidAt: now.toISOString(),
      createdAt: now.toISOString(),
      invoiceNumber: `SAAS-INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      paymentMethod: 'Paystack Gateway Settled',
    };
    setTransactions((prev) => [tx, ...prev]);

    addAuditLog('SUBSCRIPTION_UPGRADED', 'setting', labId, `Upgraded subscription to ${targetPlan.name} (${billingCycle}) via ${paymentProvider}.`);
  };

  const toggleLaboratorySuspension = (labId: string, reason?: string) => {
    setLaboratories((prev) =>
      prev.map((lab) => {
        if (lab.id !== labId) return lab;
        const newStatus = lab.status === 'suspended' ? 'active' : 'suspended';
        return {
          ...lab,
          status: newStatus,
          suspendedReason: newStatus === 'suspended' ? reason || 'Administrative compliance audit hold' : undefined,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addAuditLog('LAB_SUSPENSION_TOGGLED', 'setting', labId, `Laboratory suspension status toggled. Reason: ${reason || 'N/A'}`);
  };

  const updatePlanPricing = (planId: SubscriptionPlanId, monthlyPrice: number, annualPrice: number) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, monthlyPrice, annualPrice } : p))
    );
  };

  const updatePlanLimits = (planId: SubscriptionPlanId, limits: Partial<PlanLimits>) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, limits: { ...p.limits, ...limits } } : p))
    );
  };

  const toggleStaffStatus = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((staff) => (staff.id === staffId ? { ...staff, isActive: !staff.isActive } : staff))
    );
  };

  const addDepartment = (dep: Omit<Department, 'id' | 'labId'>) => {
    const newDep: Department = {
      ...dep,
      id: `dep-${Date.now()}`,
      labId: currentLab.id,
    };
    setDepartments((prev) => [...prev, newDep]);
    addDepartmentToFirestore(currentLab.id, newDep).catch((e) =>
      console.warn('Dept add firestore:', e)
    );
    addAuditLog('DEPARTMENT_ADDED', 'setting', newDep.id, `Added department: ${newDep.name}`);
  };

  const updateDepartment = (id: string, updated: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
    updateDepartmentInFirestore(currentLab.id, id, updated).catch((e) =>
      console.warn('Dept update firestore:', e)
    );
  };

  const addTestDefinition = (testData: Omit<TestDefinition, 'id' | 'labId' | 'createdAt'>) => {
    const newTest: TestDefinition = {
      ...testData,
      id: `test-${Date.now()}`,
      labId: currentLab.id,
      createdAt: new Date().toISOString(),
    };
    setTests((prev) => [...prev, newTest]);
    addTestToFirestore(currentLab.id, newTest).catch((e) =>
      console.warn('Test add firestore:', e)
    );
    addAuditLog('TEST_DEFINITION_ADDED', 'test_definition', newTest.id, `Added test catalogue item: ${newTest.name}`);
  };

  const updateTestDefinition = (id: string, updated: Partial<TestDefinition>) => {
    setTests((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    updateTestInFirestore(currentLab.id, id, updated).catch((e) =>
      console.warn('Test update firestore:', e)
    );
    addAuditLog('TEST_DEFINITION_UPDATED', 'test_definition', id, `Updated test definition.`);
  };

  const addPatient = (patientData: Omit<Patient, 'id' | 'labId' | 'createdAt' | 'patientIdNumber'>): Patient => {
    const nextSeq = String(patients.length + 1).padStart(4, '0');
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      labId: currentLab.id,
      patientIdNumber: `PAT-2026-${nextSeq}`,
      createdAt: new Date().toISOString(),
    };
    setPatients((prev) => [newPatient, ...prev]);

    // Persist to Cloud Firestore
    addPatientToFirestore(currentLab.id, newPatient).catch((e) =>
      console.warn('Patient add firestore:', e)
    );
    addAuditLog('PATIENT_REGISTERED', 'patient', newPatient.id, `Registered patient ${newPatient.fullName} (${newPatient.patientIdNumber})`);
    return newPatient;
  };

  const updatePatient = (id: string, updated: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p)));
    updatePatientInFirestore(currentLab.id, id, updated).catch((e) =>
      console.warn('Patient update firestore:', e)
    );
    addAuditLog('PATIENT_UPDATED', 'patient', id, `Updated clinical profile for patient.`);
  };

  const getPatientById = (id: string) => patients.find((p) => p.id === id);

  const createTestRequest = (data: {
    patientId: string;
    referringDoctor: string;
    clinicalIndication: string;
    priority: 'routine' | 'urgent' | 'stat';
    testIds: string[];
    discount?: number;
    initialPayment?: number;
    paymentMethod?: string;
  }): TestRequest => {
    if (currentLab.status === 'suspended') {
      alert(`Diagnostic Processing Locked: ${currentLab.name} workspace is currently suspended. Please renew or reactivate under Subscription & Licensing.`);
      throw new Error('Laboratory is suspended.');
    }

    const patient = patients.find((p) => p.id === data.patientId);
    if (!patient) throw new Error('Patient not found');

    const selectedTests = tests.filter((t) => data.testIds.includes(t.id));
    const grossTotal = selectedTests.reduce((sum, t) => sum + t.price, 0);
    const discount = data.discount || 0;
    const totalAmount = Math.max(0, grossTotal - discount);
    const initialPayment = data.initialPayment || 0;
    const paymentStatus =
      initialPayment >= totalAmount ? 'paid' : initialPayment > 0 ? 'partial' : 'unpaid';

    const birthYear = new Date(patient.dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    const patientAge = isNaN(birthYear) ? undefined : currentYear - birthYear;

    const reqSeq = String(requests.length + 1045);
    const newRequest: TestRequest = {
      id: `req-${Date.now()}`,
      labId: currentLab.id,
      requestNumber: `REQ-2026-${reqSeq}`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientAge,
      patientGender: patient.gender,
      referringDoctor: data.referringDoctor || 'Self-Referred / Walk-In',
      clinicalIndication: data.clinicalIndication || 'Diagnostic Investigation',
      priority: data.priority,
      status: 'registered',
      paymentStatus,
      totalAmount,
      amountPaid: initialPayment,
      discount,
      testIds: data.testIds,
      createdAt: new Date().toISOString(),
    };

    // Auto-generate Samples by specimen type requirements
    const specimenGroups = new Map<string, { specimenType: string; container: string; testNames: string[] }>();
    selectedTests.forEach((t) => {
      const key = `${t.specimenType}__${t.container}`;
      if (!specimenGroups.has(key)) {
        specimenGroups.set(key, {
          specimenType: t.specimenType,
          container: t.container,
          testNames: [t.name],
        });
      } else {
        specimenGroups.get(key)!.testNames.push(t.name);
      }
    });

    const newSamples: Sample[] = [];
    let sampleCounter = 1;
    specimenGroups.forEach((group) => {
      const barcodeSeq = String(Math.floor(1000 + Math.random() * 9000));
      newSamples.push({
        id: `smp-${Date.now()}-${sampleCounter++}`,
        labId: currentLab.id,
        sampleBarcode: `SMP-2026-${barcodeSeq}`,
        requestId: newRequest.id,
        requestNumber: newRequest.requestNumber,
        patientId: patient.id,
        patientName: patient.fullName,
        testNames: group.testNames,
        specimenType: group.specimenType,
        container: group.container,
        status: 'pending_collection',
        createdAt: new Date().toISOString(),
      });
    });

    // Auto-generate invoice
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      labId: currentLab.id,
      invoiceNumber: `INV-2026-${reqSeq}`,
      requestId: newRequest.id,
      requestNumber: newRequest.requestNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      items: selectedTests.map((t) => ({ testName: t.name, price: t.price })),
      totalAmount,
      discount,
      paidAmount: initialPayment,
      balance: Math.max(0, totalAmount - initialPayment),
      status: paymentStatus,
      paymentMethod: data.paymentMethod || (initialPayment > 0 ? 'Card / Bank Transfer' : undefined),
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newRequest, ...prev]);
    setSamples((prev) => [...newSamples, ...prev]);
    setInvoices((prev) => [newInvoice, ...prev]);

    // Persist to Cloud Firestore
    addRequestToFirestore(currentLab.id, newRequest, newSamples, newInvoice).catch((e) =>
      console.warn('Request add firestore:', e)
    );

    addAuditLog(
      'REQUEST_CREATED',
      'request',
      newRequest.id,
      `Created request ${newRequest.requestNumber} for ${patient.fullName}. Generated ${newSamples.length} specimen collection order(s).`
    );

    return newRequest;
  };

  const updateRequestStatus = (requestId: string, status: TestRequest['status']) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r))
    );
    updateRequestStatusInFirestore(currentLab.id, requestId, status).catch((e) =>
      console.warn('Request status firestore:', e)
    );
  };

  const collectSample = (sampleId: string, collectedBy: string) => {
    const operator = collectedBy || currentUserProfile?.displayName || currentStaff.fullName;
    setSamples((prev) =>
      prev.map((s) =>
        s.id === sampleId
          ? {
              ...s,
              status: 'collected',
              collectedAt: new Date().toISOString(),
              collectedBy: operator,
            }
          : s
      )
    );

    updateSampleInFirestore(currentLab.id, sampleId, {
      status: 'collected',
      collectedAt: new Date().toISOString(),
      collectedBy: operator,
    }).catch((e) => console.warn('Sample collect firestore:', e));

    const sample = samples.find((s) => s.id === sampleId);
    if (sample) {
      updateRequestStatus(sample.requestId, 'sample_collected');
      addAuditLog('SAMPLE_COLLECTED', 'sample', sampleId, `Sample ${sample.sampleBarcode} collected by ${operator}`);
    }
  };

  const receiveSample = (sampleId: string, receivedBy: string) => {
    const operator = receivedBy || currentUserProfile?.displayName || currentStaff.fullName;
    setSamples((prev) =>
      prev.map((s) =>
        s.id === sampleId
          ? {
              ...s,
              status: 'received',
              receivedAt: new Date().toISOString(),
              receivedBy: operator,
            }
          : s
      )
    );

    updateSampleInFirestore(currentLab.id, sampleId, {
      status: 'received',
      receivedAt: new Date().toISOString(),
      receivedBy: operator,
    }).catch((e) => console.warn('Sample receive firestore:', e));

    const sample = samples.find((s) => s.id === sampleId);
    if (sample) {
      updateRequestStatus(sample.requestId, 'processing');
      addAuditLog('SAMPLE_RECEIVED', 'sample', sampleId, `Sample ${sample.sampleBarcode} received in laboratory.`);
    }
  };

  const rejectSample = (sampleId: string, reason: string, notes?: string) => {
    setSamples((prev) =>
      prev.map((s) =>
        s.id === sampleId
          ? {
              ...s,
              status: 'rejected',
              rejectionReason: reason,
              rejectionNotes: notes,
            }
          : s
      )
    );

    updateSampleInFirestore(currentLab.id, sampleId, {
      status: 'rejected',
      rejectionReason: reason,
      rejectionNotes: notes,
    }).catch((e) => console.warn('Sample reject firestore:', e));

    const sample = samples.find((s) => s.id === sampleId);
    if (sample) {
      addAuditLog(
        'SAMPLE_REJECTED',
        'sample',
        sampleId,
        `Rejected sample ${sample.sampleBarcode} for ${sample.patientName}. Reason: ${reason} - ${notes || 'No notes'}`
      );
    }
  };

  // Result Calculation & Flagging
  const calculateFlags = (
    test: TestDefinition,
    values: Record<string, string | number>
  ): Record<string, ResultFlag> => {
    const flags: Record<string, ResultFlag> = {};
    test.parameters.forEach((param) => {
      const val = values[param.code];
      if (val === undefined || val === '') return;

      if (param.dataType === 'numeric') {
        const num = Number(val);
        if (!isNaN(num)) {
          if (param.criticalMax !== undefined && num >= param.criticalMax) {
            flags[param.code] = 'CRITICAL_HIGH';
          } else if (param.criticalMin !== undefined && num <= param.criticalMin) {
            flags[param.code] = 'CRITICAL_LOW';
          } else if (param.normalMax !== undefined && num > param.normalMax) {
            flags[param.code] = 'HIGH';
          } else if (param.normalMin !== undefined && num < param.normalMin) {
            flags[param.code] = 'LOW';
          } else {
            flags[param.code] = 'NORMAL';
          }
        }
      } else if (param.dataType === 'qualitative') {
        const strVal = String(val).toLowerCase();
        if (param.normalQualitative) {
          if (strVal.includes('pos') || strVal.includes('reactive') || strVal.includes('abnormal')) {
            flags[param.code] = 'ABNORMAL';
          } else {
            flags[param.code] = 'NORMAL';
          }
        }
      }
    });
    return flags;
  };

  const saveResult = (data: {
    requestId: string;
    testId: string;
    sampleId: string;
    parameterValues: Record<string, string | number>;
    technicianComments?: string;
    submitForVerification: boolean;
  }) => {
    const request = requests.find((r) => r.id === data.requestId);
    const test = tests.find((t) => t.id === data.testId);
    const sample = samples.find((s) => s.id === data.sampleId);
    if (!request || !test || !sample) throw new Error('Invalid result associations');

    const flags = calculateFlags(test, data.parameterValues);
    const status = data.submitForVerification ? 'submitted' : 'draft';

    const existingIndex = results.findIndex((r) => r.requestId === data.requestId && r.testId === data.testId);
    let targetResult: TestResult;

    const operatorName = currentUserProfile?.displayName || currentStaff.fullName;

    if (existingIndex >= 0) {
      targetResult = {
        ...results[existingIndex],
        parameterValues: data.parameterValues,
        flags,
        status,
        technicianComments: data.technicianComments,
        enteredBy: `${operatorName} (${currentRole})`,
        enteredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setResults((prev) => {
        const copy = [...prev];
        copy[existingIndex] = targetResult;
        return copy;
      });
    } else {
      targetResult = {
        id: `res-${Date.now()}`,
        labId: currentLab.id,
        requestId: request.id,
        requestNumber: request.requestNumber,
        testId: test.id,
        testName: test.name,
        department: test.department,
        sampleId: sample.id,
        sampleBarcode: sample.sampleBarcode,
        patientId: request.patientId,
        patientName: request.patientName,
        status,
        parameterValues: data.parameterValues,
        flags,
        technicianComments: data.technicianComments,
        enteredBy: `${operatorName} (${currentRole})`,
        enteredAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setResults((prev) => [targetResult, ...prev]);
    }

    // Persist to Cloud Firestore
    saveResultToFirestore(currentLab.id, targetResult).catch((e) =>
      console.warn('Result save firestore:', e)
    );

    if (data.submitForVerification) {
      updateRequestStatus(request.id, 'results_entered');
      addAuditLog(
        'RESULT_SUBMITTED',
        'result',
        targetResult.id,
        `Submitted results for ${test.name} (${request.requestNumber}) for Pathologist / Supervisor review.`
      );
    } else {
      addAuditLog('RESULT_SAVED_DRAFT', 'result', targetResult.id, `Saved draft results for ${test.name}`);
    }
  };

  const verifyResult = (resultId: string, decision: 'approve' | 'reject' | 'return', comments: string) => {
    const result = results.find((r) => r.id === resultId);
    if (!result) return;

    const newStatus: TestResult['status'] =
      decision === 'approve' ? 'verified' : decision === 'reject' ? 'rejected' : 'draft';

    const operatorName = currentUserProfile?.displayName || currentStaff.fullName;

    const updatedResult: TestResult = {
      ...result,
      status: newStatus,
      verificationComments: comments,
      verifiedBy: `${operatorName} (${currentRole})`,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setResults((prev) =>
      prev.map((r) => (r.id === resultId ? updatedResult : r))
    );

    // Persist verification decision to Firestore
    saveResultToFirestore(currentLab.id, updatedResult).catch((e) =>
      console.warn('Result verify firestore:', e)
    );

    if (decision === 'approve') {
      updateRequestStatus(result.requestId, 'verified');
      addAuditLog(
        'RESULT_VERIFIED',
        'result',
        resultId,
        `Approved diagnostic result for ${result.testName} (${result.requestNumber}). Ready for final release.`
      );
    } else if (decision === 'return') {
      updateRequestStatus(result.requestId, 'processing');
      addAuditLog(
        'RESULT_RETURNED_CORRECTION',
        'result',
        resultId,
        `Returned result for ${result.testName} back to testing laboratory for correction: ${comments}`
      );
    } else {
      addAuditLog('RESULT_REJECTED', 'result', resultId, `Rejected results: ${comments}`);
    }
  };

  const amendResult = (
    resultId: string,
    updatedValues: Record<string, string | number>,
    reason: string
  ) => {
    const result = results.find((r) => r.id === resultId);
    if (!result) return;
    const test = tests.find((t) => t.id === result.testId);
    const flags = test ? calculateFlags(test, updatedValues) : result.flags;

    const amended: TestResult = {
      ...result,
      parameterValues: updatedValues,
      flags,
      status: 'amended',
      amendmentReason: reason,
      updatedAt: new Date().toISOString(),
    };

    setResults((prev) =>
      prev.map((r) => (r.id === resultId ? amended : r))
    );

    saveResultToFirestore(currentLab.id, amended).catch((e) =>
      console.warn('Result amend firestore:', e)
    );

    addAuditLog(
      'RESULT_AMENDED',
      'result',
      resultId,
      `Amended verified result for ${result.testName} (${result.requestNumber}). Reason: ${reason}`
    );
  };

  const recordPayment = (invoiceId: string, amount: number, paymentMethod: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const newPaid = inv.paidAmount + amount;
    const newBalance = Math.max(0, inv.totalAmount - newPaid);
    const newStatus = newBalance === 0 ? 'paid' : 'partial';

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              paidAmount: newPaid,
              balance: newBalance,
              status: newStatus,
              paymentMethod,
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );

    // Persist to Cloud Firestore
    recordPaymentInFirestore(currentLab.id, invoiceId, newPaid, newBalance, newStatus, paymentMethod).catch((e) =>
      console.warn('Payment firestore:', e)
    );

    // Update corresponding request payment status
    setRequests((reqs) =>
      reqs.map((r) =>
        r.id === inv.requestId ? { ...r, paymentStatus: newStatus, amountPaid: newPaid } : r
      )
    );
    updateRequestStatusInFirestore(currentLab.id, inv.requestId, 'processing').catch(() => {});

    addAuditLog(
      'PAYMENT_RECORDED',
      'invoice',
      inv.id,
      `Received ${currentLab.currencySymbol}${amount.toLocaleString()} for ${inv.invoiceNumber} via ${paymentMethod}. Balance: ${currentLab.currencySymbol}${newBalance.toLocaleString()}`
    );
  };

  const openReportModal = (requestId: string) => {
    setSelectedReportRequestId(requestId);
    setIsPrintReportOpen(true);
  };

  const closeReportModal = () => {
    setSelectedReportRequestId(null);
    setIsPrintReportOpen(false);
  };

  return (
    <LISContext.Provider
      value={{
        currentLab,
        laboratories,
        setCurrentLabId,
        createLaboratory,
        updateLaboratorySettings,
        currentUserProfile,
        currentRole,
        setCurrentRole,
        currentStaff,
        staffList,
        addStaffMember,
        toggleStaffStatus,
        loginGoogle,
        loginStaff,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAuthLoading,
        departments,
        addDepartment,
        updateDepartment,
        tests,
        addTestDefinition,
        updateTestDefinition,
        patients,
        addPatient,
        updatePatient,
        getPatientById,
        requests,
        createTestRequest,
        updateRequestStatus,
        samples,
        collectSample,
        receiveSample,
        rejectSample,
        results,
        saveResult,
        verifyResult,
        amendResult,
        invoices,
        recordPayment,
        auditLogs,
        addAuditLog,
        isFirestoreOnline,
        isPrintReportOpen,
        selectedReportRequestId,
        openReportModal,
        closeReportModal,
        plans,
        transactions,
        platformAdmins,
        registerLaboratoryTenant,
        updateSubscription,
        toggleLaboratorySuspension,
        updatePlanPricing,
        updatePlanLimits,
      }}
    >
      {children}
    </LISContext.Provider>
  );
};

export const useLIS = () => {
  const context = useContext(LISContext);
  if (!context) {
    throw new Error('useLIS must be used within a LISProvider');
  }
  return context;
};
