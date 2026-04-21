import { Module } from '@nestjs/common';
import { EventsStreamModule } from '../events-stream/events-stream.module';
import { MultiplicationModule } from '../multiplication/multiplication.module';
import { McpSkinnyMcpController } from './mcp-skinny-mcp.controller';
import { McpSkinnyMultiplicationController } from '../multiplication/mcp-skinny-multiplication.controller';
import { McpSkinnyMcpService } from './mcp-skinny-mcp.service';

@Module({
  imports: [EventsStreamModule, MultiplicationModule],
  controllers: [McpSkinnyMcpController, McpSkinnyMultiplicationController],
  providers: [McpSkinnyMcpService],
})
export class McpSkinnyModule {}
