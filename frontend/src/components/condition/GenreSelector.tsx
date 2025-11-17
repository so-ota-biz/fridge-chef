'use client'

import { Paper, Title, Stack, Radio } from '@mantine/core'
import { RecipeGenre } from '@/types/condition'

interface GenreSelectorProps {
  value: RecipeGenre
  onChange: (value: RecipeGenre) => void
}

/**
 * ジャンル選択コンポーネント
 */
export const GenreSelector = ({ value, onChange }: GenreSelectorProps) => {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Title order={3} size="h4">
          🍽️ ジャンル
        </Title>

        <Radio.Group
          value={value.toString()}
          onChange={(val) => onChange(Number(val) as RecipeGenre)}
        >
          <Stack gap="xs">
            <Radio value={RecipeGenre.JAPANESE.toString()} label="🍚 和食" />
            <Radio value={RecipeGenre.WESTERN.toString()} label="🍝 洋食" />
            <Radio value={RecipeGenre.CHINESE.toString()} label="🥟 中華" />
            <Radio value={RecipeGenre.ETHNIC.toString()} label="🌶️ エスニック" />
            <Radio value={RecipeGenre.OTHER.toString()} label="🍴 その他" />
          </Stack>
        </Radio.Group>
      </Stack>
    </Paper>
  )
}
