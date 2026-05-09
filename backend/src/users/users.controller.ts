import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UsersService } from './users.service';
import { UserListItemData } from './users.repository';
import { SearchUsersDto } from './dto/search-users.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SYSTEM_ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filters: SearchUsersDto): Promise<UserListItemData[]> {
    return this.usersService.findAll(filters);
  }
}
