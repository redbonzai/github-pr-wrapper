import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { ChatPostMessageResponse, WebClient } from '@slack/web-api';
import { InstallationTokenResponseDTO } from '../dto/installation-token.interface';
import { tokenCache } from '../utils/cache';

@Injectable()
export class OctokitService {
  private readonly logger = new Logger(OctokitService.name);
  private ProbotOctokit: any;

  constructor(private configService: ConfigService) {}

  private formatPrivateKey(privateKey: string): string {
    return privateKey.replace(/\\n/g, '\n');
  }

  private async returnEnvs(): Promise<any> {
    const appId = this.configService.get<string>('GITHUB_APP_ID');
    const privateKey = this.configService.get<string>('GITHUB_PRIVATE_KEY');
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');
    const installationToken = this.configService.get<string>('INSTALLATION_TOKEN');
    const installationId = this.configService.get<string>('INSTALLATION_ID');

    return {
      appId,
      privateKey,
      clientId,
      clientSecret,
      installationToken,
      installationId,
    };
  }

  private async pRetryInstance() {
    const { default: pRetry } = await import('p-retry');
    return pRetry;
  }

  private async importProbotOctokit() {
    if (!this.ProbotOctokit) {
      const { Octokit } = await import('@octokit/core');
      const { createProbotAuth } = await import('octokit-auth-probot');

      this.ProbotOctokit = Octokit.defaults({
        authStrategy: createProbotAuth,
      });
    }
    return this.ProbotOctokit;
  }

  async initializeOctokit() {
    const { appId, privateKey, clientId, clientSecret } = await this.returnEnvs();

    if (!appId || !privateKey || !clientId || !clientSecret) {
      throw new Error('Missing GitHub App credentials in environment variables');
    }

    const formattedPrivateKey = this.formatPrivateKey(privateKey);

    if (
      !formattedPrivateKey.includes('BEGIN RSA PRIVATE KEY') ||
      !formattedPrivateKey.includes('END RSA PRIVATE KEY')
    ) {
      throw new Error('Invalid private key format');
    }

    await this.importProbotOctokit();
    this.initializeProbotOctokit(appId, formattedPrivateKey, clientId, clientSecret);
  }

  private initializeProbotOctokit(
    appId: string,
    formattedPrivateKey: string,
    clientId: string,
    clientSecret: string,
  ) {
    this.ProbotOctokit = new this.ProbotOctokit({
      auth: {
        appId: parseInt(appId, 10),
        privateKey: formattedPrivateKey,
        clientId,
        clientSecret,
      },
    });
  }

  async getAppInfo() {
    if (!this.ProbotOctokit) {
      await this.initializeOctokit();
      const { data } = await this.ProbotOctokit.request('GET /app');
      this.logger.log('APP INFO RESPONSE: ', data);
      return { data };
    }
  }

  async getInstallations(): Promise<Array<any>> {
    // Replace these with your app's credentials
    const { appId, privateKey, clientId, clientSecret } = await this.returnEnvs();

    await this.importProbotOctokit();

    // Create an authenticated Octokit instance
    this.initializeProbotOctokit(appId, this.formatPrivateKey(privateKey), clientId, clientSecret);

    try {
      // Get a list of installations
      const { data: installations } = await this.ProbotOctokit.request('GET /app/installations');

      // Return or process installations as needed
      return installations;
    } catch (error) {
      this.logger.error('Error fetching installations:', error);
      throw new Error(error);
    }
  }

  async cacheInstallationTokenResponse(
    auth: any,
    installationId: number,
  ): Promise<InstallationTokenResponseDTO> {
    if (
      !tokenCache.get('installationTokenResponse') ||
      tokenCache.isExpired('installationTokenResponse')
    ) {
      const response = await auth({
        type: 'installation',
        installationId,
      });

      tokenCache.set('installationTokenResponse', response, 60 * 60 * 1000); // cache for 55 mins
      return tokenCache.get('installationTokenResponse') as unknown as InstallationTokenResponseDTO;
    } else {
      return tokenCache.get('installationTokenResponse') as unknown as InstallationTokenResponseDTO;
    }
  }

  async installationToken(installationId: number): Promise<InstallationTokenResponseDTO> {
    await this.initializeOctokit();

    const auth = this.ProbotOctokit.auth({
      type: 'installation',
      installationId,
    });

    console.log('AUTH: ', auth);

    return await this.cacheInstallationTokenResponse(auth, installationId);
  }

  /**
   * Authenticate with Octokit for a specific installation
   * @param installationId
   */
  async octokitByInstallation(installationId: number) {
    const { appId, privateKey, clientId, clientSecret } = await this.returnEnvs();

    const ProbotOctokit = await this.importProbotOctokit();
    return new ProbotOctokit({
      auth: {
        installationId,
        appId,
        privateKey: this.formatPrivateKey(privateKey),
        clientId,
        clientSecret,
      },
    });
  }

  async listOpenAlerts(octokit: any, owner: string, repo: string) {
    try {
      const { data: alerts } = await octokit.request(
        'GET /repos/{owner}/{repo}/secret-scanning/alerts',
        {
          owner,
          repo,
          state: 'open', // To get only open alerts
        },
      );

      console.log('Open alerts:', alerts);
      return alerts;
    } catch (error) {
      console.error('Error fetching open alerts:', error);
    }
  }

  async listRepositories(octokit: any) {
    try {
      const { data: repos } = await octokit.request('GET /installation/repositories');
      this.logger.log('Repositories:', repos.repositories);
      return repos.repositories;
    } catch (error) {
      this.logger.error('Error fetching repositories:', error);
    }
  }

  async getOrganizationInfo(octokit: any, org: string) {
    try {
      const { data: organization } = await octokit.request('GET /orgs/{org}', {
        org,
      });

      this.logger.log('Organization Info:', organization);
      return organization;
    } catch (error) {
      this.logger.error('Error fetching organization info:', error);
      throw new Error(error);
    }
  }

  async buildWebhookRequest(installationId: number, owner: string, repo: string) {
    const octokit = await this.octokitByInstallation(installationId);
    const request = [];
    const alert = await this.listOpenAlerts(octokit, owner, repo);

    const repository = await this.listRepositories(octokit);

    const organization = await this.getOrganizationInfo(octokit, owner);
    request.push({ alert, repository, organization });

    return { request };
  }

  async listRepositoryCommits(octokit: any, owner: string, repo: string) {
    try {
      const { data } = await octokit.request(`GET /repos/{owner}/{repo}/commits`, {
        owner,
        repo,
        per_page: 3,
      });

      return data;
    } catch (error) {
      this.logger.error('Error fetching commits:', error);
      throw new Error(error);
    }
  }

  async processAlert(alertDetails: any, installationId: number) {
    const { alert, repository } = alertDetails;

    // Extract necessary information
    const { secret_type, secret, html_url } = alert;
    const { full_name: repoFullName, name: repoName, owner } = repository;

    // Log the alert
    this.logger.log(`Secret detected in repository ${repoFullName}`);
    this.logger.log(`Secret Type: ${secret_type}`);
    this.logger.log(`Secret: ${secret}`);

    // Authenticate with GitHub using Octokit
    const installationOctokit = await this.octokitByInstallation(installationId);

    // Fetch repository commits
    const commits = await this.listRepositoryCommits(installationOctokit, owner.login, repoName);

    const author_username = commits[0].author.login;

    this.logger.log('Recent commits:', commits);
    //  return { commits };

    // Create a Jira ticket
    const jiraResponse = await this.createJiraTicket(
      secret_type,
      secret,
      repoFullName,
      html_url,
      author_username,
    );
    console.log('JIRA RESPONSE TICKET: ', jiraResponse.key);

    // Send a Slack notification
    await this.sendSlackNotification(
      secret_type,
      secret,
      repoFullName,
      html_url,
      author_username,
      jiraResponse.key,
    );

    return commits;
  }

  private async createJiraTicket(
    secretType: string,
    secret: string,
    repoFullName: string,
    url: string,
    authorUsername: string,
  ) {
    const jiraUrl = this.configService.get('JIRA_URL');
    const jiraUsername = this.configService.get('JIRA_USERNAME');
    const jiraApiToken = this.configService.get('JIRA_API_TOKEN');
    const jiraProjectKey = this.configService.get('JIRA_PROJECT_KEY');

    const authToken = Buffer.from(`${jiraUsername}:${jiraApiToken}`).toString('base64');

    const ticketData = {
      fields: {
        project: {
          key: jiraProjectKey,
        },
        summary: `Secret Detected: ${secretType} in ${repoFullName}`,
        description: `A secret of type ${secretType} was detected in the repository ${repoFullName}.\n\nSecret: ${secret}\n\n Author username: ${authorUsername}\nDetails: ${url}`,
        issuetype: {
          name: 'Bug',
        },
      },
    };

    const response: AxiosResponse = await axios.post(`${jiraUrl}/rest/api/2/issue`, ticketData, {
      headers: {
        Authorization: `Basic ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  async deleteJiraIssue(issueIdOrKey: string) {
    try {
      const jiraUrl = this.configService.get('JIRA_URL');
      const jiraEmail = this.configService.get('JIRA_EMAIL');
      const jiraApiToken = this.configService.get('JIRA_API_TOKEN');

      // Encode the email and API token in Base64
      const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

      const response = await axios.delete(`${jiraUrl}/rest/api/3/issue/${issueIdOrKey}`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      this.logger.log(`Deleted issue: ${issueIdOrKey}`, response.status);
    } catch (error) {
      if (error.response) {
        this.logger.error(`Error deleting issue: ${issueIdOrKey}`, error.response.data);
      } else {
        this.logger.error(`Error deleting issue: ${issueIdOrKey}`, error.message);
      }
      throw new Error(error);
    }
  }

  private async sendSlackNotification(
    secretType: string,
    secret: string,
    repoFullName: string,
    alertUrl: string,
    authorUsername: string,
    jiraTicket: string,
  ) {
    const jiraBaseUrl = this.configService.get('JIRA_URL');
    const slackToken = this.configService.get('SLACK_BOT_TOKEN');
    const channelId = this.configService.get('SLACK_CHANNEL_ID');

    const jiraTicketUrl = `${jiraBaseUrl}/browse/${jiraTicket}`;

    if (!slackToken || !channelId) {
      this.logger.error('Slack token or channel ID is not configured.');
      return;
    }

    const web: WebClient = new WebClient(slackToken);

    try {
      const result: ChatPostMessageResponse = await this.buildSlackPayload(
        web,
        channelId,
        authorUsername,
        secretType,
        repoFullName,
        secret,
        jiraTicketUrl,
        jiraTicket,
        alertUrl,
      );

      this.logger.log('Message sent to Slack:', result);
    } catch (error) {
      this.logger.error('Error sending message to Slack:', error);
      throw new Error(error);
    }
  }

  private async buildSlackPayload(
    web: WebClient,
    channelId: string,
    authorUsername: string,
    secretType: string,
    repoFullName: string,
    secret: string,
    jiraTicketUrl: string,
    jiraTicket: string,
    alertUrl: string,
  ) {
    const pRetry = await this.pRetryInstance();

    const response: ChatPostMessageResponse = await pRetry(
      () =>
        web.chat.postMessage({
          channel: channelId,
          text: `:WARNING: !SECRET DETECTED!\n\n 
          Author: ${authorUsername}\n\n 
          A secret of type *${secretType}* was detected in the repository *${repoFullName}*.\n\n
          *Secret*: \`${secret}\`\n\n
          *A Jira Ticket was created*: <${jiraTicketUrl}|${jiraTicket}>\n\n
          *Details*: <${alertUrl}|View it on GitHub>`,
        }),
      {
        onFailedAttempt: (error) => {
          this.logger.warn(
            `Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`,
            error,
          );
        },
        retries: 3,
        minTimeout: 1000,
        maxTimeout: 5000,
      },
    );
    this.logger.log('Message sent to Slack:', response);
    return response;
  }

  async getOpenPullRequests(owner: string, repo: string) {
    const { data } = await this.ProbotOctokit.pulls.list({
      owner,
      repo,
      state: 'open',
    });
    return data;
  }

  async getPullRequestFiles(owner: string, repo: string, pullNumber: number) {
    const { data } = await this.ProbotOctokit.pulls.listFiles({
      owner,
      repo,
      pullNumber,
    });
    return data;
  }

  async getFileContent(owner: string, repo: string, path: string, ref: string) {
    const { data } = await this.ProbotOctokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });
    return Buffer.from(data['content'], 'base64').toString('utf-8');
  }

  async createReview(owner: string, repo: string, pullNumber: number, body: string) {
    await this.ProbotOctokit.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      body,
      event: 'REQUEST_CHANGES',
    });
  }
}
