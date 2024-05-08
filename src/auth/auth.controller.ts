import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards,Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Post('login')  
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginUserDto: LoginUserDto) {
      return await this.authService.ValidateUser(loginUserDto);
    }
    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
      return req.user;
  }   
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('register')
    async create(@Body() registerUserDto: RegisterUserDto) {

      return await this.authService.create(registerUserDto);
   }
}
