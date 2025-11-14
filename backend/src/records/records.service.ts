import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateRecordDto } from '@/records/dto/create-record.dto'
import { UpdateRecordDto } from '@/records/dto/update-record.dto'
import { QueryRecordsDto } from '@/records/dto/query-records.dto'
import { RecordResponse, RecordsListResponse } from '@/records/types/record.types'

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 調理記録の存在と所有権を確認
   * @throws NotFoundException - レコードが存在しない場合
   * @throws ForbiddenException - ユーザーが所有者でない場合
   */
  private async verifyOwnership(userId: string, recordId: number): Promise<RecordResponse> {
    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
    })

    if (!record) {
      throw new NotFoundException('Record not found')
    }

    if (record.userId !== userId) {
      throw new ForbiddenException('You can only access your own records')
    }

    return record
  }

  /**
   * 調理記録を作成
   */
  async create(userId: string, dto: CreateRecordDto): Promise<RecordResponse> {
    // レシピの存在確認
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: dto.recipeId },
    })

    if (!recipe) {
      throw new NotFoundException('Recipe not found')
    }

    return await this.prisma.record.create({
      data: {
        userId,
        recipeId: dto.recipeId,
        cookedAt: dto.cookedAt ? new Date(dto.cookedAt) : new Date(),
        rating: dto.rating ?? null,
        memo: dto.memo ?? null,
        userImageUrl: dto.userImageUrl ?? null,
      },
    })
  }

  /**
   * 自分の調理記録一覧を取得
   */
  async findAll(userId: string, query: QueryRecordsDto): Promise<RecordsListResponse> {
    const where = {
      userId,
      ...(query.recipeId && { recipeId: query.recipeId }),
    }

    const [records, total] = await Promise.all([
      this.prisma.record.findMany({
        where,
        take: query.limit,
        skip: query.offset,
        orderBy: {
          [query.sortBy || 'cookedAt']: query.order || 'desc',
        },
      }),
      this.prisma.record.count({ where }),
    ])

    return {
      records,
      total,
    }
  }

  /**
   * 調理記録詳細を取得
   */
  async findOne(userId: string, id: number): Promise<RecordResponse> {
    return await this.verifyOwnership(userId, id)
  }

  /**
   * 調理記録を更新
   */
  async update(userId: string, id: number, dto: UpdateRecordDto): Promise<RecordResponse> {
    await this.verifyOwnership(userId, id)

    return await this.prisma.record.update({
      where: { id },
      data: {
        ...(dto.cookedAt !== undefined && { cookedAt: new Date(dto.cookedAt) }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.memo !== undefined && { memo: dto.memo }),
        ...(dto.userImageUrl !== undefined && { userImageUrl: dto.userImageUrl }),
      },
    })
  }

  /**
   * 調理記録を削除
   */
  async remove(userId: string, id: number): Promise<void> {
    await this.verifyOwnership(userId, id)

    await this.prisma.record.delete({
      where: { id },
    })
  }
}
