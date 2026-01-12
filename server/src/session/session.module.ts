import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshSession,
  RefreshSessionSchema,
} from './schema/refresh-session.schema';
import { SessionsService } from './session.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshSession.name, schema: RefreshSessionSchema },
    ]),
  ],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionModule {}
