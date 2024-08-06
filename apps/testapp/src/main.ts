import { NestFactory } from '@nestjs/core';
import { TestappModule } from './testapp.module';

async function bootstrap() {
  const app = await NestFactory.create(TestappModule);
  await app.listen(3000);
}
bootstrap();
