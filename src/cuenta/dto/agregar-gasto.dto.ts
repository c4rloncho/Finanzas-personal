import { IsNotEmpty } from "class-validator";

export class agregarGastoDto{
    @IsNotEmpty()
    gasto: number;
    descripcion: string;
}