import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { vi } from 'vitest';
import { GithubModule } from '../src/github/github.module';
import { GithubService } from '../src/github/github.service';
import { fetchData } from '../libs/common/services/fetch.service';
import { ConfigModule } from '@nestjs/config';

vi.mock('../libs/common/services/fetch.service');

describe('GithubService (e2e)', () => {
  let app: INestApplication;
  let githubService: GithubService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), GithubModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    githubService = moduleFixture.get<GithubService>(GithubService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/github/repos/:owner/:repo/pulls (GET) - should get pull requests', async () => {
    const mockResponse = {
      data: [
        { id: 1, title: 'PR 1' },
        { id: 2, title: 'PR 2' },
      ],
    };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const owner = 'test-owner';
    const repo = 'test-repo';

    const response = await request(app.getHttpServer())
      .get(`/github/repos/${owner}/${repo}/pulls`)
      .expect(200);

    expect(response.body).toEqual(mockResponse.data);
    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      'GET',
      expect.any(Object),
    );
  });

  it('/github/repos/:owner/:repo/pulls/:pull_number/merge (PUT) - should merge a pull request', async () => {
    const mockStatuses = [{ state: 'success' }, { state: 'success' }, { state: 'success' }];
    const mockMergeResponse = { data: { merged: true } };
    vi.mocked(fetchData)
      .mockResolvedValueOnce({ data: mockStatuses })
      .mockResolvedValueOnce(mockMergeResponse);

    const owner = 'test-owner';
    const repo = 'test-repo';
    const pull_number = 1;

    const response = await request(app.getHttpServer())
      .put(`/github/repos/${owner}/${repo}/pulls/${pull_number}/merge`)
      .expect(200);

    expect(response.body).toEqual(mockMergeResponse.data);
    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/statuses`,
      'GET',
      expect.any(Object),
    );
    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/merge`,
      'PUT',
      expect.any(Object),
      { commit_title: `Merging PR #${pull_number}`, merge_method: 'merge' },
    );
  });

  // Add more E2E tests for other endpoints and methods as needed...
});
