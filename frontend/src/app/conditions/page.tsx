'use client'

import { Container, Title, Stack, Button, Group, Text, Alert, Paper, Badge } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { MainLayout } from '@/components/layout'
import {
  CookingTimeSelector,
  DifficultySelector,
  ServingsSelector,
  GenreSelector,
} from '@/components/condition'
import { useIngredientStore, useConditionStore, useRecipeStore } from '@/lib/store'

const ConditionsPage = () => {
  const router = useRouter()

  // 食材選択状態
  const { selectedIngredients } = useIngredientStore()

  // 条件設定状態
  const {
    genre,
    difficulty,
    cookingTime,
    servings,
    setGenre,
    setDifficulty,
    setCookingTime,
    setServings,
  } = useConditionStore()

  // レシピストア
  const { clearGeneratedRecipes } = useRecipeStore()

  // 食材が選択されていない場合は警告
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

  // AI提案画面へ進む
  const handleNext = () => {
    // 新しい条件でレシピを生成するため、既存のレシピをクリア
    clearGeneratedRecipes()
    router.push('/suggestions')
  }

  return (
    <MainLayout>
      <Container size="md" mt="xl" pb={{ base: '8rem', sm: '5rem', md: '3rem' }}>
        <Stack gap="xl">
          {/* ヘッダー */}
          <div>
            <Title order={1} mb="xs">
              条件指定
            </Title>
            <Text c="dimmed">レシピ生成の条件を指定してください</Text>
          </div>

          {/* 選択済み食材の概要 */}
          <Paper withBorder p="md" radius="md" bg="blue.0">
            <Group gap="xs">
              <Text size="sm" fw={500}>
                選択中の食材:
              </Text>
              {selectedIngredients.slice(0, 5).map((ingredientName, index) => (
                <Badge key={`${ingredientName}-${index}`} variant="light" size="sm">
                  {ingredientName}
                </Badge>
              ))}
              {selectedIngredients.length > 5 && (
                <Badge variant="light" size="sm">
                  他{selectedIngredients.length - 5}個
                </Badge>
              )}
            </Group>
          </Paper>

          {/* 条件選択 */}
          <Stack gap="lg">
            <GenreSelector value={genre} onChange={setGenre} />
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
            <CookingTimeSelector value={cookingTime} onChange={setCookingTime} />
            <ServingsSelector value={servings} onChange={setServings} />
          </Stack>

          {/* アクションボタン */}
          <Group justify="space-between" mb="xl">
            <Button variant="outline" onClick={() => router.push('/ingredients')}>
              戻る
            </Button>
            <Button onClick={handleNext}>レシピを生成</Button>
          </Group>
        </Stack>
      </Container>
    </MainLayout>
  )
}

export default ConditionsPage
