import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Injectable, UsePipes, Req } from '@nestjs/common';
import { CuentaService } from './cuenta.service';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { agregarGastoDto } from './dto/agregar-gasto.dto';
import { AddSaldoDto } from './dto/anhadir-saldo.dto';

@Controller('cuenta')
export class CuentaController {
  constructor(private readonly cuentaService: CuentaService,

  ) {}

  @UseGuards(AuthGuard)
  @Get('saldo')
  async getSaldo(@Request() req){
    const userId = req.user.id
    return this.cuentaService.getSaldo(userId);
  }
  @UseGuards(AuthGuard)
  @Post('gasto')
  async agregarGasto(@Request() req, @Body() agregarGasto: agregarGastoDto){
    const userId = req.user.id
    return this.cuentaService.agregarGasto(userId, agregarGasto);
  }

  @UseGuards(AuthGuard)
  @Post('agregar')
  async agregarSaldo(@Request() req,@Body() addSaldoDto:AddSaldoDto ){
    const userId = req.user.id
    return this.cuentaService.agregarSaldo(userId,addSaldoDto);
  }

}
