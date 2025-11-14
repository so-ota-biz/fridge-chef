import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common'
import { RecordsService } from '@/records/records.service'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { CreateRecordDto } from '@/records/dto/create-record.dto'
import { UpdateRecordDto } from '@/records/dto/update-record.dto'
import { QueryRecordsDto } from '@/records/dto/query-records.dto'
import { RecordResponse, RecordsListResponse } from '@/records/types/record.types'
import type { RequestWithUser } from '@/auth/types/request-with-user.type'

@Controller('records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  /**
   * 調理記録を作成
   * POST /records
   */
  @Post()
  async create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateRecordDto,
  ): Promise<RecordResponse> {
    return this.recordsService.create(req.user.id, dto)
  }

  /**
   * 自分の調理記録一覧を取得
   * GET /records
   */
  @Get()
  async findAll(
    @Request() req: RequestWithUser,
    @Query() query: QueryRecordsDto,
  ): Promise<RecordsListResponse> {
    return this.recordsService.findAll(req.user.id, query)
  }

  /**
   * 調理記録詳細を取得
   * GET /records/:id
   */
  @Get(':id')
  async findOne(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RecordResponse> {
    return this.recordsService.findOne(req.user.id, id)
  }

  /**
   * 調理記録を更新
   * PATCH /records/:id
   */
  @Patch(':id')
  async update(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecordDto,
  ): Promise<RecordResponse> {
    return this.recordsService.update(req.user.id, id, dto)
  }

  /**
   * 調理記録を削除
   * DELETE /records/:id
   */
  @Delete(':id')
  async remove(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.recordsService.remove(req.user.id, id)
  }
}
