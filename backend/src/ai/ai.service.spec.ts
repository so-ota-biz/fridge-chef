import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { HttpException } from '@nestjs/common'
import { AiService } from '@/ai/ai.service'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
const mockPost = jest.fn()
mockedAxios.post = mockPost

describe('AiService', () => {
  let service: AiService

  const mockSupabaseStorage = {
    from: jest.fn().mockReturnThis(),
    upload: jest.fn(),
    getPublicUrl: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        OPENAI_API_KEY: 'test-api-key',
        OPENAI_API_BASE_URL: 'https://api.openai.com/v1',
        OPENAI_GPT_MODEL: 'gpt-4o',
        SUPABASE_URL: 'http://localhost:54321',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
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
        AiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<AiService>(AiService)

    // Mock Supabase client
    Object.defineProperty(service, '_supabaseAdmin', {
      value: {
        storage: mockSupabaseStorage,
      },
      writable: true,
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('generateRecipes', () => {
    it('should successfully generate recipes from OpenAI', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  recipes: [
                    {
                      title: 'トマト炒め',
                      description: '簡単な料理',
                      cookingTime: 20,
                      difficulty: 1,
                      servings: 2,
                      genre: 0,
                      calories: 150,
                      portions: [{ ingredientName: 'トマト', amount: '2個' }],
                      steps: [{ stepNumber: 1, instruction: '炒める', tips: null }],
                      imagePrompt: '',
                    },
                  ],
                }),
              },
            },
          ],
        },
      }

      mockPost.mockResolvedValue(mockResponse)

      const result = await service.generateRecipes({
        ingredients: ['トマト'],
        genre: 0,
        difficulty: 1,
        cookingTime: 20,
        servings: 2,
      })

      expect(result.recipes).toHaveLength(1)
      expect(result.recipes[0].title).toBe('トマト炒め')
      expect(mockPost).toHaveBeenCalled()
    })

    it('should throw HttpException if OpenAI API key is not configured', async () => {
      const serviceWithoutKey = new AiService({
        get: () => undefined,
      } as unknown as ConfigService)

      await expect(
        serviceWithoutKey.generateRecipes({
          ingredients: ['トマト'],
        }),
      ).rejects.toThrow(HttpException)
    })

    it('should throw HttpException if OpenAI returns no content', async () => {
      mockPost.mockResolvedValue({
        data: { choices: [] },
      })

      await expect(
        service.generateRecipes({
          ingredients: ['トマト'],
        }),
      ).rejects.toThrow(HttpException)
    })
  })

  describe('generateRecipeImage', () => {
    it('should return null if API key is not configured', async () => {
      const serviceWithoutKey = new AiService({
        get: () => undefined,
      } as unknown as ConfigService)

      await expect(serviceWithoutKey.generateRecipeImage('test prompt')).rejects.toThrow(
        HttpException,
      )
    })

    it('should return null on image generation error', async () => {
      mockPost.mockRejectedValue(new Error('API error'))

      const result = await service.generateRecipeImage('test prompt')

      expect(result).toBeNull()
    })
  })
})
