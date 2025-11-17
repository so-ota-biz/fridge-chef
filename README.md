# FridgeChef

冷蔵庫にある食材から、AI が最適な料理レシピを提案する Web アプリケーションです。

## 🌐 公開 URL

https://fridge-chef-tau.vercel.app/

## 📦 GitHub リポジトリ

https://github.com/so-ota-biz/fridge-chef

## 🔑 デモアカウント

- **メールアドレス**: `dummy@example.com`
- **パスワード**: `Dummy1234!`

## 💡 コンセプト

冷蔵庫にある食材を有効活用し、食品ロスを削減しながら、毎日の献立を考える手間を省くことを目指したアプリケーションです。AI が食材の組み合わせから、ユーザーの好みや条件に合わせた最適なレシピを提案します。

## ✨ 主な機能

### 1. 認証機能

- ユーザー登録・ログイン
- JWT 認証によるセキュアなセッション管理

### 2. 食材選択

- カテゴリ別の食材マスタから選択
- カスタム食材の手動入力
- 選択状態の永続化（LocalStorage）

### 3. レシピ生成条件の設定

- ジャンル（和食、洋食、中華など）
- 難易度（超簡単、簡単、普通、難しい）
- 調理時間（15 分以内、30 分以内など）
- 人数（1〜10 人分）

### 4. AI レシピ提案

- 選択した食材と条件に基づいて、AI が 3 つのレシピを生成
- レシピ詳細（材料、手順、調理時間など）の表示
- レシピ画像の自動生成

### 5. 調理記録管理

- 作ったレシピの記録作成
- 評価（星 5 段階）とメモの保存
- 調理記録の一覧表示・詳細確認
- 調理記録の編集・削除

### 6. レスポンシブデザイン

- スマートフォン、タブレット、デスクトップに対応
- Mantine UI による洗練された UI/UX

## 🛠️ 使用技術

### Frontend

- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **UI ライブラリ**: Mantine UI
- **状態管理**: Zustand
- **データフェッチング**: TanStack Query (React Query)
- **HTTP クライアント**: Axios
- **フォーム管理**: React Hook Form + Zod
- **アイコン**: Heroicons

### Backend

- **フレームワーク**: NestJS
- **言語**: TypeScript
- **ORM**: Prisma
- **データベース**: Supabase (PostgreSQL)
- **認証**: Passport + JWT
- **パスワードハッシュ化**: bcrypt
- **バリデーション**: class-validator + class-transformer
- **画像処理**: Sharp

### インフラ・デプロイ

- **フロントエンド**: Vercel
- **バックエンド**: Render
- **データベース**: Supabase
