import { Module } from '@nestjs/common';
import { TransaccionService } from './transaccion.service';
import { TransaccionController } from './transaccion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { Cuenta } from 'src/cuenta/entities/cuenta.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaccion,User,Cuenta])],
  exports: [TransaccionService],
  controllers: [TransaccionController],
  providers: [TransaccionService],
})
export class TransaccionModule {}
