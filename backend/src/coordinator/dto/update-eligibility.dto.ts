import { IsString, IsEnum, IsOptional } from 'class-validator';
import { EligibilityStatus } from '../../common/enums/eligibility-status.enum';

export class UpdateEligibilityDto {
  @IsEnum(EligibilityStatus)
  status!: EligibilityStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
