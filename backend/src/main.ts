import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Configurar node-oracledb en Thick mode antes de iniciar la app
import './config/oracledb.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 3000;

  // CORS habilitado globalmente
  app.enableCors();

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtro global de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);

  console.log(`🟢 Backend corriendo en http://localhost:${port}`);
  console.log(`✅ Validaciones globales activadas`);
  console.log(`✅ Manejo global de errores activado`);
}
bootstrap();