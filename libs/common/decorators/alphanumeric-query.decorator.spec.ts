import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get } from '@nestjs/common';
import { StringQuery } from './alphanumeric-query.decorator';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

@Controller('test')
class TestController {
  @Get('string-query')
  testStringQuery(@StringQuery('value') value: string) {
    return { value };
  }
}

describe('StringQuery Decorator', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should validate alphanumeric query parameter', () => {
    return request(app.getHttpServer())
      .get('/test/string-query?value=test123')
      .expect(200)
      .expect({ value: 'test123' });
  });

  it('should throw error for non-alphanumeric query parameter', () => {
    return request(app.getHttpServer())
      .get('/test/string-query?value=test123!')
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Invalid alphanumeric string: test123!');
      });
  });
});
