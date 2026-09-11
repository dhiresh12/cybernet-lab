# CyberNet Lab Backend

Node.js/Express backend with WebSocket and gRPC support for the CyberNet Lab platform.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start with Docker Compose (recommended)
docker-compose up -d

# Or start locally
npm run dev
```

## Architecture

- **Express.js** - REST API server
- **WebSocket** - Real-time telemetry streaming
- **gRPC** - High-performance device communication
- **PostgreSQL** - Persistent storage for labs, sessions, steps
- **Redis** - Session caching and pub/sub

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/lab-state | Current lab state |
| POST | /api/inject-error | Inject lab error |
| PUT | /api/lab-config/:id | Push lab config |
| GET | /api/telemetry | Latest telemetry |
| POST | /api/reset-lab/:id | Reset lab |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| lab-start | → | Start a lab session |
| device-select | → | Select a device |
| console-command | → | Execute CLI command |
| step-complete | → | Mark step complete |
| lab-state | ← | Lab state update |
| device-info | ← | Device information |
| console-output | ← | CLI output |
| step-result | ← | Step verification result |
| telemetry | ← | Real-time telemetry |

## Deployment

### Docker
```bash
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

## Services

- `services/redis.js` - Redis client wrapper
- `services/postgres.js` - PostgreSQL connection pool
- `services/grpc.js` - gRPC server
- `services/deviceManager.js` - Device state management
- `services/labEngine.js` - Lab execution logic
- `services/telemetry.js` - Telemetry streaming
