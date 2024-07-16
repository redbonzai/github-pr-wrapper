import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GithubService } from './github.service';
import { fetchData } from '@libs/services';

vi.mock('@libs/services/fetch.service');

describe('GithubService', () => {
  let service: GithubService;

  beforeEach(() => {
    service = new GithubService();
  });

  it('should create a pull request', async () => {
    const mockResponse = { data: { html_url: 'http://example.com/pr/1' } };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const owner = 'test-owner';
    const repo = 'test-repo';
    const head = 'feature-branch';
    const base = 'main';
    const title = 'Test PR';
    const body = 'This is a test PR';

    const result = await service.createPullRequest(owner, repo, head, base, title, body);

    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      'POST',
      service.getHeaders(),
      { title, head, base, body },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should comment on a pull request', async () => {
    const mockResponse = { data: 'comment' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const owner = 'test-owner';
    const repo = 'test-repo';
    const prNumber = 1;
    const comment = 'Nice work!';
    const username = 'test-user';
    const token = 'test-token';

    await service.commentOnPullRequest(owner, repo, prNumber, comment, username, token);

    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
      'POST',
      service.getHeaders(token),
      { body: comment, user: username },
    );
  });

  it('should request changes on a pull request', async () => {
    const mockResponse = { data: 'changes requested' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const owner = 'test-owner';
    const repo = 'test-repo';
    const prNumber = 1;
    const comment = 'Please make these changes.';
    const username = 'test-user';
    const token = 'test-token';

    await service.requestChangesOnPullRequest(owner, repo, prNumber, comment, username, token);

    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      'POST',
      service.getHeaders(token),
      { body: comment, event: 'REQUEST_CHANGES', user: username },
    );
  });

  it('should approve a pull request', async () => {
    const mockResponse = { data: 'approved' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const owner = 'test-owner';
    const repo = 'test-repo';
    const prNumber = 1;

    await service.approvePullRequest(owner, repo, prNumber);

    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      'POST',
      service.getHeaders(),
      { event: 'APPROVE' },
    );
  });

  it('should merge a pull request', async () => {
    const mockStatuses = [{ state: 'success' }, { state: 'success' }, { state: 'success' }];
    const mockResponse = { data: { merged: true } };
    vi.mocked(fetchData)
      .mockResolvedValueOnce({ data: mockStatuses })
      .mockResolvedValueOnce(mockResponse);

    const owner = 'test-owner';
    const repo = 'test-repo';
    const pull_number = 1;

    const result = await service.mergePullRequest(owner, repo, pull_number);

    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/statuses`,
      'GET',
      service.getHeaders(),
    );
    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/merge`,
      'PUT',
      service.getHeaders(),
      { commit_title: `Merging PR #${pull_number}`, merge_method: 'merge' },
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('should close a pull request', async () => {
    const mockResponse = { data: 'closed' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const owner = 'test-owner';
    const repo = 'test-repo';
    const prNumber = 1;

    const result = await service.closePullRequest(owner, repo, prNumber);

    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      'PATCH',
      service.getHeaders(),
      { state: 'closed' },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should reopen a pull request', async () => {
    const mockResponse = { data: 'reopened' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const owner = 'test-owner';
    const repo = 'test-repo';
    const prNumber = 1;

    const result = await service.reOpenPullRequest(owner, repo, prNumber);

    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      'PATCH',
      service.getHeaders(),
      { state: 'open' },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get pull requests', async () => {
    const mockResponse = { data: 'pull requests' };
    vi.mocked(fetchData).mockResolvedValueOnce(mockResponse);

    const owner = 'test-owner';
    const repo = 'test-repo';

    const result = await service.getPullRequests(owner, repo);

    expect(fetchData).toHaveBeenCalledWith(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      'GET',
      service.getHeaders(),
    );
    expect(result).toEqual(mockResponse.data);
  });
});
