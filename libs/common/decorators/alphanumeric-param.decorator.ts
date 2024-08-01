import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const StringParam = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const paramValue = request.params[data as string];

  if (paramValue === undefined || paramValue.length === 0) {
    throw new BadRequestException(`Parameter ${data} is required and cannot be empty`);
  }

  if (!/^[\w ,.\\-]+$/i.test(paramValue)) {
    throw new BadRequestException(`Invalid alphanumeric string: ${paramValue}`);
  }

  return paramValue;
});
