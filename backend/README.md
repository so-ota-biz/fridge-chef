# FridgeChef バックエンド - ローカル開発環境構築

## 概要

- NestJS + Prisma + Supabase(PostgreSQL)。
- Supabase は Supabase CLI により Docker コンテナで起動します。
- 認証はローカルストレージに JWT トークン（アクセストークン／リフレッシュトークン）を保存する方式を採用しています。

## なぜクローン直後に Lint エラーが多発するのか

`npm run lint` を実行すると下記のようなエラーが大量に出ることがあります。

- error Unsafe assignment of an `any` value @typescript-eslint/no-unsafe-assignment
- error Unsafe call of a(n) `any` typed value @typescript-eslint/no-unsafe-call

**原因:** Prisma クライアントが未生成のため、`PrismaClient` が any 型として扱われるためです。

// 例: node_modules/.prisma/client/index.d.ts（生成前の初期状態）
// export declare const PrismaClient: any

**対処:** Prisma クライアントは自動生成ファイル（Git 管理外）です。コンテナ内で `npm run db:generate` を実行してクライアントを生成してください（手順に含まれます）。

---

## 前提条件

- Docker Desktop（起動済み）
- Supabase CLI
- Git

### Supabase CLI のインストール

- macOS: `brew install supabase/tap/supabase`
- Windows（Scoop）:
  - `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git`
  - `scoop install supabase`
- Linux: https://supabase.com/docs/guides/cli/getting-started を参照

### 環境変数

`backend/.env.example` を `backend/.env` にコピーして編集します。最低限、以下を設定します。

- DATABASE_URL（例: 127.0.0.1:54322）
- SUPABASE_URL（コンテナ間通信用: `http://supabase_kong_fridge-chef:8000`）
- SUPABASE_PUBLIC_URL（ブラウザ用: `http://127.0.0.1:54321`）
- SUPABASE_INTERNAL_URL（内部URL: `http://supabase_kong_fridge-chef:8000`）
- SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_JWT_SECRET
- JWT_SECRET / JWT_EXPIRES_IN
- FRONTEND_URL（例: `http://localhost:3001`）
- OPENAI_API_KEY / OPENAI_API_BASE_URL / OPENAI_GPT_MODEL

#### 環境変数一覧（サマリ）

データベース接続

- `DATABASE_URL`
  - 用途: Prisma が PostgreSQL に接続するための接続文字列
  - 既定値: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
  - 説明: ローカル Supabase の既定接続先。Docker Compose 起動時は、下記の個別変数から組み立てた `DATABASE_URL` が優先されます。

Docker 用の個別データベース変数（Docker Compose 使用時のみ）

| 変数名        | 用途                   | デフォルト値          |
| ------------- | ---------------------- | --------------------- |
| `DB_HOST`     | データベースホスト名   | `supabase_db_backend` |
| `DB_PORT`     | データベースポート     | `5432`                |
| `DB_NAME`     | データベース名         | `postgres`            |
| `DB_USER`     | データベースユーザー名 | `postgres`            |
| `DB_PASSWORD` | データベースパスワード | `postgres`            |

Supabase 関連

- `SUPABASE_JWT_SECRET`
  - 用途: Supabase 内部の JWT 検証用シークレット
  - 既定値: `XFmrrNXIHi2um393z31/76MAYs5U7YJ1t3sMXPUtxvE=`
  - 説明: Supabase ローカル環境の既定シークレット（公開値）。本番では必ず独自値に変更してください。
    - 参照先: `supabase/config.toml` の `auth.jwt_secret = "env(SUPABASE_JWT_SECRET)"`
    - 本番環境では強力なランダム文字列に変更すること

- `SUPABASE_URL`
  - 用途: Supabase API のエンドポイント（バックエンドからのアクセス用）
  - 既定値: `http://127.0.0.1:54321`
  - 説明: ホスト起動時は `http://127.0.0.1:54321`、Docker 起動時は `http://supabase_kong_fridge-chef:8000`（コンテナ間通信）

- `SUPABASE_PUBLIC_URL`
  - 用途: Supabase API の公開 URL（ブラウザからのアクセス用）
  - 既定値: `http://127.0.0.1:54321`
  - 説明: フロントエンドやブラウザから Supabase にアクセスする際の URL。Docker 開発でも基本は `http://127.0.0.1:54321` を使用

- `SUPABASE_INTERNAL_URL`
  - 用途: Docker 環境で生成される内部 URL（Storage の公開 URL 置換時の置換元）
  - 既定値: `http://supabase_kong_fridge-chef:8000`
  - 説明: `ai.service.ts` / `users.service.ts` で、Storage が返す内部 URL を `SUPABASE_PUBLIC_URL` に置換するために使用

- `SUPABASE_ANON_KEY`
  - 用途: Supabase 匿名アクセス用の JWT トークン
  - 既定値: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - 説明: Supabase ローカル環境の既定キー（公開値）。RLS 有効時の匿名アクセスで使用。本番では Supabase ダッシュボードから取得

- `SUPABASE_SERVICE_ROLE_KEY`
  - 用途: Supabase 管理者権限用の JWT トークン
  - 既定値: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - 説明: RLS をバイパスして全データへアクセス可能。バックエンドの管理操作で使用。本番は Supabase ダッシュボードから取得。絶対にフロントエンドへ公開しないこと

🔑 NestJS JWT認証（アプリケーション独自の認証）

- `JWT_SECRET`
  - 用途: NestJS アプリケーション独自の JWT 署名鍵
  - 既定値: `OoNeqbK6YAIUNMBBsaypaJjOZu5U+ETKr6ETr6L/YRQ=`
  - 説明:
    - Supabase の JWT とは別物
    - ユーザーログイン後のアクセストークン生成に使用
    - 本番環境では強力なランダム文字列に変更すること（定期的なローテーションを推奨）

  生成例

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

- `JWT_EXPIRES_IN`
  - 用途: アクセストークンの有効期限（例: `15m`）
  - 既定値: `15m`
  - 説明: 15分後にトークンが失効。認証のユーザビリティとセキュリティ要件に応じて調整
- `ACCESS_TOKEN_MAX_AGE_MS` / `REFRESH_TOKEN_MAX_AGE_MS` / `CSRF_TOKEN_MAX_AGE_MS`
  - 用途: 各トークンの有効期限（ミリ秒）
  - 既定値: `.env.example` を参照（開発用サンプル）

トークン期限設定（オプション）

| 変数名                     | 用途                         | デフォルト値 | 説明             |
| -------------------------- | ---------------------------- | ------------ | ---------------- |
| `ACCESS_TOKEN_MAX_AGE_MS`  | アクセストークン有効期限     | `900000`     | 15分（ミリ秒）   |
| `REFRESH_TOKEN_MAX_AGE_MS` | リフレッシュトークン有効期限 | `604800000`  | 7日（ミリ秒）    |
| `CSRF_TOKEN_MAX_AGE_MS`    | CSRFトークン有効期限         | `86400000`   | 24時間（ミリ秒） |

🌐 CORS 設定

- `FRONTEND_URL`
  - 用途: フロントエンドのオリジン（CORS 許可リストに使用）
  - 既定値: `http://localhost:3001`
  - 説明:
    - CORS の `origin` 設定に使用
    - 末尾スラッシュなしで完全一致が必須

#### 環境変数の詳細

- Database
  - `DATABASE_URL`: Prisma が接続する PostgreSQL の接続文字列。
    - 例: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
    - 備考: `docker-compose.yml` では `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` から組み立てられます。
  - `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD`: コンテナ内で `DATABASE_URL` を生成するための要素。ローカル開発は `.env.example` の既定値で可。

- Supabase（URL/鍵）
  - `SUPABASE_URL`: API への内部通信用 URL（サーバー→Supabase）。Docker 開発では `http://supabase_kong_fridge-chef:8000` を使用します。
  - `SUPABASE_PUBLIC_URL`: ブラウザから到達可能な URL。ローカル開発では `http://127.0.0.1:54321` を使用します。
  - `SUPABASE_ANON_KEY`: 匿名ロールの公開鍵。ローカル CLI 既定値を使用可能（`.env.example` 参照）。
  - `SUPABASE_SERVICE_ROLE_KEY`: Service Role 用の秘密鍵。サーバー側の管理操作（例: Storage へのアップロード）で使用。
  - `SUPABASE_JWT_SECRET`: Supabase Auth の JWT シークレット。CLI 既定値で動作しますが、本番では必ず独自値に変更してください。

- アプリ独自認証（JWT）
  - `JWT_SECRET`: アプリが発行する独自 JWT の署名鍵。必須。開発と本番で値を分けること。
  - `JWT_EXPIRES_IN`: アクセストークンの有効期限（例: `15m`）。
  - `ACCESS_TOKEN_MAX_AGE_MS`/`REFRESH_TOKEN_MAX_AGE_MS`/`CSRF_TOKEN_MAX_AGE_MS`: トークン類の有効期限（ミリ秒）。`.env.example` を参照。

- フロントエンド/CORS
  - `FRONTEND_URL`: 許可するフロントのオリジン。完全一致かつ末尾スラッシュなし（例: `http://localhost:3001`）。
  - 備考: フロント側は `NEXT_PUBLIC_API_URL` をバックエンドの URL（例: `http://localhost:3000`）に設定。

- OpenAI
  - `OPENAI_API_KEY`: OpenAI API キー（必須）。
  - `OPENAI_API_BASE_URL`: API ベース URL。既定は `https://api.openai.com/v1`。
  - `OPENAI_GPT_MODEL`: 使用モデル（例: `gpt-4o` / `gpt-4o-mini`）。

## 🤖 OpenAI API

- `OPENAI_API_KEY`
  - 用途: OpenAI API の認証キー
  - 既定値: `your_own_api_key`
  - 説明:
    - レシピ生成（GPT-4）とレシピ画像生成（DALL-E 3）に使用
    - 必ず自分の API キーに変更すること
    - 取得方法: https://platform.openai.com/api-keys

- `OPENAI_API_BASE_URL`
  - 用途: OpenAI API のベース URL
  - 既定値: `https://api.openai.com/v1`
  - 説明: プロキシや Azure OpenAI 等を使う場合に変更

- `OPENAI_GPT_MODEL`
  - 用途: 使用する GPT モデル名
  - 既定値: `gpt-4o`
  - 説明:
    - コスト重視: `gpt-4o-mini`
    - 精度重視: `gpt-4o`

---

## 環境別の設定例（参考）

注意: 手順は Docker 前提です。以下は環境変数の参考例です。

### ローカル開発（ホスト直接起動）

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Supabase
SUPABASE_JWT_SECRET="XFmrrNXIHi2um393z31/76MAYs5U7YJ1t3sMXPUtxvE="
SUPABASE_URL="http://127.0.0.1:54321"
SUPABASE_PUBLIC_URL="http://127.0.0.1:54321"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# JWT
JWT_SECRET="OoNeqbK6YAIUNMBBsaypaJjOZu5U+ETKr6ETr6L/YRQ="
JWT_EXPIRES_IN="15m"

# Frontend
FRONTEND_URL="http://localhost:3001"

# OpenAI
OPENAI_API_KEY="sk-proj-..."  # 自分のキーに変更
OPENAI_API_BASE_URL="https://api.openai.com/v1"
OPENAI_GPT_MODEL="gpt-4o"
```

### ローカル開発（Docker Compose）

```bash
# Database (Docker 用)
DB_HOST="supabase_db_backend"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Supabase（内部通信用は Kong 経由）
SUPABASE_JWT_SECRET="XFmrrNXIHi2um393z31/76MAYs5U7YJ1t3sMXPUtxvE="
SUPABASE_URL="http://supabase_kong_fridge-chef:8000"
SUPABASE_PUBLIC_URL="http://127.0.0.1:54321"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# JWT
JWT_SECRET="OoNeqbK6YAIUNMBBsaypaJjOZu5U+ETKr6ETr6L/YRQ="
JWT_EXPIRES_IN="15m"

# Frontend
FRONTEND_URL="http://localhost:3001"

# OpenAI
OPENAI_API_KEY="sk-proj-..."
OPENAI_API_BASE_URL="https://api.openai.com/v1"
OPENAI_GPT_MODEL="gpt-4o"
```

### 本番環境（Render + Supabase）

```bash
# Database（Supabase から取得）
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"

# Supabase（ダッシュボードから取得）
SUPABASE_JWT_SECRET="[本番環境のJWT Secret]"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_PUBLIC_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[本番環境のAnon Key]"
SUPABASE_SERVICE_ROLE_KEY="[本番環境のService Role Key]"

# JWT（強力なランダム文字列に変更）
JWT_SECRET="[ランダム生成した64文字以上の文字列]"
JWT_EXPIRES_IN="15m"

# Frontend（Vercel URL）
FRONTEND_URL="https://fridge-chef-tau.vercel.app"

# OpenAI
OPENAI_API_KEY="sk-proj-[本番用のAPIキー]"
OPENAI_API_BASE_URL="https://api.openai.com/v1"
OPENAI_GPT_MODEL="gpt-4o"
```

注意:

- 秘密情報（`*_SECRET`, `*_KEY`）は本番で必ず強力な値に置き換え、リポジトリに含めないでください。
- `SUPABASE_URL` はサーバー内部の通信用、`SUPABASE_PUBLIC_URL` はブラウザ用です。用途を混在させないでください。

---

## 手順

### 1. 環境変数ファイルの用意

```bash
cp .env.example .env
# 必要に応じて値を編集
```

### 2. Supabase を起動

```bash
cd backend
supabase start
```

#### 補足:

- Supabase CLI は固定ポート（API: 54321 / DB: 54322 / Studio: 54323）を使用します。他プロジェクトが動作中の場合は `supabase stop` で停止してください。

### 3. データベースとPrismaのセットアップ

```bash
npm run db:setup
```

#### 理由:

- `supabase:reset` - マイグレーションを適用してDBスキーマを構築
- `db:types` - Supabaseから型定義を生成 (`src/types/database.types.ts`)
- `db:generate` - Prismaクライアントを生成（Lintエラー解消）
- `db:pull` - PrismaスキーマをDBから同期

### 4. API コンテナを起動

```bash
docker compose up -d --build
# API: http://localhost:3000
```

### 5. 開発時によく使う操作

- API コンテナ停止: `docker compose down`
- ログ表示: `docker compose logs -f api`
- Lint 実行: `docker compose exec api npm run lint`
- テスト: `docker compose exec api npm run test`
- シェルに入る: `docker compose exec api sh`

## フロントエンドとの接続

- フロントの `.env.local` で `NEXT_PUBLIC_API_URL=http://localhost:3000` を設定します。
- CORS は `FRONTEND_URL` と完全一致（末尾スラなし）にしてください。

## 運用方針（DB と Prisma）

- DB スキーマは `backend/supabase/migrations` で管理し、CI から適用します。
- Prisma はクライアント生成・型補完のために利用し、スキーマ変更時は `docker compose exec api npm run db:pull` で同期後、`npm run db:generate` を実行します。

## トラブルシューティング

- Lint エラーが大量に出る
  - `docker compose exec api npm run db:generate` を実行し、Prisma Client を再生成してください。
- API から Supabase に接続できない
  - `supabase start` 実行中か確認します。
  - API コンテナから `http://supabase_kong_fridge-chef:8000` に疎通できるか確認します（例: `docker compose exec api wget -qO- http://supabase_kong_fridge-chef:8000`）。
  - `.env` の `SUPABASE_URL` は `http://supabase_kong_fridge-chef:8000`、`SUPABASE_PUBLIC_URL` は `http://127.0.0.1:54321` を使用します。
- ポート競合
  - 他の Supabase プロジェクトが動いている場合は該当プロジェクト側で `supabase stop` を実行し停止してください。

## 備考（CORS）

- 本番のクロスサイト構成（例: Frontend=Vercel / Backend=Render）では、`FRONTEND_URL` と CORS の `origin` を完全一致（末尾スラなし）にしてください。
- フロントでは `NEXT_PUBLIC_API_URL` にバックエンドの公開 URL を設定します。
- 本番環境例: https://fridge-chef-tau.vercel.app

---

## セキュリティ注意事項

### 絶対に変更すべき値（本番環境）

- `JWT_SECRET` — 強力なランダム文字列
- `SUPABASE_JWT_SECRET` — Supabase ダッシュボードから取得
- `SUPABASE_SERVICE_ROLE_KEY` — 絶対にフロントエンドに公開しない
- `OPENAI_API_KEY` — 自分の API キー

### ローカル開発でそのまま使えるデフォルト値

- Supabase 関連の鍵はローカル環境用の公開値（`.env.example` のままで可）
- `OPENAI_API_KEY` のみ自分のキーに変更が必要

### .env ファイルの取り扱い

- `.env` は絶対に Git にコミットしない（`.gitignore` で除外済み）
- `.env.example` はコミットして OK（センシティブな値を含まない）
