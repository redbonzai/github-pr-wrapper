import { Test, TestingModule } from '@nestjs/testing';
import { RegisteredRoutesService } from './registered-routes.service';

describe('RegisteredRoutesService', () => {
  let service: RegisteredRoutesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegisteredRoutesService],
    }).compile();

    service = module.get<RegisteredRoutesService>(RegisteredRoutesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
