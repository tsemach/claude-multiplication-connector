import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function buildCorsOrigins(originStrings: string[]): (string | RegExp)[] {
  return originStrings.map((origin) => {
    // Convert wildcard patterns like http://*:3002 to RegExp
    if (origin.includes('*')) {
      const pattern = origin.replace(/\./g, '\\.').replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`);
    }
    return origin;
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const defaultOrigins = ['http://localhost:3002', 'http://127.0.0.1:3002'];
  const originStrings = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : defaultOrigins;
  const origins = buildCorsOrigins(originStrings);
  app.enableCors({ origin: origins });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
