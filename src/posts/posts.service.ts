import { Injectable } from '@nestjs/common';
import CreatePostDto from './dto/createPost.dto';
import Post from './post.entity';
import UpdatePostDto from './dto/updatePost.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, MoreThan, Repository } from 'typeorm';
import PostNotFoundException from './exceptions/postNotFound.exception';

@Injectable()
export default class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async getPosts(
    offset?: number,
    limit?: number,
    startId?: number,
    options?: FindManyOptions<Post>,
  ) {
    const where: FindManyOptions<Post>['where'] = {};
    let separateCount = 0;
    if (startId) {
      where.id = MoreThan(startId);
      separateCount = await this.postsRepository.count();
    }

    const [items, count] = await this.postsRepository.findAndCount({
      where,
      order: {
        id: 'ASC',
      },
      skip: offset,
      take: limit,
      ...options,
    });

    return {
      items,
      count: startId ? separateCount : count,
    };
  }

  async getPostsWithAuthors(offset?: number, limit?: number, startId?: number) {
    return this.getPosts(offset, limit, startId);
  }

  getAllPosts() {
    return this.postsRepository.find();
  }

  async getPostById(id: string) {
    const post = await this.postsRepository.findOne(id);
    if (post) {
      return post;
    }
    throw new PostNotFoundException(id);
  }

  async createPost(post: CreatePostDto) {
    const newPost = await this.postsRepository.create({
      ...post,
    });
    await this.postsRepository.save(newPost);
    return newPost;
  }

  async updatePost(id: string, post: UpdatePostDto) {
    await this.postsRepository.update(id, post);
    const updatedPost = await this.postsRepository.findOne(id);
    if (updatedPost) {
      return updatedPost;
    }
    throw new PostNotFoundException(id);
  }

  async deletePost(id: string) {
    const deleteResponse = await this.postsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new PostNotFoundException(id);
    }
  }
}
