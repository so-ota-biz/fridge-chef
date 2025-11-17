import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 静的エクスポート（認証問題解決のため）
  output: 'export',
  images: {
    // 画像最適化を無効化（静的エクスポート時は必須）
    unoptimized: true,
  },
  // S3ホスティング時は推奨されるため設定
  trailingSlash: true,
}

export default nextConfig
