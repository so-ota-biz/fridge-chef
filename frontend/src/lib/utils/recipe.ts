import { RecipeGenre, RecipeDifficulty } from '@/types/condition'

/**
 * ジャンル番号をラベルに変換
 */
export const getGenreLabel = (genre: number): string => {
  switch (genre) {
    case RecipeGenre.JAPANESE:
      return '和食'
    case RecipeGenre.WESTERN:
      return '洋食'
    case RecipeGenre.CHINESE:
      return '中華'
    case RecipeGenre.ETHNIC:
      return 'エスニック'
    case RecipeGenre.OTHER:
      return 'その他'
    default:
      return '不明'
  }
}

/**
 * 難易度番号をラベルに変換
 */
export const getDifficultyLabel = (difficulty: number): string => {
  switch (difficulty) {
    case RecipeDifficulty.EASY:
      return '超簡単'
    case RecipeDifficulty.MEDIUM:
      return '普通'
    case RecipeDifficulty.HARD:
      return 'ちょっと頑張る'
    default:
      return '不明'
  }
}

/**
 * 調理時間（分）を表示用文字列に変換
 */
export const getCookingTimeLabel = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}時間`
  }
  return `${hours}時間${remainingMinutes}分`
}

/**
 * 代替画像のパス
 */
export const RECIPE_PLACEHOLDER_IMAGE = '/images/recipe-placeholder.svg'
