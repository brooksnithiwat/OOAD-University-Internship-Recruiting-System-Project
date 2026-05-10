import { Module } from '@nestjs/common';
import { EmployersService } from './employers.service';
import { EmployersRepository } from './employers.repository';

@Module({
  providers: [EmployersService, EmployersRepository],
  exports: [EmployersService],

})
export class EmployersModule {}

 
