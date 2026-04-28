import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ArrayMinSize,
  Min,
  Max,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateJobPostDto {
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(20)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Max(4)
  minGpa?: number;

  @IsNumber()
  @IsOptional()
  @Min(10)
  @Max(52)
  durationWeeks?: number;

  @IsDateString()
  @IsOptional()
  applicationDeadline?: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @IsString({ each: true })
  skills?: string[];
}
