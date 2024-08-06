import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GithubService } from './services/github.service';
import { GithubController } from './github.controller';
import * as Joi from 'joi';
import { LoggerModule } from '../../../libs/common/logger';
import { OctokitService } from '../../octokit/src/services/octokit.service';
import { RegisteredRoutesService } from '../../../libs/common/services/registered-routes.service';
import { SlackController } from './slack.controller';
import { SlackSocketService } from '../../octokit/src/services/slack-socket.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        TOKEN: Joi.string().required(),
        OWNER: Joi.string().required(),
        REPO: Joi.string().required(),
        COLLABORATOR: Joi.string().required(),
        NX_ACCESS_TOKEN: Joi.string().required(),
        PORT: Joi.number().default(3100),
        TCP_PORT: Joi.number().required().default(3150),
      }),
      envFilePath: ['./apps/prwrapper/.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    LoggerModule,
  ],
  providers: [
    GithubService,
    OctokitService,
    RegisteredRoutesService,
    SlackSocketService,
    ConfigService,
  ],
  controllers: [GithubController, SlackController],
  exports: [GithubService, RegisteredRoutesService],
})
export class GithubModule {}
