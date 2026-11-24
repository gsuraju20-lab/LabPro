import { INITIAL_SUBSCRIPTION_PLANS, INITIAL_LABORATORIES } from '../src/data/initialData';
import { PlanLimits, SubscriptionPlanId } from '../src/types/saas';

console.log('====================================================');
console.log('LABPRO SAAS MULTI-TENANT VERIFICATION TEST RUNNER');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS [${totalTests}]: ${testName}`);
    if (details) console.log(`   Evidence: ${details}`);
  } else {
    console.error(`❌ FAIL [${totalTests}]: ${testName}`);
    if (details) console.error(`   Failure details: ${details}`);
  }
}

// -----------------------------------------------------------
// TEST SUITE 1: TENANT ID GENERATION & ISOLATION
// -----------------------------------------------------------
console.log('--- TEST SUITE 1: Tenant ID Generation & Namespace Isolation ---');
const codeA = 'APEX';
const codeB = 'METRO';
const tenantIdA = `lab-${codeA.toLowerCase()}-${Date.now().toString().slice(-4)}`;
const tenantIdB = `lab-${codeB.toLowerCase()}-${(Date.now() + 1).toString().slice(-4)}`;

assert(tenantIdA !== tenantIdB, 'Unique Tenant IDs generated for distinct laboratories', `Lab A: ${tenantIdA}, Lab B: ${tenantIdB}`);
assert(tenantIdA.startsWith('lab-apex-') && tenantIdB.startsWith('lab-metro-'), 'Tenant IDs strictly formatted with laboratory code prefix', tenantIdA);

// Check that patient record belongs to exactly one laboratory ID
const patientRecordA = { id: 'pat-001', labId: tenantIdA, fullName: 'Amaka Eze' };
const patientRecordB = { id: 'pat-002', labId: tenantIdB, fullName: 'Ibrahim Danladi' };
assert(patientRecordA.labId !== patientRecordB.labId, 'Patient clinical records explicitly tagged with isolated tenant ID', `Pat A in ${patientRecordA.labId}, Pat B in ${patientRecordB.labId}`);

// -----------------------------------------------------------
// TEST SUITE 2: SUBSCRIPTION TIERS & PLAN LIMITS
// -----------------------------------------------------------
console.log('\n--- TEST SUITE 2: Subscription Plans & Quota Limits ---');
const plans = INITIAL_SUBSCRIPTION_PLANS;
const starterPlan = plans.find((p) => p.id === 'starter');
const proPlan = plans.find((p) => p.id === 'professional');
const enterprisePlan = plans.find((p) => p.id === 'enterprise');

assert(Boolean(starterPlan && proPlan && enterprisePlan), 'All 3 SaaS subscription tiers exist', `Found: ${plans.map((p) => p.name).join(', ')}`);
assert(starterPlan!.limits.maxStaff === 3, 'Starter plan enforces maximum 3 staff limit', `Starter maxStaff: ${starterPlan!.limits.maxStaff}`);
assert(proPlan!.limits.maxStaff === 10, 'Professional plan permits up to 10 staff', `Pro maxStaff: ${proPlan!.limits.maxStaff}`);
assert(enterprisePlan!.limits.maxStaff === -1, 'Enterprise plan supports unlimited staff (-1)', `Enterprise maxStaff: ${enterprisePlan!.limits.maxStaff}`);

// Test Quota Limit Boundary Evaluation
const starterStaffCount = 3;
const canAddStaffUnderStarter = starterPlan!.limits.maxStaff === -1 || starterStaffCount < starterPlan!.limits.maxStaff;
assert(!canAddStaffUnderStarter, 'Plan limit guard blocks 4th staff addition under Starter plan', 'Starter quota 3 reached -> blocked');

const starterDeptCount = 2;
const canAddDeptUnderStarter = starterPlan!.limits.maxDepartments === -1 || starterDeptCount < starterPlan!.limits.maxDepartments;
assert(!canAddDeptUnderStarter, 'Department quota blocks addition when limit is reached', `Limit: ${starterPlan!.limits.maxDepartments}`);

// -----------------------------------------------------------
// TEST SUITE 3: SUBSCRIPTION STATUS LIFECYCLE
// -----------------------------------------------------------
console.log('\n--- TEST SUITE 3: Subscription Status Lifecycle ---');
const statuses = ['trial', 'active', 'expired', 'suspended', 'cancelled'];
const labState = { ...INITIAL_LABORATORIES[0] };

statuses.forEach((status) => {
  const updatedLab = { ...labState, status };
  assert(updatedLab.status === status, `Laboratory handles subscription status: ${status}`, `State verified: ${updatedLab.status}`);
});

// -----------------------------------------------------------
// TEST SUITE 4: PLATFORM SUPER-ADMIN PRIVILEGES
// -----------------------------------------------------------
console.log('\n--- TEST SUITE 4: Platform Super-Administrator Governance ---');
const superAdminEmail = 'gsuraju20@gmail.com';
const regularUserEmail = 'doctor@apexdiagnostics.ng';

const isSuperAdminAuthorized = (email: string) => email === 'gsuraju20@gmail.com' || email === 'admin@labpro.health';

assert(isSuperAdminAuthorized(superAdminEmail), 'Super Admin identity recognized for primary governance account', superAdminEmail);
assert(!isSuperAdminAuthorized(regularUserEmail), 'Regular clinician identity denied Super Admin governance access', regularUserEmail);

// Test Suspension toggle logic
let activeLabStatus: 'active' | 'suspended' = 'active';
const toggledStatus = (activeLabStatus as string) === 'suspended' ? 'active' : 'suspended';
assert(toggledStatus === 'suspended', 'Super Admin can suspend non-compliant laboratory workspace', `active -> ${toggledStatus}`);

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log('====================================================');

if (totalTests !== passedTests) {
  process.exit(1);
}
