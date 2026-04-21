import { Module } from '@nestjs/common';
import { EventsStreamController } from './events-stream.controller';
import { EventsStreamService } from './events-stream.service';

@Module({
  providers: [EventsStreamService],
  controllers: [EventsStreamController],
  exports: [EventsStreamService],
})
export class EventsStreamModule {}
