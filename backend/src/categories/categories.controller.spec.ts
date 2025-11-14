import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesController } from '@/categories/categories.controller'
import { CategoriesService } from '@/categories/categories.service'
import { PrismaService } from '@/prisma/prisma.service'

describe('CategoriesController', () => {
  let controller: CategoriesController

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    controller = module.get<CategoriesController>(CategoriesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
