import { IsUUID, IsOptional } from 'class-validator';

export class SubmitApplicationDto {
  @IsUUID()
  jobId!: string;

  @IsOptional()
  @IsUUID()
  resumeId?: string;
}
