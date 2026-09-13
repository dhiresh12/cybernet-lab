# DEPLOYMENT.md — CyberNet Lab Production Deployment

Three deployment paths are covered below. Choose the one that matches your infrastructure.

---

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Option 1: Render (Recommended for Solo Deploy)](#option-1-render)
- [Option 2: Vercel (Frontend) + Render (Backend)](#option-2-vercel--render)
- [Option 3: Docker Compose (Self-Hosted VPS)](#option-3-docker-compose)
- [Option 4: Kubernetes (AWS EKS / GCP GKE / AKS)](#option-4-kubernetes)
- [Option 5: AWS EC2 (PM2)](#option-5-aws-ec2)
- [Post-Deployment](#post-deployment)
- [Rollback](#rollback)

---

## Pre-Deployment Checklist

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci

# 3. Build frontend
npm run build
# Verify: Test-Path frontend/dist/index.html

# 4. Run tests
npm test
# Expected: 23 suites, 367 tests passing

# 5. Copy and configure environment
Copy-Item .env.example .env   # Windows
# cp .env.example .env        # macOS/Linux
# Edit .env with production values
```

---

## Option 1: Render

Render hosts Node.js, Postgres, and Redis as managed services.

### Step 1 — Push to GitHub

```bash
git push origin main
```

### Step 2 — Create Render Services

**Postgres:**
1. New → PostgreSQL
2. Name: `cybernet-db`
3. Plan: Starter ($7/mo)
4. Copy the `Internal Database URL` — paste into backend env as `DATABASE_URL`

**Redis:**
1. New → Redis
2. Name: `cybernet-redis`
3. Plan: Starter ($5/mo)
4. Copy `Internal Redis URL` — paste into backend env as `REDIS_URL`

**Web Service:**
1. New → Web Service
2. Connect your GitHub repo
3. Name: `cybernet-lab-backend`
4. Region: Choose closest to your users
5. Plan: Starter ($7/mo)
6. Build Command: `npm ci && npm run build`
7. Start Command: `node backend/server.js`
8. Environment: `Node`

### Step 3 — Set Environment Variables

In Render dashboard → Settings → Environment:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `10000` | Render sets this automatically |
| `DATABASE_URL` | *(from Postgres service)* | |
| `REDIS_URL` | *(from Redis service)* | |
| `JWT_SECRET` | `render generateValue: true` | 64-char random |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | |
| `RATE_LIMIT_WINDOW_MS` | `60000` | |
| `RATE_LIMIT_MAX_REQUESTS` | `60` | |
| `LOG_LEVEL` | `info` | |

### Step 4 — Deploy

Click **Create Web Service**. Render builds and deploys automatically on every push to `main`.

### Step 5 — Verify

```bash
curl https://your-service.onrender.com/api/health/live
# Expected: {"status":"alive",...}
```

---

## Option 2: Vercel + Render

Deploy frontend on Vercel, backend on Render.

### Vercel (Frontend)

1. Import repo into Vercel
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com` |
| `VITE_WS_URL` | `wss://your-backend.onrender.com` |

6. Deploy

### Render (Backend)

Same as Option 1, but set `ALLOWED_ORIGINS` to your Vercel domain.

---

## Option 3: Docker Compose

Best for self-hosted VPS (DigitalOcean, Hetzner, Linode).

### Prerequisites on Host

```bash
# Ubuntu 22.04+
sudo apt update && sudo apt install -y docker.io docker-compose git
sudo systemctl enable --now docker
sudo systemctl enable --now nginx   # optional, for reverse proxy
```

### Deploy

```bash
git clone https://github.com/your-org/cybernet-lab.git /opt/cybernet-lab
cd /opt/cybernet-lab

# Create .env from .env.example — fill in production JWT_SECRET
cp .env.example .env
nano .env   # set JWT_SECRET, DB_PASSWORD, ALLOWED_ORIGINS

# Start stack
docker compose up -d --build

# Verify
docker compose ps
docker compose logs --tail=50 backend
curl http://localhost:3000/api/health/live
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name cybernet-lab.example.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";   # WebSocket
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

### SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cybernet-lab.example.com
```

---

## Option 4: Kubernetes

### Prerequisites

```bash
# kubectl configured against your cluster
kubectl cluster-info
```

### Step 1 — Create Namespace

```bash
kubectl apply -f k8s/01-namespace.yaml
```

### Step 2 — Create Secrets

```bash
kubectl create secret generic cybernet-secrets \
  --namespace=cybernet-lab \
  --from-literal=db-user=cybernet \
  --from-literal=db-password="$(openssl rand -base64 32)" \
  --from-literal=db-name=cybernet_lab \
  --from-literal=jwt-secret="$(openssl rand -base64 48)"
```

### Step 3 — Create ConfigMap

```bash
kubectl create configmap cybernet-config \
  --namespace=cybernet-lab \
  --from-literal=cors-origin=https://cybernet-lab.example.com \
  --from-literal=log-level=info
```

### Step 4 — Deploy Persistent Volumes

```bash
kubectl apply -f k8s/09-postgres-pvc.yaml
kubectl apply -f k8s/10-redis-pvc.yaml
```

### Step 5 — Deploy PostgreSQL and Redis

```bash
kubectl apply -f k8s/04-postgres-deployment.yaml
kubectl apply -f k8s/05-postgres-service.yaml
kubectl apply -f k8s/06-redis-deployment.yaml
kubectl apply -f k8s/07-redis-service.yaml

# Wait for ready
kubectl wait --for=condition=ready pod -l app=cybernet-postgres -n cybernet-lab --timeout=120s
kubectl wait --for=condition=ready pod -l app=cybernet-redis    -n cybernet-lab --timeout=120s
```

### Step 6 — Deploy Backend

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### Step 7 — Deploy Ingress (Optional)

```bash
kubectl apply -f k8s/ingress.yaml   # requires nginx-ingress-controller
```

### Step 8 — Verify

```bash
kubectl get pods -n cybernet-lab
kubectl get services -n cybernet-lab
kubectl get ingress -n cybernet-lab
kubectl logs -n cybernet-lab -l app=cybernet-backend
kubectl port-forward svc/cybernet-backend 3000:80 -n cybernet-lab
curl http://localhost:3000/api/health/live
```

---

## Option 5: AWS EC2 (PM2)

### Provision EC2

- AMI: Ubuntu 22.04 LTS
- Instance: t3.medium (2 vCPU, 4GB RAM)
- Security Group: open 22, 80, 443, 3000

### Deploy

```bash
ssh -i key.pem ubuntu@<EC2_PUBLIC_IP>

# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# Clone and build
git clone https://github.com/your-org/cybernet-lab.git /opt/cybernet-lab
cd /opt/cybernet-lab
cp .env.example .env
nano .env   # set production values
npm ci
npm run build

# PM2 process manager
sudo npm install -g pm2
pm2 start backend/server.js --name cybernet-backend
pm2 save
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Nginx reverse proxy
sudo nano /etc/nginx/sites-available/cybernet-lab
# (paste Nginx config from Option 3)
sudo ln -sf /etc/nginx/sites-available/cybernet-lab /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d your-domain.com
```

---

## Post-Deployment

```bash
# 1. Run smoke tests
# Follow SMOKE_TEST.md checklist

# 2. Check logs
docker compose logs -f backend        # Docker
kubectl logs -f -l app=cybernet-backend -n cybernet-lab  # K8s

# 3. Monitor
pm2 monit                            # PM2
kubectl top pods -n cybernet-lab      # K8s metrics
```

---

## Rollback

### Docker Compose

```bash
cd /opt/cybernet-lab
git checkout <previous-commit>
docker compose up -d --build
```

### Kubernetes

```bash
kubectl rollout undo deployment/cybernet-backend -n cybernet-lab
```

### Render / Vercel

Use the platform dashboard to redeploy the previous successful deployment.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Must be `production` for deployment |
| `PORT` | Yes | `3000` | Backend HTTP/WebSocket port |
| `GRPC_PORT` | Yes | `50051` | gRPC telemetry port |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `DB_HOST` | No | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_NAME` | No | `cybernet_lab` | PostgreSQL database name |
| `DB_USER` | No | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | No | `postgres` | PostgreSQL password |
| `REDIS_URL` | Yes | — | Redis connection string |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `JWT_SECRET` | **Yes** | — | 64-char random string |
| `ALLOWED_ORIGINS` | Yes | — | Comma-separated allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `60` | Max requests per window |
| `LOG_LEVEL` | No | `info` | error / warn / info / debug |
| `LOG_FILE_PATH` | No | `./logs/cybernet-lab.log` | Log file path |
| `VITE_API_BASE_URL` | Frontend | `http://localhost:3000` | Backend API URL |
| `VITE_WS_URL` | Frontend | `ws://localhost:3000` | WebSocket URL |
