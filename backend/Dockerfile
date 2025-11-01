# ベースイメージ
FROM node:20-alpine AS base

# 依存関係インストール用ステージ
FROM base AS deps
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./
COPY prisma ./prisma/

# 依存関係をインストール
RUN npm ci

# Prisma Client を生成
RUN npx prisma generate

# ビルド用ステージ
FROM base AS builder
WORKDIR /app

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ビルド
RUN npm run build

# 本番用ステージ
FROM base AS runner
WORKDIR /app

# 本番環境設定
ENV NODE_ENV=production

# 必要なファイルのみコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# ポート公開
EXPOSE 3000

# アプリケーション起動
CMD ["node", "dist/main"]