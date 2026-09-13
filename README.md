# CyberNet Lab

High-fidelity autonomous networking virtual laboratory. 247 labs across 30+ categories with a stateful Cisco IOS-style CLI, real-time verification, and a NOC/SOC control-room interface.

**Project path:** `C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab`

---

## Table of Contents
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [npm Scripts](#npm-scripts)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Architecture](#architecture)
- [Testing](#testing)
- [Build](#build)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Quick Start

```bash
# 1. Clone and install dependencies
git clone https://github.com/your-org/cybernet-lab.git
cd cybernet-lab
npm ci

# 2. Configure environment
Copy-Item .env.example .env   # Windows PowerShell
# cp .env.example .env        # macOS / Linux
# Edit .env — set JWT_SECRET to a 64-char random string

# 3. Start database services (Docker Compose)
docker compose up -d postgres redis
# Or start a local Postgres + Redis instance and update DATABASE_URL / REDIS_URL

# 4. Run database migrations (if applicable)
# node backend/scripts/migrate.js

# 5. Start backend (Express + WebSocket, port 3000)
npm run backend

# 6. In another terminal, start frontend (Vite, port 5173)
npm run frontend

# 7. Open browser
http://localhost:5173
```

**Windows shortcut:** Run `start.bat` from the repository root to install, build, and start both servers.

---

## Prerequisites

- Node.js 20+ and npm 9+
- PostgreSQL 14+ (local or managed)
- Redis 7+ (local or managed)
- Docker and Docker Compose (for containerized deployment)
- Modern browser with WebGL 2.0 support
- Windows/macOS/Linux

---

## npm Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start backend + frontend concurrently |
| `npm run backend` | Start Express backend only |
| `npm run frontend` | Start Vite dev server only |
| `npm run build` | Build frontend for production |
| `npm run start` | Start production backend |
| `npm test` | Run Jest tests |
| `npm run lint` | Run ESLint |
| `npm run docker:build` | Build Docker image |
| `npm run docker:up` | Start Docker Compose stack |
| `npm run docker:down` | Stop Docker Compose stack |
| `npm run k8s:apply` | Apply Kubernetes manifests |
| `npm run k8s:delete` | Delete Kubernetes resources |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in production values. Required variables are marked with **Yes**.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Set to `production` for deployment |
| `PORT` | Yes | `3000` | Backend HTTP/WebSocket port |
| `GRPC_PORT` | Yes | `50051` | gRPC telemetry port |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/db`) |
| `DB_HOST` | No | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_NAME` | No | `cybernet_lab` | PostgreSQL database name |
| `DB_USER` | No | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | No | `postgres` | PostgreSQL password |
| `REDIS_URL` | Yes | — | Redis connection string (e.g. `redis://host:6379`) |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `JWT_SECRET` | **Yes** | — | 64-char random string for signing |
| `ALLOWED_ORIGINS` | Yes | `http://localhost:5173` | Comma-separated CORS origins for production |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | No | `60` | Max requests per window |
| `LOG_LEVEL` | No | `info` | Log level: error, warn, info, debug |
| `LOG_FILE_PATH` | No | `./logs/cybernet-lab.log` | Log file path |

### Frontend (Vite injects these at build time)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3000` | Backend API base URL |
| `VITE_WS_URL` | `ws://localhost:3000` | WebSocket URL |

> **Security:** Never commit `.env` to version control. Use a secrets manager (Render Secrets, AWS Secrets Manager, Kubernetes Secrets) in production.

---

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full step-by-step guides for Render, Vercel, Docker Compose, Kubernetes, and AWS EC2.

Quick links:
- [Render guide](./DEPLOYMENT.md#option-1-render)
- [Vercel + Render guide](./DEPLOYMENT.md#option-2-vercel--render)
- [Docker Compose guide](./DEPLOYMENT.md#option-3-docker-compose)
- [Kubernetes guide](./DEPLOYMENT.md#option-4-kubernetes)
- [AWS EC2 guide](./DEPLOYMENT.md#option-5-aws-ec2)

```bash
# Docker Compose (self-hosted)
docker compose up -d --build
curl http://localhost:3000/api/health/live

# Kubernetes
kubectl apply -f k8s/
kubectl get pods -n cybernet-lab
```

---

## Smoke Testing

After every deployment, run the checklist in [SMOKE_TEST.md](./SMOKE_TEST.md) to verify all systems are operational.

---

## Docker Deployment

```bash
# Build image
docker build -t cybernet-lab:latest .

# Start stack
docker compose up -d

# Check health
curl http://localhost:3000/api/health/live

# Stop stack
docker compose down
```

---

## Kubernetes Deployment

```bash
# Create namespace and secrets
kubectl create namespace cybernet-lab

kubectl create secret generic cybernet-secrets \
  --from-literal=db-user=postgres \
  --from-literal=db-password=<PASSWORD> \
  --from-literal=db-name=cybernet_lab \
  --from-literal=jwt-secret=<64_CHAR_SECRET> \
  -n cybernet-lab

kubectl create configmap cybernet-config \
  --from-literal=cors-origin=https://cybernet-lab.example.com \
  --from-literal=log-level=info \
  -n cybernet-lab

# Apply all manifests
kubectl apply -f k8s/

# Verify
kubectl get pods -n cybernet-lab
kubectl get services -n cybernet-lab
kubectl get ingress -n cybernet-lab
```

---

## Architecture

### Frontend
- React 18 + Vite
- Zustand for global state
- Feature-based organization under `frontend/src/features/`
- Custom hooks for simulation, topology, verification, terminal
- 20 background renderers via `BackgroundStudio.jsx`
- 3D SOC visualization via Three.js / R3F Globe

### Backend
- Express REST API + WebSocket on the same port
- In-memory session state with NodeCache fallback
- Modular service layer (`services/`, `routes/`, `websocket/`)
- Structured JSON logging to `logs/cybernet-lab.log`
- Graceful shutdown on SIGINT / SIGTERM
- Health checks: `/api/health`, `/api/health/live`, `/api/health/ready`

### Engines
- `LabEngine` — WebSocket lab orchestration
- `NetworkSimulationEngine` — CLI simulation + device state (authoritative)
- `LabStateEngine` — Pure state management
- `LabRuntimeState` — Immutable runtime state schema
- `WorkflowEngine` — Step progression & verification gate
- `TroubleshootingEngine` — Fault injection scenarios

### State Ownership
- **Practical learner device state**: `NetworkSimulationEngine.devices`
- **LabWorkspace local state**: `canonicalDeviceStates`
- **Backend session state**: `backend/state/state.js`
- **Global UI state**: Zustand `labStore.js`

### Practical Learner Workflow (REF-001)
```
LabWorkspace → useLabSimulation → NetworkSimulationEngine
                                     ↓
                           device:stateChanged event
                                     ↓
                           syncDeviceStates → canonicalDeviceStates
                                     ↓
                     useLabTerminal / useLabTopology / useLabVerification
```

---

## REST API

```
GET  /api/health                   # Overall health
GET  /api/health/live              # Liveness probe
GET  /api/health/ready             # Readiness probe
GET  /api/labs                     # List all 247 labs
GET  /api/labs/:id                 # Get lab by ID
POST /api/labs/:id/start           # Start lab session
GET  /api/labs/:id/sessions/:id    # Get active session
DELETE /api/labs/:id/sessions/:id  # Reset session
GET  /api/labs/:id/state           # Get saved lab state
PUT  /api/labs/:id/state           # Save lab state
GET  /api/progress                 # Get user progress
GET  /api/progress/:learnerId/available    # Available labs
GET  /api/progress/:learnerId/locked       # Locked labs
GET  /api/progress/:learnerId              # Learner progress
POST /api/progress/:learnerId/start/:labId # Start lab
POST /api/progress/:learnerId/complete/:labId # Complete lab
GET  /api/tickets                  # List tickets
POST /api/tickets                  # Create ticket
GET  /api/tickets/:id              # Get ticket
PUT  /api/tickets/:id/status       # Update ticket status
DELETE /api/tickets/:id            # Delete ticket
... (see API_DOCUMENTATION.md for full list)
```

---

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
| `LabRuntimeState.test.js` | `frontend/src/engine/` | Canonical runtime state |
| `SimulationRuntimeBridge.test.js` | `frontend/src/engine/` | NSE → LabRuntimeState bridge |
| `ref001-runtime.test.js` | `frontend/src/features/lab-workspace/__tests__/` | REF-001 end-to-end |
| `progressService.test.js` | `backend/tests/` | Progress engine (17 tests) |
| `ticketApi.test.js` | `backend/tests/` | Ticket API (10 tests) |
| `labQualityService.test.js` | `backend/tests/` | Quality gate unit tests |
| `labApiQualityGate.test.js` | `backend/tests/` | API quality gate integration |
| `websocketIntegration.test.js` | `backend/tests/` | WebSocket integration |
| `corsAndSecurity.test.js` | `backend/tests/` | Security tests |
| `integrationSmoke.test.js` | `backend/tests/` | Smoke tests |

---

## Build

```bash
# Production build (outputs to frontend/dist/)
npm run build

# Verify build output
Test-Path frontend/dist/index.html
```

Production build features:
- Terser minification with console/drop_debugger removal
- Code splitting: vendor (React, Zustand) + three (Three.js) chunks
- Tree shaking enabled
- Source maps disabled in production
- Chunk size warning limit: 500KB

---

## Troubleshooting

**Port 3000 already in use**
```powershell
set PORT=3001 && npm run backend
```

**Port 5173 already in use**
```bash
# Vite will prompt to use another port automatically
npx vite --port 5174 frontend
```

**Build fails with module errors**
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

**Frontend stuck on "Loading CyberNet Lab v4.0..."**
- Check backend is running on port 3000
- Check browser console for JavaScript errors
- Ensure no syntax errors in `frontend/src/engine/`

**Health check failing in k8s**
- Increase `initialDelaySeconds` in k8s liveness probe
- Check pod logs: `kubectl logs <pod> -n cybernet-lab`
- Verify environment variables in pod: `kubectl describe pod <pod> -n cybernet-lab`

---

## License

Proprietary — CyberNet Lab
