import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get } from '@nestjs/common';
import { StringParam } from './alphanumeric-param.decorator';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

@Controller('test')
class TestController {
  @Get('string-param/:value')
  testStringParam(@StringParam('value') value: string) {
    return { value };
  }
}

describe('StringParam Decorator', () => {
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

  it('should validate alphanumeric route parameter', () => {
    return request(app.getHttpServer())
      .get('/test/string-param/test123')
      .expect(200)
      .expect({ value: 'test123' });
  });

  it('should throw error for non-alphanumeric route parameter', () => {
    return request(app.getHttpServer())
      .get('/test/string-param/test123!')
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Invalid alphanumeric string: test123!');
      });
  });

  it('should throw error if route parameter is missing', () => {
    return request(app.getHttpServer()).get('/test/string-param/').expect(404); // Because the route does not match, it should return 404
  });
});
