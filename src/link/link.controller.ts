import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { CookieAuthenticationGuard } from 'src/authentication/guards/cookieAuthentication.guard';
import { Product } from 'src/product/entities/product.entity';
import RequestWithUser from 'src/authentication/types/requestWithUser.interface';
import { Link } from './entities/link.entity';
import { Order } from 'src/order/entities/order.entity';

@Controller('ambassador')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  // @UseGuards(CookieAuthenticationGuard)
  // @Get('links')
  // findAll() {
  //   return this.linkService.findAll();
  // }

  @UseGuards(CookieAuthenticationGuard)
  @Post('links')
  async create(
    @Req() request: RequestWithUser,
    @Body('products') products: string[],
  ) {
    return this.linkService.save({
      code: Math.random().toString(36).substr(6),
      user: request.user,
      products: products.map((id) => ({ id })),
      // products,
    });
  }

  @Get('links')
  @UseGuards(CookieAuthenticationGuard)
  async stats(@Req() request: RequestWithUser) {
    const links: Link[] = await this.linkService.find({
      user: request.user,
      relations: ['orders'],
    });

    // map over links from above and return code, count and revenue
    return links.map((link) => {
      // filter orders to only return completed orders
      const completedOrders: Order[] = link.orders.filter((o) => o.complete);

      return {
        code: link.code,
        count: completedOrders.length,
        // map reduce over ambassador revenue for each item
        // ambassador revenue is generated per each item in order entity
        // revenue: completedOrders.reduce((s, o) => s + o.ambassador_revenue, 0),
      };
    });
  }

  @Get('check-links/:code')
  async link(@Param('code') code: string) {
    return this.linkService.findOne({
      code,
      relations: ['user', 'products'],
    });
  }
}
