import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import * as pino from 'pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            level: 'debug',
            singleLine: true,
          },
        },
        serializers: {
          req: (req) => {
            return {
              method: req.method,
              url: req.url,
              headers: req.headers,
              file: req.file,
              // Add any other request properties you want to log
            };
          },
          res: (res) => {
            return {
              statusCode: res.statusCode,
              error: res.error,
              // Add any other response properties you want to log
            };
          },
          err: pino.stdSerializers.err,
        },
      },
    }),
  ],
})
export class LoggerModule {}
