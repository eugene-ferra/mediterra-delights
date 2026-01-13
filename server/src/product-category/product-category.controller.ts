import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { ProductCategoryEntity } from './types/product-category.type';
import { Response } from 'express';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Controller('product-categories')
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Get('/')
  async getAllCategories(
    @Res({ passthrough: true }) res: Response,
  ): Promise<ProductCategoryEntity[]> {
    const categories = await this.productCategoryService.findAll();
    return categories;
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('/')
  async createCategory(
    @Res({ passthrough: true }) res: Response,
    @Body() createCategoryDto: CreateProductCategoryDto,
  ): Promise<ProductCategoryEntity> {
    const category =
      await this.productCategoryService.create(createCategoryDto);
    return category;
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('/:id')
  async updateCategory(
    @Res({ passthrough: true }) res: Response,
    @Body() updateCategoryDto: UpdateProductCategoryDto,
    @Param('id') id: string,
  ): Promise<ProductCategoryEntity | null> {
    const category = await this.productCategoryService.update(
      id,
      updateCategoryDto,
    );
    return category;
  }
}
