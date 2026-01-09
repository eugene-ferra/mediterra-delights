import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from 'src/сommon/types/access-token-payload.type';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
