import { Module } from '@nestjs/common';
import { CuentaService } from './cuenta.service';
import { CuentaController } from './cuenta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuenta } from './entities/cuenta.entity';
import { User } from 'src/entities/user.entity';
import { Transaccion } from 'src/transaccion/entities/transaccion.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Cuenta,User,Transaccion]),],
  controllers: [CuentaController],
  providers: [CuentaService],
  exports: [CuentaService],
})
export class CuentaModule {}
