import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
  @IsPositive()
  @Min(1)
  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsPositive()
  @Min(1)
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsOptional()
  search?: string;
}