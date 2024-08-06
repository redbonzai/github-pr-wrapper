import { Injectable } from '@nestjs/common';

@Injectable()
export class TestappService {
  getHello(): string {
    return 'Hello World!';
  }
}
