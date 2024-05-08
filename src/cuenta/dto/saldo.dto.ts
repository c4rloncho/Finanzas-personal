import { IsNumber } from "class-validator";

export class SaldoDto {
    @IsNumber()
    saldo: number;
  }