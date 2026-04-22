import { Controller, Get, Post, Body } from '@nestjs/common';
import { MultiplicationService } from './multiplication.service';

@Controller('multiplication')
export class MultiplicationController {
  constructor(private readonly service: MultiplicationService) {}

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
