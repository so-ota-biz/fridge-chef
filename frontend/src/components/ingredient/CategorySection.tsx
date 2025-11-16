'use client'

import { Paper, Title, Stack, Grid } from '@mantine/core'
import type { Category } from '@/types/category'
import type { Ingredient } from '@/types/ingredient'
import { IngredientItem } from '@/components/ingredient/IngredientItem'

interface CategorySectionProps {
  category: Category
  ingredients: Ingredient[]
  isSelected: (ingredientName: string) => boolean
  onToggle: (ingredientName: string) => void
}

const ICON_COLORS: Record<string, string> = {
  vegetables: '#4CAF50',
  meat: '#F44336',
  seafood: '#2196F3',
  mushroom: '#795548',
  refrigerator: '#9E9E9E',
  other: '#FF9800',
}

export const CategorySection = ({
  category,
  ingredients,
  isSelected,
  onToggle,
}: CategorySectionProps) => {
  const categoryIngredients = ingredients.filter(
    (ingredient) => ingredient.categoryId === category.id,
  )

  if (categoryIngredients.length === 0) {
    return null
  }

  const iconColor = ICON_COLORS[category.icon || ''] || '#757575'

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Title order={3} size="h4" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {category.icon && (
            <div
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: iconColor,
                  mask: `url(/icons/categories/${category.icon}.svg) no-repeat center/contain`,
                  WebkitMask: `url(/icons/categories/${category.icon}.svg) no-repeat center/contain`,
                }}
              />
            </div>
          )}
          <span style={{ color: iconColor }}>{category.name}</span>
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
