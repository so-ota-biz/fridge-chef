import { Test, TestingModule } from '@nestjs/testing'
import { RecordsController } from '@/records/records.controller'
import { RecordsService } from '@/records/records.service'
import { PrismaService } from '@/prisma/prisma.service'

describe('RecordsController', () => {
  let controller: RecordsController

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
      controllers: [RecordsController],
      providers: [
        RecordsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    controller = module.get<RecordsController>(RecordsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
