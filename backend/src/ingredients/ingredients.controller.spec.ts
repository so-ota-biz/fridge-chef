import { Test, TestingModule } from '@nestjs/testing'
import { IngredientsController } from '@/ingredients/ingredients.controller'
import { IngredientsService } from '@/ingredients/ingredients.service'
import { PrismaService } from '@/prisma/prisma.service'

describe('IngredientsController', () => {
  let controller: IngredientsController

  const mockPrismaService = {
    ingredient: {
      findMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        IngredientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    controller = module.get<IngredientsController>(IngredientsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
