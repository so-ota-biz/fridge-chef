import { Test, TestingModule } from '@nestjs/testing'
import { IngredientsService } from '@/ingredients/ingredients.service'
import { PrismaService } from '@/prisma/prisma.service'

describe('IngredientsService', () => {
  let service: IngredientsService

  const mockPrismaService = {
    ingredient: {
      findMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()

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
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return all ingredients without filter', async () => {
      const mockIngredients = [
        {
          id: 1,
          name: '玉ねぎ',
          categoryId: 1,
          sortOrder: 1,
          category: { id: 1, name: '野菜', sortOrder: 1 },
        },
        {
          id: 2,
          name: 'トマト',
          categoryId: 1,
          sortOrder: 2,
          category: { id: 1, name: '野菜', sortOrder: 1 },
        },
      ]

      mockPrismaService.ingredient.findMany.mockResolvedValue(mockIngredients)

      const result = await service.findAll()

      expect(result).toEqual(mockIngredients)
      expect(mockPrismaService.ingredient.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { category: true },
        orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
      })
    })

    it('should return filtered ingredients by category', async () => {
      const categoryId = 1
      const mockIngredients = [
        {
          id: 1,
          name: '玉ねぎ',
          categoryId: 1,
          sortOrder: 1,
          category: { id: 1, name: '野菜', sortOrder: 1 },
        },
      ]

      mockPrismaService.ingredient.findMany.mockResolvedValue(mockIngredients)

      const result = await service.findAll(categoryId)

      expect(result).toEqual(mockIngredients)
      expect(mockPrismaService.ingredient.findMany).toHaveBeenCalledWith({
        where: { categoryId },
        include: { category: true },
        orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
      })
    })

    it('should return empty array if no ingredients found', async () => {
      mockPrismaService.ingredient.findMany.mockResolvedValue([])

      const result = await service.findAll()

      expect(result).toEqual([])
    })
  })
})
