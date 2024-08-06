import { NestFactory } from '@nestjs/core';
import { OctokitModule } from './octokit.module';
import { RegisteredRoutesService } from '../../../libs/common/services/registered-routes.service';
import { Logger as PinoLogger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(OctokitModule);
  const logger = app.get(PinoLogger);
  const registeredRoutesService = app.get(RegisteredRoutesService);
  await app.listen(3200);

  await registeredRoutesService.registeredRoutes(app, logger);
}
bootstrap().then(() => console.log(`Octokit service is running successfully on port 3200`));
