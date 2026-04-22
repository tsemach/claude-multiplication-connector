import { Module } from '@nestjs/common';
import { EventsStreamModule } from '../events-stream/events-stream.module';
import { MultiplicationModule } from '../multiplication/multiplication.module';
import { McpSkinnyMcpController } from './mcp-skinny-mcp.controller';
import { MultiplicationController } from '../multiplication/multiplication.controller';
import { McpSkinnyMcpService } from './mcp-skinny-mcp.service';

@Module({
  imports: [EventsStreamModule, MultiplicationModule],
  controllers: [McpSkinnyMcpController, MultiplicationController],
  providers: [McpSkinnyMcpService],
})
export class McpSkinnyModule {}
