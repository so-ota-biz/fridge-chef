'use client'

import { Paper, Title, Stack, Radio } from '@mantine/core'
import { CookingTime } from '@/types/condition'

interface CookingTimeSelectorProps {
  value: CookingTime
  onChange: (value: CookingTime) => void
}

/**
 * 調理時間選択コンポーネント
 */
export const CookingTimeSelector = ({ value, onChange }: CookingTimeSelectorProps) => {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Title order={3} size="h4">
          ⏰ 調理時間
        </Title>

        <Radio.Group
          value={value.toString()}
          onChange={(val) => onChange(Number(val) as CookingTime)}
        >
          <Stack gap="xs">
            <Radio value={CookingTime.SHORT.toString()} label="15分以内（サッと作りたい）" />
            <Radio value={CookingTime.MEDIUM.toString()} label="30分以内（ちょうどいい）" />
            <Radio value={CookingTime.LONG.toString()} label="こだわり（60分以上）" />
          </Stack>
        </Radio.Group>
      </Stack>
    </Paper>
  )
}
