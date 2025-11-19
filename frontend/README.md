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

補足

- バックエンドは `http://localhost:3000` で待ち受けます（backend/README.md の Docker 前提手順に従って起動）。
- CORS を通すため、バックエンド側では `FRONTEND_URL` を `http://localhost:3001`（末尾スラッシュなし）に設定してください。

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

バックエンドの起動は `backend/README.md` を参照してください（Docker 前提）。`NEXT_PUBLIC_API_URL` はバックエンドの URL（デフォルト: `http://localhost:3000`）に合わせます。

## 認証フロー

1. `/auth/signup` でメール + パスワード登録
2. `/auth/signin` でログイン
3. JWTトークンは `localStorage` に保存し、axios インターセプターで `Authorization: Bearer {token}` ヘッダーを自動付与
4. Zustand にユーザー情報とトークンを保持し、`MainLayout` で認証ガード
5. トークン無効時（401エラー）は自動ログアウト処理

## テスト・Lint

```bash
npm run lint
npm run format:check
```

## デプロイ

- 推奨: Vercel（本番 URL 例: `https://fridge-chef-tau.vercel.app`）
- 環境変数
  - `NEXT_PUBLIC_API_URL`: バックエンドの公開 URL（Render など）
- 注意
  - CORS はバックエンド側で `FRONTEND_URL`（Vercel の URL）と完全一致（末尾スラッシュなし）になるよう設定
  - 画像や API の通信先が混在しないよう、本番・開発それぞれに適切な URL を設定
