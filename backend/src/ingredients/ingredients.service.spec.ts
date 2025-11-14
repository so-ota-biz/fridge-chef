import { Test, TestingModule } from '@nestjs/testing'
import { IngredientsService } from '@/ingredients/ingredients.service'
import { PrismaService } from '@/prisma/prisma.service'

describe('IngredientsService', () => {
  let service: IngredientsService
  let prismaService: PrismaService

  const mockPrismaService = {
    ingredient: {
      findMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<IngredientsService>(IngredientsService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
