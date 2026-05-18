import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { Role } from '../common/enums/role.enum';
import { AdminService } from './admin.service';
import { SearchEmployersDto } from './dto/search-employers.dto';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';

interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('employers')
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  async getEmployers(@Query() filters: SearchEmployersDto): Promise<{
    data: Array<{
      employerId: string;
      companyName: string;
      industry: string | null;
      website: string | null;
      contactName: string | null;
      contactPhone: string | null;
      isVerified: boolean;
      user: {
        userId: string;
        email: string;
        createdAt: Date;
      };
    }>;
    total: number;
  }> {
    return this.adminService.getEmployers(filters);
  }

  @Get('employers/unverified')
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  async getUnverifiedEmployers(): Promise<{
    data: Array<{
      employerId: string;
      companyName: string;
      industry: string | null;
      website: string | null;
      contactName: string | null;
      contactPhone: string | null;
      isVerified: boolean;
      user: {
        userId: string;
        email: string;
        createdAt: Date;
      };
    }>;
    total: number;
  }> {
    return this.adminService.getUnverifiedEmployers();
  }

  @Patch('employers/:id/verify')
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  async verifyEmployer(
    @Param('id', ParseUUIDPipe) employerId: string,
  ): Promise<{
    message: string;
    employerId: string;
    isVerified: boolean;
  }> {
    return this.adminService.verifyEmployer(employerId);
  }

  @Post('users')
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMINISTRATOR)
  @HttpCode(HttpStatus.CREATED)
  async createStaffUser(
    @Body() createStaffUserDto: CreateStaffUserDto,
  ): Promise<{ userId: string; email: string; role: string }> {
    return this.adminService.createStaffUser(createStaffUserDto);
  }

  @Get('users')
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  async getAllUsers(): Promise<
    Array<{
      userId: string;
      email: string;
      role: string;
      isActive: boolean;
      createdAt: Date;
    }>
  > {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  async deactivateUser(
    @Param('id', new ParseUUIDPipe()) userId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<{ message: string }> {
    return this.adminService.deactivateUser(userId, user.userId);
  }
}