import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createApplication(
    studentId: string,
    jobId: string,
    resumeId?: string,
  ) {
    return this.prisma.application.create({
      data: {
        studentId,
        jobId,
        resumeId,
        status: ApplicationStatus.PENDING,
      },
    });
  }

  async findApplicationById(applicationId: string) {
    return this.prisma.application.findUnique({
      where: { applicationId },
      include: {
        student: true,
        jobPost: {
          include: {
            employer: true,
          },
        },
        resume: true,
        auditLogs: true,
      },
    });
  }

  async findApplicationByStudentAndJob(studentId: string, jobId: string) {
    return this.prisma.application.findUnique({
      where: {
        studentId_jobId: {
          studentId,
          jobId,
        },
      },
    });
  }

  async findApplicationsByStudent(studentId: string) {
    return this.prisma.application.findMany({
      where: { studentId },
      include: {
        jobPost: {
          include: {
            employer: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findApplicationsByJobPost(jobId: string) {
    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        resume: true,
        auditLogs: {
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
  ) {
    return this.prisma.application.update({
      where: { applicationId },
      data: { status: newStatus },
      include: {
        student: true,
        jobPost: true,
        auditLogs: true,
      },
    });
  }

  async findApplicationsByStudentAndStatuses(
    studentId: string,
    statuses: ApplicationStatus[],
  ) {
    return this.prisma.application.findMany({
      where: {
        studentId,
        status: {
          in: statuses,
        },
      },
    });
  }

  async createAuditLog(
    applicationId: string,
    changedBy: string,
    oldStatus: string | null,
    newStatus: string,
    note?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        applicationId,
        changedBy,
        oldStatus: oldStatus || null,
        newStatus,
        note: note || null,
      },
    });
  }

  async findJobPost(jobId: string) {
    return this.prisma.jobPost.findUnique({
      where: { jobId },
      include: {
        employer: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findResumeById(resumeId: string) {
    return this.prisma.resume.findUnique({
      where: { resumeId },
      select: {
        resumeId: true,
        studentId: true,
      },
    });
  }

  async findStudentByUserId(userId: string) {
    return this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
  }

  async findEmployerByUserId(userId: string) {
    return this.prisma.employer.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
  }

  async findStudent(studentId: string) {
    return this.prisma.student.findUnique({
      where: { studentId },
      include: {
        user: true,
      },
    });
  }

  async findUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { userId },
    });
  }

  // Transaction method for creating application + sending notification
  async createApplicationWithNotification(
    studentId: string,
    jobId: string,
    resumeId: string | undefined,
    callback: (application: any) => Promise<void>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          studentId,
          jobId,
          resumeId,
          status: ApplicationStatus.PENDING,
        },
      });

      await callback(application);
      return application;
    });
  }

  // Transaction method for updating status + creating audit log + auto-withdraw
  async updateStatusWithAuditAndWithdrawal(
    applicationId: string,
    newStatus: ApplicationStatus,
    changedBy: string,
    oldStatus: string,
    note: string | undefined,
    autoWithdrawalCallback?: (studentId: string) => Promise<void>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.application.update({
        where: { applicationId },
        data: { status: newStatus },
        include: {
          student: true,
          jobPost: true,
        },
      });

      await tx.auditLog.create({
        data: {
          applicationId,
          changedBy,
          oldStatus: oldStatus || null,
          newStatus: newStatus.toString(),
          note: note || null,
        },
      });

      if (newStatus === ApplicationStatus.ACCEPTED && autoWithdrawalCallback) {
        await autoWithdrawalCallback(application.studentId);
      }

      return application;
    });
  }

  // Auto-withdraw method within a transaction
  async autoWithdrawApplications(
    tx: any,
    studentId: string,
    excludeJobId: string,
  ) {
    return tx.application.updateMany({
      where: {
        studentId,
        jobId: {
          not: excludeJobId,
        },
        status: {
          in: [ApplicationStatus.PENDING, ApplicationStatus.INTERVIEW_REQUEST],
        },
      },
      data: {
        status: ApplicationStatus.WITHDRAWN,
      },
    });
  }
}
