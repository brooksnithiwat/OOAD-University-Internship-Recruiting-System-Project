import { IsString, IsOptional, IsNumber, Min, Max, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { JobPostStatus } from '@prisma/client';

export class SearchJobPostDto {
  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Max(4)
  @Type(() => Number)
  minGpa?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(JobPostStatus)
  @IsOptional()
  status?: JobPostStatus;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  showAll?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
