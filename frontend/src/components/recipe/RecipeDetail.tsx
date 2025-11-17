'use client'

import { Stack, Image, Title, Text, Badge, Group, Paper } from '@mantine/core'
import type { Recipe } from '@/types/recipe'
import { PortionList } from './PortionList'
import { StepList } from './StepList'
import {
  getGenreLabel,
  getDifficultyLabel,
  getCookingTimeLabel,
  RECIPE_PLACEHOLDER_IMAGE,
} from '@/lib/utils/recipe'

interface RecipeDetailProps {
  recipe: Recipe
}

/**
 * レシピ詳細表示コンポーネント
 *
 * レシピの全情報を表示
 */
export const RecipeDetail = ({ recipe }: RecipeDetailProps) => {
  return (
    <Stack gap="xl">
      {/* レシピ画像 */}
      <Image
        src={recipe.imageUrl || RECIPE_PLACEHOLDER_IMAGE}
        alt={recipe.title}
        radius="md"
        fallbackSrc={RECIPE_PLACEHOLDER_IMAGE}
        style={{ maxHeight: '400px', objectFit: 'cover' }}
      />

      {/* レシピ基本情報 */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Title order={1} size="h2">
            {recipe.title}
          </Title>

          {recipe.description && (
            <Text size="md" c="dimmed">
              {recipe.description}
            </Text>
          )}

          <Group gap="xs">
            <Badge color="blue" size="lg" variant="light">
              {getGenreLabel(recipe.genre)}
            </Badge>
            <Badge color="orange" size="lg" variant="light">
              {getCookingTimeLabel(recipe.cookingTime)}
            </Badge>
            <Badge color="green" size="lg" variant="light">
              {getDifficultyLabel(recipe.difficulty)}
            </Badge>
            <Badge color="grape" size="lg" variant="light">
              {recipe.servings}人分
            </Badge>
            {recipe.calories && (
              <Badge color="pink" size="lg" variant="light">
                {recipe.calories}kcal
              </Badge>
            )}
          </Group>
        </Stack>
      </Paper>

      {/* 材料リスト */}
      {recipe.portions && <PortionList portions={recipe.portions} />}

      {/* 手順リスト */}
      {recipe.steps && <StepList steps={recipe.steps} />}
    </Stack>
  )
}
