# CyberNet Lab — Project Knowledge Document

## 1. Project Overview

CyberNet Lab v4.0 is a high-fidelity autonomous networking virtual laboratory. It combines:
- A **React 18 + Vite frontend** with cyberpunk/NOC aesthetic
- An **Express + WebSocket backend** for real-time lab orchestration
- **Multiple engines** for simulation, workflow, state, troubleshooting, and audio
- **249 labs** across 40+ networking categories (247 procedural + 2 reference)

The project is located at: `C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab`

---

## 2. Important File Structure

```
cybernet-lab/
├── backend/
│   ├── state/state.js                # Shared state singleton
│   ├── data/labLoader.js             # Lab data loading from JSON files
│   ├── services/verificationService.js # Verification wrapper
│   ├── services/labService.js        # Lab business logic
│   ├── websocket/connection.js       # WebSocket connection lifecycle
│   ├── websocket/messages.js         # Message routing
│   ├── routes/apiRoutes.js           # REST API route handlers
│   └── server.js                     # Refactored entry point
├── frontend/
│   ├── index.html                   # Vite entry HTML
│   ├── vite.config.js               # Vite configuration
│   ├── dist/                        # Built frontend assets
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Root component, orchestrates engines
│       ├── store/
│       │   └── labStore.js          # Zustand global state
│       ├── styles/
│       │   └── global.css           # Design tokens, NOC CSS, responsive
│       │   ├── components/              # Reusable UI components
│       │   │   ├── Header.jsx
│       │   │   ├── Nav.jsx
│       │   │   ├── LabWorkspace.jsx     # Main lab workspace (~310 lines)
│       │   │   ├── Dashboard.jsx        # NOC dashboard with globe
│       │   │   ├── NetworkVisualization.jsx  # 2D Canvas topology
│       │   │   ├── Terminal.jsx         # CLI terminal component
│       │   ├── StepPanel.jsx
│       │   ├── ToolCabinet.jsx
│       │   ├── Workbench.jsx
│       │   ├── Inspector.jsx
│       │   ├── BackgroundStudio.jsx
│       │   ├── MusicPlayer.jsx
│       │   ├── EngineerMode.jsx
│       │   ├── FocusMode.jsx
│       │   ├── GlobalSearch.jsx
│       │   ├── LabStepViewer.jsx
│       │   ├── LearningRoadmap.jsx
│       │   ├── VisualizationStudio.jsx
│       │   └── ErrorBoundary.jsx
│       ├── engine/                  # Core engine layer
│       │   ├── AudioEngine.js       # Web Audio API procedural audio
│       │   ├── LabEngine.js         # Lab orchestration, WebSocket client
│       │   ├── LabStateEngine.js    # State management functions
│       │   ├── NetworkSimulationEngine.js  # CLI + device simulation
│       │   ├── TroubleshootingEngine.js    # Fault injection scenarios
│       │   ├── WorkflowEngine.js    # Step progression logic
│       │   └── connectionManager.js # WebSocket connection
│       ├── features/                # Feature modules
│       │   ├── dashboard/
│       │   ├── globe/
│       │   ├── lab-workspace/
│       │   ├── labs/
│       │   ├── cli/
│       │   ├── network/
│       │   ├── simulator/
│       │   ├── quiz/
│       │   ├── security/
│       │   ├── music/
│       │   └── backgrounds/
│       ├── data/                    # Lab data layer
│       │   ├── LabModel.js          # Canonical lab schema definition
│       │   ├── labNormalizer.js     # Legacy → canonical lab converter
│       │   ├── labRegistry.js       # Lab loading/querying
│       │   ├── labs.procedural.json # Procedurally generated labs
│       │   ├── labs/                # Category-based lab JSON files
│       │   │   ├── index.json       # Category counts
│       │   │   ├── networking-fundamentals.json
│       │   │   ├── vlan.json
│       │   │   ├── ospf.json
│       │   │   └── ... (40+ category files)
│       │   └── reference-labs/      # Canonical reference labs
│       │       ├── lab-small-office-lan.json
│       │       ├── lab-vlans-sales-accounts.json
│       ├── core/                    # Core utilities
│       │   ├── constants/
│       │   ├── storage/
│       │   ├── types/
│       │   └── utils/
│       ├── hooks/                   # Custom React hooks
│       ├── services/                # API/service layer
│       └── simulation/              # Simulation layer
│           ├── packetTracer.js      # Packet simulation
│           └── verifiers.js         # Verification logic (root)
├── simulation/                      # Backend simulation
│   ├── verifiers.js                 # Backend verification logic
│   ├── packetTracer.js
│   ├── routers/                     # Router templates
│   └── templates/                   # Simulation templates
├── docs/                            # Documentation
├── deploy/                          # Deployment configs
├── image/                           # Image assets
├── song/                            # Song assets
├── package.json                     # Dependencies
├── start.bat                        # Windows startup script
├── vite.config.js                   # Root Vite config
├── AGENTS.md                        # Agent instructions
├── MENU.md                          # Menu documentation
├── PROJECT_CHECKPOINT.md            # Phase checkpoints
├── DEPLOY.md                        # Deployment guide
├── README.md                        # Project README
└── requirements.txt                 # Python requirements
```

---

## 3. Frontend Architecture

### Entry Point
- `main.jsx` → `App.jsx`
- `App.jsx` creates `AudioEngine` and `LabEngine` instances via refs
- Uses React.StrictMode

### Routing
- **No React Router**. Navigation is view-based via `view` state in `App.jsx`
- Views: `'lab'` (default), others show placeholder text
- `Nav.jsx` renders navigation buttons

### Major Pages/Views
1. **Lab Workspace** (`view === 'lab'`) - Main lab interface
2. **Dashboard** - NOC-style dashboard with globe
3. **Learning Roadmap** - Learning path view
4. **Engineer Mode** - Advanced mode
5. **Command Library** - CLI reference
6. **Progress** - User progress tracking

### Global State (Zustand - `labStore.js`)
```javascript
{
  currentLab: null,
  currentStep: null,
  labState: null,
  topology: { nodes: [], edges: [] },
  devices: Map()
}
```

### Local State (LabWorkspace.jsx — ~11 useState hooks after Phase 1.5E cleanup)
- `activePanel`, `labTime`, `paused`, `currentStepIdx`, `selectedDevice`
- `completedSteps`, `xpEarned`, `showHint`, `hintsUsed`
- `terminalOutput`, `terminalInput`, `activeTool`
- `packetProgress`, `packetDropped`
- `deviceStates`, `topologyNodes`, `topologyEdges`
- `verifying`, `lastVerifyResult`
- `troubleshootMode`, `tshootScenario`, etc.

### Hooks
- Custom hooks in `frontend/src/hooks/`
- Extensive use of `useCallback`, `useMemo`, `useRef` in LabWorkspace

### API Layer
- REST: `fetch('/api/labs')`, `fetch('/api/labs/:id')`
- WebSocket: Via `LabEngine.js` → `connectionManager.js`
- Backend serves static frontend from `dist/`

### WebSocket Layer
- `connectionManager.js` handles WebSocket connection
- `LabEngine.js` wraps WebSocket with promise-based API
- Message types: `lab:start`, `lab:step:verify`, `lab:hint`, `device:config`, `topology:connect`, etc.

### UI State
- `activePanel` in LabWorkspace: 'overview', 'config', 'interfaces', 'routing', 'security', 'logs', 'troubleshoot'
- `view` in App.jsx: 'lab' or other views

### Lab Workspace
- Grid layout: tools (180px) | center | inspector (280px)
- Bottom: terminal (200px)
- Top: header bar with lab info, progress, time, XP

### Dashboard
- NOC-style layout with globe visualization
- Left: navigation cabinet
- Right: system health, threat monitor, traffic stats
- Center: Three.js globe with network nodes

### Background System
- `BackgroundStudio.jsx` - Background customization
- CSS-based NOC background with grid pattern
- Multiple theme support

### Music/Audio System
- `AudioEngine.js` - Web Audio API based
- Procedural EDM tracks (5 tracks)
- UI sound effects (click, hover, correct, wrong, etc.)
- MP3 song loading support
- Channel-based audio mixing

### Topology Visualization
- `NetworkVisualization.jsx` - 2D Canvas based (NOT Three.js despite dependencies)
- Device nodes, connections, packet flow animation
- Theme support (cyber, green, red, purple, amber)
- Pan/zoom support

### Globe Visualization
- `GlobeVisualization.jsx` - Three.js based
- Shader-based globe surface with atmosphere
- Network nodes and arcs
- Data pulse animations

### Terminal/CLI UI
- `Terminal.jsx` - Basic terminal component
- `LabWorkspace.jsx` has integrated terminal with command history
- Supports show commands via NetworkSimulationEngine

### Verification UI
- Step verification in LabWorkspace
- Pass/fail feedback with hints
- XP rewards display

---

## 4. Backend Architecture

### Server Entry Point
- Refactored from single `backend/server.js` into modular structure (see Phase 2.1 below)
- All shared state moved to `backend/state/state.js` singleton
- Lab data loading in `backend/data/labLoader.js`
- Business logic in `backend/services/labService.js`
- WebSocket handling in `backend/websocket/`
- REST routes in `backend/routes/apiRoutes.js`
- All endpoints preserve exact same responses and status codes
- New modules load without circular dependencies

### Backend Modules (Post-Phase 2.1)
```
backend/
  state/state.js           # Singleton shared state (labs, devices, sessions, labCache, userLabState)
  data/labLoader.js        # Lab data loading from JSON files
  services/
    verificationService.js # Safe wrapper around simulation/verifiers.js
    labService.js          # Lab business logic (startLab, verifyStep, sendHint, pushConfig, etc.)
  websocket/
    connection.js          # WebSocket connection lifecycle
    messages.js            # Message routing to labService
  routes/apiRoutes.js      # REST API handlers
  server.js                # Entry point (wires components, preserves exports)
```

### API Routes
```
GET  /api/labs                    # List all labs
GET  /api/labs/:id               # Get lab by ID
POST /api/labs/:id/start         # Start a lab session
GET  /api/user/labs/:labId/state # Get saved lab state
POST /api/user/labs/:labId/state # Save lab state
GET  /api/user/progress          # Get user progress
```

### WebSocket Server
- `wss` on same port as HTTP
- Session-based: each connection gets UUID session ID
- Message types handled:
  - `lab:start` - Start lab
  - `lab:step:verify` - Verify step
  - `lab:hint` - Request hint
  - `device:config` - Push device config
  - `device:state` - Sync device state
  - `topology:connect` - Connect devices
  - `topology:disconnect` - Disconnect devices
  - `error:inject` - Inject error
  - `telemetry:subscribe` - Subscribe to telemetry

### Lab APIs
- Labs loaded from `labs.procedural.json` and `reference-labs/`
- Stored in `labs` Map (managed by state module)
- Session state in `labCache` (NodeCache with 1hr TTL)
- In-memory only, no persistence

### Session Handling
- WebSocket connection = session
- UUID-based session IDs
- `sessions` Map tracks active sessions
- Session contains: labId, deviceStates, timestamps

### Verification APIs
- Backend uses `simulation/verifiers.js`
- Types: `cli`, `config`, `topology`, `typing`, `option`
- Frontend also has local verification in `LabEngine.js` and `LabWorkspace.jsx`

### State Handling
- `labCache`: per-session lab state (NodeCache)
- `userLabState`: per-user lab state (Map)
- `devices`: global device registry (Map)
- All in-memory only, no database

### Telemetry
- No real telemetry system
- Simulated metrics in frontend only

### Persistence/Storage
- In-memory only
- Optional Redis (if installed)
- NodeCache for lab state with TTL

### Error Handling
- Try/catch in WebSocket message handler
- Error responses sent as `{ type: 'error', message: ... }`
- Standardized across REST and WebSocket

### Startup Logic
- Server seeds labs from files on startup
- Reference labs loaded from `frontend/src/data/reference-labs/`
- Procedural labs loaded from `frontend/src/data/labs.procedural.json`

### Environment/Configuration
- `PORT` env var (default 3000)
- Optional Redis at `redis://localhost:6379`
- Express JSON limit: 10mb

### Dependencies
- `express`, `ws`, `uuid`, `node-cache`, `yaml`
- Optional: `redis`

---

## 5. Engine Architecture

### LabEngine (`frontend/src/engine/LabEngine.js`)
**Responsibility**: Lab orchestration, WebSocket communication, step management
**State Ownership**: Lab state (labId, currentStep, completedSteps, score, topology)
**Consumers**: `App.jsx`
**Dependencies**: `ConnectionManager`, `LabStateEngine`

Key methods:
- `connect()` / `disconnect()` - WebSocket management
- `startLab(labId)` - Initialize lab session
- `verifyStep(stepId, payload)` - Verify step completion
- `sendHint(stepId, tier)` - Request hint
- `pushConfig(deviceId, config)` - Push device config
- `connectCable(from, to, cableType)` - Connect devices
- `resetLab()` - Reset lab state

### LabStateEngine (`frontend/src/engine/LabStateEngine.js`)
**Responsibility**: Pure state management functions for lab runtime state
**State Ownership**: Lab runtime state structure and transformations
**Consumers**: `LabEngine.js`, `LabWorkspace.jsx`

Key functions:
- `createLabRuntimeState()` - Create initial state
- `getDevice()`, `getInterface()`, `getConfiguration()`
- `updateDevice()`, `updateInterface()`, `updateConfiguration()`
- `addLog()`, `updateTelemetry()`, `pushHistory()`
- `resetLabState()`, `serializeState()`, `validateLabRuntimeState()`

### NetworkSimulationEngine (`frontend/src/engine/NetworkSimulationEngine.js`)
**Responsibility**: CLI simulation, device state management, show commands
**State Ownership**: Device states (interfaces, routing, ACL, NAT, DHCP, SSH, etc.)
**Consumers**: `LabWorkspace.jsx`, `TroubleshootingEngine.js`

Key methods:
- `createDevice()`, `removeDevice()`, `getDevice()`
- `processCommand()` - Process CLI commands
- `showRunningConfig()`, `showIpInterfaceBrief()`, `showIpRoute()`, etc.
- `simulatePing()`, `simulateTraceroute()`
- `assignDhcpLease()`, `translateNat()`

### TroubleshootingEngine (`frontend/src/engine/TroubleshootingEngine.js`)
**Responsibility**: Fault injection scenarios, packet tracing
**State Ownership**: Current scenario, packet flow, failure point
**Consumers**: `LabWorkspace.jsx`

Key features:
- 15 predefined fault scenarios
- `injectFault()` - Inject fault into simulation engine
- `tracePacket()` - Trace packet through network
- `checkFix()` - Check if fault is fixed
- `getHint()` - Progressive hints

### WorkflowEngine (`frontend/src/engine/WorkflowEngine.js`)
**Responsibility**: Step progression, workflow state management
**State Ownership**: Workflow session (step states, progress)
**Consumers**: Future integration (currently LabWorkspace manages steps independently)

Key functions:
- `createWorkflowSession()`, `startWorkflow()`, `resetWorkflow()`
- `advanceWorkflow()` - Progress to next step
- `useHint()` - Consume hint
- `getCurrentStep()`, `isStepLocked()`, `canVerify()`

### AudioEngine (`frontend/src/engine/AudioEngine.js`)
**Responsibility**: Procedural audio, music playback
**State Ownership**: Audio context, channels, sounds
**Consumers**: `App.jsx`, `BackgroundStudio.jsx`

Key features:
- Web Audio API based
- 5 procedural EDM tracks
- UI sound effects
- MP3 song loading
- Channel-based mixing

### ConnectionManager (`frontend/src/engine/connectionManager.js`)
**Responsibility**: WebSocket connection management
**State Ownership**: WebSocket connection, message queue
**Consumers**: `LabEngine.js`

---

## 6. Lab System Analysis

### Lab Count
- 40+ categories
- 300+ labs total
- `index.json` shows category counts (e.g., OSPF: 24, BGP: 17, RIP: 12)

### Lab Categories
- ICMP, Networking Fundamentals, Static Routing, Cabling, Switching, TCP/IP
- Subnetting, Network Design, Network Planning, SSH, Packet Analysis
- RIP, OSPF, EIGRP, BGP, VLAN, Trunking, Inter-VLAN Routing
- STP, DHCP, NAT, ACL, Port Security, Network Security
- Network Monitoring, Routing, Network Performance, VPN
- Network Services, IPv6, Wireless Networking, Data Center, WAN
- Automation, Troubleshooting, Default Routing, DNS, OSI Model
- Cisco, Ethernet, EtherChannel

### Difficulty Levels
- `basic`, `intermediate`, `advanced`, `expert`

### Lab Structure (Canonical Schema)
```javascript
{
  id, title, slug, category, difficulty, estimatedTime, version,
  realWorldScenario, engineerRole, problemStatement, businessImpact,
  objectives, learningObjectives, prerequisites, concepts, skills,
  commandsToLearn,
  topology: { devices, interfaces, connections },
  ipAddressing,
  initialState: { devices },
  steps: [{ stepId, title, instruction, commands, verification, hints, ... }],
  troubleshooting: { commonErrors },
  faultInjection: { faults },
  finalVerification: { checks, successCriteria },
  knowledgeCheck: [{ question, type, options, correctAnswer }],
  legacy, tags
}
```

### Lab Authorship
- **Mixed**: Procedurally generated (`labs.procedural.json`) + manually authored (`reference-labs/`)
- Legacy labs normalized via `labNormalizer.js`

### Verification Types
- `cli` - Command verification
- `config` - Configuration similarity (Levenshtein)
- `typing` - Text matching
- `option` - Selection matching
- `topology` - Device/connection matching
- `ping` / `traceroute` - Connectivity
- `state_check` - Device state verification

---

## 7. State Ownership Audit

### STATE → OWNER → FILE → READERS → MODIFIERS

| State | Owner | File | Readers | Modifiers |
|-------|-------|------|---------|-----------|
| Global lab/step | Zustand | `labStore.js` | App.jsx, Nav.jsx | App.jsx handlers |
| Lab runtime state | LabEngine | `LabEngine.js` | LabWorkspace, App.jsx | LabEngine methods |
| Device states | NetworkSimulationEngine | `NetworkSimulationEngine.js` | LabWorkspace, Terminal | LabWorkspace commands |
| Device states (duplicate) | LabWorkspace local | `LabWorkspace.jsx` | LabWorkspace renderers | LabWorkspace effects |
| Topology | LabWorkspace local | `LabWorkspace.jsx` | TopologyCanvas | LabWorkspace effects |
| Session state | Backend | `backend/state/state.js` | WebSocket handlers | WebSocket handlers |
| Lab cache | Backend | `backend/state/state.js` | WebSocket handlers | WebSocket handlers |
| Workflow state | WorkflowEngine | `WorkflowEngine.js` | None (not integrated) | WorkflowEngine functions |

### Duplicate/Conflicting State Issues
1. **Device state duplicated** across:
   - `NetworkSimulationEngine.devices` (engine)
   - `LabWorkspace.deviceStates` (local React state)
   - `LabEngine.state.runtime` (lab state)
2. **Topology state duplicated** across:
   - `LabEngine.state.topology`
   - `LabWorkspace.topologyNodes/Edges`
3. **No synchronization** between these stores

### State Types
- **Random/generated**: Globe nodes, telemetry metrics
- **Hardcoded**: Lab data in JSON files
- **Frontend-only**: UI state, local component state
- **Backend-only**: Session state, lab cache
- **Engine-owned**: Device simulation state

---

## 8. Verification Analysis

### Supported Verification Types
- `cli` - Command execution verification
- `config` - Configuration similarity (Levenshtein)
- `typing` - Text matching
- `option` - Selection matching
- `topology` - Device/connection matching
- `ping` - Connectivity check
- `traceroute` - Path tracing
- `state_check` - Device state verification

### Expected Values
- Defined in `lab.steps[].verification.expected`
- Types vary: string, array, object

### Actual State Obtained
- Frontend: `deviceStates` in LabWorkspace (from NetworkSimulationEngine)
- Backend: `labState` in labCache

### Verification Flow

#### Frontend (LabWorkspace.jsx)
```javascript
simulateVerification(vType, expected, payload, deviceStates, steps)
```
**NOTE**: Currently returns `passed: true` for most types! This is a placeholder.

#### Backend (simulation/verifiers.js)
```javascript
verifier[step.verification.type](payload, expected, labState)
```
Implements actual logic for: cli, config, topology, typing, option

#### Engine (LabEngine.js)
```javascript
_localVerify(stepId, payload)
```
Has verification logic but `_currentLabStep()` returns null!

### Mismatches
1. Lab data uses `verification.type: "state_check"` and `"ping"` but frontend verifier doesn't handle them
2. Lab data uses `step.hintTiers` but some labs have `hints` array
3. Backend verifier doesn't support `state_check` or `ping` types
4. Frontend `simulateVerification` is mostly placeholder

---

## 9. Startup Architecture

### start.bat
1. Check dependencies (`node_modules`)
2. Install if missing
3. Build frontend (`npm run build`)
4. Start dev server (`npm run dev`)

### npm Scripts
- `dev` - Run backend + frontend concurrently
- `backend` - `nodemon backend/server.js`
- `frontend` - `vite frontend`
- `build` - `vite build frontend`
- `start` - `node backend/server.js`
- `sim` - `node simulation/engine.js`

### Ports
- Frontend: 5173 (Vite default)
- Backend: 3000 (Express)

### Health Checks
- Backend: `GET /api/labs` returns 200
- Frontend: HTML loads, React mounts

### Browser Opening
- Manual: user opens `http://localhost:5173/`

### Process Cleanup
- No special cleanup, Ctrl+C stops both

### Environment Variables
- `PORT` for backend (default 3000)

### Dev vs Production
- Dev: Vite HMR, nodemon
- Production: Built frontend served by Express

---

## 10. Dependency Overview

### Frontend
- React 18.2.0
- @react-three/fiber 8.15.0 (Three.js renderer)
- @react-three/drei 9.88.0 (Three.js helpers)
- three 0.150.0 (3D library)
- zustand 4.5.0 (State management)
- vite 5.1.0 (Build tool)

### Backend
- express 4.18.2
- ws 8.16.0 (WebSocket)
- uuid 9.0.1
- node-cache 5.1.2
- yaml 2.3.4

### Dev Tools
- nodemon 3.0.2
- concurrently 8.2.2
- jest 29.7.0
- eslint 8.57.0

### Risks
- Large bundle chunks (>500kB) - mainly Three.js
- Three.js dependencies may not be fully utilized (2D Canvas used for topology)

---

## 11. Design Architecture

### Color System
- Primary: `#00e5ff` (cyan)
- Success: `#00ff88` (green)
- Warning: `#ffe600` (yellow)
- Error: `#ff3355` (red)
- Background: `#020711` (deep blue-black)
- Text: `#e6f7ff` (ice white)
- Muted: `#7fb8d4` (muted blue)

### Typography
- Sans: 'Segoe UI', 'Inter', system-ui
- Mono: 'Courier New', 'Consolas'

### Design Tokens
- CSS custom properties in `global.css`
- Consistent spacing, borders, shadows
- Glow effects for primary elements

### Panels
- NOC-style panel system
- Glassmorphism with `backdrop-filter`
- Grid-based layout

### Animations
- Pulse animation for active indicators
- Scanline overlay
- Globe rotation
- Packet flow animation
- Random metric fluctuations

### Responsive
- Breakpoints: 1024px, 768px
- Grid layout adapts

---

## 12. Known Issues

### P0 (Application-Breaking)
- **VERIFIED**: Frontend verification (`simulateVerification`) bypasses actual checks - returns `passed: true` for most types
- **VERIFIED**: `_currentLabStep()` in LabEngine.js returns null - breaks engine verification
- **VERIFIED**: Active LabWorkspace.jsx (`features/lab-workspace/`) is ~287 lines; legacy `components/LabWorkspace.jsx` is dead code (~1352 lines, not imported)

### P1 (Major Functionality)
- **VERIFIED**: Three separate device state stores with no synchronization
- **VERIFIED**: Backend verification doesn't support `state_check` or `ping` types used in labs
- **VERIFIED**: No real backend verification integration - frontend works standalone
- **VERIFIED**: WorkflowEngine exists but not integrated into LabWorkspace
- **VERIFIED**: Lab data has `hintTiers` but some labs have `hints` - inconsistency

### P2 (Important but Non-Blocking)
- **VERIFIED**: Large bundle sizes (>500kB) from Three.js
- **VERIFIED**: Topology uses 2D Canvas despite Three.js being a dependency
- **VERIFIED**: Random telemetry metrics in Dashboard (not real)
- **VERIFIED**: No persistence layer - all state lost on refresh
- **VERIFIED**: Redis optional but not configured

### P3 (Warning/Cleanup)
- **VERIFIED**: Vite CJS Node API deprecation warning
- **VERIFIED**: Many lab JSON files are large (some >400KB)
- **VERIFIED**: Inline styles throughout components (no CSS modules)
- **VERIFIED**: `console.log` statements in production code

---

## 13. Architectural Risks

1. **State Synchronization**: Three separate device state stores will cause bugs
2. **Verification Gap**: Frontend bypasses verification, backend not fully integrated
3. **Component Size**: Active `features/lab-workspace/LabWorkspace.jsx` is ~287 lines; legacy `components/LabWorkspace.jsx` is dead code (~1352 lines, not imported)
4. **Missing Integration**: WorkflowEngine exists but not used
5. **No Persistence**: In-memory only - data lost on refresh
6. **Bundle Size**: Three.js adds significant weight
7. **Lab Data Inconsistencies**: Mixed legacy/canonical formats
8. **WebSocket Reliability**: No reconnection logic beyond initial attempt

---

## 14. Four-Session Responsibility Boundaries

### SESSION 1: Frontend
- React components
- State management (Zustand)
- UI/UX implementation
- Client-side engines
- WebSocket client

### SESSION 2: Backend
- Express server
- WebSocket server
- API routes
- Session management
- Backend verification

### SESSION 3: Engines/Core Logic
- NetworkSimulationEngine
- LabStateEngine
- WorkflowEngine
- TroubleshootingEngine
- Lab data/normalization
- Verification logic

### SESSION 4: Design/UI/UX/Visual
- Styling system
- Component themes
- Animations
- 3D visualizations
- Background system
- Audio system

---

## 15. Important Files for Future Phases

1. `frontend/src/data/LabModel.js` - Canonical lab schema
2. `frontend/src/engine/NetworkSimulationEngine.js` - CLI simulation core
3. `frontend/src/engine/LabStateEngine.js` - State management
4. `simulation/verifiers.js` - Backend verification logic
5. `backend/server.js` - Backend entry point
6. `frontend/src/components/LabWorkspace.jsx` - Main workspace (needs refactoring)
7. `frontend/src/store/labStore.js` - Global state
8. `frontend/src/styles/global.css` - Design tokens
9. `frontend/src/data/labNormalizer.js` - Lab normalization
10. `frontend/src/engine/WorkflowEngine.js` - Workflow (needs integration)
11. `PROJECT_CHECKPOINT.md` - Phase tracking
12. `package.json` - Dependencies

---

*Last Updated: 2026-09-06*
*Phase: Context Initialization Complete*
