import { Controller, Get, Post, Body } from '@nestjs/common';
import { McpSkinnyMultiplicationService } from './mcp-skinny-multiplication.service';

@Controller('multiplication')
export class McpSkinnyMultiplicationController {
  constructor(private readonly service: McpSkinnyMultiplicationService) {}

  /** GET /multiplication - fetch all stored results */
  @Get()
  getAll() {
    return this.service.getAll();
  }

  /** POST /multiplication - manually trigger (for testing without MCP) */
  @Post()
  create(@Body() body: { number: number; requestedBy?: string }) {
    return this.service.saveTable(body.number, body.requestedBy);
  }
}
