import { Module } from '@nestjs/common';
import { EventsStreamModule } from '../events-stream/events-stream.module';
import { MultiplicationService } from './multiplication.service';

/**
 * One shared multiplication store + broadcast for skinny HTTP MCP, full MCP (@rekog), and GET /multiplication.
 */
@Module({
  imports: [EventsStreamModule],
  providers: [MultiplicationService],
  exports: [MultiplicationService],
})
export class MultiplicationModule {}
