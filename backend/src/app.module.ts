import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestController } from './presentation/test/test.controller';
import { ArticulosModule } from './presentation/modules/articulos.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { UsuariosModule } from './presentation/modules/usuarios.module';
import { AuthModule } from './presentation/modules/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ArticulosModule,
    UsuariosModule,
    AuthModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}