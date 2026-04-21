import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { EventsStreamService } from '../events-stream/events-stream.service';

@Controller('mcp-full')
export class McpFullSseController {
  constructor(private readonly eventsService: EventsStreamService) {}

  /**
   * Next.js client subscribes to this SSE endpoint.
   * GET http://localhost:3001/mcp-full/stream
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
