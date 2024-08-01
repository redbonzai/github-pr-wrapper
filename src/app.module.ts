import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GithubModule } from './github/github.module';
import { LoggerModule } from '@libs/logger';

@Module({
  imports: [GithubModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
