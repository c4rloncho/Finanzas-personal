import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Configurar cookie-parser
  app.use(cookieParser());

  // Configurar ValidationPipe
  app.useGlobalPipes(new ValidationPipe());

  // Iniciar la aplicación
  await app.listen(4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();