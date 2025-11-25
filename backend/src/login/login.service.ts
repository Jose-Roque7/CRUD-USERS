import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Login, LoginDocument } from './schemas/login.schema';
import { CreateLoginDto } from './dto/create-login.dto';
import { LoginLoginDto } from './dto/login-login.dto';
import { JwtService } from '../auth/jwt.services';

@Injectable()
export class LoginService {
  constructor(
    @InjectModel(Login.name) private loginModel: Model<LoginDocument>,
    private jwtService: JwtService,
  ) {}

  async create(createLoginDto: CreateLoginDto) {
    const existing = await this.loginModel.findOne({ email: createLoginDto.email });
    if (existing) throw new BadRequestException('Usuario ya existe');

    const login = new this.loginModel(createLoginDto);
    await login.save();
    return { email: login.email };
  }

  async validateLogin(loginLoginDto: LoginLoginDto) {
    const login = await this.loginModel.findOne({ email: loginLoginDto.email });
    if (!login) throw new BadRequestException('Usuario no encontrado');

    const isMatch = await login.comparePassword(loginLoginDto.password);
    if (!isMatch) throw new BadRequestException('Contraseña incorrecta');

    const payload = { sub: login._id, email: login.email };
    const token = this.jwtService.sign(payload);  // Aquí se firma el JWT

    return { email: login.email, access_token: token };
  }
}
