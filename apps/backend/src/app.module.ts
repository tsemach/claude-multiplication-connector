import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpFullModule } from './mcp-full/mcp-full.module';
import { McpSkinnyModule } from './mcp-skinny/mcp-skinny.module';
import { McpSaveModule } from './mcp-save/mcp-save.module';

@Module({
  imports: [McpSkinnyModule, McpFullModule, McpSaveModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
