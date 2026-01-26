import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshSession,
  RefreshSessionSchema,
} from './schema/refresh-session.schema';
import { SessionsService } from './session.service';
import { SessionRepository } from './repositories/session.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshSession.name, schema: RefreshSessionSchema },
    ]),
  ],
  providers: [SessionsService, SessionRepository],
  exports: [SessionsService],
})
export class SessionModule {}
