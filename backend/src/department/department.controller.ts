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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { Role } from '../common/enums/role.enum';
import { DepartmentService, StudentResponse, ApprovalResponse, ApproveStudentDto } from './department.service';

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

  @Patch('students/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveStudent(
    @Param('id', new ParseUUIDPipe()) studentId: string,
    @Body() approveDto: ApproveStudentDto,
    @CurrentUser() user: UserPayload,
  ): Promise<ApprovalResponse> {
    return this.departmentService.approveStudent(studentId, user.userId, approveDto);
  }
}
