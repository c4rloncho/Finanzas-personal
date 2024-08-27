import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Cuenta } from 'src/cuenta/entities/cuenta.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import * as dotenv from 'dotenv'; 
dotenv.config()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Cuenta]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CONSTANT,
      signOptions: { expiresIn: '3h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy],
  exports:[JwtModule]
})
export class AuthModule {}
