import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 動的ルーティングのために静的エクスポートを無効化
  // output: 'export',
  images: {
    // 画像最適化を有効化（動的ルーティング時は使用可能）
    unoptimized: false,
  },
  // トレイリングスラッシュは必要に応じて設定
  trailingSlash: false,
}

export default nextConfig
