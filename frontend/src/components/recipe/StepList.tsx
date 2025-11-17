'use client'

import { Paper, Title, Stack, Text, List } from '@mantine/core'
import type { Step } from '@/types/step'

interface StepListProps {
  steps: Step[]
}

/**
 * 手順リストコンポーネント
 *
 * レシピの調理手順を順番に表示
 */
export const StepList = ({ steps }: StepListProps) => {
  if (!steps || steps.length === 0) {
    return (
      <Paper withBorder p="md" radius="md">
        <Text c="dimmed" ta="center">
          手順情報がありません
        </Text>
      </Paper>
    )
  }

  // stepNumberでソート
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber)

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Title order={3} size="h4">
          📝 作り方
        </Title>

        <List type="ordered" spacing="lg" size="sm">
          {sortedSteps.map((step) => (
            <List.Item key={step.id}>
              <Stack gap="xs">
                <Text>{step.instruction}</Text>
                {step.tips && (
                  <Text size="sm" c="dimmed" fs="italic">
                    💡 コツ: {step.tips}
                  </Text>
                )}
              </Stack>
            </List.Item>
          ))}
        </List>
      </Stack>
    </Paper>
  )
}
