import { BadRequestException, Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { MultiplicationResult } from '../events-stream/events-stream.service';
import { MultiplicationService } from '../multiplication/multiplication.service';

const gridSchema = z
  .array(z.array(z.number().int()))
  .min(1)
  .max(30)
  .superRefine((g, ctx) => {
    const n = g.length;
    for (let i = 0; i < n; i++) {
      const row = g[i];
      if (row.length !== n) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Row ${i + 1} must have ${n} entries (square n×n grid).`,
        });
        return;
      }
    }
  });

@Injectable()
export class McpSaveMultiplicationTool {
  constructor(private readonly multiplicationService: MultiplicationService) {}

  @Tool({
    name: 'push_multiplication_board',
    description:
      'YOU must compute the full n×n multiplication board yourself (cell at row i, column j — 1-based — is i×j). Pass the completed grid as a 2D array: n rows, each row has n integers. The server only validates shape and broadcasts to web clients; it does not fill in products.',
    parameters: z.object({
      grid: gridSchema.describe(
        'n rows, each of length n. grid[r][c] = (r+1)×(c+1). Example for n=2: [[1,2],[2,4]].',
      ),
      requestedBy: z
        .string()
        .optional()
        .describe(
          'Optional label for who is requesting (e.g. "Claude Desktop").',
        ),
    }),
  })
  pushMultiplicationBoard({
    grid,
    requestedBy,
  }: {
    grid: number[][];
    requestedBy?: string;
  }) {
    let result: MultiplicationResult;
    try {
      result = this.multiplicationService.broadcastProvidedGrid(
        grid,
        requestedBy ?? 'Claude Desktop',
      );
    } catch (e) {
      if (e instanceof BadRequestException) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ ${e.message}`,
            },
          ],
          isError: true,
        };
      }
      throw e;
    }

    const tableStr = result.grid
      .map((row, ri) =>
        row
          .map((product, ci) => {
            const i = ri + 1;
            const j = ci + 1;
            return `${i}×${j}=${product}`;
          })
          .join('  '),
      )
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `✅ ${result.size}×${result.size} multiplication board received and broadcast to clients.\n\n${tableStr}`,
        },
      ],
    };
  }
}
