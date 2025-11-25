// create-login.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateLoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}


