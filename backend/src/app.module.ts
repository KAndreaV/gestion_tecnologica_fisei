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
import { UsuariosModule } from './presentation/modules/usuarios.module';
import { AuthModule } from './presentation/modules/auth.module';
import { CategoriasModule } from './presentation/modules/categorias.module';
import { UbicacionesModule } from './presentation/modules/ubicaciones.module';
import { EstadosModule } from './presentation/modules/estados.module';
import { DepartamentosModule } from './presentation/modules/departamentos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    ArticulosModule,
    UsuariosModule,
    AuditoriaModule,
    NotificacionesModule,
    MovimientosModule,
    PrestamosModule,
    MantenimientosModule,
    CategoriasModule,
    UbicacionesModule,
    EstadosModule,
    DepartamentosModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
