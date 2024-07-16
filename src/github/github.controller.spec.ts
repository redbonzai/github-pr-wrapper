import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { Logger } from 'nestjs-pino';

vi.mock('@libs/services/fetch.service');

describe('GithubController', () => {
  let controller: GithubController;
  let service: GithubService;
  let logger: Logger;

  beforeEach(async () => {
    service = {
      createPullRequest: vi.fn(),
      approvePullRequest: vi.fn(),
      closePullRequest: vi.fn(),
      commentOnPullRequest: vi.fn(),
      requestChangesOnPullRequest: vi.fn(),
      reOpenPullRequest: vi.fn(),
      getPrStatuses: vi.fn(),
      mergePullRequest: vi.fn(),
    } as unknown as GithubService;

    logger = {
      error: vi.fn(),
    } as unknown as Logger;

    controller = new GithubController(service, logger);
  });

  it('should be defined', () => {
    console.log('Test: should be defined');
    expect(controller).toBeDefined();
  });

  it('should create a pull request', async () => {
    console.log('Test: should create a pull request');
    const dto = {
      owner: 'owner',
      repo: 'repo',
      head: 'feature-branch',
      base: 'main',
      title: 'title',
      body: 'body',
    };

    await controller.createPullRequest(
      dto.owner,
      dto.repo,
      dto.head,
      dto.base,
      dto.title,
      dto.body,
    );
    expect(service.createPullRequest).toHaveBeenCalledWith(
      dto.owner,
      dto.repo,
      dto.head,
      dto.base,
      dto.title,
      dto.body,
    );
  });

  it('should comment on a pull request', async () => {
    console.log('Test: should comment on a pull request');
    const params = { number: 1 };
    const dto = {
      owner: 'owner',
      repo: 'repo',
      comment: 'comment',
      username: 'user',
      token: 'user-access-token',
    };

    await controller.commentOnPullRequest(
      params.number,
      dto.owner,
      dto.repo,
      dto.comment,
      dto.username,
      dto.token,
    );
    expect(service.commentOnPullRequest).toHaveBeenCalledWith(
      dto.owner,
      dto.repo,
      params.number,
      dto.comment,
      dto.username,
      dto.token,
    );
  });

  it('should request changes on a pull request', async () => {
    console.log('Test: should request changes on a pull request');
    const params = { number: 1 };
    const dto = {
      owner: 'owner',
      repo: 'repo',
      comment: 'comment',
      username: 'user',
      token: 'user-access-token',
    };
    await controller.requestChangesOnPullRequest(
      params.number,
      dto.owner,
      dto.repo,
      dto.comment,
      dto.username,
      dto.token,
    );
    expect(service.requestChangesOnPullRequest).toHaveBeenCalledWith(
      dto.owner,
      dto.repo,
      params.number,
      dto.comment,
      dto.username,
      dto.token,
    );
  });

  it('should close a pull request', async () => {
    console.log('Test: should close a pull request');
    const params = { number: 1 };
    const dto = {
      owner: 'owner',
      repo: 'repo',
    };

    await controller.closePullRequest(params.number, dto.owner, dto.repo);
    expect(service.closePullRequest).toHaveBeenCalledWith(dto.owner, dto.repo, params.number);
  });

  it('should reopen a pull request', async () => {
    console.log('Test: should reopen a pull request');
    const params = { number: 1 };
    const dto = {
      owner: 'owner',
      repo: 'repo',
    };
    await controller.reOpenPullRequest(params.number, dto.owner, dto.repo);
    expect(service.reOpenPullRequest).toHaveBeenCalledWith(dto.owner, dto.repo, params.number);
  });

  it('should get pull request statuses', async () => {
    const mockStatuses = [{ state: 'success' }, { state: 'success' }];
    vi.mocked(service.getPrStatuses).mockResolvedValueOnce(mockStatuses);

    const params = { owner: 'owner', repo: 'repo', number: 1 };
    const result = await controller.getPrStatuses(params.owner, params.repo, params.number);

    expect(service.getPrStatuses).toHaveBeenCalledWith(params.owner, params.repo, params.number);
    expect(result).toEqual(mockStatuses);
  });

  it('should merge a pull request when all statuses are green', async () => {
    const mockStatuses = [{ state: 'success' }, { state: 'success' }];
    const mockResponse = { merged: true };
    vi.mocked(service.getPrStatuses).mockResolvedValueOnce(mockStatuses);
    vi.mocked(service.mergePullRequest).mockResolvedValueOnce(mockResponse);

    const params = { number: 1 };
    const dto = {
      owner: 'owner',
      repo: 'repo',
    };

    await controller.mergePullRequest(params.number, dto.owner, dto.repo);

    expect(service.mergePullRequest).toHaveBeenCalledWith(dto.owner, dto.repo, params.number);
  });

  // it('should throw an error if statuses are not retrieved or the response is not an array', async () => {
  //   vi.mocked(fetchData).mockResolvedValueOnce({ data: null }); // Mock fetchData response with null
  //
  //   const getPrStatusesSpy = vi.spyOn(service, 'getPrStatuses').mockResolvedValueOnce(null);
  //
  //   const owner = 'test-owner';
  //   const repo = 'test-repo';
  //   const pull_number = 1;
  //
  //   await expect(service.mergePullRequest(owner, repo, pull_number)).rejects.toThrow(
  //     'Failed to retrieve pull request statuses',
  //   );
  //
  //   expect(getPrStatusesSpy).toHaveBeenCalledWith(owner, repo, pull_number);
  //   expect(fetchData).toHaveBeenCalledWith(
  //     `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/statuses`,
  //     'GET',
  //     service.getHeaders(),
  //   );
  // });
});
