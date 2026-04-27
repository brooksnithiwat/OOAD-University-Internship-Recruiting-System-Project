import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsRepository } from './students.repository';

@Module({
  providers: [StudentsService, StudentsRepository],
  exports: [StudentsService],
})
export class StudentsModule {}
