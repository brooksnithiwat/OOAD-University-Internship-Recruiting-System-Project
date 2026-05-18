import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController, JobPostsApplicationsController } from './applications.controller';
import { ApplicationsRepository } from './applications.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [ApplicationsService, ApplicationsRepository],
  controllers: [ApplicationsController, JobPostsApplicationsController],
  exports: [ApplicationsService, ApplicationsRepository],
})
export class ApplicationsModule {}
