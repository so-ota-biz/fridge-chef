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
  const handleClick = (rating: number) => {
    // 同じ星をクリックした場合は評価を0にする（評価をクリア）
    if (value === rating) {
      onChange(0)
    } else {
      onChange(rating)
    }
  }

  return (
    <Group gap="xs">
      {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
        <ActionIcon
          key={rating}
          variant="transparent"
          onClick={() => handleClick(rating)}
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
