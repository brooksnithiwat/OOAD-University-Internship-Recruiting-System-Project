import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Response,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { Role } from '../common/enums/role.enum';
import { CoordinatorService, StudentResponse, UpdateEligibilityResponse, PlacementReportResponse } from './coordinator.service';
import { UpdateEligibilityDto } from './dto/update-eligibility.dto';

interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

@Controller('coordinator')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.UNIVERSITY_COORDINATOR)
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get('students')
  @HttpCode(HttpStatus.OK)
  async getStudents(): Promise<StudentResponse[]> {
    return this.coordinatorService.getStudents();
  }

  @Patch('students/:id/eligibility')
  @HttpCode(HttpStatus.OK)
  async updateStudentEligibility(
    @Param('id', new ParseUUIDPipe()) studentId: string,
    @Body() updateEligibilityDto: UpdateEligibilityDto,
    @CurrentUser() user: UserPayload,
  ): Promise<UpdateEligibilityResponse> {
    return this.coordinatorService.updateEligibility(
      studentId,
      user.userId,
      updateEligibilityDto,
    );
  }

  @Get('reports/placements')
  @HttpCode(HttpStatus.OK)
  async getPlacementReport(
    @Response() res: ExpressResponse,
  ): Promise<void> {
    const placements = await this.coordinatorService.getPlacementReport();

    // Generate CSV content
    const csvHeader = [
      'studentCode',
      'firstName',
      'lastName',
      'faculty',
      'department',
      'gpa',
      'companyName',
      'jobTitle',
      'acceptedAt',
    ].join(',');

    const csvRows = placements.map((placement) => {
      const escapeField = (field: any) => {
        if (field === null || field === undefined) {
          return '';
        }
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      return [
        escapeField(placement.studentCode),
        escapeField(placement.firstName),
        escapeField(placement.lastName),
        escapeField(placement.faculty),
        escapeField(placement.department),
        escapeField(placement.gpa),
        escapeField(placement.companyName),
        escapeField(placement.jobTitle),
        escapeField(placement.acceptedAt),
      ].join(',');
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="placements.csv"',
    );
    res.send(csvContent);
  }
}
