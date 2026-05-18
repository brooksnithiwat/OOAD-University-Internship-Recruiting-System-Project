import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobPostsRepository } from './job-posts.repository';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { SearchJobPostDto } from './dto/search-job-post.dto';

@Injectable()
export class JobPostsService {
  constructor(
    private readonly repository: JobPostsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createJobPost(
    data: CreateJobPostDto,
    userId: string,
  ): Promise<{ jobId: string; title: string; status: string }> {
    const employerId = await this.validateEmployerIsVerified(userId);
    await this.validateApplicationDeadlineNotPast(data.applicationDeadline);

    return this.repository.create(data, employerId);
  }

  async getJobPosts(filters: SearchJobPostDto): Promise<{
    data: Array<{
      jobId: string;
      title: string;
      location: string | null;
      minGpa: number;
      durationWeeks: number;
      applicationDeadline: string;
      companyName: string;
      skills: string[];
      status: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    return this.repository.findAll(filters);
  }
async getJobPostDetail(jobId: string) {
  const jobPost = await this.repository.findById(jobId);

  if (!jobPost) {
    throw new NotFoundException('Job post not found');
  }

  return {
    jobId: jobPost.jobId,
    title: jobPost.title,
    description: jobPost.description,
    location: jobPost.location,
    minGpa: jobPost.minGpa,
    durationWeeks: jobPost.durationWeeks,
    applicationDeadline: jobPost.applicationDeadline,
    status: jobPost.status,
    skills: jobPost.skills,

employer: {
  companyName: jobPost.employer.companyName,
  industry: jobPost.employer.industry ?? 'Unknown',
  website: jobPost.employer.website,
},
  };
}

  async updateJobPost(
    jobId: string,
    data: UpdateJobPostDto,
    userId: string,
  ): Promise<{ jobId: string; title: string; status: string }> {
    const employerId = await this.getEmployerIdByUserId(userId);
    await this.validateOwnership(jobId, employerId);
    await this.validateJobPostNotClosed(jobId);

    if (data.applicationDeadline) {
      await this.validateApplicationDeadlineNotPast(data.applicationDeadline);
    }

    return this.repository.update(jobId, data);
  }

  async closeJobPost(jobId: string, userId: string): Promise<void> {
    const employerId = await this.getEmployerIdByUserId(userId);
    await this.validateOwnership(jobId, employerId);
    await this.validateJobPostNotClosed(jobId);

    await this.repository.close(jobId);
  }

  async getEmployerJobPosts(
    userId: string,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      location?: string;
      minGpa?: number;
    } = {},
  ): Promise<{
    data: Array<{
      jobId: string;
      title: string;
      location: string | null;
      minGpa: number;
      durationWeeks: number;
      applicationDeadline: string;
      companyName: string;
      skills: string[];
      status: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const employerId = await this.getEmployerIdByUserId(userId);
    return this.repository.findByEmployerId(employerId, filters);
  }

  private async validateEmployerIsVerified(userId: string): Promise<string> {
    const employer = await this.prisma.employer.findUnique({
      where: { userId },
      select: { employerId: true, isVerified: true },
    });

    if (!employer) {
      throw new NotFoundException('Employer not found');
    }

    if (!employer.isVerified) {
      throw new ForbiddenException(
        'Employer must be verified to create job posts',
      );
    }

    return employer.employerId;
  }

  private async getEmployerIdByUserId(userId: string): Promise<string> {
    const employer = await this.prisma.employer.findUnique({
      where: { userId },
      select: { employerId: true },
    });

    if (!employer) {
      throw new NotFoundException('Employer not found');
    }

    return employer.employerId;
  }

  private async validateOwnership(
    jobId: string,
    employerId: string,
  ): Promise<void> {
    const jobPost = await this.repository.findByIdAndEmployerId(
      jobId,
      employerId,
    );

    if (!jobPost) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }
  }

  private async validateJobPostNotClosed(jobId: string): Promise<void> {
    const jobPost = await this.prisma.jobPost.findUnique({
      where: { jobId },
      select: { status: true },
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    if (jobPost.status === 'CLOSED') {
      throw new ForbiddenException('Cannot edit a closed job post');
    }
  }

  private async validateApplicationDeadlineNotPast(
    deadline: string,
  ): Promise<void> {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      throw new ForbiddenException(
        'Application deadline cannot be a past date',
      );
    }
  }
}
