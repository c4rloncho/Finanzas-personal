import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Injectable, UsePipes, Req, HttpStatus, HttpException } from '@nestjs/common';
import { CuentaService } from './cuenta.service';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { agregarGastoDto } from './dto/agregar-gasto.dto';
import { AddSaldoDto } from '../transaccion/dto/agregar-saldo.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('cuenta')
export class CuentaController {
  constructor(private readonly cuentaService: CuentaService,

  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('saldo')
  async getSaldo(@Request() req){
    const userId = req.user.id
    return this.cuentaService.getSaldo(userId);
  }



}
