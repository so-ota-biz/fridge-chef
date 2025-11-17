'use client'

import { Container, Stack, Button, Group, Loader, Center, Alert, Text } from '@mantine/core'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { modals } from '@mantine/modals'
import { MainLayout } from '@/components/layout'
import { RecipeDetail } from '@/components/recipe'
import { useRecipe, useCreateRecord, useRecipeSearchClear } from '@/lib/hooks'

const RecipeDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const recipeId = Number(params.id)

  // 遷移元を判別（調理記録から来た場合はfrom=recordがある）
  const fromRecord = searchParams.get('from') === 'record'

  // レシピ詳細を取得
  const { data: recipe, isLoading, error } = useRecipe(recipeId)

  // 調理記録作成
  const { mutate: createRecord, isPending } = useCreateRecord()

  // レシピ検索関連のストアを一括クリアする関数
  const clearRecipeSearch = useRecipeSearchClear()

  // 戻る先を決定
  const backPath = fromRecord ? '/records' : '/suggestions'
  const backLabel = fromRecord ? '調理記録一覧に戻る' : 'レシピ一覧に戻る'

  // レシピ採用ハンドラ
  const handleAdoptRecipe = () => {
    modals.openConfirmModal({
      title: '調理記録を作成',
      children: (
        <Text size="sm">
          このレシピの調理記録を作成しますか？
          <br />
          作成後、評価やメモを入力できます。
        </Text>
      ),
      labels: { confirm: '作成する', cancel: 'キャンセル' },
      onConfirm: () => {
        createRecord(
          { recipeId },
          {
            onSuccess: (data) => {
              // レシピ検索関連の状態を一括クリア
              clearRecipeSearch()
              // 調理記録詳細ページへ遷移
              router.push(`/records/${data.id}`)
            },
            onError: () => {
              alert('調理記録の作成に失敗しました')
            },
          },
        )
      },
    })
  }

  // ローディング中
  if (isLoading) {
    return (
      <MainLayout>
        <Center h="50vh">
          <Loader size="xl" />
        </Center>
      </MainLayout>
    )
  }

  // エラー時
  if (error || !recipe) {
    return (
      <MainLayout>
        <Container size="md" mt="xl">
          <Alert
            icon={<ExclamationTriangleIcon style={{ width: 20, height: 20 }} />}
            title="エラー"
            color="red"
          >
            レシピの取得に失敗しました。
          </Alert>
          <Group justify="center" mt="xl">
            <Button onClick={() => router.push(backPath)}>{backLabel}</Button>
          </Group>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Container size="md" mt="xl">
        <Stack gap="xl">
          {/* レシピ詳細 */}
          <RecipeDetail recipe={recipe} />

          {/* アクションボタン */}
          <Group justify="space-between">
            <Button variant="outline" onClick={() => router.push(backPath)}>
              {backLabel}
            </Button>
            <Button size="lg" onClick={handleAdoptRecipe} loading={isPending} disabled={isPending}>
              このレシピで調理する
            </Button>
          </Group>
        </Stack>
      </Container>
    </MainLayout>
  )
}

export default RecipeDetailPage
