export type UserRole =
  | 'super_admin'
  | 'lab_admin'
  | 'receptionist'
  | 'lab_scientist'
  | 'lab_supervisor'
  | 'pathologist'
  | 'accountant';

import { LaboratorySubscription, SubscriptionPlanId, SubscriptionStatus } from './saas';

export interface Laboratory {
  id: string;
  name: string;
  code: string;
  licenseNumber: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  logoUrl?: string;
  accreditation?: string;
  headerNote?: string;
  footerNote?: string;
  operatingHours?: string;
  status?: 'active' | 'suspended' | 'trial' | 'expired';
  suspendedReason?: string;
  ownerEmail?: string;
  planId?: SubscriptionPlanId;
  subscription?: LaboratorySubscription;
  createdAt: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  labId: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export type ParameterDataType = 'numeric' | 'text' | 'qualitative' | 'range';

export interface ParameterDefinition {
  id: string;
  name: string;
  code: string;
  unit: string;
  dataType: ParameterDataType;
  normalMin?: number;
  normalMax?: number;
  normalQualitative?: string;
  criticalMin?: number;
  criticalMax?: number;
  options?: string[];
  referenceRangeText?: string;
}

export interface TestDefinition {
  id: string;
  labId: string;
  name: string;
  code: string;
  department: string;
  description: string;
  specimenType: string;
  container: string;
  method: string;
  price: number;
  turnaroundHours: number;
  parameters: ParameterDefinition[];
  isActive: boolean;
  createdAt: string;
}

export interface Patient {
  id: string;
  labId: string;
  patientIdNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact?: string;
  clinicalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type RequestPriority = 'routine' | 'urgent' | 'stat';
export type RequestStatus =
  | 'registered'
  | 'sample_collected'
  | 'processing'
  | 'results_entered'
  | 'verified'
  | 'completed';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface TestRequest {
  id: string;
  labId: string;
  requestNumber: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  referringDoctor: string;
  clinicalIndication: string;
  priority: RequestPriority;
  status: RequestStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  amountPaid: number;
  discount: number;
  testIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export type SampleStatus =
  | 'pending_collection'
  | 'collected'
  | 'received'
  | 'processing'
  | 'rejected';

export interface Sample {
  id: string;
  labId: string;
  sampleBarcode: string;
  requestId: string;
  requestNumber: string;
  patientId: string;
  patientName: string;
  testNames: string[];
  specimenType: string;
  container: string;
  status: SampleStatus;
  collectedAt?: string;
  collectedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
  rejectionReason?: string;
  rejectionNotes?: string;
  createdAt: string;
}

export type ResultStatus = 'draft' | 'submitted' | 'verified' | 'rejected' | 'amended';
export type ResultFlag = 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_HIGH' | 'CRITICAL_LOW' | 'ABNORMAL';

export interface TestResult {
  id: string;
  labId: string;
  requestId: string;
  requestNumber: string;
  testId: string;
  testName: string;
  department: string;
  sampleId: string;
  sampleBarcode: string;
  patientId: string;
  patientName: string;
  status: ResultStatus;
  parameterValues: Record<string, string | number>;
  flags: Record<string, ResultFlag>;
  technicianComments?: string;
  verificationComments?: string;
  enteredBy?: string;
  enteredAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  amendmentReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  labId: string;
  invoiceNumber: string;
  requestId: string;
  requestNumber: string;
  patientId: string;
  patientName: string;
  items: {
    testName: string;
    price: number;
  }[];
  totalAmount: number;
  discount: number;
  paidAmount: number;
  balance: number;
  status: PaymentStatus;
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffMember {
  id: string;
  labId: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  licenseNumber?: string;
  phone?: string;
  isActive: boolean;
  avatarUrl?: string;
  joinedAt: string;
}

export interface AuditLog {
  id: string;
  labId: string;
  action: string;
  entityType: 'patient' | 'request' | 'sample' | 'result' | 'report' | 'invoice' | 'test_definition' | 'setting' | 'staff';
  entityId: string;
  performedBy: string;
  userRole: UserRole;
  details: string;
  createdAt: string;
}
