# Phase 7.9 Plan — Practical Lab Quality & Runtime Truth Audit

## DATE:
2026-09-06

## PHASE:
7.9 — PRACTICAL LAB QUALITY & RUNTIME TRUTH AUDIT

## GOAL:
Audit the existing practical lab runtime to determine whether Cyber-Net Lab's labs behave like a reliable learning environment. Identify and fix the highest-impact correctness problems without redesigning the UI, creating new engines, or adding new state stores.

## PHASE 7.8 COMPLETION STATUS (from code, tests, runtime):
- Terminal device selector: migrated to `labEngine.state.runtime.devices[d.id]?.hostname` ✓
- `useLabTopology`: accepts optional `labEngine`, prefers runtime via `getDeviceState` helper ✓
- `useLabVerification`: accepts optional `labEngine`, prefers runtime via `buildDeviceStatesMap` helper ✓
- `useLabTroubleshooting`: accepts optional `labEngine` parameter ✓
- `LabWorkspace`: passes `labEngineRef.current` to topology, verification, troubleshooting hooks ✓
- Tests: 128/128 pass (no pre-existing failures)
- Build: passes (769 modules)
- No new engines/stores/event buses created ✓

## AUDIT FINDINGS:

### Finding 1: Topology edge status checks ANY interface, not specific connected interfaces
**Location:** `useLabTopology.js` lines 31-39
**Impact:** HIGH — Visual connectivity could be misleading. An edge shows "up" if any interface on each device is up, even if the specific connected interfaces are down.
**Example:** If PC1 has Ethernet0 down but Ethernet1 up, and the edge connects PC1:Ethernet0→SW1:Fa0/1, the edge would still show "up" because PC1 has an up interface.

### Finding 2: `NetworkSimulationEngine.canReach` has logical bug
**Location:** `NetworkSimulationEngine.js` lines 155-181
**Impact:** LOW — Method is unused dead code. But the bug exists: it checks target device's static routes instead of source device's routes for reachability.
**Decision:** Remove unused method to eliminate confusion and bug surface.

### Finding 3: `verifyPing` fallback has false-positive risk
**Location:** `verificationEngine.js` lines 287-299
**Impact:** LOW — Fallback only triggers when simulation object is unavailable. In normal LabWorkspace flow, simulation is always available. But the fallback returns `passed: true` for both reachable and unreachable expectations when >= 2 devices have IPs.
**Decision:** Make fallback conservative (return false when simulation unavailable) to prevent false positives.

### Finding 4: Three state stores still exist
**Location:** `NetworkSimulationEngine.devices`, `LabWorkspace.canonicalDeviceStates`, `LabEngine.state.runtime`
**Impact:** MEDIUM — Phase 7.8 made consumers prefer `LabEngine.state.runtime`, but `canonicalDeviceStates` is still maintained. This is by design for backward compatibility. The bridge ensures `LabEngine.state.runtime` is authoritative.
**Decision:** Preserve fallback. No removal in this phase.

## PLAN:

### Step 1: Fix topology edge status to check specific connected interfaces
- Modify `useLabTopology.js` `getEdgeStatus` to check the specific interfaces referenced in the connection string
- Parse `from:DEVICE:INTERFACE` and `to:DEVICE:INTERFACE` format
- Check status of those specific interfaces, not any interface on the device

### Step 2: Remove unused `canReach` method
- Delete `canReach` from `NetworkSimulationEngine.js`
- Verify no tests or code depend on it

### Step 3: Make `verifyPing` fallback conservative
- When simulation is unavailable, return `passed: false` with clear message instead of always passing

### Step 4: Add runtime truth tests
- Test topology edge status reflects specific interface state
- Test verification reads from authoritative runtime state
- Test ping verification with disconnected interfaces
- Test state persistence across consumers after command execution

### Step 5: Run full test suite and build
- Verify all tests pass
- Verify build passes

### Step 6: Runtime verification
- Start dev server
- Load REF-001
- Execute commands
- Verify terminal, topology, verification, and inspector show consistent state
- Test reset behavior
- Test incorrect configuration failure

### Step 7: Update PROJECT_CHECKPOINT.md
- Add Phase 7.9 entry

### Step 8: Produce 16-section final report

## FILES TO MODIFY:
1. `frontend/src/features/lab-workspace/useLabTopology.js` — fix edge status
2. `frontend/src/engine/NetworkSimulationEngine.js` — remove unused `canReach`
3. `frontend/src/features/simulator/verificationEngine.js` — fix ping fallback
4. `frontend/src/features/lab-workspace/__tests__/ref001-runtime.test.js` — add topology edge tests
5. `frontend/src/features/simulator/__tests__/verificationEngine.test.js` — add ping fallback test
6. `PROJECT_CHECKPOINT.md` — add Phase 7.9 entry

## FILES NOT TO TOUCH:
- Backend
- Lab data
- UI components (except topology edge status logic)
- Any new engine/store/runtime/event bus

## ARCHITECTURE CONSTRAINTS:
- No new engines
- No new state stores
- No new runtimes
- No new event buses
- Preserve existing architecture
- Fix correctness, not cosmetics
