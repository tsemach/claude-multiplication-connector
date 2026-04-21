import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { EventsStreamModule } from '../events-stream/events-stream.module';
import { MultiplicationModule } from '../multiplication/multiplication.module';
import { McpFullSseController } from './mcp-full-mcp.controller';
import { McpFullMultiplicationTool } from './mcp-full.tool';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'mcp-full',
      version: '1.0.0',
      mcpEndpoint: 'mcp-full',
    }),
    EventsStreamModule,
    MultiplicationModule,
  ],
  controllers: [McpFullSseController],
  providers: [McpFullMultiplicationTool],
})
export class McpFullModule {}
