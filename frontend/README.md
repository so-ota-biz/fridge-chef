## FridgeChef Frontend

AI が冷蔵庫内の食材から最適なレシピを提案するアプリケーションのフロントエンドです。Next.js App Router + Mantine + React Query + Zustand で構成し、バックエンド（NestJS）と REST API で連携します。

## 技術スタック

| 分類                    | 内容                                          |
| ----------------------- | --------------------------------------------- |
| UI                      | Next.js 16 (App Router), React 19, Mantine UI |
| 状態管理                | Zustand + react-query                         |
| フォーム/バリデーション | react-hook-form + Zod                         |
| HTTP                    | Axios（リフレッシュ対応インターセプター付）   |

## ディレクトリ構成（抜粋）

```text
frontend/
├─ src/
│  ├─ app/              # ルーティング（App Router）
│  ├─ components/       # レイアウト/共通コンポーネント
│  ├─ lib/
│  │  ├─ api/           # axios クライアント＆API ラッパー
│  │  ├─ hooks/         # カスタムフック
│  │  └─ store/         # Zustand ストア
│  └─ types/            # 共通型定義
└─ package.json
```

## 必要な環境変数

`.env.local` に最低限以下を設定してください。

```bash
NEXT_PUBLIC_APP_NAME=FridgeChef
NEXT_PUBLIC_API_URL=http://localhost:3000 # NestJS バックエンドの URL
```

## セットアップ

1. 依存関係インストール

   ```bash
   cd frontend
   npm install
   ```

2. 開発サーバー起動（バックエンドとポートが重ならないよう 3001 番で起動）

   ```bash
   npm run dev -- --port 3001
   ```

3. ブラウザで `http://localhost:3001` を開く

バックエンド（`/backend` ディレクトリの NestJS アプリ）はポート 3000 で起動し、`NEXT_PUBLIC_API_URL` で指定した URL（デフォルト: `http://localhost:3000`）を受け付けるようにします。

```bash
cd backend
npm install
npm run start:dev
```

## 認証フロー

1. `/auth/signup` でメール + パスワード登録
2. `/auth/signin` でログイン
3. アクセストークン／リフレッシュトークンは `localStorage` に保存し、axios インターセプターで自動リフレッシュ
4. Zustand にユーザー情報とトークンを保持し、`MainLayout` で認証ガード

## テスト・Lint

```bash
npm run lint
npm run format:check
```

## デプロイ

`next build` → `next export` により静的ファイルを生成し、S3 + CloudFront などに配置予定です。CSP などのヘッダーはホスティング側（例: CloudFront レスポンスヘッダーポリシー）で設定してください。
