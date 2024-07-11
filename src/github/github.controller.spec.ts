import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { Logger } from 'nestjs-pino';

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
    } as unknown as GithubService;

    logger = {
      error: vi.fn(),
    } as unknown as Logger;

    controller = new GithubController(service, logger);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a pull request', async () => {
    const dto = {
      head: 'feature-branch',
      base: 'main',
      title: 'title',
      body: 'body',
    };
    await controller.createPullRequest(dto.head, dto.base, dto.title, dto.body);
    expect(service.createPullRequest).toHaveBeenCalledWith(
      dto.head,
      dto.base,
      dto.title,
      dto.body,
    );
  });

  it('should comment on a pull request', async () => {
    const params = { number: 1 };
    const dto = {
      comment: 'comment',
      username: 'user',
      token: 'user-access-token',
    };
    await controller.commentOnPullRequest(
      params.number,
      dto.comment,
      dto.username,
      dto.token,
    );
    expect(service.commentOnPullRequest).toHaveBeenCalledWith(
      params.number,
      dto.comment,
      dto.username,
      dto.token,
    );
  });

  it('should request changes on a pull request', async () => {
    const params = { number: 1 };
    const dto = {
      comment: 'comment',
      username: 'user',
      token: 'user-access-token',
    };
    await controller.requestChangesOnPullRequest(
      params.number,
      dto.comment,
      dto.username,
      dto.token,
    );
    expect(service.requestChangesOnPullRequest).toHaveBeenCalledWith(
      params.number,
      dto.comment,
      dto.username,
      dto.token,
    );
  });

  it('should close a pull request', async () => {
    const params = { number: 1 };
    await controller.closePullRequest(params.number);
    expect(service.closePullRequest).toHaveBeenCalledWith(params.number);
  });
});
