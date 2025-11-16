'use client'

import { useState } from 'react'
import { Paper, Title, TextInput, Button, Group, Stack, Text } from '@mantine/core'
import { PlusIcon } from '@heroicons/react/24/outline'

interface CustomIngredientInputProps {
  onAdd: (ingredientName: string) => void
}

/**
 * 自由入力食材コンポーネント
 *
 * マスタにない食材を自由に入力して追加
 */
export const CustomIngredientInput = ({ onAdd }: CustomIngredientInputProps) => {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) {
      return
    }
    onAdd(trimmed)
    setInputValue('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <Paper withBorder p="md" radius="md" bg="blue.0">
      <Stack gap="md">
        <div>
          <Title order={3} size="h4">
            ✏️ その他の食材
          </Title>
          <Text size="sm" c="dimmed" mt="xs">
            リストにない食材を自由に入力できます
          </Text>
        </div>

        <Group gap="xs">
          <TextInput
            placeholder="食材名を入力（例: ズッキーニ、パプリカ、モッツァレラチーズ）"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
          />
          <Button
            leftSection={<PlusIcon style={{ width: 16, height: 16 }} />}
            onClick={handleAdd}
            disabled={!inputValue.trim()}
          >
            追加
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
