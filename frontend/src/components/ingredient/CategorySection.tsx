'use client'

import { Paper, Title, Stack, Grid } from '@mantine/core'
import type { Category } from '@/types/category'
import type { Ingredient } from '@/types/ingredient'
import { IngredientItem } from './IngredientItem'

interface CategorySectionProps {
  category: Category
  ingredients: Ingredient[]
  isSelected: (ingredientName: string) => boolean
  onToggle: (ingredientName: string) => void
}

/**
 * カテゴリセクションコンポーネント
 *
 * カテゴリ名と、そのカテゴリに属する食材のリストを表示
 */
export const CategorySection = ({
  category,
  ingredients,
  isSelected,
  onToggle,
}: CategorySectionProps) => {
  // このカテゴリに属する食材のみをフィルタ
  const categoryIngredients = ingredients.filter(
    (ingredient) => ingredient.categoryId === category.id,
  )

  // 食材がない場合は何も表示しない
  if (categoryIngredients.length === 0) {
    return null
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Title order={3} size="h4">
          {category.icon && <span style={{ marginRight: '8px' }}>{category.icon}</span>}
          {category.name}
        </Title>

        <Grid gutter="md">
          {categoryIngredients.map((ingredient) => (
            <Grid.Col key={ingredient.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
              <IngredientItem
                ingredient={ingredient}
                isSelected={isSelected(ingredient.name)}
                onToggle={onToggle}
              />
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Paper>
  )
}
