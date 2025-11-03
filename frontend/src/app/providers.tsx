import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { useState, useEffect } from 'react'
import { theme } from '@/styles/theme'
import { useAuthStore } from '@/lib/store'

// 認証状態復元コンポーネント
const AuthRestorer = ({ children }: { children: React.ReactNode }) => {
  const restoreAuth = useAuthStore((state) => state.restoreAuth)

  useEffect(() => {
    // アプリケーション初期化時に認証状態を復元
    restoreAuth()
  }, [restoreAuth])

  return <>{children}</>
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
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
      <MantineProvider theme={theme}>
        <AuthRestorer>{children}</AuthRestorer>
      </MantineProvider>
    </QueryClientProvider>
  )
}
