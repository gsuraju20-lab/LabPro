import { UserRole } from './lis';

export type SubscriptionPlanId = 'starter' | 'professional' | 'enterprise';
export type SubscriptionBillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'pending_payment'
  | 'grace_period'
  | 'expired'
  | 'cancelled';

export interface PlanLimits {
  maxStaff: number; // e.g. 3 for starter, 10 for pro, -1 for unlimited
  maxDepartments: number;
  advancedAnalytics: boolean;
  multiBranch: boolean;
  customReports: boolean;
  automatedQc: boolean;
  maxPatientsPerMonth: number;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  monthlyPrice: number; // in NGN
  annualPrice: number; // in NGN (with discount)
  currency: string;
  currencySymbol: string;
  trialDays: number;
  features: string[];
  limits: PlanLimits;
  isPopular?: boolean;
  isActive: boolean;
}

export interface LaboratorySubscription {
  id: string;
  labId: string;
  planId: SubscriptionPlanId;
  planName: string;
  billingCycle: SubscriptionBillingCycle;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  currencySymbol: string;
  startDate: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  gracePeriodEndsAt?: string;
  autoRenew: boolean;
  paymentProvider: 'paystack' | 'flutterwave' | 'bank_transfer';
  lastPaymentId?: string;
  cancellationReason?: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  labId: string;
  laboratoryName: string;
  planId: SubscriptionPlanId;
  planName: string;
  billingCycle: SubscriptionBillingCycle;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  provider: 'paystack' | 'flutterwave';
  reference: string;
  customerEmail: string;
  paidAt?: string;
  createdAt: string;
  invoiceNumber: string;
  paymentMethod?: string;
}

export interface PlatformAdmin {
  id: string;
  email: string;
  fullName: string;
  role: 'platform_super_admin';
  permissions: string[];
  createdAt: string;
  lastLoginAt: string;
}

export interface StaffInvitation {
  id: string;
  labId: string;
  email: string;
  role: UserRole;
  department?: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string;
  invitedByName: string;
  createdAt: string;
  expiresAt: string;
}

export interface PlatformMetrics {
  totalLaboratories: number;
  activeSubscriptions: number;
  trialLaboratories: number;
  suspendedLaboratories: number;
  mrr: number; // Monthly recurring revenue in NGN
  totalRevenue: number;
  totalTestsProcessed: number;
}
