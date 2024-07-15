import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import * as Joi from 'joi';
import { LoggerModule } from '../../libs/common/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        TOKEN: Joi.string().required(),
        OWNER: Joi.string().required(),
        REPO: Joi.string().required(),
      }),
    }),
    LoggerModule,
  ],
  providers: [GithubService],
  controllers: [GithubController],
})
export class GithubModule {}
