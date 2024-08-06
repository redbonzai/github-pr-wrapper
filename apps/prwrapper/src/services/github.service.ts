import { Injectable } from '@nestjs/common';

import { fetchData } from '../../../../libs/common/services/fetch.service';
import { ConfigService } from '@nestjs/config';
import { GithubResponseDTO } from '../dto/github-response.dto';

@Injectable()
export class GithubService {
  private readonly githubToken: string;
  private readonly githubAPIUrl: string;

  constructor(private configService: ConfigService) {
    this.githubToken = this.configService.get<string>('TOKEN');
    this.githubAPIUrl = this.configService.get<string>('GITHUB_API_URL');
  }

  getHeaders(token?: string) {
    return {
      Authorization: `token ${this.githubToken || token}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  async createPullRequest(
    owner: string,
    repo: string,
    head: string,
    base: string,
    title: string,
    body: string,
  ): Promise<any> {
    const url = `${this.githubAPIUrl}/repos/${owner}/${repo}/pulls`;
    console.log('PR URL: ', url);

    const data = {
      title,
      head,
      base,
      body,
    };

    try {
      const response = await fetchData(url, 'POST', this.getHeaders(), data);
      console.log('Pull request created successfully:', response.data.html_url);
      return response;
    } catch (error) {
      console.error(
        'Error creating pull request:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  async commentOnPullRequest(
    owner: string,
    repo: string,
    prNumber: number,
    comment: string,
    username: string,
    token: string,
  ): Promise<void> {
    const url = `${this.githubAPIUrl}/repos/${owner}/${repo}/issues/${prNumber}/comments`;

    const data = {
      body: comment,
      user: username,
    };

    try {
      const response = await fetchData(url, 'POST', this.getHeaders(token), data);
      console.log('Comment added successfully:', response);
      return response;
    } catch (error) {
      console.error('Error adding comment:', error.response ? error.response.data : error.message);
    }
  }

  async requestChangesOnPullRequest(
    owner: string,
    repo: string,
    prNumber: number,
    comment: string,
    username: string,
    token: string,
  ): Promise<void> {
    const url = `${this.githubAPIUrl}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`;

    const data = {
      body: comment,
      event: 'REQUEST_CHANGES',
      user: username,
    };

    try {
      const response = await fetchData(url, 'POST', this.getHeaders(token), data);

      console.log('Requested changes successfully:', response.data);
    } catch (error) {
      console.error(
        'Error requesting changes:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  async approvePullRequest(owner: string, repo: string, prNumber: number): Promise<void> {
    const url = `${this.githubAPIUrl}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`;
    const data = {
      event: 'APPROVE',
    };

    try {
      const response = await fetchData(url, 'POST', this.getHeaders(), data);
      console.log('Pull request approved successfully:', response.data);
    } catch (error) {
      console.error(
        'Error approving pull request:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  async getPrStatuses(owner: string, repo: string, pull_number: number) {
    try {
      const response = await fetchData(
        `${this.githubAPIUrl}/repos/${owner}/${repo}/pulls/${pull_number}/statuses`,
        'GET',
        this.getHeaders(),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error getting pull request statuses:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  async mergePullRequest(owner: string, repo: string, pull_number: number): Promise<any> {
    // Step 1: Check the pull request statuses
    const statuses = await this.getPrStatuses(owner, repo, pull_number);
    if (!statuses || !Array.isArray(statuses)) {
      throw new Error('Failed to retrieve pull request statuses');
    }

    // Ensure all statuses are 'success'
    const failedStatuses = statuses.filter((status) => status.state !== 'success');
    if (failedStatuses.length > 0) {
      const failedContexts = failedStatuses.map((status) => status.context).join(', ');
      throw new Error(`Not all checks have passed. Failed checks: ${failedContexts}`);
    }

    const data = {
      commit_title: `Merging PR #${pull_number}`,
      merge_method: 'merge', // Options: merge, squash, rebase
    };

    // Step 2: Merge the pull request
    const response = await fetchData(
      `${this.githubAPIUrl}/repos/${owner}/${repo}/pulls/${pull_number}/merge`,
      'PUT',
      this.getHeaders(),
      data,
    );

    return response.data;
  }

  async closePullRequest(owner: string, repo: string, prNumber: number): Promise<any> {
    const url = `${this.githubAPIUrl}/repos/${owner}/${repo}/pulls/${prNumber}`;

    const data = {
      state: 'closed',
    };

    try {
      return await fetchData(url, 'PATCH', this.getHeaders(), data);
    } catch (error) {
      throw new Error(error);
    }
  }

  async reOpenPullRequest(owner: string, repo: string, prNumber: number): Promise<any> {
    const url = `${this.githubAPIUrl}/repos/${owner}/${repo}/pulls/${prNumber}`;
    const data = {
      state: 'open',
    };

    try {
      return await fetchData(url, 'PATCH', this.getHeaders(), data);
    } catch (error) {
      throw new Error(
        'Error reopening pull request: ' + (error.response ? error.response.data : error.message),
      );
    }
  }

  async getPullRequests(owner: string, repo: string) {
    try {
      const response = await fetchData(
        `${this.githubAPIUrl}/repos/${owner}/${repo}/pulls`,
        'GET',
        this.getHeaders(),
      );

      return { pullRequests: response } as GithubResponseDTO;
    } catch (error) {
      console.error(
        'Error getting pull requests:',
        error.response ? error.response.data : error.message,
      );
    }
  }
}
