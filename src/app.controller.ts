import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private configService: ConfigService,
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    // return this.appService.getHello();
    this.configService.get('SESSION_SECRET');
    const port = process.env.PORT || '3000';
    const dburl = process.env.DATABASE_URL;
    return `Hello world!! on ${port} with ${dburl}!!`;
  }
}
