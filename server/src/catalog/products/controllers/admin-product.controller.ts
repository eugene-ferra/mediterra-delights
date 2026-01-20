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

import { ProductsService } from '../products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

import { AuthGuard } from 'src/common/guards/auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { ProductEntity } from '../../data/entities/product-entity.type';
import { FindManyProductsQueryDto } from '../dto/find-many-products.dto';

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/')
  async findMany(
    @Res({ passthrough: true }) res: Response,
    @Query() query: FindManyProductsQueryDto,
  ): Promise<ProductEntity[]> {
    const docs = await this.productsService.findMany(query, {
      includeInactiveCategories: true,
      includeInactiveProducts: true,
    });

    return docs;
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

  @Post('/')
  async create(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateProductDto,
  ): Promise<ProductEntity> {
    return this.productsService.create(dto);
  }

  @Patch('/:id')
  async updateById(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<{ updated: true } | null> {
    return await this.productsService.updateById(id, dto);
  }

  @Delete('/:id')
  async deleteById(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ): Promise<{ deleted: true }> {
    return this.productsService.deleteById(id);
  }
}
