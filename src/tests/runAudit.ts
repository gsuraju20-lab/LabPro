import { runComprehensiveSaaSAudit } from './saasAudit';

console.log('=== STARTING LABPRO SAAS AUDIT EXECUTION ===\n');
const results = runComprehensiveSaaSAudit();

let allPassed = true;
results.forEach((r, idx) => {
  console.log(`[${r.status}] ${r.name}`);
  console.log(`- Tested: ${r.tested}`);
  console.log(`- Actual Result: ${r.actualResult}`);
  if (r.securityWeaknessIdentified) {
    console.log(`- Security Weakness Identified: ${r.securityWeaknessIdentified}`);
  }
  if (r.correctionApplied) {
    console.log(`- Correction Applied: ${r.correctionApplied}`);
  }
  if (r.filesModified) {
    console.log(`- Files Corrected: ${r.filesModified.join(', ')}`);
  }
  console.log('');
  if (r.status !== 'PASS') allPassed = false;
});

console.log(`=== AUDIT SUMMARY: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'} ===`);
