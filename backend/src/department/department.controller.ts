import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Response,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { Role } from '../common/enums/role.enum';
import { DepartmentService, StudentResponse, InternshipReportResponse } from './department.service';

interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

@Controller('department')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DEPARTMENT_HEAD)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('students')
  @HttpCode(HttpStatus.OK)
  async getStudents(
    @CurrentUser() user: UserPayload,
  ): Promise<StudentResponse[]> {
    return this.departmentService.getDepartmentStudents(user.userId);
  }

  @Get('reports/internships')
  @HttpCode(HttpStatus.OK)
  async getInternshipReport(
    @CurrentUser() user: UserPayload,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    const internships = await this.departmentService.getInternshipReport(user.userId);

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
      'startDate',
      'endDate',
      'acceptedAt',
    ].join(',');

    const csvRows = internships.map((internship) => {
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
        escapeField(internship.studentCode),
        escapeField(internship.firstName),
        escapeField(internship.lastName),
        escapeField(internship.faculty),
        escapeField(internship.department),
        escapeField(internship.gpa),
        escapeField(internship.companyName),
        escapeField(internship.jobTitle),
        escapeField(internship.startDate),
        escapeField(internship.endDate),
        escapeField(internship.acceptedAt),
      ].join(',');
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="internships.csv"',
    );
    res.send(csvContent);
  }
}
