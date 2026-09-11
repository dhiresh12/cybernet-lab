# Testing — CyberNet Lab

## Overview

CyberNet Lab uses Jest for both frontend and backend tests. Tests live alongside the code they verify.

## Run All Tests

```bash
npm test
```

## Run Frontend Tests

```bash
npm test -- --testPathPattern="frontend/src"
```

### Frontend Test Suites

| File | What it tests |
|------|---------------|
| `frontend/src/engine/LabRuntimeState.test.js` | Canonical runtime state creation, seeding, events, interface changes, reset |
| `frontend/src/engine/SimulationRuntimeBridge.test.js` | NetworkSimulationEngine → LabRuntimeState event bridge |
| `frontend/src/features/lab-workspace/__tests__/ref001-runtime.test.js` | REF-001 end-to-end CLI command execution and state sync |

## Run Backend Tests

```bash
npm test -- --testPathPattern="backend/tests"
```

### Backend Test Suites

| File | What it tests |
|------|---------------|
| `backend/tests/labQualityService.test.js` | Quality gate: quarantine classification, registry loading |
| `backend/tests/labApiQualityGate.test.js` | API integration: quarantined labs return 404, valid labs return 200 |

## Run a Specific Test File

```bash
npm test -- frontend/src/engine/LabRuntimeState.test.js
npm test -- backend/tests/labQualityService.test.js
```

## Test Configuration

- Root Jest config: `jest.config.js`
- Transform: `babel-jest` for `.js` and `.jsx` files
- Test environment: `node`
- Total tests: 159 across 10 test suites

### Test Suites

| Suite | Location | Scope |
|-------|----------|-------|
| `LabRuntimeState.test.js` | `frontend/src/engine/` | Canonical runtime state creation, events, reset, serialization |
| `SimulationRuntimeBridge.test.js` | `frontend/src/engine/` | NetworkSimulationEngine → LabRuntimeState event bridge |
| `ref001-runtime.test.js` | `frontend/src/features/lab-workspace/__tests__/` | REF-001 end-to-end CLI command execution and state sync |
| `labEngineRuntime.test.js` | `frontend/src/features/lab-workspace/__tests__/` | LabEngine runtime integration tests |
| `pilot-labs-runtime-validation.test.js` | `frontend/src/features/lab-workspace/__tests__/` | Pilot lab runtime validation |
| `labQualityService.test.js` | `backend/tests/` | Quality gate unit tests |
| `labApiQualityGate.test.js` | `backend/tests/` | API quality gate integration tests |
| `LabDetailView.test.js` | `frontend/src/app/views/__tests__/` | Lab detail view component tests |
| `verificationService.test.js` | `backend/tests/` | Backend verification service (state_check, ping) |

## Known Test Issues

- Backend `labApiQualityGate.test.js` may fail if port 3000 is already in use. The test sets `process.env.PORT = '0'` to request a random port, but parallel test runs can still conflict.
- Backend `verificationService.test.js` has 6 pre-existing failures related to `state_check` and `ping` verification (Session 9.3 discovery). These are P1 deferred items.
