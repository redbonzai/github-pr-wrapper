import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

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
              headers: res.headers,
              responseTime: res.responseTime,
              error: res.error,
              // Add any other response properties you want to log
            };
          },
          err: (err) => {
            return {
              type: err.type,
              message: err.message,
              stack: err.stack,
              name: err.name,
              code: err.code,
              signal: err.signal,
              additionalInfo: err.additionalInfo,
              // Add any other error properties you want to log
            };
          },
        },
      },
    }),
  ],
})
export class LoggerModule {}
