# Builder
FROM node:24.11.1-alpine AS builder

WORKDIR /home/workspace

# Enable corepack & pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only dependency files first (for cache)
COPY package.json pnpm-lock.yaml ./

# Install all deps for build
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm run build




# Pruner
FROM node:24.11.1-alpine AS pruner

WORKDIR /home/workspace

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Production dependencies만 설치
RUN pnpm install --prod --frozen-lockfile

# pnpm store 정리
RUN pnpm store prune




# Runner
FROM node:24.11.1-alpine AS runner

# 보안: non-root 유저 사용
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nodejs

WORKDIR /home/workspace

# System tools (minimum) - alpine이므로 apk 사용
RUN apk add --no-cache \
    iputils \
    curl \
    dumb-init

# Enable corepack & pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY --chown=nodejs:nodejs package.json pnpm-lock.yaml ./

# Copy production node_modules from pruner
COPY --from=pruner --chown=nodejs:nodejs /home/workspace/node_modules ./node_modules

# Copy built dist from builder
COPY --from=builder --chown=nodejs:nodejs /home/workspace/dist ./dist

# Copy pm2 config
COPY --chown=nodejs:nodejs ecosystem.config.js ./

# 환경변수
ENV NODE_ENV=production

# non-root 유저로 전환
USER nodejs

# 포트 노출 (필요시)
EXPOSE 3000

# dumb-init으로 PID 1 문제 해결
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Run with local pm2
CMD ["npx", "pm2-runtime", "start", "ecosystem.config.js", "--only", "server-prod"]