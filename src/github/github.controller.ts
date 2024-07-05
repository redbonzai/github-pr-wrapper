import { Controller, Post, Body } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Post('pr')
  async createPullRequest(
    @Body('head') head: string,
    @Body('base') base: string,
    @Body('title') title: string,
    @Body('body') body: string,
  ): Promise<void> {
    console.log('ABOUT to create PR ...');
    await this.githubService.createPullRequest(head, base, title, body);
  }
}
