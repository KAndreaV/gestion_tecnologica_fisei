import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Módulo de configuración centralizada
 * Gestiona todas las variables de entorno de la aplicación
 */
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useFactory: (configService: ConfigService) => ({
        port: configService.get<number>('PORT') || 3000,
        database: {
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          user: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          serviceName: configService.get<string>('DB_SERVICE_NAME'),
        },
        nodeEnv: configService.get<string>('NODE_ENV') || 'development',
        jwt: {
          secret: configService.get<string>('JWT_SECRET'),
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    },
  ],
  exports: ['CONFIG'],
})
export class AppConfigModule {}
