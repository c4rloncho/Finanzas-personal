    import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
    import { TipoTransaccion, Transaccion } from './entities/transaccion.entity';
    import { InjectRepository } from '@nestjs/typeorm';
    import { Between, Connection, EntityNotFoundError, ILike, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
    import { User } from 'src/entities/user.entity';
    import { SchedulerRegistry } from '@nestjs/schedule';
    import { CronJob } from 'cron';
    import { CuentaService } from 'src/cuenta/cuenta.service';
    import { Cuenta } from 'src/cuenta/entities/cuenta.entity';
import { AddSaldoDto } from './dto/agregar-saldo.dto';
import { Categoria } from './entities/category.entity';
import { TransaccionDto } from './dto/transaccion.dto';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';
import { CategoriaDto } from './dto/categoria.dto';
import { CreateCategoriaDto } from './dto/crear-categoria.dto';

    @Injectable()
    export class TransaccionService {
      constructor(
        @InjectRepository(Transaccion)
        private readonly transaccionRepository: Repository<Transaccion>,
        @InjectRepository(Cuenta)
        private readonly cuentaRepository: Repository<Cuenta>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Categoria)
        private readonly categoriaRepository:Repository<Categoria>,
        private readonly cuentaService: CuentaService,
        private schedulerRegistry: SchedulerRegistry,
        private connection: Connection,
      ) {}
      async getTransaccion(idTransaccion: number): Promise<Transaccion> {
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
      async getTransaccionesByUser(userId: number): Promise<TransaccionDto[]> {
        try {
          const user = await this.userRepository.findOneOrFail({
            where: { id: userId },
            relations: ['cuenta','cuenta.transacciones','cuenta.transacciones.categoria'],
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
          monto: transaccion.monto,
          fecha: transaccion.fecha,
          descripcion: transaccion.descripcion,
          categoria: transaccion.categoria ? {
            nombre: transaccion.categoria.nombre,
            color: transaccion.categoria.color
          } : {
            nombre: 'Sin categoría',
            color: '#CCCCCC' // Un color por defecto
          }
        };
      }


      ////
  async crearNuevoCobro(idUser: number, datos: CreateTransaccionDto) {
    const { monto, descripcion, tipo, diaCobro } = datos;
    const user = await this.userRepository.findOne({
      where: { id: idUser },
      relations: ['cuenta']
    });
    const categoria = await this.categoriaRepository.findOne({where:{nombre:datos.categoria}})
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!(await this.verificarSaldoSuficiente(monto, user.id))) {
      throw new BadRequestException('Saldo insuficiente');
    }

    if (tipo === TipoTransaccion.AUTOMATICA) {
      const transaccion = this.transaccionRepository.create({
        descripcion,
        monto:-monto,
        tipo: TipoTransaccion.AUTOMATICA,
        diaCobro,
        cuenta: user.cuenta,
        activo: true,
        categoria:categoria,
        fechaProximoCobro: this.calcularFechaProximoCobro(diaCobro)
      });

      const savedTransaccion = await this.transaccionRepository.save(transaccion);
      await this.crearTransaccionAutomatica(savedTransaccion);
      return savedTransaccion;
    } else {
      return this.crearTransaccionRegular(user, monto, descripcion,categoria);
    }
  }


  async crearTransaccionAutomatica(transaccion: Transaccion) {
    const jobName = `transaccion_${transaccion.id}`;
    const cronExpression = this.generarExpresionCron(transaccion.diaCobro);
    const job = new CronJob(cronExpression, () => this.ejecutarCobroAutomatico(transaccion.id));
    
    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
  }

  async ejecutarCobroAutomatico(idTransaccion: number) {
    const transaccionAutomatica = await this.transaccionRepository.findOne({
      where: { id: idTransaccion },
      relations: ['cuenta', 'cuenta.user']
    });

    if (!transaccionAutomatica || !transaccionAutomatica.activo) {
      console.log(`Transacción automática ${idTransaccion} no encontrada o inactiva`);
      return;
    }

    const user = transaccionAutomatica.cuenta.user;

    if (!(await this.verificarSaldoSuficiente(transaccionAutomatica.monto, user.id))) {
      transaccionAutomatica.activo = false;
      await this.transaccionRepository.save(transaccionAutomatica);
      console.log(`Saldo insuficiente para la transacción automática ${idTransaccion}. Se ha desactivado.`);
      return;
    }

    // Crear una nueva transacción regular basada en la automática
    await this.crearTransaccionRegular(user, transaccionAutomatica.monto, `Cobro automático: ${transaccionAutomatica.descripcion}`,transaccionAutomatica.categoria);

    // Actualizar la fecha del próximo cobro
    transaccionAutomatica.fechaProximoCobro = this.calcularFechaProximoCobro(transaccionAutomatica.diaCobro);
    await this.transaccionRepository.save(transaccionAutomatica);
  }

  async crearTransaccionRegular(user: User, monto: number, descripcion: string,categoria:Categoria) {
    const transaccion = this.transaccionRepository.create({
      descripcion,
      monto:-monto,
      tipo: TipoTransaccion.REGULAR,
      cuenta: user.cuenta,
      categoria:categoria,
    });

    await this.transaccionRepository.save(transaccion);
    await this.realizarTransaccion(transaccion, user);

    return transaccion;
  }

  async realizarTransaccion(transaccion: Transaccion, user: User) {
    const cuenta = await this.cuentaRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user', 'transacciones'],
    });

    cuenta.saldo += transaccion.monto;
    await this.cuentaRepository.save(cuenta);

    return { cuenta, transaccion };
  }

  async verificarSaldoSuficiente(monto: number, idUser: number): Promise<boolean> {
    const cuenta = await this.cuentaService.getCuentaByUser(idUser);
    return cuenta.saldo >= -monto;
  }

  private generarExpresionCron(day: number): string {
    if (day < 1 || day > 31) {
      throw new BadRequestException('Día inválido');
    }
    if (day < 28) {
      return `0 0 ${day} * *`;
    }
    if (day === 31) {
      return `0 0 L * *`;
    }
    return `0 0 ${day},L * *`;
  }

  private calcularFechaProximoCobro(diaCobro: number): Date {
    const fecha = new Date();
    fecha.setDate(diaCobro);
    if (fecha <= new Date()) {
      fecha.setMonth(fecha.getMonth() + 1);
    }
    return fecha;
  }

  async agregarSaldo(userId: number, input: AddSaldoDto): Promise<{nuevoSaldo: number }> {
    return this.connection.transaction(async transactionalEntityManager => {
      const user = await transactionalEntityManager.findOne(User, {
        where: { id: userId },
        relations: ['cuenta']
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }

      if (input.monto <= 0) {
        throw new BadRequestException('El saldo a agregar debe ser positivo');
      }
      const categoria = await this.categoriaRepository.findOne({where:{nombre:input.categoria}})
      const transaccion = new Transaccion();
      transaccion.cuenta = user.cuenta;
      transaccion.descripcion = input.descripcion;
      transaccion.monto = input.monto;
      transaccion.tipo = TipoTransaccion.REGULAR_ENTRADA;
      transaccion.categoria = categoria;

      await transactionalEntityManager.save(Transaccion, transaccion);

      // Usar el CuentaService para agregar saldo, pasando el EntityManager
      const cuentaActualizada = await this.cuentaService.agregarSaldo(userId, input.monto, transactionalEntityManager);

      return {nuevoSaldo: cuentaActualizada.saldo };
    });
  }

  async getTransaccionesByUserPaginated(
    userId: number,
    page: number = 1,
    limit: number = 10,
    descripcion?: string,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<{ data: TransaccionDto[], total: number, page: number, lastPage: number }> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { id: userId },
        relations: ['cuenta'],
      });

      let whereClause: any = {
        cuenta: { id: user.cuenta.id },
      };

      if (descripcion) {
        whereClause.descripcion = ILike(`%${descripcion}%`);
      }

      if (fechaInicio && fechaFin) {
        whereClause.fecha = Between(fechaInicio, fechaFin);
      }

      const [transacciones, total] = await this.transaccionRepository.findAndCount({
        where: whereClause,
        relations: ['categoria'],
        order: {
          fecha: 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Mapear las transacciones al DTO
      const data = transacciones.map(this.mapTransaccionToDto);

      // Calcular la última página
      const lastPage = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        lastPage,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw error;
    }
  }

  async getTransaccionesByUserMonth(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: TransaccionDto[], total: number, page: number, lastPage: number }> {
    try {
      // Paso 1: Obtener el usuario con su cuenta
      const user = await this.userRepository.findOneOrFail({
        where: { id: userId },
        relations: ['cuenta'],
      });

      // Paso 2: Calcular la fecha límite (30 días atrás)
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);
      const fechaActual = new Date();

      // Paso 3: Contar el total de transacciones
      const total = await this.transaccionRepository.count({
        where: {
          cuenta: { id: user.cuenta.id },
          fecha: Between(fechaLimite, fechaActual),
        },
      });

      // Paso 4: Buscar las transacciones paginadas
      const transacciones = await this.transaccionRepository.find({
        where: {
          cuenta: { id: user.cuenta.id },
          
          fecha: Between(fechaLimite, fechaActual),
        },
        relations: ['categoria'],
        order: {
          fecha: 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Paso 5: Mapear las transacciones al DTO
      const data = transacciones.map(this.mapTransaccionToDto);

      // Paso 6: Calcular la última página
      const lastPage = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        lastPage,
      };
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw error;
    }
  }



  async getTransactionSummary(userId: number): Promise<{ totalIngresos: number; totalGastos: number }> {
    if (!Number.isInteger(userId)) {
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);
    const fechaActual = new Date();

    try {
      const transacciones = await this.transaccionRepository.find({
        where: {
          cuenta: { user: { id: userId } },
          fecha: Between(fechaLimite, fechaActual),
        },
        relations: ['cuenta'],
      });

      const { ingresos, gastos } = transacciones.reduce((acc, t) => {
        if (t.monto > 0) {
          acc.ingresos += Number(t.monto);
        } else {
          acc.gastos += Math.abs(Number(t.monto));
        }
        return acc;
      }, { ingresos: 0, gastos: 0 });

      return {
        totalIngresos: Number(ingresos.toFixed(2)),
        totalGastos: Number(gastos.toFixed(2))
      };
    } catch (error) {
      console.error('Error al obtener el resumen de transacciones:', error);
      throw new BadRequestException('Error al obtener el resumen de transacciones');
    }
  }
  async getAllCategorias(): Promise<CategoriaDto[]> {
    try {
      const categorias = await this.categoriaRepository.find();
      if (!categorias.length) {
        console.log('No se encontraron categorías');
      }
      return categorias.map(categoria => ({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        color: categoria.color
      }));
    } catch (error) {
      console.error('Error al obtener las categorías:', error);
      throw new Error('No se pudieron obtener las categorías');
    }
  }

  async createCategoria(createCategoriaDto: CreateCategoriaDto, userId: number): Promise<Categoria> {
    const { nombre, color } = createCategoriaDto;
    
    const categoria = this.categoriaRepository.create({
      nombre,
      color,
    });
    

    return this.categoriaRepository.save(categoria);
  }
}
