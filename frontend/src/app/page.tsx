'use client'

import { useRouter } from 'next/navigation'
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Paper,
  Center,
  Loader,
  Divider,
} from '@mantine/core'
import { MainLayout } from '@/components/layout'
import { RecordCard } from '@/components/record'
import { useAuth, useRecords, useRecipeSearchClear } from '@/lib/hooks'
import { useAuthStore } from '@/lib/store'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const isAuthRestored = useAuthStore((state) => state.isAuthRestored)

  // レシピ検索関連のストアを一括クリアする関数
  const clearRecipeSearch = useRecipeSearchClear()

  // 認証済みの場合のみ調理記録を取得
  const { data: recordsData } = useRecords(
    { limit: 3, offset: 0 },
    { enabled: isAuthenticated && isAuthRestored },
  )

  // データの取得
  const recordsCount = recordsData?.total || 0
  const recentRecords = recordsData?.records || []

  // 新規レシピ検索開始ハンドラ
  const handleStartNewSearch = () => {
    // 前回の検索状態をクリアして新鮮な状態で開始
    clearRecipeSearch()
    router.push('/ingredients')
  }

  // 認証復元中
  if (!isAuthRestored) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    )
  }

  // 未認証時のランディングページ
  if (!isAuthenticated) {
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

  return (
    <MainLayout>
      <Container size="lg" mt="xl">
        <Stack gap="xl">
          {/* ウェルカムセクション */}
          <Paper withBorder p="xl" radius="md">
            <Stack gap="md">
              <Title order={2}>👋 こんにちは！</Title>
              <Text size="lg" c="dimmed">
                今日も美味しい料理を作りましょう
              </Text>
              <div>
                <Button
                  size="lg"
                  leftSection={<span>🥕</span>}
                  onClick={handleStartNewSearch}
                >
                  食材を選んでレシピを探す
                </Button>
              </div>
            </Stack>
          </Paper>

          {/* 統計カード */}
          <Group grow>
            <Paper withBorder p="md" radius="md">
              <Stack gap="xs" align="center">
                <Text size="sm" c="dimmed">
                  作った料理
                </Text>
                <Group gap="xs">
                  <Text size="xl" fw={700} c="orange">
                    {recordsCount}
                  </Text>
                  <Text size="md" c="dimmed">
                    品
                  </Text>
                </Group>
              </Stack>
            </Paper>

            <Paper withBorder p="md" radius="md" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <Stack gap="xs" align="center">
                <Text size="sm" c="dimmed">
                  お気に入り
                </Text>
                <Group gap="xs">
                  <Text size="xl" fw={700} c="green">
                    -
                  </Text>
                  <Text size="md" c="dimmed">
                    品
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  準備中
                </Text>
              </Stack>
            </Paper>
          </Group>

          <Divider />

          {/* 最近の調理記録 */}
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>📚 最近作った料理</Title>
              {recordsCount > 3 && (
                <Button variant="subtle" onClick={() => router.push('/records')}>
                  もっと見る
                </Button>
              )}
            </Group>

            {recentRecords.length === 0 ? (
              <Paper withBorder p="xl" radius="md">
                <Stack align="center" gap="md">
                  <Text size="lg" c="dimmed">
                    まだ調理記録がありません
                  </Text>
                  <Text size="sm" c="dimmed">
                    レシピを作って記録を残しましょう！
                  </Text>
                  <Button variant="light" onClick={handleStartNewSearch}>
                    レシピを探す
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Stack gap="md">
                {recentRecords.map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Container>
    </MainLayout>
  )
}
