'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container, Title, Stack, Button, Text, Center, Loader, Alert, Group } from '@mantine/core'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { MainLayout } from '@/components/layout'
import { RecordList } from '@/components/record'
import { useRecords, useRecipeSearchClear } from '@/lib/hooks'
import RecordDetailPage from './record-detail'

const RecordsPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [offset, setOffset] = useState(0)
  const limit = 20

  // レシピ検索関連のストアを一括クリアする関数
  const clearRecipeSearch = useRecipeSearchClear()

  // IDが指定されている場合は詳細ページを表示
  const recordId = searchParams.get('id')

  // フックを条件分岐の前に呼び出す
  const { data, isLoading, error } = useRecords({ limit, offset })

  if (recordId) {
    return <RecordDetailPage />
  }

  // 新規レシピ検索開始ハンドラ
  const handleStartNewSearch = () => {
    // 前回の検索状態をクリアして新鮮な状態で開始
    clearRecipeSearch()
    router.push('/ingredients')
  }

  // ローディング
  if (isLoading && offset === 0) {
    return (
      <MainLayout>
        <Center h="50vh">
          <Loader size="xl" />
        </Center>
      </MainLayout>
    )
  }

  // エラー
  if (error) {
    return (
      <MainLayout>
        <Container size="md" mt="xl">
          <Alert
            icon={<ExclamationTriangleIcon style={{ width: 20, height: 20 }} />}
            title="エラー"
            color="red"
          >
            調理記録の取得に失敗しました
          </Alert>
          <Group justify="center" mt="xl">
            <Button onClick={() => router.push('/')}>トップに戻る</Button>
          </Group>
        </Container>
      </MainLayout>
    )
  }

  // 空状態
  if (!data || data.records.length === 0) {
    return (
      <MainLayout>
        <Container size="md" mt="xl">
          <Stack align="center" gap="xl">
            <Title order={1}>調理記録</Title>
            <Text size="lg" c="dimmed">
              まだ調理記録がありません
            </Text>
            <Group>
              <Button size="lg" onClick={handleStartNewSearch}>
                レシピを探す
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/')}>
                トップに戻る
              </Button>
            </Group>
          </Stack>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Container size="lg" mt="xl">
        <Stack gap="xl">
          <Title order={1}>📚 調理記録</Title>

          <RecordList records={data.records} />

          {/* もっと見るボタン */}
          {offset + limit < data.total && (
            <Center>
              <Button onClick={() => setOffset((prev) => prev + limit)} loading={isLoading}>
                もっと見る
              </Button>
            </Center>
          )}

          <Group justify="center">
            <Button variant="outline" onClick={() => router.push('/')}>
              トップに戻る
            </Button>
          </Group>
        </Stack>
      </Container>
    </MainLayout>
  )
}

const RecordsPage = () => {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <Center h="50vh">
            <Loader size="xl" />
          </Center>
        </MainLayout>
      }
    >
      <RecordsPageContent />
    </Suspense>
  )
}

export default RecordsPage
