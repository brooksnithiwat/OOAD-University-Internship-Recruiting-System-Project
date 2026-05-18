export class ApplicationResponseDto {
  applicationId!: string;
  jobId?: string;
  studentId?: string;
  status!: string;
  submittedAt!: Date;
  updatedAt?: Date;

  // For GET /applications/my response
  jobPost?: {
    jobId: string;
    title: string;
    companyName: string;
    applicationDeadline: Date;
  };

  // For GET /job-posts/:id/applications response
  student?: {
    studentId: string;
    firstName: string;
    lastName: string;
    gpa: number;
    faculty: string;
  };

  resume?: {
    resumeId: string;
    fileName: string;
    fileRef: string;
  };

  // For PATCH /applications/:id/status response
  oldStatus?: string;
  newStatus?: string;
}

export class SubmitApplicationResponseDto {
  applicationId!: string;
  jobId!: string;
  status!: string;
  submittedAt!: Date;
}

export class WithdrawApplicationResponseDto {
  message!: string;
}

export class UpdateStatusResponseDto {
  applicationId!: string;
  oldStatus!: string;
  newStatus!: string;
  updatedAt!: Date;
}
