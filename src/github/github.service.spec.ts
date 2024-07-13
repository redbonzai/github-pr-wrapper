import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GithubService } from './github.service';
import { fetchData } from '@libs/services/fetch.service';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('@libs/services/fetch.service');
vi.mock('axios');

describe('GithubService', () => {
  let service: GithubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => {
              switch (key) {
                case 'GITHUB_TOKEN':
                  return 'test-token';
                case 'GITHUB_OWNER':
                  return 'test-owner';
                case 'GITHUB_REPO':
                  return 'test-repo';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a pull request', async () => {
    const mockResponse = { data: { html_url: 'http://example.com/pr/1' } };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const result = await service.createPullRequest(
      'feature-branch',
      'main',
      'Test PR',
      'This is a test PR',
    );

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls',
      'POST',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      {
        title: 'Test PR',
        head: 'feature-branch',
        base: 'main',
        body: 'This is a test PR',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should comment on a pull request', async () => {
    const mockResponse = { data: 'comment' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    await service.commentOnPullRequest(1, 'Nice work!', 'test-user', 'test-token');

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/issues/1/comments',
      'POST',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      { body: 'Nice work!', user: 'test-user' },
    );
  });

  it('should request changes on a pull request', async () => {
    const mockResponse = { data: 'changes requested' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    await service.requestChangesOnPullRequest(
      1,
      'Please make these changes.',
      'test-user',
      'test-token',
    );

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
      'POST',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      { body: 'Please make these changes.', event: 'REQUEST_CHANGES', user: 'test-user' },
    );
  });

  it('should approve a pull request', async () => {
    const mockResponse = { data: 'approved' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    await service.approvePullRequest(1);

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
      'POST',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      { event: 'APPROVE' },
    );
  });

  it('should close a pull request', async () => {
    const mockResponse = { data: 'closed' };
    vi.mocked(axios.patch).mockResolvedValueOnce(mockResponse);

    const result = await service.closePullRequest(1);

    expect(axios.patch).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls/1',
      { state: 'closed' },
      {
        headers: {
          Authorization: 'token test-token',
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });
});
