# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.19.0

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/backend ./apps/backend
COPY packages ./packages

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build the backend
RUN pnpm run -F backend build

# Deploy prod dependencies to a clean directory, then copy dist
RUN pnpm deploy --filter backend --prod --legacy /app/deploy
RUN cp -r /app/apps/backend/dist /app/deploy/dist

# Production stage
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/deploy/dist ./dist
COPY --from=builder /app/deploy/package.json ./package.json
COPY --from=builder /app/deploy/node_modules ./node_modules

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 404) throw new Error(r.statusCode)})" || exit 1

CMD ["node", "dist/main"]