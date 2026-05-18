import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ApplicationStatusEnum {
  PENDING = 'PENDING',
  INTERVIEW_REQUEST = 'INTERVIEW_REQUEST',
  OFFER_SENT = 'OFFER_SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export class UpdateStatusDto {
  @IsEnum(ApplicationStatusEnum)
  status!: ApplicationStatusEnum;

  @IsOptional()
  @IsString()
  note?: string;
}
