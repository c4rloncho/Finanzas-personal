import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { TransaccionService } from './transaccion.service';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';
import { UpdateTransaccionDto } from './dto/update-transaccion.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('transaccion')
export class TransaccionController {
  constructor(private readonly transaccionService: TransaccionService) {}


  @UseGuards(AuthGuard)
  @Get('all')
  async getTransaccionByUser(@Request() req){
    const userId = req.user.id
    return this.transaccionService.getTransaccionesByUser(userId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getTransacciones(@Param('id') id: number){
    return this.transaccionService.getTransaccion(id);
  }

}
