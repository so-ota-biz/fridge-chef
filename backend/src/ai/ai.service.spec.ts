import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { AiService } from '@/ai/ai.service'

describe('AiService', () => {
  let service: AiService
  let configService: ConfigService

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        OPENAI_API_KEY: 'test-api-key',
        OPENAI_CHAT_API_URL: 'https://api.openai.com/v1/chat/completions',
        OPENAI_IMAGE_API_URL: 'https://api.openai.com/v1/images/generations',
        OPENAI_GPT_MODEL: 'gpt-4',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      }
      return config[key]
    }),
  }

  beforeEach(async () => {
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
    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
