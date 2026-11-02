# LabPro LIS Security Specification

## 1. Data Invariants
1. **Tenant Isolation**: A patient, sample, test request, or result must strictly belong to its parent `/laboratories/{labId}`. Cross-tenant access or write operations across different lab IDs is strictly forbidden.
2. **Immutable Clinical Records**: `createdAt` cannot be modified on update.
3. **Verified Result Locking**: A test result in status `verified` cannot be modified unless through a designated amendment workflow with justification.
4. **Sample Rejection Integrity**: A rejected sample cannot have test processing initiated without reinstatement by a supervisor.
5. **Auditability**: Critical clinical status changes must record user identity and server timestamp.
6. **Path Hardening**: All IDs (`labId`, `patientId`, `requestId`, `sampleId`, `resultId`) must match `^[a-zA-Z0-9_\-]+$` and be <= 128 characters.

## 2. The Dirty Dozen Payloads (Designed to Break Identity, Integrity, and State)
1. **Payload 1 (Cross-Tenant Poisoning)**: Attempting to insert a patient into `/laboratories/lab-1/patients/pat-1` with `labId: "lab-2"`.
2. **Payload 2 (Shadow Field Injection)**: Creating a patient with an unauthorized administrative shadow field `isSystemAdmin: true`.
3. **Payload 3 (Oversized Document ID Exhaustion)**: Creating a document with a 2048-byte random junk character string as ID.
4. **Payload 4 (Result Tampering Post-Verification)**: Updating a test result's numeric parameter after status is already `verified`.
5. **Payload 5 (Unauthenticated Write)**: Direct POST/write to `/laboratories/{labId}/requests/{requestId}` without authentication.
6. **Payload 6 (Client Timestamp Spoofing)**: Submitting `createdAt` as a pre-dated string instead of server timestamp.
7. **Payload 7 (Role Elevation)**: Submitting staff member update changing `role: "receptionist"` to `role: "super_admin"`.
8. **Payload 8 (Orphaned Sample Write)**: Creating a sample where `requestId` refers to a non-existent request ID.
9. **Payload 9 (Unbounded Array DoS)**: Creating a test request with 5,000 unbounded arbitrary test items.
10. **Payload 10 (Negative Price Attack)**: Creating a test definition with `price: -50000`.
11. **Payload 11 (Blanket Patient Read)**: Attempting to query patient records across `/laboratories/{labId}/patients` without tenant association.
12. **Payload 12 (Silent Overwrite Attack)**: Attempting to overwrite a verified pathologist report without incrementing version or audit log.

## 3. Test Runner
All payloads tested against rules ensure `PERMISSION_DENIED`.
