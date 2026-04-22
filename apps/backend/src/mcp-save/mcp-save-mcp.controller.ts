import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { EventsStreamService } from '../events-stream/events-stream.service';

@Controller('mcp-save')
export class McpSaveSseController {
  constructor(private readonly eventsService: EventsStreamService) {}

  /**
   * Next.js client subscribes to this SSE endpoint.
   * GET http://localhost:3001/mcp-save/stream
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
