import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoryEntity } from '../data/entities/category-entity.type';
import slugify from 'slugify';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from '../data/repositories/category.repository';
import { ProductsRepository } from '../data/repositories/product.repository';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepo: CategoriesRepository,
    private readonly productRepo: ProductsRepository,
  ) {}

  async findAll(filter?: { isActive?: boolean }): Promise<CategoryEntity[]> {
    const categories = await this.categoryRepo.findAll(filter?.isActive);
    return categories;
  }

  async findOne(id: string): Promise<CategoryEntity | null> {
    if (this.categoryRepo.isValidCategoryId(id) === false) {
      return await this.categoryRepo.findBySlug(id);
    }

    return await this.categoryRepo.findById(id);
  }

  async createOne(payload: CreateCategoryDto): Promise<CategoryEntity> {
    const slug = slugify(payload.title, { lower: true, locale: 'en' });

    if (await this.categoryRepo.findBySlug(slug)) {
      throw new BadRequestException('Category with this slug already exists.');
    }

    const createdDoc = await this.categoryRepo.create({ ...payload, slug });
    return createdDoc;
  }

  async updateOne(
    id: string,
    payload: UpdateCategoryDto,
  ): Promise<{ updated: true }> {
    if (this.categoryRepo.isValidCategoryId(id) === false) {
      throw new BadRequestException('Invalid category ID');
    }

    const slug = payload.title
      ? slugify(payload.title, { lower: true, locale: 'en' })
      : undefined;

    const res = await this.categoryRepo.updateById(id, {
      ...payload,
      slug,
    });

    if (!res) throw new BadRequestException('Category not found');

    return res;
  }

  async deleteById(id: string): Promise<{ deleted: true }> {
    if (this.categoryRepo.isValidCategoryId(id) === false) {
      throw new BadRequestException('Invalid category ID');
    }

    if (await this.productRepo.countByCategoryId(id)) {
      throw new BadRequestException(
        'Cannot delete category with associated products',
      );
    }

    const res = await this.categoryRepo.deleteById(id);

    if (!res) throw new BadRequestException('Category not found');

    return res;
  }
}
