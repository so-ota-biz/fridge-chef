import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静的エクスポート
  output: "export",
  images: {
    // 画像最適化を無効化（静的エクスポート時は必須のため）
    unoptimized: true,
  },
  // S3ホスティング時は推奨されるため設定しておく
  trailingSlash: true,
};

export default nextConfig;
