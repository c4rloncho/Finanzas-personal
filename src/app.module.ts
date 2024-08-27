import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import config from './database/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CuentaModule } from './cuenta/cuenta.module';
import { TransaccionModule } from './transaccion/transaccion.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    ScheduleModule.forRoot(),
    AuthModule, CuentaModule, TransaccionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}