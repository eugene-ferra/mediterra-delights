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
import { CategoryService } from './category.service';
import { CategoryEntity } from './types/category-entity.type';
import { Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('product-categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  async getAllCategories(
    @Res({ passthrough: true }) res: Response,
  ): Promise<CategoryEntity[]> {
    const categories = await this.categoryService.findAll();
    return categories;
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('/')
  async createCategory(
    @Res({ passthrough: true }) res: Response,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    const category = await this.categoryService.createOne(createCategoryDto);
    return category;
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('/:id')
  async updateCategory(
    @Res({ passthrough: true }) res: Response,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('id') id: string,
  ): Promise<CategoryEntity | null> {
    const category = await this.categoryService.updateOne(
      id,
      updateCategoryDto,
    );
    return category;
  }
}
