import { Test, TestingModule } from '@nestjs/testing';
import { TestappController } from './testapp.controller';
import { TestappService } from './testapp.service';

describe('TestappController', () => {
  let testappController: TestappController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TestappController],
      providers: [TestappService],
    }).compile();

    testappController = app.get<TestappController>(TestappController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(testappController.getHello()).toBe('Hello World!');
    });
  });
});
