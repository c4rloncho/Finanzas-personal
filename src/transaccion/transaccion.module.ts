import { Module } from '@nestjs/common';
import { TransaccionService } from './transaccion.service';
import { TransaccionController } from './transaccion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { Cuenta } from 'src/cuenta/entities/cuenta.entity';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { CuentaModule } from 'src/cuenta/cuenta.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Categoria } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaccion,User,Cuenta,Categoria]),CuentaModule, 
  ScheduleModule.forRoot()],
  exports: [TransaccionService],
  controllers: [TransaccionController],
  providers: [TransaccionService],
})
export class TransaccionModule {}
