# CyberNet Lab

High-fidelity autonomous networking virtual laboratory. 249 labs across 40+ categories with a stateful Cisco IOS-style CLI, real-time verification, and a NOC/SOC control-room interface.

**Project path:** `C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab`

## Prerequisites

- Node.js 18+
- npm 8+
- Modern browser with WebGL 2.0 support
- Windows/macOS/Linux

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start backend (Express + WebSocket, port 3000)
npm run backend

# 3. In another terminal, start frontend (Vite, port 5173)
npm run frontend

# 4. Open browser
http://localhost:5173
```

**Windows users:** You can also run `start.bat` from the repository root to install dependencies, build, and start both servers.

## npm Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start backend + frontend concurrently |
| `npm run backend` | Start Express backend only |
| `npm run frontend` | Start Vite dev server only |
| `npm run build` | Build frontend for production |
| `npm run start` | Start production backend (serves `dist/`) |
| `npm test` | Run Jest tests |
| `npm run package` | Package for deployment |

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Backend HTTP/WebSocket port |
| `REDIS_URL` | _unset_ | Optional Redis cache URL (falls back to in-memory NodeCache) |

## Project Structure

```
cybernet-lab/
├── frontend/                    # React + Vite frontend (actual source root)
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Root shell with view routing
│       ├── styles/global.css    # Design tokens & NOC theme
│       ├── components/          # Legacy/dead UI components (not imported by active build)
│       │   ├── LabWorkspace.jsx  # Legacy lab workspace (~1352 lines, dead)
│       │   ├── Terminal.jsx      # Legacy terminal (dead)
│       │   ├── Dashboard.jsx     # Legacy dashboard (dead)
│       │   ├── NetworkVisualization.jsx  # Legacy visualization (dead)
│       │   ├── BackgroundStudio.jsx  # Legacy background studio (dead)
│       │   ├── MusicPlayer.jsx   # Legacy music player (dead)
│       │   ├── Header.jsx        # Header
│       │   ├── Nav.jsx           # Navigation
│       │   ├── Inspector.jsx     # Device inspector panel
│       │   ├── StepPanel.jsx     # Step instructions panel
│       │   ├── ToolCabinet.jsx   # Tool selection
│       │   ├── Workbench.jsx     # Main workbench area
│       │   ├── FocusMode.jsx     # Distraction-free mode
│       │   ├── EngineerMode.jsx  # Quick task launcher
│       │   ├── LearningRoadmap.jsx
│       │   ├── CommandLibrary.jsx
│       │   ├── LabStepViewer.jsx
│       │   ├── ErrorBoundary.jsx
│       │   └── *.css             # Component styles
│       ├── engine/              # Core engines
│       │   ├── LabEngine.js      # WebSocket lab orchestration (uses ConnectionManager)
│       │   ├── connectionManager.js  # WebSocket connection management with reconnection & local mode
│       │   ├── NetworkSimulationEngine.js
│       │   ├── LabStateEngine.js
│       │   ├── LabRuntimeState.js
│       │   ├── WorkflowEngine.js
│       │   └── TroubleshootingEngine.js
│       ├── features/            # Feature modules
│       │   ├── lab-workspace/   # LabWorkspace feature (ACTIVE, ~287 lines)
│       │   │   ├── LabWorkspace.jsx
│       │   │   ├── LabWorkspaceComponents.jsx
│       │   │   ├── labParsers.js
│       │   │   ├── useLabSimulation.js
│       │   │   ├── useLabTerminal.js
│       │   │   ├── useLabTopology.js
│       │   │   ├── useLabVerification.js
│       │   │   ├── useLabTroubleshooting.js
│       │   │   ├── useLabTimer.js
│       │   │   └── __tests__/
│       │   ├── dashboard/       # Dashboard feature
│       │   ├── cli/             # CLI command handlers
│       │   ├── globe/           # 3D globe visualization
│       │   ├── backgrounds/     # 20 background themes
│       │   ├── music/           # Audio feature
│       │   └── simulator/       # Network simulation state
│       │       ├── index.js
│       │       ├── verificationEngine.js
│       │       └── troubleshootingEngine.js
│       ├── core/                 # Shared utilities
│       │   ├── storage/          # localStorage helpers
│       │   ├── constants/        # App constants
│       │   ├── utils/            # Utility functions
│       │   └── types/            # Type definitions
│       ├── app/                  # App views
│       │   └── views/
│       │       ├── LabExplorerView.jsx
│       │       └── LabDetailView.jsx
│       ├── data/                 # Lab data
│       │   ├── labs.procedural.json  # 247 labs (152K lines)
│       │   ├── labRegistry.js   # Lab registration
│       │   ├── LabModel.js      # Canonical lab schema
│       │   ├── labNormalizer.js # Legacy → canonical converter
│       │   └── labs/            # Category-specific labs
│       │       ├── index.json
│       │       └── *.json
│       ├── store/                # State management
│       │   └── labStore.js       # Zustand store
│       └── jest.config.js        # Frontend Jest config
├── backend/                     # Express + WebSocket backend
│   ├── server.js                # Entry point
│   ├── state/state.js           # Shared state singleton
│   ├── data/labLoader.js        # Lab data loading
│   ├── services/                # Business logic
│   │   ├── labService.js
│   │   ├── verificationService.js
│   │   └── labQualityService.js
│   ├── routes/apiRoutes.js      # REST API handlers
│   └── websocket/               # WebSocket handling
│       ├── connection.js
│       └── messages.js
├── simulation/                  # Backend verification logic
│   ├── verifiers.js
│   └── packetTracer.js
├── docs/                        # Developer documentation
├── deploy/                      # Deployment configs
├── package.json
├── vite.config.js               # Root Vite config (legacy, use frontend/)
├── start.bat                    # Windows startup script
├── .env.example                 # Environment variables template
├── MENU.md                      # Architecture map
├── PROJECT_CHECKPOINT.md        # Phase history
└── PROJECT_CONTEXT.md           # Project knowledge
```

> **Note:** A few legacy files exist at the repository root (`App.jsx`, `main.jsx`, `Dashboard.jsx`, etc.). They are not used by the current build. The actual source lives in `frontend/src/`.

## Architecture

### Frontend
- React 18 + Vite
- Zustand for global state
- Feature-based organization under `frontend/src/features/`
- Custom hooks for simulation, topology, verification, terminal

### Backend
- Express REST API + WebSocket on the same port
- In-memory session state via NodeCache
- Modular service layer (`services/`, `routes/`, `websocket/`)

### Engines
- `LabEngine` — WebSocket lab orchestration (backend path; NOT connected to the active practical learner workflow in `features/lab-workspace/`)
- `NetworkSimulationEngine` — CLI simulation + device state (authoritative source for practical learner lab execution)
- `LabStateEngine` — Pure state management functions for canonical runtime state
- `LabRuntimeState` — Immutable runtime state schema and helpers
- `WorkflowEngine` — Step progression & verification gate (exists but not integrated into LabWorkspace)
- `TroubleshootingEngine` — Fault injection scenarios
- `SimulationRuntimeBridge` — Controlled bridge between NetworkSimulationEngine and LabRuntimeState

### State Ownership
- **Practical learner device state**: `NetworkSimulationEngine.devices` (authoritative for REF-001 and active lab execution)
- **LabWorkspace local state**: `canonicalDeviceStates` synced from NetworkSimulationEngine via `useLabSimulation`
- **Canonical runtime state**: `LabRuntimeState` (via `LabStateEngine` helpers) — used by `SimulationRuntimeBridge` and `LabEngine`, but NOT the active practical learner path
- **Backend session state**: `backend/state/state.js` (`labCache`)
- **Global UI state**: Zustand `labStore.js`

### Practical Learner Workflow (REF-001)
The active runtime path for practical labs is:
```
LabWorkspace → useLabSimulation → NetworkSimulationEngine
                                    ↓
                          device:stateChanged event
                                    ↓
                          syncDeviceStates → canonicalDeviceStates
                                    ↓
                    useLabTerminal / useLabTopology / useLabVerification
```
`LabEngine` and `SimulationRuntimeBridge` are validated by unit tests but are NOT wired into the active practical learner workflow.

### Verification
- Frontend verification (`useLabVerification`) reads from `canonicalDeviceStates`
- Backend verification (`simulation/verifiers.js`) supports: `cli`, `config`, `topology`, `typing`, `option`
- Backend does NOT currently support: `state_check`, `ping`
- Frontend `verifyPing` is a placeholder that returns success without actual connectivity checks

## REST API

```
GET  /api/labs                    # List all labs
GET  /api/labs/:id               # Get lab by ID
POST /api/labs/:id/start         # Start lab session
GET  /api/labs/:id/active-session/:sessionId
POST /api/labs/:id/reset-session/:sessionId
GET  /api/user/labs/:labId/state # Get saved lab state
POST /api/user/labs/:labId/state # Save lab state
GET  /api/user/progress          # Get user progress
```

## WebSocket Messages

```
lab:start             → lab:started
lab:step:verify       → step:passed | step:failed
lab:hint              → hint
device:config         → device:updated
device:state          → device:state:synced
topology:connect      → topology:update
topology:disconnect    → topology:update
error:inject          → error:injected
telemetry:subscribe    → telemetry:subscribed
```

## Testing

```bash
# Run all tests
npm test

# Run frontend tests only
npm test -- --testPathPattern="frontend/src"

# Run backend tests only
npm test -- --testPathPattern="backend/tests"

# Run specific test file
npm test -- frontend/src/engine/LabRuntimeState.test.js
```

### Test Suites

| Suite | Location | Scope |
|-------|----------|-------|
| `LabRuntimeState.test.js` | `frontend/src/engine/` | Canonical runtime state creation, events, reset, serialization |
| `SimulationRuntimeBridge.test.js` | `frontend/src/engine/` | NSE → LabRuntimeState bridge |
| `ref001-runtime.test.js` | `frontend/src/features/lab-workspace/__tests__/` | REF-001 end-to-end runtime path |
| `labQualityService.test.js` | `backend/tests/` | Quality gate unit tests |
| `labApiQualityGate.test.js` | `backend/tests/` | API quality gate integration tests |

## Build

```bash
# Production build (outputs to frontend/dist/)
npm run build
```

## Troubleshooting

**Port 3000 already in use**
```bash
# Set a different port
set PORT=3001 && npm run backend
```

**Port 5173 already in use**
```bash
# Vite will prompt to use another port automatically, or:
npx vite --port 5174 frontend
```

**Build fails with module errors**
```bash
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

**Frontend stuck on "Loading CyberNet Lab v4.0..."**
- Check that backend is running on port 3000
- Check browser console for JavaScript errors
- Ensure no syntax errors in `frontend/src/engine/`

## Adding a New Lab

1. Use `frontend/src/data/reference-labs/` as a template
2. Follow the canonical schema in `frontend/src/data/LabModel.js`
3. Register via `frontend/src/data/labRegistry.js`
4. Validate with `npm run build`

## Development Rules

- Preserve canonical state ownership boundaries
- Do not introduce duplicate engines or state stores
- Frontend must not implement simulator rules in UI components
- Test before claiming completion
- Build must pass after every change
- Update `MENU.md` if architecture changes

## License

Proprietary — CyberNet Lab
