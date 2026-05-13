import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface ResumeUploadFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB

  transform(file: ResumeUploadFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    if (file.size > this.MAX_SIZE) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    return file;
  }
}
