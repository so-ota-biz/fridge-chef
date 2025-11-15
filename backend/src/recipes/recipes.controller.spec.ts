import { Test, TestingModule } from '@nestjs/testing'
import { RecipesController } from '@/recipes/recipes.controller'
import { RecipesService } from '@/recipes/recipes.service'
import { PrismaService } from '@/prisma/prisma.service'
import { AiService } from '@/ai/ai.service'

describe('RecipesController', () => {
  let controller: RecipesController

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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
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

    controller = module.get<RecipesController>(RecipesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
