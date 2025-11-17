---
title: CI/CD セットアップ手順（GitHub Actions × Supabase × Render × Vercel）
description: production ブランチを本番とし、GitHub Actions で Supabase/Render/Vercel を連携して本番デプロイするための手順書
---

# CI/CD セットアップ最終構成

## 方針とトリガー

- 本番ブランチ: `production`
- フロントエンド（Vercel）: Production Branch を `production` に設定。Deploy Hook で本番反映
- バックエンド（Render）: Deploy Hook で本番反映
- DB/Storage（Supabase）: GitHub Actions から SQL マイグレーションを適用
- オーケストレーション: GitHub Actions（`.github/workflows/deploy.yml`）

## フロー（`production` に push）

1. 変更検出: `dorny/paths-filter` で変更領域を判定
   - `backend/**` に変更 → BE ライン（migrate → Render）
   - `frontend/**` に変更 → FE ライン（Vercel）
   - 両方 → 両ライン
   - コミットメッセージに `[deploy-all]` があれば両方を強制実行
2. DB: Supabase CLI で `backend/supabase/migrations` をリモート適用（Session Pooler 経由）
3. BE: Render の Deploy Hook を叩いてデプロイ（HTTP ステータス/レスポンスをログ出力）
4. FE: Vercel の Deploy Hook を叩いてデプロイ（Production / branch=production）
   - プレビューは従来通り Vercel 側で運用（Hook は本番のみ）

---

## ワークフロー（deploy.yml）要点

- トリガー: `push` ブランチ `production`
- ジョブ概要
  - changes: 差分検出と `[deploy-all]` 判定
  - migrate: `supabase migration up --db-url "$SUPABASE_DB_URL"`
  - deploy-backend: Render Deploy Hook 実行（ログ出力あり）
  - deploy-frontend-after-backend: BE 変更がある場合に BE 完了後 FE を実行
  - deploy-frontend-only: FE のみ変更時に FE を実行

GitHub Secrets（必須）

- `SUPABASE_DB_URL`: Session Pooler 接続 URL（例: `...pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1`）。パスワードは URL エンコード
- `RENDER_DEPLOY_HOOK_URL`: Render の Deploy Hook（Production 用）
- `VERCEL_DEPLOY_HOOK_URL`: Vercel の Deploy Hook（Production / branch=production）

---

## 各サービスの設定

### Supabase（Database / Storage / Auth）

- マイグレーション: `backend/supabase/migrations` を CI から適用
- Auth 設定
  - Site URL: 本番フロントエンド URL（例: `https://app.example.com`）
  - Redirect URLs: `https://app.example.com/auth/signin` または `.../auth/signin?signup=success`
- 接続方式: CLI/BE とも Session Pooler を使用（Direct 接続は IPv6 依存等で不安定）

### Render（Backend Web Service）

- デプロイ: Docker（`backend/Dockerfile`）
- Deploy Hook: Production 用 Hook を発行し、URL を Secrets `RENDER_DEPLOY_HOOK_URL` に設定
- 環境変数（必須）
  - `DATABASE_URL`: Session Pooler の接続 URL（PW は URL エンコード）
  - `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_PUBLIC_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`
  - CORS 必須（クロスサイト/Vercel×Render 構成）
    - `FRONTEND_URL` と CORS の `origin` は完全一致（末尾スラなし）

### Vercel（Frontend）

- Production Branch: `production`
- Deploy Hook: Production / branch=production を作成し、Secrets `VERCEL_DEPLOY_HOOK_URL` に設定
- 環境変数: `NEXT_PUBLIC_API_URL`（Render の BE URL）
- 独自ドメイン使用時は `NEXT_PUBLIC_API_URL` も合わせて更新

---

## 環境変数の取得

- `DATABASE_URL`: Supabase → Database → Connection pooling → Session（Prisma/Node）
- `JWT_SECRET`: 任意生成（例: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`）
- `SUPABASE_URL`: Project Settings → API → `https://<ref>.supabase.co`
- `SUPABASE_PUBLIC_URL`: 同上（Storage URL 変換用）
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API → Service role key
- `FRONTEND_URL`: Vercel の本番 URL または独自ドメイン
- `NEXT_PUBLIC_API_URL`: Render の BE 公開 URL
- `SUPABASE_DB_URL`: Session Pooler 接続 URL（PW は URL エンコード）
- `RENDER_DEPLOY_HOOK_URL`: Render → Service → Settings → Deploy hooks
- `VERCEL_DEPLOY_HOOK_URL`: Vercel → Project → Settings → Deploy Hooks（Production / branch=production）

---

## トラブルシュート

- DB 接続失敗（P1001 等）: Session Pooler + `sslmode=require&pgbouncer=true&connection_limit=1`、PW の URL エンコード確認
- サインイン不可/未確認: Supabase Auth の Redirect を本番 URL に設定（例: `/auth/signin?signup=success`）
- CORS/401: `FRONTEND_URL` と CORS の `origin` 完全一致は必須
- Vercel がデプロイされない: Deploy Hook の HTTP ステータス/レスポンスを Actions ログで確認。Production Branch が `production` であることを確認

---

## チェックリスト

- GitHub Secrets: `SUPABASE_DB_URL`, `RENDER_DEPLOY_HOOK_URL`, `VERCEL_DEPLOY_HOOK_URL`
- Supabase: SQL は `backend/supabase/migrations` にあり、CI が適用
- Render: 環境変数設定済み、Deploy Hook 発行済み
- Vercel: Production Branch = `production`、Production Deploy Hook 発行、`NEXT_PUBLIC_API_URL` 設定

---

## 通知設定（Slack / メール）

### Vercel（Frontend）

- Slack 連携（任意）
  - Project → Integrations → Slack → Add から対象ワークスペース/チャンネルを選択
  - 通知対象は「Production Deployments（成功/失敗）」を有効化
- メール通知
  - Project → Settings → Notifications で Production Deployments を購読（必要に応じてメンバー追加）

### Render（Backend）

- メール通知（任意）
  - Dashboard → Account/Team Settings → Notifications で Service deploys の成功/失敗を有効化
  - 対象サービスを選択し、必要に応じてチームメンバーを追加
- Slack 連携（限定的）
  - 代替として、外部サービス（Zapier/IFTTT）やメール →Slack 転送の活用を検討

備考: GitHub Actions からの通知は、本構成では採用しません（ワークフローの複雑化・実行時間増を避けるため）

---

## 付記：Supabase のトークン類について

- 本構成は `supabase migration up --db-url`（Session Pooler 接続）でリモート適用します。
  - この方式では `SUPABASE_ACCESS_TOKEN` と `SUPABASE_PROJECT_REF` は不要です。
  - 代わりに `SUPABASE_DB_URL`（パスワードを含む接続 URL）だけを使用します。
- もし将来、`supabase link` ベースの運用に切り替える場合は、
  - `SUPABASE_ACCESS_TOKEN` と `SUPABASE_PROJECT_REF` が必要になります（CLI のリンク機能を使用するため）。
