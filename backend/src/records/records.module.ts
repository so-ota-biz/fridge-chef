import { Module } from '@nestjs/common'
import { RecordsService } from '@/records/records.service'
import { RecordsController } from '@/records/records.controller'
import { PrismaModule } from '@/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}
