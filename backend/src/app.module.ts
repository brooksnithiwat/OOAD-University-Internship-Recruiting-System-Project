import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { EmployersModule } from './employers/employers.module';
import { JobPostsModule } from './job-posts/job-posts.module';
import { AdminModule } from './admin/admin.module';
import { ResumesModule } from './resumes/resumes.module';
import { ApplicationsModule } from './applications/applications.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    EmployersModule,
    JobPostsModule,
    AdminModule,
    ResumesModule,
    ApplicationsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
