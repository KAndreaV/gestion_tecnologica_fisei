import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestController } from './presentation/test/test.controller';
import { ArticulosModule } from './presentation/modules/articulos.module';
import { PrestamosModule } from './presentation/modules/prestamos.module';
import { MovimientosModule } from './presentation/modules/movimientos.module';
import { AuditoriaModule } from './presentation/modules/auditoria.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ArticulosModule,
    AuditoriaModule,
    MovimientosModule,
    PrestamosModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
