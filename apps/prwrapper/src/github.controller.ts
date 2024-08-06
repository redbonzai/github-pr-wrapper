import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { GithubService } from './services/github.service';
import { Logger } from 'nestjs-pino';
import errorSerializer from '../../../libs/common/serializer/error.serializer';
import {
  ApprovePullRequestDto,
  ClosePullRequestDto,
  CommentPullRequestDto,
  CreatePullRequestDto,
  OwnerRepoDto,
  RequestChangesDto,
} from './dto';
import { GithubResponseDTO } from './dto/github-response.dto';
import { NumberParam, StringParam } from '../../../libs/common/decorators/';

@Controller('github/pull-request')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly logger: Logger,
  ) {}

  @Post('/')
  async createPullRequest(@Body() createPullRequestDto: CreatePullRequestDto): Promise<void> {
    try {
      const { owner, repo, head, base, title, body } = createPullRequestDto;
      await this.githubService.createPullRequest(owner, repo, head, base, title, body);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error creating pull request:', serializedError);
    }
  }

  @Post('/comment/:number')
  async commentOnPullRequest(
    @Param('number', ParseIntPipe) prNumber: number,
    @Body() commentOnPullRequestDto: CommentPullRequestDto,
  ): Promise<any> {
    try {
      const { owner, repo, comment, username, userAccessToken } = commentOnPullRequestDto;
      return await this.githubService.commentOnPullRequest(
        owner,
        repo,
        prNumber,
        comment,
        username,
        userAccessToken,
      );
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error commenting on pull request:', serializedError);
    }
  }

  @Post('/request-changes/:number')
  async requestChangesOnPullRequest(
    @Param('number', ParseIntPipe) prNumber: number,
    @Body() requestChangesDto: RequestChangesDto,
  ): Promise<any> {
    try {
      const { owner, repo, comment, username, userAccessToken } = requestChangesDto;
      return await this.githubService.requestChangesOnPullRequest(
        owner,
        repo,
        prNumber,
        comment,
        username,
        userAccessToken,
      );
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error requesting changes on pull request:', serializedError);
      return serializedError;
    }
  }

  @Post('/approve/:number')
  async approvePullRequest(
    @Param('prId', ParseIntPipe) prId: number,
    @Body() approvePullRequestDto: ApprovePullRequestDto,
  ): Promise<void> {
    try {
      const { owner, repo } = approvePullRequestDto;
      await this.githubService.approvePullRequest(owner, repo, prId);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error approving pull request:', serializedError);
    }
  }

  @Patch('/close/:number')
  async closePullRequest(
    @NumberParam('number', ParseIntPipe) prNumber: number,
    @Body() closePrDto: ClosePullRequestDto,
  ): Promise<any> {
    try {
      const { owner, repo } = closePrDto;
      return await this.githubService.closePullRequest(owner, repo, prNumber);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error closing pull request:', serializedError);
    }
  }

  @Patch('/:number/reopen')
  async reOpenPullRequest(
    @NumberParam('number', ParseIntPipe) prNumber: number,
    @Body() ownerRepoDto: OwnerRepoDto,
  ): Promise<any> {
    try {
      const { owner, repo } = ownerRepoDto;
      return await this.githubService.reOpenPullRequest(owner, repo, prNumber);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error reopening pull request:', serializedError);
    }
  }

  @Get('/owner/:owner/repos/:repo/pulls')
  async getPullRequests(
    @StringParam('owner') owner: string,
    @StringParam('repo') repo: string,
  ): Promise<GithubResponseDTO> {
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
    @Body() ownerRepoDto: OwnerRepoDto,
  ): Promise<any> {
    try {
      const { owner, repo } = ownerRepoDto;
      await this.githubService.mergePullRequest(owner, repo, prNumber);
    } catch (error) {
      const serializedError = errorSerializer(error);
      this.logger.error('Error merging pull request:', serializedError);
      throw new Error(error.message);
    }
  }
}
