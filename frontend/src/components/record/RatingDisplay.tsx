'use client'

import { Group } from '@mantine/core'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

interface RatingDisplayProps {
  value: number
  max?: number
  size?: number
}

/**
 * 星評価表示コンポーネント
 */
export const RatingDisplay = ({ value, max = 5, size = 20 }: RatingDisplayProps) => {
  if (!value) return <span style={{ color: '#adb5bd' }}>評価なし</span>

  return (
    <Group gap="xs">
      {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
        <StarSolid
          key={rating}
          style={{
            width: size,
            height: size,
            color: rating <= value ? '#ffd43b' : '#e9ecef',
          }}
        />
      ))}
    </Group>
  )
}
