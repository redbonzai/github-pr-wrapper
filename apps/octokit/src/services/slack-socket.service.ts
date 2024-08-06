import { Injectable, Logger } from '@nestjs/common';
import { SocketModeClient } from '@slack/socket-mode';
import { ChatPostMessageResponse, LogLevel, WebClient } from '@slack/web-api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SlackSocketService {
  private readonly logger = new Logger(SlackSocketService.name);
  private socketModeClient: SocketModeClient;
  private webClient: WebClient;

  constructor(private readonly configService: ConfigService) {
    this.socketModeClient = new SocketModeClient({
      appToken: this.configService.get('RB_SLACK_APP_LEVEL_TOKEN'),
      logLevel: LogLevel.DEBUG,
      logger: {
        debug: this.logger.debug.bind(this.logger),
        info: this.logger.log.bind(this.logger),
        warn: this.logger.warn.bind(this.logger),
        error: this.logger.error.bind(this.logger),
        setLevel: () => {},
        getLevel: () => LogLevel.DEBUG,
        setName: () => {},
      },
    });

    this.webClient = new WebClient(process.env.SLACK_BOT_TOKEN);

    this.setupSocketMode();
  }

  private async pRetryInstance() {
    const { default: pRetry } = await import('p-retry');
    return pRetry;
  }

  private setupSocketMode() {
    this.socketModeClient.on('slack_event', async ({ ack, body }) => {
      this.logger.log('Received event:', JSON.stringify(body, null, 2));
      await ack();

      if (body.event.type === 'secret_scanning_alert') {
        await this.processSecretScanningAlert(body.event);
      }
    });

    this.socketModeClient.start().catch((error) => {
      this.logger.error('Failed to start Socket Mode:', error);
    });
  }

  private async processSecretScanningAlert(event: any) {
    this.logger.log('Processing secret scanning alert:', event);
    // Implement your logic to handle the alert
  }

  async sendSlackMessage(channel: string, text: string) {
    try {
      const pRetry = await this.pRetryInstance();
      const result: ChatPostMessageResponse = await pRetry(
        () => this.trySendMessage(channel, text),
        {
          onFailedAttempt: (error) => {
            this.logger.warn(
              `Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`,
              error,
            );
          },
          retries: 3, // Number of retry attempts
          minTimeout: 1000, // Minimum delay between retries in milliseconds
          maxTimeout: 5000, // Maximum delay between retries in milliseconds
        },
      );

      this.logger.log('Message sent:', result);
    } catch (error) {
      this.logger.error('Failed to send Slack message after retries:', error);
      // Optional: handle failure, such as notifying a different channel or alert system
    }
  }

  private async trySendMessage(channel: string, text: string) {
    return this.webClient.chat.postMessage({
      channel,
      text,
    });
  }
}
