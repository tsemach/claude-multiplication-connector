import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { EventsStreamModule } from '../events-stream/events-stream.module';
import { MultiplicationModule } from '../multiplication/multiplication.module';
import { McpSaveSseController } from './mcp-save-mcp.controller';
import { McpSaveMultiplicationTool } from './mcp-save.tool';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'mcp-save',
      version: '1.0.0',
      mcpEndpoint: 'mcp-save',
    }),
    EventsStreamModule,
    MultiplicationModule,
  ],
  controllers: [McpSaveSseController],
  providers: [McpSaveMultiplicationTool],
})
export class McpSaveModule {}
