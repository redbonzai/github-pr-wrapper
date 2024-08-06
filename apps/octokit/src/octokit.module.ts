import { Module } from '@nestjs/common';
import { OctokitController } from './octokit.controller';
import { OctokitService } from './services/octokit.service';
import { SecretsScannerService } from './services/secrets-scanner.service';
import { SlackSocketService } from './services/slack-socket.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule } from '../../../libs/common/logger';
import { RegisteredRoutesService } from '../../../libs/common/services/registered-routes.service';

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
  controllers: [OctokitController],
  providers: [
    OctokitService,
    SecretsScannerService,
    SlackSocketService,
    ConfigService,
    RegisteredRoutesService,
  ],
  exports: [OctokitService],
})
export class OctokitModule {}
