'use client'

import { Paper, Title, Stack, Group, Text } from '@mantine/core'
import type { Portion } from '@/types/portion'

interface PortionListProps {
  portions: Portion[]
}

/**
 * 材料リストコンポーネント
 *
 * レシピの材料を一覧表示
 */
export const PortionList = ({ portions }: PortionListProps) => {
  if (!portions || portions.length === 0) {
    return (
      <Paper withBorder p="md" radius="md">
        <Text c="dimmed" ta="center">
          材料情報がありません
        </Text>
      </Paper>
    )
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Title order={3} size="h4">
          🥘 材料
        </Title>

        <Stack gap="xs">
          {portions.map((portion) => (
            <Group key={portion.id} justify="space-between" wrap="nowrap">
              <Text size="sm">{portion.name}</Text>
              <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                {portion.amount}
              </Text>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Paper>
  )
}
