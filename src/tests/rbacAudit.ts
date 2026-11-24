import fs from 'node:fs';
import path from 'node:path';
import { canAccessTab, canPerformAction, getPermittedTabs } from '../utils/rbac';
import { parseAppRoute, sanitizeInternalRedirect, buildLoginUrl } from '../utils/routes';
import { isTrustedPlatformAdminEmail, sanitizeUserProfileForClient } from '../utils/authPolicy';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`RBAC Audit Failed: ${message}`);
  }
}

export function runRBACSecurityVerification(): void {
  // 1. Unauthenticated user has no tabs or actions
  assert(getPermittedTabs(null, false).length === 0, 'Unauthenticated user should have 0 tabs');
  assert(!canAccessTab('dashboard', null, false), 'Unauthenticated user cannot access dashboard');
  assert(!canPerformAction('view_dashboard', null, false), 'Unauthenticated user cannot perform view_dashboard');

  // 2. Receptionist isolation (cannot verify results, manage staff/settings/subscription, or access platform admin)
  assert(canAccessTab('patients', 'receptionist', false), 'Receptionist can access patients');
  assert(canAccessTab('billing', 'receptionist', false), 'Receptionist can access billing');
  assert(!canAccessTab('results', 'receptionist', false), 'Receptionist cannot access results');
  assert(!canAccessTab('verification', 'receptionist', false), 'Receptionist cannot access verification');
  assert(!canAccessTab('staff', 'receptionist', false), 'Receptionist cannot access staff');
  assert(!canAccessTab('settings', 'receptionist', false), 'Receptionist cannot access settings');
  assert(!canAccessTab('subscription', 'receptionist', false), 'Receptionist cannot access subscription');
  assert(!canPerformAction('enter_results', 'receptionist', false), 'Receptionist cannot enter_results');
  assert(!canPerformAction('verify_results', 'receptionist', false), 'Receptionist cannot verify_results');
  assert(!canPerformAction('manage_staff', 'receptionist', false), 'Receptionist cannot manage_staff');
  assert(!canPerformAction('platform_admin', 'receptionist', false), 'Receptionist cannot access platform_admin');

  // 3. Medical Lab Scientist isolation (can enter results, cannot verify or administer lab)
  assert(canPerformAction('enter_results', 'lab_scientist', false), 'Lab scientist can enter_results');
  assert(!canPerformAction('verify_results', 'lab_scientist', false), 'Lab scientist cannot verify_results');
  assert(!canPerformAction('manage_catalogue', 'lab_scientist', false), 'Lab scientist cannot manage_catalogue');
  assert(!canPerformAction('manage_staff', 'lab_scientist', false), 'Lab scientist cannot manage_staff');
  assert(!canPerformAction('manage_billing', 'lab_scientist', false), 'Lab scientist cannot manage_billing');
  assert(!canPerformAction('platform_admin', 'lab_scientist', false), 'Lab scientist cannot access platform_admin');

  // 4. Pathologist & Lab Supervisor permissions
  assert(canPerformAction('verify_results', 'pathologist', false), 'Pathologist can verify_results');
  assert(canPerformAction('verify_results', 'lab_supervisor', false), 'Lab supervisor can verify_results');
  assert(!canPerformAction('manage_billing', 'pathologist', false), 'Pathologist cannot manage_billing');
  assert(!canPerformAction('manage_staff', 'pathologist', false), 'Pathologist cannot manage_staff');
  assert(!canPerformAction('platform_admin', 'pathologist', false), 'Pathologist cannot access platform_admin');

  // 5. Accountant permissions (billing/reports only, no clinical mutations)
  assert(canPerformAction('manage_billing', 'accountant', false), 'Accountant can manage_billing');
  assert(canPerformAction('view_reports', 'accountant', false), 'Accountant can view_reports');
  assert(!canPerformAction('manage_patients', 'accountant', false), 'Accountant cannot manage_patients');
  assert(!canPerformAction('create_request', 'accountant', false), 'Accountant cannot create_request');
  assert(!canPerformAction('enter_results', 'accountant', false), 'Accountant cannot enter_results');
  assert(!canPerformAction('verify_results', 'accountant', false), 'Accountant cannot verify_results');
  assert(!canPerformAction('platform_admin', 'accountant', false), 'Accountant cannot access platform_admin');

  // 6. Laboratory Administrator isolation (full tenant admin, strictly NO Platform Super Admin)
  assert(canPerformAction('manage_staff', 'lab_admin', false), 'Lab admin can manage_staff');
  assert(canPerformAction('manage_settings', 'lab_admin', false), 'Lab admin can manage_settings');
  assert(canPerformAction('manage_subscription', 'lab_admin', false), 'Lab admin can manage_subscription');
  assert(!canPerformAction('platform_admin', 'lab_admin', false), 'Lab admin MUST NOT access platform_admin');
  assert(!canPerformAction('platform_admin', 'super_admin', false), 'Unverified super_admin role label without isPlatformSuperAdmin MUST NOT access platform_admin');

  // 7. Verified Platform Super Admin (ONLY surajugabriel499@gmail.com)
  assert(canPerformAction('platform_admin', 'super_admin', true), 'Verified platform super admin can access platform_admin');
  assert(isTrustedPlatformAdminEmail('surajugabriel499@gmail.com', true), 'Verified surajugabriel499@gmail.com must be trusted');
  assert(isTrustedPlatformAdminEmail('SurajuGabriel499@gmail.com', true), 'Case-insensitive verified surajugabriel499@gmail.com must be trusted');
  assert(!isTrustedPlatformAdminEmail('surajugabriel499@gmail.com', false), 'Unverified surajugabriel499@gmail.com must NOT be trusted');
  assert(!isTrustedPlatformAdminEmail('gsuraju20@gmail.com', true), 'Removed gsuraju20@gmail.com must NOT be platform admin');
  assert(!isTrustedPlatformAdminEmail('admin@labpro.health', true), 'Removed admin@labpro.health must NOT be platform admin');

  const spoofedAdmin = sanitizeUserProfileForClient(
    {
      uid: 'u1',
      email: 'intruder@clinic.org',
      displayName: 'Intruder',
      role: 'super_admin',
      labId: 'lab-apex',
      laboratoryName: 'Apex Clinical Diagnostics',
      lastLoginAt: new Date().toISOString(),
      isPlatformSuperAdmin: true,
    },
    true
  );
  assert(spoofedAdmin.role !== 'super_admin' && spoofedAdmin.isPlatformSuperAdmin === false, 'Non-allowlisted user must have super_admin stripped');

  // 8. Route protection & redirect preservation checks
  assert(!parseAppRoute('/', '').isProtected, 'Landing page / must be public');
  assert(!parseAppRoute('/login', '').isProtected, 'Login page /login must be public');
  assert(!parseAppRoute('/register', '').isProtected, 'Registration page /register must be public');
  assert(parseAppRoute('/dashboard', '').isProtected, '/dashboard must be protected');
  assert(parseAppRoute('/patients', '').isProtected, '/patients must be protected');
  assert(parseAppRoute('/verification', '').isProtected, '/verification must be protected');
  assert(parseAppRoute('/billing', '').isProtected, '/billing must be protected');
  assert(parseAppRoute('/staff', '').isProtected, '/staff must be protected');
  assert(parseAppRoute('/platform-admin', '').isProtected, '/platform-admin must be protected');

  const crossTenantPath = parseAppRoute('/lab/lab-metro/patients', '');
  assert(crossTenantPath.isProtected && crossTenantPath.requestedLabId === 'lab-metro' && crossTenantPath.tab === 'patients', 'Cross-tenant path /lab/:labId/:tab must extract requestedLabId');
  const crossTenantQuery = parseAppRoute('/patients', '?labId=lab-metro');
  assert(crossTenantQuery.isProtected && crossTenantQuery.requestedLabId === 'lab-metro', 'Cross-tenant query ?labId= must extract requestedLabId');

  assert(sanitizeInternalRedirect('/patients') === '/patients', 'Internal redirect /patients allowed');
  assert(sanitizeInternalRedirect('/platform-admin') === '/platform-admin', 'Internal redirect /platform-admin allowed');
  assert(sanitizeInternalRedirect('https://evil.com') === undefined, 'External HTTPS redirect must be rejected');
  assert(sanitizeInternalRedirect('//evil.com/patients') === undefined, 'Protocol-relative // redirect must be rejected');
  assert(sanitizeInternalRedirect('/\\evil.com') === undefined, 'Backslash redirect must be rejected');
  assert(buildLoginUrl({ redirectTo: '/patients', reason: 'auth_required' }) === '/login?reason=auth_required&redirect=%2Fpatients', 'buildLoginUrl must encode reason and redirect cleanly');

  // 9. Firestore Security Rules static enforcement checks
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');
  assert(rules.includes("request.auth.token.email.lower() == 'surajugabriel499@gmail.com'"), 'firestore.rules must restrict Platform Admin solely to surajugabriel499@gmail.com');
  assert(!rules.includes('gsuraju20@gmail.com') && !rules.includes('admin@labpro.health'), 'firestore.rules must NOT contain legacy Platform Admin emails');
  assert(rules.includes('request.auth.token.email_verified == true'), 'firestore.rules must enforce email_verified for trusted admin/invitation checks');
  assert(rules.includes('isActiveUser()'), 'firestore.rules must enforce active staff status check');
  assert(rules.includes('hasValidLabOwnership('), 'firestore.rules must validate lab ownership for lab_admin assignment');
  assert(rules.includes('hasValidInvitation('), 'firestore.rules must validate admin-issued invitations for staff onboarding');
  assert(rules.includes("request.resource.data.role != 'super_admin'"), 'firestore.rules must prevent users from self-assigning super_admin');
  assert(rules.includes("request.resource.data.status in ['draft', 'submitted']"), 'firestore.rules must restrict lab_scientist result writes to draft/submitted');
  assert(rules.includes("affectedKeys().hasOnly(['paymentStatus', 'amountPaid', 'updatedAt'])"), 'firestore.rules must restrict accountant request updates to payment fields only');
  assert(rules.includes('allow update, delete: if false;'), 'firestore.rules must keep auditLogs immutable');

  // 10. Environment separation & guard checks
  const envFile = fs.readFileSync(path.resolve(process.cwd(), 'src/config/env.ts'), 'utf8');
  assert(envFile.includes('import.meta.env.DEV === true') && envFile.includes('import.meta.env.PROD === false'), 'IS_DEV_MODE must gate on Vite compile-time DEV/PROD flags');
  assert(envFile.includes('ENABLE_DEV_BYPASS_TOOLS'), 'env.ts must export ENABLE_DEV_BYPASS_TOOLS gated by explicit opt-in');

  const headerFile = fs.readFileSync(path.resolve(process.cwd(), 'src/components/Header.tsx'), 'utf8');
  assert(headerFile.includes('ENABLE_DEV_BYPASS_TOOLS && canSimulateRole'), 'Header role simulator must be strictly gated behind ENABLE_DEV_BYPASS_TOOLS && canSimulateRole');

  const authModalFile = fs.readFileSync(path.resolve(process.cwd(), 'src/components/AuthModal.tsx'), 'utf8');
  assert(authModalFile.includes('{ENABLE_DEV_BYPASS_TOOLS && ('), 'AuthModal dev quick-login must be strictly gated behind ENABLE_DEV_BYPASS_TOOLS');

  const authServiceFile = fs.readFileSync(path.resolve(process.cwd(), 'src/firebase/authService.ts'), 'utf8');
  assert(authServiceFile.includes('if (!ENABLE_DEV_BYPASS_TOOLS)'), 'authService.loginAsStaffMember must throw unless ENABLE_DEV_BYPASS_TOOLS is enabled');

  const landingFile = fs.readFileSync(path.resolve(process.cwd(), 'src/views/LandingPageView.tsx'), 'utf8');
  assert(!landingFile.includes('Demo Workspace') && !landingFile.includes('Clinical Workspace Demo'), 'LandingPageView must not expose unauthenticated Demo Workspace access');

  console.log('ALL RBAC, AUTHENTICATION-FIRST ROUTING & SECURITY CHECKS PASSED (10/10)');
}

runRBACSecurityVerification();
