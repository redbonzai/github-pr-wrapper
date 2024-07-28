import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggerInjectorService {
  constructor(public readonly logger: PinoLogger) {}
}
