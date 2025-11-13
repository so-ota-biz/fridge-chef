import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import { RecipesService } from '@/recipes/recipes.service'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { GenerateRecipeRequestDto } from '@/recipes/dto/generate-recipe-request.dto'
import { GenerateRecipeResponseDto } from '@/recipes/dto/generate-recipe-response.dto'
import { RecipeResponseDto } from '@/recipes/dto/recipe-response.dto'

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  /**
   * レシピを3つ生成
   * POST /recipes/generate
   *
   * 認証必須
   */
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(
    @Body(ValidationPipe) dto: GenerateRecipeRequestDto,
  ): Promise<GenerateRecipeResponseDto> {
    return this.recipesService.generateRecipes(dto)
  }

  /**
   * レシピ詳細を取得
   * GET /recipes/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RecipeResponseDto> {
    return this.recipesService.findOne(id)
  }

  /**
   * レシピを削除
   * DELETE /recipes/:id
   *
   * 認証必須
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.recipesService.remove(id)
  }
}
