import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemService } from './order-item.service';
import { ProductModule } from 'src/product/product.module';
import { LinkModule } from 'src/link/link.module';
import { StripeModule } from 'nestjs-stripe';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { OrderListener } from './listeners/order.listener';

@Module({
  imports: [
    ProductModule,
    TypeOrmModule.forFeature([Order, OrderItem]),
    LinkModule,
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('STRIPE_KEY'),
        apiVersion: '2020-08-27',
      }),
    }),
    MailerModule.forRoot({
      transport: {
        host: 'docker.for.mac.localhost',
        port: 1025,
      },
      defaults: {
        from: 'no-reply@example.com',
      },
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderItemService, OrderListener],
})
export class OrderModule {}
