import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { jwtConstants } from './constants';
import { JwtModule } from '@nestjs/jwt';
import { Cuenta } from 'src/cuenta/entities/cuenta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Cuenta],), JwtModule.register({
    global: true,
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '1d' },
  })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

