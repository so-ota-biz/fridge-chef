import { Test, TestingModule } from '@nestjs/testing'
import { RecordsService } from '@/records/records.service'
import { PrismaService } from '@/prisma/prisma.service'

describe('RecordsService', () => {
  let service: RecordsService
  let prismaService: PrismaService

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
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
