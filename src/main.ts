import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as passport from 'passport';
import { createClient } from 'redis';
import * as createRedisStore from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:4300',
      'http://localhost:5000',
    ],
    credentials: true,
  });

  const configService = app.get(ConfigService);
  // By Default express-session library stores the session in the memory of our web server.
  // We handle this by using Redis and creating a store as seen below.

  const RedisStore = createRedisStore(session);
  const redisClient = createClient({
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
  });

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: configService.get('SESSION_SECRET'),
      cookie: {
        // needs to be true in prod for https. also set 'tust proxy'
        secure: false,
        httpOnly: true,
        maxAge: 360000,
      },
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const port = process.env.PORT || '3000';
  await app.listen(port, () => {
    console.log(
      `listening on http://localhost ${port} || 3000 in ${process.env.NODE_ENV}`,
    );
  });
}
bootstrap();
