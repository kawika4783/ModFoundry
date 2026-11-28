import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ForbiddenException } from '@nestjs/common';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.use((req: {method:string;headers:{origin?:string}}, _res: unknown, next: (error?: Error)=>void) => {
    if (!['GET','HEAD','OPTIONS'].includes(req.method) && req.headers.origin) {
      const allowed = new URL(process.env.APP_URL ?? 'http://localhost:3000').origin;
      if (req.headers.origin !== allowed) return next(new ForbiddenException('Unexpected origin'));
    }
    next();
  });
  app.enableCors({ origin: process.env.APP_URL ?? 'http://localhost:3000', credentials: true });
  await app.listen(Number(process.env.PORT ?? 4000), '0.0.0.0');
}
void bootstrap();
