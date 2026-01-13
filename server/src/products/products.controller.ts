import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ProductsService } from './products.service';
import { ProductEntity } from './types/product-entity.type';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindManyProductsQuery } from './types/product-query.type';
import { FindManyProductsResult } from './types/find-many-products-result.type';

import { AuthGuard } from 'src/common/guards/auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/')
  async findMany(
    @Res({ passthrough: true }) res: Response,
    @Query() query: FindManyProductsQuery,
  ): Promise<FindManyProductsResult> {
    return this.productsService.findMany(query);
  }

  @Get('/:id')
  async findById(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ): Promise<ProductEntity> {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('/')
  async create(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateProductDto,
  ): Promise<ProductEntity> {
    return this.productsService.create(dto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('/:id')
  async updateById(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.productsService.updateById(id, dto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('/:id')
  async deleteById(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ): Promise<{ deleted: true }> {
    return this.productsService.deleteById(id);
  }
}
