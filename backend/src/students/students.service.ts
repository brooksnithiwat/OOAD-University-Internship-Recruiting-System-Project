import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StudentsRepository, StudentData } from './students.repository';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findByUserId(userId: string): Promise<StudentData | null> {
    return this.studentsRepository.findByUserId(userId);
  }

  async findById(studentId: string): Promise<StudentData | null> {
    return this.studentsRepository.findById(studentId);
  }

  async createStudent(
    userId: string,
    createStudentDto: CreateStudentDto,
  ): Promise<StudentData> {
    const existingStudent = await this.studentsRepository.findByStudentCode(
      createStudentDto.studentCode,
    );

    if (existingStudent) {
      throw new ConflictException('Student code already exists');
    }

    return this.studentsRepository.create(
      userId,
      createStudentDto.studentCode,
      createStudentDto.firstName,
      createStudentDto.lastName,
      createStudentDto.gpa,
      createStudentDto.faculty,
      createStudentDto.department,
      createStudentDto.academicYear,
    );
  }
}
