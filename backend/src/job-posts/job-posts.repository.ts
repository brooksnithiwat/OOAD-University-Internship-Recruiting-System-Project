import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { SearchJobPostDto } from './dto/search-job-post.dto';

@Injectable()
export class JobPostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateJobPostDto,
    employerId: string,
  ): Promise<{ jobId: string; title: string; status: string }> {
    const { skills, ...jobData } = data;

    const result = await this.prisma.$transaction(async (tx) => {
      const jobPost = await tx.jobPost.create({
        data: {
          ...jobData,
          employerId,
          minGpa: parseFloat(String(jobData.minGpa)),
          applicationDeadline: new Date(jobData.applicationDeadline),
        },
      });

      await tx.jobPostSkill.createMany({
        data: skills.map((skill) => ({
          jobId: jobPost.jobId,
          skill,
        })),
      });

      return jobPost;
    });

    return {
      jobId: result.jobId,
      title: result.title,
      status: result.status,
    };
  }

  async findById(jobId: string): Promise<{
    jobId: string;
    title: string;
    description: string;
    location: string | null;
    minGpa: number;
    durationWeeks: number;
    applicationDeadline: string;
    status: string;
    skills: string[];
    employer: {
      companyName: string;
      industry: string | null;
      website: string | null;
    };
  } | null> {
    const jobPost = await this.prisma.jobPost.findUnique({
      where: { jobId },
      include: {
        skills: true,
        employer: {
          select: {
            companyName: true,
            industry: true,
            website: true,
          },
        },
      },
    });

    if (!jobPost) {
      return null;
    }

    return {
      jobId: jobPost.jobId,
      title: jobPost.title,
      description: jobPost.description,
      location: jobPost.location,
      minGpa: jobPost.minGpa.toNumber(),
      durationWeeks: jobPost.durationWeeks,
      applicationDeadline: jobPost.applicationDeadline.toISOString().split('T')[0],
      status: jobPost.status,
      skills: jobPost.skills.map((s) => s.skill),
      employer: jobPost.employer,
    };
  }

  async findAll(filters: SearchJobPostDto): Promise<{
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
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const whereClause: any = {
      applicationDeadline: {
        gte: today,
      },
    };

    if (!filters.showAll) {
      whereClause.status = filters.status ?? 'ACTIVE';
    }

    if (filters.location) {
      whereClause.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    if (filters.minGpa !== undefined) {
      whereClause.minGpa = {
        lte: filters.minGpa,
      };
    }

    if (filters.search) {
      whereClause.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [jobPosts, total] = await Promise.all([
      this.prisma.jobPost.findMany({
        where: whereClause,
        include: {
          employer: {
            select: {
              companyName: true,
            },
          },
          skills: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.jobPost.count({
        where: whereClause,
      }),
    ]);

    return {
      data: jobPosts.map((job) => ({
        jobId: job.jobId,
        title: job.title,
        location: job.location,
        minGpa: job.minGpa.toNumber(),
        durationWeeks: job.durationWeeks,
        applicationDeadline: job.applicationDeadline.toISOString().split('T')[0],
        companyName: job.employer.companyName,
        skills: job.skills.map((s) => s.skill),
        status: job.status,
      })),
      total,
      page,
      limit,
    };
  }

  async update(
    jobId: string,
    data: UpdateJobPostDto,
  ): Promise<{ jobId: string; title: string; status: string }> {
    const { skills, ...jobData } = data;

    const result = await this.prisma.$transaction(async (tx) => {
      const updatePayload: any = {};

      if (jobData.title !== undefined) updatePayload.title = jobData.title;
      if (jobData.description !== undefined)
        updatePayload.description = jobData.description;
      if (jobData.location !== undefined) updatePayload.location = jobData.location;
      if (jobData.minGpa !== undefined)
        updatePayload.minGpa = parseFloat(String(jobData.minGpa));
      if (jobData.durationWeeks !== undefined)
        updatePayload.durationWeeks = jobData.durationWeeks;
      if (jobData.applicationDeadline !== undefined)
        updatePayload.applicationDeadline = new Date(jobData.applicationDeadline);

      const jobPost = await tx.jobPost.update({
        where: { jobId },
        data: updatePayload,
      });

      if (skills && skills.length > 0) {
        await tx.jobPostSkill.deleteMany({
          where: { jobId },
        });

        await tx.jobPostSkill.createMany({
          data: skills.map((skill) => ({
            jobId,
            skill,
          })),
        });
      }

      return jobPost;
    });

    return {
      jobId: result.jobId,
      title: result.title,
      status: result.status,
    };
  }

  async close(jobId: string): Promise<void> {
    await this.prisma.jobPost.update({
      where: { jobId },
      data: {
        status: 'CLOSED',
      },
    });
  }

  async findByIdAndEmployerId(
    jobId: string,
    employerId: string,
  ): Promise<{ status: string } | null> {
    return this.prisma.jobPost.findFirst({
      where: {
        jobId,
        employerId,
      },
      select: {
        status: true,
      },
    });
  }

  async findByEmployerId(
    employerId: string,
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
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      employerId,
    };

    if (filters.location) {
      whereClause.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    if (filters.minGpa !== undefined) {
      whereClause.minGpa = {
        lte: filters.minGpa,
      };
    }

    if (filters.search) {
      whereClause.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [jobPosts, total] = await Promise.all([
      this.prisma.jobPost.findMany({
        where: whereClause,
        include: {
          employer: {
            select: {
              companyName: true,
            },
          },
          skills: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.jobPost.count({
        where: whereClause,
      }),
    ]);

    return {
      data: jobPosts.map((job) => ({
        jobId: job.jobId,
        title: job.title,
        location: job.location,
        minGpa: job.minGpa.toNumber(),
        durationWeeks: job.durationWeeks,
        applicationDeadline: job.applicationDeadline.toISOString().split('T')[0],
        companyName: job.employer.companyName,
        skills: job.skills.map((s) => s.skill),
        status: job.status,
      })),
      total,
      page,
      limit,
    };
  }
}
