import { Module } from '@nestjs/common';
import { TestappController } from './testapp.controller';
import { TestappService } from './testapp.service';

@Module({
  imports: [],
  controllers: [TestappController],
  providers: [TestappService],
})
export class TestappModule {}
