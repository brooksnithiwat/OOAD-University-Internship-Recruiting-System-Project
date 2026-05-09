import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export type EmployerVerificationFilter = 'ALL' | 'APPROVED' | 'UNAPPROVED';

export class SearchEmployersDto {
  @IsOptional()
  @IsIn(['ALL', 'APPROVED', 'UNAPPROVED'])
  verificationStatus?: EmployerVerificationFilter;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;
}
