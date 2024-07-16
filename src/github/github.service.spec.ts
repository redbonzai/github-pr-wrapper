import { Test, TestingModule } from '@nestjs/testing';
import { GithubService } from './github.service';
import { fetchData } from '@libs/services/fetch.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@libs/services/fetch.service', () => ({
  fetchData: vi.fn(),
}));

describe('GithubService', () => {
  let service: GithubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubService],
    }).compile();

    service = module.get<GithubService>(GithubService);
    vi.resetAllMocks();
  });

  it('should create a pull request', async () => {
    const mockResponse = { data: { html_url: 'http://example.com' } };
    (fetchData as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await service.createPullRequest(
      'owner',
      'repo',
      'head',
      'base',
      'title',
      'body',
    );

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/pulls',
      'POST',
      expect.any(Object),
      {
        title: 'title',
        head: 'head',
        base: 'base',
        body: 'body',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should comment on a pull request', async () => {
    const mockResponse = { data: { body: 'comment' } };
    (fetchData as jest.Mock).mockResolvedValueOnce(mockResponse);

    await service.commentOnPullRequest('owner', 'repo', 1, 'comment', 'username', 'token');

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/issues/1/comments',
      'POST',
      expect.any(Object),
      {
        body: 'comment',
        user: 'username',
      },
    );
  });

  it('should request changes on a pull request', async () => {
    const mockResponse = { data: { body: 'request changes' } };
    (fetchData as jest.Mock).mockResolvedValueOnce(mockResponse);

    await service.requestChangesOnPullRequest('owner', 'repo', 1, 'comment', 'username', 'token');

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/pulls/1/reviews',
      'POST',
      expect.any(Object),
      {
        body: 'comment',
        event: 'REQUEST_CHANGES',
        user: 'username',
      },
    );
  });

  it('should approve a pull request', async () => {
    const mockResponse = { data: { body: 'approve' } };
    (fetchData as jest.Mock).mockResolvedValueOnce(mockResponse);

    await service.approvePullRequest('owner', 'repo', 1);

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/pulls/1/reviews',
      'POST',
      expect.any(Object),
      {
        event: 'APPROVE',
      },
    );
  });

  it('should get pull request statuses', async () => {
    const mockResponse = { data: [{ state: 'success' }] };
    (fetchData as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await service.getPrStatuses('owner', 'repo', 1);

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/pulls/1/statuses',
      'GET',
      expect.any(Object),
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('should merge a pull request', async () => {
    const mockStatuses = { data: [{ state: 'success' }] };
    const mockMergeResponse = { data: { merged: true } };
    (fetchData as jest.Mock)
      .mockResolvedValueOnce(mockStatuses)
      .mockResolvedValueOnce(mockMergeResponse);

    const result = await service.mergePullRequest('owner', 'repo', 1);

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/pulls/1/statuses',
      'GET',
      expect.any(Object),
    );
    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/pulls/1/merge',
      'PUT',
      expect.any(Object),
      {
        commit_title: 'Merging PR #1',
        merge_method: 'merge',
      },
    );
    expect(result).toEqual(mockMergeResponse.data);
  });

  it('should close a pull request', async () => {
    const mockResponse = { data: { state: 'closed' } };
    (fetchData as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await service.closePullRequest('owner', 'repo', 1);

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/pulls/1',
      'PATCH',
      expect.any(Object),
      {
        state: 'closed',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should reopen a pull request', async () => {
    const mockResponse = { data: { state: 'open' } };
    (fetchData as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await service.reOpenPullRequest('owner', 'repo', 1);

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/pulls/1',
      'PATCH',
      expect.any(Object),
      {
        state: 'open',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get pull requests', async () => {
    const mockResponse = { data: [{ id: 1, title: 'Test PR' }] };
    (fetchData as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await service.getPullRequests('owner', 'repo');

    expect(fetchData).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/pulls',
      'GET',
      expect.any(Object),
    );
    expect(result).toEqual(mockResponse.data);
  });
});
