import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { MultiplicationService } from '../multiplication/multiplication.service';

@Injectable()
export class McpFullMultiplicationTool {
  constructor(
    private readonly multiplicationService: MultiplicationService,
  ) {}

  @Tool({
    name: 'save_multiplication_table',
    description:
      'Build the full n×n multiplication board (rows 1…n: cells 1×1 through n×n), persist it, and broadcast to connected web clients.',
    parameters: z.object({
      number: z
        .number()
        .int()
        .min(1)
        .max(30)
        .describe(
          'Grid size n (integer). Produces rows 1×1…1×n, 2×1…2×n, …, n×1…n×n.',
        ),
      requestedBy: z
        .string()
        .optional()
        .describe(
          'Optional label for who is requesting (e.g. "Claude Desktop").',
        ),
    }),
  })
  saveMultiplicationTable({
    number,
    requestedBy,
  }: {
    number: number;
    requestedBy?: string;
  }) {
    const result = this.multiplicationService.saveTable(
      number,
      requestedBy ?? 'Claude Desktop',
    );

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
          text: `✅ ${result.size}×${result.size} multiplication board saved and broadcast.\n\n${tableStr}`,
        },
      ],
    };
  }
}
