import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ResumesRepository } from './resumes.repository';
import { PrismaService } from '../prisma/prisma.service';
import { StorageFactory } from '../common/services/storage.factory';
import { StorageService } from '../common/services/storage.interface';
import { ResumeUploadFile } from '../common/pipes/file-validation.pipe';

@Injectable()
export class ResumesService {
  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB
  private storage: StorageService;

  constructor(
    private readonly repo: ResumesRepository,
    private readonly prisma: PrismaService,
    private readonly storageFactory: StorageFactory,
  ) {
    // Get the appropriate storage service based on configuration
    this.storage = this.storageFactory.getStorageService();
  }

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

    // Ensure buffer exists (required for upload)
    if (!file.buffer) {
      throw new BadRequestException('Uploaded file buffer is not available');
    }

    // Resolve userId to studentId
    const studentId = await this.resolveUserIdToStudentId(userId);

    // Upload to storage (local or Supabase, determined by factory)
    const { fileKey, fileUrl } = await this.storage.uploadFile({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    let created;
    try {
      created = await this.repo.createResume({
        studentId,
        fileName: file.originalname,
        fileRef: fileKey, // Store only the fileKey in DB
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

    // Return response with full fileUrl for frontend to download
    return {
      resumeId: created.resumeId,
      fileName: created.fileName,
      fileRef: this.storage.getFileUrl(created.fileRef), // Convert fileKey to URL for response
      fileSizeBytes: created.fileSizeBytes,
      uploadedAt: created.uploadedAt,
    };
  }

  async getMyResumes(userId: string | undefined) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    const studentId = await this.resolveUserIdToStudentId(userId);
    const resumes = await this.repo.findByStudentId(studentId);
    
    // Transform fileRef (stored as fileKey) to fileUrl for frontend
    return resumes.map((resume: any) => ({
      ...resume,
      fileRef: this.storage.getFileUrl(resume.fileRef),
    }));
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

    // fileRef in DB is already the full URL/path
    return resume;
  }

  async deleteResume(userId: string | undefined, resumeId: string) {
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

    // Delete from storage using fileRef (which is the fileKey for both modes)
    await this.storage.deleteFile(resume.fileRef);

    // Delete from database
    await this.repo.deleteById(resumeId);

    return {
      message: 'Resume deleted successfully',
    };
  }
}
