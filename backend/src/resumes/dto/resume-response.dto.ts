export class ResumeResponseDto {
  resumeId!: string;
  fileName!: string;
  fileRef!: string;
  fileSizeBytes!: number;
  virusScanStatus?: 'PENDING' | 'CLEAN' | 'INFECTED';
  uploadedAt!: Date;
}