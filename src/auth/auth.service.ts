import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { hash,compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Cuenta } from 'src/cuenta/entities/cuenta.entity';


@Injectable()
export class AuthService { 
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Cuenta)
        private readonly cuentaRepository: Repository<Cuenta>,
        private jwtService: JwtService,
    ) {}
    async validateUser(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
        const user = await this.userRepository.findOne({ where: { email: loginUserDto.email }});
        if (user) {
            if(await compare(loginUserDto.password, user.password)) { //contraseña correcta si es true
                const payload = {id:user.id,name:user.name}
               return {
                access_token: await this.jwtService.signAsync(payload),
            };
            }
        }
        throw new NotFoundException('Usuario no encontrado');
    }
    async create({name,email,password }: RegisterUserDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email }});
        if (!name || !email || !password) {
            throw new BadRequestException('Todos los campos son obligatorios');
        }
        if (!user) {
          const hashedPassword = await hash(password, 10);
          const newUser = this.userRepository.create({name,email, password:hashedPassword});
          const cuenta = new Cuenta();
          cuenta.saldo = 0;
          newUser.cuenta = cuenta;
          await this.cuentaRepository.save(cuenta);
          return await this.userRepository.save(newUser);
        }
        else{
            throw new ConflictException('El correo electrónico ya está en uso');
        }
    }
}