import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoordinatorController } from './coordinator.controller';
import { CoordinatorService } from './coordinator.service';
import { CoordinatorRepository } from './coordinator.repository';

@Module({
  controllers: [CoordinatorController],
  providers: [CoordinatorService, CoordinatorRepository, PrismaService],
  exports: [CoordinatorService],
})
export class CoordinatorModule {}
