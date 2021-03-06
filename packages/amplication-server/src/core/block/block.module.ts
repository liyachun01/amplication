import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockResolver } from './block.resolver';
import { PrismaModule } from 'nestjs-prisma';
import { PermissionsModule } from '../permissions/permissions.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule, PermissionsModule],
  providers: [BlockService, BlockResolver],
  exports: [BlockService, BlockResolver]
})
export class BlockModule {}
