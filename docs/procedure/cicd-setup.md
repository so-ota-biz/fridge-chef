---
title: CI/CD セットアップ手順（GitHub Actions × Supabase × Render × Vercel）
description: 本リポジトリのCI/CD方針・流れ・設定方法の完全版。VercelはAuto Deploy（OFF不可）のため、Git-basedデプロイは常時スキップし、Deploy Hookで本番を起動します。
---

# CI/CD セットアップ手順（完全版）

## 方針とトリガー
- 本番ブランチ: `production`
- フロント: Vercel（Auto DeployはOFF不可 → Git-basedは常時スキップ、Deploy Hookで本番反映）
- バックエンド: Render（Deploy Hookで反映）
- DB/Storage: Supabase（SQLマイグレーション一元管理）
- オーケストレーション: GitHub Actions（`.github/workflows/deploy.yml`）

## フロー（productionにpush）
1. 変更検出（paths-filter）
   - backend配下 → BEライン（DB → BE）
   - frontend配下 → FEライン（FE）
   - 両方 → 両方実行
   - `[deploy-all]` をコミットメッセージに含めると両方強制実行
2. DB: Supabase CLI で `backend/supabase/migrations` を適用
3. BE: RenderのDeploy Hookで再デプロイ
4. FE: VercelのDeploy Hookで本番デプロイ（Git-basedは常時スキップのため走らない）

---

## ワークフロー（deploy.yml）
- トリガー: `push`（`production`、検証が必要な間は特定 feature ブランチも追加可能）
- ジョブ:
  - changes: 差分検出と `[deploy-all]` 検出
  - migrate: Supabase へのマイグレーション適用
  - deploy-backend: Render Deploy Hook 実行
  - deploy-frontend-after-backend: BE変更もある場合に、BEの完了後にVercel Deploy Hookを実行
  - deploy-frontend-only: FE変更のみの場合にVercel Deploy Hookを実行

Secrets（GitHub、すべて必須）
- `SUPABASE_ACCESS_TOKEN`: Supabase CLI トークン
- `SUPABASE_PROJECT_REF`: Supabase プロジェクトref
- `SUPABASE_DB_PASSWORD`: Supabase プロジェクト作成時のDatabase Password（postgresユーザーのパスワード）
- `RENDER_DEPLOY_HOOK_URL`: Render Deploy Hook（Production）
- `VERCEL_DEPLOY_HOOK_URL`: Vercel Deploy Hook（Production / branch=production）

---

## 各サービスの設定

### Supabase（Database / Storage / Auth）
- マイグレーション: `backend/supabase/migrations` をCIから `supabase migration up` で適用
- Auth 設定:
  - Site URL: 本番フロントURL（例: `https://app.example.com`）
  - Redirect URLs: `https://app.example.com/auth/signin`（または `.../auth/signin?signup=success`）
- 接続: Render からは Session Pooler（IPv4対応）を使用

### Render（Backend Web Service）
- デプロイ: Docker（`backend/Dockerfile`）
- Deploy Hook: Production Hook を発行し、URLをGitHub Secrets `RENDER_DEPLOY_HOOK_URL` に登録
- 環境変数（必須）
  - `DATABASE_URL`: Session Pooler接続文字列（例: `...pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1`。PWはURLエンコード）
  - `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_PUBLIC_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`
  - Cookie/CORS 推奨: `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`（必要時 `COOKIE_DOMAIN`）

### Vercel（Frontend）
- Auto Deploy: ON（変更不可）
- Git-based デプロイを無効化（常時スキップ）
  - Settings → Git → Ignored Build Step → 「Don't build anything」を選択
  - これにより、main等のGit連携による自動ビルドは走りません
- Deploy Hook の作成
  - Settings → Deploy Hooks → Production 用のHookを作成
  - Branch: `production` を指定
  - 取得したURLを GitHub Secrets `VERCEL_DEPLOY_HOOK_URL` へ登録
- 環境変数
  - `NEXT_PUBLIC_API_URL`: Render のバックエンドURL
- 独自ドメイン
  - 設定したら `NEXT_PUBLIC_API_URL` も独自ドメインへ更新

---

## 環境変数（取得先）
- `DATABASE_URL`: Supabase → Database → Connection pooling → Session → Prisma/Node
- `JWT_SECRET`: 任意生成（例: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`）
- `SUPABASE_URL`: Project Settings → API（`https://<ref>.supabase.co`）
- `SUPABASE_PUBLIC_URL`: 同上（Storage URL変換に使用）
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API → Service role key
- `FRONTEND_URL`: Vercel本番URLまたは独自ドメイン
- `NEXT_PUBLIC_API_URL`: Render の BE URL（Vercel）
- `SUPABASE_ACCESS_TOKEN`: Supabase → Account → Access Tokens
- `SUPABASE_PROJECT_REF`: プロジェクトURLや設定画面で確認
- `SUPABASE_DB_PASSWORD`: Supabase プロジェクト作成時に設定した Database Password（Settings → Database）
- `RENDER_DEPLOY_HOOK_URL`: Render → Service → Settings → Deploy hooks
- `VERCEL_DEPLOY_HOOK_URL`: Vercel → Project → Settings → Deploy Hooks（Production / branch=production）

---

## トラブルシュート
- P1001（DB到達不可）: Session Pooler + `sslmode=require&pgbouncer=true&connection_limit=1`、PW URLエンコード
- サインイン不可（未確認）: Supabase Auth の Redirect を本番URLに。`/auth/signin?signup=success` を利用
- Cookie/401: `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`、`FRONTEND_URL` と CORS のorigin一致

---

## チェックリスト
- GitHub Secrets（4点）を登録: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `RENDER_DEPLOY_HOOK_URL`, `VERCEL_DEPLOY_HOOK_URL`
- Supabase: SQLマイグレーションが `backend/supabase/migrations` にあり、CIから適用される
- Render: 環境変数を設定、Deploy Hook発行済み
- Vercel: Ignored Build Step = Don't build anything、Deploy Hook(Production, branch=production)発行、`NEXT_PUBLIC_API_URL` 設定
