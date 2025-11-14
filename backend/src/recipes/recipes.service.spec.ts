import { Test, TestingModule } from '@nestjs/testing'
import { RecipesService } from '@/recipes/recipes.service'
import { PrismaService } from '@/prisma/prisma.service'
import { AiService } from '@/ai/ai.service'

describe('RecipesService', () => {
  let service: RecipesService
  let prismaService: PrismaService
  let aiService: AiService

  const mockPrismaService = {
    recipe: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  }

  const mockAiService = {
    generateRecipes: jest.fn(),
    generateRecipeImage: jest.fn(),
  }

  beforeEach(async () => {
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
    prismaService = module.get<PrismaService>(PrismaService)
    aiService = module.get<AiService>(AiService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
