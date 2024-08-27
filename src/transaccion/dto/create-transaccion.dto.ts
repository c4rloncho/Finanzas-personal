import { Type } from "class-transformer";
import { CategoriaDto } from "./categoria.dto";

export class CreateTransaccionDto {
    descripcion:string;
    monto:number;
    tipo:string;
    @Type(() => CategoriaDto)
    categoria: CategoriaDto;
    diaCobro?:number
    
}
