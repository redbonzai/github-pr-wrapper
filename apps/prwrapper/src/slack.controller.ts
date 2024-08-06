import { Body, Controller, Post } from '@nestjs/common';
import { SlackSocketService } from '../../octokit/src/services/slack-socket.service';

@Controller('slack')
export class SlackController {
  constructor(private readonly slackSocketService: SlackSocketService) {}
  @Post('/message')
  async sendMessage(@Body('channel') channel: string, @Body('text') text: string): Promise<void> {
    return await this.slackSocketService.sendSlackMessage(channel, text);
  }
}
