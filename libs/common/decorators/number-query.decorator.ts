import { createParamDecorator, ExecutionContext, BadRequestException } from "@nestjs/common";

export const NumberQuery = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const queryValue = request.query[data as string];
  const isNumeric = (val: string) =>
    !Number.isNaN(Number.parseFloat(val)) && Number.isFinite(Number(val));

  if (!isNumeric(queryValue)) {
    throw new BadRequestException(`Invalid number: ${queryValue}`);
  }
  return Number(queryValue);
});
