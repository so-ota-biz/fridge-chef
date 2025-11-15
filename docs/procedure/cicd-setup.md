---
title: CI/CD セットアップ手順（GitHub Actions × Supabase × Render × Vercel）
description: リポジトリのCI/CD方針・流れ・設定方法をまとめた完全版手順書
---

# CI/CD セットアップ手順（完全版）

## 目的と前提
- フロント: Vercel（Auto Deploy）。バックエンド: Render（Deploy Hook）
- DB/Storage: Supabase（SQLマイグレーションで一元管理）
- オーケストレーション: GitHub Actions 単一ワークフロー（deploy.yml）
- 本番ブランチ: `production`（検証時は一時的に特定featureブランチも許可）

## 全体の流れ
1) `production` に push
2) 変更検出（paths-filter）
   - backend 配下 → BEライン（DB → BE）
   - frontend 配下 → FEライン（Vercel Auto Deploy）
   - 両方 → 両方実行 / `[deploy-all]` → 両方強制実行
3) DB: Supabase CLI で `backend/supabase/migrations` を適用
4) BE: Render の Deploy Hook で再デプロイ
5) FE: Vercel は Git 連携の Auto Deploy（Ignored Build Step で無駄ビルド抑止）

---

## ワークフロー構成
- ファイル: `.github/workflows/deploy.yml`
- トリガー: `push`（`production` 他、検証用ブランチを必要に応じ追加）
- ジョブ:
  - changes: dorny/paths-filter で差分判定 + コミットメッセージ `[deploy-all]` 検出
  - migrate: Supabase CLI で `supabase link` → `supabase migration up`
  - deploy-backend: Render の Deploy Hook を叩く

Secrets（GitHub）
- 必須: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `RENDER_DEPLOY_HOOK_URL`
- 役割: Supabase への適用と Render 再デプロイを自動化

---

## 各サービスの設定

### GitHub（リポジトリ）
- production ブランチで運用（必要に応じ feature ブランチを一時追加）
- 上記 Secrets を登録

### Supabase（Database / Storage / Auth）
- マイグレーション: `backend/supabase/migrations` をCIから `supabase migration up` で適用
- Auth 設定:
  - Site URL: 本番フロントURL（例: `https://app.example.com`）
  - Redirect URLs: `https://app.example.com/auth/signin`（または `.../auth/signin?signup=success`）
- 接続方式（Render から）:
  - 注意: Render は IPv4 のみ → Direct Connection ではなく Session Pooler を利用

### Render（Backend Web Service）
- デプロイ: Docker（`backend/Dockerfile`）
- Deploy Hook: 発行して `RENDER_DEPLOY_HOOK_URL` を GitHub Secrets へ設定
- 環境変数（必須）:
  - `DATABASE_URL`（Session Pooler接続）
    - 例: `postgresql://postgres.<ref>:<ENCODED_PW>@aws-1-<region>.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1`
    - パスワードはURLエンコード（例: `@` → `%40`）
  - `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_PUBLIC_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`
  - Cookie/CORS 推奨: `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`（必要に応じ `COOKIE_DOMAIN`）

### Vercel（Frontend）
- Auto Deploy: ON（Git 連携のためOFF不可）
- 無駄ビルド抑止: Ignored Build Step を設定（差分/強制実行ルール）
  - 設定手順:
    1. Vercel Dashboard → 対象Project → Settings → Git → Ignored Build Step
    2. 下記スクリプトを貼り付けて Save
  - スクリプト（コピー用）:
    ```sh
    # [deploy-all] が含まれていれば常に実行
    echo "$VERCEL_GIT_COMMIT_MESSAGE" | grep -qi "\[deploy-all\]" && exit 1

    # 前回SHAが無い（初回など）は実行
    if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
      exit 1
    fi

    # frontend/ に差分がなければスキップ（0=スキップ, 1=実行）
    git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- frontend && exit 0 || exit 1
    ```
- 環境変数: `NEXT_PUBLIC_API_URL`（Render の BE URL）
- 独自ドメイン: 設定したら `NEXT_PUBLIC_API_URL` も独自ドメインに更新

---

## 環境変数（一覧と取得方法）
- `DATABASE_URL`: Session Pooler の接続文字列（Supabase → Database → Connection pooling → Session）
- `JWT_SECRET`: ランダム文字列（`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`）
- `SUPABASE_URL`: `https://<ref>.supabase.co`（Project Settings → API）
- `SUPABASE_PUBLIC_URL`: 上記と同じ（Storage URL変換に使用）
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key（サーバ専用）
- `FRONTEND_URL`: Vercelの本番URL or 独自ドメイン
- `NEXT_PUBLIC_API_URL`: Render の BE URL（Vercel側）
- `SUPABASE_ACCESS_TOKEN`: Supabase CLI のトークン（Account → Access Tokens）
- `SUPABASE_PROJECT_REF`: プロジェクト ref（URLや設定画面で確認）
- `RENDER_DEPLOY_HOOK_URL`: Render の Deploy Hook URL（Service → Settings → Deploy hooks）

---

## トラブルシュート
- DB接続エラー（P1001）: Session Pooler + `sslmode=require&pgbouncer=true&connection_limit=1`、PWのURLエンコード
- メール未確認: Supabase AuthのRedirect設定を本番URLに。コールバックは `/auth/signin?signup=success`
- Cookie/401: Render に `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`、`FRONTEND_URL` と CORS のorigin一致

---

## 変更時チェックリスト
- DB/Storage 変更 → `backend/supabase/migrations` にSQL → `production`へpush → CIで適用
- BE デプロイ → Deploy Hook は GitHub Actions から（deploy.yml）
- FE デプロイ → Vercel Auto Deploy（Ignored Build Step でスキップ制御）
