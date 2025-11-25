import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { JwtStrategy } from '../auth/jwt.strategy';
import { Login, LoginSchema } from './schemas/login.schema';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { JwtService } from 'src/auth/jwt.services';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Login.name, schema: LoginSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, JwtStrategy, JwtGuard, JwtService],
  exports: [LoginService],
})
export class LoginModule {}
