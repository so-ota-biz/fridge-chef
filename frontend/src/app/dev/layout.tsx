'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { useState } from 'react'
import { theme } from '@/styles/theme'

/**
 * 開発用ページ専用のレイアウト
 *
 * 特徴：
 * - 認証チェックを無効化
 * - AuthRestorerを実行しない
 * - auth:expiredイベントリスナーなし
 *
 * これにより、認証テストページなどで未認証状態でも自由にテストできる
 */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1分
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>{children}</MantineProvider>
    </QueryClientProvider>
  )
}
