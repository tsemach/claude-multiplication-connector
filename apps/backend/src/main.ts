import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const defaultOrigins = ['http://localhost:3002', 'http://127.0.0.1:3002'];
  const origins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : defaultOrigins;
  app.enableCors({ origin: origins });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
