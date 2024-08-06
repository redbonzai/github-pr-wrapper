import { Controller, Get } from '@nestjs/common';
import { TestappService } from './testapp.service';

@Controller()
export class TestappController {
  constructor(private readonly testappService: TestappService) {}

  @Get()
  getHello(): string {
    return this.testappService.getHello();
  }
}
