# SMOKE TEST — CyberNet Lab Production Deployment

Run this checklist after every deployment to verify all systems are operational.

---

## 1. Pre-Deployment Checks

- [ ] `git status` clean — no uncommitted changes on deploy branch
- [ ] `npm run build` completes without errors
- [ ] `npm test` passes — 23 suites / 367 tests green
- [ ] `.env.example` reviewed — no real secrets committed
- [ ] `frontend/dist/` exists and contains `index.html`

---

## 2. Health Endpoints

```bash
BASE_URL=https://your-domain.com
```

- [ ] `GET  $BASE_URL/api/health`          → 200, body `{ status: "ok" }`
- [ ] `GET  $BASE_URL/api/health/live`     → 200, body `{ status: "alive" }`
- [ ] `GET  $BASE_URL/api/health/ready`    → 200 (or 503 if dependencies still warming)
- [ ] Liveness probe body contains `redis`, `postgres`, `labs`, `websocket` keys
- [ ] Response time for `/api/health/live` < 200ms

---

## 3. Lab API

- [ ] `GET  $BASE_URL/api/labs`            → 200, array length 247
- [ ] `GET  $BASE_URL/api/labs/<id>`       → 200, object with `id`, `title`, `category`
- [ ] `POST $BASE_URL/api/labs/<id>/start` → 200, returns `sessionId`
- [ ] `GET  $BASE_URL/api/labs/<id>/state` → 200 (empty or saved state)

---

## 4. Progress & Ticket API

- [ ] `GET  $BASE_URL/api/progress/<learnerId>`        → 200
- [ ] `GET  $BASE_URL/api/progress/<learnerId>/available` → 200
- [ ] `POST $BASE_URL/api/progress/<learnerId>/start/<labId>`   → 200
- [ ] `POST $BASE_URL/api/progress/<learnerId>/complete/<labId>` → 200
- [ ] `GET  $BASE_URL/api/tickets`          → 200, array
- [ ] `POST $BASE_URL/api/tickets`          → 201, returns ticket with `id`
- [ ] `GET  $BASE_URL/api/tickets/<id>`     → 200
- [ ] `PUT  $BASE_URL/api/tickets/<id>/status` → 200

---

## 5. WebSocket Connection

- [ ] Open browser DevTools → Network → WS
- [ ] Connect to `wss://your-domain.com/ws`
- [ ] Connection opens without error
- [ ] Send `{ type: "ping" }` — receive `{ type: "pong" }`
- [ ] Start a lab via WS — receive lab state payload
- [ ] Disconnect and reconnect — state re-syncs

---

## 6. Frontend UI

- [ ] Homepage loads — Header, Navigation, Lab Catalog visible
- [ ] Language selector switches between en / hi / zh / ja
- [ ] Lab list shows 247 labs across categories
- [ ] Click a lab → Lab Detail loads with prerequisites
- [ ] Click "Start Lab" → LabWorkspace opens
- [ ] Topology renders with device nodes and edges
- [ ] CLI terminal accepts `show ip interface brief`
- [ ] CLI terminal accepts `ping <target>`
- [ ] CLI terminal accepts `traceroute <target>`
- [ ] Packet animation plays along topology path
- [ ] Verification panel shows step status (pass/fail/pending)
- [ ] Save Progress works — reload page, progress persists

---

## 7. SOC Dashboard

- [ ] Navigate to Dashboard → SOC panels render
- [ ] Incident cards visible (Basic / Medium / Advanced)
- [ ] Alert triage panel loads
- [ ] Globe visualization renders (attack arcs + pulsing nodes)
- [ ] Three.js scene does not crash on low-end GPU

---

## 8. Performance

- [ ] Lighthouse Performance score ≥ 80
- [ ] First Contentful Paint < 2s on 3G
- [ ] No console errors in production build
- [ ] Background renderers pause when tab is hidden
- [ ] No memory leak after 5 min of continuous use (check DevTools Memory tab)

---

## 9. Security

- [ ] Helmet headers present in responses (`X-Frame-Options`, `X-Content-Type-Options`)
- [ ] CORS rejects unlisted origins (try `curl` from an unknown origin)
- [ ] Rate limiting activates after 60 requests in 60s → 429 response
- [ ] `JWT_SECRET` is a 64-char random string in production
- [ ] No secrets or API keys visible in frontend source

---

## 10. Docker Compose Stack

```bash
docker compose up -d
```

- [ ] `cybernet-postgres` — healthy (`pg_isready`)
- [ ] `cybernet-redis`    — healthy (`redis-cli ping`)
- [ ] `cybernet-backend`  — healthy (`/api/health/live`)
- [ ] `docker compose logs backend` — no ERROR lines
- [ ] `docker compose down` — volumes persist (`postgres_data`, `redis_data`)

---

## 11. Kubernetes

```bash
kubectl apply -f k8s/
kubectl get pods -n cybernet-lab
```

- [ ] `cybernet-backend-*` pods status `Running`
- [ ] `cybernet-postgres-*` pods status `Running`
- [ ] `cybernet-redis-*` pods status `Running`
- [ ] Service `cybernet-backend` ClusterIP allocated
- [ ] Ingress `cybernet-ingress` address assigned
- [ ] `kubectl logs -n cybernet-lab -l app=cybernet-backend` — no panic/stack traces
- [ ] Secrets mounted — `kubectl describe pod` shows envFrom or env with secretKeyRef
- [ ] ConfigMap mounted — `LOG_LEVEL` reflects configmap value

---

## 12. Graceful Shutdown

- [ ] `docker stop cybernet-backend` — exits within 10s, no zombie processes
- [ ] `kill -SIGTERM <pid>` — server logs "shutting down gracefully"
- [ ] In-flight WebSocket connections close cleanly
- [ ] In-flight HTTP requests complete or return 503 before shutdown

---

## Sign-off

| Check | Pass | Tester | Date |
|-------|------|--------|------|
| Health endpoints | ☐ | | |
| Lab API | ☐ | | |
| Progress & Tickets | ☐ | | |
| WebSocket | ☐ | | |
| Frontend UI | ☐ | | |
| SOC Dashboard | ☐ | | |
| Performance | ☐ | | |
| Security | ☐ | | |
| Docker Compose | ☐ | | |
| Kubernetes | ☐ | | |
| Graceful Shutdown | ☐ | | |
