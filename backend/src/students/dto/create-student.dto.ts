import {
  IsEmail,
  IsString,
  MinLength,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateStudentDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  studentCode!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(4)
  gpa!: number;

  @IsOptional()
  @IsString()
  faculty?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsInt()
  @Min(1)
  @Max(6)
  academicYear!: number;
}
