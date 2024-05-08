import { PartialType } from '@nestjs/mapped-types';
import { LoginUserDto } from './login-user.dto';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
    name: string;
    @IsEmail()
    email: string;
    @IsNotEmpty()
    @MinLength(7)
    password: string;
    rut:string;
}
