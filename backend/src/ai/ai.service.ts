import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosError } from 'axios'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { Database } from '@/types/database.types'
import {
  RecipeGenerationPrompt,
  AIRecipeGenerationResult,
} from '@/ai/types/recipe-generation.types'

/**
 * OpenAI APIのエラーレスポンス型
 */
interface OpenAIErrorResponse {
  error?: {
    message?: string
    type?: string
    code?: string
  }
}

/**
 * OpenAI Chat APIのレスポンス型
 */
interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

/**
 * DALL-E APIのBase64レスポンス型
 */
interface DalleBase64Response {
  data?: Array<{
    b64_json?: string
  }>
}

@Injectable()
export class AiService {
  private readonly openaiApiKey: string
  private readonly openaiChatUrl: string
  private readonly openaiImageUrl: string
  private readonly gptModel: string
  private _supabaseAdmin: SupabaseClient<Database> | null = null

  private get supabaseAdmin(): SupabaseClient<Database> {
    if (!this._supabaseAdmin) {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL')
      const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new HttpException(
          'Supabase configuration is missing at AiService',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      this._supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey)
    }
    return this._supabaseAdmin
  }

  constructor(private readonly configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || ''
    this.gptModel = this.configService.get<string>('OPENAI_GPT_MODEL') || 'gpt-4o'

    const baseUrl =
      this.configService.get<string>('OPENAI_API_BASE_URL') || 'https://api.openai.com/v1'
    this.openaiChatUrl = `${baseUrl}/chat/completions`
    this.openaiImageUrl = `${baseUrl}/images/generations`

    if (!this.openaiApiKey) {
      console.warn('⚠️  OPENAI_API_KEY is not set in environment variables')
    }
  }

  /**
   * GPT-4でレシピを3つ生成
   */
  async generateRecipes(prompt: RecipeGenerationPrompt): Promise<AIRecipeGenerationResult> {
    if (!this.openaiApiKey) {
      throw new HttpException('OpenAI API key is not configured', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    const systemPrompt = this.buildSystemPrompt()
    const userPrompt = this.buildUserPrompt(prompt)

    try {
      const response = await axios.post<OpenAIChatResponse>(
        this.openaiChatUrl,
        {
          model: this.gptModel, // 環境変数から取得
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.8,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
        },
      )

      const content = response.data.choices?.[0]?.message?.content

      if (!content) {
        throw new HttpException('No response from OpenAI', HttpStatus.INTERNAL_SERVER_ERROR)
      }

      // JSON.parseの戻り値を明示的に型アサーション
      const result = JSON.parse(content) as AIRecipeGenerationResult

      // 各レシピに画像プロンプトを設定
      for (const recipe of result.recipes) {
        recipe.imagePrompt = this.buildImagePrompt(recipe.title, recipe.description)
      }

      return result
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<OpenAIErrorResponse>
        const errorMessage = axiosError.response?.data?.error?.message || 'Unknown error'
        throw new HttpException(
          `OpenAI API error: ${errorMessage}`,
          axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      console.error('Error generating recipes with OpenAI:', error)
      throw new HttpException('Failed to generate recipes', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * DALL-E 2で料理画像を生成（Base64） → Supabase Storageに保存
   */
  async generateRecipeImage(imagePrompt: string): Promise<string | null> {
    if (!this.openaiApiKey) {
      throw new HttpException('OpenAI API key is not configured', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    try {
      // 1. DALL-E 2で画像生成（Base64形式、512x512で直接生成）
      const response = await axios.post<DalleBase64Response>(
        this.openaiImageUrl,
        {
          model: 'dall-e-2',
          prompt: imagePrompt,
          n: 1,
          size: '512x512',
          response_format: 'b64_json',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
        },
      )

      const base64Image = response.data.data?.[0]?.b64_json
      if (!base64Image) {
        console.error('[IMAGE GEN] No Base64 image data from DALL-E 2')
        return null
      }

      // 2. Base64をBufferに変換
      const imageBuffer = Buffer.from(base64Image, 'base64')

      // 3. WebP形式に変換（品質60%）
      const webpImageBuffer: Buffer = await sharp(imageBuffer).webp({ quality: 60 }).toBuffer()

      // 4. Supabase Storageにアップロード
      const fileName = `recipes/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`
      const { error: uploadError } = await this.supabaseAdmin.storage
        .from('recipe-images')
        .upload(fileName, webpImageBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: false,
        })

      if (uploadError) {
        console.error('[IMAGE GEN] Supabase upload error:', uploadError)
        return null
      }

      // 5. パブリックURLを取得（Docker環境対応）
      const publicUrl = this.getPublicUrl('recipe-images', fileName)

      return publicUrl
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[IMAGE GEN] DALL-E 2 API error:', error.response?.data)
      } else {
        console.error('[IMAGE GEN] Error generating and uploading image:', error)
      }
      return null
    }
  }

  /**
   * Supabase Storageの公開URLを取得（Docker環境対応）
   */
  private getPublicUrl(bucketName: string, filePath: string): string {
    const { data: urlData } = this.supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath)

    // Docker環境の内部URLを公開URLに置換
    const publicUrl = this.configService.get<string>('SUPABASE_PUBLIC_URL')
    const internalUrl = this.configService.get<string>('SUPABASE_INTERNAL_URL')
    const convertedUrl = urlData.publicUrl.replace(
      internalUrl || 'http://supabase_kong_fridge-chef:8000',
      publicUrl || 'http://127.0.0.1:54321',
    )

    return convertedUrl
  }

  /**
   * システムプロンプトを構築
   */
  private buildSystemPrompt(): string {
    return `あなたは優秀な料理アシスタントです。
ユーザーが指定した食材と条件から、3つの異なるレシピを提案してください。

レシピは以下のJSON形式で返してください：
{
  "recipes": [
    {
      "title": "レシピ名",
      "description": "レシピの簡単な説明（1-2文）",
      "cookingTime": 30,
      "difficulty": 2,
      "servings": 2,
      "genre": 0,
      "calories": 450,
      "portions": [
        {
          "ingredientName": "玉ねぎ",
          "amount": "1個"
        }
      ],
      "steps": [
        {
          "stepNumber": 1,
          "instruction": "玉ねぎを薄切りにする",
          "tips": "繊維に沿って切ると甘みが出る"
        }
      ],
      "imagePrompt": "DALL-E用のプロンプト（後で自動生成）"
    }
  ]
}

重要な注意事項：
- 3つのレシピは、調理法・味付け・ジャンルが異なるバリエーションを提案してください
- ユーザーが指定した食材を必ず使用してください
- difficulty: 1=超簡単, 2=普通, 3=ちょっと頑張る
- genre: 0=和食, 1=洋食, 2=中華, 3=エスニック, 4=その他
- portions は材料リストです（ingredientNameとamount）
- steps は調理手順です（stepNumber, instruction, tips）
- tips はコツやポイントを記載（省略可）
- caloriesは1人分の概算カロリー
- imagePromptは空文字列で構いません（後で自動生成します）`
  }

  /**
   * ユーザープロンプトを構築
   */
  private buildUserPrompt(prompt: RecipeGenerationPrompt): string {
    const { ingredients, genre, difficulty, cookingTime, servings = 2 } = prompt

    let userPrompt = `以下の食材を使ったレシピを3つ提案してください：\n`
    userPrompt += `食材: ${ingredients.join(', ')}\n`

    if (genre !== undefined) {
      const genreNames = ['和食', '洋食', '中華', 'エスニック', 'その他']
      userPrompt += `希望ジャンル: ${genreNames[genre]}\n`
    }

    if (difficulty !== undefined) {
      const difficultyNames = ['', '超簡単', '普通', 'ちょっと頑張る']
      userPrompt += `希望難易度: ${difficultyNames[difficulty]}\n`
    }

    if (cookingTime !== undefined) {
      userPrompt += `希望調理時間: 約${cookingTime}分\n`
    }

    userPrompt += `人数: ${servings}人分\n`

    return userPrompt
  }

  /**
   * DALL-E用の画像生成プロンプトを構築
   */
  private buildImagePrompt(title: string, description: string): string {
    return `A delicious and appetizing photo of ${title}. ${description}. Professional food photography, high quality, well-lit, colorful, served on a white plate.`
  }
}
