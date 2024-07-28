import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const StringQuery = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  let queryValue = request.query[data as string];
  const logger = ctx.switchToHttp().getRequest().loggerInjectorService.logger;

  if (queryValue === undefined || queryValue.length === 0) {
    queryValue = '';
    logger.warn(`Query parameter ${data} is expected to be not empty`);
  }

  if (!/^[\w ,.\\-]+$/i.test(queryValue)) {
    throw new BadRequestException(`Invalid alphanumeric string: ${queryValue}`);
  }

  return queryValue;
});
