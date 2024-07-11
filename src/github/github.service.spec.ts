import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { GithubService } from './github.service';
import { fetchData } from '@libs/services/fetch.service';

vi.mock('../fetch-data.service');

describe('GithubService', () => {
  let service: GithubService;
  let configService: ConfigService;

  beforeEach(async () => {
    configService = new ConfigService({
      GITHUB_TOKEN: 'test-token',
      GITHUB_OWNER: 'test-owner',
      GITHUB_REPO: 'test-repo',
    });
    service = new GithubService(configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should make a GET request and return data', async () => {
    const mockResponse = { data: 'mockData' };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchData('http://example.com', 'GET');

    expect(global.fetch).toHaveBeenCalledWith('http://example.com', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should approve a pull request', async () => {
    const mockResponse = {};
    const fetchDataSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await service.approvePullRequest(1);

    expect(fetchDataSpy).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
      'POST',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      {
        event: 'APPROVE',
        method: 'POST',
      },
    );
  });

  it('should close a pull request', async () => {
    const mockResponse = {};
    (fetchData as vi.Mock).mockResolvedValueOnce(mockResponse);

    await service.closePullRequest(1);

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls/1',
      'PATCH',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      { state: 'closed' },
    );
  });

  it('should comment on a pull request', async () => {
    const mockResponse = {};
    (fetchData as vi.Mock).mockResolvedValueOnce(mockResponse);

    await service.commentOnPullRequest(1, 'comment');

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/issues/1/comments',
      'POST',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      { body: 'comment' },
    );
  });

  it('should request changes on a pull request', async () => {
    const mockResponse = {};
    (fetchData as vi.Mock).mockResolvedValueOnce(mockResponse);

    await service.requestChangesOnPullRequest(1, 'comment');

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
      'POST',
      {
        Authorization: 'token test-token',
        Accept: 'application/vnd.github.v3+json',
      },
      { body: 'comment', event: 'REQUEST_CHANGES' },
    );
  });
});
