import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoriaDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsString()
    color:string;
  }