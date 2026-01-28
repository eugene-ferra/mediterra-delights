import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ProductsService } from '../products.service';
import { ProductEntity } from '../../data/entities/product-entity.type';
import { UserFindProductsDto } from '../dto/user-find-products.dto';

@Controller('products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/')
  async findMany(
    @Res({ passthrough: true }) res: Response,
    @Query() query: UserFindProductsDto,
  ): Promise<ProductEntity[]> {
    const docs = await this.productsService.findMany(query);

    return docs.docs;
  }

  @Get('/:id')
  async findById(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ): Promise<ProductEntity> {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
