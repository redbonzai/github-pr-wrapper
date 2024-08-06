import { INestApplication, Injectable } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino/Logger';

@Injectable()
export class RegisteredRoutesService {
  async registeredRoutes(app: INestApplication<any>, logger: PinoLogger) {
    const server = app.getHttpServer();
    const router = server._events.request._router;
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        method: Object.keys(layer.route.methods)[0].toUpperCase(),
        path: layer.route.path,
      }));
    routes.forEach((route) => logger.log(`${route.method} ${route.path}`));
  }
}
