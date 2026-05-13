import { Module } from '@nestjs/common';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { ResumesRepository } from './resumes.repository';
import { PrismaService } from '../prisma/prisma.service';
import { LocalStorageService } from '../common/services/local-storage.service';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';
import { StorageFactory } from '../common/services/storage.factory';

@Module({
  controllers: [ResumesController],
  providers: [
    ResumesService,
    ResumesRepository,
    PrismaService,
    LocalStorageService,
    SupabaseStorageService,
    StorageFactory,
  ],
  exports: [ResumesService],
})
export class ResumesModule {}

