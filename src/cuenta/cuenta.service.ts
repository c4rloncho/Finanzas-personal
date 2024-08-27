import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, EntityNotFoundError, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Cuenta } from './entities/cuenta.entity';
import { agregarGastoDto } from './dto/agregar-gasto.dto';
import { SaldoDto } from './dto/saldo.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CuentaService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
  ){}
  create(createCuentaDto: CreateCuentaDto) {
    return 'This action adds a new cuenta';
  }
  
  async getCuentaByUser(idUser: number): Promise<Cuenta> {
    try {
        const cuenta = await this.cuentaRepository.findOneOrFail({
            where: {
                user: {
                    id: idUser
                }
            },
            relations: ['user']
        });

        return cuenta;
    } catch (error) {
        throw new NotFoundException(`No se encontró la cuenta para el usuario con ID ${idUser}`);
    }
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
    async agregarGasto(userId:number, gasto: number):Promise<Cuenta>{
      const user = await this.userRepository.findOneOrFail({
        where: { id: userId },
        relations:['cuenta'],
      });
      const cuenta = user.cuenta;
      cuenta.saldo -= gasto;

      const cuentaSaved = await this.cuentaRepository.save(cuenta);
      return cuentaSaved;
    }

    async agregarSaldo(userId: number, monto: number, entityManager?: EntityManager): Promise<Cuenta> {
      const manager = entityManager || this.cuentaRepository.manager;
      
      const cuenta = await manager.findOne(Cuenta, { where: { user: { id: userId } } });
      if (!cuenta) {
        throw new NotFoundException(`Cuenta para el usuario con ID ${userId} no encontrada`);
      }
  
      cuenta.saldo += monto;
      return manager.save(Cuenta, cuenta);
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

  async validarSaldoSuficiente(idUser:number,monto:number){
    const user = await this.userRepository.findOne({where:{id:idUser},relations:['cuenta']})
    if(!user){
      throw new NotFoundException('usuario no encontrado')
    }
    const saldoUser = user.cuenta.saldo
    //verificamos que el saldo del usuario es mayor al gasto que se quiere realizar
      if (saldoUser < monto) {
        throw new HttpException(
          `Saldo insuficiente. Saldo actual: ${user.cuenta.saldo}`,
          HttpStatus.BAD_REQUEST
        );
      }
    return true;
  }
}
