import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderItemService } from './order-item.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CookieAuthenticationGuard } from 'src/authentication/guards/cookieAuthentication.guard';
import { createOrderItemDto } from './dto/create-order-item.dto';
import { LinkService } from '../link/link.service';
import { Link } from '../link/entities/link.entity';
import { Order } from './entities/order.entity';
import { ProductService } from '../product/product.service';
import { Product } from 'src/product/entities/product.entity';
import { OrderItem } from './entities/order-item.entity';
import { Connection } from 'typeorm';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('ambassador')
export class OrderController {
  constructor(
    private orderService: OrderService,
    private orderItemService: OrderItemService,
    private linkService: LinkService,
    private productService: ProductService,
    private connection: Connection,
    @InjectStripe() private readonly stripeClient: Stripe,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  @UseGuards(CookieAuthenticationGuard)
  @Post('checkout-order')
  async createOrder(@Body() body: CreateOrderDto) {
    const link: Link = await this.linkService.findOne({
      code: body.code,
      relations: ['user'],
    });
    if (!link) {
      throw new BadRequestException('Invalid link');
    }
    const queryRunner = this.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const o = new Order();
      o.user_id = link.user.id;
      o.ambassador_email = link.user.email;
      o.first_name = body.first_name;
      o.last_name = body.last_name;
      o.email = body.email;
      o.address = body.address;
      o.country = body.country;
      o.city = body.city;
      o.zip = body.zip;
      o.code = body.code;

      const order = await queryRunner.manager.save(o);

      const line_items = [];

      for (const p of body.products) {
        const product: Product = await this.productService.findOne({
          id: p.product_id,
        });
        const orderItem = new OrderItem();
        orderItem.order = order;
        orderItem.product_title = product.title;
        orderItem.price = product.price;
        orderItem.quantity = p.quantity;
        orderItem.ambassador_revenue = 0.1 * product.price * p.quantity;
        orderItem.admin_revenue = 0.9 * product.price * p.quantity;
        await queryRunner.manager.save(orderItem);

        line_items.push({
          name: product.title,
          description: product.description,
          images: [product.image],
          // amount in cents
          amount: 100 * product.price,
          currency: 'usd',
          quantity: p.quantity,
        });
      }

      const source = await this.stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        success_url: `${this.configService.get(
          'CHECKOUT_URL',
        )}/success?source={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get('CHECKOUT_URL')}/error`,
      });

      order.transaction_id = source['id'];
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return source;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }

  @UseGuards(CookieAuthenticationGuard)
  @Post('checkout-confirm')
  async confirm(@Body('source') source: string) {
    const order = await this.orderService.findOne({
      where: { transaction_id: source },
      relations: ['user', 'order_items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderService.update(order.id, { complete: true });

    await this.eventEmitter.emit('order.completed', order);

    return {
      message: 'success',
    };
  }

  @UseGuards(CookieAuthenticationGuard)
  @Post('order-item')
  async createOrderItem(@Body() createOrderItem: createOrderItemDto) {
    return this.orderItemService.save(createOrderItem);
  }

  @UseGuards(CookieAuthenticationGuard)
  @Get('order')
  findAll() {
    return this.orderService.find({
      relations: ['order_items'],
    });
  }

  @UseGuards(CookieAuthenticationGuard)
  @Get('order-item')
  findAllOrdersItems() {
    return this.orderItemService.findAll();
  }

  @UseGuards(CookieAuthenticationGuard)
  @Get('order/:id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @UseGuards(CookieAuthenticationGuard)
  @Patch('order/:id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @UseGuards(CookieAuthenticationGuard)
  @Delete('order/:id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
