import { BadRequestException, Injectable } from '@nestjs/common';
import {
  EventsStreamService,
  MultiplicationResult,
} from '../events-stream/events-stream.service';

@Injectable()
export class McpSkinnyMultiplicationService {
  // In-memory store (replace with a real DB like TypeORM/Prisma)
  private results: MultiplicationResult[] = [];

  constructor(private readonly eventsService: EventsStreamService) {}

  /**
   * Called by the MCP tool. Builds an n×n grid (cell (i,j) = i×j), persists it, and broadcasts via SSE.
   */
  saveTable(
    number: number,
    requestedBy = 'Claude Desktop',
  ): MultiplicationResult {
    const n = number;
    if (!Number.isInteger(n) || n < 1 || n > 30) {
      throw new BadRequestException('number must be an integer from 1 to 30.');
    }
    const grid: number[][] = [];
    for (let i = 1; i <= n; i++) {
      const row: number[] = [];
      for (let j = 1; j <= n; j++) {
        row.push(i * j);
      }
      grid.push(row);
    }

    const entry: MultiplicationResult = {
      size: n,
      grid,
      timestamp: new Date().toISOString(),
      requestedBy,
    };

    this.results.push(entry);

    // 🔔 Broadcast to all SSE subscribers (Next.js clients)
    this.eventsService.emit(entry);

    return entry;
  }

  getAll(): MultiplicationResult[] {
    return this.results;
  }
}
