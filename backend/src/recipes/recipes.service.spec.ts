import { Test, TestingModule } from '@nestjs/testing'
import { HttpException } from '@nestjs/common'
import { RecipesService } from '@/recipes/recipes.service'
import { PrismaService } from '@/prisma/prisma.service'
import { AiService } from '@/ai/ai.service'
import { GenerateRecipeRequestDto } from '@/recipes/dto/generate-recipe-request.dto'

describe('RecipesService', () => {
  let service: RecipesService

  const mockPrismaService = {
    recipe: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  }

  const mockAiService = {
    generateRecipes: jest.fn(),
    generateRecipeImage: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile()

    service = module.get<RecipesService>(RecipesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('generateRecipes', () => {
    it('should successfully generate recipes with images', async () => {
      const dto: GenerateRecipeRequestDto = {
        ingredients: ['玉ねぎ', 'トマト'],
        genre: 0,
        difficulty: 2,
        cookingTime: 30,
        servings: 2,
      }

      const mockAiRecipes = {
        recipes: [
          {
            title: 'トマトと玉ねぎの炒め物',
            description: '簡単で美味しい',
            cookingTime: 30,
            difficulty: 2,
            servings: 2,
            genre: 0,
            calories: 200,
            imagePrompt: 'A delicious dish',
            portions: [
              { ingredientName: '玉ねぎ', amount: '1個' },
              { ingredientName: 'トマト', amount: '2個' },
            ],
            steps: [
              { stepNumber: 1, instruction: '玉ねぎを切る', tips: null },
              { stepNumber: 2, instruction: '炒める', tips: null },
            ],
          },
        ],
      }

      const mockImageUrl = 'http://example.com/image.jpg'

      mockAiService.generateRecipes.mockResolvedValue(mockAiRecipes)
      mockAiService.generateRecipeImage.mockResolvedValue(mockImageUrl)

      const mockSavedRecipe = {
        id: 1,
        ...mockAiRecipes.recipes[0],
        imageUrl: mockImageUrl,
        portions: mockAiRecipes.recipes[0].portions,
        steps: mockAiRecipes.recipes[0].steps,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaService.$transaction.mockResolvedValue([mockSavedRecipe])

      const result = await service.generateRecipes(dto)

      expect(result.recipes).toHaveLength(1)
      expect(result.recipes[0].title).toBe('トマトと玉ねぎの炒め物')
      expect(mockAiService.generateRecipes).toHaveBeenCalledWith(dto)
      expect(mockAiService.generateRecipeImage).toHaveBeenCalledWith('A delicious dish')
    })
  })

  describe('findOne', () => {
    it('should successfully find a recipe by id', async () => {
      const recipeId = 1
      const mockRecipe = {
        id: recipeId,
        title: 'Test Recipe',
        description: 'Test Description',
        cookingTime: 30,
        difficulty: 2,
        servings: 2,
        imageUrl: 'http://example.com/image.jpg',
        imagePrompt: 'test',
        genre: 0,
        calories: 200,
        portions: [],
        steps: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaService.recipe.findUnique.mockResolvedValue(mockRecipe)

      const result = await service.findOne(recipeId)

      expect(result).toEqual(mockRecipe)
      expect(mockPrismaService.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: recipeId },
        include: {
          portions: true,
          steps: {
            orderBy: {
              stepNumber: 'asc',
            },
          },
        },
      })
    })

    it('should throw HttpException if recipe not found', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null)

      await expect(service.findOne(999)).rejects.toThrow(HttpException)
      await expect(service.findOne(999)).rejects.toThrow('Recipe not found')
    })
  })

  describe('remove', () => {
    it('should successfully delete a recipe', async () => {
      const recipeId = 1
      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: recipeId })
      mockPrismaService.recipe.delete.mockResolvedValue({ id: recipeId })

      await service.remove(recipeId)

      expect(mockPrismaService.recipe.delete).toHaveBeenCalledWith({
        where: { id: recipeId },
      })
    })

    it('should throw HttpException if recipe to delete not found', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null)

      await expect(service.remove(999)).rejects.toThrow(HttpException)
      await expect(service.remove(999)).rejects.toThrow('Recipe not found')
    })
  })
})
