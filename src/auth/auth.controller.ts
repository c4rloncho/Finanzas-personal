import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
      @Body() loginUserDto: LoginUserDto, 
      @Res({ passthrough: true }) res: Response
    ) {
      const result = await this.authService.validateUser(loginUserDto);
      
      // Configurar la cookie
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // true en producción
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000, // 1 día
      });
  
      // No devolver el token en la respuesta
      return { success: true };
    }

    @Get('check')
    @UseGuards(AuthGuard('jwt'))
    checkAuth() {
      return { isAuthenticated: true };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
      return req.user;
    }   

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto) {
      return await this.authService.create(registerUserDto);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Res({ passthrough: true }) res: Response) {
      res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      return { success: true };
    }
}