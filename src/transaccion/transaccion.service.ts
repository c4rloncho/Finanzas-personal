import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';
import { UpdateTransaccionDto } from './dto/update-transaccion.dto';
import { Transaccion } from './entities/transaccion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, In, Repository } from 'typeorm';
import { Cuenta } from 'src/cuenta/entities/cuenta.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class TransaccionService {
  constructor(
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async getTransaccion(
    idTransaccion: number,
  ): Promise<Transaccion> {
    try {
      const transaccion = await this.transaccionRepository.findOne({
        where: { id: idTransaccion },
        relations: ['cuenta.user'],
      });
      return transaccion;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Transacción no encontrada');
      }
    }
  }
  async realizarTransaccion(gasto:number,descripcion:string,cuenta:Cuenta){
    const transaccion = this.transaccionRepository.create({
      cuenta,
      descripcion,
      valor:gasto,
    });
    transaccion.fecha = new Date();
    return await this.transaccionRepository.save(transaccion);
  }
  async getTransaccionesByUser(userId: number): Promise<TransaccionDto[]> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { id: userId },
        relations: ['cuenta.transacciones'],
        
      });
      const transacciones: Transaccion[] = user.cuenta.transacciones;
      return transacciones.map(this.mapTransaccionToDto);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('usuario no encontrado');
      }
    }
  }
  private mapTransaccionToDto(transaccion: Transaccion): TransaccionDto {
    return {
      valor: transaccion.valor,
      fecha: transaccion.fecha,
      descripcion: transaccion.descripcion,
    };
  }
}
