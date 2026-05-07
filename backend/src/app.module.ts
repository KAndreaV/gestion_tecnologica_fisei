import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OracleModule } from './infrastructure/database/oracle/oracle.module';
import { TestController } from './presentation/test/test.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OracleModule,
  ],
  controllers: [TestController],
})
export class AppModule {}