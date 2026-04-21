import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { EventsStreamService } from './events-stream.service';

@Controller('events')
export class EventsStreamController {
  constructor(private readonly eventsService: EventsStreamService) {}

  /**
   * Next.js client subscribes to this SSE endpoint.
   * GET http://localhost:3001/events/stream
   */
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.eventsService.events$.pipe(
      map((data) => ({
        data,
        type: 'multiplication-result',
      })),
    );
  }
}
