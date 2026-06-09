import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestController } from './presentation/test/test.controller';
import { ArticulosModule } from './presentation/modules/articulos.module';
import { PrestamosModule } from './presentation/modules/prestamos.module';
import { MantenimientosModule } from './presentation/modules/mantenimientos.module';
import { MovimientosModule } from './presentation/modules/movimientos.module';
import { AuditoriaModule } from './presentation/modules/auditoria.module';
import { NotificacionesModule } from './presentation/modules/notificaciones.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    ArticulosModule,
    AuditoriaModule,
    NotificacionesModule,
    MovimientosModule,
    PrestamosModule,
    MantenimientosModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
