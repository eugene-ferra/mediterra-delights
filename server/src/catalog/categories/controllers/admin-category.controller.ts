import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from '../category.service';
import { CategoryEntity } from '../../data/entities/category-entity.type';
import { Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  async getAllCategories(
    @Res({ passthrough: true }) res: Response,
  ): Promise<CategoryEntity[]> {
    const categories = await this.categoryService.findAll({
      includeInactive: true,
    });
    return categories;
  }

  @Post('/')
  async createCategory(
    @Res({ passthrough: true }) res: Response,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    const category = await this.categoryService.createOne(createCategoryDto);
    return category;
  }

  @Patch('/:id')
  async updateCategory(
    @Res({ passthrough: true }) res: Response,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('id') id: string,
  ): Promise<{ updated: true }> {
    const category = await this.categoryService.updateOne(
      id,
      updateCategoryDto,
    );
    return category;
  }

  @Delete('/:id/delete')
  async deleteCategory(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ): Promise<{ deleted: true }> {
    const result = await this.categoryService.deleteById(id);
    return result;
  }
}
