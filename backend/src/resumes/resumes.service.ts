import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ResumesRepository } from './resumes.repository';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { ResumeUploadFile } from '../common/pipes/file-validation.pipe';

@Injectable()
export class ResumesService {
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads');
  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(
    private readonly repo: ResumesRepository,
    private readonly prisma: PrismaService,
  ) {}

  private validateResumeFile(file: ResumeUploadFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    if (file.size > this.MAX_SIZE) {
      throw new BadRequestException('File size must not exceed 5MB');
    }
  }

  private async resolveUserIdToStudentId(userId: string): Promise<string> {
    const prisma = this.prisma as any;
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student.studentId;
  }

  async uploadResume(userId: string | undefined, file: ResumeUploadFile) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    this.validateResumeFile(file);

    // Resolve userId to studentId
    const studentId = await this.resolveUserIdToStudentId(userId);

    // ensure upload dir
    fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });

    const id = randomUUID();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${id}-${safeOriginal}`;
    const filePath = path.join(this.UPLOAD_DIR, filename);

    if (!file.buffer) {
      // If the file was not provided in memory, attempt to move from path
      if ((file as any).path) {
        const source = (file as any).path;
        fs.copyFileSync(source, filePath);
      } else {
        throw new BadRequestException('Uploaded file is not available');
      }
    } else {
      fs.writeFileSync(filePath, file.buffer);
    }

    const fileRef = `uploads/${filename}`;

    let created;
    try {
      created = await this.repo.createResume({
        studentId,
        fileName: file.originalname,
        fileRef,
        fileSizeBytes: file.size,
        mimeType: file.mimetype,
        virusScanStatus: 'PENDING',
      });
    } catch (err: any) {
      if (err && err.message === 'Student not found') {
        throw new NotFoundException('Student not found');
      }
      throw err;
    }

    // Ensure virusScanStatus defaults to PENDING via Prisma schema
    return {
      resumeId: created.resumeId,
      fileName: created.fileName,
      fileRef: created.fileRef,
      fileSizeBytes: created.fileSizeBytes,
      uploadedAt: created.uploadedAt,
    };
  }

  async getMyResumes(userId: string | undefined) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    const studentId = await this.resolveUserIdToStudentId(userId);
    return this.repo.findByStudentId(studentId);
  }

  async getResumeById(userId: string | undefined, resumeId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    const studentId = await this.resolveUserIdToStudentId(userId);
    
    const resume = await this.repo.findById(resumeId);

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.studentId !== studentId) {
      throw new ForbiddenException('You do not have access to this resume');
    }

    return resume;
  }
}
