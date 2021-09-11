import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { Post } from './models/post.model';

@Resolver(() => Post)
export class PostsResolver {
  @Query(() => String)
  async posts() {
    return 'Hello World!';
  }

  @Mutation(() => String)
  async createPost() {
    return 'Hello World!';
  }
}
