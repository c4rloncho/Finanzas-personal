import { Module } from '@nestjs/common';
import { CuentaService } from './cuenta.service';
import { CuentaController } from './cuenta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuenta } from './entities/cuenta.entity';
import { User } from 'src/entities/user.entity';
import { TransaccionModule } from 'src/transaccion/transaccion.module';

@Module({
  imports:[TypeOrmModule.forFeature([Cuenta,User]),TransaccionModule],
  controllers: [CuentaController],
  providers: [CuentaService],
})
export class CuentaModule {}
