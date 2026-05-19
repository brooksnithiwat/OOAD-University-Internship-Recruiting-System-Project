import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
   
  
  const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_URLS]
    .flatMap((value) => (value ? value.split(',') : []))
    .map((value) => value.trim())
    .filter(Boolean);

  const isAllowedOrigin = (origin?: string): boolean => {
    if (!origin) {
      return true;
    }

    if (allowedOrigins.includes(origin)) {
      return true;
    }

    return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin) || /^http:\/\/localhost:\d+$/i.test(origin);
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin ?? 'unknown'}`), false);
    },
    credentials: false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

bootstrap();
