import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResumesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createResume(data: {
    studentId: string;
    fileName: string;
    fileRef: string;
    fileSizeBytes: number;
    mimeType?: string;
    virusScanStatus?: 'PENDING' | 'CLEAN' | 'INFECTED';
  }) {
    const prisma = this.prisma as any;

    // Resolve student: allow caller to pass either studentId or userId
    let targetStudentId = data.studentId;
    let student = await prisma.student.findUnique({ where: { studentId: targetStudentId } });

    if (!student) {
      // try by userId
      student = await prisma.student.findUnique({ where: { userId: targetStudentId } });
      if (student) {
        targetStudentId = student.studentId;
      }
    }

    if (!student) {
      throw new Error('Student not found');
    }

    const created = await prisma.resume.create({
      data: {
        studentId: targetStudentId,
        fileName: data.fileName,
        fileRef: data.fileRef,
        fileSizeBytes: data.fileSizeBytes,
        mimeType: data.mimeType ?? 'application/pdf',
        virusScanStatus: data.virusScanStatus ?? 'PENDING',
      },
    });

    return {
      resumeId: created.resumeId,
      studentId: created.studentId,
      fileName: created.fileName,
      fileRef: created.fileRef,
      fileSizeBytes: created.fileSizeBytes,
      mimeType: created.mimeType,
      virusScanStatus: created.virusScanStatus,
      uploadedAt: created.uploadedAt,
    };
  }

  async findByStudentId(studentId: string) {
    const prisma = this.prisma as any;
    const resumes = await prisma.resume.findMany({
      where: { studentId },
      orderBy: { uploadedAt: 'desc' },
    });

    return resumes.map((r: any) => ({
      resumeId: r.resumeId,
      studentId: r.studentId,
      fileName: r.fileName,
      fileRef: r.fileRef,
      fileSizeBytes: r.fileSizeBytes,
      mimeType: r.mimeType,
      virusScanStatus: r.virusScanStatus,
      uploadedAt: r.uploadedAt,
    }));
  }

  async findById(resumeId: string) {
    const prisma = this.prisma as any;
    const resume = await prisma.resume.findUnique({
      where: { resumeId },
    });

    if (!resume) {
      return null;
    }

    return {
      resumeId: resume.resumeId,
      studentId: resume.studentId,
      fileName: resume.fileName,
      fileRef: resume.fileRef,
      fileSizeBytes: resume.fileSizeBytes,
      mimeType: resume.mimeType,
      virusScanStatus: resume.virusScanStatus,
      uploadedAt: resume.uploadedAt,
    };
  }
}
