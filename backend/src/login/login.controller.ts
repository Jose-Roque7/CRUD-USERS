import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
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
async auth(
  @Res({ passthrough: true }) res,
  @Body() loginLoginDto: LoginLoginDto,
) {
  const result = await this.loginService.validateLogin(loginLoginDto);

  if (result.success && result.data?.access_token) {
    res.cookie('access_token', result.data.access_token, {
      httpOnly: true,
      secure: false, // false en DEV si no usas HTTPS
      sameSite: 'strict',
      path: '/',
      maxAge: 1000 * 60 * 59, // 59 minutos
    });
  }

  // Siempre devolvemos 200
  return result;
}


  // En tu backend, verifica si hay alguna redirección
@UseGuards(ApiKeyGuard, JwtGuard)
@Post('logout')
logout(@Res({ passthrough: true }) res) {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/',
  });
  
  // Asegúrate de que no hay redirecciones aquí
  return { message: 'Logged out' };
}
}
