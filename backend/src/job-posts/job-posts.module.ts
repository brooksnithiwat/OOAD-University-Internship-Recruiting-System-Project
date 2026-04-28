import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JobPostsService } from './job-posts.service';
import { JobPostsRepository } from './job-posts.repository';
import { JobPostsController } from './job-posts.controller';

@Module({
  imports: [PrismaModule],
  controllers: [JobPostsController],
  providers: [JobPostsService, JobPostsRepository],
  exports: [JobPostsService],
})
export class JobPostsModule {}
