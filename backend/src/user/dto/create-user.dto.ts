import { IsInt, IsNotEmpty, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreateUserDto {

    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    name: string;

    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    lastname: string;

    @IsInt()
    @IsPositive()
    @Min(1)
    @IsNotEmpty()
    codigo: number;

}
