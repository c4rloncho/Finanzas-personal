import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Req, Query } from '@nestjs/common';
import { TransaccionService } from './transaccion.service';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';
import { AuthGuard } from '@nestjs/passport';
import { AddSaldoDto } from './dto/agregar-saldo.dto';
import { TransaccionDto } from './dto/transaccion.dto';
import { CategoriaDto } from './dto/categoria.dto';
import { CreateCategoriaDto } from './dto/crear-categoria.dto';

@Controller('transaccion')
export class TransaccionController {
  constructor(private readonly transaccionService: TransaccionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('all-month')
  async getTransaccionesByUserMonth(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{
    data: TransaccionDto[],
    total: number,
    page: number,
    lastPage: number
  }> {
    const userId = req.user.id;
    return this.transaccionService.getTransaccionesByUserMonth(userId, page, limit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('all-paginated')
  async getTransaccionesByUserPaginated(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('descripcion') descripcion?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('categoria') categoriaNombre?: string
  ): Promise<{
    data: TransaccionDto[],
    total: number,
    page: number,
    lastPage: number
  }> {
    const userId = req.user.id;
    const filters = {
      descripcion,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      categoriaNombre
    };

    return this.transaccionService.getTransaccionesByUserPaginated(
      userId,
      page,
      limit,
      filters
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async getTransaccionByUser(@Request() req): Promise<TransaccionDto[]> {
    const userId = req.user.id
    return this.transaccionService.getTransaccionesByUser(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/get-totales')
  async getTransactionSummary(@Request() req): Promise<{ totalIngresos: number; totalGastos: number }>{
    const userId = req.user.id;
    return await this.transaccionService.getTransactionSummary(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/gasto')
  async realizarGasto(@Body() createTransacciondto: CreateTransaccionDto, @Req() req) {
    const user = req.user;
    return await this.transaccionService.crearNuevoCobro(user.id, createTransacciondto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/agregar')
  async agregarSaldo(@Request() req, @Body() addSaldoDto: AddSaldoDto) {
    const userId = req.user.id
    return this.transaccionService.agregarSaldo(userId, addSaldoDto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('/categorias')
  async getAllCategorias(): Promise<CategoriaDto[]>{
    return await this.transaccionService.getAllCategorias();
  }
  @Post('/crear-categoria')
  @UseGuards(AuthGuard('jwt'))
  async createCategoria(@Request() req, @Body() createCategoriaDto: CreateCategoriaDto) {
    const userId = req.user.id;
    return this.transaccionService.createCategoria(createCategoriaDto, userId);
  }
}