'use client'

import { Checkbox, Group, Text } from '@mantine/core'
import type { Ingredient } from '@/types/ingredient'

interface IngredientItemProps {
  ingredient: Ingredient
  isSelected: boolean
  onToggle: (ingredientName: string) => void
}

/**
 * 食材アイテムコンポーネント
 *
 * 個々の食材をチェックボックス付きで表示
 */
export const IngredientItem = ({ ingredient, isSelected, onToggle }: IngredientItemProps) => {
  return (
    <Checkbox
      label={
        <Group gap="xs">
          {ingredient.icon && <Text size="lg">{ingredient.icon}</Text>}
          <Text size="sm">{ingredient.name}</Text>
        </Group>
      }
      checked={isSelected}
      onChange={() => onToggle(ingredient.name)}
      styles={{
        body: { alignItems: 'center' },
      }}
    />
  )
}
