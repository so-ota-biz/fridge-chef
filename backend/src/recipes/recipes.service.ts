import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { AiService } from '@/ai/ai.service'
import { GenerateRecipeRequestDto } from '@/recipes/dto/generate-recipe-request.dto'
import { RecipeResponseDto } from '@/recipes/dto/recipe-response.dto'
import { GenerateRecipeResponseDto } from '@/recipes/dto/generate-recipe-response.dto'

@Injectable()
export class RecipesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * AIでレシピを3つ生成してDBに保存
   * POST /recipes/generate
   */
  async generateRecipes(dto: GenerateRecipeRequestDto): Promise<GenerateRecipeResponseDto> {
    // 1. OpenAI GPT-4でレシピを3つ生成
    const aiResult = await this.aiService.generateRecipes({
      ingredients: dto.ingredients,
      genre: dto.genre,
      difficulty: dto.difficulty,
      cookingTime: dto.cookingTime,
      servings: dto.servings,
    })

    // 2-1. 3つのレシピの画像を並行生成（高速化）
    const imageGenerationTasks = aiResult.recipes.map((recipe) =>
      this.aiService.generateRecipeImage(recipe.imagePrompt),
    )
    const imageUrls = await Promise.all(imageGenerationTasks)

    // 2-2. 生成された3つのレシピをDBに保存
    const recipeCreationTasks = aiResult.recipes.map((aiRecipe, index) =>
      this.prisma.recipe.create({
        data: {
          title: aiRecipe.title,
          description: aiRecipe.description,
          cookingTime: aiRecipe.cookingTime,
          difficulty: aiRecipe.difficulty,
          servings: aiRecipe.servings,
          imageUrl: imageUrls[index],
          imagePrompt: aiRecipe.imagePrompt,
          genre: aiRecipe.genre,
          calories: aiRecipe.calories,
          // 材料を作成
          portions: {
            create: aiRecipe.portions.map((portion) => ({
              // マスタに存在する食材かチェック（簡易版：名前で検索）
              ingredientId: null, // TODO: マスタ検索機能を追加
              name: portion.ingredientName,
              amount: portion.amount,
            })),
          },
          // 手順を作成
          steps: {
            create: aiRecipe.steps.map((step) => ({
              stepNumber: step.stepNumber,
              instruction: step.instruction,
              tips: step.tips || null,
            })),
          },
        },
        include: {
          portions: true,
          steps: {
            orderBy: {
              stepNumber: 'asc',
            },
          },
        },
      }),
    )

    const savedRecipes = await Promise.all(recipeCreationTasks)

    return {
      recipes: savedRecipes,
    }
  }

  /**
   * レシピIDからレシピ詳細を取得
   * GET /recipes/:id
   */
  async findOne(id: number): Promise<RecipeResponseDto> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        portions: true,
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
      },
    })

    if (!recipe) {
      throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND)
    }

    return recipe
  }

  /**
   * レシピを削除
   * DELETE /recipes/:id
   */
  async remove(id: number): Promise<void> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    })

    if (!recipe) {
      throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND)
    }

    await this.prisma.recipe.delete({
      where: { id },
    })
  }
}
