import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UseGuards, Req } from '@nestjs/common';
import { ApiKeyGuard } from 'src/guards/api-key/api-key.guard';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @UseGuards(ApiKeyGuard, JwtGuard)
  @Get('perfil')
  getPerfil(@Req() req) {
    return req.user;
  }


  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
