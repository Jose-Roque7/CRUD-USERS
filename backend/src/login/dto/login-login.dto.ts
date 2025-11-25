// login-login.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginLoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}