import { Type } from "class-transformer";
import { IsDate, IsNumber, IsObject, IsString, ValidateNested } from "class-validator";
import { CategoriaDto } from "./categoria.dto";

export class TransaccionDto {
  @IsNumber()
  monto: number;

  @IsDate()
  fecha: Date;

  @IsString()
  descripcion: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CategoriaDto)
  categoria: CategoriaDto;
}