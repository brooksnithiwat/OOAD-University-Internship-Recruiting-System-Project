import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Middleware to normalize email to lowercase and department to lowercase
    this.$use(async (params, next) => {
      // Email normalization for User model
      if (params.model === 'User') {
        if (params.action === 'create' || params.action === 'update' || params.action === 'upsert') {
          if (params.args.data?.email) {
            params.args.data.email = params.args.data.email.toLowerCase();
          }
          if (params.action === 'upsert' && params.args.create?.email) {
            params.args.create.email = params.args.create.email.toLowerCase();
          }
          if (params.action === 'upsert' && params.args.update?.email) {
            params.args.update.email = params.args.update.email.toLowerCase();
          }
        }
      }

      // Department normalization for Student model
      if (params.model === 'Student') {
        if (params.action === 'create' || params.action === 'update' || params.action === 'upsert') {
          if (params.args.data?.department && typeof params.args.data.department === 'string') {
            params.args.data.department = params.args.data.department.toLowerCase();
          }
          if (params.action === 'upsert' && params.args.create?.department) {
            params.args.create.department = params.args.create.department.toLowerCase();
          }
          if (params.action === 'upsert' && params.args.update?.department) {
            params.args.update.department = params.args.update.department.toLowerCase();
          }
        }
      }

      // Department normalization for DepartmentHead model
      if (params.model === 'DepartmentHead') {
        if (params.action === 'create' || params.action === 'update' || params.action === 'upsert') {
          if (params.args.data?.department && typeof params.args.data.department === 'string') {
            params.args.data.department = params.args.data.department.toLowerCase();
          }
          if (params.action === 'upsert' && params.args.create?.department) {
            params.args.create.department = params.args.create.department.toLowerCase();
          }
          if (params.action === 'upsert' && params.args.update?.department) {
            params.args.update.department = params.args.update.department.toLowerCase();
          }
        }
      }

      return next(params);
    });

    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    (this.$on as any)('beforeExit', async () => {
      await app.close();
    });
  }
}
