# CyberNet Lab — Release Readiness Baseline

**Project:** CyberNet Lab v4.0.0
**Path:** `C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab`
**Date:** 2026-09-06
**Status:** BASELINE ESTABLISHED

---

## 1. Release Readiness Matrix

| Component | Status | Evidence | Notes |
|-----------|--------|----------|-------|
| Frontend build | **FAIL** | `npm run build` — syntax error in `BackgroundStudio.jsx` lines 143, 151 | Pre-existing bug introduced after Phase 9.2 |
| Backend startup | **PASS** | `npm run backend` — Express starts on port 3000 | Port configurable via `PORT` env |
| REST API | **PASS** | `GET /api/labs` — 231 labs returned | 18 labs quarantined, excluded from listing |
| WebSocket | **PASS** | Backend WebSocket server on same port as HTTP | Message routing validated |
| REF-001 | **PASS** | Lab loads, devices create, commands execute | Authoritative path: NetworkSimulationEngine |
| REF-002 | **PASS** | Lab data intact, canonical format | VLAN lab with 9 progressive steps |
| Test suite | **PASS WITH LIMITATIONS** | 159/165 tests pass across 10 suites | 6 pre-existing failures in `verificationService.test.js` |
| Runtime reset | **PASS** | LabWorkspace handleRestart verified | Devices restored to initial state |
| Practical lab execution | **PASS WITH LIMITATIONS** | REF-001 executes fully | Router limited to single interface |
| Verification | **PASS WITH LIMITATIONS** | CLI/state verification works | Backend `state_check`/`ping` not fully supported |
| State ownership | **PASS WITH LIMITATIONS** | NetworkSimulationEngine is authoritative | Three device-state stores exist |
| Documentation | **PASS** | MENU.md, README.md, TESTING.md, QUICKSTART.md | Audited and corrected in Phase 9.3 |
| Known test failures | **NON-BLOCKING** | 6 failures in verificationService.test.js | Backend state_check/ping incomplete |
| Architecture limitations | **DEFERRED** | LabEngine not in practical workflow | P1 item, documented |
| Performance warnings | **NON-BLOCKING** | Three.js chunks >500kB | Pre-existing, does not block release |
| Deploy packaging | **BLOCKED** | `npm run package` fails on Windows | Permission error, pre-existing |

---

## 2. Verified Developer Commands

All commands verified against actual project:

```bash
npm install                    # PASS - Dependencies install correctly
npm test                       # PASS WITH LIMITATIONS - 159/165 tests pass
npm test -- --no-coverage      # PASS WITH LIMITATIONS - 159/165 tests pass
npm run build                  # FAIL - Syntax error in BackgroundStudio.jsx
npm run dev                    # PASS - Backend + frontend concurrently
npm run backend                # PASS - Express on port 3000
npm run frontend               # PASS - Vite on port 5173
npm run package                # FAIL - Permission error on deploy copy (pre-existing)
npm run start                  # PASS - Production backend
```

**Platform-specific notes:**
- `start.bat` — Windows only. Installs deps, builds, starts backend, waits for availability, starts frontend.
- `set PORT=3001 && npm run backend` — Windows CMD syntax for port override.

---

## 3. Current Architecture (Actual)

### Frontend Entry
- `frontend/src/main.jsx` → `frontend/src/App.jsx`
- `App.jsx` creates view routing: `'lab'` (LabExplorerView/LabDetailView/LabWorkspace), `'dashboard'`, `'engineer'`, `'progress'`, etc.

### Active Practical Learner Workflow (REF-001)
```
LabWorkspace
  → useLabSimulation
    → NetworkSimulationEngine (authoritative device state)
      → processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0')
      → device:stateChanged event
        → syncDeviceStates → canonicalDeviceStates
          → useLabTerminal / useLabTopology / useLabVerification
```

### LabEngine Path (NOT in active practical workflow)
```
LabEngine
  → ConnectionManager (WebSocket client)
  → SimulationRuntimeBridge (validated by unit tests)
  → LabRuntimeState (canonical state schema)
  → LabStateEngine (pure state helpers)
```
**Status:** Validated by unit tests. NOT wired into `features/lab-workspace/` practical learner path.

### State Ownership
| State | Owner | Used By |
|-------|-------|---------|
| Practical learner device state | `NetworkSimulationEngine.devices` | LabWorkspace, terminal, topology, verification |
| LabWorkspace local state | `canonicalDeviceStates` | useLabTerminal, useLabTopology, useLabVerification |
| Canonical runtime state | `LabRuntimeState` via `LabStateEngine` | SimulationRuntimeBridge, LabEngine (unit tests only) |
| Backend session state | `backend/state/state.js` (`labCache`) | REST API, WebSocket handlers |
| Global UI state | Zustand `labStore.js` | Defined but not actively imported |

### Verification Architecture
| Layer | Location | Status |
|-------|----------|--------|
| Frontend CLI verification | `features/lab-workspace/useLabVerification.js` | Active, reads canonicalDeviceStates |
| Frontend ping verification | `features/simulator/verificationEngine.js` | Placeholder — returns success without actual connectivity check |
| Backend verification | `simulation/verifiers.js` | Supports: cli, config, topology, typing, option |
| Backend state_check/ping | `backend/services/verificationService.js` | Implemented but has 6 failing tests (P1 deferred) |

### WebSocket Messages (Actual)
| Client → Server | Server → Client | Status |
|-----------------|-----------------|--------|
| `lab:start` | `lab:started` | Implemented |
| `lab:step:verify` | `step:passed` / `step:failed` | Implemented |
| `lab:hint` | `hint` | Implemented |
| `device:config` | `device:updated` | Implemented |
| `device:state` | `device:state:synced` | Implemented |
| `topology:connect` | `topology:update` | Implemented |
| `topology:disconnect` | `topology:update` | Implemented |
| `error:inject` | `error:injected` | Implemented |
| `telemetry:subscribe` | `telemetry:subscribed` | Implemented |

---

## 4. Known Limitations (Honest Classification)

### P1 — Blocking for Full Production Readiness
| Issue | Impact | Status |
|-------|--------|--------|
| LabEngine not integrated into practical learner workflow | Advanced features (hints, progress tracking via WebSocket) not available for practical labs | DEFERRED |
| Backend verification `state_check`/`ping` incomplete | `verificationService.test.js` has 6 failing tests; backend cannot fully verify device state or connectivity | DEFERRED |
| Frontend build syntax error | `BackgroundStudio.jsx` lines 143, 151 have syntax errors preventing build | BLOCKING |
| Deploy packaging fails on Windows | `npm run package` permission error | NON-BLOCKING |

### P2 — Architectural Debt
| Issue | Impact | Status |
|-------|--------|--------|
| Three device-state stores | `NetworkSimulationEngine.devices`, `canonicalDeviceStates`, `LabEngine.state.runtime` | DEFERRED |
| Frontend `verifyPing` placeholder | Ping verification always returns success | DEFERRED |
| WorkflowEngine not integrated into LabWorkspace | Step progression logic not actively used | DEFERRED |

### P3 — Non-Blocking
| Issue | Impact | Status |
|-------|--------|--------|
| CLI command handlers registered but unused | `features/cli/` handler modules exist but LabWorkspace uses NetworkSimulationEngine directly | NON-BLOCKING |
| Large Three.js async chunks (>500kB) | Build warning, does not affect functionality | NON-BLOCKING |
| Vite CJS Node API deprecation warning | Build warning, does not affect functionality | NON-BLOCKING |
| Quarantined lab content (18 labs) | Labs excluded from API listing | NON-BLOCKING |

---

## 5. Practical REF-001 Workflow (Verified)

### Lab Discovery
```bash
curl http://localhost:3000/api/labs
# Returns 231 non-quarantined labs including REF-001
```

### Lab Start
```bash
curl -X POST http://localhost:3000/api/labs/REF-001/start \
  -H "Content-Type: application/json" \
  -d '{"labId":"REF-001","sessionId":"test-001"}'
# Returns: { sessionId: "...", labState: {...} }
```

### Device Creation (Frontend)
```javascript
const engine = new NetworkSimulationEngine();
engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
engine.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });
engine.createDevice('SW1', { name: 'SW1', type: 'switch', hostname: 'SW1' });
```

### Command Execution
```javascript
// PC1 IP configuration
engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
// Output: "IP address configured: 192.168.1.10 255.255.255.0"

// PC2 IP configuration
engine.processCommand('PC2', 'ipconfig 192.168.1.20 255.255.255.0');
// Output: "IP address configured: 192.168.1.20 255.255.255.0"

// Ping test
engine.processCommand('PC1', 'ping 192.168.1.20');
// Output: simulated ping results
```

### Runtime State Change
- `device:stateChanged` event emitted
- `syncDeviceStates` updates `canonicalDeviceStates`
- Terminal, topology, verification read from updated state

### Verification
- Frontend verification reads from `canonicalDeviceStates`
- Step completion tracked in LabWorkspace local state
- Backend verification available via WebSocket for supported types

### Reset
```javascript
engine.reset(); // Clears devices, activeDeviceId, connections
// Devices can be recreated with initial state
```

### Re-execution
- After reset, devices can be recreated
- Commands execute against fresh state
- No state leakage between runs

---

## 6. REF-002 Regression Status

| Check | Status | Evidence |
|-------|--------|----------|
| Lab data exists | **PASS** | `frontend/src/data/reference-labs/lab-vlans-sales-accounts.json` |
| Canonical format | **PASS** | version: 1, slug, category, difficulty present |
| Topology complete | **PASS** | SW1, PC-SALES, PC-ACCOUNTS, PC-MGMT with connections |
| IP addressing correct | **PASS** | VLAN 10: 192.168.10.x, VLAN 20: 192.168.20.x |
| Progressive steps | **PASS** | 9 steps with verification |
| Troubleshooting | **PASS** | Common errors documented |
| Knowledge check | **PASS** | 4 multiple-choice questions |
| Accessible via registry | **PASS** | Loaded through labRegistry.js |

---

## 7. Test Baseline (Current)

| Suite | Status | Tests |
|-------|--------|-------|
| `LabRuntimeState.test.js` | PASS | varies |
| `SimulationRuntimeBridge.test.js` | PASS | varies |
| `ref001-runtime.test.js` | PASS | varies |
| `labEngineRuntime.test.js` | PASS | varies |
| `pilot-labs-runtime-validation.test.js` | PASS | varies |
| `verificationEngine.test.js` | PASS | varies |
| `labQualityService.test.js` | PASS | varies |
| `labApiQualityGate.test.js` | PASS | varies |
| `LabDetailView.test.js` | PASS | varies |
| `verificationService.test.js` | FAIL | 6 failures (state_check/ping incomplete) |
| **Total** | **159 PASS / 6 FAIL** | **165** |

---

## 8. Build Baseline (Current)

```
npm run build
FAIL - Syntax error in BackgroundStudio.jsx lines 143, 151
```

**Pre-existing build warnings (when build succeeds):**
- Chunk sizes >500kB (Three.js bundle)
- Vite CJS Node API deprecation
- Node-cache externalized for browser compatibility

---

## 9. Backend Verification

| Check | Status | Details |
|-------|--------|---------|
| Server starts | **PASS** | `npm run backend` → Express on port 3000 |
| GET /api/labs | **PASS** | Returns 231 non-quarantined labs |
| GET /api/labs/REF-001 | **PASS** | Returns complete lab data |
| POST /api/labs/REF-001/start | **PASS** | Creates session, returns sessionId |
| GET /api/labs/REF-001/active-session/:id | **PASS** | Returns lab state |
| WebSocket | **PASS** | Handles lab:start, lab:step:verify, device:config, etc. |
| Static file serving | **PASS** | Serves `frontend/dist/` in production |

---

## 10. Frontend Verification

| Check | Status | Details |
|-------|--------|---------|
| Dev server | **PASS** | `npm run frontend` → Vite on port 5173 |
| HTML response | **PASS** | Returns index.html with module script |
| API proxy | **PASS** | `/api` proxied to `http://localhost:3000` |
| Lab explorer | **PASS** | Loads lab list from registry |
| Lab detail view | **PASS** | Displays lab title, objectives, scenario |
| Focus mode | **PASS** | Displays lab title and scenario |

---

## 11. Documentation Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| `README.md` | **CURRENT** | Phase 9.3 |
| `MENU.md` | **CURRENT** | Phase 9.3 |
| `docs/QUICKSTART.md` | **CURRENT** | Phase 9.2 |
| `docs/TESTING.md` | **CURRENT** | Phase 9.3 |
| `PROJECT_CHECKPOINT.md` | **CURRENT** | Phase 9.2 |
| `PROJECT_CONTEXT.md` | **CURRENT** | Phase 9.2 |
| `docs/RELEASE_READINESS.md` | **CURRENT** | Phase 9.3 (this document) |

---

## 12. What Is NOT Ready

The following items are documented but NOT resolved. Do not claim release readiness includes these:

1. **LabEngine practical workflow integration** — LabEngine and SimulationRuntimeBridge are unit-tested but NOT wired into the active `features/lab-workspace/` practical learner path.
2. **Backend state_check/ping verification** — Backend supports cli/config/topology/typing/option but NOT state_check or ping. `verificationService.test.js` has 6 failing tests.
3. **Frontend verifyPing placeholder** — Returns success without actual connectivity validation.
4. **WorkflowEngine integration** — Exists but not integrated into LabWorkspace.
5. **Multiple device-state stores** — NetworkSimulationEngine, canonicalDeviceStates, and LabEngine.state.runtime all exist.
6. **Frontend build syntax error** — `BackgroundStudio.jsx` lines 143, 151 have syntax errors preventing `npm run build`.
7. **Deploy packaging** — `npm run package` fails with permission error on Windows.

---

## 13. Honest Release Statement

**CyberNet Lab is suitable for:**
- Development and testing
- Lab content authoring and review
- Demonstrating REF-001 and similar practical labs
- Backend API integration testing

**CyberNet Lab is NOT suitable for:**
- Production deployment without resolving P1 items
- Advanced lab features requiring LabEngine integration
- Labs requiring backend state_check or ping verification
- Automated deployment via `npm run package` on Windows
- Production build (syntax error in BackgroundStudio.jsx blocks build)

---

*This document is the authoritative release readiness baseline for CyberNet Lab v4.0.0.*
