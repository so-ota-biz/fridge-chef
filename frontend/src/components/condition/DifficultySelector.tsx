'use client'

import { Paper, Title, Stack, Radio } from '@mantine/core'
import { RecipeDifficulty } from '@/types/condition'

interface DifficultySelectorProps {
  value: RecipeDifficulty
  onChange: (value: RecipeDifficulty) => void
}

/**
 * 難易度選択コンポーネント
 */
export const DifficultySelector = ({ value, onChange }: DifficultySelectorProps) => {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Title order={3} size="h4">
          📊 難易度
        </Title>

        <Radio.Group
          value={value.toString()}
          onChange={(val) => onChange(Number(val) as RecipeDifficulty)}
        >
          <Stack gap="xs">
            <Radio value={RecipeDifficulty.EASY.toString()} label="超簡単（料理初心者でもOK）" />
            <Radio
              value={RecipeDifficulty.MEDIUM.toString()}
              label="普通（基本的な料理スキルで）"
            />
            <Radio value={RecipeDifficulty.HARD.toString()} label="ちょっと頑張る（本格的に）" />
          </Stack>
        </Radio.Group>
      </Stack>
    </Paper>
  )
}
