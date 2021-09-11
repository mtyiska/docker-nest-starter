import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CookieAuthenticationGuard } from 'src/authentication/guards/cookieAuthentication.guard';
import RequestWithUser from 'src/authentication/types/requestWithUser.interface';
import { Order } from 'src/order/entities/order.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(CookieAuthenticationGuard)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('admin/users')
  getAll() {
    return this.usersService.findAll();
  }

  @Get('admin/ambassadors')
  ambassadors() {
    return this.usersService.find({
      is_ambassador: true,
    });
  }

  @Get('users/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id });
  }

  @Get('admin/rankings')
  async rankings() {
    const users: User[] = await this.usersService.find({
      relations: ['orders', 'orders.order_items'],
    });
    const ambassador = users.filter((a) => a.is_ambassador);

    // revenue: ambassador.reduce((s, o) => s + o.revenue, 0),
    return ambassador.map((a) => {
      return {
        name: a.name,
        // revenue: a.revenue,
      };
    });
  }
}
