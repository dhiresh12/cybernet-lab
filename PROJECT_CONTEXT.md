# CyberNet Lab — Project Context

**Project:** CyberNet Lab v4.0.0  
**Path:** `C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab`  
**Date:** 2026-09-13  
**Status:** ACTIVE DEVELOPMENT  

---

## 1. Project Identity

- **Name:** cybernet-lab
- **Version:** 4.0.0
- **Main Entry:** `backend/server.js`
- **Frontend Root:** `frontend/src/`
- **Package Manager:** npm
- **Test Framework:** Jest
- **Build Tool:** Vite + custom `build.mjs`
- **Runtime:** Node.js + Express (backend), Vite dev server (frontend)

---

## 2. Active Practical Learner Workflow (REF-001)

```
LabWorkspace
  → useLabSimulation
    → NetworkSimulationEngine (authoritative device state)
      → processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0')
      → device:stateChanged event
        → syncDeviceStates → canonicalDeviceStates
          → useLabTerminal / useLabTopology / useLabVerification
```

**Status:** Validated end-to-end. All 367 tests pass. Build verified.

---

## 3. State Ownership

| State | Owner | Used By |
|---|---|---|
| Practical learner device state | `NetworkSimulationEngine.devices` | LabWorkspace, terminal, topology, verification |
| LabWorkspace local state | `canonicalDeviceStates` | useLabTerminal, useLabTopology, useLabVerification |
| Canonical runtime state | `LabRuntimeState` via `LabStateEngine` | SimulationRuntimeBridge, LabEngine (unit tests) |
| Backend session state | `backend/state/state.js` (`labCache`) | REST API, WebSocket handlers |
| Global UI state | Zustand `labStore.js` | Defined but not actively imported |
| Learner progress | `backend/services/progressService.js` | Progress engine, prerequisite graph, lock enforcement |
| Learning data (missions, retrieval, evidence, failures, interviews, research, portfolio, study planner, skill graph, debriefs, courses) | `backend/state/state.js` Maps | `learningService.js`, REST API |

---

## 4. Verification Architecture

| Layer | Location | Status |
|---|---|---|
| Frontend CLI verification | `features/lab-workspace/useLabVerification.js` | Active, reads canonicalDeviceStates |
| Frontend ping verification | `features/simulator/verificationEngine.js` | Placeholder — returns success without actual connectivity check |
| Backend verification | `simulation/verifiers.js` | Supports: cli, config, topology, typing, option, state_check, ping, route, ospf, eigrp, bgp |
| Backend progress verification | `backend/services/progressService.js` | Prerequisite graph, completion contract, lock enforcement, backend-authoritative completion |

---

## 5. WebSocket Messages (Actual)

| Client → Server | Server → Client | Status |
|---|---|---|
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

## 6. Key Directories

| Directory | Purpose |
|---|---|
| `backend/` | Express server, WebSocket, REST API, services, state |
| `backend/tests/` | Backend Jest tests |
| `backend/websocket/` | WebSocket connection and message handlers |
| `backend/services/` | Business logic: tickets, progress, learning, lab, verification, rate limiting |
| `backend/state/` | In-memory state stores (NodeCache Maps) |
| `frontend/src/` | React frontend source |
| `frontend/src/engine/` | NetworkSimulationEngine, LabEngine, LabRuntimeState, SimulationRuntimeBridge |
| `frontend/src/features/` | Feature modules (lab-workspace, simulator, cli, dashboard, globe, backgrounds, music, quiz) |
| `frontend/src/app/views/` | LabExplorerView, LabDetailView, Dashboard, EngineerMode, ProgressView |
| `frontend/src/components/` | Shared UI: Header, Nav, ContextPanel, TicketManager, StudyPlanner, RetrievalCenter, TroubleshootingCoach, InterviewRoom, ResearchLab, Portfolio, etc. |
| `frontend/src/data/` | Lab registry, procedural labs, quality registry, learning features |
| `frontend/src/locales/` | i18n translations (en, hi, zh, ja) |
| `frontend/src/styles/` | Global CSS, component CSS |
| `frontend/src/core/` | Storage adapters, constants, utils |
| `frontend/src/context/` | LocaleContext |
| `simulation/` | Backend verifiers, packet tracer hints |
| `docs/` | Project documentation |
| `docs/research/` | Research registry (JP+CN 60-institution matrix) |

---

## 7. Current Capabilities

- 247 labs across 30+ categories (103 basic / 62 intermediate / 82 advanced)
- Cisco IOS-style CLI simulator with stateful commands (ipconfig, ping, traceroute, show arp, show running-config)
- Real-time topology visualization with packet flow animation (BFS path finding)
- SOC/NOC command-center interface with 20 background renderers
- Ticket workflow (Engineer Mode) with AES-256-CBC encryption and audit logging
- Progress engine with prerequisite graph, completion contract, and lock enforcement
- Study Planner with Pomodoro-style blocks and backend persistence
- Retrieval Center with spaced repetition and mastery tracking
- Troubleshooting Coach with structured 5-phase reasoning guide
- Interview Room with 9 progressive levels and keyword coverage scoring
- Research Lab with scientific method cycle and backend experiment persistence
- Portfolio with categorized artifacts and backend persistence
- Daily Missions with adaptive lab assignment
- Skill Graph with mastery tracking and prerequisites
- Debrief with post-lab reflection
- Course Mode with 3 seeded courses and enrollment tracking
- Internationalization (en, hi, zh, ja)
- WCAG AA accessibility verified (18.46:1 contrast ratio)
- Single requestAnimationFrame loop across all renderers with pause-when-hidden

---

## 8. Known Architectural Debt

| Issue | Impact | Status |
|---|---|---|
| LabEngine not wired into practical learner workflow | Advanced features not available for practical labs | DEFERRED |
| Backend `state_check`/`ping` incomplete | 6 tests exist but integration pending | DEFERRED |
| Three device-state stores | NSE.devices, canonicalDeviceStates, LabEngine.state.runtime | DOCUMENTED |
| Frontend `verifyPing` placeholder | Always returns success | DEFERRED |
| WorkflowEngine not integrated into LabWorkspace | Step progression not actively used | DEFERRED |

---

## 9. External Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| react | 18.2.0 | UI framework |
| react-dom | 18.2.0 | React DOM renderer |
| three | 0.150.0 | 3D graphics (GlobeVisualization, BackgroundStudio) |
| @react-three/fiber | 8.15.0 | React Three Fiber renderer |
| @react-three/drei | 9.88.0 | R3F helpers |
| express | 4.18.2 | Backend HTTP server |
| ws | 8.16.0 | WebSocket server |
| helmet | 7.1.0 | Security headers |
| zustand | 4.5.0 | State management (defined but lightly used) |
| uuid | 9.0.1 | ID generation |
| jest | 29.7.0 | Test runner |
| vite | 5.1.0 | Frontend dev server and bundler |
| pg | 8.11.3 | PostgreSQL client (optional, falls back to in-memory) |
| redis | 4.6.10 | Redis client (optional, falls back to in-memory) |
| @grpc/grpc-js | 1.9.12 | gRPC server (optional) |

---

## 10. Environment Configuration

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | 3000 | Backend HTTP/WebSocket port |
| `GRPC_PORT` | 50051 | gRPC server port |
| `REDIS_URL` | (commented) | Redis for session persistence (future) |
| `JWT_SECRET` | cybernet-lab-default | Used for ticket encryption key derivation |
| `TICKET_ENCRYPTION_KEY` | (derived from JWT_SECRET) | AES-256-CBC key for sensitive ticket fields |
| `DEFAULT_MUSIC` | none | Music player default (off) |

---

## 11. Backend Services

| Service | File | Purpose |
|---|---|---|
| Lab Service | `backend/services/labService.js` | Lab business logic: start, verify, hint, config, cable connect/disconnect, error injection |
| Verification Service | `backend/services/verificationService.js` | Backend verification: cli, config, topology, typing, option, state_check, ping, route, ospf, eigrp, bgp |
| Ticket Service | `backend/services/tickets.js` | Ticket CRUD, AES-256-CBC encryption at rest, audit logging |
| Progress Service | `backend/services/progressService.js` | Prerequisite graph, completion contract, lock enforcement, backend-authoritative completion |
| Learning Service | `backend/services/learningService.js` | Roadmap, daily missions, retrieval queue, evidence, failure labs, troubleshooting guides, interview questions, research experiments, portfolio, study planner, skill graph, debriefs, courses, enrollments |
| Lab Quality Service | `backend/services/labQualityService.js` | Lab validation, quarantine status, quality evaluation |
| Rate Limiter | `backend/services/rateLimiter.js` | Global and per-lab rate limiting |
| Device Manager | `backend/services/deviceManager.js` | Device initialization and management |
| Lab Engine | `backend/services/labEngine.js` | Advanced lab engine (not in active practical workflow) |
| Telemetry Stream | `backend/services/telemetry.js` | Real-time telemetry broadcasting |
| Redis Client | `backend/services/redis.js` | Redis connection (optional) |
| Postgres Client | `backend/services/postgres.js` | PostgreSQL connection (optional) |
| gRPC Server | `backend/services/grpc.js` | gRPC server for external integrations |

---

## 12. Frontend Feature Modules

| Feature | Path | Purpose |
|---|---|---|
| Lab Workspace | `frontend/src/features/lab-workspace/` | Main practical lab environment with terminal, topology, verification |
| Simulator | `frontend/src/features/simulator/` | NetworkSimulationEngine, verification engine |
| CLI | `frontend/src/features/cli/` | Terminal component and command handling |
| Dashboard | `frontend/src/features/dashboard/` | NOC/SOC command center |
| Globe | `frontend/src/features/globe/` | Three.js SOC visualization with attack arcs |
| Backgrounds | `frontend/src/features/backgrounds/` | 20 background renderers with lazy loading |
| Music | `frontend/src/features/music/` | Ambient music player |
| Quiz | `frontend/src/features/quiz/` | Knowledge check quiz component |

---

*This document is the authoritative architecture context for CyberNet Lab v4.0.0.*
