'use client'

import { Card, Image, Text, Group, Stack, Button } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { RatingDisplay } from '@/components/record/RatingDisplay'
import type { Record } from '@/types/record'
import { RECIPE_PLACEHOLDER_IMAGE } from '@/lib/utils/recipe'

interface RecordCardProps {
  record: Record
  recipeTitle?: string
  recipeImageUrl?: string
}

/**
 * 調理記録カードコンポーネント
 */
export const RecordCard = ({ record, recipeTitle, recipeImageUrl }: RecordCardProps) => {
  const router = useRouter()

  const formattedDate = new Date(record.cookedAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={recipeImageUrl || RECIPE_PLACEHOLDER_IMAGE}
          height={160}
          alt={recipeTitle || 'レシピ'}
        />
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Group justify="space-between" align="flex-start">
          <Text fw={500} lineClamp={1}>
            {recipeTitle || 'レシピ'}
          </Text>
          <RatingDisplay value={record.rating || 0} size={16} />
        </Group>

        <Text size="sm" c="dimmed">
          {formattedDate}
        </Text>

        {record.memo && (
          <Text size="sm" lineClamp={2}>
            {record.memo}
          </Text>
        )}

        <Button
          variant="light"
          fullWidth
          mt="md"
          onClick={() => router.push(`/records/${record.id}`)}
        >
          詳細を見る
        </Button>
      </Stack>
    </Card>
  )
}
