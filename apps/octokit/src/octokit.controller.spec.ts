import { Test, TestingModule } from '@nestjs/testing';
import { OctokitController } from './octokit.controller';
import { OctokitService } from './services/octokit.service';

describe('OctokitController', () => {
  let octokitController: OctokitController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OctokitController],
      providers: [OctokitService],
    }).compile();

    octokitController = app.get<OctokitController>(OctokitController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {});
  });
});
