'use client'

import { Container, Title, Stack, Button, Group, Loader, Center, Text, Alert } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { MainLayout } from '@/components/layout'
import {
  CategorySection,
  SelectedIngredients,
  CustomIngredientInput,
} from '@/components/ingredient'
import { useCategories, useIngredients } from '@/lib/hooks'
import { useIngredientStore } from '@/lib/store'

const IngredientsPage = () => {
  const router = useRouter()

  // データ取得
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const {
    data: ingredients,
    isLoading: ingredientsLoading,
    error: ingredientsError,
  } = useIngredients()

  // 状態管理
  const { selectedIngredients, addIngredient, removeIngredient, clearIngredients, isSelected } =
    useIngredientStore()

  // 食材の選択/解除をトグル
  const handleToggle = (ingredientName: string) => {
    if (isSelected(ingredientName)) {
      removeIngredient(ingredientName)
    } else {
      addIngredient(ingredientName)
    }
  }

  // 次へボタンのハンドラ
  const handleNext = () => {
    if (selectedIngredients.length < 2) {
      alert('最低2つ以上の食材を選択してください')
      return
    }
    router.push('/conditions')
  }

  // ローディング中
  if (categoriesLoading || ingredientsLoading) {
    return (
      <MainLayout>
        <Center h="50vh">
          <Loader size="xl" />
        </Center>
      </MainLayout>
    )
  }

  // エラー時
  if (categoriesError || ingredientsError) {
    return (
      <MainLayout>
        <Container size="md" mt="xl">
          <Alert
            icon={<ExclamationTriangleIcon style={{ width: 20, height: 20 }} />}
            title="エラー"
            color="red"
          >
            データの取得に失敗しました。ページを再読み込みしてください。
          </Alert>
        </Container>
      </MainLayout>
    )
  }

  // データがない場合
  if (!categories || !ingredients || categories.length === 0 || ingredients.length === 0) {
    return (
      <MainLayout>
        <Container size="md" mt="xl">
          <Alert
            icon={<ExclamationTriangleIcon style={{ width: 20, height: 20 }} />}
            title="データがありません"
            color="yellow"
          >
            カテゴリまたは食材データが登録されていません。
          </Alert>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Container size="lg" mt="xl">
        <Stack gap="xl">
          {/* ヘッダー */}
          <div>
            <Title order={1} mb="xs">
              食材選択
            </Title>
            <Text c="dimmed">冷蔵庫にある食材を選択してください</Text>
          </div>

          {/* 選択済み食材 */}
          <SelectedIngredients
            ingredients={selectedIngredients}
            onRemove={removeIngredient}
            onClear={clearIngredients}
          />

          {/* 自由入力 */}
          <CustomIngredientInput onAdd={addIngredient} />

          {/* カテゴリ別食材リスト */}
          <Stack gap="lg">
            {categories
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  ingredients={ingredients}
                  isSelected={isSelected}
                  onToggle={handleToggle}
                />
              ))}
          </Stack>

          {/* アクションボタン */}
          <Group justify="space-between">
            <Button variant="outline" onClick={() => router.back()}>
              戻る
            </Button>
            <Button onClick={handleNext} disabled={selectedIngredients.length < 2}>
              次へ（条件指定）
            </Button>
          </Group>
        </Stack>
      </Container>
    </MainLayout>
  )
}

export default IngredientsPage
