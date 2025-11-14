import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CategorySeedData {
  id: number
  name: string
  icon: string
  sortOrder: number
}

interface IngredientSeedData {
  id: number
  name: string
  categoryId: number
  sortOrder: number
}

const main = async (): Promise<void> => {
  console.log('Start seeding...')

  // ============================================
  // Categories Seed Data
  // ============================================
  const categories: CategorySeedData[] = [
    { id: 1, name: '野菜', icon: 'vegetables', sortOrder: 1 },
    { id: 2, name: '肉類', icon: 'meat', sortOrder: 2 },
    { id: 3, name: '魚・海鮮', icon: 'seafood', sortOrder: 3 },
    { id: 4, name: 'きのこ類', icon: 'mushroom', sortOrder: 4 },
    { id: 5, name: '冷蔵庫の定番', icon: 'refrigerator', sortOrder: 5 },
    { id: 6, name: 'その他', icon: 'other', sortOrder: 6 },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
      create: category,
    })
  }

  console.log('✓ Categories seeded')

  // ============================================
  // Ingredients Seed Data
  // ============================================
  const ingredients: IngredientSeedData[] = [
    // 野菜（20種）
    { id: 1, name: '玉ねぎ', categoryId: 1, sortOrder: 1 },
    { id: 2, name: 'ニンジン', categoryId: 1, sortOrder: 2 },
    { id: 3, name: 'じゃがいも', categoryId: 1, sortOrder: 3 },
    { id: 4, name: 'キャベツ', categoryId: 1, sortOrder: 4 },
    { id: 5, name: '白菜', categoryId: 1, sortOrder: 5 },
    { id: 6, name: 'レタス', categoryId: 1, sortOrder: 6 },
    { id: 7, name: 'トマト', categoryId: 1, sortOrder: 7 },
    { id: 8, name: 'きゅうり', categoryId: 1, sortOrder: 8 },
    { id: 9, name: 'なす', categoryId: 1, sortOrder: 9 },
    { id: 10, name: 'ピーマン', categoryId: 1, sortOrder: 10 },
    { id: 11, name: 'ブロッコリー', categoryId: 1, sortOrder: 11 },
    { id: 12, name: 'ほうれん草', categoryId: 1, sortOrder: 12 },
    { id: 13, name: '大根', categoryId: 1, sortOrder: 13 },
    { id: 14, name: 'ねぎ', categoryId: 1, sortOrder: 14 },
    { id: 15, name: 'もやし', categoryId: 1, sortOrder: 15 },
    { id: 16, name: 'かぼちゃ', categoryId: 1, sortOrder: 16 },
    { id: 17, name: 'アスパラガス', categoryId: 1, sortOrder: 17 },
    { id: 18, name: 'さつまいも', categoryId: 1, sortOrder: 18 },
    { id: 19, name: 'ごぼう', categoryId: 1, sortOrder: 19 },
    { id: 20, name: 'れんこん', categoryId: 1, sortOrder: 20 },

    // 肉類（9種）
    { id: 21, name: '豚肉（薄切り）', categoryId: 2, sortOrder: 1 },
    { id: 22, name: '豚肉（バラ）', categoryId: 2, sortOrder: 2 },
    { id: 23, name: '鶏肉（もも）', categoryId: 2, sortOrder: 3 },
    { id: 24, name: '鶏肉（むね）', categoryId: 2, sortOrder: 4 },
    { id: 25, name: '牛肉（薄切り）', categoryId: 2, sortOrder: 5 },
    { id: 26, name: 'ひき肉', categoryId: 2, sortOrder: 6 },
    { id: 27, name: 'ベーコン', categoryId: 2, sortOrder: 7 },
    { id: 28, name: 'ウインナー', categoryId: 2, sortOrder: 8 },
    { id: 29, name: 'ハム', categoryId: 2, sortOrder: 9 },

    // 魚・海鮮（6種）
    { id: 30, name: '鮭', categoryId: 3, sortOrder: 1 },
    { id: 31, name: 'さば', categoryId: 3, sortOrder: 2 },
    { id: 32, name: 'あじ', categoryId: 3, sortOrder: 3 },
    { id: 33, name: 'えび', categoryId: 3, sortOrder: 4 },
    { id: 34, name: 'いか', categoryId: 3, sortOrder: 5 },
    { id: 35, name: 'ツナ缶', categoryId: 3, sortOrder: 6 },

    // きのこ類（4種）
    { id: 36, name: 'しいたけ', categoryId: 4, sortOrder: 1 },
    { id: 37, name: 'しめじ', categoryId: 4, sortOrder: 2 },
    { id: 38, name: 'えのき', categoryId: 4, sortOrder: 3 },
    { id: 39, name: 'まいたけ', categoryId: 4, sortOrder: 4 },

    // 冷蔵庫の定番（8種）
    { id: 40, name: '卵', categoryId: 5, sortOrder: 1 },
    { id: 41, name: '牛乳', categoryId: 5, sortOrder: 2 },
    { id: 42, name: '豆腐', categoryId: 5, sortOrder: 3 },
    { id: 43, name: '納豆', categoryId: 5, sortOrder: 4 },
    { id: 44, name: 'チーズ', categoryId: 5, sortOrder: 5 },
    { id: 45, name: 'バター', categoryId: 5, sortOrder: 6 },
    { id: 46, name: 'ヨーグルト', categoryId: 5, sortOrder: 7 },
    { id: 47, name: 'こんにゃく', categoryId: 5, sortOrder: 8 },

    // その他（3種）
    { id: 48, name: '油揚げ', categoryId: 6, sortOrder: 1 },
    { id: 49, name: 'ちくわ', categoryId: 6, sortOrder: 2 },
    { id: 50, name: 'かまぼこ', categoryId: 6, sortOrder: 3 },
  ]

  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({
      where: { id: ingredient.id },
      update: {
        name: ingredient.name,
        categoryId: ingredient.categoryId,
        sortOrder: ingredient.sortOrder,
      },
      create: {
        id: ingredient.id,
        name: ingredient.name,
        categoryId: ingredient.categoryId,
        icon: null, // MVP時点ではアイコンなし
        sortOrder: ingredient.sortOrder,
      },
    })
  }

  console.log('✓ Ingredients seeded')

  console.log('Seeding finished.')
}

const runSeed = async (): Promise<void> => {
  try {
    await main()
    await prisma.$disconnect()
  } catch (error) {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

runSeed()
