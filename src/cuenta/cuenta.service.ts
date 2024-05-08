import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Cuenta } from './entities/cuenta.entity';
import { agregarGastoDto } from './dto/agregar-gasto.dto';
import { AddSaldoDto } from './dto/anhadir-saldo.dto';
import { TransaccionService } from 'src/transaccion/transaccion.service';
import { SaldoDto } from './dto/saldo.dto';

@Injectable()
export class CuentaService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
    private transaccionService:TransaccionService,
  ){}
  create(createCuentaDto: CreateCuentaDto) {
    return 'This action adds a new cuenta';
  }

  findAll() {
    return `This action returns all cuenta`;
  }
  async getSaldo(idUser:number): Promise<SaldoDto> {
    try {
      const cuenta = await this.cuentaRepository.findOneOrFail({
        where: { user: { id:idUser } },
        relations: ['user'],
      });
      const saldoDto = new SaldoDto();
      saldoDto.saldo = cuenta.saldo;
      return saldoDto;
    }
    catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Cuenta no encontrada');
      }
    }

  }
    async agregarGasto(userId:number, {gasto,descripcion}: agregarGastoDto){
      const user = await this.userRepository.findOneOrFail({
        where: { id: userId },
        relations:['cuenta'],
      });
      const cuenta = user.cuenta;
      if (cuenta.saldo < gasto) {
        throw new HttpException(
          `Saldo insuficiente. Saldo actual: ${cuenta.saldo}`,
          HttpStatus.BAD_REQUEST
        );
      }
      cuenta.saldo -= gasto;
      //tengo que hacer la transaccion en este punto
      await this.transaccionService.realizarTransaccion((-gasto),descripcion,cuenta);
      await this.cuentaRepository.save(cuenta);
      return { message: `gasto agregado correctamente  de ${gasto}`}; 
    }

    async agregarSaldo(userId: number, { saldo,descripcion }: AddSaldoDto) {
      try {
        const user = await this.userRepository.findOneOrFail({ 
          where: { id: userId },
          relations: ['cuenta'], });
        const cuenta = user.cuenta;
        cuenta.saldo += saldo;
        //registrar saldo
        await this.transaccionService.realizarTransaccion(saldo,descripcion,cuenta);
        await this.cuentaRepository.save(cuenta);
        return { message: 'Saldo agregado correctamente' };
      } catch (error) {
        console.error('Error al agregar saldo:', error);
        throw new HttpException(
          'Error al agregar saldo. Por favor, inténtalo de nuevo más tarde.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

  findOne(id: number) {
    return `This action returns a #${id} cuenta`;
  }

  update(id: number, updateCuentaDto: UpdateCuentaDto) {
    return `This action updates a #${id} cuenta`;
  }

  remove(id: number) {
    return `This action removes a #${id} cuenta`;
  }
}
