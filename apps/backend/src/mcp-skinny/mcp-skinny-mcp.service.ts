import { Injectable } from '@nestjs/common';
import { MultiplicationService } from '../multiplication/multiplication.service';
import { Logger } from '@nestjs/common';

/**
 * Implements a minimal MCP (Model Context Protocol) server over HTTP.
 *
 * MCP over HTTP/SSE spec:
 *  - POST /mcp  → JSON-RPC 2.0 request body
 *  - GET  /mcp  → SSE stream for server-initiated messages (not used here)
 *
 * Claude Desktop connects via stdio transport when running as a child process,
 * OR via HTTP transport (used here for NestJS).
 */
@Injectable()
export class McpSkinnyMcpService {
  private readonly logger = new Logger(McpSkinnyMcpService.name);

  constructor(
    private readonly multiplicationService: MultiplicationService,
  ) {}

  /**
   * Dispatch an incoming MCP JSON-RPC request and return the response object.
   */
  handle(request: any): any {
    const { id, method, params } = request;

    this.logger.debug(`Received MCP request: ${JSON.stringify(request)}`);

    switch (method) {
      case 'initialize':
        this.logger.debug('Received initialize request');
        return this.respond(id, {
          protocolVersion: '2024-11-05',
          serverInfo: { name: 'multiplication-mcp-server', version: '1.0.0' },
          capabilities: { tools: {} },
        });

      case 'tools/list':
        this.logger.debug('Responding with tools/list response');
        return this.respond(id, {
          tools: [
            {
              name: 'save_multiplication_table',
              description:
                'Build the full n×n multiplication board (rows 1…n: cells 1×1 through n×n), persist it, and broadcast to connected web clients.',
              inputSchema: {
                type: 'object',
                properties: {
                  number: {
                    type: 'number',
                    description:
                      'Grid size n (integer). Produces rows 1×1…1×n, 2×1…2×n, …, n×1…n×n.',
                    minimum: 1,
                    maximum: 30,
                  },
                  requestedBy: {
                    type: 'string',
                    description:
                      'Optional label for who is requesting (e.g. "Claude Desktop").',
                  },
                },
                required: ['number'],
              },
            },
          ],
        });

      case 'tools/call': {
        this.logger.debug('Received tools/call request');
        const toolName = params?.name;
        const args = params?.arguments ?? {};

        if (toolName === 'save_multiplication_table') {
          this.logger.debug('Received save_multiplication_table request');
          const { number, requestedBy = 'Claude Desktop' } = args;

          if (
            typeof number !== 'number' ||
            !Number.isInteger(number) ||
            number < 1 ||
            number > 30
          ) {
            return this.error(
              id,
              -32602,
              'Invalid parameter: number must be an integer from 1 to 30.',
            );
          }

          const result = this.multiplicationService.saveTable(
            number,
            requestedBy,
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

          return this.respond(id, {
            content: [
              {
                type: 'text',
                text: `✅ ${result.size}×${result.size} multiplication board saved and broadcast.\n\n${tableStr}`,
              },
            ],
          });
        }

        return this.error(id, -32601, `Unknown tool: ${toolName}`);
      }

      // Ping / keepalive
      case 'ping':
        return this.respond(id, {});

      default:
        return this.error(id, -32601, `Method not found: ${method}`);
    }
  }

  private respond(id: any, result: any) {
    return { jsonrpc: '2.0', id, result };
  }

  private error(id: any, code: number, message: string) {
    return { jsonrpc: '2.0', id, error: { code, message } };
  }
}
