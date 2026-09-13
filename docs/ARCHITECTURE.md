# CyberNet Lab — Architecture Documentation

**Version:** 4.0.0  
**Date:** 2026-09-13  

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [WebSocket Communication](#5-websocket-communication)
6. [State Management](#6-state-management)
7. [Data Flow](#7-data-flow)
8. [Lab Execution Flow](#8-lab-execution-flow)
9. [Verification Architecture](#9-verification-architecture)
10. [Progress and Curriculum](#10-progress-and-curriculum)
11. [Security Architecture](#11-security-architecture)
12. [Performance Optimizations](#12-performance-optimizations)
13. [Deployment Architecture](#13-deployment-architecture)

---

## 1. System Overview

CyberNet Lab is a client-server web application for hands-on network engineering training.

```
┌─────────────┐       WebSocket / HTTP       ┌─────────────┐
│   Browser   │◄────────────────────────────►│   Backend   │
│  (React)    │                              │  (Express)  │
└─────────────┘                              └──────┬──────┘
                                                     │
                                                     │ Optional
                                         ┌──────────┴──────────┐
                                         │                     │
                                   ┌─────▼─────┐         ┌─────▼─────┐
                                   │  Redis    │         │PostgreSQL │
                                   │ (Session) │         │ (Persist) │
                                   └───────────┘         └───────────┘
```

**Key characteristics:**
- Frontend: React 18 + Vite, single-page application with view-based routing.
- Backend: Express 4 + WebSocket (ws), in-memory state with optional Redis/PostgreSQL persistence.
- Simulator: Browser-based NetworkSimulationEngine for deterministic CLI simulation.
- Communication: REST API for CRUD operations, WebSocket for real-time lab events.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    App.jsx (Shell)                     │  │
│  │  ┌─────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │  Nav    │  │   Main      │  │   Context Panel  │  │  │
│  │  │ (Side)  │  │  Workspace  │  │  (Evidence/Notes)│  │  │
│  │  └─────────┘  └─────────────┘  └──────────────────┘  │  │
│  │        ▲              ▲                                  │  │
│  │        │              │                                  │  │
│  │  ┌─────┴──────────────┴────────────────────────────┐  │  │
│  │  │              View Router (state-based)           │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                    │
│          ┌───────────────┼───────────────┐                   │
│          │               │               │                   │
│  ┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐           │
│  │   Lab        │ │  Dashboard  │ │  Learning   │           │
│  │  Workspace   │ │  (SOC/NOC)  │ │  Features   │           │
│  └──────────────┘ └─────────────┘ └─────────────┘           │
│                          │                                    │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │              NetworkSimulationEngine                   │   │
│  │  (Authoritative device state, CLI simulation)         │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
                    HTTP / WebSocket
                             │
┌────────────────────────────▼─────────────────────────────┐
│                      Backend (Node.js)                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                   Express Server                      │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │  REST API   │  │  WebSocket   │  │  Middleware  │ │ │
│  │  │  (apiRoutes)│  │  (messages)  │  │  (helmet,   │ │ │
│  │  │             │  │              │  │   cors,     │ │ │
│  │  │             │  │              │  │   rateLimit)│ │ │
│  │  └─────────────┘  └──────────────┘  └─────────────┘ │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                    Service Layer                       │ │
│  │  labService │ verificationService │ tickets │ ...     │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                   State Store                          │ │
│  │  labs │ labCache │ tickets │ learnerProgress │ ...     │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Backend Architecture

### 3.1 Server Initialization

```
server.js
  ├── loadLabs()                    # Load lab catalog from JSON
  ├── createExpressApp()
  │     ├── helmet()                # Security headers
  │     ├── cors()                  # CORS policy
  │     ├── express.json()          # Body parsing
  │     ├── globalIpLimiter()       # Global rate limit (60/min)
  │     └── mountRoutes()           # All API routes
  ├── createWebSocketServer()
  │     └── handleConnection()      # Per-connection session
  ├── createRedisClient()           # Optional
  ├── createPostgresClient()        # Optional
  ├── createDeviceManager()         # Device initialization
  ├── createLabEngine()             # Advanced engine
  ├── createTelemetryStream()       # Telemetry broadcasting
  ├── startTelemetryBroadcast()     # 1-second interval
  └── startSessionCleanup()         # 60-second interval
```

### 3.2 Service Layer

| Service | Responsibility | State Stores |
|---|---|---|
| `labService.js` | Lab start, verify, hint, config, cable, error inject | `labCache`, `sessions` |
| `verificationService.js` | Backend verification (cli, config, topology, ping, route, etc.) | `labCache` |
| `tickets.js` | Ticket CRUD, AES-256-CBC encryption, audit logging | `tickets` |
| `progressService.js` | Prerequisite graph, completion contract, lock enforcement | `learnerProgress`, `labs` |
| `learningService.js` | Roadmap, missions, retrieval, evidence, failures, interviews, research, portfolio, study planner, skill graph, debriefs, courses | Multiple Maps |
| `labQualityService.js` | Lab validation, quarantine status | `labs` |
| `rateLimiter.js` | Per-IP and per-lab rate limiting | In-memory counters |
| `labEngine.js` | Advanced lab engine (not in active workflow) | `labCache` |
| `telemetry.js` | Real-time telemetry broadcasting | `devices` |

### 3.3 State Stores

All state is stored in `backend/state/state.js` using `node-cache` (in-memory Maps):

```
labs           → Lab catalog (loaded from JSON, read-only)
devices        → Device registry (optional)
sessions       → Active WebSocket sessions
labCache       → Active lab session states
userLabState   → Saved learner lab progress
tickets        → Support tickets
learnerProgress→ Learner completion progress
dailyMissions  → Daily mission assignments
retrievalQueue → Spaced repetition questions
evidence       → Learning evidence records
failureLabs    → Injected failure states
troubleshootingSessions → Troubleshooting history
interviewQuestions → Interview question bank
researchExperiments → Research experiments
portfolioArtifacts → Portfolio items
studyPlanner   → Study plans and sessions
skillGraph     → Skill mastery graphs
debriefs       → Post-lab debriefs
courses        → Course definitions
courseEnrollments → Learner enrollments
```

---

## 4. Frontend Architecture

### 4.1 View Routing

`App.jsx` uses a simple state-based router. The `view` state determines which component renders in the main workspace:

```javascript
const [view, setView] = useState('lab');
```

Views:
- `lab` → LabExplorerView / LabDetailView / LabWorkspace
- `dashboard` → Dashboard (lazy-loaded)
- `engineer` → EngineerMode
- `progress` → ProgressMatrix
- `security` → SecurityCenter
- `analytics` → AnalyticsView
- `settings` → SettingsView
- `commands` → CommandLibrary
- `tickets` → TicketManager
- `roadmap` → LearningRoadmap
- `practice` → PracticeView
- `quiz` → QuizView
- `course` → CourseMode
- `games` → GamesView
- `daily-mission` → DailyMission
- `retrieval` → RetrievalCenter
- `evidence` → EvidencePanel
- `failure-lab` → FailureLab
- `troubleshooting` → TroubleshootingCoach
- `interview` → InterviewRoom
- `research` → ResearchLab
- `portfolio` → Portfolio
- `planner` → StudyPlanner
- `skill-graph` → SkillGraph
- `debrief` → Debrief

### 4.2 Data Flow

```
┌──────────────┐     ┌─────────────────┐     ┌───────────────┐
│   Browser    │────▶│  API / WebSocket│────▶│   Backend     │
│  Component   │◀────│  Service Layer  │◀────│   Service     │
└──────────────┘     └─────────────────┘     └───────────────┘
        ▲                       │                       │
        │               ┌───────▼────────┐              │
        │               │ progressEngine │              │
        │               │ (Frontend)     │              │
        │               └───────────────┘              │
        │                       │                       │
        │               ┌───────▼────────┐              │
        │               │ Storage Layer  │              │
        │               │ (localStorage) │              │
        │               └───────────────┘              │
        ▼                                               ▼
┌──────────────┐                              ┌───────────────┐
│  Component   │                              │  State Store  │
│   State      │                              │  (Maps)       │
│ (useState)   │                              │               │
└──────────────┘                              └───────────────┘
```

### 4.3 Storage Layer

Frontend uses a storage abstraction in `frontend/src/core/storage/`:
- Wraps `localStorage` with namespaced keys.
- Provides typed getters/setters for each domain.
- Examples: `progressStorage`, `evidenceStorage`, `themeStorage`, `backgroundStorage`.

### 4.4 Code Splitting

Heavy components are lazy-loaded with `React.lazy` + `Suspense`:
- `Dashboard` — SOC/NOC command center
- `LabWorkspace` — Main lab environment
- `GlobeVisualization` — Three.js globe

Background renderers in `BackgroundStudio.jsx` are also lazy-loaded individually to reduce initial bundle size.

---

## 5. WebSocket Communication

### 5.1 Connection Lifecycle

```
Client                          Server
  |                                |
  |─── WebSocket connect ─────────>|
  |<── { type: "session", id } ----|
  |                                |
  |─── { type: "lab:start" } ----->|
  |<── { type: "lab:started" } ----|
  |                                |
  |<── telemetry broadcast (1s) ---|
  |                                |
  |─── close/disconnect ---------->|
  |<── session cleanup -------------|
```

### 5.2 Message Schema

All messages are JSON with a `type` field:

```typescript
interface WSMessage {
  type: string;
  [key: string]: any;
}
```

### 5.3 Supported Messages

| Client → Server | Purpose |
|---|---|
| `lab:start` | Start a new lab session |
| `lab:step:verify` | Verify a step completion |
| `lab:hint` | Request a hint for a step |
| `device:config` | Push device configuration |
| `device:state` | Sync client-side device state |
| `topology:connect` | Connect two devices with a cable |
| `topology:disconnect` | Disconnect a cable |
| `error:inject` | Inject a fault into the lab |
| `telemetry:subscribe` | Subscribe to device telemetry |

| Server → Client | Purpose |
|---|---|
| `session` | Connection established, assigns session ID |
| `lab:started` | Lab session initialized |
| `step:passed` | Step verification succeeded |
| `step:failed` | Step verification failed |
| `hint` | Hint text for a step |
| `device:updated` | Device configuration updated |
| `device:state:synced` | Device state synced |
| `topology:update` | Topology changed |
| `error:injected` | Fault injected |
| `telemetry:subscribed` | Telemetry subscription confirmed |
| `error` | Error response |

---

## 6. State Management

### 6.1 Frontend State

Frontend state is managed through a combination of:
- **Local component state:** `useState` for UI-specific data.
- **App-level state:** `App.jsx` holds shared state (current lab, progress, theme, settings).
- **Custom hooks:** `useLabSimulation`, `useLabTopology`, `useLabVerification`, `useLabTerminal`, `useLabTroubleshooting`, `useLabTimer`.
- **Storage layer:** `localStorage` for persistence across sessions.

### 6.2 Backend State

Backend state is in-memory by default, stored in Maps:

```javascript
const state = {
  labs: new Map(),           // Lab catalog
  sessions: new Map(),       // WebSocket sessions
  labCache: new Map(),       // Active lab states
  userLabState: new Map(),   // Saved progress
  tickets: new Map(),        // Support tickets
  learnerProgress: new Map(),// Learner progress
  // ... 14 more Maps
};
```

### 6.3 State Ownership Rules

| State | Owner | Rationale |
|---|---|---|
| Device state during active lab | `NetworkSimulationEngine.devices` (frontend) | Authoritative for practical learner workflow |
| Lab session state | `labCache` (backend) | Shared across WebSocket connections |
| Learner progress | `learnerProgress` (backend) | Backend-authoritative for lock enforcement |
| UI preferences | `localStorage` (frontend) | Fast, no network round-trip |
| Ticket data | `tickets` (backend) | Security: encrypted at rest, audit logged |

---

## 7. Data Flow

### 7.1 Lab Start Flow

```
User clicks "Launch Workspace"
        │
        ▼
App.jsx: setCurrentLab(lab), setLabWorkspaceMode(true)
        │
        ▼
LabWorkspace mounts
        │
        ├── createWorkflowSession(lab.id, steps)
        ├── startWorkflow(session, steps)
        ├── new LabEngine(null).startLab(lab.id, lab)
        │     └── WebSocket: lab:start
        │           └── Backend: labService.startLab()
        │                 └── labCache.set(sessionId, labState)
        │                       └── Returns lab:started
        └── buildInitialDeviceStates(devices, lab)
              └── setCanonicalDeviceStates(map)
```

### 7.2 Command Execution Flow

```
User types "ipconfig 192.168.1.10 255.255.255.0"
        │
        ▼
useLabTerminal.handleSendCommand()
        │
        ▼
NetworkSimulationEngine.processCommand(deviceId, command)
        │
        ├── Match command handler
        ├── Update device state (interfaces)
        ├── Emit "device:stateChanged"
        │     └── syncDeviceStates → canonicalDeviceStates
        │           └── setCanonicalDeviceStates(next)
        │                 └── Triggers re-render in:
        │                       ├── useLabTerminal (output)
        │                       ├── useLabTopology (visual)
        │                       └── useLabVerification (check)
        └── Return command output
```

### 7.3 Step Verification Flow

```
User clicks "Verify"
        │
        ▼
useLabVerification.handleVerify()
        │
        ├── Frontend verification (fast path)
        │     └── Reads canonicalDeviceStates
        │           └── Returns passed/failed
        │
        └── Backend verification (WebSocket)
              └── lab:step:verify
                    └── labService.verifyStep()
                          └── verificationService.runVerification()
                                ├── CLI check
                                ├── Config check
                                ├── Topology check
                                └── Returns result
                                      ├── step:passed → advanceWorkflow
                                      └── step:failed → show feedback
```

---

## 8. Lab Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Lab Lifecycle                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SELECT LAB                                                │
│     LabExplorerView → LabDetailView                          │
│                                                              │
│  2. LAUNCH WORKSPACE                                          │
│     LabWorkspace mounts                                      │
│     ├── WorkflowEngine: createSession, startWorkflow         │
│     ├── LabEngine: startLab()                                │
│     └── Build device states from lab.initialState            │
│                                                              │
│  3. INTERACT                                                  │
│     ├── Terminal: processCommand() → NetworkSimulationEngine │
│     ├── Topology: connect/disconnect cables                  │
│     └── Inspector: view/configure device settings            │
│                                                              │
│  4. VERIFY STEPS                                              │
│     ├── Frontend verification (immediate feedback)           │
│     └── Backend verification (WebSocket, authoritative)      │
│                                                              │
│  5. COMPLETE                                                  │
│     ├── All steps passed                                     │
│     ├── Debrief completed                                    │
│     ├── progressEngine.completeLab(learnerId, labId, contract)│
│     └── Backend validates completion contract                │
│                                                              │
│  6. RESET (optional)                                          │
│     ├── Clear canonicalDeviceStates                          │
│     ├── Reset workflow session                               │
│     └── Rebuild from initialState                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Verification Architecture

### 9.1 Verification Types

| Type | Description | Example |
|---|---|---|
| `cli` | Command output matches expected text | `show ip interface brief` contains `192.168.1.1` |
| `config` | Device configuration contains required lines | `interface Gig0/1` → `no shutdown` |
| `topology` | Cables connected between specified devices | PC1 ↔ SW1 |
| `typing` | User typed a specific command | `ipconfig 192.168.1.10 255.255.255.0` |
| `option` | Multiple-choice selection | Select correct VLAN ID |
| `state_check` | Device state matches expected (backend) | Interface status is `up` |
| `ping` | Connectivity test (backend) | Ping succeeds |

### 9.2 Verification Layers

```
┌─────────────────────────────────────────┐
│           Frontend Layer                │
│  useLabVerification.js                  │
│  ├── Reads canonicalDeviceStates        │
│  ├── Fast feedback (< 50ms)             │
│  └── Supports: cli, config, topology    │
└─────────────────────────────────────────┘
                    │
                    │ WebSocket
                    ▼
┌─────────────────────────────────────────┐
│           Backend Layer                 │
│  verificationService.js                  │
│  ├── Reads labCache (authoritative)     │
│  ├── Supports: cli, config, topology,   │
│  │   typing, option, state_check, ping, │
│  │   route, ospf, eigrp, bgp           │
│  └── Returns result with xp, feedback   │
└─────────────────────────────────────────┘
```

---

## 10. Progress and Curriculum

### 10.1 Prerequisite Graph

```
 learnerProgress
        │
        ▼
 progressService.getLabStatus(learnerId, labId)
        │
        ├── Check completedLabs[]
        ├── Check prerequisites[] for labId
        │     └── All prerequisites in completedLabs?
        │           ├── YES → available / in_progress / complete
        │           └── NO  → locked
        │
        └── Return status: complete | in_progress | available | locked
```

### 10.2 Completion Contract

A lab is only complete when all contract fields are true:
- `theoryComplete`
- `predictionComplete`
- `actionsComplete`
- `verificationPassed`
- `troubleshootingComplete`
- `debriefComplete`

Backend validates the contract in `progressService.validateCompletionContract()`.

---

## 11. Security Architecture

### 11.1 Security Measures

| Layer | Mechanism |
|---|---|
| HTTP | Helmet.js security headers |
| CORS | Origin whitelist (localhost only) |
| Rate Limiting | Global: 60 req/min per IP; Per-lab: 3 starts/min |
| Data at Rest | AES-256-CBC encryption for ticket fields |
| Audit Logging | All ticket CRUD logged to `backend/logs/ticket-audit.log` |
| Input Validation | Request body validation in route handlers |
| Session Management | UUID session IDs, 5-minute inactivity timeout |

### 11.2 Encryption

Sensitive ticket fields are encrypted using AES-256-CBC:
- `description`
- `reportedBy`
- `remediation`
- `evidence[].data`

Key derivation: `SHA256(JWT_SECRET || 'cybernet-lab-default')`

---

## 12. Performance Optimizations

### 12.1 Background Studio

- **Code Splitting:** Each of the 20 background renderers is lazy-loaded via `React.lazy` + `Suspense`.
- **Single rAF Loop:** `AnimationLoop` coordinator runs one `requestAnimationFrame` loop shared across all active renderers.
- **Pause When Hidden:** Uses `document.visibilityState` to pause animations when the tab is not visible.
- **Adaptive Particle Count:** Scales particle count (25–100%) based on `navigator.hardwareConcurrency`, `navigator.deviceMemory`, and touch support.

### 12.2 Three.js Globe

- Lazy-loaded with `React.lazy`.
- Paused when tab is hidden.
- Reduced motion mode disables animations.

### 12.3 Frontend Bundle

- Initial bundle: ~150KB (down from ~2.1MB with all renderers).
- Full bundle with all features: ~800 modules.

---

## 13. Deployment Architecture

### 13.1 Development

```
npm run dev
  ├── npm run backend  (nodemon, port 3000)
  └── npm run frontend (vite, port 5173)
```

### 13.2 Production

```
npm start
  └── node backend/server.js
        ├── Serves frontend/dist/ statically
        ├── Express HTTP on PORT (default 3000)
        ├── WebSocket on same port
        └── Optional: gRPC on GRPC_PORT (default 50051)
```

### 13.3 Docker

```
docker-compose up
  ├── backend container (Express + WebSocket)
  ├── frontend container (Nginx serving dist/)
  └── Optional: redis, postgres
```

### 13.4 Kubernetes

```
kubectl apply -f k8s/
  ├── Deployment (backend)
  ├── Service (LoadBalancer)
  └── ConfigMap (environment variables)
```

---

## 14. Component Reference

### 14.1 Core Components

| Component | Path | Purpose |
|---|---|---|
| `App` | `frontend/src/App.jsx` | Root shell, view routing, global state |
| `Header` | `frontend/src/components/Header.jsx` | Navigation bar, sound, language |
| `Nav` | `frontend/src/components/Nav.jsx` | Sidebar navigation |
| `ContextPanel` | `frontend/src/components/ContextPanel.jsx` | Evidence, progress, hints, notes |
| `BackgroundStudio` | `frontend/src/features/backgrounds/BackgroundStudio.jsx` | 20 background renderers |
| `MusicPlayer` | `frontend/src/features/music/MusicPlayer.jsx` | Ambient music controls |

### 14.2 Lab Components

| Component | Path | Purpose |
|---|---|---|
| `LabExplorerView` | `frontend/src/app/views/LabExplorerView.jsx` | Lab catalog with search/filter |
| `LabDetailView` | `frontend/src/app/views/LabDetailView.jsx` | Lab objectives, steps, prerequisites |
| `LabWorkspace` | `frontend/src/features/lab-workspace/LabWorkspace.jsx` | Interactive lab environment |
| `CliTerminal` | `frontend/src/features/cli/CliTerminal.jsx` | Command-line terminal |
| `LabTopology` | `frontend/src/features/lab-workspace/LabTopology.jsx` | Visual network topology |
| `WorkspaceStepPanel` | `frontend/src/features/lab-workspace/components/WorkspaceStepPanel.jsx` | Step objectives and verification |
| `WorkspaceToolbar` | `frontend/src/features/lab-workspace/components/WorkspaceToolbar.jsx` | Lab tools and actions |
| `WorkspaceInspector` | `frontend/src/features/lab-workspace/components/WorkspaceInspector.jsx` | Device details and config |

### 14.3 Learning Components

| Component | Path | Purpose |
|---|---|---|
| `Dashboard` | `frontend/src/features/dashboard/Dashboard.jsx` | NOC/SOC command center |
| `EngineerMode` | `frontend/src/components/EngineerMode.jsx` | Ticket workflow |
| `TicketManager` | `frontend/src/components/TicketManager.jsx` | Ticket CRUD UI |
| `StudyPlanner` | `frontend/src/components/StudyPlanner.jsx` | Structured study sessions |
| `RetrievalCenter` | `frontend/src/components/RetrievalCenter.jsx` | Spaced repetition |
| `TroubleshootingCoach` | `frontend/src/components/TroubleshootingCoach.jsx` | 5-phase reasoning guide |
| `InterviewRoom` | `frontend/src/components/InterviewRoom.jsx` | Progressive interview prep |
| `ResearchLab` | `frontend/src/components/ResearchLab.jsx` | Scientific method cycle |
| `Portfolio` | `frontend/src/components/Portfolio.jsx` | Engineering artifacts |
| `EvidencePanel` | `frontend/src/components/EvidencePanel.jsx` | Verification records |
| `FailureLab` | `frontend/src/components/FailureLab.jsx` | Fault injection |
| `SkillGraph` | `frontend/src/components/SkillGraph.jsx` | Skill mastery visualization |
| `Debrief` | `frontend/src/components/Debrief.jsx` | Post-lab reflection |
| `CourseMode` | `frontend/src/components/CourseMode.jsx` | Course enrollment and progress |
| `DailyMission` | `frontend/src/components/DailyMission.jsx` | Daily lab assignment |
| `LearningRoadmap` | `frontend/src/components/LearningRoadmap.jsx` | 6-stage roadmap |
| `ProgressMatrix` | `frontend/src/App.jsx` | Skill matrix view |
| `AnalyticsView` | `frontend/src/App.jsx` | Learning analytics |
| `SecurityCenter` | `frontend/src/App.jsx` | SOC defensive operations |

---

## 15. Directory Structure

```
cybernet-lab/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── apiRoutes.js
│   ├── services/
│   │   ├── labService.js
│   │   ├── verificationService.js
│   │   ├── tickets.js
│   │   ├── progressService.js
│   │   ├── learningService.js
│   │   ├── labQualityService.js
│   │   ├── rateLimiter.js
│   │   ├── labEngine.js
│   │   ├── telemetry.js
│   │   ├── redis.js
│   │   ├── postgres.js
│   │   └── grpc.js
│   ├── state/
│   │   └── state.js
│   ├── websocket/
│   │   ├── connection.js
│   │   └── messages.js
│   ├── tests/
│   └── logs/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── engine/
│   │   │   ├── NetworkSimulationEngine.js
│   │   │   ├── LabEngine.js
│   │   │   └── LabRuntimeState.js
│   │   ├── features/
│   │   │   ├── lab-workspace/
│   │   │   ├── dashboard/
│   │   │   ├── globe/
│   │   │   ├── backgrounds/
│   │   │   ├── music/
│   │   │   ├── quiz/
│   │   │   └── cli/
│   │   ├── components/
│   │   ├── app/views/
│   │   ├── data/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── core/
│   │   └── context/
│   └── dist/
├── simulation/
│   ├── verifiers.js
│   └── packetTracer.js
├── docs/
│   ├── IMPLEMENTATION_PHASES.md
│   ├── LAB_REMEDIATION_PLAN.md
│   ├── QUICKSTART.md
│   ├── RELEASE_READINESS.md
│   └── research/
├── build.mjs
├── package.json
└── jest.config.js
```

---

*This architecture documentation is accurate for CyberNet Lab v4.0.0.*
