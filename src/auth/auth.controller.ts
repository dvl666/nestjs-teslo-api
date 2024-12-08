import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }


  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[]
  ) {
    // console.log('Hola soy el usuario en el request del authController', request.user)
    // console.log('Hola soy el request', request)
    console.log(user)
    console.log(rawHeaders)
    return {
      ok: true,
      message: 'You have access to this route',
      user,
      userEmail
    }
  
  }

}
