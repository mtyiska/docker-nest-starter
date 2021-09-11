import { Module } from '@nestjs/common';
import { PostsResolver } from './posts.resolver';

@Module({
  imports: [],
  controllers: [],
  providers: [PostsResolver],
})
export class PostsModule {}
