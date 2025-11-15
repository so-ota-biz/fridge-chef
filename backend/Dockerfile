# ベースイメージ
FROM node:20-alpine AS base

# 依存関係ステージ
FROM base AS deps
WORKDIR /app

# package.json と Prisma スキーマをコピー
COPY package*.json ./
COPY prisma ./prisma/

# ネイティブモジュール用ビルドツール (bcrypt, sharp 等)
RUN apk add --no-cache python3 make g++

# 依存関係をインストール
RUN npm ci

# Prisma Client を生成
RUN npx prisma generate

# ビルドステージ
FROM base AS builder
WORKDIR /app

# 依存関係とソースをコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NestJS をビルド
RUN npm run build

# ランタイムステージ
FROM node:20-alpine AS runner
WORKDIR /app

# 本番環境変数
ENV NODE_ENV=production

# 必要なファイルのみコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# API ポートを公開
EXPOSE 3000

# アプリ起動（DBマイグレーションはCIのSupabase CLIで適用）
CMD ["node", "dist/main.js"]

