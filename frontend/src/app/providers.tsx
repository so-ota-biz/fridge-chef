'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
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
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleAuthExpired = () => {
      clearAuth()
      router.push('/auth/signin')
    }

    window.addEventListener('auth:expired', handleAuthExpired)

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired)
    }
  }, [clearAuth, router])

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <AuthRestorer>{children}</AuthRestorer>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}
