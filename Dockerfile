# Multi-stage production Dockerfile for CyberNet Lab
# Build: node:20-alpine builder → install deps + build frontend
# Run:  node:20-alpine slim runtime → non-root user, minimal attack surface

# ============================================================
# Stage 1: Builder
# ============================================================
FROM node:20-alpine AS builder

# System deps for native modules (grpc, bcrypt, sharp, etc.)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    protobuf-dev \
    libc6-compat

WORKDIR /app

# Install all deps (including devDeps for build tools)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build frontend → frontend/dist/
RUN npm run build

# ============================================================
# Stage 2: Production runtime
# ============================================================
FROM node:20-alpine AS runtime

# System deps
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    protobuf-dev \
    libc6-compat \
    curl   # for healthcheck

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodejs -u 1001 -G nodejs

# Install production deps only
COPY package.json package-lock.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built frontend from builder
COPY --from=builder --chown=nodejs:nodejs /app/frontend/dist ./frontend/dist

# Copy backend source (needed at runtime)
COPY --from=builder --chown=nodejs:nodejs /app/backend ./backend
COPY --from=builder --chown=nodejs:nodejs /app/simulation ./simulation
COPY --from=builder --chown=nodejs:nodejs /app/labs.procedural.json ./

# Create writable log directory
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Switch to non-root user
USER nodejs

# Expose HTTP and gRPC ports
EXPOSE 3000 50051

# Environment defaults (override via -e or .env)
ENV NODE_ENV=production \
    PORT=3000 \
    GRPC_PORT=50051 \
    LOG_LEVEL=info \
    LOG_FILE_PATH=/app/logs/cybernet-lab.log

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health/live || exit 1

# Start backend (serves API, WebSocket, and static frontend)
CMD ["node", "backend/server.js"]
