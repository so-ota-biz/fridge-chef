'use client'

import { Card, Image, Text, Badge, Button, Group, Stack } from '@mantine/core'
import { useRouter } from 'next/navigation'
import type { Recipe } from '@/types/recipe'
import {
  getGenreLabel,
  getDifficultyLabel,
  getCookingTimeLabel,
  RECIPE_PLACEHOLDER_IMAGE,
} from '@/lib/utils/recipe'

interface RecipeCardProps {
  recipe: Recipe
}

/**
 * レシピカードコンポーネント
 *
 * AI提案結果画面で使用するレシピカード
 */
export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const router = useRouter()

  const handleViewDetail = () => {
    router.push(`/recipes?id=${recipe.id}`)
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={recipe.imageUrl || RECIPE_PLACEHOLDER_IMAGE}
          height={200}
          alt={recipe.title}
          fallbackSrc={RECIPE_PLACEHOLDER_IMAGE}
        />
      </Card.Section>

      <Stack gap="md" mt="md">
        <div>
          <Text fw={600} size="lg" lineClamp={2}>
            {recipe.title}
          </Text>
          {recipe.description && (
            <Text size="sm" c="dimmed" mt="xs" lineClamp={2}>
              {recipe.description}
            </Text>
          )}
        </div>

        <Group gap="xs">
          <Badge color="blue" variant="light">
            {getGenreLabel(recipe.genre)}
          </Badge>
          <Badge color="orange" variant="light">
            {getCookingTimeLabel(recipe.cookingTime)}
          </Badge>
          <Badge color="green" variant="light">
            {getDifficultyLabel(recipe.difficulty)}
          </Badge>
          <Badge color="grape" variant="light">
            {recipe.servings}人分
          </Badge>
        </Group>

        <Button fullWidth onClick={handleViewDetail}>
          詳細を見る
        </Button>
      </Stack>
    </Card>
  )
}
