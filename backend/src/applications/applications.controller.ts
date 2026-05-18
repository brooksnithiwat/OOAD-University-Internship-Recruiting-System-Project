import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApplicationsService } from './applications.service';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(Role.STUDENT)
  async submitApplication(@Body() submitApplicationDto: SubmitApplicationDto, @Request() req: ExpressRequest) {
    const userId = (req.user as any).userId;
    return this.applicationsService.submitApplication(userId, submitApplicationDto);
  }

  @Get('my')
  @Roles(Role.STUDENT)
  async getMyApplications(@Request() req: ExpressRequest) {
    const userId = (req.user as any).userId;
    return this.applicationsService.getMyApplications(userId);
  }

  @Delete(':id/withdraw')
  @HttpCode(200)
  @Roles(Role.STUDENT)
  async withdrawApplication(@Param('id') applicationId: string, @Request() req: ExpressRequest) {
    const userId = (req.user as any).userId;
    return this.applicationsService.withdrawApplication(applicationId, userId);
  }

  @Patch(':id/status')
  @Roles(Role.EMPLOYER)
  async updateApplicationStatus(
    @Param('id') applicationId: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req: ExpressRequest,
  ) {
    const userId = (req.user as any).userId;
    const employer = await this.applicationsService.getEmployerByUserId(userId);
    if (!employer) {
      throw new NotFoundException('Employer not found');
    }
    return this.applicationsService.updateApplicationStatus(
      applicationId,
      employer.employerId,
      userId,
      updateStatusDto,
    );
  }
}

@Controller('job-posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobPostsApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get(':id/applications')
  @Roles(Role.EMPLOYER)
  async getApplicationsByJobPost(@Param('id') jobId: string, @Request() req: ExpressRequest) {
    // Get employer by userId to get the correct employerId
    const employer = await this.applicationsService.getEmployerByUserId((req.user as any).userId);
    if (!employer) {
      throw new NotFoundException('Employer not found');
    }
    return this.applicationsService.getApplicationsByJobPost(jobId, employer.employerId);
  }
}
