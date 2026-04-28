import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ArrayMinSize,
  Min,
  Max,
  IsDateString,
  MinLength,
  MaxLength,
  IsDecimal,
} from 'class-validator';

export class CreateJobPostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(4)
  minGpa: number;

  @IsNumber()
  @Min(10)
  @Max(52)
  durationWeeks: number;

  @IsDateString()
  @IsNotEmpty()
  applicationDeadline: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  skills: string[];
}
