import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.APP_URL ?? 'http://localhost:3000', credentials: true });
  await app.listen(Number(process.env.PORT ?? 4000), '0.0.0.0');
}
void bootstrap();
