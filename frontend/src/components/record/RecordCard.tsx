'use client'

import { Card, Image, Text, Group, Stack, Button } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { RatingDisplay } from '@/components/record/RatingDisplay'
import type { RecordWithRecipe } from '@/types/record'
import { RECIPE_PLACEHOLDER_IMAGE } from '@/lib/utils/recipe'

interface RecordCardProps {
  record: RecordWithRecipe
}

/**
 * 調理記録カードコンポーネント
 */
export const RecordCard = ({ record }: RecordCardProps) => {
  const router = useRouter()

  const formattedDate = new Date(record.cookedAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  // レシピ情報が存在しない場合の防御的処理
  if (!record.recipe) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="xs" mt="md">
          <Text fw={500} c="dimmed">
            レシピ情報が見つかりません
          </Text>
          <Text size="sm" c="dimmed">
            {formattedDate}
          </Text>
          {record.memo && (
            <Text size="sm" lineClamp={2}>
              {record.memo}
            </Text>
          )}
        </Stack>
      </Card>
    )
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={record.recipe.imageUrl || RECIPE_PLACEHOLDER_IMAGE}
          height={160}
          alt={record.recipe.title}
        />
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Group justify="space-between" align="flex-start">
          <Text fw={500} lineClamp={1}>
            {record.recipe.title}
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
