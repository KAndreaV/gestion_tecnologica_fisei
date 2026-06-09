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
<<<<<<< HEAD
=======
<<<<<<< HEAD
import { UsuariosModule } from './presentation/modules/usuarios.module';
import { AuthModule } from './presentation/modules/auth.module';
=======
import { AuthModule } from './auth/auth.module';
>>>>>>> develop
>>>>>>> develop

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    ArticulosModule,
<<<<<<< HEAD
=======
<<<<<<< HEAD
    UsuariosModule,
    AuthModule,
=======
    AuditoriaModule,
    NotificacionesModule,
    MovimientosModule,
    PrestamosModule,
    MantenimientosModule,
>>>>>>> develop
>>>>>>> develop
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
