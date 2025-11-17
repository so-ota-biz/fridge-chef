'use client'

import { Paper, Title, Stack, Group, ActionIcon, Text } from '@mantine/core'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

interface ServingsSelectorProps {
  value: number
  onChange: (value: number) => void
}

/**
 * 人数選択コンポーネント
 */
export const ServingsSelector = ({ value, onChange }: ServingsSelectorProps) => {
  const handleIncrement = () => {
    if (value < 10) {
      onChange(value + 1)
    }
  }

  const handleDecrement = () => {
    if (value > 1) {
      onChange(value - 1)
    }
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Title order={3} size="h4">
          👥 人数
        </Title>

        <Group justify="center" gap="xl">
          <ActionIcon
            size="lg"
            variant="filled"
            color="gray"
            onClick={handleDecrement}
            disabled={value <= 1}
          >
            <MinusIcon style={{ width: 20, height: 20 }} />
          </ActionIcon>

          <Text size="xl" fw={700} style={{ minWidth: '60px', textAlign: 'center' }}>
            {value}人分
          </Text>

          <ActionIcon size="lg" variant="filled" onClick={handleIncrement} disabled={value >= 10}>
            <PlusIcon style={{ width: 20, height: 20 }} />
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  )
}
