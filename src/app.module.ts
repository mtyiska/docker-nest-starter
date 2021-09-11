import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database/database.module';
// import { CategoriesModule } from './categories/categories.module';
// import { GraphQLModule } from '@nestjs/graphql';
// import { join } from 'path';
// import { PostsModule } from './posts/posts.module';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { TaskModule } from './task/task.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { LinkModule } from './link/link.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    // GraphQLModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     playground: Boolean(configService.get('GRAPHQL_PLAYGROUND')),
    //     autoSchemaFile: join(process.cwd(), 'src/graphql-schema.gql'),
    //     installSubscriptionHandlers: true,
    //   }),
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        APP_PORT: Joi.number().required(),
        ADMINER_PORT: Joi.number().required(),
        API_PORT: Joi.number().required(),
        SESSION_SECRET: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
    DatabaseModule,
    UsersModule,
    AuthenticationModule,
    TaskModule,
    ProductModule,
    OrderModule,
    LinkModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
