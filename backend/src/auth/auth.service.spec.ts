import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UnauthorizedException, ConflictException } from '@nestjs/common'
import { AuthService } from '@/auth/auth.service'
import { PrismaService } from '@/prisma/prisma.service'
import { SignUpDto } from '@/auth/dto/sign-up.dto'
import { SignInDto } from '@/auth/dto/sign-in.dto'

describe('AuthService', () => {
  let service: AuthService

  const mockSupabaseAdmin = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      admin: {
        getUserById: jest.fn(),
      },
    },
  }

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        SUPABASE_URL: 'http://localhost:54321',
        SUPABASE_SERVICE_ROLE_KEY: 'test-key',
        ACCESS_TOKEN_EXPIRES_IN: '900000',
        REFRESH_TOKEN_EXPIRES_IN: '604800000',
      }
      return config[key]
    }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)

    // Mock Supabase client
    Object.defineProperty(service, '_supabaseAdmin', {
      value: mockSupabaseAdmin,
      writable: true,
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('signUp', () => {
    const signUpDto: SignUpDto = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
    }

    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseAdmin.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockPrismaService.user.update.mockResolvedValue({
        id: 'user-123',
        displayName: 'Test User',
        avatarUrl: null,
      })

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        displayName: 'Test User',
        avatarUrl: null,
      })

      const result = await service.signUp(signUpDto)

      expect(result).toHaveProperty('user')
      expect(result.user.email).toBe('test@example.com')
      expect(mockSupabaseAdmin.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: signUpDto.email,
          password: signUpDto.password,
        }),
      )
    })

    it('should throw ConflictException if email already exists', async () => {
      mockSupabaseAdmin.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      })

      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException)
    })
  })

  describe('signIn', () => {
    const signInDto: SignInDto = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should successfully sign in a user', async () => {
      const mockAuthUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
      }

      mockSupabaseAdmin.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      })

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        displayName: 'Test User',
        avatarUrl: null,
      })

      mockJwtService.signAsync.mockResolvedValueOnce('access-token')
      mockJwtService.signAsync.mockResolvedValueOnce('refresh-token')

      const result = await service.signIn(signInDto)

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('user')
      expect(result.user.email).toBe('test@example.com')
    })

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockSupabaseAdmin.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      })

      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException if email not confirmed', async () => {
      const mockAuthUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: null,
      }

      mockSupabaseAdmin.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      })

      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('refreshToken', () => {
    it('should successfully refresh tokens', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      }

      mockJwtService.verifyAsync.mockResolvedValue(payload)
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
      })

      mockJwtService.signAsync.mockResolvedValueOnce('new-access-token')
      mockJwtService.signAsync.mockResolvedValueOnce('new-refresh-token')

      const result = await service.refreshToken('old-refresh-token')

      expect(result).toHaveProperty('accessToken', 'new-access-token')
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token')
    })

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'))

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException if user not found', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      }

      mockJwtService.verifyAsync.mockResolvedValue(payload)
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      await expect(service.refreshToken('refresh-token')).rejects.toThrow(UnauthorizedException)
    })
  })
})
