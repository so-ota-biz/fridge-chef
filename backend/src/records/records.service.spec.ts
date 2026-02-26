import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { RecordsService } from '@/records/records.service'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateRecordDto } from '@/records/dto/create-record.dto'
import { UpdateRecordDto } from '@/records/dto/update-record.dto'
import { QueryRecordsDto } from '@/records/dto/query-records.dto'

describe('RecordsService', () => {
  let service: RecordsService

  const mockPrismaService = {
    record: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    recipe: {
      findUnique: jest.fn(),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<RecordsService>(RecordsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should successfully create a record', async () => {
      const userId = 'user-123'
      const dto: CreateRecordDto = {
        recipeId: 1,
        rating: 5,
        memo: 'Delicious!',
      }

      mockPrismaService.recipe.findUnique.mockResolvedValue({ id: 1 })
      mockPrismaService.record.create.mockResolvedValue({
        id: 1,
        userId,
        recipeId: 1,
        rating: 5,
        memo: 'Delicious!',
        cookedAt: new Date(),
        userImageUrl: null,
      })

      const result = await service.create(userId, dto)

      expect(result.recipeId).toBe(1)
      expect(result.rating).toBe(5)
      expect(mockPrismaService.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      })
    })

    it('should throw NotFoundException if recipe not found', async () => {
      const userId = 'user-123'
      const dto: CreateRecordDto = {
        recipeId: 999,
      }

      mockPrismaService.recipe.findUnique.mockResolvedValue(null)

      await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException)
    })
  })

  describe('findAll', () => {
    it('should return user records with pagination', async () => {
      const userId = 'user-123'
      const query: QueryRecordsDto = {
        limit: 10,
        offset: 0,
        sortBy: 'cookedAt',
        order: 'desc',
      }

      const mockRecords = [
        {
          id: 1,
          userId,
          recipeId: 1,
          cookedAt: new Date(),
          rating: 5,
          memo: 'Great!',
          userImageUrl: null,
          recipe: {
            id: 1,
            title: 'Test Recipe',
            imageUrl: 'http://example.com/image.jpg',
          },
        },
      ]

      mockPrismaService.record.findMany.mockResolvedValue(mockRecords)
      mockPrismaService.record.count.mockResolvedValue(1)

      const result = await service.findAll(userId, query)

      expect(result.records).toEqual(mockRecords)
      expect(result.total).toBe(1)
    })
  })

  describe('findOne', () => {
    it('should successfully find a record', async () => {
      const userId = 'user-123'
      const recordId = 1

      mockPrismaService.record.findUnique.mockResolvedValue({
        id: recordId,
        userId,
        recipeId: 1,
        cookedAt: new Date(),
        rating: 5,
        memo: 'Great!',
        userImageUrl: null,
      })

      const result = await service.findOne(userId, recordId)

      expect(result.id).toBe(recordId)
      expect(result.userId).toBe(userId)
    })

    it('should throw NotFoundException if record not found', async () => {
      const userId = 'user-123'

      mockPrismaService.record.findUnique.mockResolvedValue(null)

      await expect(service.findOne(userId, 999)).rejects.toThrow(NotFoundException)
    })

    it('should throw ForbiddenException if user is not owner', async () => {
      const userId = 'user-123'
      const recordId = 1

      mockPrismaService.record.findUnique.mockResolvedValue({
        id: recordId,
        userId: 'other-user',
        recipeId: 1,
        cookedAt: new Date(),
        rating: 5,
        memo: 'Great!',
        userImageUrl: null,
      })

      await expect(service.findOne(userId, recordId)).rejects.toThrow(ForbiddenException)
    })
  })

  describe('update', () => {
    it('should successfully update a record', async () => {
      const userId = 'user-123'
      const recordId = 1
      const dto: UpdateRecordDto = {
        rating: 4,
        memo: 'Updated memo',
      }

      mockPrismaService.record.findUnique.mockResolvedValue({
        id: recordId,
        userId,
        recipeId: 1,
        cookedAt: new Date(),
        rating: 5,
        memo: 'Original',
        userImageUrl: null,
      })

      mockPrismaService.record.update.mockResolvedValue({
        id: recordId,
        userId,
        recipeId: 1,
        cookedAt: new Date(),
        rating: 4,
        memo: 'Updated memo',
        userImageUrl: null,
      })

      const result = await service.update(userId, recordId, dto)

      expect(result.rating).toBe(4)
      expect(result.memo).toBe('Updated memo')
    })

    it('should throw ForbiddenException if user is not owner', async () => {
      const userId = 'user-123'
      const recordId = 1

      mockPrismaService.record.findUnique.mockResolvedValue({
        id: recordId,
        userId: 'other-user',
        recipeId: 1,
        cookedAt: new Date(),
        rating: 5,
        memo: 'Great!',
        userImageUrl: null,
      })

      await expect(service.update(userId, recordId, { rating: 4 })).rejects.toThrow(
        ForbiddenException,
      )
    })
  })

  describe('remove', () => {
    it('should successfully delete a record', async () => {
      const userId = 'user-123'
      const recordId = 1

      mockPrismaService.record.findUnique.mockResolvedValue({
        id: recordId,
        userId,
        recipeId: 1,
        cookedAt: new Date(),
        rating: 5,
        memo: 'Great!',
        userImageUrl: null,
      })

      mockPrismaService.record.delete.mockResolvedValue({
        id: recordId,
      })

      await service.remove(userId, recordId)

      expect(mockPrismaService.record.delete).toHaveBeenCalledWith({
        where: { id: recordId },
      })
    })

    it('should throw ForbiddenException if user is not owner', async () => {
      const userId = 'user-123'
      const recordId = 1

      mockPrismaService.record.findUnique.mockResolvedValue({
        id: recordId,
        userId: 'other-user',
        recipeId: 1,
        cookedAt: new Date(),
        rating: 5,
        memo: 'Great!',
        userImageUrl: null,
      })

      await expect(service.remove(userId, recordId)).rejects.toThrow(ForbiddenException)
    })
  })
})
