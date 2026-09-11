# CyberNet Lab — ARCHITECTURE MAP

**READ THIS FILE BEFORE MODIFYING CYBERNET LAB.**

**Version:** 4.0.0  
**Project Path:** `C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab`  
**Last Updated:** Session 9 (Documentation, Developer Experience & Release Readiness)

---

## 1. PROJECT PURPOSE

CyberNet Lab is a hands-on network engineering learning platform featuring:
- 249 labs across 40+ categories (247 procedural + 2 reference)
- 2,343 total steps with real networking commands
- Stateful CLI simulation (Cisco IOS-style)
- Step-by-step verification with functional feedback loops
- NOC/SOC command center interface with 3D visualization
- 20 background themes (NOC ICEBLUE default)
- WebSocket-based real-time lab engine

---

## 2. CORE PRINCIPLES

- **Modular Architecture:** Separate frontend/backend/simulation layers
- **Feature-Based Organization:** Components grouped by feature (dashboard, lab-workspace, backgrounds)
- **Low Coupling:** UI components call feature logic, not vice versa
- **High Cohesion:** Each module has single responsibility
- **Reuse Existing Code:** Extend before creating new files
- **No Duplicate Functionality:** Check before adding new code
- **Real-World Labs:** Every lab answers "What job requires this?"
- **Stateful Simulation:** CLI maintains device state across commands
- **Test Before Completion:** Verify build passes after each change

---

## 3. PROJECT DIRECTORY MAP

```
cybernet-lab/
├── frontend/                      # React frontend (Vite)
│   ├── src/
│   │   ├── main.jsx              # Entry point
│   │   ├── App.jsx               # Main shell with view routing
│   │   ├── styles/
│   │   │   └── global.css        # Global CSS variables & theme
│   │   ├── components/            # UI components (active + legacy)
│   │   │   ├── primitives/        # Reusable primitives (Badge, Button, Metric, Panel, SectionHeader, StatusIndicator)
│   │   │   ├── BackgroundStudio.jsx  # Legacy background studio (dead, use features/backgrounds/)
│   │   │   ├── Terminal.jsx      # Legacy terminal (dead, use features/cli/CliTerminal.jsx)
│   │   │   ├── NetworkVisualization.jsx  # Legacy visualization (dead)
│   │   │   ├── LabStepViewer.jsx
│   │   │   ├── GlobalSearch.jsx  # Lab search (active)
│   │   │   ├── Header.jsx        # Top header
│   │   │   ├── Nav.jsx           # Navigation
│   │   │   ├── Inspector.jsx     # Device inspector panel
│   │   │   ├── StepPanel.jsx     # Step instructions panel
│   │   │   ├── ToolCabinet.jsx   # Tool selection
│   │   │   ├── Workbench.jsx     # Main workbench area
│   │   │   ├── FocusMode.jsx     # Distraction-free mode (active)
│   │   │   ├── EngineerMode.jsx  # Quick task launcher (active)
│   │   │   ├── LearningRoadmap.jsx  # Active
│   │   │   ├── CommandLibrary.jsx
│   │   │   ├── MusicPlayer.jsx   # Legacy (dead, use features/music/MusicPlayer.jsx)
│   │   │   ├── ErrorBoundary.jsx # Active
│   │   │   └── *.css             # Component styles
│   │   ├── engine/               # Core engines
│   │   │   ├── LabEngine.js      # WebSocket lab orchestration (uses ConnectionManager)
│   │   │   ├── connectionManager.js  # WebSocket connection management with reconnection & local mode
│   │   │   ├── AudioEngine.js    # Sound effects & music
│   │   │   ├── NetworkSimulationEngine.js  # CLI simulation (authoritative for practical learner workflow)
│   │   │   ├── LabStateEngine.js # Pure state management functions
│   │   │   ├── LabRuntimeState.js # Immutable runtime state schema
│   │   │   ├── WorkflowEngine.js  # Step progression logic
│   │   │   └── TroubleshootingEngine.js  # Fault injection scenarios
│   │   ├── features/             # Feature modules (ACTIVE code lives here)
│   │   │   ├── backgrounds/      # BackgroundStudio feature
│   │   │   ├── cli/              # CLI command handlers (Phase 2)
│   │   │   │   ├── CliTerminal.jsx  # Active CLI terminal UI
│   │   │   │   ├── commandRegistry.js  # Command registration
│   │   │   │   ├── cliParser.js  # CLI parsing utilities
│   │   │   │   ├── baseCommands.js
│   │   │   │   ├── ipCommands.js
│   │   │   │   ├── vlanCommands.js
│   │   │   │   ├── showCommands.js
│   │   │   │   ├── routingCommands.js
│   │   │   │   ├── sshCommands.js
│   │   │   │   ├── portSecurityCommands.js
│   │   │   │   ├── aclCommands.js
│   │   │   │   ├── natCommands.js
│   │   │   │   ├── dhcpCommands.js
│   │   │   │   ├── terminalCommands.js
│   │   │   │   └── index.js
│   │   │   ├── dashboard/        # Dashboard feature
│   │   │   ├── lab-workspace/    # LabWorkspace feature (ACTIVE, ~287 lines)
│   │   │   │   ├── LabWorkspace.jsx
│   │   │   │   ├── LabWorkspaceComponents.jsx
│   │   │   │   ├── labParsers.js
│   │   │   │   ├── useLabSimulation.js
│   │   │   │   ├── useLabTerminal.js
│   │   │   │   ├── useLabTopology.js
│   │   │   │   ├── useLabVerification.js
│   │   │   │   ├── useLabTroubleshooting.js
│   │   │   │   ├── useLabTimer.js
│   │   │   │   └── __tests__/
│   │   │   ├── music/           # Audio feature
│   │   │   └── simulator/        # Network simulation
│   │   │       ├── index.js
│   │   │       ├── deviceState.js
│   │   │       ├── interfaceState.js
│   │   │       ├── routingState.js
│   │   │       ├── vlanState.js
│   │   │       ├── arpState.js
│   │   │       ├── packetEngine.js
│   │   │       ├── verificationEngine.js
│   │   │       └── troubleshootingEngine.js
│   │   ├── core/                 # Shared utilities
│   │   │   ├── storage/          # localStorage helpers
│   │   │   ├── constants/        # App constants
│   │   │   ├── utils/            # Utility functions
│   │   │   └── types/            # Type definitions
│   │   ├── app/                  # App views
│   │   │   └── views/
│   │   │       ├── LabExplorerView.jsx
│   │   │       └── LabDetailView.jsx
│   │   ├── data/                 # Lab data
│   │   │   ├── labs.procedural.json  # 247 labs (152K lines)
│   │   │   ├── labRegistry.js   # Lab registration
│   │   │   ├── LabModel.js      # Canonical lab schema
│   │   │   ├── labNormalizer.js # Legacy → canonical converter
│   │   │   └── labs/            # Category-specific labs
│   │   │       ├── index.json
│   │   │       └── *.json
│   │   ├── store/                # State management
│   │   │   └── labStore.js       # Zustand store
│   │   └── jest.config.js        # Frontend Jest config
│   └── vite.config.js
├── backend/                      # Express backend
│   ├── server.js                 # WebSocket + REST API
│   ├── state/
│   │   └── state.js              # Shared state singleton
│   ├── data/
│   │   └── labLoader.js          # Lab data loading
│   ├── services/
│   │   ├── labService.js
│   │   ├── verificationService.js
│   │   └── labQualityService.js
│   ├── routes/
│   │   └── apiRoutes.js          # REST API handlers
│   └── websocket/
│       ├── connection.js
│       └── messages.js
├── simulation/                   # Simulation logic
│   ├── verifiers.js              # Step verification functions
│   ├── packetTracer.js           # Packet tracing logic
│   └── routers/
│       └── core-router.txt        # Router config template
├── deploy/                       # Deployment scripts
│   ├── improve-all-labs.js       # Lab enrichment
│   ├── fix-categories.js         # Category normalization
│   └── *.js                      # Other deployment tools
├── song/                         # Background music
├── image/                        # Image assets
├── package.json                  # Dependencies
├── vite.config.js
├── index.html
├── start.bat                     # Windows startup script
├── .env.example                  # Environment variables template
└── CYBERNET_LAB_BLUEPRINT.md    # Technical specification
```

---

## 4. FEATURE OWNERSHIP

### CLI Simulation
- **Location:** `frontend/src/features/lab-workspace/LabWorkspace.jsx` (integrated terminal) and `frontend/src/features/cli/` (command handlers)
- **Responsibility:** Cisco IOS-style command input/output
- **Public API:** `onCommand(input)`, `onOutput(output)`
- **Dependencies:** NetworkSimulationEngine, LabEngine

### CLI Command Handlers (Phase 2 Modularization)
- **Location:** `frontend/src/features/cli/handler modules`
- **Files:** `baseCommands.js`, `ipCommands.js`, `vlanCommands.js`, `showCommands.js`, `routingCommands.js`, `sshCommands.js`, `portSecurityCommands.js`, `aclCommands.js`, `natCommands.js`, `dhcpCommands.js`, `terminalCommands.js`
- **Responsibility:** Individual command parsing and execution
- **Public API:** Each handler exports functions for its command category
- **Dependencies:** LabEngine state, simulator/verifiers.js

Each handler has single responsibility:
- `baseCommands`: enable, disable, configure, exit, interface, no
- `ipCommands`: ip address, ip dhcp
- `vlanCommands`: vlan, name
- `showCommands`: 25+ show subcommands
- `routingCommands`: router, network, ip route
- `sshCommands`: ip ssh, username
- `portSecurityCommands`: switchport port-security
- `aclCommands`: access-list
- `natCommands`: ip nat
- `dhcpCommands`: ip dhcp pool, network, default-router, dns-server
- `terminalCommands`: ping, traceroute, write, erase, reload

### Lab Engine
- **Location:** `frontend/src/engine/LabEngine.js`
- **Responsibility:** WebSocket communication, lab state management, step verification
- **Public API:** `startLab()`, `verifyStep()`, `sendHint()`, `pushConfig()`, `resetLab()`
- **Dependencies:** WebSocket API, simulation/verifiers.js

### Verification Engine
- **Location:** `simulation/verifiers.js`
- **Responsibility:** CLI, config, topology, typing, option verification
- **Public API:** `verifiers.cli()`, `verifiers.config()`, `verifiers.topology()`
- **Dependencies:** None

### Background Studio
- **Location:** `frontend/src/features/backgrounds/BackgroundStudio.jsx`
- **Responsibility:** 20 animated background themes
- **Public API:** `bgSetting`, `onBgChange()`
- **Dependencies:** Three.js, R3F

### Dashboard
- **Location:** `frontend/src/features/dashboard/Dashboard.jsx`
- **Responsibility:** NOC/SOC view with 3D globe visualization
- **Public API:** `labs`, `progress`, `onSelectLab()`
- **Dependencies:** GlobeVisualization, BackgroundStudio

### Lab Workspace
- **Location:** `frontend/src/features/lab-workspace/LabWorkspace.jsx`
- **Responsibility:** Interactive lab execution environment
- **Public API:** `lab`, `onExit()`, `onComplete()`
- **Dependencies:** LabEngine, Terminal, Topology

### Backend Server
- **Location:** `backend/server.js`
- **Responsibility:** WebSocket sessions, REST API, lab state caching
- **Public API:** `/api/labs`, `/api/labs/:id/start`, WebSocket messages
- **Dependencies:** Express, WebSocket, NodeCache

---

## 5. DEPENDENCY RULES

```
UI Components (Terminal, Dashboard, LabWorkspace)
        ↓
Feature Logic (LabEngine, AudioEngine, BackgroundStudio)
        ↓
Simulation Layer (verifiers.js, packetTracer.js)
        ↓
Backend API (Express + WebSocket server.js)
```

**Forbidden:** UI components must not directly implement simulator rules.  
**Allowed:** Feature logic can call simulation layer.  
**Avoid:** Circular dependencies between features.

---

## 6. FILE CREATION RULES

Before creating a new file, verify:

1. Does this functionality exist in `components/`, `engine/`, or `features/`?
2. Can an existing module be extended?
3. Which feature owns this functionality?
4. Is this shared (→ `core/`) or feature-specific (→ `features/`)?
5. Will this duplicate existing functionality?
6. Does the new file have a clear, single responsibility?

**Do not create files to reduce line count. Do not create duplicate utilities.**

---

## 7. LAB ARCHITECTURE

Each lab in `labs.procedural.json` contains:

```javascript
{
  "id": "1",
  "title": "Basic IP Configuration and Ping Test",
  "category": "ICMP",
  "level": "basic",           // basic | intermediate | advanced
  "time": "15 minutes",
  "objectives": "...",
  "scenario": "...",
  "concepts": [...],
  "errors": [...],
  "questions": [...],
  "steps": [
    {
      "stepId": "1-S-01",
      "title": "Use Ping to Test Connectivity",
      "instruction": "...",
      "commands": ["enable", "ping 192.168.1.1"],
      "expectedOutput": "...",
      "verification": {
        "type": "cli|config|topology|typing|option",
        "expected": "..."
      },
      "commonErrors": [...],
      "hints": [...],
      "challenge": "..."
    }
  ]
}
```

### Verification Types
- **cli:** Command output verification
- **config:** Configuration similarity check (85% threshold)
- **topology:** Network graph validation
- **typing:** Exact text match (90% threshold)
- **option:** Multiple choice selection

---

## 8. LAB DIFFICULTY

| Level | Steps | Focus |
|-------|-------|-------|
| Basic | 6-8 | Fundamentals, simple config, basic verification |
| Intermediate | 8-10 | Multiple devices, routing, VLAN, troubleshooting |
| Advanced | 10-15 | Multi-device, complex routing, security, real-world scenarios |

---

## 9. REAL-WORLD LAB RULE

Every lab must answer: "What networking job requires this?"

Examples implemented:
- Office VLAN deployment
- Branch router configuration
- OSPF network setup
- BGP peering
- DHCP pool configuration
- ACL troubleshooting
- SSH hardening
- NAT overload
- EtherChannel setup
- STP root election

---

## 10. SIMULATOR OWNERSHIP

| Component | Owner File |
|-----------|------------|
| Device state | `features/simulator/deviceState.js` |
| Interface state | `features/simulator/interfaceState.js` |
| Routing table | `features/simulator/routingState.js` |
| VLAN database | `features/simulator/vlanState.js` |
| ARP cache | `features/simulator/arpState.js` |
| Packet flow | `features/simulator/packetEngine.js` |
| Step verification | `simulation/verifiers.js` |
| Troubleshooting | `features/simulator/troubleshootingEngine.js` |

**UI must not implement simulator rules.**

---

## 11. CLI OWNERSHIP

| Layer | Location |
|-------|----------|
| CLI UI | `features/cli/CliTerminal.jsx` (active) |
| Command handlers | `features/cli/` (11 handler modules) |
| Command registry | `features/cli/index.js` (public API) |
| Simulator interaction | `LabEngine._localVerify()` |

Adding a new command:
1. Add handler to appropriate `features/cli/` module
2. Export from `features/cli/index.js`
3. Add verification type to `simulation/verifiers.js`
4. Add to lab step `commands` array

### CLI Handler Modules (Phase 2)
- `baseCommands.js` - enable, disable, configure, exit, interface, no
- `ipCommands.js` - ip address, ip dhcp
- `vlanCommands.js` - vlan, name
- `showCommands.js` - 25+ show subcommands
- `routingCommands.js` - router, network, ip route
- `sshCommands.js` - ip ssh, username
- `portSecurityCommands.js` - switchport port-security
- `aclCommands.js` - access-list
- `natCommands.js` - ip nat
- `dhcpCommands.js` - ip dhcp pool, network, default-router, dns-server
- `terminalCommands.js` - ping, traceroute, write, erase, reload

---

## 12. UI RULES

UI components should:
- Render state
- Receive user input
- Call feature logic via props/callbacks
- Display state from stores/hooks

UI components should NOT:
- Contain business logic
- Directly manipulate device state
- Implement verification rules

---

## 13. SHARED CODE RULE

Shared code belongs in:

| Directory | Purpose |
|-----------|---------|
| `core/` | Utilities, constants, types, storage |
| `engine/` | Core engines (LabEngine, AudioEngine) |
| `simulation/` | Verification logic |

Feature-specific code belongs in `features/<feature>/`.  
Do NOT put feature code into shared folders.

---

## 14. DEPENDENCY RULE

Before adding npm dependency:

1. Does existing library solve this?
2. Can native browser API work?
3. Check bundle size
4. Is it actually necessary?
5. Document new dependencies here

**Current Dependencies:**
- `react`, `react-dom` - UI framework
- `three`, `@react-three/fiber`, `@react-three/drei` - 3D visualization
- `zustand` - State management
- `express`, `ws` - Backend
- `uuid` - Session IDs
- `node-cache` - In-memory caching

---

## 15. CHANGE MANAGEMENT

When architecture changes:
1. Update this file (MENU.md)
2. Update relevant documentation
3. Verify build passes (`npm run build`)
4. Test functionality

When adding features:
1. Document ownership in section 4
2. Add to directory map in section 3
3. Update dependency rules if needed

---

## 16. BUILD & VERIFICATION

```bash
npm run build    # Vite build (frontend only)
npm run dev      # Full stack dev (frontend + backend)
npm run backend  # Backend only
npm run frontend # Frontend only
```

**Build must pass before completing any task.**

---

## 17. CURRENT PROJECT STATUS

| Component | Status |
|-----------|--------|
| Frontend (React + Vite) | ✅ Implemented |
| Backend (Express + WebSocket) | ✅ Implemented |
| Lab Engine (WebSocket) | ✅ Implemented |
| CLI Simulation | ✅ Implemented |
| 249 Labs (247 procedural + 2 reference) | ✅ Implemented |
| 3D Globe Visualization | ✅ Implemented (Phase 4.4) |
| Background Studio (20 themes) | ✅ Implemented (Phase 8) |
| NOC/SOC Dashboard | ✅ Implemented (Phase 4.2) |
| Verification Engine | ✅ Implemented |
| Troubleshooting Engine | ✅ Implemented |
| Audio/Music System | ✅ Implemented |
| Deploy Scripts | ✅ Implemented |
| Phase 3.1 Lab Schema | ✅ Implemented |
| Phase 3.2 Workflow System | ✅ Implemented |
| Phase 3.3 Central Lab State Engine | ✅ Implemented |
| Phase 3.4 Device State Engine Foundation | ✅ Implemented |
| Phase 3.5 LabEngine.js Integration | ✅ Implemented |
| Phase 3.6 Canonical Runtime State Integration | ✅ Implemented |
| Phase 3.7 Simulation → Runtime Bridge | ✅ Implemented |
| Phase 4.1 Design System | ✅ Implemented |
| Phase 4.2 Dashboard Redesign | ✅ Implemented |
| Phase 4.3 Globe Visualization | ✅ Implemented |
| Phase 4.4 Real 3D WebGlobe | ✅ Implemented |
| Session 6 Lab Quality Audit | ✅ Implemented |
| Session 6.2 Lab Quarantine | ✅ Implemented |
| Session 7.2 REF-001 Runtime Integration | ✅ Implemented |
| Session 8 Reset Synchronization | ✅ Implemented |
| Session 9 Documentation & DX | ✅ In Progress |

### Next Priorities
1. LabEngine integration into practical learner workflow
2. Backend verification for `state_check`/`ping` types
3. Lab remediation (18 quarantined labs)
4. WorkflowEngine integration into LabWorkspace

---

## 18. AI DEVELOPMENT WORKFLOW

**MANDATORY BEFORE CHANGES:**

1. Read MENU.md (this file)
2. Inspect relevant source files
3. Verify current build passes
4. Make changes
5. Verify build still passes
6. Test functionality
7. Update MENU.md if architecture changed

**NEVER:**
- Create duplicate functionality
- Invent new architecture without checking
- Modify simulator rules in UI components
- Skip build verification

---

*This file is the authoritative source for CyberNet Lab architecture.*

## Phase Completion Log

- Phase 1: Basic lab implementation ✅
- Phase 1.5: Architecture mapping (MENU.md creation) ✅
- Phase 2: Safe feature modularization (CLI commandRegistry split) ✅
- Phase 2.5: Dependency and duplication cleanup ✅
  - Removed duplicate GlobeVisualization components (components/ folder)
  - Consolidated shuffle function to core/utils (removed duplicate in GameEngine)
  - Removed duplicate LAB_LEVELS constant (keeping LAB_DIFFICULTIES)
  - Removed duplicate Vlan typedef from core/types
  - Removed unused npm dependencies (none found - all packages used)
  - No circular imports detected
  - Build verification passed after all changes
- Phase 2.6: LabEngine modularization ✅
  - Created `connectionManager.js` for WebSocket connection lifecycle
  - Extracted WebSocket connect/reconnect/local mode logic from LabEngine
  - LabEngine now delegates WS operations to ConnectionManager
  - Build verification passed after refactor
- Phase 2.7: Constants modularization ✅
  - Split `core/constants/index.js` into 12 submodule files
  - Preserved backward compatibility via re-exports
  - All imports work unchanged
  - Build verification passed
- Phase 3.1: Lab Schema & Real-Life Scenario Foundation ✅
  - Created `LabModel.js` - Canonical lab schema definition
  - Created `labNormalizer.js` - Legacy → Canonical normalization layer
  - Updated `labRegistry.js` - Uses normalizer with reference lab integration
  - Created 2 reference labs: Small Office LAN, VLANs Sales & Accounts
  - Created `frontend/src/data/README.md` - Lab data documentation
  - Created 12 constants submodules
  - 12 quality rules established
  - Build verification passed
  - 247 legacy labs preserved and auto-normalized
- Phase 3.2: Step-by-Step Lab Workflow System ✅
  - Created `WorkflowEngine.js` - canonical workflow state owner
  - Refactored `LabWorkspace.jsx` - integrated WorkflowEngine
  - Step lifecycle: LOCKED → AVAILABLE → IN_PROGRESS → VERIFICATION_PENDING → VERIFIED/FAILED → COMPLETED
  - Step locking implemented (first step unlocked, rest locked)
  - Verification gate: Next disabled until verification succeeds
  - Hint system integrated with workflow state
  - Progress calculated deterministically from completedStepIds
  - Build verification passed (738 modules, 0 errors)
- Phase 3.3: Central Lab State Engine ✅
  - Created `LabStateEngine.js` - canonical simulated network state owner
  - Refactored `LabEngine.js` - coordinates LabStateEngine + WorkflowEngine
  - Refactored `LabWorkspace.jsx` - consumes canonical device state from lab initialState
  - State ownership documented: LabStateEngine owns network state, WorkflowEngine owns workflow state
  - Build verification passed (738 modules, 0 errors)

---

## 3. EXCELLENT FILE INDEX

### Core Infrastructure Files

| FILE | PURPOSE | OWNER | IMPORTS | USED BY |
|------|---------|-------|---------|---------|
| `src/main.jsx` | React entry point, bootstrap | AppShell | React, App | Vite |
| `src/App.jsx` | Main shell with view routing | AppShell | AudioEngine, gameEngine, generatePacketTracerHint, LabWorkspace, BackgroundStudio, Dashboard | main.jsx |
| `src/styles/global.css` | CSS variables & theme | Theming | - | All components |

### Feature Files

| FILE | PURPOSE | OWNER | IMPORTS | USED BY |
|------|---------|-------|---------|---------|
| `src/features/dashboard/Dashboard.jsx` | NOC/SOC dashboard with 3D globe | Dashboard | GlobeVisualization, formatUptime, formatTraffic | App.jsx |
| `src/features/lab-workspace/LabWorkspace.jsx` | Interactive lab execution | LabWorkspace | CliTerminal, MetricBox, HealthBar, ConfigSection, parseLabDevices, defaultDeviceState, useLabSimulation, useLabTopology, useLabVerification, useLabTroubleshooting, useLabTimer, useLabTerminal | App.jsx |
| `src/features/cli/CliTerminal.jsx` | CLI terminal UI component | CLI | LabEngine, simulation state | LabWorkspace.jsx |
| `src/features/cli/index.js` | Public API exports | CLI | baseCommands, ipCommands, vlanCommands, showCommands, routingCommands, sshCommands, portSecurityCommands, aclCommands, natCommands, dhcpCommands, terminalCommands | App.jsx (indirectly) |
| `src/features/backgrounds/BackgroundStudio.jsx` | 20 animated background themes | Backgrounds | Three.js, R3F, theme constants | App.jsx |
| `src/features/music/MusicPlayer.jsx` | Audio playback controls | Music | audioEngine, MUSIC_TRACKS | App.jsx |
| `src/features/globe/GlobeVisualization.jsx` | 3D network globe | Globe | Three.js, R3F | Dashboard.jsx |
| `src/features/quiz/QuizEngine.js` | Quiz logic engine | Quiz | shuffleArray (core/utils) | Quiz.jsx |
| `src/features/simulator/index.js` | Simulation state exports | Simulator | deviceState, interfaceState, routingState, vlanState, arpState, packetEngine, verificationEngine, troubleshootingEngine | Many features |
| `src/store/labStore.js` | Zustand state store | State | - | Many components |

### Engine Files

| FILE | PURPOSE | OWNER | IMPORTS | USED BY |
|------|---------|-------|---------|---------|
| `src/engine/LabEngine.js` | WebSocket lab orchestration (uses ConnectionManager) | LabEngine | ConnectionManager, WebSocket API | Terminal.jsx, LabWorkspace |
| `src/engine/connectionManager.js` | WebSocket connection management with reconnection & local mode | ConnectionManager | none | LabEngine |
| `src/engine/LabStateEngine.js` | Canonical simulated network state owner | LabStateEngine | - | LabEngine, LabWorkspace, Verification |
| `src/engine/WorkflowEngine.js` | Step-by-step workflow state, step lifecycle, progress, verification gate | WorkflowEngine | - | LabWorkspace |
| `src/engine/GameEngine.js` | Game state management | Game | shuffleArray, toTitleCase | ? |
| `src/engine/NetworkSimulationEngine.js` | Network packet simulation | Simulation | - | useLabSimulation.jsx |
| `src/engine/TroubleshootingEngine.js` | Troubleshooting logic | Troubleshooting | - | components/LabWorkspace.jsx |

### Core Utility Files

| FILE | PURPOSE | OWNER | IMPORTS | USED BY |
|------|---------|-------|---------|---------|
| `src/core/utils/index.js` | Formatting, ID, network, array utilities | Core | - | Dashboard, QuizEngine, GameEngine, others |
| `src/core/constants/index.js` | All app constants (re-exports from submodules) | Core | - | All features |
| `src/core/constants/deviceTypes.js` | Device type definitions with icons/colors | Core | - | LabWorkspace, simulator |
| `src/core/constants/toolTypes.js` | Tool type definitions | Core | - | ToolCabinet, Workbench |
| `src/core/constants/cliModes.js` | CLI mode constants (user/enable/config) | Core | - | CLI command handlers, commandRegistry |
| `src/core/constants/labDifficulties.js` | Lab difficulty levels | Core | - | Dashboard, lab data |
| `src/core/constants/storageKeys.js` | localStorage wrapper keys | Core | - | App.jsx, store |
| `src/core/constants/themes.js` | Theme definitions (names, icons) | Core | - | BackgroundStudio, Dashboard |
| `src/core/constants/backgrounds.js` | All 20 background configurations | Core | - | BackgroundStudio |
| `src/core/constants/defaults.js` | Default values for interface, BG, music | Core | - | Initial state setup |
| `src/core/constants/musicTracks.js` | Music track metadata | Core | - | AudioEngine, MusicPlayer |
| `src/core/constants/simulationDefaults.js` | Simulation rendering defaults | Core | - | NetworkSimulationEngine, GlobeVisualization |
| `src/core/constants/badgeThresholds.js` | Progress badge thresholds | Core | - | Dashboard, store |
| `src/core/constants/verificationTypes.js` | Verification type constants | Core | - | simulator, LabEngine |
| `src/core/constants/packetStates.js` | Packet flow state constants | Core | - | packetEngine.js |
| `src/core/constants/troubleshootFaults.js` | Troubleshooting fault type constants | Core | - | troubleshootingEngine.js |

### Data Files

| FILE | PURPOSE | OWNER | IMPORTS | USED BY |
|------|---------|-------|---------|---------|
| `src/data/labs.procedural.json` | 247 labs (152K lines) | Data | - | LabRegistry, Dashboard |
| `src/data/labRegistry.js` | Lab registration & access | Data | labs.procedural.json, reference-labs | App.jsx, many components |
| `src/data/labNormalizer.js` | Legacy → Canonical normalization | Data | LabModel | labRegistry |
| `src/data/LabModel.js` | Canonical lab schema definition | Data | - | labNormalizer, all labs |
| `src/data/reference-labs/` | 2 reference-quality labs | Data | - | labRegistry |
| `src/data/labs/index.json` | Category index | Data | - | labRegistry |
| `src/data/README.md` | Lab data documentation | Data | - | Developers |

### Backend / Simulation Layer

| FILE | PURPOSE | OWNER | IMPORTS |
|------|---------|-------|---------|
| `backend/server.js` | Express + WebSocket server | Backend | express, ws, node-cache, uuid |
| `simulation/verifiers.js` | Step verification logic | Simulation | - |
| `simulation/packetTracer.js` | Packet tracing logic | Simulation | - |

---

## 4. FEATURE → FILE MAP

| Feature | Main File | Supporting Files | Data | Logic |
|---------|-----------|------------------|------|-------|
| **Dashboard** | `features/dashboard/Dashboard.jsx` | `features/dashboard/index.js` | - | `core/utils`, `features/globe` |
| **Lab Workspace** | `features/lab-workspace/LabWorkspace.jsx` | `labParsers.js`, `useLabSimulation.js`, `useLabTopology.js`, `useLabVerification.js`, `useLabTroubleshooting.js`, `useLabTimer.js`, `useLabTerminal.js`, `LabWorkspaceComponents.jsx` | `data/labs.procedural.json` | Simulator, CLI |
| **CLI** | `features/cli/index.js` | 11 handler files + `cliParser.js` | - | LabEngine, simulator |
| **Simulator** | `features/simulator/index.js` | `deviceState.js`, `interfaceState.js`, `routingState.js`, `vlanState.js`, `arpState.js`, `packetEngine.js`, `verificationEngine.js`, `troubleshootingEngine.js` | - | Core utils |
| **Quiz** | `features/quiz/Quiz.jsx` | `QuizEngine.js` | - | Core utils |
| **Backgrounds** | `features/backgrounds/BackgroundStudio.jsx` | BackgroundRenderer.jsx, 20 renderers | - | Three.js, constants |
| **Globe** | `features/globe/GlobeVisualization.jsx` | `index.js` | - | Three.js, constants |
| **Music** | `features/music/MusicPlayer.jsx` | `AudioEngine.js` | `core/constants` | - |
| **State** | `store/labStore.js` | - | - | Zustand |

---

## 5. LARGE FILE MAP

| File | Lines | Approximate Responsibility | Problems | Future Extraction Plan |
|------|-------|--------------------------|----------|------------------------|
| `src/data/labs.procedural.json` | ~152,000 | 247 network labs with steps | JSON format only | Keep as-is (lab data) |
| `features/backgrounds/BackgroundStudio.jsx` | ~300 | Background theme UI | Complex rendering logic | Extract renderer orchestration |
| `features/lab-workspace/LabWorkspace.jsx` | ~345 | Lab execution environment | Multiple hooks, sub-components | Already well-modularized with hooks |
| `features/dashboard/Dashboard.jsx` | ~350 | NOC/SOC dashboard view | Complex state + UI | Likely fine as-is |
| `engine/connectionManager.js` | ~100 | WebSocket connection lifecycle with reconnection | Single responsibility | Already modularized |
| `engine/LabEngine.js` | ~380 | WebSocket lab orchestration + state + verification | Uses ConnectionManager for WS ops | Could split verification layer |
| `core/constants/index.js` | ~15 | Re-exports from 12 submodules | All submodules | All features importing constants |
| `core/constants/index.js` | 163 | All app constants | Mix of concerns | Split: UI, network, themes |
| `core/types/index.js` | ~260 | JSDoc type definitions | Mostly documentation | Acceptable length |
| `features/backgrounds/renderers/*.jsx` | Varies | 3D background renderers | Many similar patterns | Normalize renderer structure |

---

## 6. DATA MAP

| Data Type | Location | Format |
|-----------|----------|--------|
| **Lab data** | `frontend/src/data/labs.procedural.json` | JSON (247 labs, 2,343 steps) |
| **Lab registry** | `frontend/src/data/labRegistry.js` | JS module |
| **Category index** | `frontend/src/data/labs/index.json` | JSON |
| **Quiz questions** | Inside each lab's `steps[].questions` | JSON |
| **Configuration** | `frontend/src/core/constants/index.js` | JS exports |
| **Theme settings** | `frontend/src/core/storage/index.js` | localStorage wrappers |
| **Network data** | Lab `topology` and `ipTable` fields | JSON |
| **Assets** | `image/` | Various formats |
| **Audio** | `song/` | MP3 files |
| **Backgrounds** | `frontend/src/features/backgrounds/renderers/` | JSX + Three.js |

---

## 7. ENTRY POINT MAP

| Entry Point | File Path | Purpose |
|------------|-----------|---------|
| **App Entry** | `src/main.jsx` | React bootstrap |
| **Main Router** | `src/App.jsx` | View routing between panels |
| **Dashboard** | `features/dashboard/Dashboard.jsx` | NOC/SOC main view |
| **Lab Explorer** | `components/LabExplorerView.jsx` | Lab browsing UI |
| **Lab Workspace** | `features/lab-workspace/LabWorkspace.jsx` | Lab execution |
| **Simulator** | `features/cli/CliTerminal.jsx` | CLI interface |
| **Terminal** | `features/cli/CliTerminal.jsx` | Cisco IOS terminal |
| **State** | `store/labStore.js` | Zustand global store |

---

## 8. WHERE SHOULD I EDIT? QUICK REFERENCE

| Need to modify... | Edit File(s) |
|-------------------|--------------|
| Lab cards in dashboard | `features/dashboard/Dashboard.jsx` |
| Lab steps/queries | `data/labs.procedural.json` |
| Lab workspace UI | `features/lab-workspace/LabWorkspace.jsx` |
| CLI commands | `features/cli/` (handler modules) |
| Packet simulation | `features/simulator/packetEngine.js` |
| Device state | `features/simulator/deviceState.js` |
| Interface state | `features/simulator/interfaceState.js` |
| Routing state | `features/simulator/routingState.js` |
| VLAN state | `features/simulator/vlanState.js` |
| ARP cache | `features/simulator/arpState.js` |
| Verification logic | `simulation/verifiers.js` |
| Troubleshooting | `features/simulator/troubleshootingEngine.js` |
| Globe visualization | `features/globe/GlobeVisualization.jsx` |
| Background themes | `features/backgrounds/BackgroundStudio.jsx` |
| Background renderers | `features/backgrounds/renderers/*.jsx` |
| Music system | `features/music/AudioEngine.js` |
| Music UI | `features/music/MusicPlayer.jsx` |
| App shell | `src/App.jsx` |
| Global styles | `src/styles/global.css` |
| Shared utilities | `core/utils/index.js` |
| Constants | `core/constants/index.js` |
| Types | `core/types/index.js` |
| State store | `store/labStore.js` |

## WORKFLOW ARCHITECTURE (Phase 3.2)

```
Lab Start → WorkflowEngine → Step Lifecycle → Verification Engine → UI
```

| Component | File | Responsibility |
|-----------|------|----------------|
| Workflow Engine | `engine/WorkflowEngine.js` | Step lifecycle, progress, step locking, verification gate |
| Lab Workspace | `features/lab-workspace/LabWorkspace.jsx` | Workflow consumer, step list UI, verification panel |
| Verification Engine | `features/simulator/verificationEngine.js` | Technical verification (typing, command_output, state_check) |
| Lab Engine | `engine/LabEngine.js` | Network state owner (WebSocket/local) |

### Step Lifecycle

| State | Meaning |
|-------|---------|
| LOCKED | Step cannot be accessed yet |
| AVAILABLE | Student can start this step |
| IN_PROGRESS | Student is working on this step |
| VERIFICATION_PENDING | Verification in progress |
| VERIFIED | Step passed verification |
| COMPLETED | Step fully complete |
| FAILED | Verification failed, retry allowed |

### Workflow State Owner

`WorkflowEngine` is the single source of truth for:
- currentStepId
- completedStepIds
- verifiedStepIds
- failedStepIds
- stepStates map
- progress
- hintsUsed
- attempts

UI components must not independently track step completion.

## CENTRAL LAB STATE ARCHITECTURE (Phase 3.3)

```
CANONICAL LAB
    ↓
LAB STATE ENGINE
    ↓
+--------------+--------------+
|              |              |
v              v              v
CLI          TOPOLOGY    VERIFICATION
```

| Component | File | Responsibility |
|-----------|------|----------------|
| Lab State Engine | `engine/LabStateEngine.js` | Canonical simulated network state owner |
| Lab Engine | `engine/LabEngine.js` | Coordinates LabStateEngine + WorkflowEngine |
| Workflow Engine | `engine/WorkflowEngine.js` | Step/workflow state |
| Verification Engine | `features/simulator/verificationEngine.js` | Reads canonical state for verification |
| Lab Workspace | `features/lab-workspace/LabWorkspace.jsx` | Consumes canonical state for UI |

### State Ownership Rules

- LabStateEngine owns: devices, connections, interfaces, vlans, routes, services, configurations, logs, faults, telemetry, history
- WorkflowEngine owns: currentStepId, completedStepIds, workflow progress
- VerificationEngine owns: verification decisions
- UI owns: temporary presentation state only (selected device, active panel, modal state)

### State Read API

- `getLabState()`, `getDevice(deviceId)`, `getInterface(deviceId, interfaceId)`
- `getConnections()`, `getRoutingState(deviceId)`, `getConfiguration(deviceId)`
- `getLogs()`, `getTelemetry()`

### State Update Actions

- `updateDevice()`, `updateInterface()`, `updateConfiguration()`
- `updateVlan()`, `updateRoute()`, `updateConnection()`
- `addLog()`, `updateTelemetry()`, `pushHistory()`
- `resetLabState()`, `createSnapshot()`, `serializeState()`

### Initial State Rule

Runtime state must be seeded from the canonical lab definition's `initialState`. No random configuration, no silent defaults beyond safe structural defaults.

### Reset Rule

`resetLabState()` restores runtime state to the lab's defined initial state. UI and workflow reset remain separate concerns.

---

## 9. DUPLICATION WARNING

### Dead Code (Root Level — Not Imported by Current Build)

| Dead File (root/components) | Canonical File | Status |
|-----------------------------|----------------|--------|
| `Dashboard.jsx` | `features/dashboard/Dashboard.jsx` | ❌ DEAD - Not imported |
| `NetworkVisualization.jsx` | N/A | ❌ DEAD - Orphaned component |
| `VisualizationStudio.jsx` | N/A | ❌ DEAD - Orphaned component |
| `AudioEngine.js` | `features/music/AudioEngine.js` | ❌ DEAD - Not imported |
| `BackgroundStudio.jsx` | `features/backgrounds/BackgroundStudio.jsx` | ❌ DEAD - Not imported |
| `LabWorkspace.jsx` | `features/lab-workspace/LabWorkspace.jsx` | ❌ DEAD - Not imported |
| `MusicPlayer.jsx` | `features/music/MusicPlayer.jsx` | ❌ DEAD - Not imported |
| `Terminal.jsx` | `features/cli/CliTerminal.jsx` | ❌ DEAD - Not imported |
| `engine/TroubleshootingEngine.js` | `features/simulator/troubleshootingEngine.js` | ❌ DEAD - Not imported by active build |

### Code Duplication Issues

| Duplicate Functionality | Canonical Location | Duplicate Location | Action |
|------------------------|-------------------|-------------------|--------|
| `shuffle()` function | `core/utils/index.js` (`shuffleArray`) | `engine/GameEngine.js` | ✅ Fixed in Phase 2.5 |
| `LAB_LEVELS` const | `core/constants/index.js` (`LAB_DIFFICULTIES`) | N/A | ✅ Removed in Phase 2.5 |
| `Vlan` typedef | `core/types/index.js` | N/A | ✅ Removed duplicate in Phase 2.5 |

### Future Rule
Always reuse canonical implementations. When adding new code, search for existing functionality before creating new files.

---

## 10. DEPENDENCY RULES

### Import Hierarchy (Allowed)
```
UI Components (components/, features/) 
    → Feature Logic (features/, engine/)
    → Core Utils (core/)
    → Data (data/)
```

### Forbidden
- UI components must not import from `simulation/` directly
- Features must not reach into other features arbitrarily  
- No circular imports between features
- Backend code is isolated from frontend

### Shared Code Rules
- `core/` = Utilities, constants, types, storage
- `engine/` = Core engines (LabEngine, AudioEngine)
- `simulation/` = Verification logic (verifiers.js, packetTracer.js)
- `features/<name>/` = Feature-specific code

---

## 11. FUTURE FEATURE REGISTRY

| Feature | Status | Notes |
|---------|--------|-------|
| Stateful network simulator | ✅ IMPLEMENTED | features/simulator/ |
| Advanced CLI | ✅ PARTIAL | features/cli/ (modularized) |
| Packet visualization | ✅ PARTIAL | features/globe/, features/lab-workspace/PacketFlow |
| Troubleshooting engine | ✅ IMPLEMENTED | features/simulator/troubleshootingEngine.js |
| NOC dashboard | ✅ IMPLEMENTED | features/dashboard/ |
| SOC command center | ✅ PARTIAL | Same as NOC |
| 3D globe | ✅ IMPLEMENTED | features/globe/ |
| Background Studio | ✅ IMPLEMENTED | features/backgrounds/ (20 themes) |
| Quiz system | ✅ IMPLEMENTED | features/quiz/ |
| Gamification | ✅ PARTIAL | badges, xp, game engines |
| 247+ hands-on labs | ✅ IMPLEMENTED | data/labs.procedural.json |

---

## 12. AI WORK PROTOCOL

### MANDATORY BEFORE WORKING:

1. Read MENU.md (this file).
2. Find the relevant feature in the File Index (Section 3).
3. Open the exact files listed there.
4. Search the repository for existing implementations.
5. Do not create duplicate functionality.
6. Plan the change.
7. Modify only relevant files.
8. Test the change.
9. Update MENU.md if file ownership or architecture changes.

### IMPORTANT:

Do NOT repeatedly scan the entire repository when the relevant file is already documented in MENU.md.

---

## 13. CHECKPOINT SYSTEM

### CURRENT WORK CHECKPOINT

**Current phase:** Phase 3.3 - Central Lab State Engine complete; Pre-Phase-3.4 Render QA complete

**Current task:** Ready for Phase 3.4

**Files being modified:** 
- `frontend/src/engine/LabStateEngine.js` (new)
- `frontend/src/engine/LabEngine.js` (updated)
- `frontend/src/features/lab-workspace/LabWorkspace.jsx` (updated)
- `backend/server.js` (updated to seed reference labs)
- `PROJECT_CHECKPOINT.md` (updated)
- `MENU.md` (updated)

**Files completed:**
- Created `LabStateEngine.js` - canonical simulated network state owner
- Refactored `LabEngine.js` - coordinates LabStateEngine + WorkflowEngine
- Refactored `LabWorkspace.jsx` - consumes canonical device state from lab initialState
- Fixed backend lab seeding to include reference labs (REF-001, REF-002)
- State ownership documented: LabStateEngine owns network state, WorkflowEngine owns workflow state
- Build verification passed (738 modules, 0 errors)
- Pre-Phase-3.4 Render QA passed

**Files remaining:**
- None for Phase 3.3

**Last successful test:** `npm run build` ✅ (738 modules, 0 errors)
**Backend API:** `/api/labs/REF-001` ✅, `/api/labs/REF-002` ✅

**Known errors:**
- None blocking

**Next action:** Ready for Phase 3.4 (Device State Engine)

---

## 14. RESUME PROTOCOL

If the task stops or context is lost, the next AI must:

1. Read MENU.md (this file).
2. Read CURRENT WORK CHECKPOINT (Section 13).
3. Open only the relevant files listed.
4. Continue from "Next action".
5. Do not restart the entire task.
6. Do not repeat completed work.
7. Do not rescan unrelated files.

---

## 15. FINAL OUTPUT

**MENU.md Location:** `C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab\MENU.md`

**Complete Feature → File Map:** Section 4

**Important Files:** Sections 3, 5, 7

**Large Files:** Section 5

**Current Project Status:** Section 17 (in original document)

**Current Checkpoint:** Section 13

---
