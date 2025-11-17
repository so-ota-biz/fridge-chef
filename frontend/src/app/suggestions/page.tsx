'use client'

import { useEffect, useRef, useCallback } from 'react'
import {
  Container,
  Title,
  Stack,
  Button,
  Group,
  Loader,
  Center,
  Text,
  Alert,
  Grid,
} from '@mantine/core'
import { useRouter } from 'next/navigation'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { MainLayout } from '@/components/layout'
import { RecipeCard } from '@/components/recipe'
import { useRecipeGeneration } from '@/lib/hooks'
import { useIngredientStore, useConditionStore, useRecipeStore } from '@/lib/store'

const SuggestionsPage = () => {
  const router = useRouter()

  const { selectedIngredients } = useIngredientStore()
  const { genre, difficulty, cookingTime, servings } = useConditionStore()
  const { generatedRecipes, setGeneratedRecipes, clearGeneratedRecipes } = useRecipeStore()

  const { mutate, data, isPending, isError, error } = useRecipeGeneration()
  const hasTriedGeneration = useRef(false)

  const handleGenerate = useCallback(() => {
    mutate({
      ingredients: selectedIngredients,
      genre,
      difficulty,
      cookingTime,
      servings,
    })
  }, [selectedIngredients, genre, difficulty, cookingTime, servings, mutate])
  
  // mutation成功時にストアに保存
  useEffect(() => {
    if (data && !generatedRecipes) {
      setGeneratedRecipes(data)
    }
  }, [data, generatedRecipes, setGeneratedRecipes])

  useEffect(() => {
    // 既に試行済み、または条件が満たされていない場合はスキップ
    if (hasTriedGeneration.current || 
        selectedIngredients.length < 2 || 
        generatedRecipes || 
        data || 
        isPending) {
      return
    }

    hasTriedGeneration.current = true
    handleGenerate()
  }, [selectedIngredients, generatedRecipes, data, isPending, handleGenerate])

  if (selectedIngredients.length < 2) {
    return (
      <MainLayout>
        <Container size="md" mt="xl">
          <Alert
            icon={<ExclamationTriangleIcon style={{ width: 20, height: 20 }} />}
            title="食材が選択されていません"
            color="yellow"
          >
            レシピを生成するには、最低2つ以上の食材を選択してください。
          </Alert>
          <Group justify="center" mt="xl">
            <Button onClick={() => router.push('/ingredients')}>食材選択に戻る</Button>
          </Group>
        </Container>
      </MainLayout>
    )
  }

  if (isPending) {
    return (
      <MainLayout>
        <Container size="md" mt="xl">
          <Center style={{ minHeight: '50vh' }}>
            <Stack align="center" gap="md">
              <Loader size="xl" />
              <Text size="lg" fw={500}>
                AIがレシピを考えています...
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                ネットワーク状況等により1分程度かかることがあります。
                <br />
                しばらくお待ちください。
              </Text>
            </Stack>
          </Center>
        </Container>
      </MainLayout>
    )
  }

  if (isError) {
    return (
      <MainLayout>
        <Container size="md" mt="xl">
          <Alert
            icon={<ExclamationTriangleIcon style={{ width: 20, height: 20 }} />}
            title="レシピ生成に失敗しました"
            color="red"
          >
            <Stack gap="md">
              <Text>
                {error instanceof Error
                  ? error.message
                  : 'エラーが発生しました。もう一度お試しください。'}
              </Text>
              <Group>
                <Button
                  onClick={() => {
                    hasTriedGeneration.current = false
                    handleGenerate()
                  }}
                >
                  再試行
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearGeneratedRecipes()
                    router.push('/conditions')
                  }}
                >
                  条件を変更
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearGeneratedRecipes()
                    router.push('/ingredients')
                  }}
                >
                  食材を変更
                </Button>
              </Group>
            </Stack>
          </Alert>
        </Container>
      </MainLayout>
    )
  }

  // 表示用のデータ: mutationの結果を優先、なければストアのデータを使用
  const recipes = data || generatedRecipes

  if (!recipes || recipes.recipes.length === 0) {
    return (
      <MainLayout>
        <Container size="md" mt="xl">
          <Alert
            icon={<ExclamationTriangleIcon style={{ width: 20, height: 20 }} />}
            title="レシピが生成できませんでした"
            color="yellow"
          >
            <Stack gap="md">
              <Text>条件を変更して再度お試しください。</Text>
              <Group>
                <Button
                  onClick={() => {
                    hasTriedGeneration.current = false
                    handleGenerate()
                  }}
                >
                  再試行
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearGeneratedRecipes()
                    router.push('/conditions')
                  }}
                >
                  条件を変更
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearGeneratedRecipes()
                    router.push('/ingredients')
                  }}
                >
                  食材を変更
                </Button>
              </Group>
            </Stack>
          </Alert>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Container size="lg" mt="xl">
        <Stack gap="xl">
          <div>
            <Title order={1} mb="xs">
              レシピ提案
            </Title>
            <Text c="dimmed">AIが{recipes.recipes.length}つのレシピを提案しました</Text>
          </div>

          {recipes.recipes.length < 3 && (
            <Alert color="yellow">
              一部のレシピ生成に失敗しました。{recipes.recipes.length}件のレシピを表示しています。
            </Alert>
          )}

          <Grid gutter="lg">
            {recipes.recipes.map((recipe) => (
              <Grid.Col key={recipe.id} span={{ base: 12, sm: 6, md: 4 }}>
                <RecipeCard recipe={recipe} />
              </Grid.Col>
            ))}
          </Grid>

          <Group justify="space-between">
            <Button
              variant="outline"
              onClick={() => {
                clearGeneratedRecipes()
                router.push('/conditions')
              }}
            >
              条件を変更
            </Button>
            <Button
              onClick={() => {
                hasTriedGeneration.current = false
                handleGenerate()
              }}
            >
              再生成
            </Button>
          </Group>
        </Stack>
      </Container>
    </MainLayout>
  )
}

export default SuggestionsPage
