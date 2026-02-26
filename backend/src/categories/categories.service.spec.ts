import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesService } from '@/categories/categories.service'
import { PrismaService } from '@/prisma/prisma.service'

describe('CategoriesService', () => {
  let service: CategoriesService

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<CategoriesService>(CategoriesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return all categories ordered by sortOrder', async () => {
      const mockCategories = [
        { id: 1, name: '野菜', sortOrder: 1 },
        { id: 2, name: '肉類', sortOrder: 2 },
        { id: 3, name: '魚介類', sortOrder: 3 },
      ]

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories)

      const result = await service.findAll()

      expect(result).toEqual(mockCategories)
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        orderBy: { sortOrder: 'asc' },
      })
    })

    it('should return empty array if no categories found', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([])

      const result = await service.findAll()

      expect(result).toEqual([])
    })
  })
})
