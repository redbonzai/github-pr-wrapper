import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { OctokitService } from './services/octokit.service';

@Controller('octokit')
export class OctokitController {
  constructor(private readonly octokitService: OctokitService) {}

  @Get('/app/info')
  appInfo() {
    console.log('inside controller appInfo');
    try {
      return this.octokitService.getAppInfo();
    } catch (error) {
      console.error(error);
    }
  }

  @Get('/installations')
  octokitInstallation() {
    try {
      return this.octokitService.getInstallations();
    } catch (error) {
      console.error(error);
    }
  }

  @Get('installation/token/:installationId')
  async installationToken(@Param('installationId') installationId: number) {
    return this.octokitService.installationToken(installationId);
  }

  @Post('/build-request')
  async buildUpRequest(
    @Body('installationId') installationId: number,
    @Body('owner') owner: string,
    @Body('repo') repo: string,
  ) {
    console.log('inside controller buildUpRequest');
    try {
      return this.octokitService.buildWebhookRequest(installationId, owner, repo);
    } catch (error) {
      console.error(error);
    }
  }
  //
  // @Get('/installation-token')
  // async installationToken() {
  //   console.log('inside controller installationToken');
  //   try {
  //     return this.octokitService.installationToken();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  //
  // @Get('/alert/details')
  // async alertDetails(@Body() alertDetails: any) {
  //   console.log('inside controller alertDetails');
  //   try {
  //     return this.octokitService.processAlert(alertDetails);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  @Delete('/jira-issue/:jirakey')
  async deleteJiraIssue(@Param('jirakey') jirakey: string) {
    return this.octokitService.deleteJiraIssue(jirakey);
    // return `Deleted Jira issue with key: ${jirakey}`;
  }

  @Get('/ngrok-test/url/:url')
  async ngrokTest(@Param('url') url: string) {
    return `Ngrok test successful for URL: ${url}`;
  }
}
