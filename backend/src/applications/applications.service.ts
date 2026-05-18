import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationsRepository } from './applications.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { UpdateStatusDto, ApplicationStatusEnum } from './dto/update-status.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  private readonly VALID_TRANSITIONS: Record<string, ApplicationStatus[]> = {
    [ApplicationStatus.PENDING]: [ApplicationStatus.INTERVIEW_REQUEST, ApplicationStatus.REJECTED],
    [ApplicationStatus.INTERVIEW_REQUEST]: [ApplicationStatus.OFFER_SENT, ApplicationStatus.REJECTED],
    [ApplicationStatus.OFFER_SENT]: [ApplicationStatus.ACCEPTED],
    [ApplicationStatus.ACCEPTED]: [],
    [ApplicationStatus.REJECTED]: [],
    [ApplicationStatus.WITHDRAWN]: [],
  };

  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async submitApplication(
    userId: string,
    submitApplicationDto: SubmitApplicationDto,
  ) {
    const { jobId, resumeId } = submitApplicationDto;

    // Get student by userId to check eligibility status
    const student = await this.applicationsRepository.findStudentByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Rule 1: Check eligibility status
    if (student.eligibilityStatus !== 'ELIGIBLE') {
      throw new ForbiddenException('Student is not eligible to apply');
    }

    // Get job post to check deadline
    const jobPost = await this.applicationsRepository.findJobPost(jobId);
    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    // Rule 3: Check application deadline
    const now = new Date();
    const deadline = new Date(jobPost.applicationDeadline);
    if (now > deadline) {
      throw new BadRequestException('Application deadline has passed');
    }

    // Check for duplicate application
    const existingApplication =
      await this.applicationsRepository.findApplicationByStudentAndJob(student.studentId, jobId);
    if (existingApplication) {
      throw new ConflictException('Student has already applied to this job');
    }

    // Create application and send notification in transaction
    const application = await this.applicationsRepository.createApplicationWithNotification(
      student.studentId,
      jobId,
      resumeId,
      async (app) => {
        await this.notificationsService.sendNewApplicationEmail(
          jobPost.employer.user.email,
          jobPost.title,
          `${student.firstName} ${student.lastName}`,
        );
      },
    );

    return {
      applicationId: application.applicationId,
      jobId: application.jobId,
      status: application.status,
      submittedAt: application.submittedAt,
    };
  }

  async getMyApplications(userId: string) {
    const student = await this.applicationsRepository.findStudentByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const applications = await this.applicationsRepository.findApplicationsByStudent(student.studentId);

    return applications.map((app) => ({
      applicationId: app.applicationId,
      status: app.status,
      submittedAt: app.submittedAt,
      jobPost: {
        jobId: app.jobPost.jobId,
        title: app.jobPost.title,
        companyName: app.jobPost.employer.companyName,
        applicationDeadline: app.jobPost.applicationDeadline,
      },
    }));
  }

  async withdrawApplication(applicationId: string, userId: string) {
    const application = await this.applicationsRepository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Get student to verify ownership
    const student = await this.applicationsRepository.findStudentByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check ownership
    if (application.studentId !== student.studentId) {
      throw new ForbiddenException('Cannot withdraw another student\'s application');
    }

    // Rule 4: Cannot withdraw if status is OFFER_SENT or ACCEPTED
    if (
      application.status === ApplicationStatus.OFFER_SENT ||
      application.status === ApplicationStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        `Cannot withdraw application with status: ${application.status}`,
      );
    }

    // Cannot withdraw if already rejected or withdrawn
    if (
      application.status === ApplicationStatus.REJECTED ||
      application.status === ApplicationStatus.WITHDRAWN
    ) {
      throw new BadRequestException(
        `Cannot withdraw application with status: ${application.status}`,
      );
    }

    await this.applicationsRepository.updateApplicationStatus(
      applicationId,
      ApplicationStatus.WITHDRAWN,
    );

    return {
      message: 'Application withdrawn successfully',
    };
  }

  async getEmployerByUserId(userId: string) {
    return this.applicationsRepository.findEmployerByUserId(userId);
  }

  async getApplicationsByJobPost(jobId: string, employerId: string) {
    // Get job post to verify ownership
    const jobPost = await this.applicationsRepository.findJobPost(jobId);
    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    // Check if employer owns this job post
    if (jobPost.employerId !== employerId) {
      throw new ForbiddenException(
        'Employer can only view applicants for their own job posts',
      );
    }

    const applications = await this.applicationsRepository.findApplicationsByJobPost(jobId);

    return applications.map((app) => ({
      applicationId: app.applicationId,
      status: app.status,
      submittedAt: app.submittedAt,
      student: {
        studentId: app.student.studentId,
        firstName: app.student.firstName,
        lastName: app.student.lastName,
        email: app.student.user ? app.student.user.email : undefined,
        gpa: app.student.gpa && (app.student.gpa.toNumber ? app.student.gpa.toNumber() : parseFloat(app.student.gpa.toString())),
        faculty: app.student.faculty,
      },
      resume: app.resume
        ? {
            resumeId: app.resume.resumeId,
            fileName: app.resume.fileName,
            fileRef: app.resume.fileRef,
          }
        : null,
    }));
  }

  async updateApplicationStatus(
    applicationId: string,
    employerId: string,
    userId: string,
    updateStatusDto: UpdateStatusDto,
  ) {
    const { status: newStatusStr, note } = updateStatusDto;
    const newStatus = ApplicationStatus[newStatusStr as keyof typeof ApplicationStatus];

    const application = await this.applicationsRepository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check if employer owns this job post
    if (application.jobPost.employerId !== employerId) {
      throw new ForbiddenException(
        'Employer can only update applications for their own job posts',
      );
    }

    // Rule 5: Validate status transition
    const oldStatus = application.status;
    if (oldStatus === ApplicationStatus.REJECTED || oldStatus === ApplicationStatus.ACCEPTED) {
      throw new BadRequestException(
        `Cannot transition from ${oldStatus} status`,
      );
    }

    const validTransitions = this.VALID_TRANSITIONS[oldStatus];
    if (!validTransitions || !validTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${oldStatus} to ${newStatus}`,
      );
    }

    // Get current user for audit log using the userId (not employerId)
    const currentUser = await this.applicationsRepository.findUser(userId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // Update status with audit log and potential auto-withdrawal
    const updatedApplication = await this.applicationsRepository.updateStatusWithAuditAndWithdrawal(
      applicationId,
      newStatus,
      userId,
      oldStatus,
      note,
      newStatus === ApplicationStatus.ACCEPTED
        ? async (studentId: string) => {
            // Auto-withdraw other applications of the student
            await this.autoWithdrawOtherApplications(studentId, application.jobId, employerId);
          }
        : undefined,
    );

    // Send email notification to student
    const student = await this.applicationsRepository.findStudent(application.studentId);
    if (student && student.user) {
      await this.notificationsService.sendStatusUpdateEmail(
        student.user.email,
        application.jobPost.title,
        newStatus,
      );
    }

    return {
      applicationId: updatedApplication.applicationId,
      oldStatus: oldStatus,
      newStatus: newStatus,
      updatedAt: updatedApplication.updatedAt,
    };
  }

  private async autoWithdrawOtherApplications(
    studentId: string,
    acceptedJobId: string,
    userId: string,
  ): Promise<void> {
    // Rule 11: Auto-withdraw all PENDING and INTERVIEW_REQUEST applications for this student
    const otherApplications =
      await this.applicationsRepository.findApplicationsByStudentAndStatuses(studentId, [
        ApplicationStatus.PENDING,
        ApplicationStatus.INTERVIEW_REQUEST,
      ]);

    for (const otherApp of otherApplications) {
      if (otherApp.jobId !== acceptedJobId) {
        await this.applicationsRepository.updateApplicationStatus(
          otherApp.applicationId,
          ApplicationStatus.WITHDRAWN,
        );

        // Create audit log for auto-withdrawal
        await this.applicationsRepository.createAuditLog(
          otherApp.applicationId,
          userId,
          otherApp.status,
          ApplicationStatus.WITHDRAWN,
          'Auto-withdrawn due to acceptance of another position',
        );
      }
    }
  }
}
