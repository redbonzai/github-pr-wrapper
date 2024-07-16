import { Controller, Post, Body, Patch, Param, ParseIntPipe, Get, Put } from '@nestjs/common';
import { GithubService } from './github.service';
import { Logger } from 'nestjs-pino';
import errorSerializer from '@libs/serializer/error.serializer';

@Controller('github/pull-request')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly logger: Logger,
  ) {}

  @Post('/')
  async createPullRequest(
    @Body('owner') owner: string,
    @Body('repo') repo: string,
    @Body('head') head: string,
    @Body('base') base: string,
    @Body('title') title: string,
    @Body('body') body: string,
  ): Promise<void> {
    try {
      await this.githubService.createPullRequest(owner, repo, head, base, title, body);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error creating pull request:', serializedError);
    }
  }

  @Post('/comment/:number')
  async commentOnPullRequest(
    @Param('number', ParseIntPipe) prNumber: number,
    @Body('owner') owner: string,
    @Body('repo') repo: string,
    @Body('comment') comment: string,
    @Body('username') username: string,
    @Body('user-access-token') token: string,
  ): Promise<void> {
    try {
      await this.githubService.commentOnPullRequest(
        owner,
        repo,
        prNumber,
        comment,
        username,
        token,
      );
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error commenting on pull request:', serializedError);
    }
  }

  @Post('/request-changes/:number')
  async requestChangesOnPullRequest(
    @Param('number', ParseIntPipe) prNumber: number,
    @Body('owner') owner: string,
    @Body('repo') repo: string,
    @Body('comment') comment: string,
    @Body('username') username: string,
    @Body('user-access-token') token: string,
  ): Promise<void> {
    try {
      await this.githubService.requestChangesOnPullRequest(
        owner,
        repo,
        prNumber,
        comment,
        username,
        token,
      );
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error requesting changes on pull request:', serializedError);
    }
  }

  @Post('/approve/:number')
  async approvePullRequest(
    @Param('number', ParseIntPipe) number: number,
    @Body('owner') owner: string,
    @Body('repo') repo: string,
    @Body('prNumber') prNumber: number,
  ): Promise<void> {
    try {
      await this.githubService.approvePullRequest(owner, repo, prNumber);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error approving pull request:', serializedError);
    }
  }

  @Patch('/close/:number')
  async closePullRequest(
    @Param('number', ParseIntPipe) prNumber: number,
    @Body('owner') owner: string,
    @Body('repo') repo: string,
  ): Promise<void> {
    try {
      await this.githubService.closePullRequest(owner, repo, prNumber);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error closing pull request:', serializedError);
    }
  }

  @Patch('/:number/reopen')
  async reOpenPullRequest(
    @Param('number', ParseIntPipe) prNumber: number,
    @Body('owner') owner: string,
    @Body('repo') repo: string,
  ): Promise<void> {
    try {
      await this.githubService.reOpenPullRequest(owner, repo, prNumber);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error reopening pull request:', serializedError);
    }
  }

  @Get('/owner/:owner/repos/:repo/pulls')
  async getPullRequests(@Param('owner') owner: string, @Param('repo') repo: string): Promise<void> {
    try {
      return await this.githubService.getPullRequests(owner, repo);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error getting pull requests:', serializedError);
    }
  }

  @Get('/statuses/:owner/:repo/:number')
  async getPrStatuses(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number', ParseIntPipe) prNumber: number,
  ): Promise<void> {
    try {
      return await this.githubService.getPrStatuses(owner, repo, prNumber);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error getting pull request statuses:', serializedError);
    }
  }

  @Put('/merge/:number')
  async mergePullRequest(
    @Param('number', ParseIntPipe) prNumber: number,
    @Body('owner') owner: string,
    @Body('repo') repo: string,
  ): Promise<any> {
    try {
      await this.githubService.mergePullRequest(owner, repo, prNumber);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error merging pull request:', serializedError);
      throw new Error(error.message);
    }
  }
}
