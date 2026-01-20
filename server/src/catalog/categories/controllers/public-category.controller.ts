import { Controller, Get, Res } from '@nestjs/common';
import { CategoryService } from '../category.service';
import { CategoryEntity } from '../../data/entities/category-entity.type';
import { Response } from 'express';

@Controller('categories')
export class PublicCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  async getAllCategories(
    @Res({ passthrough: true }) res: Response,
  ): Promise<CategoryEntity[]> {
    const categories = await this.categoryService.findAll({ isActive: true });
    return categories;
  }
}
