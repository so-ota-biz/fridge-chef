import { Global, Module } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Global() // 全モジュールからインポート不要で使えるようにする
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
