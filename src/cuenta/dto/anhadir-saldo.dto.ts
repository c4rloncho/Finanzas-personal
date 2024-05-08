import { IsNotEmpty, IsNumber } from "class-validator";

export class AddSaldoDto{
    @IsNumber()
    @IsNotEmpty()
    saldo:number;
    
    descripcion:string;

}