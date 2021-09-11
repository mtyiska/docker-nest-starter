import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  Patch,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthenticationService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';
import { CookieAuthenticationGuard } from './guards/cookieAuthentication.guard';
import { LogInWithCredentialsGuard } from './guards/logInWithCredentials.guard';
import RequestWithUser from './types/requestWithUser.interface';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Controller(['admin', 'ambassador'])
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Post(['register'])
  async register(
    @Body() registrationData: RegisterDto,
    @Req() request: Request,
  ) {
    const is_ambassador =
      request.path === '/api/ambassador/register' ? true : false;
    return this.authenticationService.register({
      ...registrationData,
      is_ambassador,
    });
  }

  @HttpCode(200)
  @UseGuards(LogInWithCredentialsGuard)
  @Post(['log-in'])
  async logIn(@Req() request: RequestWithUser) {
    return request.user;
  }

  @HttpCode(200)
  @UseGuards(CookieAuthenticationGuard)
  @Get(['profile'])
  async authenticate(@Req() request: RequestWithUser) {
    if (request.path === '/api/admin/profile') {
      return request.user;
    }
    const { id } = request.user;
    const user = await this.usersService.findOne({
      id,
      relations: ['orders', 'orders.order_items'],
    });
    const { orders, password, ...data } = user;
    return {
      ...data,
      revenue: user.revenue,
    };
  }

  @HttpCode(200)
  @UseGuards(CookieAuthenticationGuard)
  @Post(['log-out'])
  async logOut(@Req() request: RequestWithUser) {
    request.logOut();
    request.session.cookie.maxAge = 0;
  }

  @HttpCode(200)
  @UseGuards(CookieAuthenticationGuard)
  @Patch(['update/:id'])
  async updateInfo(@Param('id') id: string, @Body() body: string) {
    await this.usersService.update(id, body);
    return 'success';
  }

  @HttpCode(200)
  @UseGuards(CookieAuthenticationGuard)
  @Patch(['updatepassword'])
  async updatePassword(
    @Req() request: RequestWithUser,
    @Body() body: UpdateUserDto,
  ) {
    const { password, password_confirm } = body;
    if (password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!');
    }

    const { id } = request.user;

    await this.usersService.update(id, {
      password: await bcrypt.hash(password, 12),
    });
    return this.usersService.getById(id);
  }
}
