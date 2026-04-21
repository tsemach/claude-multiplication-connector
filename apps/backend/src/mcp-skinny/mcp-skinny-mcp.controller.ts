import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import { type Response } from 'express';
import { McpSkinnyMcpService } from './mcp-skinny-mcp.service';

/**
 * MCP HTTP Transport endpoint.
 *
 * Claude Desktop: stdio + mcp-remote to this URL. If a launcher pins Node 18 on PATH, npx still
 * runs mcp-remote with that node and undici crashes (File is not defined); use scripts/run-mcp-remote.sh.
 */
@Controller('mcp')
export class McpSkinnyMcpController {
  constructor(private readonly mcpService: McpSkinnyMcpService) {}

  /** MCP JSON-RPC endpoint — Claude Desktop POSTs requests here */
  @Post()
  handleRpc(@Body() body: any) {
    return this.mcpService.handle(body);
  }

  /**
   * MCP SSE endpoint — required by the spec for server-initiated messages.
   * Claude Desktop opens this GET to receive async notifications.
   * We keep it open but only send a heartbeat; tool results flow via POST responses.
   */
  @Get()
  sse(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    res.on('close', () => clearInterval(heartbeat));
  }
}
