import { Controller, Get, Query, Res } from '@nestjs/common';
import { CategoryService } from '../category.service';
import { CategoryEntity } from '../../data/entities/category-entity.type';
import { Response } from 'express';
import { FindCategoriesDto } from '../dto/find-category.dto';

@Controller('categories')
export class PublicCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  async getAllCategories(
    @Query() query: FindCategoriesDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CategoryEntity[]> {
    const categories = await this.categoryService.findAll(query);
    return categories;
  }
}
