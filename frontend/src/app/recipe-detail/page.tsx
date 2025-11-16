'use client'

import { Container, Stack, Button, Group, Loader, Center, Alert } from '@mantine/core'
import { useRouter, useParams } from 'next/navigation'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { MainLayout } from '@/components/layout'
import { RecipeDetail } from '@/components/recipe'
import { useRecipe } from '@/lib/hooks'

const RecipeDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const recipeId = Number(params.id)

  // レシピ詳細を取得
  const { data: recipe, isLoading, error } = useRecipe(recipeId)

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
            <Button onClick={() => router.back()}>戻る</Button>
          </Group>
        </Container>
      </MainLayout>
    )
  }

  // レシピ採用ハンドラ
  // TODO
  const handleAdoptRecipe = () => {
    // Phase 4で調理記録作成APIを実装
    alert('Phase 4で実装予定: このレシピで調理記録を作成します')
    // router.push(`/recipe-record/${recordId}`)
  }

  return (
    <MainLayout>
      <Container size="md" mt="xl">
        <Stack gap="xl">
          {/* レシピ詳細 */}
          <RecipeDetail recipe={recipe} />

          {/* アクションボタン */}
          <Group justify="space-between">
            <Button variant="outline" onClick={() => router.back()}>
              戻る
            </Button>
            <Button size="lg" onClick={handleAdoptRecipe}>
              このレシピで調理する
            </Button>
          </Group>
        </Stack>
      </Container>
    </MainLayout>
  )
}

export default RecipeDetailPage
