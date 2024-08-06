import { NestFactory } from '@nestjs/core';
import { GithubModule } from './github.module';
import { Logger as PinoLogger } from 'nestjs-pino';

import { RegisteredRoutesService } from '../../../libs/common/services/registered-routes.service';

async function bootstrap() {
  const app = await NestFactory.create(GithubModule);
  const logger = app.get(PinoLogger);
  const registeredRoutesService = app.get(RegisteredRoutesService);
  await app.listen(3100);

  // Get all routes registered in this service
  await registeredRoutesService.registeredRoutes(app, logger);
  const theToken = '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';
}
bootstrap().then(() => console.log(`prWrapper service is running successfully on port 3100`));
