import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GithubService {
  private readonly githubToken: string;
  private readonly owner: string;
  private readonly repo: string;

  constructor(private configService: ConfigService) {
    this.githubToken = this.configService.get<string>('GITHUB_TOKEN');
    this.owner = this.configService.get<string>('GITHUB_OWNER');
    this.repo = this.configService.get<string>('GITHUB_REPO');
  }

  async createPullRequest(
    head: string,
    base: string,
    title: string,
    body: string,
  ): Promise<void> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls`;

    const data = {
      title,
      head,
      base,
      body,
    };

    const headers = {
      Authorization: `token ${this.githubToken}`,
      Accept: 'application/vnd.github.v3+json',
    };

    try {
      const response = await axios.post(url, data, { headers });
      console.log('PR CREATION RESPONSE: ', response);
      console.log('Pull request created successfully:', response.data.html_url);
    } catch (error) {
      console.error(
        'Error creating pull request:',
        error.response ? error.response.data : error.message,
      );
    }
  }
}
