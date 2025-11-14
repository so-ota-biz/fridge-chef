## Base image
FROM node:20-alpine AS base

## Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package manifests and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Toolchain for native modules (e.g. bcrypt, sharp)
RUN apk add --no-cache python3 make g++

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

## Build stage
FROM base AS builder
WORKDIR /app

# Bring in installed modules and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build NestJS
RUN npm run build

## Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

# Production env
ENV NODE_ENV=production

# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Expose API port
EXPOSE 3000

# Apply Prisma migrations, then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
