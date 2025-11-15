---
title: CI/CD セットアップ手順（GitHub Actions × Supabase × Render × Vercel）
description: 本番ブランチを production とし、GitHub Actions で Supabase → Render → Vercel の順にデプロイする手順書。
---

# CI/CD セットアップ手順（最終構成）

## 方針とトリガー
- 本番ブランチ: `production`
- フロント: Vercel（Production Branch を `production` に設定、Deploy Hook で本番反映）
- バックエンド: Render（Deploy Hook で本番反映）
- DB/Storage: Supabase（SQL マイグレーションを GitHub Actions で適用）
- オーケストレーション: GitHub Actions（`.github/workflows/deploy.yml`）

## フロー（production に push）
1. 差分検出（paths-filter）
   - backend 配下 → BE ライン（DB → BE）
   - frontend 配下 → FE ライン（FE）
   - 両方 → 両方実行（順序は BE → FE）
   - `[deploy-all]` をコミットメッセージに含めると両方強制実行
2. DB: Supabase CLI で `backend/supabase/migrations` をリモート適用（Session Pooler 経由）
3. BE: Render の Deploy Hook を叩いて再デプロイ（Hook の HTTP ステータス/レスポンスをログ出力）
4. FE: Vercel の Deploy Hook（Production / branch=production）を叩いて本番デプロイ（Hook の HTTP ステータス/レスポンスをログ出力）
   - プレビューデプロイ（preview）は Vercel 側でこれまで通り実行されます（Hook は Production のみ）

---

## ワークフロー（deploy.yml）
- トリガー: `push`（`production`。検証時は一時的に特定 feature ブランチも追加）
- ジョブ（要旨）:
  - changes: 差分検出と `[deploy-all]` 検出
  - migrate: `supabase migration up --db-url "$SUPABASE_DB_URL"` で SQL を適用
  - deploy-backend: Render Deploy Hook 実行（HTTP コード/レスポンスを出力）
  - deploy-frontend-after-backend: BE 変更がある場合、BE 完了後に Vercel Deploy Hook 実行
  - deploy-frontend-only: FE のみ変更の場合に Vercel Deploy Hook 実行

Secrets（GitHub、すべて必須）
- `SUPABASE_DB_URL`: Supabase Session Pooler の接続 URL（例: `...pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1`。パスワードは URL エンコード）
- `RENDER_DEPLOY_HOOK_URL`: Render の Deploy Hook（Production）
- `VERCEL_DEPLOY_HOOK_URL`: Vercel の Deploy Hook（Production / branch=production）

---

## 各サービスの設定

### Supabase（Database / Storage / Auth）
- マイグレーション: `backend/supabase/migrations` を CI から適用
- Auth 設定:
  - Site URL: 本番フロント URL（例: `https://app.example.com`）
  - Redirect URLs: `https://app.example.com/auth/signin`（または `.../auth/signin?signup=success`）
- 接続方式（CLI/BE とも）: Session Pooler（Direct は IPv6 依存で不安定）

### Render（Backend Web Service）
- デプロイ: Docker（`backend/Dockerfile`）
- Deploy Hook: Production 用 Hook を発行し、URL を Secrets `RENDER_DEPLOY_HOOK_URL` に設定
- 環境変数（必須）
  - `DATABASE_URL`: Session Pooler の接続 URL（上記と同等。PW は URL エンコード）
  - `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_PUBLIC_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`
  - Cookie/CORS 推奨: `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`（必要時 `COOKIE_DOMAIN`）

### Vercel（Frontend）
- Production Branch: `production` を選択（Console UI で設定済み）
- Deploy Hook: Production / branch=production を作成し、Secrets `VERCEL_DEPLOY_HOOK_URL` に設定
- 環境変数: `NEXT_PUBLIC_API_URL`（Render の BE URL）
- 独自ドメイン: 設定したら `NEXT_PUBLIC_API_URL` も独自ドメインに更新
- 備考: プレビューデプロイ（preview）は従来どおり自動実行（Hook は本番用のみ使用）

---

## 環境変数（取得先）
- `DATABASE_URL`: Supabase → Database → Connection pooling → Session → Prisma/Node
- `JWT_SECRET`: 任意生成（例: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`）
- `SUPABASE_URL`: Project Settings → API（`https://<ref>.supabase.co`）
- `SUPABASE_PUBLIC_URL`: 同上（Storage URL 変換）
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API → Service role key
- `FRONTEND_URL`: Vercel 本番 URL or 独自ドメイン
- `NEXT_PUBLIC_API_URL`: Render の BE URL（Vercel）
- `SUPABASE_DB_URL`: Session Pooler 接続 URL（PW は URL エンコード）
- `RENDER_DEPLOY_HOOK_URL`: Render → Service → Settings → Deploy hooks
- `VERCEL_DEPLOY_HOOK_URL`: Vercel → Project → Settings → Deploy Hooks（Production / branch=production）

---

## トラブルシュート
- P1001（DB 到達不可）: Session Pooler + `sslmode=require&pgbouncer=true&connection_limit=1`、PW の URL エンコード
- サインイン不可（未確認）: Supabase Auth の Redirect を本番 URL に。`/auth/signin?signup=success` を使用
- Cookie/401: `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`、`FRONTEND_URL` と CORS の origin 一致
- Vercel がデプロイされない: Deploy Hook の応答（HTTP ステータス/レスポンス）を Actions ログで確認。Production Branch が `production` になっているか再確認

---

## チェックリスト
- GitHub Secrets: `SUPABASE_DB_URL`, `RENDER_DEPLOY_HOOK_URL`, `VERCEL_DEPLOY_HOOK_URL`
- Supabase: SQL が `backend/supabase/migrations` にあり、CI が適用
- Render: 環境変数設定済み、Deploy Hook 発行済み
- Vercel: Production Branch = `production`、Production Deploy Hook 発行、`NEXT_PUBLIC_API_URL` 設定

---

## 通知設定（Slack / メール）

### Vercel（Frontend）
- Slack 連携（利用可）
  - Project → Integrations → Slack → Add から対象ワークスペース/チャンネルを選択
  - 通知対象は「Production Deployments（成功/失敗）」を有効化
- メール通知
  - Project → Settings → Notifications で Production Deployments を購読（チームメンバー追加で複数宛先）

### Render（Backend）
- メール通知（利用可）
  - Dashboard 右上 → Account/Team Settings → Notifications で Service deploys の成功/失敗を有効化
  - 対象サービスを選択し、必要ならチームメンバーを追加
- Slack 連携（現時点では第一級サポートは限定的）
  - 代替案として、外部サービス（例: Zapier/IFTTT）やメール→Slack転送を活用
  - YAML 複雑化や待機は避けるため、まずはメール通知を推奨

備考: GitHub Actions からの通知は、本構成では採用しません（ワークフローの複雑化・実行時間増を避けるため）。

---

## 付記：Supabase のトークン類について

- 本構成は `supabase migration up --db-url`（Session Pooler 接続）でリモート適用します。
  - この方式では `SUPABASE_ACCESS_TOKEN` と `SUPABASE_PROJECT_REF` は不要です。
  - 代わりに `SUPABASE_DB_URL`（パスワードを含む接続URL）だけを使用します。
- もし将来、`supabase link` ベースの運用に切り替える場合は、
  - `SUPABASE_ACCESS_TOKEN` と `SUPABASE_PROJECT_REF` が必要になります（CLI のリンク機能を使用するため）。
