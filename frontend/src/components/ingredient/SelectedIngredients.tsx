'use client'

import { Paper, Title, Group, Badge, Text, ActionIcon, Stack } from '@mantine/core'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface SelectedIngredientsProps {
  ingredients: string[] // 食材名の配列
  onRemove: (ingredientName: string) => void
  onClear: () => void
}

/**
 * 選択済み食材表示コンポーネント
 *
 * 選択した食材をバッジ形式で表示し、個別削除・一括クリアが可能
 */
export const SelectedIngredients = ({
  ingredients,
  onRemove,
  onClear,
}: SelectedIngredientsProps) => {
  if (ingredients.length === 0) {
    return (
      <Paper withBorder p="md" radius="md" bg="gray.0">
        <Text size="sm" c="dimmed" ta="center">
          食材を選択してください（最大50個まで）
        </Text>
      </Paper>
    )
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={4} size="h5">
            選択中の食材 ({ingredients.length}/50)
          </Title>
          <Text size="sm" c="blue" style={{ cursor: 'pointer' }} onClick={onClear}>
            すべてクリア
          </Text>
        </Group>

        <Group gap="xs">
          {ingredients.map((ingredientName, index) => (
            <Badge
              key={`${ingredientName}-${index}`}
              size="lg"
              variant="light"
              rightSection={
                <ActionIcon
                  size="xs"
                  color="gray"
                  radius="xl"
                  variant="transparent"
                  onClick={() => onRemove(ingredientName)}
                >
                  <XMarkIcon style={{ width: 12, height: 12 }} />
                </ActionIcon>
              }
              style={{ paddingRight: 3 }}
            >
              {ingredientName}
            </Badge>
          ))}
        </Group>
      </Stack>
    </Paper>
  )
}
