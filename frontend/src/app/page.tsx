'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Title, Text, Button, Stack, Center, Loader } from '@mantine/core'
import { useAuth } from '@/lib/hooks'

const HomePage = () => {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // 認証済みの場合はダッシュボードにリダイレクト
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // 認証チェック中はローディング表示
  if (isAuthenticated) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    )
  }

  // 未認証時のランディングページ
  return (
    <Container size="md" style={{ marginTop: '10vh' }}>
      <Stack align="center" gap="xl">
        <Title order={1} size="3rem" ta="center">
          {process.env.NEXT_PUBLIC_APP_NAME || 'FridgeChef'}
        </Title>

        <Text size="xl" ta="center" c="dimmed">
          冷蔵庫にある食材から最適な料理を提案
        </Text>

        <Text size="lg" ta="center" c="dimmed">
          AIがあなたの冷蔵庫の食材から、おいしいレシピを提案します
        </Text>

        <Stack gap="md" mt="xl">
          <Button size="lg" onClick={() => router.push('/auth/signup')}>
            今すぐ始める
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/auth/signin')}>
            ログイン
          </Button>
        </Stack>
      </Stack>
    </Container>
  )
}

export default HomePage
