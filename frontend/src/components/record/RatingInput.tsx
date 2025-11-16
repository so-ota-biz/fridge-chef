'use client'

import { Group, ActionIcon } from '@mantine/core'
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

interface RatingInputProps {
  value: number
  onChange: (rating: number) => void
  max?: number
}

/**
 * 星評価入力コンポーネント
 */
export const RatingInput = ({ value, onChange, max = 5 }: RatingInputProps) => {
  return (
    <Group gap="xs">
      {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
        <ActionIcon
          key={rating}
          variant="transparent"
          onClick={() => onChange(rating)}
          size="lg"
          style={{ cursor: 'pointer' }}
        >
          {rating <= value ? (
            <StarSolid style={{ width: 24, height: 24, color: '#ffd43b' }} />
          ) : (
            <StarOutline style={{ width: 24, height: 24, color: '#adb5bd' }} />
          )}
        </ActionIcon>
      ))}
    </Group>
  )
}
