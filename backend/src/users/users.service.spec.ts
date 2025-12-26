import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { UsersService } from '@/users/users.service'
import { PrismaService } from '@/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { UpdateUserDto } from '@/users/dto/update-user.dto'

describe('UsersService', () => {
  let service: UsersService

  const mockSupabaseAdmin = {
    auth: {
      admin: {
        getUserById: jest.fn(),
        updateUserById: jest.fn(),
        deleteUser: jest.fn(),
      },
      signInWithPassword: jest.fn(),
    },
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
      remove: jest.fn(),
    },
  }

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        SUPABASE_URL: 'http://localhost:54321',
        SUPABASE_SERVICE_ROLE_KEY: 'test-key',
        SUPABASE_PUBLIC_URL: 'http://127.0.0.1:54321',
        SUPABASE_INTERNAL_URL: 'http://supabase_kong_fridge-chef:8000',
      }
      return config[key]
    }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)

    // Mock Supabase client
    Reflect.set(service, '_supabaseAdmin', mockSupabaseAdmin)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getUser', () => {
    it('should successfully get user information', async () => {
      const userId = 'user-123'
      const mockUser = {
        id: userId,
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)
      mockSupabaseAdmin.auth.admin.getUserById.mockResolvedValue({
        data: {
          user: {
            id: userId,
            email: 'test@example.com',
          },
        },
        error: null,
      })

      const result = await service.getUser(userId)

      expect(result).toHaveProperty('email', 'test@example.com')
      expect(result.displayName).toBe('Test User')
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          displayName: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    })

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      await expect(service.getUser('non-existent')).rejects.toThrow(NotFoundException)
    })

    it('should throw UnauthorizedException if email fetch fails', async () => {
      const userId = 'user-123'
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockSupabaseAdmin.auth.admin.getUserById.mockResolvedValue({
        data: { user: null },
        error: { message: 'User not found' },
      })

      await expect(service.getUser(userId)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('updateUser', () => {
    it('should successfully update user information', async () => {
      const userId = 'user-123'
      const updateDto: UpdateUserDto = {
        displayName: 'Updated Name',
        firstName: 'Updated',
        lastName: 'User',
      }

      const updatedUser = {
        id: userId,
        displayName: 'Updated Name',
        firstName: 'Updated',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaService.user.update.mockResolvedValue(updatedUser)

      const result = await service.updateUser(userId, updateDto)

      expect(result.displayName).toBe('Updated Name')
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          displayName: 'Updated Name',
          firstName: 'Updated',
          lastName: 'User',
        },
        select: {
          id: true,
          displayName: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    })

    it('should update only provided fields', async () => {
      const userId = 'user-123'
      const updateDto: UpdateUserDto = {
        displayName: 'New Name',
      }

      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
        displayName: 'New Name',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await service.updateUser(userId, updateDto)

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { displayName: 'New Name' },
        select: {
          id: true,
          displayName: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    })
  })

  describe('uploadAvatar', () => {
    it('should throw BadRequestException for invalid file type', async () => {
      const file = {
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
      } as Express.Multer.File

      await expect(service.uploadAvatar('user-123', file)).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException for oversized file', async () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024, // 6MB
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
      } as Express.Multer.File

      await expect(service.uploadAvatar('user-123', file)).rejects.toThrow(BadRequestException)
    })
  })

  describe('changePassword', () => {
    it('should throw BadRequestException if new password same as current', async () => {
      const userId = 'user-123'
      mockSupabaseAdmin.auth.admin.getUserById.mockResolvedValue({
        data: {
          user: {
            id: userId,
            email: 'test@example.com',
          },
        },
        error: null,
      })

      await expect(service.changePassword(userId, 'password123', 'password123')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw UnauthorizedException for incorrect current password', async () => {
      const userId = 'user-123'
      mockSupabaseAdmin.auth.admin.getUserById.mockResolvedValue({
        data: {
          user: {
            id: userId,
            email: 'test@example.com',
          },
        },
        error: null,
      })

      mockSupabaseAdmin.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      })

      await expect(service.changePassword(userId, 'wrongPassword', 'newPassword')).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('deleteAccount', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockSupabaseAdmin.auth.admin.getUserById.mockResolvedValue({
        data: { user: null },
        error: { message: 'User not found' },
      })

      await expect(service.deleteAccount('non-existent', 'password')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw UnauthorizedException for incorrect password', async () => {
      const userId = 'user-123'
      mockSupabaseAdmin.auth.admin.getUserById.mockResolvedValue({
        data: {
          user: {
            id: userId,
            email: 'test@example.com',
          },
        },
        error: null,
      })

      mockSupabaseAdmin.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      })

      await expect(service.deleteAccount(userId, 'wrongPassword')).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })
})
