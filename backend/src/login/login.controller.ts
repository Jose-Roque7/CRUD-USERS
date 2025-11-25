import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { LoginService } from './login.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { LoginLoginDto } from './dto/login-login.dto';
import { ApiKeyGuard } from 'src/guards/api-key/api-key.guard';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @UseGuards(ApiKeyGuard, JwtGuard)
  @Post('register')
  async register(@Body() createLoginDto: CreateLoginDto) {
    return this.loginService.create(createLoginDto);
  }
@UseGuards(ApiKeyGuard)
  @Post('auth')
  async auth(@Body() loginLoginDto: LoginLoginDto) {
    return this.loginService.validateLogin(loginLoginDto);
  }
}
