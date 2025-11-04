import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto{
    
    @IsPositive()
    @Min(1)
    @IsNumber()
    @IsOptional()
    limit?: number

}