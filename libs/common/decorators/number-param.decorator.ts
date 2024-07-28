import { createParamDecorator, ExecutionContext, BadRequestException } from "@nestjs/common";

export const NumberParam = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const paramValue = request.params[data as string];
  const isNumeric = (val: string) =>
    !Number.isNaN(Number.parseFloat(val)) && Number.isFinite(Number(val));

  if (!isNumeric(paramValue)) {
    throw new BadRequestException(`Invalid number: ${paramValue}`);
  }
  return Number(paramValue);
});
