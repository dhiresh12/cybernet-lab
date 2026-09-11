# Quick Start — CyberNet Lab

## 1. What is CyberNet Lab?

CyberNet Lab is a networking virtual laboratory with 249 hands-on labs, a Cisco IOS-style CLI simulator, real-time verification, and a NOC/SOC control-room interface.

## 2. Project Location

```
C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Start the Project

Open two terminals:

**Terminal 1 — Backend**
```bash
npm run backend
# Backend runs on http://localhost:3000
```

**Terminal 2 — Frontend**
```bash
npm run frontend
# Frontend runs on http://localhost:5173
```

Or start both with:
```bash
npm run dev
```

**Windows users:** You can also run `start.bat` from the repository root to install dependencies, build, and start both servers.

## 5. Verify Backend Health

```bash
curl http://localhost:3000/api/labs
# Should return JSON array of labs
```

## 6. Open the Frontend

```
http://localhost:5173
```

## 7. Run Tests

```bash
# All tests
npm test

# Frontend tests only
npm test -- --testPathPattern="frontend/src"

# Backend tests only
npm test -- --testPathPattern="backend/tests"
```

## 8. Build for Production

```bash
npm run build
# Outputs to frontend/dist/
```

## 9. Open a Real Lab

1. Open http://localhost:5173
2. Browse labs or search
3. Select **REF-001: Configure a Small Office LAN**
4. Enter `ipconfig 192.168.1.10 255.255.255.0` in the terminal
5. Click **Verify** to check the step

## 10. Modify a Lab Safely

- Reference labs live in `frontend/src/data/reference-labs/`
- Follow the schema in `frontend/src/data/LabModel.js`
- Register new labs in `frontend/src/data/labRegistry.js`
- Validate with `npm run build`

## 11. Important Architecture Files

| File | Purpose |
|------|---------|
| `frontend/src/App.jsx` | Root shell, view routing |
| `frontend/src/features/lab-workspace/LabWorkspace.jsx` | Main lab workspace |
| `frontend/src/engine/NetworkSimulationEngine.js` | CLI simulator |
| `frontend/src/engine/LabRuntimeState.js` | Canonical runtime state |
| `backend/server.js` | Backend entry point |
| `backend/services/labService.js` | Lab business logic |
| `simulation/verifiers.js` | Backend verification |
| `MENU.md` | Architecture map |
| `PROJECT_CHECKPOINT.md` | Phase history |
| `.env.example` | Environment variables template |

## Important Notes

- The actual frontend source is in `frontend/src/`, not the repository root.
- A few legacy `.jsx` files exist at the root but are not used by the build.
- Backend uses in-memory state only (no database).
