import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  CacheKey,
  CacheTTL,
  Req,
  CACHE_MANAGER,
  Inject,
  CacheInterceptor,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CookieAuthenticationGuard } from 'src/authentication/guards/cookieAuthentication.guard';
import { Product } from './entities/product.entity';
import { Request } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventEmitter: EventEmitter2,
  ) {}

  @UseGuards(CookieAuthenticationGuard)
  @Post('admin/products')
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.save(createProductDto);
    this.eventEmitter.emit('product_updated');
    return product;
  }

  @UseGuards(CookieAuthenticationGuard)
  @Get('admin/products')
  async findAll() {
    return this.productService.findAll();
  }

  @Get('admin/products/:id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne({ id });
  }

  @UseGuards(CookieAuthenticationGuard)
  @Patch('admin/products/:id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    await this.productService.update(id, updateProductDto);
    this.eventEmitter.emit('product_updated');
    return this.productService.findOne(id);
  }

  @UseGuards(CookieAuthenticationGuard)
  @Delete('admin/products/:id')
  async remove(@Param('id') id: string) {
    const response = await this.productService.remove(id);
    this.eventEmitter.emit('product_updated');
    return response;
  }

  @CacheKey('products_frontend')
  //Cache the products for 30 min - 1800seconds
  @CacheTTL(1800)
  @UseInterceptors(CacheInterceptor)
  @Get('ambassador/frontend')
  async frontend() {
    return this.productService.findAll();
  }

  @Get('ambassador/backend')
  async backend(@Req() request: Request) {
    // try to get from the cache, if not available then query from db and then set cache
    let products = await this.cacheManager.get<Product[]>('products_backend');
    if (!products) {
      products = await this.productService.findAll();
      await this.cacheManager.set('products_backend', products, { ttl: 1800 });
    }

    // if search is in the query then filter cached products by search
    // term on title and description
    if (request.query.s) {
      const s = request.query.s.toString().toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().indexOf(s) >= 0 ||
          p.description.toLowerCase().indexOf(s) >= 0,
      );
    }

    // sort products. get the difference and check if diff is 0, 1, or -1
    if (request.query.sort === 'asc' || request.query.sort === 'desc') {
      products.sort((a, b) => {
        const diff = a.price - b.price;
        if (diff === 0) return 0;
        const sign = Math.abs(diff) / diff; //-1,1
        return request.query.sort === 'asc' ? sign : -sign;
      });
    }

    // paginate results
    const page: number = parseInt(request.query.page as any) || 1;
    const perPage = 9;
    const total = products.length;

    // slice pages to always return 9. [0 -9], [10 -19] etc
    const data = products.slice((page - 1) * perPage, page * perPage);

    return {
      data,
      total,
      page,
      last_page: Math.ceil(total / perPage),
    };
  }
}
