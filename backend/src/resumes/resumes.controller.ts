import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
  Req,
  HttpCode,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumesService } from './resumes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { FileValidationPipe, ResumeUploadFile } from '../common/pipes/file-validation.pipe';

@Controller('resumes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResumesController {
  constructor(private readonly service: ResumesService) {}

  @Post('upload')
  @Roles(Role.STUDENT)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(201)
  async uploadResume(@Req() req: any, @UploadedFile(new FileValidationPipe()) file: ResumeUploadFile) {
    const user = req.user || {};
    // JWT's 'sub' field contains userId
    const userId = (user.sub || user.userId || user.studentId) as string;
    return this.service.uploadResume(userId, file);
  }

  @Get()
  @Roles(Role.STUDENT)
  async getMyResumes(@Req() req: any) {
    const user = req.user || {};
    const userId = (user.sub || user.userId || user.studentId) as string;
    return this.service.getMyResumes(userId);
  }

  @Delete(':id')
  @Roles(Role.STUDENT)
  @HttpCode(200)
  async deleteResume(@Req() req: any, @Param('id') id: string) {
    const user = req.user || {};
    const userId = (user.sub || user.userId || user.studentId) as string;
    return this.service.deleteResume(userId, id);
  }
}
