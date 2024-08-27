import { IsNotEmpty, IsNumber } from "class-validator";

export class AddSaldoDto{
    @IsNumber()
    @IsNotEmpty()
    monto:number;
    descripcion:string;
    categoria:string;

}