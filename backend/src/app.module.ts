import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestController } from './presentation/test/test.controller';
import { ArticulosModule } from './presentation/modules/articulos.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { CategoriasModule } from './presentation/modules/categorias.module';
import { DepartamentosModule } from './presentation/modules/departamentos.module';
import { EstadosModule } from './presentation/modules/estados.module';
import { UbicacionesModule } from './presentation/modules/ubicaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ArticulosModule,
    CategoriasModule,
    EstadosModule,
    DepartamentosModule,
    UbicacionesModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
