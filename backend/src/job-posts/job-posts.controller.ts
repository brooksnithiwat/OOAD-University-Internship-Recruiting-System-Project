import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JobPostsService } from './job-posts.service';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { SearchJobPostDto } from './dto/search-job-post.dto';

@Controller('job-posts')
@UseGuards(JwtAuthGuard)
export class JobPostsController {
  constructor(private readonly jobPostsService: JobPostsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.EMPLOYER)
  @HttpCode(HttpStatus.CREATED)
  async createJobPost(
    @Body() createJobPostDto: CreateJobPostDto,
    @Request() req: any,
  ): Promise<{ jobId: string; title: string; status: string }> {
    const userId = req.user.userId;
    return this.jobPostsService.createJobPost(createJobPostDto, userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getJobPosts(
    @Query() searchJobPostDto: SearchJobPostDto,
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
    return this.jobPostsService.getJobPosts(searchJobPostDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getJobPostDetail(
    @Param('id') jobId: string,
  ): Promise<{
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
      industry: string;
      website: string | null;
    };
  }> {
    return this.jobPostsService.getJobPostDetail(jobId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.EMPLOYER)
  @HttpCode(HttpStatus.OK)
  async updateJobPost(
    @Param('id') jobId: string,
    @Body() updateJobPostDto: UpdateJobPostDto,
    @Request() req: any,
  ): Promise<{ jobId: string; title: string; status: string }> {
    const userId = req.user.userId;
    return this.jobPostsService.updateJobPost(jobId, updateJobPostDto, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.EMPLOYER)
  @HttpCode(HttpStatus.OK)
  async closeJobPost(
    @Param('id') jobId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user.userId;
    await this.jobPostsService.closeJobPost(jobId, userId);
    return { message: 'Job post closed successfully' };
  }
}
